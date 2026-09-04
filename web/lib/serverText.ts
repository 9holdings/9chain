import type { Dict } from '@/lib/i18n/en';

/**
 * ═══ TEXT THAT ARRIVES FROM THE CONSOLE API — TRANSLATED HERE, BY ITS STABLE CODE ═══
 *
 * The console (`local-net/console/server.mjs`, deployed from `main`) does not know the reader's
 * language, so everything it puts on the wire is English: preset names and descriptions
 * (`/api/status`, `console-chains.json`), progress step labels (`/api/progress`). Measured
 * 2026-09-04 on `/create-chain/` set to Vietnamese: every sentence Vietnamese except the chain
 * type picker and its description. The API ships a STABLE CODE beside each of those texts
 * (`preset: "standard"`, `code: "genesis"`) precisely so the client can translate without the
 * console guessing — this file is that translation, and the ONLY place it happens.
 *
 * 🔴 UNKNOWN CODE ⇒ THE SERVER'S OWN TEXT, NEVER A BLANK. The console can add a preset or a
 * step before the 30 dictionaries learn its code. English is the right answer for that day;
 * `undefined` on screen is not (same rule as the directory's data contract).
 *
 * Source of the codes: `PRESETS[].id` in `local-net/lib/presets.mjs` and `moTienTrinh(...)`
 * in `server.mjs`, both on `main`. `test/server-text.test.ts` pins the current list;
 * `scripts/check-server-text.mjs` checks the LIVE directory data against the dictionary.
 */

export type PresetText = { name: string; desc: string };

type PresetLike = { preset?: string; presetName?: string; presetTen?: string };

export function presetText(t: Dict, id: string | undefined, fallback: { name?: string; desc?: string } = {}): PresetText {
  const known = id ? (t.presets as Record<string, PresetText | undefined>)[id] : undefined;
  return {
    name: known?.name ?? fallback.name ?? id ?? '',
    desc: known?.desc ?? fallback.desc ?? '',
  };
}

/**
 * The key a record's type is filtered and grouped by. The id when the record carries one
 * (every record written since 2026-08-26), else the English name older records carry. A key,
 * not a label: it goes into the `#type=` hash and must not change with the reader's language.
 */
export function presetKeyOf(r: PresetLike): string {
  return (r.preset ?? r.presetName ?? r.presetTen ?? '').trim();
}

/** What the reader sees for a record's type: translated by id, the record's own name otherwise. */
export function presetLabelOf(t: Dict, r: PresetLike): string {
  const key = presetKeyOf(r);
  return key ? presetText(t, key, { name: r.presetName ?? r.presetTen }).name : '';
}

export function stepLabel(t: Dict, step: { code: string; label: string }): string {
  return (t.steps as Record<string, string | undefined>)[step.code] ?? step.label;
}

export function localiseSteps<S extends { code: string; label: string }>(t: Dict, steps: S[]): S[] {
  return steps.map((s) => ({ ...s, label: stepLabel(t, s) }));
}
