/** The A1 ↔ C1 comparison (`/compare/`). */
export const EN_COMPARE = {
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
};
