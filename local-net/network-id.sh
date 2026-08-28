#!/usr/bin/env bash
#
# network-id.sh — derive `NETWORK_ID` FROM THE VERY GENESIS ABOUT TO BE MOUNTED, then export.
# Load with `source`; do not execute directly.
#
# ═══ 🔴 WHY THIS FILE EXISTS ═══
#
# Until 2026-08-28, four compose files hardcoded `--network-id=9001` — a generation that
# died on 2026-08-27. And `local-net/net/genesis.json` on the dev machine was ALSO a 9001
# set. The two AGREED, so the node booted cleanly, health went green, every gate went green
# — while the thing actually running was a network that **no longer exists anywhere**.
#
# That is this project's most expensive failure class in its purest form: **internal
# consistency is not evidence of being alive.** Two hand-copied constants in two files, with
# no gate joining them.
#
# ⇒ Nobody copies it by hand any more: `NETWORK_ID` is a **function of the genesis**. A
# compose file cannot disagree with the genesis it mounts, because it no longer holds a
# number of its own. Same discipline already applied to netgen (`NETWORK_ID` mandatory,
# D-083) and to `A1Gen ↔ A1_GEN` (`check-consistency.mjs` joins the two languages, D-093).
#
# Usage:
#   source "$ROOT/local-net/network-id.sh" "$ROOT/local-net/net/genesis.json"

a1_export_network_id() {
  local genesis="$1"
  if [ ! -f "$genesis" ]; then
    echo "    ERROR: missing $genesis" >&2
    echo "    -> run 'NETWORK_ID=<band> bash local-net/gen-network.sh <N>' first." >&2
    return 1
  fi

  local nid
  nid="$(node -e '
    const g = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"));
    if (typeof g.networkID !== "number") { console.error("genesis has no numeric networkID"); process.exit(1); }
    console.log(g.networkID);
  ' "$genesis")" || return 1

  export NETWORK_ID="$nid"

  # State the generation on screen. A bare number cannot say whether it is still alive, and
  # silence here is exactly what let the dev network run a dead generation for days.
  #
  # Paths are derived from THIS FILE's own location, not from the cwd — the three callers sit
  # in three different directories, and one misplaced `./` would make the cross-check vanish
  # in silence.
  local here lib live
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  lib="$here/lib/chainid.mjs"
  live="$(node -e '
    import("file://" + process.argv[1]).then((m) => console.log(m.A1_ID_GOC - m.A1_GEN));
  ' "$lib" 2>/dev/null)"

  if [ "$nid" = "$live" ]; then
    echo "    NETWORK_ID=$nid  (REAL band — MATCHES the generation running in public)"
  elif [ "$nid" -le 899999999 ] && [ "$nid" -ge 899999000 ]; then
    echo "    NETWORK_ID=$nid  (DRILL band — can never handshake with the real network)"
  elif [ "$nid" -le 999999999 ] && [ "$nid" -ge 999999000 ]; then
    echo "    NETWORK_ID=$nid  (REAL band, DIFFERENT generation — not the live network)"
  else
    echo "    NETWORK_ID=$nid  🔴 OUTSIDE EVERY 9Chain-A1 BAND — almost certainly a DEAD generation." >&2
    echo "       This net/ set predates 2026-08-27. Regenerate: NETWORK_ID=899999999 bash local-net/gen-network.sh <N>" >&2
  fi
}

a1_export_network_id "$1"
