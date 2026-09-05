import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { pageMeta } from '@/lib/seo';
import { ValidatorsContent } from './ValidatorsContent';

/**
 * `/validators/` — how an outsider joins the validator set, and what it honestly costs.
 *
 * ═══ WHY THIS IS A PRODUCT PAGE AND NOT A LINK TO THE GUIDE ═══
 * `docs/RUN-A-VALIDATOR.md` is complete and public, and it is 465 lines of commands. What it
 * cannot do is answer the question a visitor actually has first — *am I allowed, what does it
 * cost me, and what do I get* — before deciding whether to spend an evening reading commands.
 * Everything on this page is that decision; the guide is the link at the bottom.
 *
 * 🔴 THE PAGE ANSWERS A SENTENCE THE SITE ALREADY PUBLISHES. The home page says nine of the
 * validators run on one machine at one provider. Until today that was a confession with no
 * exit: no cost, no instructions, no statement that outsiders are even permitted. Two people
 * joined anyway, and one of them lost a whole term to a port that was never forwarded — which
 * is why `honest3` is on this page in three sentences rather than on line 400 of a document.
 */
export const metadata: Metadata = pageMeta({
  title: EN.validators.title,
  desc: EN.validators.desc,
  urlPath: '/validators/',
});

export default function Trang() {
  return <ValidatorsContent />;
}
