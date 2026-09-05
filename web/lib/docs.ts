/**
 * What `/docs/` lists, and where each document actually lives.
 *
 * ═══ WHY THIS IS A CATALOGUE AND NOT A COPY OF THE DOCUMENTS ═══
 * The obvious version of this page renders the Markdown itself, so everything is on the site.
 * It is the wrong answer here for the reason this project keeps writing down: two copies of
 * one document stay identical only while somebody remembers to make them. The ceremony page
 * points the engraving scripts at the SAME files that went into genesis for exactly this
 * reason — one set of bytes cannot drift from itself. A guide copied into `web/` would drift
 * from the guide people actually follow, and the copy on the marketing site is the one that
 * would go stale, because it is the one nobody edits while fixing a command.
 *
 * So this page's job is narrower and honest: tell a reader WHICH document answers their
 * question, in what language, and hand them the canonical copy.
 *
 * ═══ WHY THE TITLES AND SUMMARIES ARE NOT TRANSLATED ═══
 * They describe documents that exist in one language each. A Vietnamese summary above an
 * English guide promises a Vietnamese guide; the row would be a small lie told 29 times.
 * Every row states its own language instead, and `docs.langNote` explains the mix. Same
 * precedent as chain names in the directory and the engraved sentences on `/ceremony/`.
 *
 * 🔴 EVERY URL HERE IS FETCHED BY `scripts/check-doc-links.mjs` BEFORE A DEPLOY. This project
 * has published a dead documentation link before — `9chain.org/docs/` 404'd in three shapes
 * while the footer pointed at it — and the first thing a dead link costs is the reader's
 * belief that anything else on the page was checked.
 */

export type DocLang = 'en' | 'vi';

export type DocEntry = {
  id: string;
  /** As published, in the document's own language. */
  title: string;
  /** One line: what question this answers, and for whom. English, deliberately — see above. */
  summary: string;
  lang: DocLang;
  href: string;
  /** A second language edition of the SAME document, when one exists. */
  also?: { lang: DocLang; href: string };
  /** Print/offline copies, if published. */
  pdf?: { lang: DocLang; href: string }[];
  /** A page on this site that covers the same ground with live numbers. */
  onSite?: string;
};

const GH = 'https://github.com/9holdings/9chain/blob/main/docs';

/**
 * 🔴 `TOKENOMICS.md` IS DELIBERATELY ABSENT, AND THIS NOTE IS THE REASON.
 * Its own first line says it has been out of date since 2026-08-26 and that sections 1 and 2
 * no longer describe the running network (it still documents 720 million and a 40/20/20/5/15
 * split; the network re-genesised to 9,000,000,000 and 40/30/12/9/9). Tokenomics is one of
 * the first things a stranger looks up, so linking it from a documentation hub would put our
 * name on a document we know is wrong. A hub with one fewer row is the smaller harm; the
 * repair belongs in that file, not in a caveat on this page.
 */
export const DOCS: DocEntry[] = [
  {
    id: 'create-a-chain',
    title: 'Create your own chain on 9Chain Testnet A1',
    summary: 'A guide for someone starting from nothing — no blockchain knowledge assumed. The whole path, from a wallet to a chain of your own.',
    lang: 'en',
    href: `${GH}/CREATE-A-CHAIN.md`,
    also: { lang: 'vi', href: `${GH}/CREATE-A-CHAIN.vi.md` },
    pdf: [
      { lang: 'en', href: `${GH}/CREATE-A-CHAIN.pdf` },
      { lang: 'vi', href: `${GH}/CREATE-A-CHAIN.vi.pdf` },
    ],
    onSite: '/create-chain/',
  },
  {
    id: 'run-a-validator',
    title: 'Run a validator on 9Chain-A1',
    summary: 'Every command, from rebuilding the fork to staking — including the checks that prove you rebuilt the right thing, and the mistakes that cost other people days.',
    lang: 'en',
    href: `${GH}/RUN-A-VALIDATOR.md`,
    onSite: '/validators/',
  },
  {
    id: 'manifesto',
    title: 'Nine years, nine billion — a blockchain for every person in the age of AI',
    summary: 'What this network is for, and why the plan is measured in years rather than features. The reasoning behind everything else on this list.',
    lang: 'vi',
    href: `${GH}/9CHAIN-NINE-YEARS-MANIFESTO.md`,
    also: { lang: 'en', href: `${GH}/9CHAIN-NINE-YEARS-MANIFESTO.en.md` },
    pdf: [
      { lang: 'vi', href: `${GH}/9CHAIN-NINE-YEARS-MANIFESTO.vi.pdf` },
      { lang: 'en', href: `${GH}/9CHAIN-NINE-YEARS-MANIFESTO.en.pdf` },
    ],
  },
  {
    id: 'roadmap',
    title: 'Lộ trình ba năm (2026 → 2029)',
    summary: 'Where the project says it is going over three years, and what each stage has to prove before the next one starts.',
    lang: 'vi',
    href: `${GH}/ROADMAP-2026-2029.md`,
  },
  {
    id: 'architecture',
    title: 'Kiến trúc 9Chain-A1',
    summary: 'How A1 is built as a sovereign fork of Avalanche: what was changed, what was deliberately left alone, and why one repository is enough.',
    lang: 'vi',
    href: `${GH}/ARCHITECTURE.md`,
  },
];
