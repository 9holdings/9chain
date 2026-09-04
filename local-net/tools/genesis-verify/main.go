// genesis-verify — run subnet-evm's OWN `Genesis.Verify()` over a genesis document, along the
// same sequence the VM runs it in.
//
// ═══ WHY THIS EXISTS ═══
//
// `local-net/lib/l1-options.mjs` carries `verifyFeeConfig`, a hand-written JavaScript PORT of
// `commontype.FeeConfig.Verify()`. The port runs before a P-Chain transaction is paid for, which
// is exactly where it belongs — but a port is not the law. Nothing measured whether the two still
// agreed, so the console's dry step was checking *the copy*, not the rule the node enforces.
//
// That is the project's most expensive error class (CLAUDE.md §2): every gate green because they
// all measure the same wrong quantity. Measured 2026-09-04, before this tool existed, the port was
// already behind: it does not implement `checkByteLens()` (fee_config.go:151), the last statement
// of the real `Verify()`.
//
// This program is not a second port. It compiles against the fork tree on disk and calls the real
// function, so "the law" and "what we check" cannot drift without a build.
//
// ═══ 🔴 VERIFY() IS NOT A PURE FUNCTION OF THE DOCUMENT ═══
//
// Calling `g.Verify()` on freshly unmarshalled JSON answers a DIFFERENT QUESTION than the node
// answers, and it answers it wrongly. Measured 2026-09-04 on the console's own template: the naive
// call returns `warp cannot be activated before Durango` for a genesis that has created ten live
// chains. Nothing is wrong with the genesis; the caller was wrong.
//
// The VM does four things first (`plugin/evm/vm.go:537-561`), and this tool does the same four:
//
//	1. `params.GetExtra(g.Config).SnowCtx` — the VM fills it; a standalone caller must.
//	2. `configExtra.SetDefaults(ctx.NetworkUpgrades)` — 🔴 THE ONE THAT BITES. A genesis carries no
//	   `durangoTimestamp`, so the config's own upgrade times are nil until this runs, and every
//	   `IsDurango(t)` is false. Warp's own Verify then refuses the template's timestamp — which is
//	   `1607144400`, and that number is not arbitrary: it IS `upgrade.InitiallyActiveTime`
//	   (2020-12-05 05:00Z), the earliest instant Durango can be active on any network (D-031).
//	3. `configExtra.UpgradeConfig` from upgrade bytes — the `upgrade.json` of P-61, if given.
//	4. `configExtra.Override(...)` when the upgrade bytes carry network-upgrade overrides.
//
// Skipping step 2 produces a red that is red for the WRONG REASON — the exact failure mode
// CLAUDE.md §3 names (D-106b). Any future edit here must keep this sequence aligned with vm.go.
//
// ═══ WHY THE NETWORK ID IS REQUIRED ═══
//
// Step 1 and 2 both need it, and it is not decoration: A1 owns its upgrade schedule (`upgrade.A1`,
// D-049) and `upgrade.GetConfig` hands it out BY RANGE, so an L1 on the live band and the same L1
// on the drill band can legitimately verify differently. Guessing here would reintroduce the very
// thing this tool is for, so it is a required flag with no default.
//
// ═══ HOW IT IS BUILT ═══
//
// The source lives in this repo; `scripts/check-genesis-verify.mjs` copies it into the fork module
// (`upstream/avalanchego/graft/subnet-evm/cmd/a1-genesis-verify/`) and builds it there inside the
// same `golang:1.25.10-bookworm` image `local-net/Dockerfile` uses — Windows has no cgo toolchain,
// and half of this dependency tree is cgo. Building inside the module means it inherits that
// module's go.mod and go.sum untouched: no dependency set of our own to drift. The gate removes
// the copy afterwards and asserts the fork tree hash is unchanged (hard rule 3).
//
// Usage:
//
//	genesis-verify -network-id 999999998 [-upgrade upgrade.json] < genesis.json
//
// Always exits 0 when it produced a verdict; the verdict is the JSON on stdout:
//
//	{"ok":true,"stage":"verify","networkId":999999998}
//	{"ok":false,"stage":"verify","error":"gas limit in fee config (…)","networkId":999999998}
//	{"ok":false,"stage":"unmarshal","error":"…"}         — the document is not a genesis at all
//	{"ok":false,"stage":"upgradeBytes","error":"…"}      — the upgrade.json is not parseable
//	{"ok":false,"stage":"panic","error":"…"}             — a nil the VM would have filled
//
// A non-zero exit means the TOOL failed (bad flag, unreadable stdin), never that the genesis
// failed. Keeping those apart matters: a broken tool must not read as a verdict (D-116).
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"

	"github.com/ava-labs/avalanchego/graft/subnet-evm/core"
	"github.com/ava-labs/avalanchego/graft/subnet-evm/params"
	"github.com/ava-labs/avalanchego/graft/subnet-evm/params/extras"
	"github.com/ava-labs/avalanchego/graft/subnet-evm/plugin/evm"
	"github.com/ava-labs/avalanchego/snow"
	"github.com/ava-labs/avalanchego/upgrade"
)

type verdict struct {
	OK        bool   `json:"ok"`
	Stage     string `json:"stage"`
	Error     string `json:"error,omitempty"`
	NetworkID uint32 `json:"networkId"`
}

func emit(v verdict) {
	out, err := json.Marshal(v)
	if err != nil {
		fmt.Fprintf(os.Stderr, "genesis-verify: cannot encode verdict: %v\n", err)
		os.Exit(2)
	}
	fmt.Println(string(out))
}

// fail reports a TOOL failure, never a verdict about the genesis.
func fail(format string, args ...any) {
	fmt.Fprintf(os.Stderr, "genesis-verify: "+format+"\n", args...)
	os.Exit(2)
}

func main() {
	// 🔴 The `extra` payloads subnet-evm hangs off libevm's types are registered by the VM at
	// start-up, not by the type definitions. Without this, `params.GetExtra` panics on a nil
	// accessor (config_extra.go:86) and a standalone caller reads that as "bad genesis" — it is
	// nothing of the sort. `RegisterAllLibEVMExtras` documents `package main` as an allowed
	// caller (plugin/evm/libevm.go:22); it must run exactly once, before anything touches a
	// ChainConfig, so it goes first.
	evm.RegisterAllLibEVMExtras()

	// Any panic below must come out as a VERDICT rather than a dead process: "the tool crashed"
	// and "the genesis is bad" are different answers, and a caller that cannot tell them apart
	// will eventually believe the wrong one (D-116). Deferred before the first thing that can
	// panic, not next to the one call being guarded.
	var currentID uint32
	defer func() {
		if r := recover(); r != nil {
			emit(verdict{OK: false, Stage: "panic", Error: fmt.Sprint(r), NetworkID: currentID})
		}
	}()

	networkID := flag.Uint("network-id", 0, "network id whose upgrade schedule Verify() should use (required)")
	upgradePath := flag.String("upgrade", "", "optional upgrade.json, applied the way the VM applies upgrade bytes")
	flag.Parse()
	if *networkID == 0 {
		fail("-network-id is required (see the comment at the top of this file)")
	}
	id := uint32(*networkID)
	currentID = id

	raw, err := io.ReadAll(os.Stdin)
	if err != nil {
		fail("cannot read stdin: %v", err)
	}
	var upgradeBytes []byte
	if *upgradePath != "" {
		upgradeBytes, err = os.ReadFile(*upgradePath)
		if err != nil {
			fail("cannot read -upgrade %s: %v", *upgradePath, err)
		}
	}

	var g core.Genesis
	if err := json.Unmarshal(raw, &g); err != nil {
		emit(verdict{OK: false, Stage: "unmarshal", Error: err.Error(), NetworkID: id})
		return
	}
	if g.Config == nil {
		emit(verdict{OK: false, Stage: "unmarshal", Error: "genesis has no `config` object", NetworkID: id})
		return
	}

	// ─── The VM's sequence, in the VM's order (vm.go:537-561) ───
	agoUpgrades := upgrade.GetConfig(id)
	configExtra := params.GetExtra(g.Config)
	configExtra.SnowCtx = &snow.Context{NetworkID: id, NetworkUpgrades: agoUpgrades}
	configExtra.SetDefaults(agoUpgrades)

	if len(upgradeBytes) > 0 {
		var upgradeConfig extras.UpgradeConfig
		if err := json.Unmarshal(upgradeBytes, &upgradeConfig); err != nil {
			emit(verdict{OK: false, Stage: "upgradeBytes", Error: err.Error(), NetworkID: id})
			return
		}
		configExtra.UpgradeConfig = upgradeConfig
	}
	if configExtra.UpgradeConfig.NetworkUpgradeOverrides != nil {
		configExtra.Override(configExtra.UpgradeConfig.NetworkUpgradeOverrides)
	}

	if err := g.Verify(); err != nil {
		emit(verdict{OK: false, Stage: "verify", Error: err.Error(), NetworkID: id})
		return
	}
	emit(verdict{OK: true, Stage: "verify", NetworkID: id})
}
