// l1-batch — batch provisioning of single-validator L1s ("ledgers") for the K1 drill.
//
// This is the phase-0 form of the tool described in docs/PLAN-K1-1000-LEDGERS-DEPLOY-2026-09-05.md
// §4. It deliberately does NOT go through the console: the console's create path restarts every
// node per chain (server.mjs), which is the wall K1 exists to get past. Here the P-Chain work for
// all ledgers happens first (CreateSubnetTx → CreateChainTx → ConvertSubnetToL1Tx), and the nodes
// are (re)started ONCE afterwards with their full --track-subnets list.
//
// Subcommands
//
//	plan    generate owner/pump keys, ledger genesis files (≤ 10 KB each) and the ledger→node
//	        assignment; writes plan.json. Offline — needs no node.
//	apply   issue the three P-Chain transactions per ledger; appends one line per ledger to
//	        chains.jsonl as soon as its conversion is accepted, so a killed run resumes.
//	render  write chain-config-dir/<blockchainID>/config.json (small caches, warp API on),
//	        subnet-config-dir/<subnetID>.json (solo-validator snow parameters), per-node
//	        AVAGO_TRACK_SUBNETS lists and a docker-compose override.
//	status  read platform.getL1Validator / platform.getValidatorFeeState / eth_chainId for every
//	        ledger and print a table; exit 1 on any mismatch.
//	pump    send r tx/s to every ledger from its pump key with a LOCAL nonce (the `latest`
//	        nonce trap from a1-bay-lech-nonce is exactly what this avoids).
//
// The manager address passed to ConvertSubnetToL1Tx is a PLACEHOLDER. The initial validator set
// is written directly in the transaction; a Validator Manager contract is only consulted when the
// set CHANGES (RegisterL1ValidatorTx carries a Warp message from that address). K1 does not change
// validator sets, so it needs no manager — and the report must say that K1 measured no add/remove.
package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/hex"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/ava-labs/avalanchego/ids"
	"github.com/ava-labs/avalanchego/utils/cb58"
	"github.com/ava-labs/avalanchego/utils/constants"
	"github.com/ava-labs/avalanchego/utils/crypto/secp256k1"
	"github.com/ava-labs/avalanchego/vms/components/avax"
	"github.com/ava-labs/avalanchego/vms/platformvm/signer"
	"github.com/ava-labs/avalanchego/vms/platformvm/txs"
	"github.com/ava-labs/avalanchego/vms/platformvm/warp/message"
	"github.com/ava-labs/avalanchego/vms/secp256k1fx"
	"github.com/ava-labs/avalanchego/wallet/subnet/primary"
	"github.com/ava-labs/libevm/common"
	"github.com/ava-labs/libevm/core/types"
	"github.com/ava-labs/libevm/crypto"
)

// ── data shapes ──────────────────────────────────────────────────────────────────────────────

type NodeRef struct {
	Name    string `json:"name"`    // node1, node2, …
	URI     string `json:"uri"`     // http://127.0.0.1:9750
	Service string `json:"service"` // compose service name, e.g. 9chain-a1-tap-node-1
}

type Ledger struct {
	Index         int    `json:"index"`
	Name          string `json:"name"`
	ChainID       uint64 `json:"chainId"`
	Node          string `json:"node"`
	OwnerKey      string `json:"ownerKey"` // PrivateKey-<cb58>
	OwnerEth      string `json:"ownerEth"`
	OwnerP        string `json:"ownerP"` // ids.ShortID string
	PumpKey       string `json:"pumpKey"`
	PumpEth       string `json:"pumpEth"`
	BalanceNLove9 uint64 `json:"balanceNLove9"`
	Genesis       string `json:"genesis"`      // path relative to plan dir
	GenesisBytes  int    `json:"genesisBytes"` // measured, so the ≤ 10 KB rule is a number in the file
}

type Plan struct {
	CreatedAt    string   `json:"createdAt"`
	NetworkID    uint32   `json:"networkID"`
	Nodes        []NodeRef `json:"nodes"`
	PerNodeCap   int      `json:"perNodeCap"`
	ChainIDBase  uint64   `json:"chainIdBase"`
	ForbidLo     uint64   `json:"forbidLo"`
	ForbidHi     uint64   `json:"forbidHi"`
	Ledgers      []Ledger `json:"ledgers"`
}

type ChainRecord struct {
	Name         string    `json:"name"`
	ChainID      uint64    `json:"chainId"`
	Node         string    `json:"node"`
	NodeURI      string    `json:"nodeUri"`
	NodeID       string    `json:"nodeID"`
	SubnetID     string    `json:"subnetID"`
	BlockchainID string    `json:"blockchainID"`
	ValidationID string    `json:"validationID"`
	ConvertTx    string    `json:"convertTx"`
	At           time.Time `json:"at"`
	SubnetMs     int64     `json:"subnetMs"`
	ChainMs      int64     `json:"chainMs"`
	ConvertMs    int64     `json:"convertMs"`
}

// ── main ─────────────────────────────────────────────────────────────────────────────────────

func main() {
	if len(os.Args) < 2 {
		usage()
		os.Exit(2)
	}
	var err error
	switch os.Args[1] {
	case "plan":
		err = cmdPlan(os.Args[2:])
	case "apply":
		err = cmdApply(os.Args[2:])
	case "render":
		err = cmdRender(os.Args[2:])
	case "status":
		err = cmdStatus(os.Args[2:])
	case "pump":
		err = cmdPump(os.Args[2:])
	case "fund":
		err = cmdFund(os.Args[2:])
	case "topup":
		err = cmdTopup(os.Args[2:])
	case "help", "-h", "--help":
		usage()
	default:
		usage()
		os.Exit(2)
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, "✗", err)
		os.Exit(1)
	}
}

func usage() {
	fmt.Fprintln(os.Stderr, `l1-batch <plan|fund|apply|render|status|pump> [flags]   (run each with -h for flags)`)
}

// ── topup ────────────────────────────────────────────────────────────────────────────────────

// IncreaseL1ValidatorBalanceTx carries no authorization beyond paying for it
// (txs/increase_l1_validator_balance_tx.go:19–25): ANY wallet can wake ANY ledger. Phase 0.4
// runs this from the drill fund key — not the ledger owner — to prove exactly that. The
// leftover goes to RemainingBalanceOwner (the owner), never back to whoever paid.
func cmdTopup(args []string) error {
	fs := flag.NewFlagSet("topup", flag.ExitOnError)
	keyStr := fs.String("key", os.Getenv("K1_FUND_KEY"), "paying key, PrivateKey-<cb58> (or env K1_FUND_KEY)")
	uri := fs.String("uri", "http://172.31.0.11:9650", "node API URI")
	validation := fs.String("validation", "", "validationID of the ledger's validator")
	amount := fs.Uint64("amount", 10_000_000, "nLOVE9 to add (10^7 ≈ 116 days at the floor)")
	timeout := fs.Duration("tx-timeout", 90*time.Second, "per-transaction timeout")
	fs.Parse(args)
	if *keyStr == "" || *validation == "" {
		return errors.New("-key (or K1_FUND_KEY) and -validation are required")
	}
	key, err := parseKey(*keyStr)
	if err != nil {
		return err
	}
	vid, err := ids.FromString(*validation)
	if err != nil {
		return fmt.Errorf("validationID: %w", err)
	}
	kc := secp256k1fx.NewKeychain(key)
	ctx, cancel := context.WithTimeout(context.Background(), *timeout)
	defer cancel()
	w, err := primary.MakePWallet(ctx, *uri, kc, primary.WalletConfig{ValidationIDs: []ids.ID{vid}})
	if err != nil {
		return fmt.Errorf("wallet: %w", err)
	}
	t0 := time.Now()
	tx, err := w.IssueIncreaseL1ValidatorBalanceTx(vid, *amount)
	if err != nil {
		return fmt.Errorf("IncreaseL1ValidatorBalanceTx: %w", err)
	}
	fmt.Printf("✓ topup %s +%d nLOVE9 tx=%s (%s) paid by %s\n", vid, *amount, tx.ID(), time.Since(t0).Round(time.Millisecond), key.Address())
	return nil
}

// ── fund ─────────────────────────────────────────────────────────────────────────────────────

// netgen's genesis puts the liquid allocations on the X-Chain; the P-Chain side of every fund
// starts at zero (measured on the drill: platform.getBalance = 0, avm.getBalance = 71,000,009
// LOVE9). Every P-Chain transaction here needs P-Chain UTXOs, so the first step is always the
// two-leg move X → P — the same two-leg wallet lesson already recorded for the public network.
func cmdFund(args []string) error {
	fs := flag.NewFlagSet("fund", flag.ExitOnError)
	keyStr := fs.String("key", os.Getenv("K1_FUND_KEY"), "funding key, PrivateKey-<cb58> (or env K1_FUND_KEY)")
	uri := fs.String("uri", "http://172.31.0.11:9650", "node API URI")
	amount := fs.Uint64("amount", 1_000_000_000_000, "nLOVE9 to move X → P (default 1,000 LOVE9)")
	timeout := fs.Duration("tx-timeout", 90*time.Second, "per-transaction timeout")
	fs.Parse(args)
	if *keyStr == "" {
		return errors.New("-key (or K1_FUND_KEY) is required")
	}
	key, err := parseKey(*keyStr)
	if err != nil {
		return err
	}
	kc := secp256k1fx.NewKeychain(key)
	owner := &secp256k1fx.OutputOwners{Threshold: 1, Addrs: []ids.ShortID{key.Address()}}

	ctx, cancel := context.WithTimeout(context.Background(), *timeout)
	defer cancel()
	w, err := primary.MakeWallet(ctx, *uri, kc, kc, primary.WalletConfig{})
	if err != nil {
		return fmt.Errorf("wallet: %w", err)
	}
	xw, pw := w.X(), w.P()
	xctx := xw.Builder().Context()

	t0 := time.Now()
	exportTx, err := xw.IssueExportTx(constants.PlatformChainID, []*avax.TransferableOutput{{
		Asset: avax.Asset{ID: xctx.AVAXAssetID},
		Out:   &secp256k1fx.TransferOutput{Amt: *amount, OutputOwners: *owner},
	}})
	if err != nil {
		return fmt.Errorf("X export: %w", err)
	}
	fmt.Printf("✓ X→P export %s (%s)\n", exportTx.ID(), time.Since(t0).Round(time.Millisecond))
	t1 := time.Now()
	importTx, err := pw.IssueImportTx(xctx.BlockchainID, owner)
	if err != nil {
		return fmt.Errorf("P import: %w", err)
	}
	fmt.Printf("✓ P import   %s (%s) — %d nLOVE9 now spendable on P-Chain by %s\n",
		importTx.ID(), time.Since(t1).Round(time.Millisecond), *amount, key.Address())
	return nil
}

// ── plan ─────────────────────────────────────────────────────────────────────────────────────

func cmdPlan(args []string) error {
	fs := flag.NewFlagSet("plan", flag.ExitOnError)
	nodes := fs.String("nodes", "", "comma-separated node API URIs, in node order (node1 first)")
	services := fs.String("services", "9chain-a1-tap-node-", "compose service name prefix; node i → prefix+i")
	count := fs.Int("count", 30, "number of ledgers")
	perNode := fs.Int("per-node", 14, "max ledgers per node (16 is the protocol wall; 15 leaves one for the community chain)")
	base := fs.Uint64("chain-id-base", 8990000001, "EVM chainId of ledger 1; ledger i gets base+i-1")
	forbid := fs.String("forbid", "9000000010-9999999999", "chainId range that belongs to the REAL network — refused")
	template := fs.String("template", "config/l1-evm-genesis.json", "subnet-evm genesis template (static fields are kept)")
	out := fs.String("out", "out/plan", "output directory")
	balance := fs.Uint64("balance", 10_000_000, "initial validator balance in nLOVE9 (10^7 ≈ 116 days at the 1 nLOVE9/s floor)")
	dormantFirst := fs.Int("dormant-first", 0, "the first N ledgers get -dormant-balance instead, to test dormancy")
	dormantBalance := fs.Uint64("dormant-balance", 120, "nLOVE9 for the dormant group (120 ≈ 2 minutes at the floor)")
	maxGenesis := fs.Int("max-genesis-bytes", 10*1024, "refuse any genesis larger than this (it lives forever in every P-Chain txDB)")
	keepAlloc := fs.Bool("keep-template-alloc", false, "keep the template's alloc entries (default: replace with owner+pump only). Used by the fat-genesis txDB measurement")
	networkID := fs.Uint("network-id", 899999998, "drill band networkID, recorded in the plan")
	fs.Parse(args)

	if *nodes == "" {
		return errors.New("-nodes is required")
	}
	lo, hi, err := parseRange(*forbid)
	if err != nil {
		return err
	}
	var refs []NodeRef
	for i, u := range strings.Split(*nodes, ",") {
		u = strings.TrimSpace(u)
		if u == "" {
			continue
		}
		refs = append(refs, NodeRef{Name: fmt.Sprintf("node%d", i+1), URI: u, Service: fmt.Sprintf("%s%d", *services, i+1)})
	}
	if len(refs)**perNode < *count {
		return fmt.Errorf("%d nodes × %d per node = %d slots < %d ledgers", len(refs), *perNode, len(refs)**perNode, *count)
	}
	tpl, err := os.ReadFile(*template)
	if err != nil {
		return err
	}
	var tplMap map[string]any
	if err := json.Unmarshal(tpl, &tplMap); err != nil {
		return fmt.Errorf("template is not JSON: %w", err)
	}
	if err := os.MkdirAll(filepath.Join(*out, "genesis"), 0o755); err != nil {
		return err
	}

	load := make([]int, len(refs))
	plan := Plan{CreatedAt: time.Now().UTC().Format(time.RFC3339), NetworkID: uint32(*networkID), Nodes: refs,
		PerNodeCap: *perNode, ChainIDBase: *base, ForbidLo: lo, ForbidHi: hi}
	for i := 1; i <= *count; i++ {
		chainID := *base + uint64(i-1)
		if chainID >= lo && chainID <= hi {
			return fmt.Errorf("ledger %d would get chainId %d, inside the real network's range %d–%d", i, chainID, lo, hi)
		}
		owner, err := secp256k1.NewPrivateKey()
		if err != nil {
			return err
		}
		pump, err := secp256k1.NewPrivateKey()
		if err != nil {
			return err
		}
		// least-loaded node, ties → lowest index
		n := 0
		for j := range load {
			if load[j] < load[n] {
				n = j
			}
		}
		if load[n] >= *perNode {
			return fmt.Errorf("no node has a free slot for ledger %d", i)
		}
		load[n]++
		bal := *balance
		if i <= *dormantFirst {
			bal = *dormantBalance
		}
		name := fmt.Sprintf("so-%04d", i)
		gen, err := buildGenesis(tplMap, chainID, owner.PublicKey().EthAddress(), pump.PublicKey().EthAddress(), *keepAlloc)
		if err != nil {
			return err
		}
		if len(gen) > *maxGenesis {
			return fmt.Errorf("genesis for %s is %d bytes > %d", name, len(gen), *maxGenesis)
		}
		rel := filepath.ToSlash(filepath.Join("genesis", name+".json"))
		if err := os.WriteFile(filepath.Join(*out, rel), gen, 0o644); err != nil {
			return err
		}
		plan.Ledgers = append(plan.Ledgers, Ledger{
			Index: i, Name: name, ChainID: chainID, Node: refs[n].Name,
			OwnerKey: keyString(owner), OwnerEth: owner.PublicKey().EthAddress().Hex(), OwnerP: owner.Address().String(),
			PumpKey: keyString(pump), PumpEth: pump.PublicKey().EthAddress().Hex(),
			BalanceNLove9: bal, Genesis: rel, GenesisBytes: len(gen),
		})
	}
	if err := writeJSON(filepath.Join(*out, "plan.json"), plan); err != nil {
		return err
	}
	fmt.Printf("✓ plan: %d ledgers on %d nodes (cap %d/node) → %s\n", *count, len(refs), *perNode, filepath.Join(*out, "plan.json"))
	for i, r := range refs {
		fmt.Printf("   %-6s %-32s %2d ledgers\n", r.Name, r.URI, load[i])
	}
	fmt.Printf("   chainId %d–%d · genesis %d bytes each · balance %d nLOVE9 (%d dormant at %d)\n",
		*base, *base+uint64(*count-1), plan.Ledgers[0].GenesisBytes, *balance, *dormantFirst, *dormantBalance)
	return nil
}

// buildGenesis keeps the template's static fields and replaces what makes a ledger a ledger:
// chainId, the two allow-lists (owner = admin of both, pump = enabled signer), and alloc.
// feeManagerConfig is dropped on purpose (nothing in K1 measures it), warpConfig is kept.
func buildGenesis(tpl map[string]any, chainID uint64, owner, pump common.Address, keepAlloc bool) ([]byte, error) {
	m := deepCopy(tpl)
	alloc := map[string]any{}
	if keepAlloc {
		if old, ok := m["alloc"].(map[string]any); ok {
			alloc = old
		}
	}
	cfg, ok := m["config"].(map[string]any)
	if !ok {
		return nil, errors.New("template has no config object")
	}
	cfg["chainId"] = chainID
	delete(cfg, "feeManagerConfig")
	cfg["txAllowListConfig"] = map[string]any{
		"blockTimestamp":   0,
		"adminAddresses":   []string{owner.Hex()},
		"enabledAddresses": []string{pump.Hex()},
	}
	cfg["contractDeployerAllowListConfig"] = map[string]any{
		"blockTimestamp": 0,
		"adminAddresses": []string{owner.Hex()},
	}
	if _, has := cfg["warpConfig"]; !has {
		cfg["warpConfig"] = map[string]any{"blockTimestamp": 0}
	}
	alloc[strings.TrimPrefix(owner.Hex(), "0x")] = map[string]any{"balance": "0x295BE96E64066972000000"} // 50,000,000 × 10^18
	alloc[strings.TrimPrefix(pump.Hex(), "0x")] = map[string]any{"balance": "0xD3C21BCECCEDA1000000"}   // 1,000,000 × 10^18
	m["alloc"] = alloc
	return json.MarshalIndent(m, "", " ")
}

// ── apply ────────────────────────────────────────────────────────────────────────────────────

type popCache struct {
	mu sync.Mutex
	m  map[string]nodeIdentity
}

type nodeIdentity struct {
	NodeID ids.NodeID
	POP    *signer.ProofOfPossession
}

func cmdApply(args []string) error {
	fs := flag.NewFlagSet("apply", flag.ExitOnError)
	planPath := fs.String("plan", "out/plan/plan.json", "plan.json from `plan`")
	keyStr := fs.String("key", os.Getenv("K1_FUND_KEY"), "funding P-Chain key, PrivateKey-<cb58> (or env K1_FUND_KEY)")
	uri := fs.String("uri", "", "P-Chain API URI to issue through (default: first node in the plan)")
	vmIDStr := fs.String("vm-id", "pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf", "LOVE9EVM plugin VM id")
	outPath := fs.String("out", "out/plan/chains.jsonl", "append-only record of converted ledgers (resume file)")
	manager := fs.String("manager", "0x0100000000000000000000000000000000000000", "placeholder Subnet manager address (20 bytes hex)")
	weight := fs.Uint64("weight", 100, "validator weight")
	limit := fs.Int("limit", 0, "stop after this many NEW ledgers (0 = all)")
	timeout := fs.Duration("tx-timeout", 90*time.Second, "per-transaction timeout")
	fs.Parse(args)

	plan, err := readPlan(*planPath)
	if err != nil {
		return err
	}
	if *keyStr == "" {
		return errors.New("-key (or K1_FUND_KEY) is required: a PrivateKey-<cb58> holding LOVE9 on the drill P-Chain (keys.txt from netgen)")
	}
	fundKey, err := parseKey(*keyStr)
	if err != nil {
		return err
	}
	if *uri == "" {
		*uri = plan.Nodes[0].URI
	}
	vmID, err := ids.FromString(*vmIDStr)
	if err != nil {
		return fmt.Errorf("vm id: %w", err)
	}
	managerBytes, err := hex.DecodeString(strings.TrimPrefix(*manager, "0x"))
	if err != nil {
		return fmt.Errorf("manager address: %w", err)
	}
	done, err := readChains(*outPath)
	if err != nil {
		return err
	}
	doneByName := map[string]bool{}
	for _, c := range done {
		doneByName[c.Name] = true
	}
	nodeByName := map[string]NodeRef{}
	for _, n := range plan.Nodes {
		nodeByName[n.Name] = n
	}
	planDir := filepath.Dir(*planPath)
	kc := secp256k1fx.NewKeychain(fundKey)
	subnetOwner := &secp256k1fx.OutputOwners{Threshold: 1, Addrs: []ids.ShortID{fundKey.Address()}}
	pops := &popCache{m: map[string]nodeIdentity{}}

	f, err := os.OpenFile(*outPath, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	defer f.Close()

	newCount := 0
	fmt.Printf("apply: %d ledgers in plan, %d already converted, issuing through %s\n", len(plan.Ledgers), len(done), *uri)
	for _, l := range plan.Ledgers {
		if doneByName[l.Name] {
			continue
		}
		if *limit > 0 && newCount >= *limit {
			break
		}
		node, ok := nodeByName[l.Node]
		if !ok {
			return fmt.Errorf("%s assigned to unknown node %s", l.Name, l.Node)
		}
		ident, err := pops.get(node.URI)
		if err != nil {
			return fmt.Errorf("%s: info.getNodeID on %s: %w", l.Name, node.URI, err)
		}
		genesis, err := os.ReadFile(filepath.Join(planDir, l.Genesis))
		if err != nil {
			return err
		}
		ownerShort, err := ids.ShortFromString(l.OwnerP)
		if err != nil {
			return fmt.Errorf("%s ownerP: %w", l.Name, err)
		}
		rec := ChainRecord{Name: l.Name, ChainID: l.ChainID, Node: node.Name, NodeURI: node.URI, NodeID: ident.NodeID.String()}

		// 1) subnet
		ctx, cancel := context.WithTimeout(context.Background(), *timeout)
		t0 := time.Now()
		w, err := primary.MakePWallet(ctx, *uri, kc, primary.WalletConfig{})
		if err != nil {
			cancel()
			return fmt.Errorf("%s: wallet: %w", l.Name, err)
		}
		subnetTx, err := w.IssueCreateSubnetTx(subnetOwner)
		cancel()
		if err != nil {
			return fmt.Errorf("%s: CreateSubnetTx: %w", l.Name, err)
		}
		subnetID := subnetTx.ID()
		rec.SubnetID = subnetID.String()
		rec.SubnetMs = time.Since(t0).Milliseconds()

		// 2) chain (the wallet must know the subnet to sign with its auth)
		ctx, cancel = context.WithTimeout(context.Background(), *timeout)
		t1 := time.Now()
		w, err = primary.MakePWallet(ctx, *uri, kc, primary.WalletConfig{SubnetIDs: []ids.ID{subnetID}})
		if err != nil {
			cancel()
			return fmt.Errorf("%s: wallet(subnet): %w", l.Name, err)
		}
		// CreateChainTx accepts letters, digits and spaces only ("illegal name character" on the
		// drill for "so-0001" — that run left subnet gHip8K…VsA orphaned, the first real orphan).
		chainTx, err := w.IssueCreateChainTx(subnetID, genesis, vmID, nil, strings.ReplaceAll(l.Name, "-", " "))
		if err != nil {
			cancel()
			return fmt.Errorf("%s: CreateChainTx (subnet %s is now ORPHANED): %w", l.Name, subnetID, err)
		}
		blockchainID := chainTx.ID()
		rec.BlockchainID = blockchainID.String()
		rec.ChainMs = time.Since(t1).Milliseconds()

		// 3) convert — one validator, the assigned node; owners = the ledger owner
		t2 := time.Now()
		pOwner := message.PChainOwner{Threshold: 1, Addresses: []ids.ShortID{ownerShort}}
		vdr := &txs.ConvertSubnetToL1Validator{
			NodeID:                ident.NodeID.Bytes(),
			Weight:                *weight,
			Balance:               l.BalanceNLove9,
			Signer:                *ident.POP,
			RemainingBalanceOwner: pOwner,
			DeactivationOwner:     pOwner,
		}
		convertTx, err := w.IssueConvertSubnetToL1Tx(subnetID, blockchainID, managerBytes, []*txs.ConvertSubnetToL1Validator{vdr})
		cancel()
		if err != nil {
			return fmt.Errorf("%s: ConvertSubnetToL1Tx (subnet %s + chain %s created, NOT converted): %w", l.Name, subnetID, blockchainID, err)
		}
		rec.ConvertTx = convertTx.ID().String()
		rec.ValidationID = subnetID.Append(0).String() // executor: tx.Subnet.Append(uint32(i)) for validator i
		rec.ConvertMs = time.Since(t2).Milliseconds()
		rec.At = time.Now().UTC()

		line, _ := json.Marshal(rec)
		if _, err := f.Write(append(line, '\n')); err != nil {
			return err
		}
		newCount++
		fmt.Printf("✓ %s chainId=%d node=%s subnet=%s chain=%s validation=%s  (%d+%d+%d ms)\n",
			l.Name, l.ChainID, node.Name, rec.SubnetID, rec.BlockchainID, rec.ValidationID, rec.SubnetMs, rec.ChainMs, rec.ConvertMs)
	}
	fmt.Printf("apply: %d new, %d total converted → %s\n", newCount, len(done)+newCount, *outPath)
	return nil
}

func (c *popCache) get(uri string) (nodeIdentity, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if v, ok := c.m[uri]; ok {
		return v, nil
	}
	var reply struct {
		NodeID  ids.NodeID                `json:"nodeID"`
		NodePOP *signer.ProofOfPossession `json:"nodePOP"`
	}
	if err := rpcCall(uri+"/ext/info", "info.getNodeID", map[string]any{}, &reply); err != nil {
		return nodeIdentity{}, err
	}
	if reply.NodePOP == nil {
		return nodeIdentity{}, errors.New("node returned no nodePOP (no BLS signer key?)")
	}
	v := nodeIdentity{NodeID: reply.NodeID, POP: reply.NodePOP}
	c.m[uri] = v
	return v, nil
}

// ── render ───────────────────────────────────────────────────────────────────────────────────

// Small caches: subnet-evm defaults are trie-clean 512 + trie-dirty 512 + snapshot 256 MB PER
// PLUGIN (plugin/evm/config/default_config.go:34–38). Fifteen ledgers per node at the defaults
// is ~19 GB; at these values it is a few hundred MB. Phase 0.1 measures both.
const chainConfigJSON = `{
 "trie-clean-cache": 16,
 "trie-dirty-cache": 16,
 "snapshot-cache": 8,
 "pruning-enabled": true,
 "warp-api-enabled": true,
 "metrics-expensive-enabled": false,
 "log-level": "warn"
}
`

// Solo-validator snow parameters. Verify() (snowball/parameters.go:93–106) requires
// k/2 < alphaPreference ≤ alphaConfidence ≤ k and concurrentRepolls ≤ beta. Whether the
// network default (k = 20) also works with a single validator is phase 0.2's question; this
// file is what we ship if it does not.
const subnetConfigJSON = `{
 "snowParameters": {
  "k": 1,
  "alphaPreference": 1,
  "alphaConfidence": 1,
  "beta": 1,
  "concurrentRepolls": 1,
  "optimalProcessing": 1,
  "maxOutstandingItems": 256,
  "maxItemProcessingTime": 30000000000
 }
}
`

func cmdRender(args []string) error {
	fs := flag.NewFlagSet("render", flag.ExitOnError)
	planPath := fs.String("plan", "out/plan/plan.json", "plan.json")
	chainsPath := fs.String("chains", "out/plan/chains.jsonl", "chains.jsonl from `apply`")
	configDir := fs.String("config-dir", "config", "the directory mounted at /9chain-a1/config (chains/, subnets/)")
	image := fs.String("image", "9chain-a1/node:g1-81", "node image for the compose override")
	portBase := fs.Int("port-base", 9750, "host API port of node1; node i gets base+10*(i-1)")
	override := fs.String("override", "out/plan/docker-compose.k1.yml", "compose override to write")
	writeSubnetCfg := fs.Bool("solo-snow", true, "write subnet-config-dir/<subnetID>.json with k=1 parameters")
	fs.Parse(args)

	plan, err := readPlan(*planPath)
	if err != nil {
		return err
	}
	chains, err := readChains(*chainsPath)
	if err != nil {
		return err
	}
	if len(chains) == 0 {
		return errors.New("no converted chains yet — run `apply` first")
	}
	byNode := map[string][]ChainRecord{}
	for _, c := range chains {
		byNode[c.Node] = append(byNode[c.Node], c)
		dir := filepath.Join(*configDir, "chains", c.BlockchainID)
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(dir, "config.json"), []byte(chainConfigJSON), 0o644); err != nil {
			return err
		}
		if *writeSubnetCfg {
			sdir := filepath.Join(*configDir, "subnets")
			if err := os.MkdirAll(sdir, 0o755); err != nil {
				return err
			}
			if err := os.WriteFile(filepath.Join(sdir, c.SubnetID+".json"), []byte(subnetConfigJSON), 0o644); err != nil {
				return err
			}
		}
	}

	// assignment.json — what a router reads: blockchainID → node
	assignment := map[string]any{}
	for _, c := range chains {
		assignment[c.BlockchainID] = map[string]any{"node": c.Node, "uri": c.NodeURI, "chainId": c.ChainID, "name": c.Name, "subnetID": c.SubnetID}
	}
	if err := writeJSON(filepath.Join(filepath.Dir(*planPath), "assignment.json"), assignment); err != nil {
		return err
	}

	// compose override: image, host ports off 9650 (the local explorer indexes 9650), per-node
	// track list, subnet-config-dir. `!override` replaces the base list instead of appending.
	var b strings.Builder
	b.WriteString("# Generated by l1-batch render — layer over the netgen compose:\n")
	b.WriteString("#   docker compose -f out/net/docker-compose.multinode.yml -f out/plan/docker-compose.k1.yml up -d\n")
	b.WriteString("services:\n")
	for i, n := range plan.Nodes {
		var ids []string
		for _, c := range byNode[n.Name] {
			ids = append(ids, c.SubnetID)
		}
		sort.Strings(ids)
		fmt.Fprintf(&b, "  %s:\n", n.Service)
		fmt.Fprintf(&b, "    image: %s\n", *image)
		fmt.Fprintf(&b, "    ports: !override\n      - \"127.0.0.1:%d:9650\"\n", *portBase+10*i)
		b.WriteString("    environment:\n")
		fmt.Fprintf(&b, "      - AVAGO_TRACK_SUBNETS=%s\n", strings.Join(ids, ","))
		b.WriteString("      - AVAGO_SUBNET_CONFIG_DIR=/9chain-a1/config/subnets\n")
		fmt.Fprintf(&b, "    # %d ledgers\n", len(ids))
	}
	if err := os.WriteFile(*override, []byte(b.String()), 0o644); err != nil {
		return err
	}
	subnetCfgs := 0
	if *writeSubnetCfg {
		subnetCfgs = len(chains)
	}
	fmt.Printf("✓ render: %d chain configs, %d subnet configs → %s\n", len(chains), subnetCfgs, *configDir)
	for _, n := range plan.Nodes {
		fmt.Printf("   %-6s tracks %2d subnets\n", n.Name, len(byNode[n.Name]))
	}
	fmt.Printf("   override → %s   (nodes must be RESTARTED once for --track-subnets to take effect: it is a startup flag)\n", *override)
	return nil
}

// ── status ───────────────────────────────────────────────────────────────────────────────────

func cmdStatus(args []string) error {
	fs := flag.NewFlagSet("status", flag.ExitOnError)
	planPath := fs.String("plan", "out/plan/plan.json", "plan.json")
	chainsPath := fs.String("chains", "out/plan/chains.jsonl", "chains.jsonl")
	uri := fs.String("uri", "", "P-Chain API URI (default: first node)")
	fs.Parse(args)

	plan, err := readPlan(*planPath)
	if err != nil {
		return err
	}
	chains, err := readChains(*chainsPath)
	if err != nil {
		return err
	}
	if *uri == "" {
		*uri = plan.Nodes[0].URI
	}
	var fee struct {
		Excess    json.Number `json:"excess"`
		Price     json.Number `json:"price"`
		Timestamp string      `json:"timestamp"`
	}
	if err := rpcCall(*uri+"/ext/bc/P", "platform.getValidatorFeeState", map[string]any{}, &fee); err != nil {
		return fmt.Errorf("platform.getValidatorFeeState: %w", err)
	}
	fmt.Printf("P-Chain validator fee: price=%s nLOVE9/s excess=%s at %s\n", fee.Price, fee.Excess, fee.Timestamp)

	bad := 0
	fmt.Printf("%-8s %-11s %-6s %-8s %-14s %-8s %s\n", "ledger", "chainId", "node", "weight", "balance", "active", "eth_chainId")
	for _, c := range chains {
		var v struct {
			SubnetID string      `json:"subnetID"`
			NodeID   string      `json:"nodeID"`
			Weight   json.Number `json:"weight"`
			Balance  json.Number `json:"balance"`
		}
		verr := rpcCall(*uri+"/ext/bc/P", "platform.getL1Validator", map[string]any{"validationID": c.ValidationID}, &v)
		var ethChain struct{}
		_ = ethChain
		got, eerr := ethChainID(c.NodeURI + "/ext/bc/" + c.BlockchainID + "/rpc")
		active := "?"
		if verr == nil {
			active = "yes"
			if v.Balance.String() == "" || v.Balance.String() == "0" {
				active = "NO"
			}
		}
		ethStr := "-"
		if eerr == nil {
			ethStr = strconv.FormatUint(got, 10)
		} else {
			ethStr = "err: " + short(eerr.Error(), 40)
		}
		mark := " "
		if verr != nil || eerr != nil || got != c.ChainID || v.NodeID != c.NodeID {
			mark = "✗"
			bad++
		}
		w, bal := v.Weight.String(), v.Balance.String()
		if verr != nil {
			w, bal = "err", short(verr.Error(), 14)
		}
		fmt.Printf("%s%-7s %-11d %-6s %-8s %-14s %-8s %s\n", mark, c.Name, c.ChainID, c.Node, w, bal, active, ethStr)
	}
	fmt.Printf("%d chains, %d problems\n", len(chains), bad)
	if bad > 0 {
		return fmt.Errorf("%d chains not as recorded", bad)
	}
	return nil
}

// ── pump ─────────────────────────────────────────────────────────────────────────────────────

func cmdPump(args []string) error {
	fs := flag.NewFlagSet("pump", flag.ExitOnError)
	planPath := fs.String("plan", "out/plan/plan.json", "plan.json")
	chainsPath := fs.String("chains", "out/plan/chains.jsonl", "chains.jsonl")
	rate := fs.Float64("rate", 1, "tx/s per ledger")
	seconds := fs.Int("seconds", 60, "how long to run")
	only := fs.String("only", "", "comma-separated ledger names (default: all converted)")
	fs.Parse(args)

	plan, err := readPlan(*planPath)
	if err != nil {
		return err
	}
	chains, err := readChains(*chainsPath)
	if err != nil {
		return err
	}
	ledgerByName := map[string]Ledger{}
	for _, l := range plan.Ledgers {
		ledgerByName[l.Name] = l
	}
	want := map[string]bool{}
	for _, n := range strings.Split(*only, ",") {
		if n = strings.TrimSpace(n); n != "" {
			want[n] = true
		}
	}
	deadline := time.Now().Add(time.Duration(*seconds) * time.Second)
	var wg sync.WaitGroup
	var mu sync.Mutex
	sent, failed := map[string]int{}, map[string]int{}
	for _, c := range chains {
		if len(want) > 0 && !want[c.Name] {
			continue
		}
		l := ledgerByName[c.Name]
		wg.Add(1)
		go func(c ChainRecord, l Ledger) {
			defer wg.Done()
			url := c.NodeURI + "/ext/bc/" + c.BlockchainID + "/rpc"
			key, err := parseKey(l.PumpKey)
			if err != nil {
				return
			}
			ecdsaKey, err := crypto.ToECDSA(key.Bytes())
			if err != nil {
				return
			}
			from := crypto.PubkeyToAddress(ecdsaKey.PublicKey)
			nonce, err := ethNonce(url, from)
			if err != nil {
				mu.Lock()
				failed[c.Name]++
				mu.Unlock()
				return
			}
			signer := types.LatestSignerForChainID(new(big.Int).SetUint64(c.ChainID))
			tick := time.NewTicker(time.Duration(float64(time.Second) / *rate))
			defer tick.Stop()
			to := common.HexToAddress(l.OwnerEth)
			for time.Now().Before(deadline) {
				<-tick.C
				tx := types.NewTx(&types.LegacyTx{Nonce: nonce, GasPrice: big.NewInt(50_000_000_000), Gas: 21000, To: &to, Value: big.NewInt(1)})
				signed, err := types.SignTx(tx, signer, ecdsaKey)
				if err != nil {
					continue
				}
				raw, _ := signed.MarshalBinary()
				var txHash string
				err = rpcCall(url, "eth_sendRawTransaction", []any{"0x" + hex.EncodeToString(raw)}, &txHash)
				mu.Lock()
				if err != nil {
					failed[c.Name]++
					// nonce is LOCAL: on "nonce too low" resync once, otherwise keep going
					if strings.Contains(err.Error(), "nonce") {
						if n, e := ethNonce(url, from); e == nil {
							nonce = n
						}
					}
				} else {
					sent[c.Name]++
					nonce++
				}
				mu.Unlock()
			}
		}(c, l)
	}
	wg.Wait()
	total, totalFailed := 0, 0
	for _, c := range chains {
		if len(want) > 0 && !want[c.Name] {
			continue
		}
		total += sent[c.Name]
		totalFailed += failed[c.Name]
		fmt.Printf("%-8s sent %5d failed %4d\n", c.Name, sent[c.Name], failed[c.Name])
	}
	fmt.Printf("pump: %d tx sent, %d failed, over %ds at %.2f tx/s/ledger\n", total, totalFailed, *seconds, *rate)
	return nil
}

// ── helpers ──────────────────────────────────────────────────────────────────────────────────

func parseRange(s string) (uint64, uint64, error) {
	parts := strings.SplitN(s, "-", 2)
	if len(parts) != 2 {
		return 0, 0, fmt.Errorf("range %q must be lo-hi", s)
	}
	lo, err := strconv.ParseUint(parts[0], 10, 64)
	if err != nil {
		return 0, 0, err
	}
	hi, err := strconv.ParseUint(parts[1], 10, 64)
	if err != nil {
		return 0, 0, err
	}
	return lo, hi, nil
}

func keyString(k *secp256k1.PrivateKey) string {
	s, _ := cb58.Encode(k.Bytes())
	return secp256k1.PrivateKeyPrefix + s
}

func parseKey(s string) (*secp256k1.PrivateKey, error) {
	s = strings.TrimSpace(s)
	if !strings.HasPrefix(s, secp256k1.PrivateKeyPrefix) {
		return nil, fmt.Errorf("key must start with %s", secp256k1.PrivateKeyPrefix)
	}
	raw, err := cb58.Decode(strings.TrimPrefix(s, secp256k1.PrivateKeyPrefix))
	if err != nil {
		return nil, err
	}
	return secp256k1.ToPrivateKey(raw)
}

func readPlan(p string) (*Plan, error) {
	b, err := os.ReadFile(p)
	if err != nil {
		return nil, err
	}
	var plan Plan
	if err := json.Unmarshal(b, &plan); err != nil {
		return nil, err
	}
	if len(plan.Nodes) == 0 {
		return nil, errors.New("plan has no nodes")
	}
	return &plan, nil
}

func readChains(p string) ([]ChainRecord, error) {
	f, err := os.Open(p)
	if errors.Is(err, os.ErrNotExist) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	defer f.Close()
	var out []ChainRecord
	sc := bufio.NewScanner(f)
	sc.Buffer(make([]byte, 1<<20), 1<<20)
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		if line == "" {
			continue
		}
		var c ChainRecord
		if err := json.Unmarshal([]byte(line), &c); err != nil {
			return nil, fmt.Errorf("%s: bad line: %w", p, err)
		}
		out = append(out, c)
	}
	return out, sc.Err()
}

func writeJSON(p string, v any) error {
	b, err := json.MarshalIndent(v, "", " ")
	if err != nil {
		return err
	}
	return os.WriteFile(p, append(b, '\n'), 0o644)
}

func deepCopy(m map[string]any) map[string]any {
	b, _ := json.Marshal(m)
	var out map[string]any
	_ = json.Unmarshal(b, &out)
	return out
}

func short(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}

var httpClient = &http.Client{Timeout: 20 * time.Second}

func rpcCall(url, method string, params any, out any) error {
	body, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "id": 1, "method": method, "params": params})
	resp, err := httpClient.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(resp.Body)
	var env struct {
		Result json.RawMessage `json:"result"`
		Error  *struct {
			Code    int    `json:"code"`
			Message string `json:"message"`
		} `json:"error"`
	}
	if err := json.Unmarshal(raw, &env); err != nil {
		return fmt.Errorf("%s: not JSON (HTTP %d): %s", method, resp.StatusCode, short(string(raw), 80))
	}
	if env.Error != nil {
		return fmt.Errorf("%s: %s", method, env.Error.Message)
	}
	if out == nil {
		return nil
	}
	return json.Unmarshal(env.Result, out)
}

func ethChainID(url string) (uint64, error) {
	var hexStr string
	if err := rpcCall(url, "eth_chainId", []any{}, &hexStr); err != nil {
		return 0, err
	}
	return strconv.ParseUint(strings.TrimPrefix(hexStr, "0x"), 16, 64)
}

func ethNonce(url string, from common.Address) (uint64, error) {
	var hexStr string
	if err := rpcCall(url, "eth_getTransactionCount", []any{from.Hex(), "latest"}, &hexStr); err != nil {
		return 0, err
	}
	return strconv.ParseUint(strings.TrimPrefix(hexStr, "0x"), 16, 64)
}
