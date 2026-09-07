// create.go — `l1-batch create`: one chain with EXACTLY the named validators (P-84, D-237).
//
// ═══ WHY THIS LIVES HERE AND NOT IN THE FORK'S CLI ═══
//
// `9chain-a1-cli l1 create` registers EVERY primary-network validator on the new subnet — the
// every-node model. Under the per-node model (validator-assignment.mjs) the console places a
// chain on V nodes, and the P-Chain must say the same V, no more: a validator that is
// registered but does not track the chain is dead weight in every quorum, and a ledger that
// says "5" while the P-Chain says "9" is a record that lies.
//
// Adding a `--validators` flag to the fork's CLI would be a change to `patches/` (hard rule #3:
// regenerate the whole set, new tree, new image on two machines). This tool builds AGAINST the
// fork through go.work and never modifies it, so the console runs it instead, inside the same
// node container, with the same in-container API address (D-234).
//
// ═══ THE CONTRACT ═══
//
//   - every refusal happens BEFORE the first transaction: an empty list, an unparsable NodeID, a
//     node that is not a current primary validator, a validator whose remaining term is under the
//     24 h minimum — none of these leave a subnet on the P-Chain;
//   - after CreateSubnetTx, a failed AddSubnetValidatorTx is FATAL (the CLI tolerates it): the
//     contract is "exactly these", and the error names the orphaned subnet so it can be counted;
//   - output ends with `SUBNET_ID=` / `BLOCKCHAIN_ID=` lines, the same shape the console parses
//     from the CLI, plus `VALIDATORS=<n>`.
//
// `-mode l1` (ConvertSubnetToL1Tx, ACP-77) is reserved: the public network keeps classic subnets
// until H-2 is decided (D-233 §3). `apply` already holds the conversion code for the drill.
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/ava-labs/avalanchego/ids"
	"github.com/ava-labs/avalanchego/vms/platformvm/txs"
	"github.com/ava-labs/avalanchego/vms/secp256k1fx"
	"github.com/ava-labs/avalanchego/wallet/subnet/primary"
)

// minSubnetStakeSeconds mirrors the fork CLI: a subnet validation shorter than 24 h is refused by
// the P-Chain (MinStakeDuration), so a primary validator with less than that left cannot be added.
const minSubnetStakeSeconds = 24 * 3600

var chainNameRe = regexp.MustCompile(`^[A-Za-z0-9 ]{2,32}$`)

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}

func cmdCreate(args []string) error {
	fs := flag.NewFlagSet("create", flag.ExitOnError)
	mode := fs.String("mode", "classic", "classic = CreateSubnetTx + AddSubnetValidatorTx per named node + CreateChainTx; l1 (ConvertSubnetToL1Tx) is reserved until H-2")
	uri := fs.String("uri", "http://127.0.0.1:9650", "P-Chain API URI as seen from where this runs (inside a node container: that node's own API)")
	genesisPath := fs.String("genesis", "", "subnet-evm genesis file")
	name := fs.String("name", "", "chain name: letters, digits and spaces, 2-32 characters")
	validators := fs.String("validators", "", "comma-separated NodeIDs that validate the chain — exactly these")
	vmIDStr := fs.String("vm-id", "pkqXszJe86D3xLomib9bLpXPfW7gr7FPhDAbg46p5iNjrn4mf", "LOVE9EVM plugin VM id")
	weight := fs.Uint64("weight", 100, "validator weight")
	keyStr := fs.String("key", firstNonEmpty(os.Getenv("A1_CLI_KEY"), os.Getenv("K1_FUND_KEY")), "paying P-Chain key, PrivateKey-<cb58> (or env A1_CLI_KEY / K1_FUND_KEY)")
	timeout := fs.Duration("tx-timeout", 90*time.Second, "per-transaction timeout")
	fs.Parse(args)

	// ── refusals: nothing below this block has touched the P-Chain ──
	switch *mode {
	case "classic":
	case "l1":
		return errors.New("-mode l1 (ConvertSubnetToL1Tx, ACP-77) is reserved until H-2 decides it for the public network; use -mode classic")
	default:
		return fmt.Errorf("-mode %q: must be classic (or l1, reserved)", *mode)
	}
	if !chainNameRe.MatchString(*name) {
		return fmt.Errorf("-name %q: letters, digits and spaces only, 2-32 characters (the P-Chain refuses anything else AFTER the subnet exists)", *name)
	}
	if *genesisPath == "" {
		return errors.New("-genesis is required")
	}
	genesis, err := os.ReadFile(*genesisPath)
	if err != nil {
		return fmt.Errorf("genesis: %w", err)
	}
	if len(genesis) > 256*1024 {
		return fmt.Errorf("genesis is %d bytes; the P-Chain codec caps a transaction at 256 KiB, and the failure would come AFTER CreateSubnetTx (an orphaned subnet)", len(genesis))
	}
	vmID, err := ids.FromString(*vmIDStr)
	if err != nil {
		return fmt.Errorf("vm id: %w", err)
	}
	var nodeIDs []ids.NodeID
	seen := map[string]bool{}
	for _, raw := range strings.Split(*validators, ",") {
		raw = strings.TrimSpace(raw)
		if raw == "" {
			continue
		}
		if seen[raw] {
			return fmt.Errorf("-validators names %s twice", raw)
		}
		seen[raw] = true
		id, err := ids.NodeIDFromString(raw)
		if err != nil {
			return fmt.Errorf("-validators: %q is not a NodeID: %w", raw, err)
		}
		nodeIDs = append(nodeIDs, id)
	}
	if len(nodeIDs) == 0 {
		return errors.New("-validators is empty: a chain with no validators never finalises a block, and a subnet created now would be an orphan; refusing BEFORE CreateSubnetTx")
	}
	if *keyStr == "" {
		return errors.New("-key (or env A1_CLI_KEY / K1_FUND_KEY) is required: a PrivateKey-<cb58> holding LOVE9 on the P-Chain")
	}
	key, err := parseKey(*keyStr)
	if err != nil {
		return err
	}

	// Every named node must be a CURRENT primary validator with at least 24 h left: AddSubnetValidatorTx
	// is refused otherwise, and by then the subnet exists. Read the set once, decide, then spend.
	var cur struct {
		Validators []struct {
			NodeID  string `json:"nodeID"`
			EndTime string `json:"endTime"`
		} `json:"validators"`
	}
	if err := rpcCall(*uri+"/ext/bc/P", "platform.getCurrentValidators", map[string]any{}, &cur); err != nil {
		return fmt.Errorf("platform.getCurrentValidators on %s: %w", *uri, err)
	}
	endByNode := map[ids.NodeID]uint64{}
	for _, v := range cur.Validators {
		id, err := ids.NodeIDFromString(v.NodeID)
		if err != nil {
			continue
		}
		end, err := strconv.ParseUint(v.EndTime, 10, 64)
		if err != nil {
			continue
		}
		endByNode[id] = end
	}
	now := uint64(time.Now().Unix())
	ends := make([]uint64, len(nodeIDs))
	for i, id := range nodeIDs {
		primaryEnd, ok := endByNode[id]
		if !ok {
			return fmt.Errorf("%s is not a current validator of the primary network (a subnet validator must be one); refusing before CreateSubnetTx", id)
		}
		// One minute of slack: the P-Chain clock advances while we sign, and an end equal to the
		// primary term is rejected as touching the boundary (fork CLI, measured).
		end := primaryEnd - 60
		if end <= now+minSubnetStakeSeconds {
			return fmt.Errorf("%s has less than 24 h left on the primary network (ends %d); the P-Chain refuses a shorter subnet validation; refusing before CreateSubnetTx", id, primaryEnd)
		}
		ends[i] = end
	}

	// ── the transactions ──
	kc := secp256k1fx.NewKeychain(key)
	owner := &secp256k1fx.OutputOwners{Threshold: 1, Addrs: []ids.ShortID{key.Address()}}
	ctx, cancel := context.WithTimeout(context.Background(), *timeout)
	w, err := primary.MakePWallet(ctx, *uri, kc, primary.WalletConfig{})
	if err != nil {
		cancel()
		return fmt.Errorf("wallet on %s: %w", *uri, err)
	}
	t0 := time.Now()
	subnetTx, err := w.IssueCreateSubnetTx(owner)
	cancel()
	if err != nil {
		return fmt.Errorf("CreateSubnetTx: %w", err)
	}
	subnetID := subnetTx.ID()
	fmt.Printf("✓ subnet %s (%s)\n", subnetID, time.Since(t0).Round(time.Millisecond))

	ctx, cancel = context.WithTimeout(context.Background(), *timeout*time.Duration(len(nodeIDs)+1))
	defer cancel()
	w, err = primary.MakePWallet(ctx, *uri, kc, primary.WalletConfig{SubnetIDs: []ids.ID{subnetID}})
	if err != nil {
		return fmt.Errorf("wallet(subnet %s, now ORPHANED): %w", subnetID, err)
	}
	for i, id := range nodeIDs {
		if _, err := w.IssueAddSubnetValidatorTx(&txs.SubnetValidator{
			Validator: txs.Validator{NodeID: id, End: ends[i], Wght: *weight},
			Subnet:    subnetID,
		}); err != nil {
			// Exactly-these is the contract: stop, and name what exists so it can be counted.
			return fmt.Errorf("AddSubnetValidatorTx for %s (%d/%d registered; subnet %s is now ORPHANED, no chain created): %w", id, i, len(nodeIDs), subnetID, err)
		}
		fmt.Printf("✓ validator %s (weight %d, until %d)\n", id, *weight, ends[i])
	}

	t1 := time.Now()
	chainTx, err := w.IssueCreateChainTx(subnetID, genesis, vmID, nil, *name)
	if err != nil {
		return fmt.Errorf("CreateChainTx (subnet %s with %d validators exists, no chain): %w", subnetID, len(nodeIDs), err)
	}
	blockchainID := chainTx.ID()
	fmt.Printf("✓ chain %s (%s)\n", blockchainID, time.Since(t1).Round(time.Millisecond))
	fmt.Println("----------------------------------------------------------------")
	fmt.Printf("SUBNET_ID=%s\n", subnetID)
	fmt.Printf("BLOCKCHAIN_ID=%s\n", blockchainID)
	fmt.Printf("VALIDATORS=%d\n", len(nodeIDs))
	return nil
}
