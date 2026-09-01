# 9Chain Testnet A1

**A sovereign fork of [avalanchego](https://github.com/ava-labs/avalanchego).** The consensus
engine, the VMs and the P/X/C chain architecture are Ava Labs' work and are left untouched. What
9Chain-A1 replaces is the **identity layer**: network id, network name, address prefix, token,
economic parameters, upgrade schedule.

> ⚠️ **This is a TEST network. LOVE9 has no monetary value.** Do not buy it, do not sell it, do
> not accept it as payment. Test networks are rebuilt; when that happens every balance goes to
> zero and we say so beforehand.

| | |
|---|---|
| Home | <https://a1.9chain.org> |
| C-Chain RPC | `https://rpc-a1.9chain.org/ext/bc/C/rpc` |
| Explorer | <https://a1.9scan.org> |
| Faucet | <https://a1.9chain.org/faucet/> |
| Create your own L1 | <https://a1.9chain.org/create-chain/> |
| Directory of L1s | <https://a1.9chain.org/chains/> |

## Where to start

| You want to | Read |
|---|---|
| **Run a validator** | [docs/RUN-A-VALIDATOR.md](docs/RUN-A-VALIDATOR.md) — rebuild the fork, prove the tree hash, join, stake |
| **Create your own chain** | [docs/CREATE-A-CHAIN.md](docs/CREATE-A-CHAIN.md) — 15 minutes, no prior blockchain knowledge |
| Understand the architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Check the token maths | [docs/TOKENOMICS.md](docs/TOKENOMICS.md) · [docs/ALLOCATION-PUBLIC.md](docs/ALLOCATION-PUBLIC.md) |
| Read what is engraved into genesis | [docs/engrave/](docs/engrave/) |

Vietnamese: [README.vi.md](README.vi.md). This English file is the source; translate from it.

## Identity

| | |
|---|---|
| Node client | `9chaingo` |
| Token | **LOVE9** |
| Address prefix (P/X) | `P-love9…` / `X-love9…` |
| L1 EVM VM id | `love9evm` |
| C-Chain `chainId` | **`9000000009`** — fixed across every generation |
| Network id | derived, see below |

### Generations — the network id is derived, never typed

A1 re-generates its genesis from time to time. Each re-genesis is a **generation**, counted by a
single integer `A1Gen` (`utils/constants/network_ids.go`). Everything else follows from it:

```
networkID   = A1IDGoc − A1Gen        (A1IDGoc = 999999999)
networkName = "9chain-a1-g{A1Gen}"
L1 chainId block = 9_000_000_000 + A1Gen × 1_000_000 + 10 … +999_999
```

Generation `g1` therefore runs on networkID **999999998**, name `9chain-a1-g1`.

Two safety properties hold at every generation, and both are deliberate:

- **The drill band can never handshake with the real one.** Rehearsal networks are generated from
  `A1IDGocTap = 899999999`, a separate band. A node from a drill cannot join the public network by
  accident, whatever anyone types.
- **Each generation owns a disjoint block of L1 chainIds.** A chain from a retired generation
  cannot silently point at a new user's L1, and a signature from one cannot replay on the other
  (EIP-155 binds signatures to `chainId`).

🔴 `A1Gen` is **written in two languages** — Go (`A1Gen`) and JavaScript
(`local-net/lib/chainid.mjs` → `A1_GEN`). Bump one and forget the other and nothing raises an
error: the chain-creation console would hand out chainIds from a different generation's block, and
those numbers reach users' wallets through an immutable genesis. `node scripts/check-consistency.mjs`
is the gate that compares the two.

## Economics

| | |
|---|--:|
| **Announced total supply** | **9,000,000,000 LOVE9** |
| `SupplyCap` compiled into the binary | 7,900,000,001 LOVE9 |
| Issued at genesis | 5,400,000,000 (60%) |
| Allocation | Staking 40 · Community 30 · Foundation 12 · Private Sale 9 · Team 9 |
| Validators | 9 nodes, self-bond 999,999 LOVE9 each |

🔴 **`SupplyCap` is NOT the total supply, and reconciling the two would mint 1.1 billion tokens.**
`SupplyCap` bounds `currentSupply` **on the P-Chain**, and `currentSupply` does not count the
C-Chain allocation. The invariant `netgen` enforces (`mustFitSupplyCap()`) is:

```
SupplyCap (7,900,000,001)  +  Σ bucket.CChain (1,099,999,999)  ==  9,000,000,000
```

⚠️ **LOVE9 has 9 decimals on P/X-Chain and 18 on the C-Chain.** Both are correct — one coin, two
scales. See [docs/TOKENOMICS.md §0](docs/TOKENOMICS.md).

🔴 `SupplyCap` is **compiled into the binary**, not read from `genesis.json`. Changing it means
rebuilding the node image, not just regenerating genesis.

## Reproducing the fork

You are not asked to trust a binary. The sovereignty layer is distributed as a patch series that
replays onto a clean upstream checkout and must land on a known tree hash.

```bash
git clone https://github.com/ava-labs/avalanchego.git && cd avalanchego
git checkout 1cf1fc3
git am --keep-cr /path/to/9chain-a1/patches/*.patch
git rev-parse HEAD^{tree}     # 387238778dda96d58cabe6f9ddd7097e208b69e9
```

`--keep-cr` is not optional: without it line endings shift and the tree hash will not match.

**Counter-check — do this too.** Applying **26 of the 27** patches must yield a different,
also-published tree: `60a61707f7974a0f1853b8bf78df7d0fdc1ef863`. One anchor only proves the patch
set agrees with a number we printed in our own documentation; two anchors with independent origins
say something. Full walkthrough in [docs/RUN-A-VALIDATOR.md](docs/RUN-A-VALIDATOR.md).

## What the identity layer actually changes

| Touch point | File | From | To |
|---|---|---|---|
| Client / node name | `version/constants.go` | `avalanchego` | `9chaingo` |
| Token name | `genesis/genesis.go` | `Avalanche` | `LOVE9 Coin` |
| Token symbol | `genesis/genesis.go` | `AVAX` | `LOVE9` |
| Address HRP | `utils/constants/network_ids.go` | `custom` | `love9` |
| L1 EVM VM id | `graft/subnet-evm/scripts/constants.sh` | `subnetevm` | `love9evm` |
| Economic parameters | `genesis/genesis_9chain_a1.go` | `LocalParams` | `A1Params` |
| Network id | `utils/constants/network_ids.go` (`A1ID`) | `12345` | `A1IDGoc − A1Gen` |
| Network name | `utils/constants/network_ids.go` (`A1Name`) | `local` | `9chain-a1-g{N}` |
| C-Chain chainId | `9chain-a1-tools/netgen/main.go` | `43112` | `9000000009` |
| Upgrade schedule | `upgrade/upgrade.go` (`A1`) | Ava Labs' `Default` | `A1` |

**Untouched:** `snow/` (consensus), `vms/` (virtual machines), `chains/`. That is the core, and it
stays upstream's.

The asset alias is **`LOVE9`, and only `LOVE9`**. Asking the X-Chain for `AVAX` returns an error
that says so in full. That error is the feature, not an oversight.

## Repository layout

```
9Chain-A1/
├── patches/                   # 27 patches replaying the sovereignty layer onto 1cf1fc3
├── upstream/avalanchego/      # the fork itself (separate repository, not tracked here)
│   └── 9chain-a1-tools/       #   sovereignty overlay — does not touch core
│       ├── netgen/            #     generate keys + genesis + an N-node compose file
│       ├── engrave-verify/    #     read the genesis engraving back, from file AND from chain
│       ├── 9chain-a1-cli/     #     L1 factory CLI
│       └── xp-wallet/         #     X/P wallet
├── local-net/
│   ├── console/               # chain-creation service (sign-in with Ethereum)
│   ├── faucet/                # faucet API
│   ├── chains/                # public L1 directory
│   ├── deploy/                # Caddyfile + deployment scripts
│   └── gen-network.sh         # one command, a real N-node network
├── scripts/                   # the gates — see below
├── 9chain-a1-config/
│   └── l1-evm-genesis.json    # SHAPE of an L1 EVM genesis, not a usable one (see note)
├── web/                       # public site (Next, static export)
└── docs/
```

⚠️ `local-net/net*/` holds **private keys** (`keys.txt`, `faucet.env`). It is git-ignored and must
never be committed.

⚠️ `9chain-a1-config/l1-evm-genesis.json` is a **template, not a usable genesis**: it declares a
`chainId` that is already taken in the public registry and grants the whole supply to the `ewoq`
key, which is published in the avalanchego repository. Every path that creates an L1 builds a real
genesis through `scripts/make-l1-genesis.mjs` instead. Handing the template to the CLI as-is is a
mistake the tooling now refuses to make for you.

## Gates

This project's most expensive class of failure is **measuring the wrong quantity** — every check
green because all of them measured the same wrong thing. The gates exist against that, and each
one carries a counter-check that must have been seen **red for the right reason**.

```bash
node scripts/gday-preflight.mjs        # the whole gate set in one command, plus the manual tasks it cannot automate
node scripts/check-consistency.mjs     # tokenomics arithmetic, read straight out of the Go source
node scripts/check-single-source.mjs   # one constant, declared in exactly one place
node scripts/check-net-dirs.mjs        # which local network directory belongs to which generation
node scripts/watch-network.mjs         # measured on the RUNNING node, not on the repository
```

Exit codes are uniform across the set: **0** pass · **1** red · **2** could not measure. A `2` is
never a pass.

## Running a network locally

Requires Docker. `avalanchego` does not build natively on Windows, so everything goes through a
container.

```bash
NETWORK_ID=899999999 bash local-net/gen-network.sh 5
```

🔴 **`NETWORK_ID` is mandatory.** There used to be a default and it was a dead generation. Choosing
a band is a decision, so the tool makes you make it. Use the **drill** band (`899999999` and down)
for anything local; it can never handshake with the public network.

🔴 **Measure the binary, not the network.** A node boots cleanly on the wrong binary — a genesis of
5.4 billion loads onto a binary compiled for a different supply without complaint, and the
divergence only surfaces in staking rewards days later. Also, `netgen` hardcodes the image tag into
the compose file it writes, and no environment variable overrides it:

```bash
grep image: <net>/docker-compose.multinode.yml      # BEFORE `up`
docker exec 9chain-a1-node-1 ./avalanchego --version # then measure the binary
```

## Genesis engraving

A1's genesis carries text: on the P-Chain `Message` field (the root surface) and, for the English
documents, as contract code at a fixed C-Chain address. See [docs/engrave/](docs/engrave/) for the
canon — id, sha256, byte count for each document — and `docs/GDAY-ENGRAVING.md` for the mechanism.

🔴 **`0x9000000000000000000000000000000000000009` is nobody's wallet.** It holds the engraved text
as contract code with a zero balance, and no private key for it exists — deriving one is a 2^160
problem, so not even we can touch that text. That is the point. But it is also a short, memorable,
all-digit address on a chain whose parent `chainId` is `9000000009`, which is exactly the shape
somebody mistakes for a treasury: **anything sent there is burned, permanently.**

## Licence

Project code: **BSD-3-Clause** — see [LICENSE](LICENSE).

🔴 Third-party components keep their own licences: **avalanchego** (BSD-3-Clause, Ava Labs) —
including the avalanchego code carried inside `patches/` — and **coreth / subnet-evm**
(**LGPL-3.0**, derived from go-ethereum). Anyone redistributing a node image must meet the LGPL
obligations. Full list: [NOTICE](NOTICE).

"Avalanche" and "AvalancheGo" are trademarks of Ava Labs, Inc. 9Chain-A1 does not use them as
branding; where they appear it is to state the software's origin accurately. This is an independent
project, not affiliated with Ava Labs.
