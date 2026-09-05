/** Text the console API sends in English, translated by its stable code — see `lib/serverText.ts`. Read by the screens that show chain types or launch progress. */
export const EN_SERVER_TEXT = {
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
};
