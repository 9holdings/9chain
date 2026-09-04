import { describe, expect, it } from 'vitest';
import { EN } from '../lib/i18n/en';
import { presetText, presetLabelOf, presetKeyOf, stepLabel, localiseSteps } from '../lib/serverText';

/**
 * Text the console sends in English must be translated BY CODE on the client.
 *
 * Measured 2026-09-04: `/create-chain/` in Vietnamese, every sentence Vietnamese except the chain
 * type picker ("High throughput") and its description — both arrive from `/api/status`. The
 * console ships `id`/`code` beside those texts so the client can translate; nothing on the client
 * used them. This suite pins (a) the CURRENT list of codes the console emits, copied from `main`
 * (`local-net/lib/presets.mjs`, `server.mjs` `moTienTrinh`) on 2026-09-04, and (b) the fallback
 * rule: an unknown code shows the server's own text, never a blank.
 *
 * ⚠️ (a) is a copy, and copies rot. `scripts/check-server-text.mjs` measures the LIVE directory
 * data at deploy time; this file only proves the dictionary and the helper agree with each other.
 */
const CONSOLE_PRESET_IDS = ['standard', 'zero-fee', 'high-throughput', 'mintable', 'owner-deploy-only', 'permissioned'];
const CONSOLE_STEP_CODES = ['genesis', 'subnet', 'rpc'];

describe('server text is translated by code', () => {
  it('every preset id the console emits has a name and a description in the dictionary', () => {
    for (const id of CONSOLE_PRESET_IDS) {
      const p = (EN.presets as Record<string, { name: string; desc: string } | undefined>)[id];
      expect(p, id).toBeDefined();
      expect(p!.name.length, id).toBeGreaterThan(0);
      expect(p!.desc.length, id).toBeGreaterThan(20);
    }
  });

  it('every progress step code the console emits has a label', () => {
    for (const c of CONSOLE_STEP_CODES) expect((EN.steps as Record<string, string>)[c], c).toBeTruthy();
  });

  it('a known id ignores the server text; an unknown id falls back to it; nothing is ever blank', () => {
    expect(presetText(EN, 'standard', { name: 'SERVER', desc: 'SERVER DESC' })).toEqual(EN.presets.standard);
    expect(presetText(EN, 'brand-new', { name: 'Brand new', desc: 'From the console' })).toEqual({ name: 'Brand new', desc: 'From the console' });
    // No server text either (a record written by hand): the id itself is still readable.
    expect(presetText(EN, 'brand-new')).toEqual({ name: 'brand-new', desc: '' });
    expect(presetText(EN, undefined)).toEqual({ name: '', desc: '' });
  });

  it('records key by id when they have one and by English name when they do not', () => {
    expect(presetKeyOf({ preset: 'standard', presetName: 'Standard' })).toBe('standard');
    expect(presetKeyOf({ presetName: 'Standard' })).toBe('Standard');
    expect(presetKeyOf({})).toBe('');
    expect(presetLabelOf(EN, { preset: 'high-throughput', presetName: 'High throughput' })).toBe(EN.presets['high-throughput'].name);
    // An old record with only a name: shown as is, not as a blank.
    expect(presetLabelOf(EN, { presetName: 'Standard' })).toBe('Standard');
    expect(presetLabelOf(EN, {})).toBe('');
  });

  it('step labels translate by code and keep the server label for an unknown code', () => {
    expect(stepLabel(EN, { code: 'genesis', label: 'SERVER' })).toBe(EN.steps.genesis);
    expect(stepLabel(EN, { code: 'warp', label: 'Enabling Warp' })).toBe('Enabling Warp');
    const out = localiseSteps(EN, [{ code: 'rpc', label: 'x', status: 'done' as const }]);
    expect(out[0]).toEqual({ code: 'rpc', label: EN.steps.rpc, status: 'done' });
  });
});
