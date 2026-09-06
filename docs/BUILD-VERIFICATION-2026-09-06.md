# A1 source replay, cold compilation and selected core tests

Measured locally on 2026-09-06 during the authorized autonomous development window.
No public deployment, public transaction, validator/genesis change or existing
operational-data deletion was performed. This is build/test evidence, not acceptance
of a running blockchain network.

## Fixed source and independent patch anchor

- Fork commit: `66e57766dccd98b2dbc214cf3edff7483ef41c07`.
- Fork tree: `387238778dda96d58cabe6f9ddd7097e208b69e9`; original checkout remained clean.
- A fresh local shared clone checked out base `1cf1fc3` and applied patches with
  `git am --keep-cr`. It did not modify the original fork or patch files.
- Applying 26 of 27 patches produced the independent previous tree
  `60a61707f7974a0f1853b8bf78df7d0fdc1ef863`.
- Applying the final patch produced the exact current fork tree above. The replay
  checkout was clean and retained under `work/fork-replay-20260906`.
- Logs/summary: `work/fork-replay-20260906.log` and `.json`.

The cold build input was a Git archive of that clean fork commit, 58,122,240 bytes.
Its SHA-256 is `50e337ac2c824a1a2a524ecdff0fe3e797f143e7f841a9f33ba81937b4388b84`.
The existing rebrand script did not change any extracted source bytes, verified
against a complete file checksum list before compilation and again afterwards.

## Two independent cold builds

Both used Linux amd64 and
`golang@sha256:154bd7001b6eb339e88c964442c0ad6ed5e53f09844cc818a41ce4ecb3ce3b43`
(the locally installed Go 1.25.10 Bookworm image). Each had a separate new Docker
volume, initially absent Go build/module caches, 4 CPUs, 6 GiB RAM, a read-only
container root and read-only source inputs. Neither published ports. Network access
was used for Go dependencies. An outer two-hour timeout bounded each run.

| Run | Container and volume name | Start UTC | Finish UTC | Result |
|---|---|---|---|---|
| First | a1-autopilot-cold-build-20260906 | 18:21:50.968 | 18:25:07.942 | exit 0, no OOM; about 3m 17s |
| Repeat | a1-autopilot-cold-build-repeat-20260906 | 18:26:27.381 | 18:30:42.770 | exit 0, no OOM; about 4m 15s |

The recipe ran the existing node and subnet-EVM build scripts and built the three
overlay tools using the same commands as the node Dockerfile. Inputs and recipe are
retained in `work/cold-build-20260906`, including `inputs.sha256` and `run-build.sh`.
It assembled a binary directory; it did not build a new final deployment image.
The source archive has no `.git`, so the subnet build's optional image-tag discovery
prints Git repository warnings and selects its documented fallback. Those warnings
did not change the explicit binary commit identity or cause a build failure.

`GOCACHE`, `GOMODCACHE` and build paths were identical inside the two separate
containers. This is a same-environment reproducibility measurement, not a guarantee
for other compilers, architectures or source paths. Third-party modules and any
artifacts distributed inside those modules were downloaded according to Go module
resolution; this is not a rebuild of every third-party dependency from its origin.

A deliberately corrupt synthetic archive failed input SHA-256 verification before
extraction/compilation, exit 1. The negative container had no network access. It used
no real operational data. Log: `work/cold-build-negative-20260906.log`.

## Binary comparison and runtime smoke check

Both artifact manifests were independently verified, then each of the five binaries
was compared with `cmp` through read-only volume mounts. All five were byte-identical.

| Binary | SHA-256 |
|---|---|
| avalanchego | d27ad07d03ea61da71e45ca2fe7fc7c487dce3cc32b9c043418d03a252c88cd0 |
| create-l1 | f63eb8e344dc14c53de701e0d406fa494ed6749fbd787749845afbf504dfa124 |
| 9chain-a1-cli | bcbc657e79d263de971f560eb19b056ce89e1c2ec2b28dd1146767c623704eb6 |
| xp-wallet | d9b02981fcc32e1b3314cca47c8479979a817d6348c0059116a5a41556393fb8 |
| L1 VM plugin | 099718d9502c7fa824eac5e3855e814ee5c39486403be53fb5a373894f19fdf2 |

The newly compiled node also ran `--version` in a separate Debian 12 slim container
with no network, read-only mounts and 128 MiB memory limit. It reported:

```text
9chaingo/1.14.2 [database=v1.4.5, rpcchainvm=45, commit=9chain-a1-g1-27patch-38723877, go=1.25.10]
```

This proves binary startup/version reporting in that runtime, not database boot,
plugin RPC handshake, block production or validator agreement. Artifacts and logs:

- `work/cold-build-20260906/artifacts/`: first run's five binaries, version, Go build
  information and SHA256SUMS.txt; the plugin is in `plugins/`.
- `container.log`, `repeat-container.log`, `comparison.log`, `runtime-version.log`
  and `repeat.SHA256SUMS.txt` in the same parent directory.
- Docker volumes and exited containers are retained for evidence. Do not delete
  any similarly named operational network or another project's resources.

Each build reported approximately 1.6G build cache, 744M module cache and 291M assembled
artifacts via `du -sh`. These are selected directory sizes, not peak RAM or total
volume usage. CPU/RAM figures above are enforced limits, not minimum requirements
or a capacity estimate for running many chains.

## Selected core test baseline

Using the first build's source/cache, dependencies were prepared in a separate
bounded container. The test container itself had `network=none`, `GOPROXY=off`,
`GOSUMDB=off`, 4 CPUs, 6 GiB memory and a 30-minute outer timeout. It ran:

```bash
go test -json -count=1 -timeout=10m ./snow/consensus/... ./snow/engine/snowman/... ./chains/...
```

Measured 18:31:02.925–18:31:11.337 UTC: exit 0, no OOM, **16 packages passed,
195 top-level tests and 218 subtest pass events, zero failures**. Eight additional
packages had no test files and were not counted as tested packages. The extracted
source checksum list still passed after the tests. This was a normal test run,
without the race detector, using caches populated by compilation.

Evidence: `work/core-test-20260906/results.jsonl`, `summary.json`, `prepare.log`,
`container.log`, `prepare.sh` and `run-tests.sh`. Container:
`a1-autopilot-core-test-20260906` (exited). This selects consensus/engine/chain-manager
tests; it does not claim all AvalancheGo packages, full protocol audit, live
multi-node consensus, load capacity or a deployment rehearsal.

## Remaining work

Keep the public rollout review gate. The console reliability changes made in this
window are separate from this unchanged fork build. Further integration needs
explicit target identity and acceptance criteria, especially all-node L1 readiness,
recovery after partial rollout, database persistence and measured resource cost per
active chain. Do not translate a successful compile into a scaling-capacity claim.
