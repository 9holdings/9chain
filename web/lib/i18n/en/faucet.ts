/** The faucet (`/faucet/`). */
export const EN_FAUCET = {
  faucet: {
    title: 'Get test tokens',
    desc:
      'LOVE9 on the A1 testnet has no real value — it exists so you can pay gas while testing. ' +
      'Enter a wallet address and we send some straight away.',
    addressLabel: 'Your wallet address',
    addressFromWallet: 'Filled in from the wallet you connected. Change it if the tokens should go to a different address.',
    useWalletAddress: 'Use my wallet address',
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
};
