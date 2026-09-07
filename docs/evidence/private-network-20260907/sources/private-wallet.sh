#!/bin/sh
set -eu
WALLET_KEY="$(awk '/^\[foundation\]/ {found=1; next} found && /PrivateKey/ {print $3; exit}' /material/keys.txt)"
case "$WALLET_KEY" in PrivateKey-*) ;; *) echo 'Synthetic foundation key not found' >&2; exit 1;; esac
export WALLET_KEY
exec timeout 1200 /9chain-a1/build/xp-wallet
