# Community chain snapshots — keep a restorable copy of 9Chain A1

> Tool: [`scripts/chain-snapshot.mjs`](../scripts/chain-snapshot.mjs) · decision: `DECISIONS.md` D-262 ·
> status: `PROGRESS.md` P-110. Everything below marked **measured** was measured on the g1 **drill band**
> (networkID `899999998`) on 2026-09-15. Nothing here has run against the public network yet.

## What a snapshot is for

One bundle per day. Anyone can download it, check it against a root the project publishes elsewhere, and
bring up a node that holds **exactly** the chain as of that day: P-Chain, X-Chain, C-Chain and every tracked L1.

| Use | Possible with a bundle? |
|---|---|
| A. Read and verify history as of the snapshot | ✅ yes |
| B. Start a node at the snapshot height instead of syncing from genesis | ✅ yes (it then catches up from live peers) |
| C. Make the chain produce blocks again after every validator is gone | ❌ **no** |

**C is impossible by design.** Blocks are accepted by the validators registered on the P-Chain, and signing
needs their identity keys (`staker.key`, `signer.key`). Those keys are never in a bundle and must never be
published: publishing them hands over the right to impersonate a validator. Surviving the loss of every
validator is a separate decision (private, split custody of validator identities, or a re-genesis that carries
balances over). A snapshot is the data half of that plan, not the whole plan.

## What is in a bundle

```
00-READ-FIRST.md          heights and fingerprints of every chain, and how to restore
snapshot.json             source node flags that matter, node binary + plugin sha256, what was left out
tips.json                 heights/hashes measured on a node RESTORED FROM THIS BUNDLE
node-data.tar             db/ + chainData/ of the source node — nothing else from its data dir
node-data.files.sha256    sha256 of every file inside the tar (checked again after extraction)
genesis.json
chain-configs/<chain>/{config.json,upgrade.json}    allowlist; anything else is left out and listed
subnet-configs/*.json     when the source node has them
node-image.tar            only with --include-image
SHA256SUMS.txt            sha256 of every file above (standard sha256sum format)
ROOT.txt                  sha256 of SHA256SUMS.txt
```

Never in a bundle: `staking/`, logs, `process.json`, console state, operator secrets. The pack step copies an
**allowlist** (`db/`, `chainData/`, specific config names) instead of "everything minus a few things", and it
**refuses** the whole pack if an identity-shaped file (`*.key`, `*.crt`, `*.pem`, anything under `staking/`)
turns up inside what it copies.

## For operators — make one

The source should be a **non-validator node that tracks every subnet**. Stopping a validator costs uptime, and
its data directory is where identity keys live.

```bash
node scripts/chain-snapshot.mjs create --container <node container> --out /srv/snapshots/a1-2026-09-15 \
     --stop-start --reference-rpc http://<an independent API node>:9650
```

1. **Pack.** Refuses a running container unless you pass `--stop-start`, because a copy of a live LevelDB is
   not a snapshot. With it, the node is stopped (`docker stop -t 120`), copied, and **started again before the
   drill**, so downtime is the copy only. Everything the tool needs is read from `docker inspect` of that
   container, so nothing is copied into the tool by hand.
2. **Drill.** The bundle is extracted into an empty volume, file hashes are checked, and a node boots from it
   with `--network none`. Tips are read twice, 5 s apart, and must not move.
3. **Coverage.** A tracked chain with no data directory in the bundle stops the seal. Pass `--allow-uncovered`
   to publish such a bundle anyway; it then says so on its first page.
4. **Reference** (optional, recommended). Asks a live node for the block at each snapshot height. One mismatch
   fails. A reference that confirms nothing counts as *could not run* (exit 2), never as a pass.
5. **Seal.** Writes `SHA256SUMS.txt` and `ROOT.txt`, then prints the root.

🔴 **Publish the root somewhere the download host cannot edit** (a commit in the repository, the website).
Whoever can change the bundle can also change `ROOT.txt` inside it.

Exit codes: `0` pass · `1` the bundle is wrong · `2` could not run (not a verdict).

## Distribution channel: GitHub Releases

Tool: [`scripts/chain-snapshot-release.mjs`](../scripts/chain-snapshot-release.mjs). A GitHub release is a **flat**
list of files and refuses any file of **2 GiB or more**, so a bundle travels as assets:

```
meta.tar                    every small file of the bundle (plain ustar, deterministic bytes)
node-data.tar.part-000 …    the data tar in parts of 1,900 MiB (default; --part-size, always < 2 GiB)
SHA256SUMS.txt · ROOT.txt   copied out of meta.tar, so the root can be checked without downloading gigabytes
RELEASE.json                how the parts go back together
RELEASE-SHA256SUMS.txt      sha256 of every asset
```

```bash
node scripts/chain-snapshot-release.mjs pack <bundle> --out <assets>                       # operator
node scripts/chain-snapshot-release.mjs upload <assets> --repo <owner/name>                # DRAFT release; --publish to publish
node scripts/chain-snapshot-release.mjs join <downloaded assets> --out <bundle> --root <published root>   # community
```

Or with standard tools only:

```bash
sha256sum -c RELEASE-SHA256SUMS.txt
cat node-data.tar.part-* > node-data.tar && tar -xf meta.tar && sha256sum -c SHA256SUMS.txt && sha256sum SHA256SUMS.txt
```

🔴 The asset checksums travel **inside** the release, so whoever can replace an asset can replace them too.
They only make a failure specific ("part-001 is corrupt"). The verdict is the bundle's root, published
outside the release, checked on the **rejoined** directory.

`upload` refuses to add to an existing release. After uploading it reads the release back from GitHub, compares
the name and size of every asset, and downloads the small ones to compare their bytes.

Measured 2026-09-15:

| Case | Result |
|---|---|
| Real drill bundle (279 MiB) at 100 MiB parts → 3 parts + meta | rejoined root **equals** `50fba769…`; `verify --root --drill` restored 12/12 chains again |
| Same, rejoined with `cat` + `tar` + `sha256sum` only | same root |
| Synthetic 2.2 GiB data tar at the default 1,900 MiB | 2 parts (1,992,294,400 + 369,937,613 bytes), rejoined root equals the original |
| `--part-size 2048` | exit 2: not below the 2 GiB limit |
| Last part one byte short (interrupted download) | exit 1: names `node-data.tar.part-001` |
| `--self-test` | 23 cases, including a complete forgery (new data, re-sealed, re-packed) that rejoins cleanly without `--root` and is rejected with it |
| Real upload: draft release on the private backup repository (8 assets, 279 MiB) | **4 min 46 s**; read back from GitHub: 8/8 names and sizes, small assets byte-identical |
| Downloaded every asset back from GitHub, then `join --root` | 21 s download; rejoined root **equals** `50fba769…`; `verify --root --drill` restored 12/12 chains |
| `upload` again with the same tag | exit 2: refuses to add to or overwrite an existing release |

Upload speed is the bottleneck from the machine that uploads (~1 MiB/s from the dev machine, not measured from
the server). GitHub may throttle heavy daily downloads, so Releases is best treated as one channel next to a
torrent or object storage, not the only copy.

## For the community — check one, keep one

```bash
sha256sum -c SHA256SUMS.txt && sha256sum SHA256SUMS.txt          # standard tools only
node scripts/chain-snapshot.mjs verify <bundle> --root <published root>
node scripts/chain-snapshot.mjs verify <bundle> --root <published root> --drill          # restore it yourself
node scripts/chain-snapshot.mjs verify <bundle> --reference-rpc https://<any node you trust>
```

`--drill` needs the node image whose binary matches `snapshot.json`: load `node-image.tar`, or build the image
from the published patch set and pass `--image <tag>`. A different binary is refused.

To **run** a node from it: extract `node-data.tar` into your data directory, copy `chain-configs/` into your
`--chain-config-dir`, and start with the network ID, genesis, normal bootstrap peers and the `--track-subnets`
list printed in `00-READ-FIRST.md`. Your node generates its own identity. Never copy anyone's `staking/`.

## Measured on the drill band, 2026-09-15

Source: `9chain-a1-tap-node-2` (stopped), 9 tracked L1s out of 19 on the P-Chain.

| Step | Result |
|---|---|
| pack | 213 files · **279 MiB** tar · 19 chain config files · **11 s** |
| drill boot (restored, offline) | **3–13 s** to bootstrapped · **~350 MiB** RAM |
| tips | P 142 · X 1 · C 0 · 9 L1s at 23,086–23,194 · unchanged between two reads |
| `verify --drill --root` | PASS, 12 chains at the recorded heights and hashes |
| reference = node-3 (independent DB, same network) | **10 match** · 0 mismatch · 2 unchecked (chains node-3 does not track) |

Every guard was also seen **red**, on the real path:

| Control | Result |
|---|---|
| verify with the 26-patch image (`--image 9chain-a1/node:g1-26patch-60a61707`) | exit 1: node binary **and** plugin hash differ |
| wrong `--root` | exit 1 |
| tracked subnet with no data (`+2jgh2oza…`) | exit 1: "Phase One L height 0 — NO DATA IN BUNDLE", **not sealed** |
| `staker.key` placed inside `chainData/` | exit 1: pack refused before tar ran |
| `tips.json` edited (height 23194 → 999999), then re-sealed by the attacker | files-only verify **passes** (as designed: no `--root`); `verify --drill` → exit 1 |
| reference = fresh node on a different network | exit 1: C-Chain block 0 hash differs |
| reference unreachable | exit 2: "nothing about the live chain was measured" |
| Git Bash path `/c/…` on Windows | exit 2 (it used to resolve silently to `C:\c\…`) |

`--self-test`: 37 cases, each red case paired with a green one. Two self-test cases were proved by breaking the
code on purpose: removing the `staking/` rule first stayed **green** (the `.key` rule hid it) until a dedicated
case was added.

## Measured: a restored node JOINS a live network (drill band, 2026-09-15)

Tool: [`scripts/measure-snapshot-join.mjs`](../scripts/measure-snapshot-join.mjs). The node runs with **normal**
flags: sybil protection on, a real beacon, its own fresh identity, the bundle's `--track-subnets`. It is judged
by **block hash at the same height** on an independent reference node (node-2), while a load generator keeps
the watched L1 (Band Test Five) moving at ~1 tx per 1.2 s.

Setup: the 9-node drill network was started from its stopped state. The live chain was confirmed to still
contain the bundle (`verify --reference-rpc`: 12/12 match). Then it was advanced past the bundle
(23,194 → 23,280) before any node joined.

| | Restored from bundle | Empty data dir (control) |
|---|---|---|
| Watched L1 started bootstrapping from (node log) | **23,194** (the bundle's height) | **0** |
| All 12 chains bootstrapped | **15 s** first run · **~2–5 s** on repeat runs | **187 s** |
| Caught up: same hash as the reference at the tip | **15 s**, at 23,297 while the chain moved | **187 s**, at 23,400 |
| Memory right after catching up | 225 MiB | 4.29 GiB |

Red controls on the same path:

| Control | Result |
|---|---|
| Beacon address that does not exist (no peers) | exit 1: 0/12 bootstrapped after 90 s, never "caught up" |
| Reference on another network (`rpc-a1.9chain.org`, 899999998 vs 999999998) | exit 2: refused before starting anything |
| `--self-test` (hash differs at equal height, behind, not bootstrapped, reference missing the block) | 7 cases |

⚠️ Read the numbers for what they are. The drill chains carry ~23 k small blocks each (a 279 MiB bundle), so
even a full sync takes only 3 minutes. The **ratio** is the finding (the bundle's height was really used, and
the node followed a moving chain with identical hashes); the absolute seconds will be larger on the public
network. A first attempt at a "too short timeout" control was a race, not a control: the restored node was
faster than the 5 s limit on one run and slower on the next. It was replaced by the unreachable-beacon case.

Not covered: the P-Chain and C-Chain were not advanced during the join. The drill band's C-Chain has never
produced a block and rejects every transaction (`unsupported feature: eip1559`; the legacy path returns
"method handler crashed"). The public C-Chain answers normally, so this is a drill-band finding, tracked
separately.

## Three things learned the hard way

1. **An offline restored node never finishes bootstrapping** with sybil protection on: the P-Chain loops on
   *"bootstrapping skipped: no provided bootstraps"* and every API answers *"not done bootstrapping"*, even
   though the log shows the DB loaded. The drill therefore runs with `--sybil-protection-enabled=false` and
   `--network none`. **Never connect such a node to a real network.**
2. **Sybil protection off starts every chain on the P-Chain**, tracked or not
   (`vms/platformvm/config/internal.go:98`). On the drill band that meant 9–10 extra plugin processes on empty
   DBs. This briefly looked like the copy had lost data. It had not: those chains were never tracked. Tips are
   only read for tracked chains, and the count is recorded in `tips.json → drillCost`. ⚠️ **The drill's memory
   grows with the number of chains on the network, not in the bundle.** At hundreds of L1s this must be
   measured before the daily job runs on the live network.
3. **A node restored without identity flags writes a new `staking/staker.key` into its data directory.** A data
   directory copied wholesale would therefore publish an identity. That is why the copy is an allowlist.

## Not done yet — honest list

| Item | Why it is open |
|---|---|
| Run on the public network (daily job on a snapshot node) | Server work is a deploy: one session, a person presses the button (CLAUDE.md §1 #4). Needs a decision on **where** the snapshot node runs |
| Live data size | Last known figure 651 MB (2026-08-25, g0). Unmeasured since 15 L1s and the 9 tx/s pump; decides cost and whether bundles need compression or deltas |
| Distribution beyond GitHub Releases (object storage, a daily torrent, retention 7 daily / 4 weekly / 12 monthly) | Decision pending. Releases works end to end (draft on the private repository) |
| Publishing the root outside the bundle | Mechanism pending (commit to `official`, the website, or both) |
| Joining the **public** network from a public bundle | Measured on the drill band only (section above). A public bundle needs the snapshot node on the server |
| Drill memory at hundreds of L1s | See lesson 2 |
| Validator identity custody (use C) | A decision for the project owner, not a tool |
