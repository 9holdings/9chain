#!/usr/bin/env bash
# Run stake-validator with the SSH tunnels INSIDE the container (the M11.10 shape, D-091).
#
# 🔴 WHY THE TUNNELS ARE INSIDE, NOT OUTSIDE
#
# The wallet SDK talks to `<uri>/ext/P`, and the public RPC serves only `/ext/bc/*` and
# `/ext/info` - `/ext/P` is 404 out there. So the wallet must reach a node directly. But the node
# also enforces `--http-allowed-hosts=localhost,127.0.0.1`, so a tunnel on the Windows host
# reached via `host.docker.internal` gets 403: the Host header is wrong.
#
# Both of those are REAL gates (M11.10). Widening either to make this script simpler would trade
# a security boundary for convenience. Forwarding inside the container instead means the wallet
# genuinely calls `localhost`, and both gates stay exactly as tight as they were.
#
# The fund key is mounted read-only from the dev machine and never leaves it: the container is
# removed on exit, and no key is written to any server.
#
# Usage:
#   bash run-over-tunnel.sh                 # dry run
#   bash run-over-tunnel.sh --issue         # signs and spends - a human decision
set -euo pipefail

# 🔴 Git Bash (MSYS) rewrites any argument that looks like a Unix path, so `-w /src/...` arrives
# at docker as `C:/Program Files/Git/src/...` and it refuses. Documented in
# docs/O1-CUSTODY-VERIFICATION.md, and stepped on again while writing this file. Setting it here
# means the caller cannot forget.
export MSYS_NO_PATHCONV=1

# 🔴 The A1 server's address and key have ONE declaration, in deploy/server-env.sh. Copying
# them here would put the same constant in a second place, which check-single-source.mjs
# catches — and rightly: the day that host moves, a copy nobody remembers is the one that
# keeps pointing at the old machine.
source "$(dirname "${BASH_SOURCE[0]}")/../../deploy/server-env.sh"

REPO=${A1_REPO:-C:/PROJECTS/9Chain-A1}
KEYS=${A1_KEYS:-C:/Users/abc/9chain-a1-keys/g0}
A1_HOST=$A1_SSH_HOST
VDR_HOST=${VDR_HOST:-root@95.217.60.140}
VDR_SSH_KEY=${VDR_SSH_KEY:-$HOME/.ssh/id_ed25519}
VDR_API_PORT=${VDR_API_PORT:-9655}

docker run --rm \
  -v "${REPO}:/src" \
  -v "${KEYS}:/keys:ro" \
  -v "${A1_SSH_KEY}:/ssh/a1:ro" \
  -v "${VDR_SSH_KEY}:/ssh/vdr:ro" \
  -v 9chain-gomod:/go/pkg/mod \
  -w /src/local-net/tools/stake-validator \
  golang:1.25.10 sh -c "
    set -e
    command -v ssh >/dev/null || { apt-get update -qq && apt-get install -y -qq openssh-client >/dev/null; }
    # Mounted keys look 0777 from NTFS and ssh refuses them; copy and tighten inside.
    cp /ssh/a1 /tmp/a1 && cp /ssh/vdr /tmp/vdr && chmod 600 /tmp/a1 /tmp/vdr
    ssh -o StrictHostKeyChecking=no -o BatchMode=yes -o ExitOnForwardFailure=yes \
        -f -N -L 9650:127.0.0.1:9650 -i /tmp/a1 ${A1_HOST}
    ssh -o StrictHostKeyChecking=no -o BatchMode=yes -o ExitOnForwardFailure=yes \
        -f -N -L ${VDR_API_PORT}:127.0.0.1:${VDR_API_PORT} -i /tmp/vdr ${VDR_HOST}
    go run . \
      --key /keys/keys.txt --fund foundation \
      --uri http://localhost:9650 \
      --node-rpc http://localhost:${VDR_API_PORT}/ext/info \
      $*
  "
