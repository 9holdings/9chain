import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { pageMeta } from '@/lib/seo';
import { CeremonyContent } from './CeremonyContent';

/**
 * `/ceremony/` — the 9S Union ceremony of 2026-09-09.
 *
 * ═══ WHY A PAGE AND NOT A POST-HOC ANNOUNCEMENT ═══
 * The whole value of the ceremony is that a stranger can verify it afterwards. Verification
 * needs the reader to know, BEFORE the second passes, what was going to be written and how
 * the moment is defined — otherwise "the first block at or after 06:09:09Z carried this
 * text" is a claim they can only take our word for. Publishing the moment, the boundary
 * rule and the three digests in advance is what turns it from an announcement into
 * something checkable.
 *
 * 🔴 THIS PAGE MUST STAY UP AFTER THE EVENT. It changes tense on its own — the phase is
 * computed from the clock in `lib/ceremony.ts`, and the results section fills in from
 * `EVIDENCE` once the bundle exists. Same shape as `/re-genesis/`, which had to be
 * rewritten by hand because it spoke in the future tense for three days after the fact.
 */
export const metadata: Metadata = pageMeta({
  title: EN.ceremony.title,
  desc: EN.ceremony.desc,
  urlPath: '/ceremony/',
});

export default function Trang() {
  return <CeremonyContent />;
}
