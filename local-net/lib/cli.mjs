/**
 * cli.mjs — ONE place that decides whether a gate was asked something it understands.
 *
 * ═══ WHY THIS FILE EXISTS — MEASURED, NOT SUSPECTED (2026-09-08, D-244) ═══
 *
 * Before this file, every gate in the repo silently ignored any flag it did not recognise.
 * Two runs, both real, both on the live tree:
 *
 *     node scripts/check-chain-ledger.mjs --dril      ->  "PASS", exit 0
 *     node scripts/check-net-dirs.mjs   --self-tset   ->  "PASS", exit 0
 *
 * The first one printed a green verdict while NOT being in drill mode. The second printed a
 * green verdict while running against the LIVE network instead of its own self-test. Neither
 * said a word about the flag. That is exactly the error class CLAUDE.md section 2 is written
 * about — a gate measuring a different quantity than the one you asked for — except here it
 * ends in a checkmark, which is the one outcome nobody re-reads.
 *
 * CLAUDE.md section 3 lists dozens of flagged commands (--drill, --self-test, --all-objects,
 * --check, --probe, --update-baseline, --range, --deploy, --compose, --expect ...). One typo
 * inside a G-day runbook turns a gate into a different gate and hands back a green line.
 *
 * ═══ WHY EXIT CODE 2, NOT 1 ═══
 *
 * D-116: "a broken tool is not a verdict". Exit 1 means the gate ran and says NO. A gate handed
 * a flag it cannot honour never reached a verdict at all — it does not know whether the world is
 * good or bad. Reporting that as 1 would put a false NO into a runbook the same way exit 0 put a
 * false YES. Exit 2 is the repo's existing "could not run" code, and gday-preflight already
 * counts it in its own column.
 *
 * ═══ WHAT THIS DELIBERATELY DOES NOT DO ═══
 *
 * It does not parse. Each gate keeps the argv handling it already has, tested and understood;
 * replacing 76 hand-written parsers in one pass would be a large silent behaviour change across
 * every gate at once, and the whole point of this milestone is to stop silent behaviour changes.
 * This file only answers one question — "is every flag on this command line one you declared?" —
 * and refuses to let the gate start when the answer is no.
 */

/** Exit code for "I could not run what you asked" (D-116). Never use 1 for this. */
export const EXIT_CANNOT_RUN = 2;

/**
 * Normalises a flag spec into a Map of flag -> takesValue.
 *
 * Accepts either shape:
 *   ['--self-test', '--drill']                    every flag is a boolean switch
 *   { '--self-test': false, '--file': true }      true = the NEXT argv token is its value
 *
 * The distinction matters for one reason only: a value may itself start with a dash
 * (`--since -1h`, `--offset-ms -250`), and without knowing which flags consume a value
 * the guard would reject a legitimate value as an unknown flag.
 */
export function normaliseSpec(spec) {
  const map = new Map();
  if (Array.isArray(spec)) {
    for (const flag of spec) map.set(flag, false);
    return map;
  }
  for (const [flag, takesValue] of Object.entries(spec)) map.set(flag, Boolean(takesValue));
  return map;
}

/** Levenshtein distance, small and exact — used only to suggest the flag the caller meant. */
export function editDistance(a, b) {
  if (a === b) return 0;
  const prev = new Array(b.length + 1);
  const cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = cur[j];
  }
  return prev[b.length];
}

/**
 * The nearest declared flag, or null when nothing is close enough to be worth suggesting.
 * The threshold scales with length so `--dril` -> `--drill` is offered while two unrelated
 * long flags are not.
 */
export function nearestFlag(unknown, flags) {
  let best = null;
  let bestDistance = Infinity;
  for (const flag of flags) {
    const distance = editDistance(unknown, flag);
    if (distance < bestDistance) { bestDistance = distance; best = flag; }
  }
  const limit = Math.max(2, Math.floor(unknown.length / 3));
  return bestDistance <= limit ? best : null;
}

/**
 * True when a dash-leading token is a value rather than a flag.
 *
 * Only negative numbers qualify. Everything else that starts with a dash is treated as a flag,
 * because the alternative — guessing — is how a mistyped flag gets read as a positional argument
 * and disappears, which is the bug this file exists to kill.
 */
function looksLikeNegativeNumber(token) {
  return /^-\d/.test(token);
}

/**
 * Finds every token on the command line that is not a flag the caller declared.
 *
 * Returns `{ unknown, positionals }`. Pure — it neither prints nor exits, so it can be
 * self-tested without a subprocess. `--` ends flag parsing, POSIX style: everything after it
 * is a positional, which is how a gate can be handed a filename that starts with a dash.
 */
export function findUnknownFlags(argv, spec) {
  const flags = normaliseSpec(spec);
  const unknown = [];
  const positionals = [];
  let sawTerminator = false;

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (sawTerminator) { positionals.push(token); continue; }
    if (token === '--') { sawTerminator = true; continue; }

    if (!token.startsWith('-') || token === '-' || looksLikeNegativeNumber(token)) {
      positionals.push(token);
      continue;
    }

    // `--flag=value` carries its value inline; only the name before `=` is checked.
    const equals = token.indexOf('=');
    const name = equals === -1 ? token : token.slice(0, equals);

    if (!flags.has(name)) { unknown.push(name); continue; }

    // A declared value-taking flag written without `=` swallows the next token, whatever it
    // looks like. Without this a legitimate `--offset-ms -250` would be reported as unknown.
    if (flags.get(name) && equals === -1 && i + 1 < argv.length) i += 1;
  }

  return { unknown, positionals };
}

/**
 * Builds the message a person sees when they mistype a flag. Separate from `guardFlags` so the
 * self-test can assert on its exact wording without capturing a subprocess's stderr.
 */
export function unknownFlagMessage(name, unknown, spec) {
  const flags = [...normaliseSpec(spec).keys()].sort();
  const lines = [];
  for (const flag of unknown) {
    const suggestion = nearestFlag(flag, flags);
    lines.push(`  ✗ ${name}: unknown flag ${flag}` + (suggestion ? ` — did you mean ${suggestion}?` : ''));
  }
  lines.push(`  This gate accepts: ${flags.length ? flags.join(' · ') : '(no flags)'}`);
  lines.push('  🔴 Exit 2 = COULD NOT RUN, not a verdict. Nothing was measured. (D-116, D-244)');
  return lines.join('\n');
}

/**
 * The one call a gate makes. Put it above everything else the gate does, so a mistyped flag
 * cannot reach a network call, a docker exec, or a file write.
 *
 *   import { guardFlags } from './cli.mjs';
 *   guardFlags(process.argv.slice(2), { '--self-test': false, '--drill': false, '--file': true });
 *
 * Returns the positional arguments, so a gate that takes a path can use the return value
 * instead of re-walking argv.
 */
export function guardFlags(argv, spec, options = {}) {
  const name = options.name ?? scriptName();
  const { unknown, positionals } = findUnknownFlags(argv, spec);
  if (unknown.length) {
    console.error(unknownFlagMessage(name, unknown, spec));
    (options.exit ?? process.exit)(EXIT_CANNOT_RUN);
  }
  return positionals;
}

/** The bare filename of the entry script, for error messages. */
function scriptName() {
  const entry = process.argv[1] ?? 'gate';
  return entry.split(/[\\/]/).pop();
}

/**
 * True when `importMetaUrl` belongs to the module Node was actually started with.
 *
 * 🔴 This is the whole reason `guardEntry` exists rather than a bare `guardFlags` call at the
 * top of every gate. Many gates in this repo are ALSO libraries: `check-supply.mjs` exports
 * `measureChain`, `local-net/lib/*` export their tables, and the console imports several of
 * them. A guard that ran at import time would read `process.argv` of whatever process imported
 * it — so `node scripts/gday-preflight.mjs --no-network` importing a helper would be told
 * `--no-network` is an unknown flag, and the helper would kill the preflight with exit 2.
 *
 * The repo has already paid for this exact shape once: see the comment at the top of
 * `local-net/lib/l1-allowlist.mjs`, where a module that ran its gate at import scope and then
 * exited killed the importer, and the next gate that needed the same helper had to COPY it.
 */
export function isEntryModule(importMetaUrl) {
  const entry = process.argv[1];
  if (!entry || !importMetaUrl) return false;
  // Compare on the resolved path rather than the URL: Windows drive-letter case and
  // file:// spelling differ between how Node reports argv[1] and how it builds import.meta.url.
  const normalise = (p) => p.replace(/\\/g, '/').replace(/^[a-z]:/i, (d) => d.toUpperCase());
  let entryUrl;
  try { entryUrl = new URL(`file://${normalise(entry).startsWith('/') ? '' : '/'}${normalise(entry)}`); }
  catch { return false; }
  return normalise(decodeURIComponent(new URL(importMetaUrl).pathname))
      === normalise(decodeURIComponent(entryUrl.pathname));
}

/**
 * The call a gate makes: guard the command line, but ONLY when this file is what the user ran.
 *
 *   import { guardEntry } from './cli.mjs';
 *   guardEntry(import.meta.url, ['--self-test', '--drill']);
 *
 * Imported as a library it does nothing at all, so a gate stays safe to `import` for its
 * exported helpers.
 */
export function guardEntry(importMetaUrl, spec, options = {}) {
  if (!isEntryModule(importMetaUrl)) return [];
  return guardFlags(process.argv.slice(2), spec, options);
}
