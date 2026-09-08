#!/usr/bin/env node
/**
 * check-wire-language.mjs — text that leaves the console must be in the reader's language.
 *
 * ═══ WHY, AND IT HAS NOW HAPPENED THREE TIMES ═══
 *
 * CLAUDE.md section 0 is a rule about the FUTURE READER. Nowhere does that bite harder than on
 * text the console SENDS: an error message and a note in an API response are read by someone who
 * did not choose this project's internal language, and who is often looking at an English page
 * while they read it.
 *
 * Three separate instances, each found by accident rather than by a gate:
 *
 *   2026-09-03  the three `/api/progress` step labels were Vietnamese, measured on `/create-chain/`
 *               set to "EN English" — every sentence around them English, the steps not.
 *   2026-09-04  `lib/eip55.mjs` returned a Vietnamese address error from `/api/preview`, found by
 *               dumping the console's own error sentences.
 *   2026-09-08  `LUU_Y_GIAO_DICH_DAU` — the `notes` field of the `/api/create` response, three
 *               fields of Vietnamese handed to the person who had just created a chain (D-260).
 *
 * Each was fixed and none of them left anything behind that would catch the next one. This does.
 *
 * ═══ WHAT IT CHECKS, AND WHAT IT HONESTLY CANNOT ═══
 *
 * ✔ Every `throw new Error(...)` in the console and its libraries. A thrown message becomes the
 *   `error` field of an API response — that is the single largest source of wire text, and it is
 *   statically readable because the call's extent can be found by balancing parentheses.
 * ✔ The exported constants that are known to be serialised into responses, read from the SOURCE.
 *
 *   🔴 Not imported, and the first version's attempt to import them killed this gate outright.
 *   `console/server.mjs` calls `requireSecret` at module scope, which `process.exit(1)`s when the
 *   operator token is absent — and `process.exit` cannot be caught by a `try`. The gate printed
 *   the console's own FATAL line and died before checking anything. That shape is written down at
 *   the top of `local-net/lib/l1-allowlist.mjs`, about this exact file. Reading the object literal
 *   out of the source is less direct and it is the version that runs.
 *
 * ✘ It cannot see a string built at run time out of pieces, or one that reaches the wire through
 *   a path nobody declared. That limit is real and is why the constant list is explicit: a gate
 *   that pretended to cover everything would be worse than one that says where it stops.
 *
 * Usage:
 *   node scripts/check-wire-language.mjs
 *   node scripts/check-wire-language.mjs --self-test
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guardEntry } from "../local-net/lib/cli.mjs";
import { blankComments, callText, lineAt } from "./lib/source-scan.mjs";
import { counter, EXIT } from "./lib/report.mjs";

guardEntry(import.meta.url, ["--self-test"]);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Files whose thrown errors become API responses. */
const WIRE_SOURCES = [
  "local-net/console/server.mjs",
  "local-net/console/chain-ownership.mjs",
  "local-net/console/generation-gate.mjs",
  "local-net/console/node-health.mjs",
  "local-net/console/http-plumbing.mjs",
  "local-net/console/console-state.mjs",
  "local-net/console/upgrade-files.mjs",
  "local-net/console/track-files.mjs",
  "local-net/lib/eip55.mjs",
  "local-net/lib/l1-options.mjs",
  "local-net/lib/l1-allowlist.mjs",
  "local-net/lib/l1-symbol.mjs",
];

/**
 * Anything outside plain ASCII. Deliberately blunt: the wire text of this console is English
 * prose, so a byte above 0x7F is either an accent or a decorative character, and the decorative
 * ones are listed rather than guessed at.
 */
const ALLOWED_NON_ASCII = /[·–—→⇒≥≤×✓✅🔴🟡⚠️️""''…]/gu;

export function nonAsciiIn(text) {
  const stripped = String(text).replace(ALLOWED_NON_ASCII, "");
  const hits = stripped.match(/[^\x00-\x7F]/gu);
  return hits ? [...new Set(hits)] : [];
}

/**
 * Constants that are serialised into an API response, and therefore ARE wire text.
 *
 * Explicit rather than discovered: a gate that guessed which constants reach the wire would be
 * claiming coverage it does not have. This list says exactly where it stops.
 */
export const WIRE_CONSTANTS = [
  ["local-net/console/server.mjs", "LUU_Y_GIAO_DICH_DAU"],   // `notes` in the /api/create response
];

/** The `export const NAME = { … }` object literal, read by balancing braces. */
export function exportedObjectLiteral(source, name) {
  const src = blankComments(source);
  const at = src.search(new RegExp(`export\\s+const\\s+${name}\\s*=\\s*\\{`));
  if (at === -1) return null;
  const open = src.indexOf("{", at);
  let depth = 0;
  let quote = null;
  for (let i = open; i < src.length; i += 1) {
    const c = src[i];
    if (quote) {
      if (c === "\\") { i += 1; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "{") depth += 1;
    else if (c === "}") { depth -= 1; if (depth === 0) return { text: src.slice(open, i + 1), line: lineAt(src, at) }; }
  }
  return null;
}

/** Every `throw new Error(...)` call's text in a source file, with its line. */
export function thrownMessages(source) {
  const src = blankComments(source);
  const out = [];
  const re = /\bthrow\s+new\s+[A-Za-z]*Error\s*\(/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const open = src.indexOf("(", m.index);
    const text = callText(src, open);
    if (text === null) continue;
    out.push({ line: lineAt(src, m.index), text });
  }
  return out;
}

async function main() {
  console.log("══ WIRE LANGUAGE — text that leaves the console must be readable by the reader ══\n");
  const findings = [];

  for (const rel of WIRE_SOURCES) {
    let source;
    try { source = readFileSync(path.join(ROOT, rel), "utf8"); }
    catch { console.log(`  ⚠️  ${rel} — not found, skipped`); continue; }
    for (const { line, text } of thrownMessages(source)) {
      const bad = nonAsciiIn(text);
      if (bad.length) findings.push({ rel, line, kind: "thrown error", sample: text.replace(/\s+/g, " ").slice(0, 90), bad });
    }
  }

  // The constants serialised into responses, read from the SOURCE — see the header on why they
  // are not imported. Only the object literal is scanned, so surrounding code cannot leak in.
  for (const [rel, name] of WIRE_CONSTANTS) {
    let source;
    try { source = readFileSync(path.join(ROOT, rel), "utf8"); } catch { continue; }
    const literal = exportedObjectLiteral(source, name);
    if (literal === null) {
      findings.push({ rel, line: 0, kind: `constant ${name}`, bad: ["?"],
        sample: "DECLARED as wire text but not found in this file — renamed, or the list is stale" });
      continue;
    }
    const bad = nonAsciiIn(literal.text);
    if (bad.length) {
      findings.push({ rel, line: literal.line, kind: `constant ${name}`, bad,
        sample: literal.text.replace(/\s+/g, " ").slice(0, 90) });
    }
  }

  console.log(`  ${WIRE_SOURCES.length} source(s) scanned for thrown messages\n`);

  if (findings.length) {
    for (const f of findings) {
      console.log(`  🔴 ${f.rel}${f.line ? `:${f.line}` : ""}  ${f.kind} — non-ASCII ${JSON.stringify(f.bad.join(""))}`);
      console.log(`       ${f.sample}`);
    }
    console.log(`\n🔴 ${findings.length} piece(s) of wire text are not plain English.`);
    console.log("   This has happened three times already: the progress labels (2026-09-03), the");
    console.log("   address errors (2026-09-04), and the create-chain notes (2026-09-08). Each was");
    console.log("   found by accident. Section 0 is a rule about the reader, and the reader of these");
    console.log("   strings did not choose this project's internal language (D-260).");
    return EXIT.RED;
  }

  console.log("✅ PASS — every thrown message in the console's wire path is plain English.");
  return EXIT.PASS;
}

/* ─────────────────────────── counter-check (--self-test) ─────────────────────────── */

function selfTest() {
  const { ok, finish } = counter("COUNTER-CHECK — wire language");

  // 🔴 The accented fixtures are BUILT at run time from code points, so this file stays
  // pure ASCII on disk. Spelling them out adds section-0 debt to the very file written to find
  // it — which happened three times earlier in this session before the pattern was recognised
  // (D-247, D-256). A French word was tried first and did not help: e-acute is a Vietnamese
  // letter too, so the ratchet caught that as well.
  const ACCENT_E = String.fromCharCode(0xE9);      // e-acute
  const ACCENT_I = String.fromCharCode(0xEF);      // i-diaeresis
  const LIGATURE_OE = String.fromCharCode(0x153);  // oe ligature

  ok("plain English is clean", nonAsciiIn("the node did not answer").length === 0);
  // 🔴 The fixtures spell their accents as \u ESCAPES, so this file stays pure ASCII on disk.
  // Writing the characters out adds section-0 debt to the very file written to find it — which
  // happened three times earlier in this session before the pattern was recognised (D-247, D-256).
  // Switching to a French word did not help either: e-acute is a Vietnamese letter as well.
  ok("🔴 an accented character is found", nonAsciiIn("could not reach the na" + ACCENT_I + "ve node").length === 1);
  ok("the character itself is reported, so the reader can see what was found",
    nonAsciiIn("caf" + ACCENT_E).join("") === ACCENT_E);
  ok("decorative characters this project uses in prose are allowed",
    nonAsciiIn("g1 · networkID 999999998 — refused ⇒ stop").length === 0,
    "otherwise the gate would fire on every well-formatted English sentence in the repo");

  ok("a thrown message is found with its line",
    thrownMessages("\n\nthrow new Error('boom');").at(0).line === 3);
  ok("a multi-line thrown message is read whole", (() => {
    const found = thrownMessages("throw new Error(\n  'part one ' +\n  'part two'\n);");
    return found.length === 1 && found[0].text.includes("part two");
  })());
  ok("a RangeError and a TypeError count too",
    thrownMessages("throw new RangeError('a'); throw new TypeError('b');").length === 2);
  ok("🔴 a throw inside a COMMENT is not a throw",
    thrownMessages("// throw new Error('example in prose')\nconst x = 1;").length === 0);
  ok("a close paren inside the message does not truncate it",
    thrownMessages("throw new Error(`a (b) c`);").at(0).text.includes("c"));

  ok("🔴 the two together catch what this gate exists for", (() => {
    const found = thrownMessages("throw new Error(`could not reach the n" + LIGATURE_OE + "ud`);");
    return found.length === 1 && nonAsciiIn(found[0].text).length > 0;
  })());
  ok("…and pass a translated one", (() => {
    const found = thrownMessages("throw new Error('could not ask the node');");
    return nonAsciiIn(found[0].text).length === 0;
  })());

  ok("an exported object literal is read whole", (() => {
    const lit = exportedObjectLiteral('export const X = {\n  a: "one",\n  b: { c: "two" },\n};\nconst after = 1;', "X");
    return lit.text.includes("two") && !lit.text.includes("after");
  })());
  ok("🔴 a constant DECLARED as wire text but missing is a finding, not a pass",
    exportedObjectLiteral("const other = {};", "LUU_Y_GIAO_DICH_DAU") === null,
    "otherwise renaming the constant would silently remove it from the gate's coverage");
  ok("every declared wire constant exists in its file", WIRE_CONSTANTS.every(([rel, name]) => {
    try { return exportedObjectLiteral(readFileSync(path.join(ROOT, rel), "utf8"), name) !== null; }
    catch { return false; }
  }));

  ok("every declared wire source exists", WIRE_SOURCES.every((rel) => {
    try { readFileSync(path.join(ROOT, rel), "utf8"); return true; } catch { return false; }
  }));

  return finish("a throw in prose is not a throw, and an em dash is not an accent");
}

process.exitCode = process.argv.includes("--self-test") ? selfTest() : await main();
