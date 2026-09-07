// pump_ledger.go — `l1-batch pump -ledger …`: load on CONSOLE-created chains, one heartbeat file
// per chain (P-87, D-240).
//
// `pump` was written for K1 ledgers (plan.json holds a pump key per ledger). Chains the console
// creates have no such key: their genesis gives the OWNER (A1_L1_ADMIN) the initial supply. On the
// drill band that owner is the netgen foundation key — the same secp256k1 key that pays on the
// P-Chain, whose EVM address is the owner of every drill chain. So this mode signs with ONE key
// for every chain in the ledger, through the router (or any RPC base that serves them all).
//
// The nonce is LOCAL per chain and resynced only on a "nonce" error: syncing from `latest` on
// every send is the trap that killed a wallet for 260 s on one RPC hiccup (a1-bay-lech-nonce).
//
// Heartbeat: `<dir>/heartbeat-<chainId>.json` every 5 s and once more on exit with
// `running:false`. The gate (`scripts/check-chains-producing.mjs`) reads `targetRate` from it and
// judges the CHAIN (blocks and included transactions), never this file's own counters — "sent" is
// this tool's capability, not the chain's.
package main

import (
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/ava-labs/libevm/core/types"
	"github.com/ava-labs/libevm/crypto"
)

type consoleLedger struct {
	Chains []struct {
		Name         string `json:"name"`
		ChainID      uint64 `json:"chainId"`
		BlockchainID string `json:"blockchainID"`
	} `json:"chains"`
}

type heartbeat struct {
	ChainID       uint64  `json:"chainId"`
	Name          string  `json:"name"`
	BlockchainID  string  `json:"blockchainID"`
	Running       bool    `json:"running"`
	StartedAt     string  `json:"startedAt"`
	UpdatedAt     string  `json:"updatedAt"`
	TargetRate    float64 `json:"targetRate"`
	Sent          int     `json:"sent"`
	Failed        int     `json:"failed"`
	LastError     string  `json:"lastError,omitempty"`
	HeadBlock     uint64  `json:"headBlock"`
	HeadTimestamp uint64  `json:"headTimestamp"`
	From          string  `json:"from"`
}

func writeHeartbeat(dir string, hb heartbeat) {
	if dir == "" {
		return
	}
	hb.UpdatedAt = time.Now().UTC().Format(time.RFC3339)
	b, _ := json.MarshalIndent(hb, "", "  ")
	tmp := filepath.Join(dir, fmt.Sprintf(".heartbeat-%d.json.tmp", hb.ChainID))
	if err := os.WriteFile(tmp, append(b, '\n'), 0o644); err == nil {
		_ = os.Rename(tmp, filepath.Join(dir, fmt.Sprintf("heartbeat-%d.json", hb.ChainID)))
	}
}

func ethHead(url string) (uint64, uint64, error) {
	var blk struct {
		Number    string `json:"number"`
		Timestamp string `json:"timestamp"`
	}
	if err := rpcCall(url, "eth_getBlockByNumber", []any{"latest", false}, &blk); err != nil {
		return 0, 0, err
	}
	n, ok1 := new(big.Int).SetString(strings.TrimPrefix(blk.Number, "0x"), 16)
	t, ok2 := new(big.Int).SetString(strings.TrimPrefix(blk.Timestamp, "0x"), 16)
	if !ok1 || !ok2 {
		return 0, 0, errors.New("eth_getBlockByNumber answered without number/timestamp")
	}
	return n.Uint64(), t.Uint64(), nil
}

// pumpLedger sends `rate` tx/s to every live chain in a console ledger with one key, via rpcBase.
func pumpLedger(ledgerPath, rpcBase, keyStr string, rate float64, seconds int, only map[string]bool, heartbeatDir string) error {
	if keyStr == "" {
		return errors.New("-key (or env A1_CLI_KEY / K1_FUND_KEY) is required: the EVM owner of the chains")
	}
	key, err := parseKey(keyStr)
	if err != nil {
		return err
	}
	ecdsaKey, err := crypto.ToECDSA(key.Bytes())
	if err != nil {
		return err
	}
	from := crypto.PubkeyToAddress(ecdsaKey.PublicKey)
	b, err := os.ReadFile(ledgerPath)
	if err != nil {
		return err
	}
	var ledger consoleLedger
	if err := json.Unmarshal(b, &ledger); err != nil {
		return fmt.Errorf("ledger: %w", err)
	}
	if heartbeatDir != "" {
		if err := os.MkdirAll(heartbeatDir, 0o755); err != nil {
			return err
		}
	}
	rpcBase = strings.TrimRight(rpcBase, "/")
	deadline := time.Now().Add(time.Duration(seconds) * time.Second)
	started := time.Now().UTC().Format(time.RFC3339)
	var wg sync.WaitGroup
	var mu sync.Mutex
	results := map[string]heartbeat{}
	fmt.Printf("pump: %d chain(s) in %s, from %s via %s, %.2f tx/s each for %ds\n", len(ledger.Chains), ledgerPath, from.Hex(), rpcBase, rate, seconds)
	for _, c := range ledger.Chains {
		if len(only) > 0 && !only[c.Name] {
			continue
		}
		wg.Add(1)
		go func(name string, chainID uint64, bc string) {
			defer wg.Done()
			url := rpcBase + "/ext/bc/" + bc + "/rpc"
			hb := heartbeat{ChainID: chainID, Name: name, BlockchainID: bc, Running: true, StartedAt: started, TargetRate: rate, From: from.Hex()}
			finish := func() {
				hb.Running = false
				if n, t, err := ethHead(url); err == nil {
					hb.HeadBlock, hb.HeadTimestamp = n, t
				}
				writeHeartbeat(heartbeatDir, hb)
				mu.Lock()
				results[name] = hb
				mu.Unlock()
			}
			var bal string
			if err := rpcCall(url, "eth_getBalance", []any{from.Hex(), "latest"}, &bal); err != nil || bal == "0x0" {
				hb.LastError = fmt.Sprintf("balance of %s on %s: %v (%s) — this key does not own the chain, or the RPC does not serve it", from.Hex(), name, err, bal)
				finish()
				return
			}
			nonce, err := ethNonce(url, from)
			if err != nil {
				hb.LastError = "nonce: " + err.Error()
				finish()
				return
			}
			signer := types.LatestSignerForChainID(new(big.Int).SetUint64(chainID))
			tick := time.NewTicker(time.Duration(float64(time.Second) / rate))
			defer tick.Stop()
			pulse := time.NewTicker(5 * time.Second)
			defer pulse.Stop()
			writeHeartbeat(heartbeatDir, hb)
			for time.Now().Before(deadline) {
				select {
				case <-pulse.C:
					if n, t, err := ethHead(url); err == nil {
						hb.HeadBlock, hb.HeadTimestamp = n, t
					}
					writeHeartbeat(heartbeatDir, hb)
				case <-tick.C:
					tx := types.NewTx(&types.LegacyTx{Nonce: nonce, GasPrice: big.NewInt(50_000_000_000), Gas: 21000, To: &from, Value: big.NewInt(1)})
					signed, err := types.SignTx(tx, signer, ecdsaKey)
					if err != nil {
						hb.Failed++
						hb.LastError = err.Error()
						continue
					}
					raw, _ := signed.MarshalBinary()
					var txHash string
					if err := rpcCall(url, "eth_sendRawTransaction", []any{"0x" + hex.EncodeToString(raw)}, &txHash); err != nil {
						hb.Failed++
						hb.LastError = err.Error()
						if strings.Contains(err.Error(), "nonce") {
							if n, e := ethNonce(url, from); e == nil {
								nonce = n
							}
						}
						continue
					}
					hb.Sent++
					nonce++
				}
			}
			finish()
		}(c.Name, c.ChainID, c.BlockchainID)
	}
	wg.Wait()
	total, totalFailed := 0, 0
	for _, c := range ledger.Chains {
		hb, ok := results[c.Name]
		if !ok {
			continue
		}
		total += hb.Sent
		totalFailed += hb.Failed
		fmt.Printf("%-20s sent %5d failed %4d head %6d %s\n", c.Name, hb.Sent, hb.Failed, hb.HeadBlock, hb.LastError)
	}
	fmt.Printf("pump: %d tx sent, %d failed, over %ds at %.2f tx/s/chain\n", total, totalFailed, seconds, rate)
	return nil
}
