/** The launch screen (`/create-chain/`). `launch.slotsFull`/`slotsLeft` are also read by `SlotsLeft`, and a few keys by the directory and My chains. */
export const EN_LAUNCH = {
  launch: {
    title: 'Launch your chain',
    desc:
      'A dedicated L1, owned by your wallet. You sign once to prove who you are, review, ' +
      'and the network builds the chain in about five minutes.',

    connectWallet: 'Connect wallet',
    connecting: 'Connecting…',
    signIn: 'Sign in',
    signing: 'Waiting for signature…',
    yourWallet: 'Your wallet',
    youWillOwn: 'The chain will belong to this wallet. The address comes from your signature — nobody types it in.',
    noWallet: 'No wallet found in this browser. Install MetaMask and reload the page.',
    signRejected: 'You declined to sign. Nothing was created.',
    switchWallet: 'Use a different wallet',

    nameLabel: 'Chain name',
    namePlaceholder: 'For example: MyChain',
    nameHelp:
      'Letters, digits and spaces. 2–32 characters. On this network a name that has been used ' +
      'is never reissued — not even for a revoked chain.',
    nameInvalid: 'The name may contain only letters, digits and spaces, 2–32 characters long.',
    typeLabel: 'Chain type',
    typeHelp: 'Once chosen it is fixed — a chain’s genesis cannot be edited.',
    slotsLeft: '{left}/{total} slots left',
    slotsFull: 'No slots left',
    slotsFullDesc:
      'The current model has every validator track every L1, and the protocol drops a node that ' +
      'declares more than 16 subnets. This is a hard ceiling and cannot be raised. Revoking a ' +
      'chain returns a slot.',
    reviewCta: 'Review before submitting',

    reviewTitle: 'Review — this is a one-way door',
    reviewDesc:
      'The genesis of a launched L1 is IMMUTABLE. After this step the name, chain type and owner ' +
      'cannot be changed — and revoking will not give the name and chain ID back either.',
    reviewRebuild:
      'One more thing to know before you press: A1 rebuilds the whole network on {date}. The chain ' +
      'you launch today will be erased along with the old network — not hidden, gone.',
    reviewName: 'Chain name',
    reviewType: 'Chain type',
    reviewOwner: 'Owner',
    reviewBack: 'Go back and edit',
    reviewConfirm: 'I have reviewed — launch the chain',

    launching: 'Launching chain “{name}”',
    launchingDesc:
      'The nodes restart ONE AT A TIME so the network never loses quorum — that is why it is slow, ' +
      'and it is deliberate. Do not close the tab; if you do, the chain is still built.',
    etaRemaining: 'About {minutes} minutes left',
    preparing: 'Preparing…',

    doneTitle: 'Done — chain “{name}” is running',
    doneChainId: 'Chain ID',
    doneRpc: 'RPC',
    doneAddWallet: 'Add chain to wallet',
    doneAdded: 'Added to wallet',
    doneActivate: 'Activate chain (open block 1)',
    doneActivated: 'Activated',
    doneActivating: 'Waiting for wallet…',
    doneAddWalletError: 'Could not add the chain to your wallet. {detail}',
    doneActivateError: 'Could not activate the chain. {detail}',

    launchAnother: 'Launch another chain',
    launchError: 'Could not launch the chain. {detail}',
    unknownError: 'The chain did not appear in the directory after the run finished.',
    noteTitle: 'The first transaction on a new chain',
    noteHow:
      'Do not trust the gas estimate for the first transaction. The cheapest way to open block 1 ' +
      'is an ordinary transfer — press “Activate chain” below.',
  },
};
