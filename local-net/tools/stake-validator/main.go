// stake-validator — register an EXTERNAL node as a validator of the 9Chain-A1 primary network.
//
// ═══ WHY THIS EXISTS ═══
//
// `xp-wallet` (patch 0019) can send on X, and move X<->P. It cannot stake. Until a node can be
// staked from outside, "an outsider can run a validator" stays a claim rather than a measurement
// — and this repo does not accept claims (D-118c closed the networking half of that).
//
// ═══ WHAT IT DOES NOT NEED ═══
//
// 🔴 It never touches the validator's BLS SECRET key. `AddPermissionlessValidatorTx` carries a
// proof of possession, and that proof is already published by the node itself through
// `info.getNodeID`. So the secret stays on the validator machine and only the public half
// travels. A tool that asked for the secret would be asking for the wrong thing.
//
// ═══ SAFETY ═══
//
// Default is DRY RUN. It prints every field of the transaction, checks the balance, and issues
// nothing. `--issue` is the only way to spend, and CLAUDE.md §4 reserves that for a human:
// this spends real money on a public network.
//
// Usage:
//
//	go run . --key <file> --fund foundation --node-rpc http://.../ext/info
//	go run . --key <file> --fund foundation --node-rpc ... --issue
package main

import (
	"bytes"
	"context"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/ava-labs/avalanchego/ids"
	"github.com/ava-labs/avalanchego/utils/crypto/bls"
	"github.com/ava-labs/avalanchego/utils/formatting/address"
	"github.com/ava-labs/avalanchego/utils/crypto/secp256k1"
	"github.com/ava-labs/avalanchego/utils/units"
	"github.com/ava-labs/avalanchego/vms/platformvm/signer"
	"github.com/ava-labs/avalanchego/vms/platformvm/txs"
	"github.com/ava-labs/avalanchego/vms/secp256k1fx"
	"github.com/ava-labs/avalanchego/wallet/subnet/primary"
)

var (
	keyFile   = flag.String("key", "", "file holding the signing private key (keys.txt block or a bare PrivateKey-...)")
	fundName  = flag.String("fund", "", "which [block] of a multi-fund keys.txt to use, e.g. foundation")
	nodeRPC     = flag.String("node-rpc", "", "info endpoint of the node being staked, e.g. http://127.0.0.1:9655/ext/info")
	nodeHostHdr = flag.String("node-host-header", "localhost", "Host header to send to the node (its --http-allowed-hosts default is localhost)")
	apiURI    = flag.String("uri", "https://rpc-a1.9chain.org", "9Chain-A1 public API endpoint")
	stakeAmt  = flag.Uint64("stake", 25_000, "stake in whole LOVE9")
	days      = flag.Uint64("days", 14, "validation period in days")
	delegFee  = flag.Uint("delegation-fee", 20_000, "delegation fee, parts per million (20000 = 2%)")
	doIssue   = flag.Bool("issue", false, "actually sign and issue - spends real money")
	reNodeKey = regexp.MustCompile(`PrivateKey-[1-9A-HJ-NP-Za-km-z]{40,}`)
)

// nodeIdentity is the part of info.getNodeID we need: who the node is, and its proof that it
// owns the BLS key it claims.
type nodeIdentity struct {
	NodeID string `json:"nodeID"`
	POP    struct {
		PublicKey         string `json:"publicKey"`
		ProofOfPossession string `json:"proofOfPossession"`
	} `json:"nodePOP"`
}

func die(format string, a ...any) {
	fmt.Fprintf(os.Stderr, "\n🔴 "+format+"\n", a...)
	os.Exit(1)
}

// readKey pulls one private key out of the file. A keys.txt holding all six funds is the normal
// case, and picking the first block silently would sign with the wrong fund - so a multi-key
// file without --fund is a hard stop, not a default. (Same rule as wallet-tunnel/enter.sh.)
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
	found := reNodeKey.FindAllString(text, -1)
	if len(found) != 1 {
		die("expected exactly 1 private key, found %d - pass --fund to choose one", len(found))
	}
	// UnmarshalText wants the bare `PrivateKey-<cb58>` string - no surrounding quotes. Quoting it
	// makes the prefix check fail with "missing PrivateKey- prefix", which points at the key
	// rather than at the caller.
	var sk secp256k1.PrivateKey
	if err := sk.UnmarshalText([]byte(found[0])); err != nil {
		die("key does not parse: %v", err)
	}
	return &sk
}

// fetchIdentity asks the node who it is. Typing a NodeID by hand is how you stake a machine that
// is not the one you meant.
func fetchIdentity(endpoint string) nodeIdentity {
	body := []byte(`{"jsonrpc":"2.0","id":1,"method":"info.getNodeID","params":{}}`)
	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		die("bad --node-rpc %q: %v", endpoint, err)
	}
	req.Header.Set("Content-Type", "application/json")
	// 🔴 avalanchego defaults `--http-allowed-hosts` to ["localhost"] as DNS-rebinding
	// protection. Reaching the node through an SSH tunnel or a container gateway means the Host
	// header says something else, and the node answers with PLAIN TEXT ("invalid host...") -
	// which surfaces as a JSON parse error about the letter 'i' and reads like a broken node
	// rather than a working gate. Send the Host the node expects instead of widening the gate.
	req.Host = *nodeHostHdr
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		die("cannot reach the node at %s: %v", endpoint, err)
	}
	defer resp.Body.Close()
	var out struct {
		Result nodeIdentity `json:"result"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		die("node replied with something that is not getNodeID (%v) - if it is plain text, check --node-host-header", err)
	}
	if out.Result.NodeID == "" || out.Result.POP.PublicKey == "" {
		die("node did not report a NodeID with a BLS proof of possession")
	}
	return out.Result
}

func mustHex(s string, want int, what string) []byte {
	b, err := hex.DecodeString(strings.TrimPrefix(s, "0x"))
	if err != nil {
		die("%s is not hex: %v", what, err)
	}
	if len(b) != want {
		die("%s is %d bytes, expected %d", what, len(b), want)
	}
	return b
}

func main() {
	flag.Parse()
	if *keyFile == "" || *nodeRPC == "" {
		fmt.Fprintln(os.Stderr, "usage: stake-validator --key <file> [--fund name] --node-rpc <url> [--issue]")
		os.Exit(2)
	}

	id := fetchIdentity(*nodeRPC)
	nodeID, err := ids.NodeIDFromString(id.NodeID)
	if err != nil {
		die("node reported an unparseable NodeID %q: %v", id.NodeID, err)
	}

	// Rebuild the proof of possession from the two public halves the node published. Verify it
	// here rather than letting the network reject the transaction later: a local failure costs
	// nothing, a rejected transaction costs a fee and a confusing error.
	pop := &signer.ProofOfPossession{}
	copy(pop.PublicKey[:], mustHex(id.POP.PublicKey, bls.PublicKeyLen, "BLS public key"))
	copy(pop.ProofOfPossession[:], mustHex(id.POP.ProofOfPossession, bls.SignatureLen, "proof of possession"))
	if err := pop.Verify(); err != nil {
		die("the node's proof of possession does not verify: %v", err)
	}

	sk := readKey(*keyFile, *fundName)
	addr := sk.Address()
	kc := secp256k1fx.NewKeychain(sk)

	ctx := context.Background()
	// 🔴 MakePWallet, not MakeWallet. The full wallet also fetches C-chain state from
	// `/ext/bc/C/avax`, and that endpoint answers 404 on the public RPC **on purpose** - it is
	// one of the two real gates M11.10 established, and widening it to make a tool convenient
	// would be trading a security boundary for a shortcut. Staking only needs the P-chain.
	p, err := primary.MakePWallet(ctx, *apiURI, kc, primary.WalletConfig{})
	if err != nil {
		die("cannot open the P-chain wallet against %s: %v", *apiURI, err)
	}

	stakeNano := *stakeAmt * uint64(units.Avax) // A1 keeps 9 decimals on P/X, like upstream
	start := uint64(time.Now().Add(30 * time.Second).Unix())
	end := start + *days*24*60*60

	owner := &secp256k1fx.OutputOwners{
		Threshold: 1,
		Addrs:     []ids.ShortID{addr},
	}
	vdr := &txs.SubnetValidator{
		Validator: txs.Validator{
			NodeID: nodeID,
			Start:  start,
			End:    end,
			Wght:   stakeNano,
		},
		Subnet: ids.Empty, // primary network
	}

	fmt.Println("\n══ STAKE A VALIDATOR — 9Chain-A1 primary network ══")
	fmt.Printf("  API             : %s\n", *apiURI)
	fmt.Printf("  node being staked: %s\n", nodeID)
	fmt.Printf("  BLS proof        : verified locally ✓\n")
	fmt.Printf("  paying fund      : %s  (P-chain address %s)\n", orDash(*fundName), addr)
	fmt.Printf("  stake            : %d LOVE9  (%d nano)\n", *stakeAmt, stakeNano)
	fmt.Printf("  period           : %d days   (%s → %s UTC)\n", *days,
		time.Unix(int64(start), 0).UTC().Format("2006-01-02 15:04"),
		time.Unix(int64(end), 0).UTC().Format("2006-01-02 15:04"))
	fmt.Printf("  delegation fee   : %.2f%%\n", float64(*delegFee)/10_000)
	fmt.Printf("  rewards to       : the paying fund\n")

	// 🔴 A dry run that only prints intentions is a dry run that lies. The Foundation fund holds
	// its LOVE9 on the X-chain and **zero** on P (measured 2026-08-29), so a staking transaction
	// would fail for lack of UTXOs after the operator had already decided to spend. Say it here,
	// while it is still free to find out.
	pAddr, err := address.Format("P", hrpFor(*apiURI), addr.Bytes())
	if err == nil {
		if bal, err := pBalance(*apiURI, pAddr); err == nil {
			fmt.Printf("  P-chain balance  : %d LOVE9 unlocked  (%s)\n", bal/uint64(units.Avax), pAddr)
			if bal < stakeNano {
				fmt.Printf("\n🔴 NOT ENOUGH ON P — need %d LOVE9, have %d.\n", *stakeAmt, bal/uint64(units.Avax))
				fmt.Println("   This fund holds its balance on the X-chain. Move it across first")
				fmt.Println("   (xp-wallet X→P, patch 0019), then run this again.")
				if *doIssue {
					die("refusing to issue a transaction that cannot succeed")
				}
			}
		} else {
			fmt.Printf("  P-chain balance  : 🟡 could not measure (%v) — not the same as zero\n", err)
		}
	}

	if !*doIssue {
		fmt.Println("\n🟡 DRY RUN — nothing was issued.")
		fmt.Println("   Re-run with --issue to sign and spend. That is a human decision (CLAUDE.md §4).")
		return
	}

	fmt.Println("\n… issuing AddPermissionlessValidatorTx")
	tx, err := p.IssueAddPermissionlessValidatorTx(
		vdr, pop, p.Builder().Context().AVAXAssetID,
		owner, owner, uint32(*delegFee),
	)
	if err != nil {
		die("transaction rejected: %v", err)
	}
	fmt.Printf("\n✅ issued — txID %s\n", tx.ID())
	fmt.Println("   Confirm on the RUNNING network, not from this output:")
	fmt.Printf("   platform.getCurrentValidators must now list %s\n", nodeID)
}

// hrpFor picks the bech32 human-readable part. A1 uses `love9` on its own networks; anything
// else is not this chain, and printing an address with the wrong HRP would look plausible and be
// useless.
func hrpFor(string) string { return "love9" }

// pBalance asks the chain what the address actually holds, rather than trusting a file.
func pBalance(uri, pAddr string) (uint64, error) {
	body := fmt.Sprintf(`{"jsonrpc":"2.0","id":1,"method":"platform.getBalance","params":{"addresses":["%s"]}}`, pAddr)
	req, err := http.NewRequest(http.MethodPost, uri+"/ext/bc/P", strings.NewReader(body))
	if err != nil {
		return 0, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Host = "localhost"
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()
	var out struct {
		Result struct {
			Unlocked json.Number `json:"unlocked"`
		} `json:"result"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return 0, err
	}
	var v uint64
	if _, err := fmt.Sscan(out.Result.Unlocked.String(), &v); err != nil {
		return 0, fmt.Errorf("balance not a number: %q", out.Result.Unlocked)
	}
	return v, nil
}

func orDash(s string) string {
	if s == "" {
		return "(single-key file)"
	}
	return s
}
