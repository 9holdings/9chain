// c-to-x — move LOVE9 from the C-Chain to the X-Chain, the hop the faucet leaves you needing.
//
// ═══ WHY THIS EXISTS ═══
//
// Staking happens on P-Chain. `xp-wallet` (inside the fork) moves X<->P. But the FAUCET pays on
// the C-Chain — it is an EVM payout — so the person this project keeps promising "anyone can run a
// validator for 81 LOVE9" lands one hop earlier than any shipped tool can reach. Reported
// 2026-09-01 by an outside tester who lost the afternoon `docs/RUN-A-VALIDATOR.md` warns about,
// and measured here: `xp-wallet` exposes /api/info, /api/send-x, /api/x-to-p, /api/p-to-x and
// mentions the C-Chain zero times.
//
// ═══ 🔴 WHY IT IS NOT PART OF xp-wallet ═══
//
// `xp-wallet` lives INSIDE the fork tree and is carried by patches 0003, 0019 and 0021. Adding a
// route to it means regenerating the whole patch set, moving TREE_FORK, rebuilding the node image,
// shipping it to both machines, and changing the tree hash printed in README, CLAUDE.md and
// RUN-A-VALIDATOR — i.e. deliberately recreating the drift that S-1 just cost us. `local-net/tools/`
// exists for exactly this reason and already holds `stake-validator` and `vanity-keygen`;
// RUN-A-VALIDATOR states the rule out loud: a module outside the fork tree never changes the patch
// set you verified in Step 1.
//
// ═══ 🔴 IT MUST TALK TO YOUR OWN NODE ═══
//
// `https://rpc-a1.9chain.org/ext/bc/C/avax` answers 404 ON PURPOSE — the atomic C-Chain endpoint is
// closed to the internet (M11.10) while `/ext/bc/C/rpc` answers 200. That is a security boundary,
// not an outage, and it is not going to be widened. So the default URI here is your own node, and
// this tool CHECKS the endpoint before doing anything: pointed at the public RPC it would otherwise
// fail somewhere deep in the wallet with a message about UTXOs that says nothing about the cause.
//
// ═══ SAFETY ═══
//
// Default is DRY RUN: it resolves addresses, reads balances, prints both legs and issues nothing.
// `--issue` is the only way to spend, and CLAUDE.md §4 reserves that for a human.
//
// Usage:
//
//	go run . --key <file> --amount 90                     # dry run against 127.0.0.1:9650
//	go run . --key <file> --fund foundation --amount 90 --issue
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/ava-labs/avalanchego/ids"
	"github.com/ava-labs/avalanchego/utils/constants"
	"github.com/ava-labs/avalanchego/utils/crypto/secp256k1"
	"github.com/ava-labs/avalanchego/utils/formatting/address"
	"github.com/ava-labs/avalanchego/utils/units"
	"github.com/ava-labs/avalanchego/vms/secp256k1fx"
	"github.com/ava-labs/avalanchego/wallet/subnet/primary"
)

var (
	keyFile  = flag.String("key", "", "file holding the signing private key (a keys.txt block, or a bare PrivateKey-...)")
	fundName = flag.String("fund", "", "which [block] of a multi-fund keys.txt to use, e.g. foundation")
	apiURI   = flag.String("uri", "http://127.0.0.1:9650", "YOUR OWN node. The public RPC closes /ext/bc/C/avax on purpose (M11.10)")
	amount   = flag.Uint64("amount", 0, "whole LOVE9 to move from C-Chain to X-Chain")
	issue    = flag.Bool("issue", false, "actually sign and spend — without this the tool only reports")
	waitSec  = flag.Uint64("wait", 10, "seconds to wait between the export and the import")

	reKey = regexp.MustCompile(`PrivateKey-[1-9A-HJ-NP-Za-km-z]{40,}`)
)

func die(format string, a ...any) {
	fmt.Fprintf(os.Stderr, "🔴 "+format+"\n", a...)
	os.Exit(1)
}

// readKey lifts one private key out of a keys.txt block, or out of a bare file.
//
// Same shape as `stake-validator` on purpose: an operator who has used one should not have to
// learn a second convention for the same file.
func readKey(path, fund string) *secp256k1.PrivateKey {
	raw, err := os.ReadFile(path)
	if err != nil {
		die("cannot read %s: %v", path, err)
	}
	text := string(raw)
	if fund != "" {
		var block []string
		inBlock := false
		for _, ln := range strings.Split(text, "\n") {
			if strings.HasPrefix(strings.TrimSpace(ln), "["+fund+"]") {
				inBlock = true
				continue
			}
			if inBlock && strings.HasPrefix(strings.TrimSpace(ln), "[") {
				break
			}
			if inBlock {
				block = append(block, ln)
			}
		}
		if len(block) == 0 {
			die("no [%s] block in %s", fund, path)
		}
		text = strings.Join(block, "\n")
	}
	found := reKey.FindAllString(text, -1)
	if len(found) != 1 {
		die("expected exactly 1 private key, found %d — pass --fund to choose one", len(found))
	}
	// UnmarshalText wants the bare `PrivateKey-<cb58>`; quoting it fails the prefix check with a
	// message that points at the key rather than at the caller.
	var sk secp256k1.PrivateKey
	if err := sk.UnmarshalText([]byte(found[0])); err != nil {
		die("key does not parse: %v", err)
	}
	return &sk
}

func rpc(uri, path string, payload any) (map[string]any, int, error) {
	body, _ := json.Marshal(payload)
	resp, err := http.Post(uri+path, "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()
	var out map[string]any
	dec := json.NewDecoder(resp.Body)
	_ = dec.Decode(&out)
	return out, resp.StatusCode, nil
}

// 🔴 Refuse early, and refuse with the REASON.
//
// Pointed at the public RPC, everything below would fail inside the wallet with an error about
// UTXOs or a closed connection — a message that sends the reader looking at their key, their
// balance, or their network, none of which are wrong. The endpoint being absent is a deliberate
// boundary, so the tool says so in the one place the reader is standing.
func requireAtomicEndpoint(uri string) {
	_, status, err := rpc(uri, "/ext/bc/C/avax", map[string]any{
		"jsonrpc": "2.0", "id": 1, "method": "avax.getAtomicTxStatus", "params": map[string]any{},
	})
	if err != nil {
		die("cannot reach %s: %v\n   This tool needs YOUR OWN node — see --uri.", uri, err)
	}
	if status == http.StatusNotFound {
		die("%s/ext/bc/C/avax answers 404.\n"+
			"   That is DELIBERATE on the public RPC (M11.10): the atomic C-Chain endpoint is closed to\n"+
			"   the internet while /ext/bc/C/rpc stays open. It is a boundary, not an outage.\n"+
			"   Run this against your own node instead: --uri http://127.0.0.1:9650", uri)
	}
}

// cChainBalance reads the EVM balance, in wei. LOVE9 has 18 decimals on the C-Chain and 9 on X/P —
// mixing the two scales is the single easiest way to be wrong by a factor of a billion here.
func cChainBalance(uri, ethAddr string) *big.Int {
	out, _, err := rpc(uri, "/ext/bc/C/rpc", map[string]any{
		"jsonrpc": "2.0", "id": 1, "method": "eth_getBalance", "params": []any{ethAddr, "latest"},
	})
	if err != nil {
		return nil
	}
	hex, ok := out["result"].(string)
	if !ok {
		return nil
	}
	n := new(big.Int)
	n.SetString(strings.TrimPrefix(hex, "0x"), 16)
	return n
}

func main() {
	flag.Parse()
	if *keyFile == "" || *amount == 0 {
		flag.Usage()
		die("--key and --amount are both required")
	}

	requireAtomicEndpoint(*apiURI)

	sk := readKey(*keyFile, *fundName)
	kc := secp256k1fx.NewKeychain(sk)

	ctx := context.Background()
	w, err := primary.MakeWallet(ctx, *apiURI, kc, kc, primary.WalletConfig{})
	if err != nil {
		die("cannot build a wallet against %s: %v", *apiURI, err)
	}
	cw, xw := w.C(), w.X()

	xChainID := xw.Builder().Context().BlockchainID
	cChainID := cw.Builder().Context().BlockchainID

	// The X-Chain address is derived from the same key; `IssueImportTx` pays whoever we name, and
	// naming ourselves is the whole point — this is a move, not a transfer.
	shortAddr := sk.Address()
	hrp := constants.GetHRP(cw.Builder().Context().NetworkID)
	xAddr, err := address.Format("X", hrp, shortAddr[:])
	if err != nil {
		die("cannot format the X-Chain address: %v", err)
	}
	ethAddr := sk.EthAddress().Hex()

	nano := *amount * uint64(units.Avax) // whole LOVE9 -> nano, the unit atomic transfers use
	owner := &secp256k1fx.OutputOwners{
		Threshold: 1,
		Addrs:     []ids.ShortID{shortAddr},
	}

	fmt.Printf("\n══ C → X — %d LOVE9 ══\n\n", *amount)
	fmt.Printf("   node            %s\n", *apiURI)
	fmt.Printf("   from (C-Chain)  %s\n", ethAddr)
	fmt.Printf("   to   (X-Chain)  %s\n", xAddr)
	fmt.Printf("   C blockchainID  %s\n", cChainID)
	fmt.Printf("   X blockchainID  %s\n", xChainID)
	if bal := cChainBalance(*apiURI, ethAddr); bal != nil {
		// 18 decimals on C. Printed as whole LOVE9 plus the remainder so a balance that is nearly
		// but not quite enough cannot round itself into looking sufficient.
		whole := new(big.Int).Div(bal, big.NewInt(1e18))
		fmt.Printf("   C-Chain balance %s LOVE9  (%s wei)\n", whole, bal)
		need := new(big.Int).Mul(big.NewInt(int64(*amount)), big.NewInt(1e18))
		if bal.Cmp(need) < 0 {
			die("balance is short of %d LOVE9 — and fees come out of the same balance, on top", *amount)
		}
	} else {
		fmt.Printf("   C-Chain balance ⁇ could not be read — NOT treated as sufficient\n")
	}

	if !*issue {
		fmt.Printf("\n🟡 DRY RUN — nothing was signed and nothing was spent.\n")
		fmt.Printf("   Two transactions would be issued, in this order:\n")
		fmt.Printf("     1. C-Chain export  %d LOVE9 (%d nano) -> X-Chain %s\n", *amount, nano, xAddr)
		fmt.Printf("     2. X-Chain import  from C-Chain, to the same address\n")
		fmt.Printf("   🔴 They are TWO transactions. If the first lands and the second does not, the funds\n")
		fmt.Printf("      are in the X-Chain's shared memory, not lost — re-run with --issue and the import\n")
		fmt.Printf("      picks them up. Do NOT re-run the export to \"try again\".\n")
		fmt.Printf("   Add --issue to spend. That is a person's decision (CLAUDE.md §4).\n\n")
		return
	}

	fmt.Printf("\n── 1/2 · exporting from C-Chain ──\n")
	exportTx, err := cw.IssueExportTx(xChainID, []*secp256k1fx.TransferOutput{{
		Amt:          nano,
		OutputOwners: *owner,
	}})
	if err != nil {
		die("export failed: %v", err)
	}
	fmt.Printf("   ✓ export accepted: %s\n", exportTx.ID())

	fmt.Printf("── waiting %ds before the import ──\n", *waitSec)
	time.Sleep(time.Duration(*waitSec) * time.Second)

	fmt.Printf("── 2/2 · importing on X-Chain ──\n")
	importTx, err := xw.IssueImportTx(cChainID, owner)
	if err != nil {
		die("export LANDED but import failed: %v\n"+
			"   The funds are in shared memory, not lost. Re-run with --issue: the import consumes\n"+
			"   whatever is waiting. Do NOT re-run the export.", err)
	}
	fmt.Printf("   ✓ import accepted: %s\n", importTx.ID())

	fmt.Printf("\n✅ %d LOVE9 is on X-Chain at %s\n", *amount, xAddr)
	fmt.Printf("   🔴 Confirm on the chain, do not trust this line:\n")
	fmt.Printf("      avm.getBalance {\"address\":\"%s\",\"assetID\":\"LOVE9\"}\n", xAddr)
	fmt.Printf("   Then X -> P with xp-wallet, and only then stake.\n\n")
}
