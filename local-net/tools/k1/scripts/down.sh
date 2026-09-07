#!/usr/bin/env bash
# Stop the drill cluster. `--wipe` also removes the data volumes (a fresh chain next time).
# Restarting WITHOUT --wipe is how --track-subnets changes take effect: it is a startup flag.
set -euo pipefail
cd "$(dirname "$0")/.."
FILES=(-f out/net/docker-compose.multinode.yml)
[ -f out/plan/docker-compose.k1.yml ] && FILES+=(-f out/plan/docker-compose.k1.yml)
[ -f out/plan/docker-compose.base.yml ] && [ ! -f out/plan/docker-compose.k1.yml ] && FILES+=(-f out/plan/docker-compose.base.yml)
if [ "${1:-}" = "--wipe" ]; then
  MSYS_NO_PATHCONV=1 docker compose -p k1p0 --env-file out/net/.env "${FILES[@]}" down -v
else
  MSYS_NO_PATHCONV=1 docker compose -p k1p0 --env-file out/net/.env "${FILES[@]}" down
fi
