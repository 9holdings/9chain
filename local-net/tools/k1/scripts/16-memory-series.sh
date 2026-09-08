#!/usr/bin/env bash
# Sample a drill band's memory over hours, both halves of the question in one pass:
#
#   anon        cgroup memory.stat `anon`, and per process RssAnon — the memory that has to FIT
#   Go heap     heap_sys / next_gc, per process, from the node's own /ext/metrics
#
# 🔴 Anonymous memory, never VmRSS. Every plugin process maps the SAME plugin binary (65 MB), so a
# sum of VmRSS counts those file-backed pages once per plugin — about 390 MiB of memory that does
# not exist, on a node that has just started. Measured 2026-09-08 on the drill band: cgroup `anon`
# 253 MiB equals the sum of RssAnon exactly, and cgroup `file` is 0.
#
# One JSON line per node per sample, appended. Read it with `17-memory-report.mjs`.
# Usage: 16-memory-series.sh <out.jsonl> <seconds to run> [interval seconds] [name prefix] [count]
set -uo pipefail
OUT="${1:?out.jsonl}"; TOTAL="${2:-14400}"; INTERVAL="${3:-300}"
PREFIX="${4:-9chain-a1-tap-node-}"; COUNT="${5:-9}"

end=$(( $(date +%s) + TOTAL ))
while [ "$(date +%s)" -lt "$end" ]; do
  ts=$(date -u +%FT%TZ)
  k=1
  while [ "$k" -le "$COUNT" ]; do
    svc="$PREFIX$k"; k=$((k + 1))
    id=$(MSYS_NO_PATHCONV=1 docker inspect -f '{{.Id}}' "$svc" 2>/dev/null) || {
      # A container that no longer exists must leave a row saying so. Leaving NO row is worse than
      # a null: the sample then covers fewer nodes and the total silently falls, which reads as
      # memory being released.
      echo "{\"at\":\"$ts\",\"node\":\"$svc\",\"ok\":false}" >> "$OUT"; continue; }

    proc=$(MSYS_NO_PATHCONV=1 docker exec "$svc" sh -c '
      n=0; p=0; c=0
      for d in /proc/[0-9]*; do
        e=$(readlink "$d/exe" 2>/dev/null) || continue
        r=$(sed -n "s/^RssAnon:[[:space:]]*\([0-9]*\) kB/\1/p" "$d/status" 2>/dev/null)
        [ -n "$r" ] || continue
        r=$((r / 1024))
        case "$e" in */plugins/*) p=$((p + r)); c=$((c + 1)); continue;; esac
        case "$(cat "$d/comm" 2>/dev/null)" in avalanchego) n=$((n + r));; esac
      done
      echo "$n $p $c"' 2>/dev/null)

    metrics=$(MSYS_NO_PATHCONV=1 docker exec "$svc" curl -sf -m 20 http://127.0.0.1:9650/ext/metrics 2>/dev/null)
    cg=$(MSYS_NO_PATHCONV=1 docker run --rm -v /sys/fs/cgroup:/cg:ro debian:bookworm-slim bash -c \
      "d=/cg/docker/$id; [ -d \$d ] || d=/cg/system.slice/docker-$id.scope; awk '/^anon /{print int(\$2/1048576)}' \$d/memory.stat" 2>/dev/null)

    printf '%s' "$metrics" | AT="$ts" NODE="$svc" PROC="$proc" CG="${cg:-}" node -e '
      let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
        const lines = s.split("\n").filter((l) => l && !l.startsWith("#"));
        const pick = (stat) => {
          let node = null, plugins = 0, n = 0;
          for (const line of lines) {
            const sp = line.lastIndexOf(" ");
            const key = line.slice(0, sp);
            if (!key.includes(stat)) continue;
            const v = Number(line.slice(sp + 1));
            if (!Number.isFinite(v)) continue;
            if (/chain="/.test(key)) { plugins += v; n++; }
            else if (!/^avalanche_[A-Za-z0-9]{40,}_/.test(key)) node = v;
          }
          return { node, plugins, n };
        };
        const MiB = (b) => (b === null ? null : Math.round(b / 1048576));
        const [pn, pp, pc] = (process.env.PROC || "").trim().split(/\s+/).map(Number);
        const sys = pick("go_memstats_heap_sys_bytes");
        const gc = pick("go_memstats_next_gc_bytes");
        // Recorded so the reader can tell whether next_gc still stands in for the live set: once a
        // GOMEMLIMIT binds, Go lowers the heap goal to respect it and next_gc/2 stops meaning
        // "twice the live heap". Measured 2026-09-08: node-1 next_gc 199 MiB under a 250 MiB limit.
        const lim = pick("go_gc_gomemlimit_bytes");
        const unset = 9223372036854775807 / 2;
        const cg = process.env.CG === "" ? null : Number(process.env.CG);
        const ok = Number.isFinite(pn) && Number.isFinite(pc) && pc > 0 && sys.node !== null && gc.n > 0;
        process.stdout.write(JSON.stringify({
          at: process.env.AT, node: process.env.NODE, ok, plugins: Number.isFinite(pc) ? pc : null,
          anonNode: Number.isFinite(pn) ? pn : null, anonPlugins: Number.isFinite(pp) ? pp : null,
          anonCgroup: Number.isFinite(cg) ? cg : null,
          heapSysNode: MiB(sys.node), heapSysPlugins: sys.n ? MiB(sys.plugins) : null,
          nextGcNode: MiB(gc.node), nextGcPlugins: gc.n ? MiB(gc.plugins) : null,
          limitNode: lim.node !== null && lim.node < unset ? MiB(lim.node) : null,
          limitPlugin: lim.n && lim.plugins / lim.n < unset ? MiB(lim.plugins / lim.n) : null,
        }) + "\n");
      });' >> "$OUT" 2>/dev/null
  done
  sleep "$INTERVAL"
done
echo "{\"at\":\"$(date -u +%FT%TZ)\",\"done\":true}" >> "$OUT"
