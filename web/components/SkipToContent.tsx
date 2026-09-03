'use client';

import { useT } from '@/lib/i18n';

/**
 * The "skip navigation" link — the first thing to receive focus on Tab.
 *
 * It is a client component for exactly one reason: its text has to follow the chosen
 * language, and `layout.tsx` is a server component (it has to be — `export const
 * metadata` is only valid on the server). See `components/PageHeader.tsx` for the
 * site-wide boundary.
 *
 * 🔴 It must come BEFORE everything else in `<body>`. That is the whole point: a
 * keyboard user should not have to walk the entire nav bar on every page.
 */
export function SkipToContent() {
  const t = useT();
  return (
    <a
      href="#noi-dung"
      className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-navy"
    >
      {t.common.skipToContent}
    </a>
  );
}
