/**
 * source-scan.mjs — reading JavaScript source as source, for the gates that have to.
 *
 * ═══ WHY THIS IS A MODULE AND NOT A COPY ═══
 *
 * Two gates need the same two primitives, and CLAUDE.md section 6 is about what happens when a
 * rule gets a second declaration. `check-fetch-timeouts.mjs` needed them first; `check-fixed-
 * ports.mjs` needed them an hour later. Copying would have been faster and would have put the
 * next fix in one of the two copies.
 *
 * 🔴 It could NOT be imported from `check-fetch-timeouts.mjs` directly: that file ends with
 * `process.exitCode = ... main()`, so importing it RUNS the gate. That is the shape written down
 * at the top of `local-net/lib/l1-allowlist.mjs`, which exists for the same reason.
 *
 * 🔴 It lives under `scripts/lib/`, NOT `local-net/lib/`, and the direction matters: everything
 * in `local-net/lib/**` is SHIPPED to the server. A helper only gates use has no business in a
 * deploy bundle. (The opposite mistake was made earlier the same day with `cli.mjs`, and
 * `check-deploy-imports` caught it — see D-245.)
 *
 * ═══ WHAT THESE ARE AND ARE NOT ═══
 *
 * This is not a parser. It is two careful string walks that answer questions a regex gets wrong
 * in ways that are hard to see. Both were written because a regex DID get them wrong:
 *   - a `fetch(` named in a comment was reported as a call;
 *   - an apostrophe in the comment `an old listener's pooled connection` opened a string that
 *     never closed, and the rest of the file became one quoted blob.
 * If a gate ever needs to know something these cannot answer, it needs a parser, not a third
 * string walk here.
 */

/**
 * Blanks out comments, preserving every byte position and every newline, so line numbers
 * computed on the result still point at real lines in the original.
 */
export function blankComments(src) {
  let out = "";
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      if (c === "\\") { out += src.slice(i, i + 2); i += 2; continue; }
      if (c === quote) quote = null;
      out += c; i += 1; continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; out += c; i += 1; continue; }
    if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") { out += " "; i += 1; }
      continue;
    }
    if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      for (; i < stop; i += 1) out += src[i] === "\n" ? "\n" : " ";
      continue;
    }
    out += c; i += 1;
  }
  return out;
}

/**
 * Blanks out the CONTENTS of string and template literals, keeping the quotes and every byte
 * position. For a gate that reads source, a code-shaped string is data: a self-test fixture
 * holding `"const PORT = 8501;"` is not a port claim, and a gate that counted it would report
 * itself and then be exempted — which is how a gate stops watching anything.
 *
 * `${...}` inside a template literal is CODE and is left alone, because it is.
 */
export function blankStrings(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c !== '"' && c !== "'" && c !== "`") { out += c; i += 1; continue; }
    const quote = c;
    out += c; i += 1;
    let depth = 0;
    while (i < src.length) {
      const d = src[i];
      if (d === "\\") { out += "  "; i += 2; continue; }
      if (quote === "`" && d === "$" && src[i + 1] === "{") { depth += 1; out += "${"; i += 2; continue; }
      if (quote === "`" && depth > 0) {
        // Inside ${...} we are back in code; copy it through so nested quotes are handled next.
        if (d === "}") { depth -= 1; out += "}"; i += 1; continue; }
        out += d; i += 1; continue;
      }
      if (d === quote) { out += d; i += 1; break; }
      out += d === "\n" ? "\n" : " ";
      i += 1;
    }
  }
  return out;
}

/**
 * The full text of a call, read by balancing parentheses from the opening one.
 *
 * Quotes are tracked so a `)` inside a string cannot end the call early — several call sites
 * here build URLs with template literals. Returns null when the parentheses never balance, so
 * the caller can REPORT that rather than treat it as "nothing found": not being able to read a
 * call is not a verdict about it.
 */
export function callText(src, openParenIndex) {
  let depth = 0;
  let quote = null;
  for (let i = openParenIndex; i < src.length; i += 1) {
    const c = src[i];
    if (quote) {
      if (c === "\\") { i += 1; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "(") depth += 1;
    else if (c === ")") {
      depth -= 1;
      if (depth === 0) return src.slice(openParenIndex, i + 1);
    }
  }
  return null;
}

/** 1-based line number of a byte offset. */
export function lineAt(src, index) {
  return src.slice(0, index).split(/\r?\n/).length;
}
