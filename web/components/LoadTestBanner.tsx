'use client';

import { dien, useT } from '@/lib/i18n';
import { dangChay, useLoadTest } from '@/lib/loadTest';
import { dinhDangSo } from '@/lib/so';
import { useNgonNgu } from '@/lib/i18n';

/**
 * Site-wide strip announcing the synthetic load test.
 *
 * ═══ IT RENDERS NOTHING UNLESS THE TEST IS ACTUALLY RUNNING ═══
 * Three ways this returns null: the status file is unreachable, the pump says it is
 * stopped, or the file is stale. That is deliberate and it is the safe direction to
 * fail in — a banner is a claim about right now, and a banner that outlives the
 * thing it describes is a false one. Getting no banner during a real test costs a
 * reader nothing; getting a banner during no test costs the truth.
 *
 * The inverse failure is worse and is handled elsewhere: traffic running with NO
 * disclosure. That cannot happen here, because the pump publishes the file that
 * turns this banner on before it sends anything, and it is the same file either way.
 *
 * ⚠️ Unlike `ReGenesisBanner`, this one has no fixed end date to hand-remove. It
 * follows the pump. Stop the pump and it is gone from every page on the next load.
 */
export function LoadTestBanner() {
  const t = useT();
  const { ma } = useNgonNgu();
  const tt = useLoadTest();

  if (tt.pha !== 'xong' || !dangChay(tt.tt)) return null;

  // Prefer the measured rate over the configured target: the banner should say what
  // the network is actually doing, not what we asked it to do. They agree when
  // things are healthy, and when they disagree the measured one is the true one.
  const tps = tt.tt.measured.committedTps ?? tt.tt.targetTps;

  return (
    <aside aria-label={t.loadTest.badge} className="border-b border-gold-line bg-gold-tint text-ink">
      <div className="khung flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 text-sm">
        <span className="font-semibold">{t.loadTest.badge}</span>
        <span>{dien(t.loadTest.banner, { tps: dinhDangSo(tps, ma) })}</span>
        <a
          href="/live/"
          className="font-semibold text-gold-ink-strong underline underline-offset-2 hover:no-underline"
        >
          {t.loadTest.bannerLink}
        </a>
      </div>
    </aside>
  );
}
