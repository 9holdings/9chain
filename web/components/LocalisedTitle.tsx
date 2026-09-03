'use client';

import { useLocalisedTitle } from '@/lib/pageTitle';

/**
 * A component shell for `useLocalisedTitle()` — it renders nothing.
 *
 * It exists because `app/layout.tsx` is a **server component** and cannot call hooks,
 * and `LanguageProvider` is NOT usable either: it IS the provider, so a `useT()` call
 * inside it would not see its own context. Placing this component INSIDE the provider
 * is the only way for it to read the chosen dictionary.
 *
 * 🔴 `usePathname()`, NOT `useSearchParams()`. Under `output: 'export'`,
 * `useSearchParams` requires a `<Suspense>` boundary around it, and a stray Suspense
 * boundary makes Next emit skeleton HTML with a `<template id="B:1">` marker that is
 * **never resolved** in the browser — see constraint 1 in `lib/i18n/index.tsx` and the
 * `scripts/check-static-export.mjs` gate. `usePathname` needs no Suspense.
 */
export function LocalisedTitle() {
  useLocalisedTitle();
  return null;
}
