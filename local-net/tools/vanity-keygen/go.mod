module 9chain-a1/vanity-keygen

go 1.25.10

require github.com/ava-labs/avalanchego v1.14.2

require (
	github.com/ava-labs/libevm v1.13.15-0.20260810153857-c1a647408c12 // indirect
	github.com/btcsuite/btcd/btcec/v2 v2.3.5 // indirect
	github.com/btcsuite/btcd/btcutil v1.1.3 // indirect
	github.com/decred/dcrd/dcrec/secp256k1/v4 v4.4.0 // indirect
	github.com/google/renameio/v2 v2.0.0 // indirect
	github.com/holiman/uint256 v1.2.4 // indirect
	github.com/mr-tron/base58 v1.2.0 // indirect
	golang.org/x/crypto v0.52.0 // indirect
	golang.org/x/sys v0.45.0 // indirect
)

// 🔴 Points at the A1 FORK, never upstream — same reason as stake-validator: the sovereign
// build is the one whose address formatting and constants belong to this network.
replace github.com/ava-labs/avalanchego => ../../../upstream/avalanchego

// 🔴 Go does NOT inherit a dependency's own `replace` lines; without these three the build
// resolves the graft modules from the registry and fails deep inside coreth.
replace github.com/ava-labs/avalanchego/graft/coreth => ../../../upstream/avalanchego/graft/coreth

replace github.com/ava-labs/avalanchego/graft/evm => ../../../upstream/avalanchego/graft/evm

replace github.com/ava-labs/avalanchego/graft/subnet-evm => ../../../upstream/avalanchego/graft/subnet-evm
