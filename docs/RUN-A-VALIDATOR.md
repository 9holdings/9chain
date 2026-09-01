# Run a validator on 9Chain-A1

> **This document is in English on purpose.** 9Chain-A1 is meant to be run by people who do not
> read Vietnamese. `CLAUDE.md` §0 exists for exactly this reader.

> 🔴 **NOT PUBLISHABLE WHILE ANY PLACEHOLDER REMAINS.** Every value the G-day generation
> decides is marked. Check before publishing:
> ```bash
> grep -c "FILL-ON-G[-]DAY" docs/RUN-A-VALIDATOR.md   # must print 0
> ```
> 🔴 The bracket in `G[-]DAY` is deliberate — the same trick as `[a]valanchego` in a `pgrep`.
> It makes the regex match the marker while this instruction does NOT match itself. Until
> 2026-09-01 the pattern was written plainly, so `grep -c` counted its own two instruction lines
> and could NEVER print 0. A gate that cannot go green teaches people to skip it, which is the
> one thing a publish gate must not do.
> A guide with a placeholder in it reads exactly like a guide without one, right up to the
> moment somebody pastes it into a terminal.

---

## What you get, and what it costs

| | |
|---|---|
| **Run a full node** | Free. No permission, no allowlist, no application. You need a machine and a public IPv4 address. |
| **Become a validator** | Requires a **self-bond of at least 81 LOVE9**, locked for the term you choose. |

✅ **The faucet can fund a validator, and that is deliberate.** It hands out **9 LOVE9** per
request, so **nine requests** cover the whole 81-LOVE9 bond. Nothing to apply for, nobody to ask.

*(Until 2026-09-01 this barrier was 25,000 LOVE9. At 10 LOVE9 per request that was roughly 500
hours of uninterrupted asking — not a slow path, no path at all. The number is compiled into the
node binary and therefore fixed for the life of the network, so it was changed in the hours
before genesis rather than shipped. 81 = 9 × 9. For reference, Avalanche's own Fuji testnet uses
a 1 AVAX minimum, so this is still 81× that.)*

We would rather you learn the cost here than build a node for a week and discover it at the end.

**No permission gate exists at the protocol level.** `ROLE_OPERATOR` is not granted to anyone at
genesis, so the validator gate never activates and any funded account can submit
`AddPermissionlessValidatorTx`. The set is capped at **81 validators**, ranked by stake.

---

## Network parameters

| | |
|---|---|
| network name | `9chain-a1-g1` |
| networkID | `999999998` |
| address prefix (HRP) | `love9` — addresses look like `P-love91…`, `X-love91…` |
| native asset alias | **`LOVE9`** — see the warning below, it will bite you |
| C-Chain EVM chainId | `9000000009` (`0x218711a09`) |
| P/X supply cap | `7,900,000,001 LOVE9` (`7900000001000000000` nano) |
| minimum validator stake | `81 LOVE9` (9 x 9 — nine faucet requests) |
| maximum validator stake | `625,000,000 LOVE9` (delegations count toward it) |
| minimum delegator stake | `9 LOVE9` |
| minimum delegation fee | `2%` (`20000` parts per million) |
| stake duration | min `24h`, max `365 days` |
| uptime required for rewards | **80%** |

### 🔴 `LOVE9`, never `AVAX` — and this breaks third-party tools on purpose

The native asset on X-Chain is registered under the alias **`LOVE9`**. There is deliberately no
`AVAX` alias pointing at the same assetID.

Tools built on stock avalanchego hard-code `"AVAX"` in `wallet/chain/x/context.go` and
`wallet/chain/c/context.go`. **They will not work against 9Chain-A1** unless they ask for
`LOVE9` or pass the raw assetID. Asking for `AVAX` returns an error that says so in full — that
error is the feature. This is a sovereignty decision, not an oversight.

---

## Step 0 — Get 9Chain-A1 itself

```bash
git clone https://github.com/9holdings/9chain.git 9chain-a1
cd 9chain-a1
```

Everything below assumes you are standing in that directory: the patch series lives in
`patches/`, the node image builds from `local-net/Dockerfile`, and the engraving canon you can
check the chain against is `docs/engrave/CANON.txt`.

🔴 **This step was MISSING until 2026-09-01.** The guide went straight to `git am
/path/to/9chain-a1/patches/*.patch` and never said where `/path/to/9chain-a1` comes from — a
hole that is invisible to anyone who already has the repository and fatal to everyone who does
not. It is the whole substance of *"a stranger can rebuild the fork"*, and it was missing from
the document whose job is to make that true.

---

## Step 1 — Rebuild the fork, and prove you rebuilt it

You are not asked to trust a binary we hand you. You rebuild it and compare tree hashes.

```bash
git clone https://github.com/ava-labs/avalanchego.git
cd avalanchego
git checkout 1cf1fc3
git am --keep-cr ../9chain-a1/patches/*.patch
git rev-parse HEAD^{tree}
```

**Must print:**

```
387238778dda96d58cabe6f9ddd7097e208b69e9
```

`--keep-cr` is not optional: without it, line endings shift and the tree hash will not match.

### Counter-check — do this too, it is what makes the first check mean something

Applying **26 of the 27** patches must yield a *different, also-known* tree:

```bash
git checkout 1cf1fc3 && git am --keep-cr <first 26 patches>
git rev-parse HEAD^{tree}     # 60a61707f7974a0f1853b8bf78df7d0fdc1ef863
```

Two anchors with independent origins say something. One anchor only proves the patch set agrees
with a number we printed in our own documentation.

---

## Step 2 — Build the node image

```bash
docker build -f local-net/Dockerfile \
  --build-arg A1_COMMIT=9chain-a1-g1-27patch-38723877 \
  -t 9chain-a1/node:g1 .
```

🔴 **Do not omit `--build-arg A1_COMMIT=`.** Without it the binary self-declares the Dockerfile
default and you lose the only way to tell one build from another at runtime.

Verify what you built — **measure the binary, not the network**:

```bash
docker run --rm --entrypoint ./avalanchego 9chain-a1/node:g1 --version
```

Must contain `9chaingo/` and `commit=9chain-a1-g1-27patch-38723877`. If it says `avalanchego/`,
you built upstream, not this fork.

---

## Step 3 — Get genesis and the bootstrap address

```
genesis.json   sha256  4de8caa59ef92e9212c27e569103bb757fa3e2a3876f3ab0c6981328bb0f6ee6
beacon nodeID          NodeID-MrgP69AZRSeJ3DQRSBWQzqeqovNcTAsEb
beacon address         139.99.145.13:9651
```

Verify the file before you boot with it:

```bash
sha256sum genesis.json
```

A node that boots a genesis you did not check is a node on a chain you did not choose.

---

## Step 4 — Run the node

```bash
docker run -d --name a1-node \
  -v "$PWD/genesis.json":/9chain-a1/net/genesis.json:ro \
  -v "$PWD/staking":/9chain-a1/node \
  -v a1-data:/root/.avalanchego \
  -p 0.0.0.0:9651:9651 \
  9chain-a1/node:g1 \
  ./avalanchego \
    --network-id=999999998 \
    --genesis-file=/9chain-a1/net/genesis.json \
    --plugin-dir=/9chain-a1/build/plugins \
    --public-ip=YOUR.PUBLIC.IPV4 \
    --staking-port=9651 \
    --bootstrap-ids=NodeID-MrgP69AZRSeJ3DQRSBWQzqeqovNcTAsEb \
    --bootstrap-ips=139.99.145.13:9651 \
    --http-host=127.0.0.1 \
    --http-allowed-hosts=localhost,127.0.0.1 \
    --log-level=info
```

### Two flags that are security boundaries, not preferences

- **`--http-host=127.0.0.1`.** Port 9650 is full-privilege RPC. Publishing it with
  `-p 0.0.0.0:9650:9650` hands the Internet your node's admin API. Docker publishes ports with
  DNAT rules that **bypass `ufw`**, so `ufw status` will tell you the port is blocked while it
  is wide open. If you want a public RPC, put a reverse proxy in front of loopback.
- **`--http-allowed-hosts`.** Keeps a browser on some other site from driving your node through
  DNS rebinding. If you proxy, make the proxy rewrite the `Host` header rather than widening
  this list.

**`--staking-port` 9651 must be reachable from the Internet.** That one is meant to be open.

### Starting over

If you previously ran a node of an earlier generation, **delete the data directory first**. The
network name is part of the database path (`<db-dir>/9chain-a1-g1/`), so a stale directory does
not cause an error — the node simply bootstraps into an empty folder and looks fine while being
on nothing.

---

## Step 5 — Confirm you are on the right chain

```bash
curl -s -X POST -H 'content-type:application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"info.getNetworkName"}' \
  http://127.0.0.1:9650/ext/info          # "9chain-a1-g1"

curl -s -X POST -H 'content-type:application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"health.health"}' \
  http://127.0.0.1:9650/ext/health        # "healthy": true
```

Also check `info.peers`. **Expect it to take longer than feels right.** In our own drill an
outside node finished bootstrapping at ~50 s, but a node that was not the beacon only saw it at
~70 s. Judging at 30 s reports an incident that is not happening.

You are ready to stake when `health.health` reports `true` **and** P and C are bootstrapped.

---

## Step 6 — Get LOVE9 onto **P-Chain**

🔴 **This is where most people lose an afternoon.** Staking happens on **P-Chain**, and genesis
liquid balances live on **X-Chain**. A wallet showing a healthy balance can still be unable to
stake, because the money is on the wrong chain, and the failure arrives *after* you decide to
spend.

You need an X→P export/import first. `xp-wallet`, shipped inside the node image, does it:

```
POST /api/x-to-p   {"amount":"25000"}
```

Then confirm on P-Chain — do not trust the wallet's own display:

```bash
curl -s -X POST -H 'content-type:application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"platform.getBalance","params":{"addresses":["P-love91…"]}}' \
  http://127.0.0.1:9650/ext/bc/P
```

`unlocked` must be at least `81000000000` (81 LOVE9 in nano) plus a little for fees.

---

## Step 7 — Stake

The transaction is `AddPermissionlessValidatorTx` on P-Chain. A reference implementation is in
this repository at `local-net/tools/stake-validator/` — a Go module **outside** the fork tree, so
using it never changes the patch set you verified in Step 1.

```bash
stake-validator \
  --key <your key file> \
  --node-rpc http://127.0.0.1:9650/ext/info \
  --uri https://rpc-a1.9chain.org \
  --stake 25000 \
  --days 14 \
  --delegation-fee 20000
# add --issue to actually sign and spend
```

It **dry-runs by default** and refuses to issue a transaction that cannot succeed — it measures
your real P-Chain balance first. A dry run that only prints intentions is a dry run that lies.

### Four constraints the tool respects rather than working around

1. **It never reads your BLS secret key.** The proof-of-possession is already published by your
   own node through `info.getNodeID`; only the public half leaves the machine.
2. **It uses a P-Chain-only wallet.** A full wallet fetches C-Chain context from
   `/ext/bc/C/avax`, which the public RPC returns 404 for **deliberately**. Staking does not need
   it.
3. **It tunnels to the node from inside a container.** The wallet SDK calls `<uri>/ext/P`, which
   the public RPC does not serve, and the node's `--http-allowed-hosts` rejects a tunnel reached
   through `host.docker.internal` with a 403. Both are real gates. Forwarding inside the
   container means the wallet genuinely calls `localhost` and neither gate is loosened.
4. **Your key never reaches any server.** It is mounted read-only and the container is removed.

### Verify on chain, not in the tool's output

```bash
curl -s -X POST -H 'content-type:application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"platform.getCurrentValidators"}' \
  https://rpc-a1.9chain.org/ext/bc/P
```

Your nodeID must appear, with the weight you staked. A transaction ID is a receipt; the
validator set is the fact.

---

## After you are in

**Uptime.** Rewards require **80%** uptime measured over your term. That is deliberately looser
than Avalanche mainnet, because community hardware is not datacenter hardware.

**Your term ends.** Stake is returned when the term expires; nothing renews automatically. Read
your own `endTime` from `platform.getCurrentValidators` — do not compute it by hand.

**Watch `ingressConnectionCount`.** On 2026-08-29 we measured a node whose staking port was
provably reachable while this counter sat at **0** for hours. avalanchego cannot distinguish
"nobody dialled in" from "unreachable", but validator uptime is measured over connections, so a
lasting 0 is a real problem even when your port tests open.

**Your RPC is yours.** Nothing requires you to expose one, and we would rather you did not expose
port 9650 at all.

---

## Things that will cost you hours if you skip them

| | |
|---|---|
| `git am` **without** `--keep-cr` | tree hash will not match, and nothing tells you why |
| omitting `--build-arg A1_COMMIT=` | binary cannot be told apart from any other build |
| reusing an old `--data-dir` | node bootstraps into an empty database and looks healthy |
| asking for `AVAX` | fails on purpose; the asset is `LOVE9` |
| publishing port 9650 | Docker's DNAT bypasses `ufw`; your admin API is exposed while the firewall says it is not |
| expecting to stake from X-Chain balance | staking is on P-Chain; export first |
| judging bootstrap at 30 s | measured: ~50 s to bootstrap, ~70 s before non-beacon peers see you |
| trusting HTTP 200 | a status code is the weakest evidence there is. Read the body. |

---

## If it does not work

Tell us what you **measured**, not what you concluded: the output of `--version`, of
`info.getNetworkName`, of `health.health`, and your `sha256sum genesis.json`. Those four lines
identify almost every failure on this page.

**Issue tracker: <https://github.com/9holdings/9chain/issues>.**

That is the only channel, and it is deliberately a public one: a validator problem is almost
always a problem someone else will hit, and an answer given in private helps one person.
