# Published genesis files

This directory exists so that an outsider can join the network. Without the
genesis bytes, `--genesis-file=` cannot be filled in, and a public RPC endpoint
is not the same thing as a public testnet.

| file | generation | networkID | sha256 |
|---|---|---|---|
| [`genesis-g1.json`](genesis-g1.json) | `9chain-a1-g1` — **live** | `999999998` | `4de8caa5…0f6ee6` |

## Why the file is copied here instead of linked

The working copy lives at `local-net/net-g1/genesis.json`, which is **not
tracked by git**: `.gitignore` excludes `local-net/net-*/` because those
directories are where netgen writes `keys.txt`, `staker.key` and `signer.key`.
That rule is correct and must stay — but it swept up the one file in there that
is meant to be public, and the result was that the bytes the whole world needs
existed in exactly two operational places (one dev machine, one server) and in
no repository, no backup, and no release.

So the file is copied to a tracked path rather than un-ignoring the directory.
Un-ignoring would put key material one `git add` away from being published.

## What is in it, and why publishing it is safe

Checked field by field on 2026-09-02 before it was tracked:

- 6 `allocations` — addresses and amounts only
- 9 `initialStakers` — `nodeID`, `rewardAddress`, and a BLS `signer`
  (`publicKey` 48 bytes, `proofOfPossession` 96 bytes). Both are **public by
  design**: every node broadcasts them during the P2P handshake.
- `cChainGenesis` — the C-Chain genesis as an escaped JSON string, including
  the canon engraving stored as contract code at
  `0x9000000000000000000000000000000000000009`
- no 32-byte secret of any kind

⚠️ A first scan with `grep -oE '0x[0-9a-fA-F]{64}'` appeared to find ten private
keys. It had matched the **first 64 hex characters of the 96-character BLS
public keys** — an unanchored pattern reading the head of a longer value. Anchor
the pattern (`(?![0-9a-fA-F])`) and group by length before concluding anything
about a file like this one.

## The generation rule

The filename carries the generation, and a published file is **never**
overwritten. A re-genesis adds `genesis-g2.json` beside this one and leaves this
file alone, so a URL somebody saved keeps resolving to the bytes they verified.

🔴 This copy is a second declaration of the network's identity, which is the
error class this project keeps paying for. It is held in place by hash: the
same `sha256` appears in [`RUN-A-VALIDATOR.md`](../RUN-A-VALIDATOR.md), in
[`TOKENOMICS.md`](../TOKENOMICS.md), on the server at `~/9chain-a1/net/genesis.json`,
and in this table. Four places, one value — verified together, not one at a time.

```bash
sha256sum docs/genesis/genesis-g1.json
```

## Bootstrap

Genesis alone does not let a node in; it also needs somebody to dial:

```
beacon nodeID     NodeID-MrgP69AZRSeJ3DQRSBWQzqeqovNcTAsEb
beacon address    139.99.145.13:9651
```

Full instructions: [`RUN-A-VALIDATOR.md`](../RUN-A-VALIDATOR.md).
