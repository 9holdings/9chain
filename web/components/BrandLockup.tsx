import { Outfit } from 'next/font/google';

/**
 * The 9Chain horizontal lockup — mark + wordmark, **verbatim from David's kit**
 * (`9chain-lockup-dark.svg` / `9chain-lockup-light-transparent.svg`, delivered `2026-08-27`).
 * The originals live in `public/brand/`.
 *
 * ═══ 🔴 DO NOT REWORK IT. THIS IS DAVID'S REQUIREMENT, NOT MY TASTE. ═══
 * Keep UNCHANGED: geometry, proportions, `viewBox 0 0 360 128`, `stroke-width 6.5`,
 * `font-size 57`, `letter-spacing -0.01em`, and the **colours**:
 *
 *     mark        #F5C542   — on every background
 *     wordmark    #FFFFFF   — on a DARK background
 *     wordmark    #0D1733   — on a LIGHT background
 *
 * Those two wordmark colours are what the kit specifies for the two backgrounds, so switching
 * the wordmark with the theme is NOT reworking it — it is exactly how the kit is meant to be used.
 *
 * ⚠️ `#F5C542` is NOT the token system's `--color-gold` (`#ffcb24`), and that is deliberate
 * (David's decision, `2026-08-27`). Do not "tidy this up" by making the mark follow the token —
 * see `docs/BRAND-AUDIT-2026-08-27.md`.
 *
 * ═══ 🔴 WHY THE `Outfit` FONT HAS TO BE LOADED HERE ═══
 * The kit's SVG declares `font-family="Outfit, Arial, sans-serif"`. Outfit is **not installed on
 * most users' machines**, so simply copying the SVG in makes the wordmark fall back to **Arial**
 * — the logo in the wrong font, with no error reported. That is why this component exists rather
 * than an `<img src="/brand/....svg">` tag: `<img>` renders the SVG in its own context and
 * **cannot** reach the page's fonts.
 *
 * ⚠️ LOAD IT VIA `.style.fontFamily`, NEVER VIA A CSS VARIABLE.
 * The site's three UI fonts currently do not run because of exactly that trap: `@theme` emits
 * `--font-sans: var(--font-instrument)` onto `:root` (`<html>`) while `next/font`'s
 * `__variable_*` class sits on `<body>` ⇒ the `var()` cannot resolve ⇒ the whole declaration
 * becomes guaranteed-invalid. Here `outfit.style.fontFamily` is a REAL font-family string put
 * directly into the element's `style` — it never goes through `:root`, so it avoids the trap.
 * See `docs/BRAND-AUDIT-2026-08-27.md`, section B.
 *
 * And for that reason this file touches neither `tokens.css` (which carries an anti-drift
 * fingerprint) nor `--font-*`. It is independent of the B1+B2 cluster awaiting David's decision.
 */

// `subsets: ['latin']` is both sufficient and correct: the wordmark reads "9Chain" — pure ASCII.
// This is the LOGO's font, not a UI font; it replaces nothing.
const outfit = Outfit({ subsets: ['latin'], weight: ['700'], display: 'swap' });

/** Wordmark colour by background, exactly as the kit specifies. */
export const TEXT_ON_DARK = '#FFFFFF';
export const TEXT_ON_LIGHT = '#0D1733';
/** The mark's gold — identical on every background. */
export const MARK_GOLD = '#F5C542';

type Props = {
  /**
   * `'dark'`  — always a dark background (the site header is always `bg-navy`) ⇒ white wordmark.
   * `'light'` — always a light background ⇒ navy wordmark.
   * `'auto'`  — the wordmark follows `html[data-theme]`, through the `--mau-chu-logo` variable
   *   declared in `globals.css`. For places where the background changes by itself (the footer).
   */
  background?: 'dark' | 'light' | 'auto';
  /** Display height in px. The ratio is locked at 360:128, so width = height × 2.8125. */
  height?: number;
  className?: string;
  /**
   * Alternative text for screen readers. Leave it empty when the word "9Chain" is already
   * visible next to the logo — reading it out twice is worse than saying nothing.
   */
  label?: string;
};

export function BrandLockup({ background = 'auto', height = 30, className, label }: Props) {
  const mauChu =
    background === 'dark' ? TEXT_ON_DARK : background === 'light' ? TEXT_ON_LIGHT : 'var(--mau-chu-logo)';

  return (
    <svg
      viewBox="0 0 360 128"
      height={height}
      width={height * (360 / 128)}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
      focusable="false"
    >
      {label ? <title>{label}</title> : null}
      {/* The mark — verbatim from the kit, not one number changed. */}
      <g transform="translate(16 16)">
        <g fill="none" stroke={MARK_GOLD} strokeWidth="6.5">
          <polygon points="48,14 77.4,65 18.6,65" transform="rotate(20 48 48)" />
          <polygon points="48,14 77.4,65 18.6,65" transform="rotate(60 48 48)" />
          <polygon points="48,14 77.4,65 18.6,65" transform="rotate(100 48 48)" />
        </g>
      </g>
      <text
        x="144"
        y="64"
        fontWeight="700"
        fontSize="57"
        letterSpacing="-0.01em"
        fill={mauChu}
        textAnchor="start"
        dominantBaseline="central"
        // See the comment at the top of this file: set directly in `style`, never through a CSS variable.
        style={{ fontFamily: outfit.style.fontFamily }}
      >
        9Chain
      </text>
    </svg>
  );
}
