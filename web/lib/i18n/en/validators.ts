/** The validators page (`/validators/`). */
export const EN_VALIDATORS = {
  /**
   * `/validators/` — the page that answers the home page's own disclosure.
   *
   * 🔴 `honest1`, `honest2` and `honest3` MUST NOT BE SOFTENED IN ANY LANGUAGE. They are what
   * makes this an invitation rather than a recruitment pitch: the token is worthless, the
   * network has been rebuilt from block 0 before and may be again, and a node behind a home
   * router looks healthy while nobody can reach it — the failure that cost the first outside
   * validator its whole term. A translation that trims them turns a page that respects the
   * reader into one that costs them a fortnight.
   *
   * Numbers are NOT in these strings. The bond, the set size and the faucet limits are read
   * from the network and the faucet when the page loads — see `lib/validators.ts` for why a
   * hard-coded 81 is one re-genesis away from telling a stranger to send the wrong amount.
   */
  validators: {
    title: 'Run a validator',
    desc:
      'The sentence on our home page — nine of the validators on one machine at one provider ' +
      '— is the honest weakness of this network, and an outsider with a spare machine is the ' +
      'only thing that fixes it. This page is what that costs, and what it does not pay.',

    liveTitle: 'The set right now',
    liveTotal: 'Validators',
    liveConnected: 'Connected',
    liveMinBond: 'Minimum self-bond',
    liveAtMinimum: 'Staked at the minimum',
    measuredNote:
      'Read from the network when this page loaded, not typed in. The minimum bond is compiled ' +
      'into the node binary — it was 25,000 until the hours before this network was created, so ' +
      'a page that quotes it from memory is one rebuild away from being wrong about money.',

    costTitle: 'What it costs',
    costMachine:
      'A machine that stays on, and a public address with port 9651 reachable from outside. ' +
      'There is no application, no allowlist and no permission gate at the protocol level — ' +
      'the operator role is granted to nobody at genesis, so any funded account can join.',
    costBond: 'A self-bond, locked for the term you choose: 24 hours at the shortest, 365 days at the longest.',

    faucetTitle: 'Where the LOVE9 comes from, and the trap in the arithmetic',
    faucetDesc:
      'The faucet is the whole funding path — nothing to apply for, nobody to ask. But nine ' +
      'requests come to exactly the bond, and exactly the bond is NOT enough: the transactions ' +
      'that carry your balance from C-Chain to X-Chain to P-Chain and then submit the stake are ' +
      'paid out of that same balance. Budget ten requests and a wait of up to an hour for the ' +
      'per-IP limit to clear. We say it here rather than at the end because an earlier version ' +
      'of our own guide said "nine covers it" and corrected itself three hundred lines later.',

    getTitle: 'What you get',
    getRewards:
      'Rewards need 80% uptime across your term — deliberately looser than Avalanche mainnet, ' +
      'because community hardware is not datacenter hardware.',
    getEnd:
      'Your term ends and nothing renews. The stake comes back when it expires; read your own ' +
      'end time from the chain rather than working it out on paper.',
    getPrivacy:
      'Nothing requires you to expose an RPC endpoint, and we would rather you did not open ' +
      'port 9650 at all. Your node is yours.',

    honestTitle: 'What this does not pay',
    honest1:
      'LOVE9 is a test token. It has no value here and no value anywhere else, nobody is buying ' +
      'it, and there is no promise that any of this converts into anything later.',
    honest2:
      'A1 is a testnet and has already been rebuilt from block 0 twice. If it happens again your ' +
      'stake, your rewards and your node identity go with it. What we commit to is saying so in ' +
      'advance and saying plainly what is lost — that is the whole of the promise.',
    honest3:
      'Behind a home router a node bootstraps and validates on connections it opens itself, and ' +
      'looks perfectly healthy while nobody outside can reach it. That is how the first outside ' +
      'validator finished a term at 14% uptime and earned nothing. Forward port 9651, and set ' +
      'the public address to the one the forwarding answers on.',

    stepsTitle: 'The path, in six steps',
    step1: 'Get the source and rebuild the fork, then check the tree hash yourself — and check that a deliberately wrong input fails, so the first check means something.',
    step2: 'Build the node image, stamping in the commit you built from.',
    step3: 'Fetch genesis and a bootstrap address, and verify the genesis hash before you run anything.',
    step4: 'Run the node. Its identity is three files on disk: lose them and your bond belongs to a node that no longer exists.',
    step5: 'Confirm you are on the right chain by reading the network name and chain ID back, not by trusting a 200.',
    step6: 'Move LOVE9 to P-Chain, then stake — and verify the result on chain rather than in the tool output.',

    guideCta: 'The full guide, every command',
    issuesCta: 'Report a problem',
    issuesNote:
      'The issue tracker is the channel, and it is public on purpose: a validator problem is ' +
      'almost always one somebody else will hit, and an answer given in private helps one person. ' +
      'Tell us what you measured, not what you concluded.',
  },
};
