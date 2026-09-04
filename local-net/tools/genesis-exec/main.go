// genesis-exec — build the genesis state and RUN CALLS AGAINST IT in subnet-evm's own EVM.
//
// ═══ WHY THIS EXISTS ═══
//
// The genesis contract library (P-59) puts contract CODE into `alloc`. Everything that can go
// wrong with that is invisible to every check a JSON document can support:
//
//   · creation bytecode installed instead of runtime bytecode — the account holds a deployment
//     script nobody can ever run;
//   · a `constant` the compiler inlined pointing at an address the genesis does not actually use —
//     TokenFactory clones proxies in front of nothing, and the transaction SUCCEEDS;
//   · an unlinked library placeholder sitting in the code as ASCII;
//   · a contract that is simply wrong.
//
// None of it shows up in `Genesis.Verify()`, in a hash, or in a byte count. The only question that
// settles it is "does the thing work from block zero", and the only honest way to ask is to run it.
// A genesis is IMMUTABLE and each chain born from it holds one of fifteen permanent slots, so the
// answer has to arrive before anything is paid for — which means running it here, in the same EVM
// the node runs, and not on a chain.
//
// ═══ WHAT IT IS NOT ═══
//
// Not a node. There is no consensus, no mempool, no block production: one in-memory state built
// from `alloc`, and calls executed against it in sequence so that a later call sees what an earlier
// one wrote. That is enough to answer "does the library work" and nothing more, and it is stated
// here so nobody mistakes a green run for a live-network measurement.
//
// ═══ INPUT / OUTPUT ═══
//
// stdin: {"genesis": {…}, "calls": [{"label","from","to","data","value"}]}
// stdout: one JSON verdict per line, plus a final {"done":true}
//
//	{"label":"…","ok":true,"ret":"0x…","gasUsed":21000}
//	{"label":"…","ok":false,"error":"execution reverted","ret":"0x…"}
//
// `-network-id` is required for the same reason as in genesis-verify: A1 owns its upgrade schedule
// and `upgrade.GetConfig` hands it out by range, so which opcodes exist is a function of the id.
//
// Exit 0 whenever verdicts were produced — a call that reverts is an ANSWER, not a tool failure.
// Non-zero means the tool could not run at all. Keeping those apart is D-116.
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"os"
	"strconv"
	"time"

	"github.com/ava-labs/avalanchego/graft/subnet-evm/core"
	"github.com/ava-labs/avalanchego/graft/subnet-evm/core/vm/runtime"
	"github.com/ava-labs/avalanchego/graft/subnet-evm/params"
	"github.com/ava-labs/avalanchego/graft/subnet-evm/plugin/evm"
	"github.com/ava-labs/avalanchego/snow"
	"github.com/ava-labs/avalanchego/upgrade"
	"github.com/ava-labs/libevm/common"
	"github.com/ava-labs/libevm/core/rawdb"
	"github.com/ava-labs/libevm/core/state"
	"github.com/ava-labs/libevm/triedb"
	"github.com/holiman/uint256"

	"flag"
)

type callSpec struct {
	Label string `json:"label"`
	From  string `json:"from"`
	To    string `json:"to"`
	Data  string `json:"data"`
	Value string `json:"value"`
}

type input struct {
	Genesis json.RawMessage `json:"genesis"`
	Calls   []callSpec      `json:"calls"`
}

type verdict struct {
	Label   string `json:"label"`
	OK      bool   `json:"ok"`
	Ret     string `json:"ret,omitempty"`
	GasUsed uint64 `json:"gasUsed,omitempty"`
	Error   string `json:"error,omitempty"`
}

func emit(v any) {
	out, err := json.Marshal(v)
	if err != nil {
		fmt.Fprintf(os.Stderr, "genesis-exec: cannot encode: %v\n", err)
		os.Exit(2)
	}
	fmt.Println(string(out))
}

func fail(format string, args ...any) {
	fmt.Fprintf(os.Stderr, "genesis-exec: "+format+"\n", args...)
	os.Exit(2)
}

func main() {
	// Same reason as genesis-verify: subnet-evm's `extra` payloads are registered by the VM at
	// start-up, not by the type definitions, and `package main` is a documented caller.
	evm.RegisterAllLibEVMExtras()

	networkID := flag.Uint("network-id", 0, "network id whose upgrade schedule applies (required)")
	gasLimit := flag.Uint64("gas", 12_000_000, "gas limit for each call")
	// 🔴 The block time decides WHICH OPCODES EXIST, and getting it wrong looks like a broken
	// contract. Measured while building this: with `genesis.Timestamp + 1` — i.e. 1970, because a
	// genesis carries timestamp 0 — every call died with `invalid opcode: PUSH0`. Nothing was wrong
	// with the contracts; Shanghai simply was not active yet at that instant, and solc 0.8.26 emits
	// PUSH0. A real chain's first block carries a real 20xx timestamp, long past every activation,
	// so the default here is NOW. Same shape as the Warp/Durango trap in genesis-verify: a rule set
	// is a function of time, and the harness has to sit where the chain sits.
	blockTime := flag.Uint64("time", 0, "block timestamp for the calls (default: now)")
	flag.Parse()
	if *networkID == 0 {
		fail("-network-id is required")
	}
	id := uint32(*networkID)

	raw, err := io.ReadAll(os.Stdin)
	if err != nil {
		fail("cannot read stdin: %v", err)
	}
	var in input
	if err := json.Unmarshal(raw, &in); err != nil {
		fail("stdin is not the expected {genesis, calls} object: %v", err)
	}

	var g core.Genesis
	if err := json.Unmarshal(in.Genesis, &g); err != nil {
		fail("the `genesis` field is not a genesis: %v", err)
	}
	if g.Config == nil {
		fail("the genesis has no `config` object")
	}

	// The VM's own preparation, exactly as in genesis-verify. Without SetDefaults the chain config
	// has no upgrade timestamps and the EVM would run under the wrong rule set — a call could fail
	// for a reason that has nothing to do with the contract.
	agoUpgrades := upgrade.GetConfig(id)
	cfgExtra := params.GetExtra(g.Config)
	cfgExtra.SnowCtx = &snow.Context{NetworkID: id, NetworkUpgrades: agoUpgrades}
	cfgExtra.SetDefaults(agoUpgrades)
	if err := params.SetEthUpgrades(g.Config); err != nil {
		fail("setting eth upgrades: %v", err)
	}

	db := rawdb.NewMemoryDatabase()
	block, err := g.Commit(db, triedb.NewDatabase(db, triedb.HashDefaults))
	if err != nil {
		fail("could not commit the genesis state: %v", err)
	}
	statedb, err := state.New(block.Root(), state.NewDatabase(db), nil)
	if err != nil {
		fail("could not open the genesis state: %v", err)
	}

	// One shared state across the calls, so `createToken` then `balanceOf` is a sequence and not
	// two independent questions. Block number 1: genesis itself is block 0, and a contract asking
	// for `blockhash(block.number - 1)` must not underflow.
	when := *blockTime
	if when == 0 {
		when = uint64(time.Now().Unix())
	}
	base := &runtime.Config{
		ChainConfig: g.Config,
		State:       statedb,
		BlockNumber: big.NewInt(1),
		Time:        when,
		GasLimit:    *gasLimit,
		GasPrice:    big.NewInt(0),
		BaseFee:     big.NewInt(0),
		Difficulty:  big.NewInt(0),
	}

	for _, c := range in.Calls {
		if !common.IsHexAddress(c.To) {
			emit(verdict{Label: c.Label, OK: false, Error: fmt.Sprintf("`to` is not an address: %q", c.To)})
			continue
		}
		value := new(big.Int)
		if c.Value != "" {
			if _, ok := value.SetString(c.Value, 10); !ok {
				emit(verdict{Label: c.Label, OK: false, Error: fmt.Sprintf("`value` is not a decimal integer: %q", c.Value)})
				continue
			}
		}
		data, err := decodeHex(c.Data)
		if err != nil {
			emit(verdict{Label: c.Label, OK: false, Error: fmt.Sprintf("`data` is not hex: %v", err)})
			continue
		}
		cfg := *base
		cfg.Value = value
		if c.From != "" {
			if !common.IsHexAddress(c.From) {
				emit(verdict{Label: c.Label, OK: false, Error: fmt.Sprintf("`from` is not an address: %q", c.From)})
				continue
			}
			cfg.Origin = common.HexToAddress(c.From)
		}
		// The sender must be able to pay for the gas the EVM charges up front.
		statedb.SetBalance(cfg.Origin, richEnough())

		ret, gasLeft, callErr := runtime.Call(common.HexToAddress(c.To), data, &cfg)
		v := verdict{Label: c.Label, OK: callErr == nil, Ret: "0x" + common.Bytes2Hex(ret), GasUsed: *gasLimit - gasLeft}
		if callErr != nil {
			// The revert payload is kept: a custom error's selector is often the only thing that
			// says WHICH rule refused, and "it reverted" is not an answer anyone can act on.
			v.Error = callErr.Error()
		}
		emit(v)
	}
	emit(map[string]any{"done": true, "networkId": id, "stateRoot": block.Root().Hex(), "blockTime": when})
}

func decodeHex(s string) ([]byte, error) {
	if s == "" {
		return nil, nil
	}
	if len(s) >= 2 && (s[:2] == "0x" || s[:2] == "0X") {
		s = s[2:]
	}
	if len(s)%2 != 0 {
		return nil, fmt.Errorf("odd number of hex digits (%d)", len(s))
	}
	for i := 0; i < len(s); i++ {
		if _, err := strconv.ParseUint(string(s[i]), 16, 8); err != nil {
			return nil, fmt.Errorf("%q is not a hex digit", s[i])
		}
	}
	return common.Hex2Bytes(s), nil
}

// A balance large enough that no call here fails for lack of funds. This is a harness, not a chain:
// making the sender rich removes a variable rather than hiding one, and any control that cares
// about balances is asking about a TOKEN balance, which this never touches.
func richEnough() *uint256.Int {
	return new(uint256.Int).Lsh(uint256.NewInt(1), 100)
}
