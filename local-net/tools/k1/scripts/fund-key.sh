#!/usr/bin/env bash
# Print the P-Chain funding key for the drill: the [foundation] entry of netgen's keys.txt
# (71,000,009 LOVE9 liquid on X/P). Drill-band keys are not secrets, but the file is still
# written with the production layout, so read it the way the production one must be read:
# by section, never by "the first PrivateKey- line" (that is the LOCKED staking fund).
set -euo pipefail
cd "$(dirname "$0")/.."
awk '/^\[foundation\]/{f=1} f && /PrivateKey/{print $3; exit}' out/net/keys.txt
