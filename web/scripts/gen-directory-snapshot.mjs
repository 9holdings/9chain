#!/usr/bin/env node
/**
 * gen-directory-snapshot.mjs — capture the L1 directory into the repo, for PRERENDERING.
 *
 * ═══ THE PROBLEM ═══
 * `/chains/` is the project's showcase, and until 2026-09-05 its exported HTML contained
 * exactly one word: "Loading…". Everything else arrived after hydration. A search engine, an
 * AI reader, a phone on a slow connection and anyone with JavaScript off all saw a blank
 * page where eleven chains should be — on the page whose entire purpose is to show them.
 *
 * ═══ WHY A COMMITTED SNAPSHOT AND NOT A FETCH AT BUILD TIME ═══
 * Fetching during `next build` would make the build depend on the network being up and on
 * WHAT it happened to say, so two builds of the same commit would differ and neither could
 * be reproduced later. The snapshot is data in the repo, refreshed by running this script on
 * purpose — the same shape as `sync-tokens.mjs`, and for the same reason.
 *
 * 🔴 WHAT THE SNAPSHOT MAY AND MAY NOT CARRY. It carries the LEDGER: which chains exist,
 * their ids, owners, types, when they were created. It must NEVER carry a status, because a
 * status is a measurement and this file is a memory. The page renders the ledger immediately
 * and marks every chain as awaiting measurement until the browser has actually measured it —
 * which is exactly what an honest page can say about a list it read some days ago.
 *
 * Usage:  node web/scripts/gen-directory-snapshot.mjs [https://a1.9chain.org]
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NAY = path.dirname(fileURLToPath(import.meta.url));
const GOC = (process.argv[2] ?? 'https://a1.9chain.org').replace(/\/$/, '');
const NGUON = `${GOC}/chains/data/console-chains.json`;

/**
 * Fields the FIRST PAINT renders. A snapshot is not a backup: every key here is bytes in the
 * bundle for every visitor, on a page that fetches the real thing a second later.
 *
 * 🔴 `rpc`, `subnetID` and `blockchainID` are deliberately absent. They are the three longest
 * strings per record (~210 characters together) and none of them appear until a reader expands
 * a row — by which time the live read has replaced this data entirely. Including them cost
 * `/chains/` 7 KB gzip and pushed it to 156.9 KB against a 160 ceiling, i.e. most of the
 * remaining headroom, for content nobody sees. Their absence is a valid record state by the
 * directory's own data contract (every key optional).
 */
const GIU = ['name', 'chainId', 'admin', 'preset', 'presetName', 'symbol', 'createdAt', 'revokedAt', 'thuHoiLuc'];

/**
 * A ceiling on the snapshot itself, in bytes of JSON.
 *
 * 🔴 THIS IS A TRIPWIRE FOR A PLAN ALREADY ON THE ROADMAP. The 108-L1 load test would put a
 * hundred records through here, and this design — every row inlined into the bundle — does not
 * survive that: the page would carry ten times this weight before it drew anything. When this
 * fires, the answer is NOT to raise it. It is to snapshot one page of rows plus the true
 * totals, so the tiles stay honest while the bundle stays small.
 */
const TRAN_BYTE = 24 * 1024;

function loc(r) {
  const o = {};
  for (const k of GIU) if (r[k] !== undefined && r[k] !== null) o[k] = r[k];
  return o;
}

const r = await fetch(NGUON, { signal: AbortSignal.timeout(25_000) });
if (!r.ok) {
  console.log(`✗ ${NGUON} → HTTP ${r.status}. The snapshot in the repo is unchanged.`);
  process.exit(1);
}
const du = await r.json();
const chains = (Array.isArray(du.chains) ? du.chains : []).map(loc);
const retired = (Array.isArray(du.retired) ? du.retired : []).map(loc);

if (chains.length === 0 && retired.length === 0) {
  // An empty read is far more likely to be a broken endpoint than a network with no chains,
  // and overwriting a good snapshot with nothing would silently empty the page.
  console.log('✗ the directory came back empty — refusing to overwrite the snapshot');
  process.exit(1);
}

const kichThuoc = Buffer.byteLength(JSON.stringify({ chains, retired }), 'utf8');
if (kichThuoc > TRAN_BYTE) {
  console.log(`✗ the snapshot would be ${(kichThuoc / 1024).toFixed(1)} KB of JSON, ceiling ${TRAN_BYTE / 1024} KB`);
  console.log('  Every byte here ships in the bundle to every visitor. Do not raise the ceiling:');
  console.log('  snapshot ONE PAGE of rows plus the true totals, so the tiles stay honest and the');
  console.log('  bundle stays small. See the comment on TRAN_BYTE.');
  process.exit(1);
}

const luc = new Date().toISOString();
const ra = `/**
 * GENERATED — do not edit. \`node web/scripts/gen-directory-snapshot.mjs\`
 *
 * A capture of the L1 ledger, committed so \`/chains/\` has real content in its exported HTML
 * instead of the word "Loading…". Read the script for what this may and may not contain.
 *
 * 🔴 IT HAS NO STATUSES, AND MUST NOT GAIN ANY. Whether a chain is running is a measurement,
 * and this file is a memory. The page shows every row as awaiting measurement until the
 * browser has measured it.
 */
import type { DirectoryFile } from './directory';

/** When this capture was read from the network. Shown to the reader, not hidden. */
export const SNAPSHOT_AT = '${luc}';

export const SNAPSHOT: DirectoryFile = ${JSON.stringify({ chains, retired }, null, 2)};
`;

const dich = path.join(NAY, '..', 'lib', 'directorySnapshot.ts');
writeFileSync(dich, ra.replace(/\r\n/g, '\n'), 'utf8');
console.log(`✓ lib/directorySnapshot.ts — ${chains.length} chains · ${retired.length} retired · read ${luc}`);
