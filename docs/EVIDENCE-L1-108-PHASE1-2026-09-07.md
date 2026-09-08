# Phase 1 of L1-108 — "one full machine" on the drill band: 15 L1s, V = 5, 1 tx/s each, ≥ 6 h

Bằng chứng pha 1 (P-89, mốc `L1-108`, D-233). Mọi số dưới đây được **đo** trên băng tập `899999998` (`local-net/net-tap-g1`, 9 node
trên máy dev, Docker Desktop) và ghi tự động bởi `p89-sampler.mjs` (scratchpad phiên `36fbfc76…`); lệnh nguồn của từng cột ghi ở §1.

## 1. Setup and instruments

| what | command (repo root) |
|---|---|
| console (drill band, per-node model) | `A1_DRILL_BAND=1 A1_L1_VALIDATORS_PER_CHAIN=5 A1_L1_ADMIN=0x6c7F94E9… A1_PUBLIC_RPC_BASE=http://127.0.0.1:8545 node local-net/console/server.mjs` |
| router | `l1-batch router -assignment <cfg>/assignment.json -fallback http://9chain-a1-tap-node-1:9650 -listen :8545` → `caddy:2` on `net-tap-g1_a1net`, host `127.0.0.1:8545` |
| pump | `l1-batch pump -ledger <cfg>/console-chains.json -rpc-base http://k1-drill-router:8545 -rate 1 -seconds 23400 -heartbeat-dir <cfg>/heartbeat` (container `k1-drill-pump`) |
| node load | `bash scripts/measure-node-load.sh --local --name-filter 9chain-a1-tap-node- --expect 9 --seconds 60 --no-ledger` (VM cgroup `cpu.stat` delta / `memory.current`) |
| chains producing | `node scripts/check-chains-producing.mjs --file <ledger> --rpc http://127.0.0.1:8545 --window 30 --target-rate 1` |
| startclose / peers / RAM | `node scripts/check-startclose.mjs --compose local-net/net-tap-g1/docker-compose.multinode.yml --with-load` |
| ledger through the router | `node scripts/check-chain-ledger.mjs --drill --file <ledger> --rpc http://127.0.0.1:8545` |

Pass conditions (PROGRESS P-89): VM CPU < 70 % of its cores · every chain's blocks ≤ 2.5 s apart with ≥ 90 % of the sent
transactions included · 0 `StartClose` · RAM flat after ~6 h · `c_tx` measured (replaces the 0.02 guess in PLAN-108 §2c).
Red control: one validator node stopped for 3 minutes ⇒ the chains it validates keep producing (V = 5 tolerates one down).

## 2. Setup log

(appended by `p89-setup.sh`)
```
STEP 2026-09-07T18:16:48Z console up
STEP 2026-09-07T18:16:48Z revoke Drill Chain
{"thuHoi":true,"validators":["9chain-a1-tap-node-2","9chain-a1-tap-node-3","9chain-a1-tap-node-4","9chain-a1-tap-node-5","9chain-a1-tap-node-6","9chain-a1-tap-node-7","9chain-a1-tap-node-8","9chain-a1-tap-node-9","9chain-a1-tap-node-1"],"restart":9}
STEP 2026-09-07T18:21:48Z revoke Band Test One
{"thuHoi":true,"validators":["9chain-a1-tap-node-2","9chain-a1-tap-node-3","9chain-a1-tap-node-4","9chain-a1-tap-node-5","9chain-a1-tap-node-6","9chain-a1-tap-node-7","9chain-a1-tap-node-8","9chain-a1-tap-node-9","9chain-a1-tap-node-1"],"restart":9}
STEP 2026-09-07T18:26:48Z revoke Band Test Three
{"thuHoi":true,"validators":["9chain-a1-tap-node-1","9chain-a1-tap-node-2","9chain-a1-tap-node-3","9chain-a1-tap-node-4","9chain-a1-tap-node-5"],"restart":5}
STEP 2026-09-07T18:29:37Z create Phase One A
{"chainId":8001000005,"validators":["9chain-a1-tap-node-1","9chain-a1-tap-node-2","9chain-a1-tap-node-3","9chain-a1-tap-node-4","9chain-a1-tap-node-5"],"restart":5}
STEP 2026-09-07T18:32:33Z create Phase One B
{"chainId":8001000006,"validators":["9chain-a1-tap-node-7","9chain-a1-tap-node-8","9chain-a1-tap-node-9","9chain-a1-tap-node-1","9chain-a1-tap-node-2"],"restart":5}
STEP 2026-09-07T18:35:29Z create Phase One C
{"chainId":8001000007,"validators":["9chain-a1-tap-node-3","9chain-a1-tap-node-4","9chain-a1-tap-node-5","9chain-a1-tap-node-6","9chain-a1-tap-node-7"],"restart":5}
STEP 2026-09-07T18:38:24Z create Phase One D
{"chainId":8001000008,"validators":["9chain-a1-tap-node-8","9chain-a1-tap-node-9","9chain-a1-tap-node-1","9chain-a1-tap-node-2","9chain-a1-tap-node-3"],"restart":5}
STEP 2026-09-07T18:41:19Z create Phase One E
{"chainId":8001000009,"validators":["9chain-a1-tap-node-4","9chain-a1-tap-node-5","9chain-a1-tap-node-6","9chain-a1-tap-node-7","9chain-a1-tap-node-8"],"restart":5}
STEP 2026-09-07T18:44:15Z create Phase One F
{"chainId":8001000010,"validators":["9chain-a1-tap-node-9","9chain-a1-tap-node-1","9chain-a1-tap-node-2","9chain-a1-tap-node-3","9chain-a1-tap-node-4"],"restart":5}
STEP 2026-09-07T18:47:10Z create Phase One G
{"chainId":8001000011,"validators":["9chain-a1-tap-node-5","9chain-a1-tap-node-6","9chain-a1-tap-node-7","9chain-a1-tap-node-8","9chain-a1-tap-node-9"],"restart":5}
STEP 2026-09-07T18:50:06Z create Phase One H
{"chainId":8001000012,"validators":["9chain-a1-tap-node-1","9chain-a1-tap-node-2","9chain-a1-tap-node-3","9chain-a1-tap-node-4","9chain-a1-tap-node-5"],"restart":5}
STEP 2026-09-07T18:53:01Z create Phase One I
{"chainId":8001000013,"validators":["9chain-a1-tap-node-6","9chain-a1-tap-node-7","9chain-a1-tap-node-8","9chain-a1-tap-node-9","9chain-a1-tap-node-1"],"restart":5}
STEP 2026-09-07T18:55:57Z create Phase One J
{"chainId":8001000014,"validators":["9chain-a1-tap-node-2","9chain-a1-tap-node-3","9chain-a1-tap-node-4","9chain-a1-tap-node-5","9chain-a1-tap-node-6"],"restart":5}
STEP 2026-09-07T18:58:52Z create Phase One K
{"chainId":8001000015,"validators":["9chain-a1-tap-node-7","9chain-a1-tap-node-8","9chain-a1-tap-node-9","9chain-a1-tap-node-1","9chain-a1-tap-node-2"],"restart":5}
STEP 2026-09-07T19:01:47Z create Phase One L
{"chainId":8001000016,"validators":["9chain-a1-tap-node-3","9chain-a1-tap-node-4","9chain-a1-tap-node-5","9chain-a1-tap-node-6","9chain-a1-tap-node-7"],"restart":5}
STEP 2026-09-07T19:04:43Z create Phase One M
{"chainId":8001000017,"validators":["9chain-a1-tap-node-8","9chain-a1-tap-node-9","9chain-a1-tap-node-1","9chain-a1-tap-node-2","9chain-a1-tap-node-3"],"restart":5}
STEP 2026-09-07T19:07:39Z console stopped; live chains: 15
✓ router: 15 routes → /out/Caddyfile (+ docker-compose.yml)
STEP 2026-09-07T19:07:44Z router refreshed
STEP 2026-09-07T19:07:44Z baseline (idle): startclose
  ✓ 9chain-a1-tap-node-9         0 cuts · 0 StartClose line(s) · 8 peer(s) · RAM 218.1MiB
✅ PASS — 9/9 node(s): no peer was ever dropped for tracking too many subnets, every node has its peers
STEP 2026-09-07T19:08:03Z baseline (idle): chain ledger through the router
  ✓ Phase One M #8001000017 — answers with the id it claims
✅ PASS — every advertised chain belongs to the running generation and answers with the id it claims.
STEP 2026-09-07T19:08:03Z baseline (idle): node load 60 s
TOTAL (9 nodes)             0.931      2139
window 2026-09-07T19:08:06Z..2026-09-07T19:09:06Z (60000239us) · VM loadavg 2.47 2.77 2.24 on 24 cpus · youngest node 121s
{"measuredAt":"2026-09-07T19:09:06Z","windowSec":60,"nodes":9,"cpuCores":0.931,"ramMiB":2139,"youngestNodeAgeSec":121,"hostLoadavg":"2.47 2.77 2.24","hostCpus":24,"heartbeat":"local","l1Count":null}
STEP 2026-09-07T19:09:06Z pump start: 15 chains × 1 tx/s for 23400 s
STEP 2026-09-07T19:09:07Z SETUP DONE
```

Idle baseline (15 chains tracked, pump not yet started): **0.931 cores · 2,139 MiB** for 9 nodes; startclose 9/9 clean; ledger through the router 15/15.

## Hourly samples (started 2026-09-07T19:09:59Z, 6 h)

| time (UTC) | sample | cores (9 nodes) | RAM MiB (cgroup) | VM loadavg | chains producing | startclose | pump |
|---|---|---|---|---|---|---|---|
| 2026-09-07T19:09:59Z | h0 (pump just started) | 1.87 | 2448 | 3.79 3.33 2.52 | 15/15 (exit 0) | 0 cuts | 15 running · 2400 sent · 0 failed |
| 2026-09-07T20:11:52Z | h1 | 2.51 | 6344 | 4.03 5.11 4.55 | 14/15 (exit 1) | 0 cuts | 15 running · 58349 sent · 0 failed |
|   | reds | 🔴 Phase One A #8001000005 — 3s between consecutive blocks (max 2.5s) | | | | | |
| 2026-09-07T21:14:01Z | h2 | 2.114 | 9633 | 6.90 5.64 4.75 | 15/15 (exit 0) | 0 cuts | 15 running · 114075 sent · 0 failed |

### Intervention at h2 (2026-09-07T21:18:07Z) — default subnet-evm caches replaced by the small ones (D-242)

RAM (cgroup, anonymous, not page cache) grew 2,448 → 6,344 → 9,633 MiB in two hours: node-1 ran 9 subnet-evm plugins at ~111 MiB each and growing (defaults: trie-clean 512 + trie-dirty 512 + snapshot 256 MiB per plugin). The VM has 32 GB. Every live chain's `config.json` was rewritten with `trie-clean-cache 16 · trie-dirty-cache 16 · snapshot-cache 8 · pruning-enabled` (the K1 kit's values) and the 9 nodes were force-recreated one by one while the pump kept running; the console now writes these values itself under the per-node model.

Result 2 minutes after the rollout (21:20Z): chains producing **15/15** (1.00 tx/s, max gap ≤ 3 s), startclose **9/9** with 8 peers, RAM (cgroup) **4,085 MiB** (from 9,633), CPU 1.99 cores, VM loadavg 8.07/24. ⚠️ Honest note: the rollout script's health probe matched any `health.health` body, so the nine nodes were recreated 1–3 s apart — effectively together, not one by one as the console does (~33 s each). The band recovered anyway; the console's own rollout (`trackSubnetsLanLuot`) waits for P/X/C health per node and is the path to use.

| 2026-09-07T22:15:54Z | h3 | 2.094 | 7883 | 3.92 5.12 5.22 | 15/15 (exit 0) | 0 cuts | 15 running · 169771 sent · 17 failed |

### Red control at hour 3 — one validator node stopped for 3 minutes (2026-09-07T22:17:47Z)

- 2026-09-07T22:17:48Z `docker stop 9chain-a1-tap-node-9`
- 2026-09-07T22:21:18Z gate with 9chain-a1-tap-node-9 DOWN: 7/15 chains producing (exit 1) — 🔴 Band Test Four #8001000003 — 5s between consecutive blocks (max 2.5s + 1 s clock rounding) · 🔴 Phase One B #8001000006 — 5s between consecutive blocks (max 2.5s + 1 s clock rounding) · 🔴 Phase One D #8001000008 — 10s between consecutive blocks (max 2.5s + 1 s clock rounding) · 🔴 Phase One F #8001000010 — 5s between consecutive blocks (max 2.5s + 1 s clock rounding) · 🔴 Phase One G #8001000011 — 5s between consecutive blocks (max 2.5s + 1 s clock rounding) · 🔴 Phase One I #8001000013 — 5s between consecutive blocks (max 2.5s + 1 s clock rounding) · 🔴 Phase One K #8001000015 — 5s between consecutive blocks (max 2.5s + 1 s clock rounding) · 🔴 Phase One M #8001000017 — 5s between consecutive blocks (max 2.5s + 1 s clock rounding)
- 2026-09-07T22:21:18Z `docker start 9chain-a1-tap-node-9`
- 2026-09-07T22:24:38Z after restart: startclose exit 0; gate 15/15 (exit 0)
| 2026-09-07T23:24:38Z | h4 | 2.095 | 10944 | 3.78 4.56 4.81 | 15/15 (exit 0) | 0 cuts | 15 running · 231646 sent · 17 failed |
| 2026-09-08T00:26:32Z | h5 | 2.165 | 13582 | 5.80 5.86 5.15 | 15/15 (exit 0) | 0 cuts | 15 running · 287296 sent · 17 failed |
| 2026-09-08T01:28:25Z | h6 | 2.143 | 15621 | 9.74 6.73 5.21 | 15/15 (exit 0) | 0 cuts | 15 running · 343021 sent · 17 failed |

SAMPLER DONE 2026-09-08T01:30:17Z

## 3. Per-process memory series (every 10 min, 22:19Z → 01:22Z, after the small-cache restart)

| fleet (9 nodes) | 22:19Z | 01:22Z | growth |
|---|---|---|---|
| `avalanchego` RSS | 2,867 MiB | 6,235 MiB | **+123 MiB per node per hour** |
| 75 subnet-evm plugins RSS | 6,453 MiB | 10,018 MiB | **+15.6 MiB per plugin per hour** |
| cgroup `memory.current` | 7,189 MiB | 15,396 MiB | +2.7 GB/h fleet, decelerating (h4→h5 +2.6, h5→h6 +2.0) |

Raw series: scratchpad `p89-rss.jsonl` (per node: avalanchego RSS, plugin RSS sum, plugin count, cgroup current/anon/file).

## 4. Conclusion (phase 1, 15 L1 · V = 5 · 1 tx/s · 6 h 20 min of pump)

| pass condition | measured | verdict |
|---|---|---|
| VM CPU < 70 % | 9 nodes **2.09–2.17 cores** steady (h2–h6) on a 24-cpu VM (9 %); loadavg 3.8–9.7 | ✅ |
| every chain: blocks ≤ 2.5 s, ≥ 90 % of sent tx included | **15/15** at h0, h2, h3, h4, h5, h6 — each chain 15 blocks / 30 tx per 30 s window = 1.00 tx/s, max gap 2 s (3 s = whole-second rounding, gate fixed after h1) | ✅ |
| 0 `StartClose` | **9/9** nodes, 0 cuts, 8 peers, every sample | ✅ |
| RAM flat after ~6 h | **NOT flat**: cgroup 2,448 → 15,621 MiB in 6 h; both `avalanchego` (+123 MiB/node/h) and the plugins (+15.6 MiB/plugin/h) grow, with small caches too; growth decelerates but has not stopped | ❌ — the finding |
| `c_tx` measured | (2.122 − 0.931 cores) / 9 nodes / 8.33 chains·tx/s = **0.016 cores per (tx/s) per chain per node** (PLAN-108 §2c guessed 0.02) | ✅ |
| red control: one validator node down 3 min | the **8 chains** validated by node-9 kept producing at **5–10 s per block** (7 others unchanged at 2 s); 3 min after `docker start`: 15/15 at 2 s, peers 9/9 | ✅ liveness · ⚠️ cadence ×2.5–5 while a validator is unresponsive |

Pump totals: **343,021 transactions sent, 17 failed** (all 17 during the 21:18Z restart), 15 chains, 0 failures otherwise.

**What phase 1 says about the model.**
1. *Capacity per node* on this hardware is far from CPU-bound: ~0.24 cores per node with 8.3 chains at 1 tx/s each. Disk (K1: 288 MB per chain
   pre-allocated + ~900 B/tx/node) and now **RAM** set the count, not CPU.
2. *RAM is the wall that phase 1 found.* The default subnet-evm caches (512/512/256 MiB per plugin) grew the fleet +3.3 GB/h; the small caches
   (16/16/8 MiB, now written by the console under the per-node model) cut the level in half at the restart but the slope stayed at
   +2–3 GB/h fleet for four more hours. The production machine (11 chains, 73 h) sits at 2.4 GB per node, which hints at a plateau near
   **~230 MiB per tracked chain per node** — phase 2 needs a 24 h run to see it, and `GOMEMLIMIT` is the knob to try. Budget **≥ 4 GB per
   15-chain node**, not the 2.7 GB in PLAN-108 §3.
3. *V = 5 tolerates one dead validator for liveness, not for latency.* Consensus rounds wait on the unresponsive peer, so those chains run at
   5–10 s blocks until it returns (or is removed from the subnet). A product SLO of "2 s blocks" needs either V ≥ 6 with a fast validator
   removal path, or an explicit "degraded" state on the chain page.
4. *The console is now the tool.* 3 revocations and 13 creations ran through `/api/create` / `/api/revoke` with per-node rollouts
   (5 restarts each, ~3 min), the router served 15 chains from `assignment.json`, and every gate (producing, startclose, ledger) read the
   drill band the way it will read a fleet.

**Not measured here (phase 2):** cross-machine gossip, bootstrap of a new node into 15 chains, disk over days, the RAM plateau, r = 3 tx/s.
