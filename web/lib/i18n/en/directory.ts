/** The L1 directory (`/chains/`). */
export const EN_DIRECTORY = {
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
};
