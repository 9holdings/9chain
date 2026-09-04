'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';

/**
 * Light/dark toggle.
 *
 * `data-theme-switching` is set for exactly one frame to kill every transition —
 * without it the selected nav item sticks at its light-theme colour on the dark
 * background (navy on navy, 1.05:1 contrast) for as long as the transition runs.
 */
export function ThemeToggle() {
  const t = useT();
  const [dark, setDark] = useState<boolean | null>(null);

  // Read the REAL state from the DOM (ThemeScript set it before first paint) rather
  // than deriving it again from localStorage: two sources of truth for one thing are
  // two things that have to be kept in agreement.
  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);

  function toggle() {
    const next = !(document.documentElement.getAttribute('data-theme') === 'dark');
    const html = document.documentElement;
    html.setAttribute('data-theme-switching', '');
    html.setAttribute('data-theme', next ? 'dark' : 'light');
    try {
      localStorage.setItem('9chain-theme', next ? 'dark' : 'light');
    } catch {
      /* If it cannot be stored, still switch for this session — a temporary switch
         beats a dead button. */
    }
    setDark(next);
    // Drop the flag on the next frame, once the new colours have been painted.
    requestAnimationFrame(() => requestAnimationFrame(() => html.removeAttribute('data-theme-switching')));
  }

  // Before the state is known, render the button with a neutral label rather than
  // rendering nothing: a button that disappears and comes back makes the nav bar jump.
  const label = dark === null ? t.common.switchToDark : dark ? t.common.switchToLight : t.common.switchToDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="tap-target inline-flex h-10 w-10 items-center justify-center rounded-btn border border-line-dark text-on-dark-2 hover:text-on-dark hover:bg-navy-hover"
    >
      <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
    </button>
  );
}
