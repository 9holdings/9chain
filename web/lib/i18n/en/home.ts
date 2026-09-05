/** The home page and the live-numbers strip. `home.*` is also read by the directory, the home table and the validators page. */
export const EN_HOME = {
  home: {
    testnetBadge: 'Testnet — tokens have no real value',
    primaryCta: 'Launch your chain',
    secondaryCta: 'Get test tokens first',

    title: 'Launch your own chain on A1',
    subtitle: 'An L1 of your own, owned by the wallet you sign with, running for real on the test network. Takes about five minutes.',
    tableCaption: 'Each row is a real chain running on A1, with its own owner.',
    colChain: 'Chain',
    colType: 'Type',
    colOwner: 'Owner',
    systemDefault: 'system default',
    emptyTitle: 'No L1 is running yet',
    emptyDesc: 'You would be the first. The directory updates as soon as your chain is up.',
    // The home table shows only the newest few — the full list, with live state, search and
    // filters, is the directory. Added 2026-09-04 with the 108-L1 redesign of `/chains/`.
    moreChains: 'See all {count} chains in the directory',

    disclosure: '9 of the 11 validators run on the same server, with the same provider; the other two joined from elsewhere, and only one of them is online — decentralised at the protocol level, not yet at the infrastructure level.',
    idleBlocksNote: 'Avalanche does not produce empty blocks, so a block height that stays still while nobody is transacting is normal. The liveness measure is the validator count next to it.',
  },

  stats: {
    title: 'Network is live',
    validators: 'Validators connected',
    l1Count: 'L1s running',
    blockHeight: 'C-Chain block',
    measuring: 'Measuring the network…',
    cannotMeasure: 'Could not read network stats',
    cannotMeasureDesc: 'The page still works — this is only the status display.',
  },
};
