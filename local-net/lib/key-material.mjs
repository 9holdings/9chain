/**
 * key-material.mjs — how this project recognises a private key in a file.
 *
 * ═══ WHY THIS IS ONE DECLARATION AND NOT TWO (D-252) ═══
 *
 * This is exactly the kind of rule CLAUDE.md section 6 is about. A second copy of "what a key
 * looks like" would not fail loudly when the two disagreed — it would fail by one of them QUIETLY
 * MISSING a key, which is the failure that costs money. `check-key-leaks.mjs` declared it first;
 * `check-work-retention.mjs` needed the same answer before deleting anything, and copying the
 * regex would have created the second declaration.
 *
 * ═══ 🔴 A KEY, NOT THE WORD "KEY" ═══
 *
 * avalanchego serialises private keys as `PrivateKey-` followed by cb58 — base58, so no `0`, `O`,
 * `I` or `l` — which runs to about 51 characters. Requiring 40 or more of them is what separates
 * a real key from `PrivateKey-*` written in a sentence. That distinction is not theoretical: the
 * first version of the leak gate, without the length requirement, reported two git-tracked
 * DOCUMENTS as leaks, and a gate that cries wolf is a gate people learn to skip.
 */

/** Cheap pre-filter: skip the regex on files that cannot contain a key at all. */
export const KEY_MARKER = "PrivateKey-";

/** `PrivateKey-` + at least 40 cb58 characters. Global, so callers can count matches. */
export const KEY_PATTERN = /PrivateKey-[1-9A-HJ-NP-Za-km-z]{40,}/g;

/**
 * 200 KB. A cb58 key is ~51 bytes and lives in a config, a `.env`, a keys file or a log line —
 * none of which are large. Reading whole multi-megabyte artefacts to look for one would turn a
 * scan of a big tree into something nobody runs, and a gate nobody runs watches nothing.
 */
export const MAX_SCAN_BYTES = 200_000;

/** Every distinct key-shaped string in `text`. Empty when there is none. */
export function findKeyMaterial(text) {
  if (typeof text !== "string" || !text.includes(KEY_MARKER)) return [];
  return [...new Set(text.match(KEY_PATTERN) ?? [])];
}

/** Whether `text` holds anything key-shaped at all. */
export function containsKeyMaterial(text) {
  return findKeyMaterial(text).length > 0;
}
