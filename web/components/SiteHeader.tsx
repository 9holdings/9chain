'use client';

import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { LanguagePicker } from './LanguagePicker';
import { BrandLockup } from './BrandLockup';
import { useT } from '@/lib/i18n';
import type { Core } from '@/lib/i18n/en/core';
import { explorerOrigin } from '@/lib/chain';
import { cx } from './ui';

/**
 * The navigation bar. The component name deliberately matches 9Scan-A1's — a person crossing
 * between the two must not feel a seam, and a person editing the code reads both repos as one.
 *
 * It sits on navy, so the focus ring flips to the source gold automatically (the `.bg-navy`
 * rule in globals.css).
 */

type Item = { label: string; href: string; external?: boolean };

// `/create-chain/`, `/my-chains/` and `/compare/` are pages of this export.
// `/chains/` is proxied by Caddy to a different container — still a real <a> tag like every
// other entry here, so it avoids the `next/link` trap of pointing at a non-Next route.
//
// The OLD console (`/console/`) is still alive and still the operator's path; it leaves this
// nav bar when M10.7 tidies up, rather than being pulled in the same pass.
// 🔴 CHANGED FROM A MODULE CONSTANT INTO A FUNCTION (i18n, 2026-08-27).
// The old version built this array at MODULE SCOPE, i.e. frozen with whatever dictionary was
// present when the file loaded. With a static dictionary that is harmless; with `useT()` it is
// a silent trap: change language and THE WHOLE PAGE flips while the nav bar alone stays in
// English — with no error reported, because the code still runs correctly.
// The paths do NOT change with language (each page has one URL), so only the text takes `t`.
function buildItems(t: Core): Item[] {
  return [
    { label: t.nav.home, href: '/' },
    { label: t.nav.faucet, href: '/faucet/' },
    { label: t.nav.launch, href: '/create-chain/' },
    { label: t.nav.myChains, href: '/my-chains/' },
    { label: t.nav.compare, href: '/compare/' },
    { label: t.nav.directory, href: '/chains/' },
  ];
}

export function SiteHeader() {
  const t = useT();
  const ITEMS = buildItems(t);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Esc closes the drawer, and focus RETURNS to the button that opened it. Without the second
  // half, a keyboard user is thrown back to the top of the page every time the menu closes.
  useEffect(() => {
    if (!drawerOpen) return;
    function phim(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', phim);
    return () => document.removeEventListener('keydown', phim);
  }, [drawerOpen]);

  // Lock background scrolling while the drawer is open — otherwise scrolling on the drawer
  // scrolls the page behind it and the user loses their place.
  useEffect(() => {
    if (!drawerOpen) return;
    const cu = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = cu;
    };
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line-dark bg-navy">
      <div className="khung flex h-16 items-center justify-between gap-4">
        {/* The ORIGINAL logo from the kit — the mark and the word "9Chain" are both inside the
            lockup, so the word "9Chain" is NOT written again in a UI font beside it (the header
            used to hand-assemble `◆` + the word; that was reworking the logo).
            This bar is always `bg-navy` in BOTH themes ⇒ always the dark-background version.
            The "A1" chip stays: it is a network version label, not part of the logo. */}
        <a href="/" className="tap-target flex items-center gap-2">
          {/* 🔴 HEIGHT 28 → 36 (`2026-09-03`, David: "the logo is too small, it looks broken").
              A measured number, not taste: the main site `www.9chain.org` places its lockup at
              **104 × 27 px** inside a 57 px bar. Here the bar is 64 px (`h-16`), and the kit's
              lockup has a 360:128 ratio — meaning it packs MORE internal padding than the main
              site's version, so the same HEIGHT produces noticeably smaller lettering. Matched
              on what the eye actually reads — the width and the type size:
                height 28 → 78.8 px wide · 12.5 px type  (the old one, smaller than the main site)
                height 36 → 101.3 px wide · 16.0 px type ≈ the 104 px of www.9chain.org
              Do NOT fix this by reshaping the `viewBox` or stretching the type in `BrandLockup` —
              that geometry is David's kit, see the comment at the top of that file. Change only
              the display height. */}
          <BrandLockup background="dark" height={36} label={t.common.productName} className="flex-none" />
          <span className="rounded-chip border border-line-dark-2 px-1.5 py-0.5 font-sans text-[11px] font-semibold text-gold-muted">
            A1
          </span>
        </a>

        <nav aria-label={t.nav.home} className="hidden items-center gap-1 md:flex">
          {ITEMS.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className="rounded-btn px-3 py-2 text-sm font-semibold text-on-dark-2 hover:bg-navy-hover hover:text-on-dark"
            >
              {m.label}
            </a>
          ))}
          <a
            href={explorerOrigin()}
            target="_blank"
            rel="noreferrer"
            aria-label={t.nav.explorerAria}
            className="rounded-btn px-3 py-2 text-sm font-semibold text-on-dark-2 hover:bg-navy-hover hover:text-on-dark"
          >
            {t.nav.explorer}
            <span aria-hidden="true"> ↗</span>
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguagePicker />
          <ThemeToggle />
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-expanded={drawerOpen}
            aria-controls="ngan-dieu-huong"
            aria-label={drawerOpen ? t.common.closeMenu : t.common.openMenu}
            className="tap-target inline-flex h-10 w-10 items-center justify-center rounded-btn border border-line-dark text-on-dark-2 hover:bg-navy-hover md:hidden"
          >
            <span aria-hidden="true">{drawerOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* The mobile drawer. Hidden with `hidden` rather than unmounted so that
          `aria-controls` always points at an element that exists. */}
      <div
        id="ngan-dieu-huong"
        ref={drawerRef}
        hidden={!drawerOpen}
        className={cx('border-t border-line-dark bg-navy-panel md:hidden')}
      >
        <nav aria-label={t.common.openMenu} className="khung flex flex-col py-2">
          {ITEMS.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className="rounded-btn px-3 py-3 text-base font-semibold text-on-dark hover:bg-navy-hover"
            >
              {m.label}
            </a>
          ))}
          <a
            href={explorerOrigin()}
            target="_blank"
            rel="noreferrer"
            className="rounded-btn px-3 py-3 text-base font-semibold text-on-dark hover:bg-navy-hover"
          >
            {t.nav.explorer}
            <span aria-hidden="true"> ↗</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
