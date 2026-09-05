/** The My chains screen (`/my-chains/`); a few keys are reused by the directory. */
export const EN_MY_CHAINS = {
  myChains: {
    title: 'My chains',
    desc: 'The L1s owned by the wallet you signed in with. They can be revoked, but read the warning first.',
    connectWallet: 'Connect your wallet to see your chains',
    emptyTitle: 'This wallet does not own any chain yet',
    emptyDesc: 'Launch one and come back — it will show up here immediately.',
    emptyCta: 'Launch your chain',

    colChain: 'Chain',
    colType: 'Type',
    colStatus: 'Status',
    colActions: '',

    validatorCount: '{count} validators',
    measuring: 'measuring',
    cannotMeasure: 'could not measure',
    statusHelp: "Measured by the subnet's validator count, not by block height.",
    noValidators: '0 validators',
    noValidatorsDesc:
      'This chain can NOT finalise any transaction: the subnet has no validators. It still answers ' +
      'RPC calls and wallets still connect, so there is no other visible sign.',

    walletSettings: 'Wallet settings',
    addToWallet: 'Add to wallet',
    addedToWallet: 'Added',
    addWalletError: 'Could not add it to your wallet. {detail}',

    revoke: 'Revoke',
    revokeTitle: 'Revoke “{name}”?',
    revokeWarn1: 'The chain stops serving RPC immediately and disappears from the public directory.',
    revokeWarn2:
      'Revoking does NOT delete the subnet on the P-Chain — what was created there cannot be ' +
      'removed for as long as this network runs. It also does not remove the network from the ' +
      'wallets of people who already added this chain.',
    revokeWarn3:
      'The name and Chain ID stay reserved and are NEVER reissued to anyone on this network. ' +
      "Reissuing a Chain ID would let a former user's wallet quietly point at somebody else's chain.",
    revokeWarn4: 'In return, one slot out of the 15 is given back.',
    revokeTypeLabel: 'Type the chain name exactly to confirm',
    revokeNameMismatch: 'That does not match the chain name.',
    revokeConfirm: 'Revoke permanently',
    revokeCancel: 'Cancel',
    revoking: 'Revoking “{name}” — about five minutes',
    revokeDone: 'Revoked “{name}”. {left}/{total} slots left.',
    revokeError: 'Could not revoke. {detail}',
    revokeUnknown: 'The chain is still in the directory after the run finished.',

    revokedBadge: 'Revoked',
    revokedDesc: 'Name and Chain ID stay reserved on this network.',
  },
};
