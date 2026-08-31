# Engraving materials for the g1 genesis

| File | What it is |
|---|---|
| `manifest.json` | What netgen reads: which document goes on which surface, in which order, and the data-contract address |
| `CANON.txt` | **9Chain-A1's canon.** id · sha256 · byte length for every engraved document. This is what `A1_ENGRAVE_CHECKSUMS` points at |
| `*.txt` (the documents) | The bytes themselves, verbatim |
| `attestation-2026-08-07.txt` | **Evidence, not a dependency.** A dated third-party freeze carrying the same four hashes, kept because an attestation made earlier by someone else is worth more than one A1 writes about itself. **Nothing in the build reads it.** Deleting it changes no output |

## Build

```bash
A1_ENGRAVE=/repo/docs/engrave/manifest.json \
A1_ENGRAVE_CHECKSUMS=/repo/docs/engrave/CANON.txt \
A1_ENGRAVE_CONFIRM=<fingerprint netgen prints> \
bash local-net/gen-network.sh <N>
```

Paths are **as seen inside the container** — `gen-network.sh` mounts the repo read-only at `/repo`
and refuses anything outside it.

## 🔴 What pointing the gate at `CANON.txt` costs

`netgen` compares every document hash against the file named by `A1_ENGRAVE_CHECKSUMS`. That check
exists to catch someone **retyping** a document instead of copying its bytes, and it is strongest
when the file it compares against was written **earlier, by someone else**. `CANON.txt` is written
by A1, from A1's own files — so on its own it proves internal consistency, not independent origin.
That is the D-112 shape, stated rather than hidden.

What still holds it up: the four hashes in `CANON.txt` are identical to the ones in
`attestation-2026-08-07.txt`, which predates this file and was produced elsewhere. Anyone can
compare the two in one command. The build does not depend on that file existing — the evidence
does.

⚠️ And the check netgen cannot make at all: it ties a hash to a **filename or id**, never to
meaning. A manifest pointing `genesis_inscription` at the wrong document can still print a green
line. **Read the table netgen prints before confirming the fingerprint** — two rows sharing a
sha256, or a `lang` that does not match the document you expect, is the only signal there is.
