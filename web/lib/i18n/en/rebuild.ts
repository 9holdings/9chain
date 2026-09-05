/** The re-genesis announcement (`/re-genesis/`). `rebuild.date` is also read by the launch screen. */
export const EN_REBUILD = {
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
};
