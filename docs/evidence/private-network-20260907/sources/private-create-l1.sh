#!/bin/sh
set -eu
test "$#" = 2
case "$1" in PrivateL1[123]) ;; *) echo 'Invalid private chain name' >&2; exit 1;; esac
case "$2" in http://a1-private-*-node1:9650) ;; *) echo 'Invalid private node URI' >&2; exit 1;; esac
A1_CLI_KEY="$(awk '/^\[foundation\]/ {found=1; next} found && /PrivateKey/ {print $3; exit}' /material/keys.txt)"
case "$A1_CLI_KEY" in PrivateKey-*) ;; *) echo 'Synthetic foundation key not found' >&2; exit 1;; esac
export A1_CLI_KEY
exec /9chain-a1/build/9chain-a1-cli l1 create --uri "$2" --genesis "/genesis/$1.json" --name "$1"
