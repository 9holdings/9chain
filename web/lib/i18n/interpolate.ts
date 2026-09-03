/**
 * Replace `{key}` in a string with a value.
 *
 * 🔴 IN ITS OWN FILE, NOT IN `index.tsx` — and this is a trap that has already bitten.
 * `index.tsx` carries `'use client'`, so a server component importing `interpolate`
 * from there breaks the build with `Failed to collect page data for /re-genesis` — a
 * message that never mentions the client/server boundary, which makes it very hard to
 * trace. And `metadata` (server, generated at build time) NEEDS `interpolate()` to
 * substitute the date into the title.
 * ⇒ A pure function, no hooks, no state: it lives in a neutral file both sides share.
 *
 * A missing key KEEPS its braces — a silent blank reads as lost data, whereas a
 * visible `{count}` can be fixed immediately.
 */
export function interpolate(template: string, value: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (raw, k) => (k in value ? String(value[k]) : raw));
}
