'use client';

import { useEffect, useRef, useState } from 'react';
import { hasDictionary, useLanguage, useT } from '@/lib/i18n';
import { LANGUAGES } from '@/lib/i18n/languages';

/**
 * The language picker — 30 languages, English by default, Vietnamese in position 9.
 *
 * ═══ TWO THINGS THIS PICKER SAYS OUT LOUD INSTEAD OF HIDING ═══
 *
 * 1. 🔴 **REVIEW LEVEL.** 28 of 30 are machine-translated (30 minus the `en` source and the
 *    reviewed `vi`). This site tells strangers their assets will be erased permanently — a
 *    mistranslated sentence on `/re-genesis/` is not a typo, it is a person who does not
 *    understand they are about to lose money. Presenting 30 entries that all look equal invites
 *    the reader to conclude something untrue; that is the same class of failure the project
 *    removed from the home page on `27/08` ("9 validators" standing alone).
 *    ⇒ Unreviewed translations carry a mark, and that mark goes into the `aria-label` too.
 *
 * 2. 🔴 **LANGUAGES WITH NO DICTIONARY YET.** While the other 28 were being built they were
 *    **disabled**, rather than selectable and then silently falling back to English. A silent
 *    fallback is the worst failure here: the user picks their own language, receives English,
 *    and nothing tells them why.
 *
 * ⚠️ NO flag images — two reasons, either one sufficient (taken verbatim from 9Scan-A1):
 *    (a) a flag is a COUNTRY, not a language; Arabic spans 20+ countries and English belongs to
 *        none of them — attaching one flag is taking a side.
 *    (b) flag images used to be fetched straight from a third-party CDN by the user's browser:
 *        30 requests exposing their IP to a party with nothing to do with this project.
 *
 * Uses `<details>`/`<summary>` instead of a hand-written menu: it opens and closes from the
 * keyboard without a single line of JS, and adds no focus traps.
 */
export function LanguagePicker() {
  const t = useT();
  const { code, language, loading, setLanguage } = useLanguage();
  const [opened, setOpened] = useState(false);
  const wrapRef = useRef<HTMLDetailsElement>(null);

  // Click outside to close. Esc is already handled by `<details>`.
  useEffect(() => {
    if (!opened) return;
    const external = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpened(false);
    };
    document.addEventListener('mousedown', external);
    return () => document.removeEventListener('mousedown', external);
  }, [opened]);

  return (
    <details
      ref={wrapRef}
      open={opened}
      onToggle={(e) => setOpened((e.currentTarget as HTMLDetailsElement).open)}
      className="relative"
    >
      <summary
        className="tap-target flex cursor-pointer list-none items-center gap-1.5 rounded-btn border border-line-dark px-2.5 py-1.5 text-sm text-on-dark-2 transition-colors hover:border-gold hover:text-gold"
        aria-label={`${t.langPicker.label}: ${language.englishName}`}
      >
        <span aria-hidden="true" className="font-mono text-xs font-bold uppercase">
          {code}
        </span>
        <span className="hidden sm:inline">{language.ten}</span>
        {loading && <span className="sr-only">{t.common.loading}</span>}
      </summary>

      {/* 🔴 ON A PHONE THIS PANEL IS ANCHORED TO THE SCREEN, NOT TO ITS BUTTON.
          Measured at 320px: the button's own right edge sits at x=196, so an `end-0` panel 16rem
          wide ran from −60 to 196 — the first characters of all 30 language names were off the
          left of the screen, on the one menu a reader opens precisely BECAUSE they cannot read the
          language they are looking at. Capping the WIDTH does not fix that: the panel is pinned to
          a narrow button, so it stays hung off the edge, only narrower. It has to be pinned to the
          viewport instead. Same at 1.25× OS text (rem grows, the button does not move right).
          `top-16` is in rem on purpose — it tracks the header, which also grows with text size.
          From `sm` up, the desktop behaviour is exactly what it was: dropped under the button. */}
      <div className="fixed inset-x-3 top-16 z-50 max-h-[70vh] overflow-y-auto rounded-card border border-line bg-surface p-1.5 shadow-card sm:absolute sm:inset-x-auto sm:end-0 sm:top-auto sm:mt-2 sm:w-64">
        <ul>
          {LANGUAGES.map((n) => {
            const co = hasDictionary(n.code);
            const dangChon = n.code === code;
            return (
              <li key={n.code}>
                <button
                  type="button"
                  disabled={!co}
                  onClick={() => {
                    setLanguage(n.code);
                    setOpened(false);
                  }}
                  aria-current={dangChon ? 'true' : undefined}
                  // The full label for screen readers: an endonym does not help someone
                  // listening through a voice for a different language.
                  aria-label={
                    `${n.englishName}` +
                    (n.review === 'machine' ? ` — ${t.langPicker.machineBadge}` : '') +
                    (co ? '' : ` — ${t.langPicker.notAvailable}`)
                  }
                  className={
                    'flex w-full items-center justify-between gap-2 rounded-btn px-3 py-2 text-start text-sm ' +
                    (dangChon ? 'bg-gold-tint font-semibold text-ink ' : 'text-body ') +
                    (co ? 'hover:bg-surface-alt' : 'cursor-not-allowed opacity-45')
                  }
                >
                  <span className="flex min-w-0 flex-col">
                    {/* `lang` on the entry itself: the screen reader switches voice in the right
                        place, otherwise it reads "Tiếng Việt" in English phonetics. */}
                    <span lang={n.code} dir={n.dir} className="truncate">
                      {n.ten}
                    </span>
                    <span className="truncate text-xs text-muted">{n.englishName}</span>
                  </span>
                  {/* 🔴 THE "machine translated" CHIP USED TO SIT HERE, REMOVED `2026-09-03` — David's
                      decision. 28 of 30 rows carried it, so visually it distinguished nothing:
                      the rare thing is a row WITHOUT the mark, and a reader scanning a list of
                      30 entries filters out whatever repeats on every line. It only made the
                      list noisy.
                      The disclosure is NOT lost, it moved: this button's own `aria-label` still
                      states it, and the full explanation at the foot of the list is untouched.
                      See §1 at the top of this file — what must be preserved is "the reader can
                      tell this translation has not been reviewed", not "there must be a chip on
                      every row". */}
                  {!co ? (
                    <span className="shrink-0 text-xs text-muted">{t.langPicker.notAvailable}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="border-t border-line px-3 py-2 text-xs text-muted">{t.langPicker.machineNote}</p>
      </div>
    </details>
  );
}
