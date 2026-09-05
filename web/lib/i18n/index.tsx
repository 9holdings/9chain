'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { EN_CORE, type Core } from './en/core';
import type { Dict } from './en';
export { interpolate } from './interpolate';
import { guessLanguage, STORAGE_KEY, isValidCode, DEFAULT_CODE, LANGUAGES, lookup, type Language } from './languages';

/**
 * The multilingual engine for a1.9chain.org — 30 languages, English by default.
 *
 * ═══ THREE CONSTRAINTS, EACH ONE A TRAP SOMEBODY ALREADY PAID FOR ═══
 * Copied from 9Scan-A1 (`lib/i18n/explorer/index.ts`); they went first and measured the cost.
 *
 * 1. 🔴 **Do NOT add a `<Suspense>` boundary, do NOT use `use()`/`lazy()`.**
 *    With `output: 'export'`, a stray Suspense boundary makes Next write out skeleton HTML
 *    carrying a `<template id="B:1">` marker, and that boundary is **never resolved** in
 *    the browser. Use `useState` + `useEffect`.
 *    (Our own gate `scripts/check-static-export.mjs` has been watching for this all along.)
 *
 * 2. 🔴 **ONE provider for the whole tree.** If each hook loaded its own dictionary, the
 *    components would change state on different beats and the user would see a page that
 *    is **half English, half Vietnamese** for a few frames. The whole tree has to flip at once.
 *
 * 3. 🔴 **`LOADERS` must be STATIC `import()` calls, written out line by line.**
 *    `import(\`./dicts/${ma}\`)` with a variable makes the bundler pull THE WHOLE FOLDER
 *    into one chunk — i.e. straight back where we started, while looking fixed.
 *    9Scan's measurement: statically importing all 30 dictionaries took First Load JS from
 *    **264 kB to 528 kB**. Our ceiling is 160 KB gzip and the heaviest page sits at 130 KB.
 *
 * ═══ WHY ENGLISH TRAVELS IN THE BUNDLE AND THE OTHER 29 DO NOT ═══
 * English is **the source of truth for the keys** and the fallback whenever a key is missing or
 * a chunk fails to load. It has to be present from the very first frame, without waiting on
 * the network.
 *
 * ═══ 🔴 BUT ONLY THE CORE OF ENGLISH RIDES IN THE SHARED BUNDLE (2026-09-05) ═══
 * This file imports `EN_CORE` — the groups every page reads — and NOTHING ELSE from `en/`.
 * Each screen imports its own English (`en/faucet.ts`, `en/directory.ts`, …) and hands it to
 * `usePageT()` below, so the bundler places those sentences in that page's chunk alone.
 * Measured before the split: every page carried every sentence of every other page, and the
 * heaviest page sat 3.4 KB under the ceiling with each new page costing ~2 KB on ALL pages.
 *
 * The other 29 languages are untouched by this: they still load whole, as one chunk each,
 * only when chosen. Splitting THEM would be 29 × 14 files for a download nobody makes by
 * default; the budget gate measures the first load, and the first load is English.
 *
 * 🔴 DO NOT import `EN` (from `./en`) here or in any other `'use client'` module. It is the
 * full assembly for the server and the tests; one client import of it puts all 14 files back
 * into the shared bundle, and the code keeps working, so nothing but the size would tell you.
 * `scripts/check-en-split.mjs` measures the built pages for exactly that.
 */

type BoiCanh = {
  code: string;
  language: Language;
  /** The core groups, always present. When a translation is loaded this IS that translation. */
  t: Core;
  /** The whole dictionary of a loaded translation; `null` while English (only the core is in memory). */
  full: Dict | null;
  /** `true` while a non-EN chunk is loading. Used to avoid text flashing. */
  loading: boolean;
  setLanguage: (code: string) => void;
};

const Ctx = createContext<BoiCanh | null>(null);

/**
 * 🔴 WRITTEN OUT LINE BY LINE — see constraint 3 above. Do not fold it into a loop.
 * A missing line here = the user picks their own language and gets English back,
 * **no error, no warning**, and only they bear it. `checkLoaders()` below catches that.
 */
const LOADERS: Record<string, () => Promise<{ default: Dict }>> = {
  zh: () => import('./dicts/zh'),
  hi: () => import('./dicts/hi'),
  es: () => import('./dicts/es'),
  ar: () => import('./dicts/ar'),
  fr: () => import('./dicts/fr'),
  pt: () => import('./dicts/pt'),
  ru: () => import('./dicts/ru'),
  de: () => import('./dicts/de'),
  ja: () => import('./dicts/ja'),
  bn: () => import('./dicts/bn'),
  ur: () => import('./dicts/ur'),
  id: () => import('./dicts/id'),
  mr: () => import('./dicts/mr'),
  tr: () => import('./dicts/tr'),
  it: () => import('./dicts/it'),
  ko: () => import('./dicts/ko'),
  pl: () => import('./dicts/pl'),
  nl: () => import('./dicts/nl'),
  th: () => import('./dicts/th'),
  uk: () => import('./dicts/uk'),
  ms: () => import('./dicts/ms'),
  fa: () => import('./dicts/fa'),
  tl: () => import('./dicts/tl'),
  sw: () => import('./dicts/sw'),
  ha: () => import('./dicts/ha'),
  te: () => import('./dicts/te'),
  ta: () => import('./dicts/ta'),
  gu: () => import('./dicts/gu'),
  vi: () => import('./dicts/vi'),
};

/**
 * 🔴 DELIBERATELY HALF-BUILT — the other 28 dictionaries do not exist yet (2026-08-27).
 *
 * The registry declares 30 languages; `LOADERS` has 2 (EN in the bundle + VI). That is NOT
 * an oversight: building a vertical slice of EN+VI first, and only then generating the other
 * 28, means that if the engine is wrong we find out after TWO dictionaries, not after thirty.
 *
 * ⚠️ While it is half-built, a language with no dictionary MUST appear as **unavailable** in
 * the picker — `hasDictionary()` below is what the picker consults. Letting them look usable
 * and then silently falling back to English is the worst kind of failure: the user picks
 * their own language, sees English, and nothing tells them why.
 */
export function hasDictionary(code: string): boolean {
  return code === DEFAULT_CODE || code in LOADERS;
}


/**
 * A gate against REGISTRY DRIFT: every language in the registry (except EN) must have a line
 * in `LOADERS`, and vice versa. Dev only — in production it would only cost bytes without
 * saving anyone.
 */
export function checkLoaders(): string[] {
  const trongSo = LANGUAGES.map((n) => n.code).filter((m) => m !== DEFAULT_CODE);
  const trongNap = Object.keys(LOADERS);
  return [
    ...trongSo.filter((m) => !trongNap.includes(m)).map((m) => `${m}: có trong sổ, THIẾU trong LOADERS`),
    ...trongNap.filter((m) => !trongSo.includes(m)).map((m) => `${m}: có trong LOADERS, THIẾU trong sổ`),
  ];
}

/**
 * Read the saved choice. Failing that, guess from the browser's languages, then fall back to EN.
 *
 * 🔴 FILTER THROUGH `hasDictionary()` ON BOTH PATHS — this bug was caught while writing the
 * test, not at runtime. `isValidCode()` only asks "is this code in the registry", and the
 * registry declares all 30 while only 2 dictionaries exist. Without the filter:
 *   • a user with a Japanese browser ⇒ `ma = 'ja'` ⇒ `LOADERS['ja']` is absent ⇒ the text
 *     falls back to English, BUT `<html lang>` is still set to `ja`.
 *   • the screen reader then reads **English in Japanese phonetics** — no error, no warning,
 *     and a sighted user sees nothing odd to report.
 * Same class of failure as the `lang="undefined"` that `lookup()` exists to prevent.
 *
 * Applies to the SAVED value too: a language can be removed from `LOADERS` later, and the
 * user's `localStorage` will still be pointing at it.
 */
function maBanDau(): string {
  if (typeof window === 'undefined') return DEFAULT_CODE;
  try {
    const luu = window.localStorage.getItem(STORAGE_KEY);
    if (luu && isValidCode(luu) && hasDictionary(luu)) return luu;
  } catch {
    /* Private mode / blocked cookies: if it cannot be read, treat it as never chosen. */
  }
  const doan = guessLanguage(navigator.languages ?? [navigator.language]);
  return hasDictionary(doan) ? doan : DEFAULT_CODE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 🔴 Initialise with DEFAULT_CODE, NOT with `maBanDau()`. Under static export the HTML is
  // pre-generated in English; if the first render in the browser already differs from that
  // HTML, React reports a hydration mismatch and throws the whole tree away. Reading the
  // choice in a `useEffect` — i.e. AFTER hydration — is the only correct approach here.
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  // `null` = English: only the core is in memory, each screen brings its own groups (`usePageT`).
  const [full, setFull] = useState<Dict | null>(null);
  const [loading, datDangNap] = useState(false);

  useEffect(() => {
    const m = maBanDau();
    if (m !== DEFAULT_CODE) setCode(m);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (code === DEFAULT_CODE) {
      setFull(null);
      datDangNap(false);
      return;
    }
    const nap = LOADERS[code];
    if (!nap) {
      // Registry drift — `checkLoaders()` should have caught this in dev. Fall back to EN rather than a blank page.
      setFull(null);
      return;
    }
    datDangNap(true);
    nap()
      .then((m) => {
        if (cancelled) return;
        setFull(m.default);
        datDangNap(false);
      })
      .catch(() => {
        // The chunk failed to load (network dropped, stale deploy). Keep EN — being readable
        // in another language still beats staring at an empty page.
        if (!cancelled) {
          setFull(null);
          datDangNap(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  // 🔴 `lang` and `dir` must change WITH the dictionary. A wrong `lang` makes the screen
  // reader pick the wrong voice — the whole page read in another language's phonetics. A
  // wrong `dir` makes Arabic, Urdu and Persian (3 of 30) run the wrong way.
  useEffect(() => {
    const n = lookup(code);
    document.documentElement.setAttribute('lang', n.code);
    document.documentElement.setAttribute('dir', n.dir);
  }, [code]);

  const setLanguage = useCallback((moi: string) => {
    // The picker already disables entries with no dictionary, but block it here as well: a
    // call from somewhere else (a deep link, the console) must not put the site into a state
    // where `lang` says one thing and the text says another.
    if (!isValidCode(moi) || !hasDictionary(moi)) return;
    setCode(moi);
    try {
      window.localStorage.setItem(STORAGE_KEY, moi);
    } catch {
      /* If it cannot be saved, the choice lives only for this session — still better than refusing to change. */
    }
  }, []);

  const value = useMemo<BoiCanh>(
    () => ({ code, language: lookup(code), t: full ?? EN_CORE, full, loading, setLanguage }),
    [code, full, loading, setLanguage],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Get the core groups in the language in use — what the layout, the UI kit and every shared
 * component read. A screen that needs its own groups calls `usePageT()` instead.
 *
 * ⚠️ Called OUTSIDE the provider it falls back to English rather than throwing. The reason:
 * places like the 404 page, or a component mounted on its own in a test, do not necessarily
 * have a provider, and blanking the page over a missing context trades a text problem for
 * a dead page.
 */
export function useT(): Core {
  return useContext(Ctx)?.t ?? EN_CORE;
}

/**
 * The core PLUS the groups a screen brought with it.
 *
 * `sections` is the screen's own English — `EN_FAUCET`, or a module-level merge of several
 * files (`const SECTIONS = { ...EN_DIRECTORY, ...EN_LAUNCH }`). It must be a MODULE CONSTANT,
 * not built inside the component: the merge below is memoised on its identity, and an object
 * literal in the render body is a new identity every render.
 *
 * In English the result is `core + sections`, assembled synchronously from what the page's own
 * chunk already holds — so the first frame is complete, no second beat, no flash (the two
 * constraints at the top of this file are kept). In any other language the loaded translation
 * is the whole dictionary, a superset of `Core & S`, and is returned as is.
 *
 * 🔴 The return type is `Core & S` and NOT `Dict`. That is the compile-time half of the split:
 * a component that reads `t.directory.*` without having imported `en/directory.ts` is red under
 * `tsc` — instead of reading `undefined` at runtime in English and the right text in the other
 * 29 languages, which is the exact shape of bug this dictionary's tests exist to prevent.
 */
export function usePageT<S extends object>(sections: S): Core & S {
  const c = useContext(Ctx);
  const full = c?.full ?? null;
  const core = c?.t ?? EN_CORE;
  return useMemo(() => (full as (Core & S) | null) ?? ({ ...core, ...sections } as Core & S), [full, core, sections]);
}

/**
 * The whole dictionary of a loaded translation, or `null` while English is showing.
 * For the one reader that needs every page's group at once — the tab-title table in
 * `lib/pageTitle.ts` — and that, in English, has a build-time value to fall back on.
 */
export function useFullDict(): Dict | null {
  return useContext(Ctx)?.full ?? null;
}

/** Language state — for the picker and for anywhere that needs the writing direction. */
export function useLanguage() {
  const c = useContext(Ctx);
  return {
    code: c?.code ?? DEFAULT_CODE,
    language: c?.language ?? lookup(DEFAULT_CODE),
    loading: c?.loading ?? false,
    setLanguage: c?.setLanguage ?? (() => {}),
  };
}
