/**
 * English — DEFAULT language and SOURCE OF TRUTH for keys.
 * (i18n, 2026-08-27. The original Vietnamese: `vi.ts` — read there for WHY each sentence is
 * worded as it is; the reasoning stays there rather than being duplicated.)
 *
 * ═══ WHY THIS FILE IS SPECIAL ═══
 * 1. It travels IN THE BUNDLE — the other 29 languages load as chunks. It must be present in the
 *    first frame, and it is the fallback when a chunk fails to load.
 * 2. It defines the `Dict` type. A key missing here does not exist for any of the 30 languages;
 *    an extra key makes the other 29 translations red under `tsc`.
 * 3. Every other translation is made FROM HERE, not from `vi.ts`. Translating through two layers
 *    doubles the places meaning can drift.
 *
 * 🔴 THREE SENTENCES THAT MUST NOT BE SOFTENED IN ANY LANGUAGE:
 *    `reGenesis.*` (the network will be erased) · `deChain.soatMoTa` (a one-way door) ·
 *    `chainCuaToi.thuHoiY*` (revoking does not give the name back).
 *    They say "permanently" and "cannot be undone" to stop users losing assets by assuming it can
 *    be redone. Translating them to sound gentler removes the exact thing they exist to do.
 */
export const EN = {
  common: {
    productName: '9Chain Testnet A1',
    // "running ON Avalanche" was WRONG and removed 2026-08-27 — A1 is a separate
    // network, not a subnet of Avalanche. See `vi.ts` for the measurement.
    // ⚠️ This comment used to name networkID `9001`. That number died the same day
    // the sentence was written: the public network was rebuilt into generation g0
    // (D-081) and now answers `999999999`. A comment that carries a live constant
    // rots silently — `lib/chain.ts` is the single source, and
    // `check-chain-id.mjs` is what actually holds it to the running network.
    shortDesc: "9Chain's public testnet — an independent network running the Avalanche engine",
    tagline: 'an independent network on the Avalanche engine',
    walletRejected: 'You rejected the request in your wallet. Nothing has changed.',
    // Phone browsers cannot hold a wallet extension — the only working path there is to open
    // the page INSIDE the MetaMask app (see `components/OpenInWallet.tsx`).
    noWalletMobile: 'A phone browser cannot hold a wallet extension. Open this page inside the MetaMask app instead — its built-in browser has the wallet.',
    openInMetaMask: 'Open in the MetaMask app',
    loading: 'Loading…',
    retry: 'Try again',
    copy: 'Copy',
    copied: 'Copied',
    close: 'Close',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
    skipToContent: 'Skip to main content',
    stepDone: ' — done',
    stepRunning: ' — running',
    stepFailed: ' — failed',
    stepPending: ' — pending',
  },

  // ═══ TEXT THE CONSOLE API SENDS IN ENGLISH, TRANSLATED BY ITS STABLE CODE ═══
  // Keys are the console's ids (`PRESETS[].id`, progress step `code`) — see `lib/serverText.ts`.
  // An id the dictionary does not know falls back to the server's own English; never rename a
  // key here to "tidy" it, the console owns these names.
  presets: {
    standard: {
      name: 'Standard',
      desc: 'A plain EVM chain. The owner receives every genesis token and the right to change fees.',
    },
    'zero-fee': {
      name: 'Near-zero fees',
      desc: 'baseFee = 1 wei, so a transaction pays exactly that floor (a transfer costs 0.000000000000021 LOVE9). Good for games, experiments and internal chains. The trade-off: almost nothing stands in the way of spam.',
    },
    'high-throughput': {
      name: 'High throughput',
      desc: 'Five times as many transactions per block (gasLimit 60 million instead of 12 million). Good for games, exchanges, anything with a steady stream of small transactions. The trade-off: heavier blocks, and whoever runs a node for this chain needs a stronger machine.',
    },
    mintable: {
      name: 'Mintable supply',
      desc: 'The owner can mint more native token at any time through precompile 0x0200000000000000000000000000000000000001. The supply is NOT fixed — anyone using this chain has to know that.',
    },
    'owner-deploy-only': {
      name: 'Owner-only contract deployment',
      desc: 'Everyone else can still send transactions and use existing contracts, but cannot deploy their own. The owner grants that right to anyone through precompile 0x0200000000000000000000000000000000000000.',
    },
    permissioned: {
      name: 'Permissioned (approved senders only)',
      desc: 'Only listed addresses can SEND transactions. Suited to an internal company chain. ⚠️ This is the strictest preset: an unknown wallet arriving here can do nothing at all.',
    },
  },
  steps: {
    genesis: 'Building genesis',
    subnet: 'Creating subnet + blockchain on P-Chain',
    rpc: 'Waiting for the L1 RPC to answer',
  },

  /** Announcement text for AFTER the reset. Written ahead of time — see `vi.ts`. */
  rebuildDone: {
    archiveUrl: '',
    archiveSha256: '',

    banner: 'A1 was rebuilt on {date}. Every balance and chain created before that date no longer exists.',
    bannerLink: 'What this means',
    badge: 'Rebuilt',

    title: 'A1 was rebuilt on {date}',
    desc:
      'The A1 test network has been rebuilt from block 0. Chains, balances and transaction ' +
      'history created before that date no longer exist — not hidden, gone. ' +
      'This page explains what you are seeing and what to do.',

    willSeeTitle: 'What you will see',
    willSee1:
      'Your wallet still connects, still shows the right network name and the same Chain ID ' +
      '{chainId} — that was deliberate. But your balance will be 0.',
    willSee2:
      'Every L1 you launched is gone from the directory. Their names and Chain IDs are free ' +
      'again, and anyone can claim them.',
    willSee3:
      'If you signed a transaction but never broadcast it, do not broadcast it now — it ' +
      'belongs to a network that no longer exists.',

    toDoTitle: 'What you need to do',
    toDo1: 'Request test tokens again from the faucet. Limits have been reset for everyone.',
    toDo2:
      'Remove each individual L1 from your wallet — they have their own Chain IDs and now ' +
      'point at nothing. The main A1 network does NOT need removing; its settings are unchanged.',
    toDo3: 'Launch your chain again if you need it. Someone else may have taken the old name.',

    archiveTitle: 'Archive of the old network',
    archiveDesc:
      'The final state of the network before the rebuild was exported and its hash published, ' +
      'so anyone who wants to check it can.',
  },

  rebuild: {
    date: '2026-09-01',
    banner: 'A1 is being rebuilt on {date} — every chain, balance and transaction created before then will be erased.',
    bannerLink: 'Details',
    badge: 'Rebuild coming',

    title: 'A1 is being rebuilt on {date}',
    desc:
      'The entire A1 test network will be rebuilt from block 0. Everything created before ' +
      'that date will be gone — not hidden, but no longer in existence. This page says ' +
      'exactly what is lost and what you need to do.',

    whyTitle: 'Why a rebuild is necessary',
    why1:
      "A network's genesis is immutable. That is precisely what makes it trustworthy — nobody, " +
      'including the people who built it, can change a number once it is written into block 0.',
    why2:
      'The price of that: changing a number inside genesis leaves no option except rebuilding ' +
      'the network from scratch. A1 raised total supply to 9,000,000,000 LOVE9, and the whole ' +
      'range of staking parameters had to be recalculated to match.',
    why3:
      'This is a testnet, and rebuilding is something a testnet is allowed to do. In fact it is ' +
      'why testnets exist: so changes like this happen here, and not on mainnet.',

    lostTitle: 'What will be lost',
    lostDesc: 'Everything, without exception:',
    lost1: 'Every user-launched L1, including chains that are running perfectly well.',
    lost2: 'Every LOVE9 balance, including tokens received from the faucet.',
    lost3: 'Every transaction, every block, the entire history of the C-Chain, P-Chain and X-Chain.',
    lost4: 'Every validator and every delegation.',

    keptTitle: 'What is kept',
    keptDesc:
      'Before the deletion, the entire dying network will be exported with a published hash, so ' +
      'the record stays verifiable. What happened can still be checked, even once the network ' +
      'that ran it is gone. The archive link will be posted here on the day of the rebuild.',

    toDoTitle: 'What you need to do',
    toDoBefore: 'Before the rebuild:',
    toDo1:
      'Do not build anything on A1 right now that depends on data surviving. If you are trying ' +
      'out an idea, go ahead — just do not treat the current chain as storage.',
    toDoAfter: 'After the rebuild:',
    toDo2:
      'Remove from your wallet each individual L1 you added — those chains no longer exist, and a ' +
      'wallet pointing at them will simply sit there. The main A1 network needs no removal: its ' +
      'settings are unchanged.',
    toDo3:
      "If your wallet does not have the A1 network yet, add it with the button on the faucet page " +
      'rather than typing the settings by hand.',
    toDo4: 'Request tokens from the faucet again, and launch your chain again if you want it.',

    silentTitle: 'Your wallet will not warn you',
    silentDesc:
      'The new network keeps Chain ID {chainId}, the same RPC address and the same name as the old ' +
      'one. That is deliberate — so every document and guide already published stays correct. The ' +
      'price is that your wallet has no signal at all that it just connected to a different ' +
      'network. The two things below will therefore happen silently.',
    silent1:
      'A wallet with the old configuration still connects, still shows the right network name, and ' +
      'will report a balance of 0. That number is CORRECT: your old tokens no longer exist, they ' +
      'are not hidden. You do not need to re-add the network — just request new tokens from the ' +
      'faucet. If your wallet reports a stuck transaction or a wrong sequence number, clear that ' +
      "network's activity data in the wallet: it still remembers the transaction count of a chain " +
      'that is dead, while the new chain counts from 0.',
    silent2:
      'If you still hold a signed transaction that was never broadcast, discard it. The signature ' +
      'is still valid on the new network, because the Chain ID did not change. It will fail while ' +
      'the wallet is empty — but the moment you request tokens from the faucet it becomes ' +
      'spendable, and it may go through at a time you do not expect.',

    repeatTitle: 'Will this happen again',
    repeatDesc:
      'Possibly. A1 is still a testnet, and until the community picks a mainnet direction between ' +
      'A1 and C1, we keep the right to rebuild the network when something inside genesis has to ' +
      'change. What we commit to is telling you in advance, and saying plainly what is lost.',

    // 🔴 Added 2026-08-27 (D-081). The public network HAS already been reborn once TODAY,
    // before G-day. The warning about 01/09 is still correct and still needed — there will be
    // one more — but anyone who held tokens before today and comes back sees a zero balance with
    // no explanation on the page. This morning's baseline proves NOBODY lost a chain; the faucet
    // has NO durable ledger, so it cannot prove nobody lost tokens.
    alreadyTitle: 'Already rebuilt once on 2026-08-27',
    alreadyDesc:
      'A1 was already rebuilt once on 2026-08-27, before the date below. If you held test tokens before then, your balance is now 0 — that is correct, not a fault in your wallet. No user chain was lost: the directory held only automated test chains. Request tokens again from the faucet.',
    dateNote: 'The date can slip',
    dateNoteDesc:
      'The date {date} depends on an earlier go/no-go check. If it slips, we will change the date ' +
      'on this page rather than stay silent.',
  },

  footer: {
    tryIt: 'Try it',
    explore: 'Explore',
    about: 'About',
    explorer: '9Scan-A1 explorer',
    mainSite: '9Chain main site',
    opensNewTab: '(opens in a new tab)',
    navLabel: 'Footer links',
    rebuildPlan: 'Network rebuild plan',
  },

  nav: {
    home: 'Home',
    faucet: 'Get test tokens',
    launch: 'Launch a chain',
    myChains: 'My chains',
    compare: 'A1 ↔ C1',
    directory: 'L1 directory',
    explorer: 'Explorer',
    explorerAria: 'Open 9Scan-A1 in a new tab',
  },

  home: {
    testnetBadge: 'Testnet — tokens have no real value',
    primaryCta: 'Launch your chain',
    secondaryCta: 'Get test tokens first',

    title: 'Launch your own chain on A1',
    subtitle: 'An L1 of your own, owned by the wallet you sign with, running for real on the test network. Takes about three minutes.',
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
  /**
   * The L1 directory (`/chains/`). Moved into this dictionary on 2026-09-03; until
   * then the page was a hand-written HTML file in Vietnamese ONLY, outside the 30
   * languages entirely — so a reader who picked English in the header and clicked
   * "L1 directory" landed on a page they could not read.
   *
   * 🔴 THESE KEYS REUSE, THEY DO NOT DUPLICATE. Ten strings the page needs already
   * existed and are NOT repeated here: `nav.directory` (the page title) ·
   * `home.colChain` · `home.systemDefault` · `home.emptyTitle`/`emptyDesc` ·
   * `launch.doneChainId` · `launch.doneRpc` · `myChains.colType` ·
   * `myChains.validatorCount` · `myChains.addToWallet` · `common.copy`/`copied`.
   * A second copy of a string is a second place for it to go stale, and the two then
   * disagree in 30 languages at once.
   *
   * ⚠️ NO INLINE MARKUP. The hand-written page emphasised phrases inside the
   * explanatory paragraphs with `<b>`. HTML in a dictionary value cannot survive
   * translation into 30 languages — word order moves, so the tags land on the wrong
   * words — and `dangerouslySetInnerHTML` over translated text is a hole nobody
   * should open. The lead-in phrases carry the emphasis instead: `howToTitle` and
   * `ownerTitle` render bold, their paragraphs render plain.
   */
  directory: {
    lede: 'Every chain on the A1 testnet, and the real state of each one.',

    howToTitle: 'How to read this table.',
    howToBody:
      'Avalanche does not produce empty blocks — a chain only produces one when there is a ' +
      'transaction, so a block count that stays still is normal and does not mean the chain is ' +
      'dead. The reverse is the dangerous case: a chain with no validators still answers RPC, ' +
      'still lets you read balances, and wallets still connect to it — but every transaction ' +
      'hangs forever. So the real sign of life here is the subnet validator count, read ' +
      'straight from the P-Chain, not the block height.',
    ownerTitle: 'The owner (admin)',
    ownerBody:
      'is the address given when the chain was launched. It holds the entire genesis supply and ' +
      'the right to change that chain’s fees — the chain belongs to them, not to the ' +
      'foundation. Chains launched before the console had this field show a system default.',

    mainNetwork: 'MAIN NETWORK',
    mainNetworkDesc: 'The C-Chain of testnet A1 — where the faucet and the explorer work.',

    running: 'RUNNING',
    notAnswering: 'NOT ANSWERING',
    notAnsweringDesc: 'RPC is not responding — a node may not be tracking this subnet yet.',
    unclear: 'UNCLEAR',
    unclearDesc: 'Could not read the validator set from the P-Chain.',

    ownerAdmin: 'Owner (admin)',
    blocks: 'Blocks',
    subnetValidators: 'Subnet validators',
    created: 'Created',
    revokedAt: 'Revoked at',
    copyOwner: 'Copy owner address',

    revoked: 'REVOKED',
    revokedDesc:
      'This chain has stopped serving: no node runs it any more and its RPC no longer answers. ' +
      'If you added this network to a wallet, remove it — leaving it there only produces ' +
      'connection errors.',
    neverReissued: 'never reissued to another chain',
    revokedGroup: 'Revoked ({count})',

    listError: 'Could not read the chain list ({error}). The main network is still shown below.',
    footSummary: '{count} L1 running + the main network',
    footRevoked: '{count} revoked',
    footUpdated: 'updated at {time}',

    /**
     * 2026-09-04 — the redesign for 108+ L1s. Summary tiles, the sweep line, the toolbar
     * (search · status · type · grouping · sort), the paged table and the `mismatch` verdict.
     * Badge labels stay in CAPS like `running`/`revoked` above; tile and filter labels are
     * sentence case because they sit in running text.
     */
    tileTotal: 'L1s in the directory',
    tileRunning: 'Measured running',
    tileAttention: 'Need attention',
    tileRevoked: 'Revoked',
    sweepProgress: 'Measured {done} of {total}',
    measuringDesc: 'Queued for measurement.',
    howToToggle: 'How to read this list',

    searchLabel: 'Search',
    searchPlaceholder: 'Name, Chain ID, owner or blockchain ID',
    filterStatus: 'Status',
    filterAll: 'All',
    filterRunning: 'Running',
    filterAttention: 'Needs attention',
    filterRevoked: 'Revoked',
    filterType: 'Type',
    filterTypeAll: 'All types',
    groupBy: 'Group by',
    groupNone: 'No grouping',
    groupOwner: 'Owner',
    groupType: 'Type',
    groupStatus: 'Status',
    groupNoType: 'No type recorded',
    groupCount: '{shown} of {total}',
    sortBy: 'Sort',
    sortNewest: 'Newest first',
    sortOldest: 'Oldest first',
    sortName: 'Name',
    sortChainId: 'Chain ID',
    sortBlocks: 'Most blocks',
    refresh: 'Measure again',

    listCaption: 'Chains on A1, with the state measured for each',
    showing: 'Showing {shown} of {total}',
    showMore: 'Show {count} more',
    noMatchTitle: 'No chain matches',
    noMatchDesc: 'Try another search term, or clear the filters.',
    clearFilters: 'Clear filters',
    showDetails: 'Details',
    hideDetails: 'Hide',
    detailsOf: 'Details of {name}',
    nativeToken: 'Native token',

    mismatch: 'WRONG CHAIN',
    mismatchDesc:
      'The RPC answered with Chain ID {got} instead of {expected} — most likely a routing fault, ' +
      'not this chain.',
  },


  /**
   * Public load test. New section, so its keys are English — see the source-code
   * language rule. The older keys around it are Vietnamese debt being paid down
   * elsewhere; do not copy that pattern into new sections.
   *
   * 🔴 DO NOT SOFTEN `banner`, `intro` OR `addressesNote` IN ANY TRANSLATION.
   * They are the entire reason this feature is allowed to exist. The transactions
   * are manufactured by us; saying so plainly, and publishing the addresses that
   * send them, is what separates an honest demonstration from inflating our own
   * usage numbers. A translation that turns "we generate this traffic" into
   * "the network is busy" is not a softer wording, it is a false claim.
   */
  loadTest: {
    badge: 'Load test',
    banner: 'We are running a public load test — {tps} transactions per second, generated by us, not real users.',
    bannerLink: 'See the live numbers',

    title: 'Public load test',
    intro:
      'A1 is a young test network with very few real users, so left alone it produces almost no ' +
      'blocks. We generate a steady stream of transactions so the network is continuously ' +
      'exercised and so you can watch it work. This traffic is ours. It is not usage, and we do ' +
      'not count it as usage — every address sending it is listed below so you can subtract it.',

    running: 'Running now',
    stopped: 'Not running right now',
    stoppedWhy: 'Reason recorded: {reason}',

    labelTps: 'Transactions per second',
    labelBlockHeight: 'C-Chain block',
    labelSecondsPerBlock: 'Seconds per block',
    labelTotal: 'Transactions confirmed since start',
    labelUptime: 'Running for',

    committedNote:
      'These figures are counted from the blocks themselves, not from what we tried to send. ' +
      'A transaction the network accepted but never included in a block is not counted here.',

    addressesTitle: 'The nine sending addresses',
    addressesNote:
      'Every transaction from these addresses is machine-generated by us. Filter them out to see ' +
      'whatever real activity exists.',

    measuring: 'Reading the load test status…',
    notMeasured: 'Could not read the load test status',
    notMeasuredMore: 'The page still works — this is only the status display.',
  },

  launch: {
    title: 'Launch your chain',
    desc:
      'A dedicated L1, owned by your wallet. You sign once to prove who you are, review, ' +
      'and the network builds the chain in about three minutes.',

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
    revoking: 'Revoking “{name}” — about three minutes',
    revokeDone: 'Revoked “{name}”. {left}/{total} slots left.',
    revokeError: 'Could not revoke. {detail}',
    revokeUnknown: 'The chain is still in the directory after the run finished.',

    revokedBadge: 'Revoked',
    revokedDesc: 'Name and Chain ID stay reserved on this network.',
  },

  compare: {
    title: 'A1 ↔ C1 — comparison',
    desc:
      '9Chain runs TWO testnets of the same product side by side, differing in engine: ' +
      'A1 on the Avalanche engine, C1 on the Cosmos engine. This table records the trade-offs ' +
      'between the two directions, published so anyone can argue with it — the C1 side has no ' +
      'live measurements yet.',

    selfScoreTitle: 'The scores below are SELF-ASSESSED by the team, not independently measured',
    selfScoreDesc:
      'The "how it is measured" column says how each criterion was checked. Any criterion without ' +
      'a dated measurement is an architectural judgement, not data. The weights are yours to set — ' +
      'the score follows.',

    colNo: '#',
    colCriterion: 'Criterion',
    colKind: 'Type',
    colA1: 'A1',
    colC1: 'C1',
    colWeight: 'Weight',
    kindArchitecture: 'architecture',
    kindLiveData: 'live data',

    totalScore: 'Total score using your weights',
    tied: 'Tied',
    leads: 'leads',

    liveDataTitle: 'Live data',
    a1Validators: 'A1 — validators connected',
    a1Chains: 'A1 — L1s running',
    a1Blocks: 'A1 — C-Chain block',
    c1Unreachable: 'C1 — not reachable',
    c1UnreachableDesc:
      "C1's Cosmos REST URL (port 1317) is needed. The table still works: the A1 side is live data, " +
      'the C1 side is an architectural judgement like the remaining criteria.',
    measuring: 'measuring…',
    cannotMeasure: 'could not measure',
    critDecentralisation: 'Decentralisation (validator ceiling)',
    noteDecentralisation: 'PROTOCOL ceiling: Snowman ~thousands of nodes vs CometBFT ~150. A1 TODAY: 9 nodes, one machine, one provider',
    critFinality: 'Finality',
    noteFinality: '~1–2s vs ~5–6s',
    critEvmMaturity: 'EVM maturity',
    noteEvmMaturity: 'coreth in production vs Cosmos EVM pre-v1',
    critWalletCompat: 'Retail wallet / DeFi compatibility',
    noteWalletCompat: 'Full MetaMask/EVM',
    critLaunchUx: 'Chain-launch UX',
    noteLaunchUx: 'both have a console; A1 measures ~170s per launch',
    critInterop: 'Breadth of interop',
    noteInterop: 'Warp/ICM inside the ecosystem (A1 has moved assets, M6.2) vs the reach of IBC',
    critOpCost: 'Operating cost per chain',
    noteOpCost: 'node + plugin vs K8s operator',
    critBootstrap: 'Bootstrapping network effects',
    noteBootstrap: 'an island of its own vs IBC plugged into the Cosmos economy',
    critEconSecurity: 'Public economic security',
    noteEconSecurity: 'PoS token-secured out of the box',
    critSwitchCost: 'Switching cost for the team',
    noteSwitchCost: 'A1 is new vs C1 running for months',
  },

  faucet: {
    title: 'Get test tokens',
    desc:
      'LOVE9 on the A1 testnet has no real value — it exists so you can pay gas while testing. ' +
      'Enter a wallet address and we send some straight away.',
    addressLabel: 'Your wallet address',
    addressPlaceholder: '0x… (40 hex characters)',
    requestCta: 'Send me tokens',
    sending: 'Sending…',
    addressHelp: 'Paste the wallet address that should receive the tokens. Press “Add network to wallet” above if you have not yet.',
    addNetwork: 'Add network to wallet',
    addNetworkDone: 'Added to wallet',
    addNetworkRejected: 'You pressed reject in your wallet. Press again if you want to add the network.',
    addNetworkError: 'Your wallet could not add the network. Add it manually using the settings beside this — and send the line below to the team:',
    noWallet: 'No wallet found in this browser. Install MetaMask and reload the page.',
    quotaLabel: 'Remaining quota',
    quotaFormat: '{left}/{total} requests per {hours} hours',
    quotaExhausted: 'You have used your whole quota. Try again in {minutes} minutes.',
    quotaUnreadable: 'Could not read your quota — you can still request, you just will not know how many are left.',
    sentOk: 'Sent {count} {symbol} to {address}',
    viewTransaction: 'View transaction',
    settingsTitle: 'Network settings',
    settingsRpc: 'RPC',
    settingsChainId: 'Chain ID',
    settingsSymbol: 'Symbol',
    settingsDecimals: 'Decimals',
    settingsExplorer: 'Explorer',
    decimalsHelp:
      'Wallets show 18 decimals because the C-Chain runs the EVM. On the P/X-Chain, LOVE9 counts ' +
      'in 9 decimals. One coin, two scales — not two different tokens.',
    genericError: 'Could not send. {detail}',
  },

  /** The language picker. See `components/LanguagePicker.tsx` for the reasoning behind each label. */
  langPicker: {
    label: 'Language',
    machineBadge: 'machine',
    machineNote: 'Only Vietnamese has been reviewed by a person. The other translations are machine-made and may be wrong — the English version is the source of truth.',
    notAvailable: 'not yet available',
  },

  errors: {
    unreachable: 'Could not reach the network',
    unreachableDesc: 'The network may be busy, or your connection may have dropped.',
    empty: 'Nothing here yet',
    addressEmpty: '{label} must not be empty',
    addressFormat: '{label} must be 0x followed by 40 hex characters',
    addressChecksum: '{label} fails its EIP-55 checksum — most likely one character was mistyped or lost when pasting',
    addressZero: '{label} must not be the zero address — nobody holds its key',
    timeout: 'No answer after {seconds}s',
    notJson: 'The answer was not JSON (HTTP {status}) — most likely the request was routed to the wrong place',
    noWallet: 'No wallet found in this browser.',
  },

  notFound: {
    code: '404',
    title: 'This page does not exist',
    desc:
      'The address you opened does not exist on 9Chain Testnet A1. ' +
      'It may have been renamed, or the URL may have lost a few characters when it was copied.',
    topPagesTitle: 'The three most used pages:',
    navLabel: 'Where to go next',
    goHome: 'Back to home',
    goFaucet: 'Get test tokens',
    goLaunch: 'Launch your chain',
    lookingForTx: 'Looking for a transaction or an address? Check the hash and try again.',
  },
} as const;

/**
 * The type of EVERY dictionary. All 29 translations must match this shape exactly.
 *
 * 🔴 THE TYPE MUST BE WIDENED; `typeof EN` CANNOT BE USED DIRECTLY.
 * `EN` is declared `as const`, so `typeof EN` is a type of ENGLISH STRING LITERALS — meaning
 * `moTaNgan` has the type `"9Chain's public testnet — …"`, and **no translation can be assigned
 * to it**. Measured when trying: `tsc` reports
 *   Type '"Testnet công khai của 9Chain…"' is not assignable to type '"9Chain's public…"'
 * At a glance that reads as a broken translation; in fact the type is wrong.
 *
 * `SauChuoi` preserves the SHAPE (which keys, how deeply nested) while widening every leaf to
 * `string` — exactly what we want to lock: rigid structure, free content.
 */
type SauChuoi<T> = { [K in keyof T]: T[K] extends string ? string : SauChuoi<T[K]> };
export type Dict = SauChuoi<typeof EN>;

export default EN;
