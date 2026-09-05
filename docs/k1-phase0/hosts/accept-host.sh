#!/usr/bin/env bash
# Acceptance test for ONE K1 host. Every line must be ✓ before the host gets nodes. Exit 1 on any ✗.
# Run ON the host as root:  bash accept-host.sh [image-sha256-from-dev]
#
# This gate must be SEEN RED once (run it on a VM without Docker) before its green means anything —
# the project's hard rule #2. Thresholds come from PROCUREMENT-K1 §6 and EVIDENCE-2026-09-05.md.
set -uo pipefail
WANT_SHA="${1:-}"
rc=0
ok()  { printf "✓ %-28s %s\n" "$1" "$2"; }
bad() { printf "✗ %-28s %s\n" "$1" "$2"; rc=1; }

threads=$(nproc); [ "$threads" -ge 8 ] && ok "cpu threads" "$threads" || bad "cpu threads" "$threads < 8"
ram_gb=$(awk '/MemTotal/ {printf "%d", $2/1024/1024}' /proc/meminfo); [ "$ram_gb" -ge 32 ] && ok "ram GB" "$ram_gb" || bad "ram GB" "$ram_gb < 32"
disk_gb=$(df -BG --output=avail /var/lib/docker 2>/dev/null | tail -1 | tr -dc '0-9'); [ -z "$disk_gb" ] && disk_gb=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
[ "${disk_gb:-0}" -ge 400 ] && ok "disk free GB (docker)" "$disk_gb" || bad "disk free GB (docker)" "${disk_gb:-0} < 400 — 8 nodes × 15 ledgers at r=1 need ~315 GB/30 days"

if command -v docker >/dev/null; then
  dv=$(docker version --format '{{.Server.Version}}' 2>/dev/null | cut -d. -f1); [ "${dv:-0}" -ge 27 ] && ok "docker" "$(docker version --format '{{.Server.Version}}')" || bad "docker" "server ${dv:-none} < 27"
  cv=$(docker compose version --short 2>/dev/null); cmaj=${cv%%.*}; cmin=$(echo "$cv" | cut -d. -f2)
  if [ "${cmaj:-0}" -gt 2 ] || { [ "${cmaj:-0}" -eq 2 ] && [ "${cmin:-0}" -ge 24 ]; }; then ok "compose (!override)" "$cv"; else bad "compose (!override)" "${cv:-none} < 2.24"; fi
  nf=$(systemctl show docker -p LimitNOFILE --value 2>/dev/null); [ "${nf:-0}" = "infinity" ] || [ "${nf:-0}" -ge 1048576 ] && ok "docker LimitNOFILE" "$nf" || bad "docker LimitNOFILE" "${nf:-unset} < 1048576"
else
  bad "docker" "not installed"
fi

if command -v chronyc >/dev/null; then
  off=$(chronyc tracking 2>/dev/null | awk '/System time/ {print $4}'); offms=$(awk -v o="${off:-9}" 'BEGIN{printf "%d", o*1000}')
  [ "$offms" -lt 100 ] && ok "clock offset ms" "$offms" || bad "clock offset ms" "$offms ≥ 100"
else bad "chrony" "not installed"; fi

# P2P ports must be reachable from OUTSIDE; that is measured from the measure host, not here. Here: are they bound?
for p in 9651 9652 9653 9654 9655 9656 9657 9658; do
  if ss -ltn 2>/dev/null | grep -q ":$p "; then ok "port $p bound" "yes"; else printf "· %-28s %s\n" "port $p bound" "not yet (nodes not started) — fine before deploy"; fi
done
if nft list ruleset 2>/dev/null | grep -q 'tcp dport 9651-9670 accept'; then
  nft list ruleset | grep -q '127.0.0.1' && bad "nftables ADMIN" "still the 127.0.0.1 placeholder — fill router/measure IPs" || ok "nftables" "K1 ruleset loaded"
else printf "· %-28s %s\n" "nftables" "K1 ruleset not loaded yet (enable after ADMIN is filled)"; fi

# Hairpin: Docker does NOT DNAT a container's traffic to the host's own public IP (patch 0024 measured it).
# Record the result so nobody designs around the wrong assumption; ✗ is the EXPECTED answer.
pub=$(curl -4 -fsS --max-time 5 https://ifconfig.me 2>/dev/null || true)
if [ -n "$pub" ] && command -v docker >/dev/null && ss -ltn | grep -q ':9651 '; then
  if docker run --rm --network bridge alpine:3 sh -c "nc -z -w2 $pub 9651" 2>/dev/null; then ok "hairpin to $pub:9651" "reachable (unusual — note it)"; else printf "· %-28s %s\n" "hairpin to $pub:9651" "not reachable from a container — EXPECTED; beacon must use internal IP on its own host"; fi
fi

if [ -n "$WANT_SHA" ] && command -v docker >/dev/null; then
  got=$(docker image inspect 9chain-a1/node:g1-81 --format '{{.Id}}' 2>/dev/null)
  [ "$got" = "$WANT_SHA" ] && ok "image g1-81 id" "$got" || bad "image g1-81 id" "${got:-missing} ≠ $WANT_SHA"
fi

[ $rc -eq 0 ] && echo "ACCEPT ✓ $(hostname)" || echo "REJECT ✗ $(hostname) — fix every ✗ above before this host gets nodes"
exit $rc
