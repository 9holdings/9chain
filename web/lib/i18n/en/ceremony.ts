/** The Block Adam ceremony page, and the countdown callout on the home page. */
export const EN_CEREMONY = {
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
  /**
   * The Block Adam ceremony, 2026-09-09. Constants (the moment, block names, digests, the
   * three messages) live in `lib/ceremony.ts` and are NOT translated — they are values a
   * reader compares against an explorer and an RPC reply.
   *
   * 🔴 `strangerDesc` must not be softened in any language. It is the sentence that keeps
   * the page honest about a public network: anyone may produce the block that reaches the
   * moment. A translation that turns it into "the ceremony will create Block Adam" makes
   * the page promise something the network does not allow anyone to promise.
   */
  ceremony: {
    badge: 'Ceremony',
    title: 'The Block Adam ceremony',
    desc:
      'At one exact second the network writes three named blocks. This page says what will ' +
      'happen, what the blocks carry, and how to check it afterwards without asking us.',

    momentLabel: 'The moment',
    countdownLabel: 'Time remaining',
    days: 'days',
    hours: 'hours',
    minutes: 'min',
    seconds: 'sec',
    yourZone: 'Your time zone',

    blocksTitle: 'The three blocks',
    adamDesc:
      'The FIRST block whose timestamp reaches the moment — defined by time, not by height. ' +
      'Whoever produces that block, produces it.',
    evaDesc: 'The block immediately after Adam, by height.',
    unionDesc: 'Ten blocks after Adam. This is where the 9S Union message is anchored.',

    messagesTitle: 'What the blocks carry',
    messagesDesc:
      'Adam and Eva carry the two sentences already written into block 0 when the network ' +
      'was created — the ceremony points at those same files, so the two cannot drift ' +
      'apart. Each digest below was frozen on 2026-09-03, before the ceremony, and can be ' +
      'reproduced with sha256 over the raw bytes.',

    quietTitle: 'One quiet minute',
    quietDesc:
      'The C-Chain does not produce empty blocks, so the synthetic traffic we publish on ' +
      'the live page is stopped shortly before the moment. Without that, the ceremony would ' +
      'be racing an automated sender for a two-second window. The cost is a minute of ' +
      'quiet; what it buys is that these blocks belong to the ceremony rather than to a bot.',

    strangerTitle: 'A stranger can take the block, and the record still holds',
    strangerDesc:
      'A1 is a public test network and anyone may send a transaction at that second. The ' +
      'record is anchored to the ceremony transaction hash, never to a block height — so if ' +
      "someone else's block reaches the moment first, what was written stays true; the " +
      'ceremony simply did not produce that block.',

    checkTitle: 'Check it yourself',
    checkDesc:
      'Ask any A1 node for the block at the moment and read its timestamp. Nothing on this ' +
      'page has to be taken on trust.',

    resultTitle: 'What was recorded',
    resultPending:
      'Not published yet. The evidence bundle — the moment, the offset used, the background ' +
      'traffic, the three transaction hashes, the block numbers and the result of reading ' +
      'the bytes back off the chain — is published here after the ceremony.',
    resultBlock: 'Block Adam',
    resultTimestamp: 'Its timestamp',
    resultBundle: 'Evidence bundle',
    reachedNote:
      'The moment has passed. The record is not published here yet — that happens once the ' +
      'bytes have been read back off the chain and checked against the frozen digests.',
  },
};
