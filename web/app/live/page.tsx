import type { Metadata } from 'next';
import { EN } from '@/lib/i18n/en';
import { pageMeta } from '@/lib/seo';
import { LiveContent } from './LiveContent';

/**
 * `/live` — the full disclosure page for the synthetic load test.
 *
 * The home page banner is a one-line claim. This is where the claim is backed up:
 * what the traffic is, why it exists, what is measured versus merely submitted, and
 * the nine addresses producing it. A reader who wants to check us can do it from
 * here without asking anyone.
 *
 * 🔴 THIS PAGE MUST STAY REACHABLE EVEN WHEN THE TEST IS STOPPED. The banner hides
 * itself when the pump is not running; this page does not. Someone who saw the
 * banner yesterday and comes back to check should find the explanation, not a 404 —
 * and "we ran generated traffic between these dates" is exactly the kind of thing a
 * testnet should keep saying out loud after the fact.
 */
export const metadata: Metadata = pageMeta({
  tieuDe: EN.loadTest.title,
  moTa: EN.loadTest.intro,
  duong: '/live/',
});

export default function Trang() {
  return <LiveContent />;
}
