# K1 · phase-0 kit on the drill band — tools and runbook

Prepared for `PLAN-K1-1000-LEDGERS-DEPLOY-2026-09-05.md` §7 (that plan and `PROCUREMENT-K1-2026-09-05.md`
live in `docs/` on the `web-home` worktree until WT-1 merges them here). Everything in this directory runs on
the **g1 drill band** (`networkID 899999998`, name `9chain-a1-tap-g1`, C-Chain chainId **9000000909** — not the
real number), on the dev machine, for **€0**, and touches nothing in `local-net/net*` or the public network.

> **Provenance (D-233 / P-80):** this kit was written on the `web-home` worktree as `docs/k1-phase0/` because
> the ownership table only lets that branch write `web/**` and shared paths. Its correct home is here,
> `local-net/tools/k1/` on `main`. The Go sources, shell scripts and JSON are byte-identical to the
> `web-home` copy; only `go.work` and `scripts/l1.sh` changed, and only their path lines. The measured
> evidence of the first run is `docs/k1-phase0/EVIDENCE-2026-09-05.md` (a record, kept verbatim).

## Layout

```
local-net/tools/k1/
  go.work                  workspace pointing at the fork (read, never modify the fork)
  l1-batch/                Go tool: plan · apply · render · status · pump · fund · topup ·
                           keygen · workers · compose · router · measure
  config/                  mounted at /9chain-a1/config on every node
    l1-evm-genesis.json      genesis template (copied from 9chain-a1-config, static fields only)
    chains/<blockchainID>/config.json   written by render: small caches, warp API on
    subnets/<subnetID>.json             written by render: snow k = 1
  hosts/                   cloud-init, host bootstrap/accept scripts, inventory examples (K1 fleet)
  scripts/                 up · down · l1 (runs the tool in a container) · fund-key · 10–14 measurements ·
                           push-host · hosts-run
  out/  (gitignored)       net/ (netgen output) · plan/ (plan.json, chains.jsonl, compose override) · l1-batch
```

## Why the tool runs inside a container

`go build` fails on Windows at blst (cgo) and `storage.AvailableBytes` (no Windows implementation). The fork is
built in `golang:1.25.10-bookworm` everywhere else in this project; the kit does the same: `scripts/l1.sh build`
builds once into `out/l1-batch`, and every later command runs in `debian:bookworm-slim` **on the compose
network** `k1p0_a1net`, so node addresses are `172.31.0.11–13:9650` (internal) while the host sees
`127.0.0.1:9750/9760/9770`.

## Three things netgen taught on the first run (recorded so nobody repeats them)

1. `SUBNET_PREFIX` **must end in `.0`** — `172.31` yields `172.31.11` (wrong), `172.31.0` yields `172.31.0.11`.
2. The default drill band carries the **real network's C-Chain chainId** (`9000000009`); netgen warns and still
   generates. Set `A1_CHAIN_ID=9000000909`. Patch 0015's gate is doing its job: it **reports**, a person must **read**.
3. netgen's identity line prints *"L1 chainId block 9001000000–9001999999"* for **the drill band too** — the same
   block as real g1 (Adam Chain is `9001000000`). The kit does **not** use that block: its `plan` defaults to
   `8990000001+`. Since P-81 (D-234) the console itself, started with `A1_DRILL_BAND=1`, allocates drill chainIds
   from the generation's drill block `8_00g_000_000–…999_999` (`8001000000+` on g1) and refuses any number in the
   real range; the kit's default base still lives outside that block and can move onto it when the pump joins the
   console (P-87). netgen's printed line is informational only and lives in the fork, so it is left alone
   (changing it is a `patches/` regeneration, hard rule #3).

## Four things the first run taught (fixed in the kit)

1. **netgen's fund sits on the X-Chain; the P-Chain is empty.** Every P-Chain tx needs a P UTXO ⇒ `l1-batch fund`
   (export X → import P, ~200 ms) is the mandatory first step. The real network's "two-leg wallet" lesson holds here.
2. **Chain names accept letters, digits and spaces only.** `so-0001` failed with `illegal name character` **after**
   the subnet was created ⇒ the first real orphaned subnet. The kit sends `so 0001`; `plan.json` keeps `so-0001`.
3. **The real genesis ceiling is ~256 KiB, not 1 MiB.** `txs.Codec = codec.NewDefaultManager()` caps every
   transaction at 256 KiB (`codec/manager.go:19`); a 505 KB genesis fails with `packer has insufficient length` —
   and also leaves an orphaned subnet. `MaxGenesisLen 1 MiB` (`create_chain_tx.go:20`) is never reachable.
4. **A single-validator ledger that fell asleep, then a node restart, sticks in bootstrap** (RPC 503 *"not done
   bootstrapping"*), and a later top-up does **not** unstick it within 120 s. Operating rule: **top up before
   restarting a node**, or budget a second restart after the top-up. Details in the evidence file.

## Run

```bash
cd local-net/tools/k1
# 0 · drill-network material (regenerate when needed — overwrites out/net)
#     MSYS_NO_PATHCONV=1 docker run --rm -v /c/PROJECTS/9Chain-A1/upstream/avalanchego:/src -w /src \
#       -v "$PWD/out/net":/out -v 9chain-a1-gomod:/go/pkg/mod -e GOWORK=off -e N=3 -e OUT=/out \
#       -e NETWORK_ID=899999998 -e SUBNET_PREFIX=172.31.0 -e A1_CHAIN_ID=9000000909 \
#       -e A1_CONFIG_DIR="$PWD/config" -e A1_HTTP_ALLOWED_HOSTS='*' \
#       golang:1.25.10-bookworm sh -c "go run ./9chain-a1-tools/netgen"
scripts/up.sh                       # 3 nodes, image g1-81, ports 9750/9760/9770, waits for P-Chain bootstrap
scripts/l1.sh build                 # once
scripts/l1.sh plan  -nodes http://172.31.0.11:9650,http://172.31.0.12:9650,http://172.31.0.13:9650 \
                    -count 30 -per-node 14 -dormant-first 2
K1_FUND_KEY="$(scripts/fund-key.sh)" scripts/l1.sh fund               # X → P, once, 1,000 LOVE9
K1_FUND_KEY="$(scripts/fund-key.sh)" scripts/l1.sh apply -limit 5     # first 5 ledgers; re-run = resume
K1_FUND_KEY="$(scripts/fund-key.sh)" scripts/l1.sh topup -validation <validationID>   # wake one ledger
scripts/l1.sh render                # config/chains, config/subnets, out/plan/docker-compose.k1.yml
scripts/down.sh && scripts/up.sh --k1      # restart ONCE with --track-subnets (a startup flag)
scripts/l1.sh status                # 5/5 eth_chainId right · getL1Validator on the right node · fee price 1
```

## The real K1 path — 72 nodes on 9 machines (once the machines exist)

```bash
# 0 · 9-node drill mother network (netgen N=9 → out/net9, same command as above with N=9, SUBNET_PREFIX=172.32.0)
scripts/l1.sh keygen  -inventory hosts/inventory.json -out out/hosts            # 72 identities, never overwritten
scripts/l1.sh compose -inventory hosts/inventory.json -net out/net9 -hosts out/hosts -chains /dev/null -out out/deploy
for m in k1-m0{1..9}; do scripts/push-host.sh $m hosts/inventory.json; done      # rsync + image + compose up (tracking nothing yet)
scripts/hosts-run.sh hosts/inventory.json 14-startclose.sh                        # 81 nodes, peers ≈ 80, 0 StartClose
scripts/l1.sh plan -inventory hosts/inventory.json -count 1000 -per-node 14 -chain-id-base 8990000001 -dormant-first 300 -dormant-balance 200000
K1_FUND_KEY=… scripts/l1.sh fund -uri http://<m01>:9800 -amount 100000000000        # 100 LOVE9 X→P
K1_FUND_KEY=… scripts/l1.sh workers -uri http://<m01>:9800 -n 10 -each 5000000000
scripts/l1.sh apply -uri http://<m01>:9800 -workers 10                              # ≈ 5 minutes for 1,000 ledgers
scripts/l1.sh render -solo-snow=false                                                # config/chains + assignment.json
scripts/l1.sh compose -inventory hosts/inventory.json -net out/net9 -hosts out/hosts -out out/deploy   # now with AVAGO_TRACK_SUBNETS
for m in k1-m0{1..9}; do scripts/push-host.sh $m hosts/inventory.json; done      # restart ONCE per node that has ledgers
scripts/l1.sh status -uri http://<m01>:9800 -warn-seconds 172800                  # 1,000/1,000 + fee-runway gate
scripts/l1.sh router -assignment out/plan/assignment.json -out out/router/Caddyfile  # push to the router VM
scripts/l1.sh measure -nodes out/deploy/nodes.json -out out/measure                  # push to the measurement VM
scripts/l1.sh pump -rate 1 -seconds 604800                                            # from 3 load VMs, split with -only
```

Ports per machine: host nodes `--staking-port` 9651…9658 and API 9650…9720; mother nodes 9661…9663 and API
9800…9820 (mother API is **not** 9700: it collided with h06–h08, caught by reading the generated compose).
Beacons on the same machine use the internal Docker IP, on other machines the public IP (Docker does not hairpin,
patch 0024).

## Seven measurements — command, pass condition, red control

| # | Measure | Command | Passes when | Red control |
|---|---|---|---|---|
| **0.1** RAM of 15 plugins | 15 ledgers on **one** node (`-nodes http://172.31.0.11:9650 -count 15 -per-node 15`), `pump -rate 3 -seconds 600`, `10-measure-plugins.sh` at minute 0/5/10, **two runs**: default knobs (delete `config/chains/*`) and K1 knobs | plugSum ≤ ~500 MiB with K1 knobs; record the default-knob number | default knobs exceed 3 GB ⇒ PLAN-K1 §3b prediction holds |
| **0.2** single-validator L1 | `apply -limit 1` then `render -solo-snow=false` (no subnet config) → restart → `status` + `pump -only so-0001 -seconds 60` | blocks advance ⇒ default snow runs with 1 validator; if **not**, `render -solo-snow=true` and retry | force `k=2` on a 1-validator subnet ⇒ chain stalls |
| **0.3** `l1-batch` killed mid-run | `apply -limit 3`; kill during ledger 4 (Ctrl-C at "CreateSubnetTx"); `apply` again | `chains.jsonl` has no duplicates, the orphaned subnet is **reported** (created, not converted) | delete one `chains.jsonl` line ⇒ `apply` recreates that ledger (correct), `status` still shows the old one on chain — **that is the second orphan**, countable |
| **0.4** fees and dormancy | `-dormant-first 2 -dormant-balance 120`; `11-fee-state.sh http://127.0.0.1:9750 <validationID>` every 30 s | after ~2 min `getL1Validator` balance 0, `status` prints `active NO`, that ledger's blocks **stop**; `IncreaseL1ValidatorBalanceTx` from a **different** wallet ⇒ wakes | topping up with the owner wallet must also work (the tx carries no auth) |
| **0.5** metric names | `12-metrics-names.sh http://127.0.0.1:9750` | metric names exist for validator-set builds (count, duration, height diff) | — |
| **0.6** genesis vs txDB | `13-txdb-size.sh` before `apply`; after 20 ledgers with a 2 KB genesis; then 20 with a 500 KB template (`-template` with a fake 500 KB `alloc`) | measurable +MB, ratio ≈ 250× | — |
| **0.7** bootstrap of 14 chains | `render` for the node with 14 ledgers; `down.sh && up.sh --k1`; time until `info.isBootstrapped` for all 14; `14-startclose.sh` | ≤ a few minutes; `too-many-tracked=0`, peers = 2 | force `-per-node 16` at `plan` ⇒ **`plan` refuses** before any node gets cut |

Fat genesis template for 0.6 (not committed, regenerate — 2,700 entries ≈ 199 KB, 6,900 entries ≈ 505 KB):

```bash
node -e 'const fs=require("fs");const g=JSON.parse(fs.readFileSync("config/l1-evm-genesis.json","utf8"));for(let i=0;i<2700;i++){g.alloc[(BigInt(i)+1n).toString(16).padStart(40,"0")]={balance:"0x1"}}fs.writeFileSync("config/l1-evm-genesis-200k.json",JSON.stringify(g,null,1))'
scripts/l1.sh plan -nodes http://172.31.0.11:9650 -count 5 -per-node 15 -chain-id-base 8990001021 \
  -template config/l1-evm-genesis-200k.json -max-genesis-bytes 1048576 -keep-template-alloc -out out/plan-fat3
```

Every number goes into `docs/k1-phase0/EVIDENCE-<date>.md` **in the repo** (never into `out/`, which is gitignored).

## What the kit deliberately does NOT have (phase 0 decides)

- `IncreaseL1ValidatorBalanceTx` is in (`topup`); `DisableL1ValidatorTx` is not.
- Router RPC in production — phase 0 calls nodes directly; `router` only renders a Caddyfile from `assignment.json`.
- Community chains with V = 5 receiving anchors — phase 0 has 3 nodes.

## Clean up

```bash
scripts/down.sh --wipe        # removes volumes: drill chains vanish, out/plan stays readable
```
