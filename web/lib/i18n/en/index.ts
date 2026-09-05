/**
 * English — DEFAULT language and SOURCE OF TRUTH for keys.
 * (i18n, 2026-08-27. The original Vietnamese: `dicts/vi.ts` — read there for WHY each sentence
 * is worded as it is; the reasoning stays there rather than being duplicated.)
 *
 * ═══ WHY THIS FILE IS SPECIAL ═══
 * 1. It defines the `Dict` type. A key missing here does not exist for any of the 30 languages;
 *    an extra key makes the other 29 translations red under `tsc`.
 * 2. Every other translation is made FROM HERE, not from `vi.ts`. Translating through two layers
 *    doubles the places meaning can drift.
 *
 * ═══ 🔴 ONE FOLDER, NOT ONE FILE — AND WHICH FILE YOU IMPORT DECIDES WHAT THE READER PAYS ═══
 * Until 2026-09-05 the whole of English was ONE object in ONE file, imported by the language
 * provider in the root layout. That put every sentence of every page into the JavaScript of
 * EVERY page: measured on the build of that day, the heaviest page (`/chains/`) stood at
 * 156.6 KB gzip against a 160 KB ceiling, and each new page had moved it up by ~2 KB — a page
 * about the ceremony was making the faucet heavier. Two more pages and the ceiling breaks, and
 * raising the ceiling is not a fix.
 *
 * Now English is split by WHO READS IT, one file per group of readers:
 *   • `core.ts`  — the groups every page reads (layout, UI kit, pure libraries). This is the
 *                  ONLY file the language provider imports, so it is the only English in the
 *                  shared bundle.
 *   • the rest   — one file per screen. A screen imports its own file and hands it to
 *                  `usePageT()`; the bundler then places those sentences in THAT page's chunk.
 *
 * 🔴 THIS `index.ts` IS FOR THE SERVER AND THE TESTS ONLY. It re-assembles the full `EN` for
 * `metadata` (build time), for the 4 test suites that read the full shape, and for the type.
 * Importing `EN` from any `'use client'` module drags all 14 files back into the shared bundle
 * and undoes the split — silently, since the code still works. `scripts/check-en-split.mjs`
 * measures the built output against exactly that, page by page.
 *
 * 🔴 THREE SENTENCES THAT MUST NOT BE SOFTENED IN ANY LANGUAGE:
 *    `rebuild.*` / `rebuildDone.*` (the network was erased) · `launch.noteHow` (a one-way door) ·
 *    `myChains.revoke*` (revoking does not give the name back).
 *    They say "permanently" and "cannot be undone" to stop users losing assets by assuming it can
 *    be redone. Translating them to sound gentler removes the exact thing they exist to do.
 *
 * ⚠️ THE TEXT SHAPE IS PART OF THE CONTRACT. Five gates read these files as TEXT, not as modules
 * (`check-dict-values`, `check-interpolate`, `check-links`, `check-server-text`, and the deploy
 * gate `check-decentralisation-claim`): each group opens with `  name: {` at two spaces and
 * closes with `  },`. Every file in this folder keeps that shape by wrapping its groups in one
 * exported object, so the gates read the folder's files concatenated exactly as they read the
 * old single file. Change the indentation and five gates go quiet at once.
 */
import { EN_CORE } from './core';
import { EN_HOME } from './home';
import { EN_SERVER_TEXT } from './server-text';
import { EN_REBUILD } from './rebuild';
import { EN_DIRECTORY } from './directory';
import { EN_CEREMONY } from './ceremony';
import { EN_VALIDATORS } from './validators';
import { EN_DOCS } from './docs';
import { EN_NINE_YEARS } from './nine-years';
import { EN_LAUNCH } from './launch';
import { EN_MY_CHAINS } from './my-chains';
import { EN_COMPARE } from './compare';
import { EN_FAUCET } from './faucet';

/** The whole of English, in one object — server side, tests and the type. See the header. */
export const EN = {
  ...EN_CORE,
  ...EN_SERVER_TEXT,
  ...EN_REBUILD,
  ...EN_HOME,
  ...EN_DIRECTORY,
  ...EN_CEREMONY,
  ...EN_VALIDATORS,
  ...EN_DOCS,
  ...EN_NINE_YEARS,
  ...EN_LAUNCH,
  ...EN_MY_CHAINS,
  ...EN_COMPARE,
  ...EN_FAUCET,
};

/**
 * The type of EVERY full dictionary. All 29 translations must match this shape exactly.
 *
 * The section files are plain object literals (NOT `as const`), so every leaf is already
 * `string` and a translation can be assigned to it. The old single file was `as const` and
 * needed a widening helper for exactly that reason; the helper went with the file.
 */
export type Dict = typeof EN;

/** The groups every page carries. What `useT()` returns; see `core.ts`. */
export type { Core } from './core';

export default EN;
