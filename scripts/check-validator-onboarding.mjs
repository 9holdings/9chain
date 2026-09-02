#!/usr/bin/env node
/**
 * check-validator-onboarding.mjs — gate: **can a stranger fund the minimum validator bond from
 * the public faucet on their own, and does the guide tell them the truth about how?**
 *
 * ═══ 🔴 WHY IT EXISTS ═══
 *
 * The whole point of dropping `MinValidatorStake` from 25,000 LOVE9 to 81 on G-day morning was
 * self-service: 81 = 9 x 9, the faucet hands out 9 LOVE9, so nine requests and you are a
 * validator. Nothing to apply for, nobody to ask. That sentence went into
 * `docs/RUN-A-VALIDATOR.md` as the first thing an outsider reads.
 *
 * Measured 2026-09-02 on the live surfaces: **it is not true, and it is off by exactly one
 * request.** Nine requests hand you 81 LOVE9 and the bond is 81 LOVE9 — but the transactions that
 * carry the money C->X->P and then submit the stake are paid out of that *same balance*. So you
 * need a tenth request, and the faucet's limit is nine per IP per hour. The self-serve path has
 * an unavoidable wait in it, at the exact moment a newcomer is deciding whether this chain is
 * real.
 *
 * 🔴 **WHY NOTHING CAUGHT IT — three surfaces, each correct on its own.** The chain is right: 81
 * is the bond. The faucet is right: 9 per request, 9 per hour, and it was configured deliberately
 * that way (the preflight's own manual task warned the DEFAULTS of 10 and 5 would be wrong, and
 * somebody shipped 9 and 9 — the warning was heeded). The guide is right about every individual
 * number it quotes. The defect lives only in the **relation between them**, and a relation is
 * nobody's field. The guide even contradicted itself: it promised "nine requests cover the whole
 * bond" on screen one and admitted "budget at least one request more than nine" 300 lines later.
 *
 * ⇒ Same family as D-113 (one constant, one place) but across a **public boundary**: here the
 *   three declarations sit in a Go binary, in a container's environment, and in a markdown file,
 *   and no two of them can see each other. Also the inverse of D-150: there a document quoted a
 *   dead generation's number; here every number is live and the *promise built from them* is dead.
 *
 * ## WHAT IT MEASURES, AND WHERE (CLAUDE.md section 2)
 *
 * | Question | Measured by | Where |
 * |---|---|---|
 * | What must a stranger bond? | `platform.getMinStake` | THE RUNNING CHAIN |
 * | What does the faucet actually hand out? | `GET /faucet/api/info` | THE PUBLIC FAUCET |
 * | Can the faucet still pay it? | `eth_getBalance` on the published faucet bucket | THE RUNNING CHAIN |
 * | What did we promise? | the numbers `RUN-A-VALIDATOR.md` quotes | THE DOCUMENT |
 *
 * 🔴 **BOTH DIRECTIONS, the D-154 lesson.** Measuring only "the faucet gives enough" would pass a
 * generous faucet described by a guide that lies. Measuring only "the guide's numbers match"
 * would pass a guide that faithfully quotes a faucet nobody can afford to run. The pair is what
 * says *a stranger can actually do this*.
 *
 * 🔴 **STRICTLY GREATER, not at least.** `n * amount >= bond` is the arithmetic that produced the
 * false promise. Fees come out of the same balance, so the honest test is `n * amount > bond`.
 * The gate refuses to use `>=` anywhere, and `--self-test` pins that with the exact 9/81 case.
 *
 * ## WHAT THIS GATE DOES **NOT** MEASURE — say it rather than let a green imply it
 *
 * - It does not run the money path. Nobody has: `docs/RUN-A-VALIDATOR.md` says so in its own
 *   words about `c-to-x`. A green here means *the arithmetic and the promises line up*, not
 *   *somebody staked*.
 * - It does not price the fees. P-Chain fees have been dynamic since Etna and the guide
 *   deliberately quotes no number it cannot measure. This gate only needs fees to be **greater
 *   than zero**, which is why `>` is the whole of its arithmetic.
 * - The solvency probe reads the address the PUBLISHED ALLOCATION calls the faucet bucket, not a
 *   sender the faucet declares — the faucet exposes no such endpoint. If `FAUCET_PK` is ever
 *   swapped for the vanity wallet (an optional task that has not been done), this measures the
 *   wrong address, and that divergence is itself a documentation defect worth the red.
 *
 * ## EXIT CODES (shared convention across the tool set)
 *
 *   0  PASS          — a stranger can self-fund a bond, and the guide describes it honestly
 *   1  FAIL          — they cannot, or the guide promises something the surfaces do not deliver
 *   2  INCONCLUSIVE  — the faucet or the chain could not be asked, or the guide could not be read
 *
 * Usage:
 *   node scripts/check-validator-onboarding.mjs
 *   node scripts/check-validator-onboarding.mjs --self-test
 *   node scripts/check-validator-onboarding.mjs --rpc https://rpc-a1.9chain.org --web https://a1.9chain.org
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { request } from "../local-net/lib/chain-ledger.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARGV = process.argv.slice(2);
const SELF_TEST = ARGV.includes("--self-test");

function argOf(flag) {
  const i = ARGV.indexOf(flag);
  return i >= 0 ? ARGV[i + 1] : null;
}

const RPC = argOf("--rpc") || process.env.A1_RPC_BASE || "https://rpc-a1.9chain.org";
const WEB = argOf("--web") || process.env.A1_WEB_BASE || "https://a1.9chain.org";

/**
 * The guide a stranger is told to follow. One document, because one document is what they read.
 *
 * `--guide <path>` exists for ONE purpose: pointing the gate at a retired revision so the
 * counter-check runs on real bytes rather than on a fixture somebody wrote to agree with the
 * gate. `git show <rev>:docs/RUN-A-VALIDATOR.md > /tmp/old.md` and aim it there. A fixture proves
 * the code does what its author expected; the retired revision proves it catches what actually
 * happened (D-158's positive control, run the other way round).
 */
const GUIDE = argOf("--guide") || "docs/RUN-A-VALIDATOR.md";

/** P/X-Chain denomination. C-Chain is an EVM and uses 18 — the two are NOT interchangeable. */
const NANO = 1_000_000_000n;
const WEI = 1_000_000_000_000_000_000n;

/* ══════════════════════════════════════════════════════════════════════════
   Pure assessments — every one of these is exercised by --self-test.
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * How many faucet requests a stranger actually needs.
 *
 * 🔴 `forBond` is the number that reads right and is wrong: the smallest n covering the bond
 * exactly. `honest` is the smallest n that leaves anything at all over for the fees which come
 * out of the same balance. When the bond is a whole multiple of the payout — the 81 = 9 x 9 case
 * this network was tuned for — the two differ by one, and that one request is the defect.
 */
export function requestsNeeded(bondNano, amountNano) {
  if (amountNano <= 0n) return null;
  const forBond = (bondNano + amountNano - 1n) / amountNano;
  const honest = bondNano / amountNano + 1n;
  return { forBond: Number(forBond), honest: Number(honest) };
}

/**
 * Can a stranger get to the bond at all, and can they do it in one sitting?
 *
 * `fitsOneWindow` is not scored as a defect here: a wait is a product decision, and a guide that
 * states the wait is honest. It is scored where it belongs — against the guide.
 */
export function assessFaucetCapacity({ amountNano, perIpMax }, bondNano) {
  if (amountNano === null || perIpMax === null) {
    return { verdict: "inconclusive", why: "the faucet did not report its payout or its limit — unknown, not a pass" };
  }
  if (amountNano <= 0n) return { verdict: "fail", why: "the faucet hands out nothing, so the self-serve path does not exist" };
  const n = requestsNeeded(bondNano, amountNano);
  const fitsOneWindow = perIpMax >= n.honest;
  const why = `bond ${bondNano / NANO} LOVE9 at ${amountNano / NANO} per request ⇒ ${n.honest} requests `
    + `(${n.forBond} covers the bond and leaves NOTHING for fees), limit ${perIpMax}/IP/hour`;
  return { verdict: "ok", why, ...n, fitsOneWindow, perIpMax };
}

/**
 * Can the faucet still pay for it?
 *
 * A faucet advertising 9 LOVE9 out of an empty wallet is a promise, not a path. Scored against
 * the honest request count rather than one request: the claim being tested is *a stranger can
 * fund a bond*, not *a stranger can get one payout*.
 */
export function assessSolvency(balanceWei, honestRequests, amountNano) {
  if (balanceWei === null) return { verdict: "inconclusive", why: "the faucet bucket's balance could not be read — unknown, not empty" };
  const neededWei = (amountNano / NANO) * BigInt(honestRequests) * WEI;
  if (balanceWei >= neededWei) {
    return { verdict: "ok", why: `holds ${balanceWei / WEI} LOVE9, needs ${neededWei / WEI} for one full bond — about ${balanceWei / neededWei} strangers` };
  }
  return { verdict: "fail", why: `holds ${balanceWei / WEI} LOVE9 but one full bond costs ${neededWei / WEI} — the faucet cannot deliver what it advertises` };
}

/**
 * The numbers the guide states, each anchored to the phrase that gives it meaning.
 *
 * 🔴 Anchored, and line-scoped, for a reason paid for twice. `check-genesis-published` learned
 * that an unanchored `{64}` hex pattern reads the first 64 characters of a 96-character key;
 * `check-patch-count` learned that a bare number can be true in a block and false in a line.
 * Here every value is pulled from the same line as the words that name it, and the gate PRINTS
 * the lines it read — an unread claim is the failure mode, and a human must be able to see it.
 */
export function quotedConstants(text) {
  const found = { bond: null, amount: null, perIpMax: null, lines: [] };
  const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
  const num = (s) => (/^\d+$/.test(s) ? Number(s) : (words[s.toLowerCase()] ?? null));

  for (const [i, line] of text.split(/\r?\n/).entries()) {
    let hit = false;

    // "a self-bond of at least 81 LOVE9" / "minimum validator stake | `81 LOVE9`"
    if (found.bond === null && /(self-bond|minimum validator stake)/i.test(line)) {
      const m = line.match(/`?([\d,]+)\s*LOVE9/i);
      if (m) { found.bond = Number(m[1].replace(/,/g, "")); hit = true; }
    }
    // "It hands out **9 LOVE9** per request"
    if (found.amount === null && /hands out/i.test(line) && /per\s*$|per request/i.test(line)) {
      const m = line.match(/\*{0,2}([\d,]+)\s*LOVE9\*{0,2}\s*per/i) || line.match(/\*{0,2}([\d,]+)\s*LOVE9/i);
      if (m) { found.amount = Number(m[1].replace(/,/g, "")); hit = true; }
    }
    // "nine requests per IP per hour" / "limit is nine per IP per hour"
    if (found.perIpMax === null && /per\s+IP\s+per\s+hour/i.test(line)) {
      const m = line.match(/\*{0,2}(\w+)\*{0,2}\s+(?:requests?\s+)?per\s+IP\s+per\s+hour/i);
      if (m && num(m[1]) !== null) { found.perIpMax = num(m[1]); hit = true; }
    }
    if (hit) found.lines.push({ line: i + 1, text: line.trim() });
  }
  return found;
}

/**
 * Does the guide quote the surfaces correctly?
 *
 * A missing quote is a FAIL, not a pass. A guide that never states the bond is not neutral about
 * it — it leaves the reader to discover the number by spending an afternoon, which is the exact
 * failure this whole page exists to prevent.
 */
export function assessGuideAgreement(quoted, measured) {
  const rows = [
    ["the bond", quoted.bond, measured.bond],
    ["the faucet payout", quoted.amount, measured.amount],
    ["the per-IP hourly limit", quoted.perIpMax, measured.perIpMax],
  ];
  const missing = rows.filter(([, q]) => q === null).map(([n]) => n);
  if (missing.length) return { verdict: "fail", why: `the guide states no value for ${missing.join(", ")} — a stranger finds out by spending an afternoon` };
  const wrong = rows.filter(([, q, m]) => q !== m).map(([n, q, m]) => `${n}: guide says ${q}, the surface says ${m}`);
  if (wrong.length) return { verdict: "fail", why: wrong.join(" · ") };
  return { verdict: "ok", why: `bond ${measured.bond} · payout ${measured.amount} · limit ${measured.perIpMax} — all three quoted correctly` };
}

/**
 * Strip the markdown emphasis that carries no meaning for this test.
 *
 * 🔴 THIS IS THE SECOND FALSE READING THIS GATE PRODUCED, and unlike the first it was a FALSE
 * GREEN — the dangerous direction. The retired revision of the guide wrote the defect as
 * `so **nine requests** cover the whole 81-LOVE9 bond`, and a pattern demanding whitespace
 * between `requests` and `cover` walks straight past `** `. The gate built to catch exactly that
 * sentence read exactly that sentence and passed it.
 *
 * ⚠️ It was caught only by running the gate against the RETIRED REVISION — the fixtures agreed
 * with the author, the bytes did not. That is the whole argument for `--guide`.
 *
 * Emphasis and code markers only. Punctuation is left alone: `cover.` and `cover,` are different
 * sentences and collapsing them would widen this into the kind of pattern that matches prose
 * nobody wrote.
 */
export const emphasisless = (s) => s.replace(/[*_`]+/g, "");

/**
 * Which lines declare themselves to be about the past?
 *
 * 🔴 THIS GATE'S FIRST RED WAS A FALSE RED, and it is worth the paragraph. The corrected guide
 * explains itself — *an earlier version of this page said "nine requests cover the whole bond"* —
 * and the gate read that quotation as the promise being made. It cannot tell a promise from a
 * quotation of a retired promise, which is the D-106b lesson arriving a fourth time: a red that
 * makes a reader undo a correct fix is worse than no gate.
 *
 * The `stale-ok` convention `check-doc-drift` established and `check-patch-count` scoped to the
 * PARAGRAPH is the existing answer, and CLAUDE.md section 2 draws its boundary exactly here: the
 * marker is valid for a sentence ABOUT THE PAST and never for content that will be published as
 * current. So this is not a licence — it is the same declaration, declared the same way.
 *
 * ⚠️ **Third implementation of one convention, and that is debt, not design.** The other two live
 * in modules that call `process.exit(main())` at top level, so importing either would run a
 * different gate and exit. Extracting it into a shared library means editing two working gates;
 * that is worth doing and is NOT done here. Recorded rather than hidden — section 6 is about
 * exactly this shape of drift.
 *
 * 🔴 It does not leak past a blank line: one marker must not silence a file.
 */
export function exemptLines(text) {
  const lines = text.split(/\r?\n/);
  const out = new Set();
  let from = 0;
  const flush = (to) => {
    if (to < from) return;
    if (lines.slice(from, to + 1).some((l) => /stale-ok/.test(l))) {
      for (let i = from; i <= to; i++) out.add(i + 1);
    }
  };
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") { flush(i - 1); from = i + 1; }
  }
  flush(lines.length - 1);
  return out;
}

/**
 * The promise itself, which is the thing that was actually broken.
 *
 * Two separate obligations, and they are not the same obligation:
 *   1. the guide must not present `forBond` as sufficient — that is the false promise;
 *   2. if the honest count does not fit one hourly window, the guide must SAY a wait is coming.
 *
 * 🔴 Both are judged line by line with the exempt paragraphs removed, and the SAME exemption
 * applies to both — a warning written inside a sentence about the past does not warn anybody
 * about the present, so it must not satisfy obligation 2 either.
 *
 * ⚠️ Scope, stated rather than implied: this reads prose, so it can confirm the warning is
 * PRESENT and cannot confirm it is well placed. A warning 300 lines below the promise satisfies
 * this check and still failed a real reader — which is exactly how the defect survived. Placement
 * is a human's judgement; the gate holds the floor, not the ceiling.
 */
export function assessPromise(text, { forBond, honest, fitsOneWindow }) {
  const WORDS = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  const falsePromise = new RegExp(
    String.raw`\b(?:${forBond}|${WORDS[forBond] ?? "\\0"})\b`
    + String.raw`\s+requests?\s+(?:cover|covers|are enough|is enough|suffice)`, "i");
  const exempt = exemptLines(text);
  const live = text.split(/\r?\n/)
    .map((t, i) => ({ n: i + 1, t: emphasisless(t) }))
    .filter(({ n }) => !exempt.has(n));

  for (const { n, t } of live) {
    const m = t.match(falsePromise);
    if (m) {
      return { verdict: "fail", reason: "false-promise", exemptCount: exempt.size, why: `line ${n} says "${m[0]}" — ${forBond} requests cover the bond and leave nothing for the fees paid out of the same balance; the honest number is ${honest}` };
    }
  }
  const prose = live.map(({ t }) => t).join("\n");
  if (!fitsOneWindow && !/(wait|waiting)\b[^.]{0,120}\b(hour|window)|\b(hour|window)\b[^.]{0,120}\b(wait|waiting)/i.test(prose)) {
    return { verdict: "fail", reason: "no-wait-warning", exemptCount: exempt.size, why: `${honest} requests do not fit one hourly window and the guide never warns of the wait — the stranger meets it as a 429 instead` };
  }
  return {
    verdict: "ok",
    reason: "none",
    exemptCount: exempt.size,
    why: (fitsOneWindow ? `the honest count ${honest} fits one window and no false promise appears` : `the honest count ${honest} needs a second window, and the guide says so`)
      + ` (${exempt.size} line(s) exempt as sentences about the past)`,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   The run
   ══════════════════════════════════════════════════════════════════════════ */

async function rpc(pathname, method, params = {}) {
  const res = await request(`${RPC}${pathname}`, { method: "POST", payload: { jsonrpc: "2.0", id: 1, method, params } });
  return JSON.parse(res.body)?.result ?? null;
}

/** Never throws: an unreachable surface must arrive as `null` so it can be scored INCONCLUSIVE. */
async function tryTo(fn) {
  try { return await fn(); } catch { return null; }
}

async function main() {
  if (SELF_TEST) return selfTest();

  console.log(`\n══ VALIDATOR ONBOARDING — the path a stranger walks, measured on ${WEB} and ${RPC} ══\n`);

  const bondNano = await tryTo(async () => {
    const r = await rpc("/ext/bc/P", "platform.getMinStake");
    return /^\d+$/.test(String(r?.minValidatorStake ?? "")) ? BigInt(r.minValidatorStake) : null;
  });

  const faucet = await tryTo(async () => {
    const res = await request(`${WEB}/faucet/api/info`);
    const j = JSON.parse(res.body);
    const amount = /^\d+$/.test(String(j?.amount ?? "")) ? BigInt(j.amount) * NANO : null;
    const perIpMax = Number.isInteger(j?.perIp?.max) ? j.perIp.max : null;
    return { amountNano: amount, perIpMax, cooldown: j?.cooldownSeconds ?? null };
  });

  if (bondNano === null || faucet === null) {
    console.log("  ⚪ the chain or the faucet could not be asked — unknown, which is not a pass\n");
    return 2;
  }

  let worst = 0;
  const say = (a, label) => {
    const mark = a.verdict === "ok" ? "  ✓" : a.verdict === "inconclusive" ? "  ⚪" : "  🔴";
    console.log(`${mark} ${label}\n       ${a.why}`);
    worst = Math.max(worst, a.verdict === "ok" ? 0 : a.verdict === "inconclusive" ? 2 : 1);
    return a;
  };

  const cap = say(assessFaucetCapacity(faucet, bondNano), "the faucet can reach the bond");
  const n = cap.honest ? cap : requestsNeeded(bondNano, faucet.amountNano);
  const honest = n.honest ?? 0;

  const balance = await tryTo(async () => {
    const supply = JSON.parse((await request(`${WEB}/faucet/api/supply`)).body);
    const bucket = (supply?.cChainGenesis?.addresses ?? []).find((a) => a.bucket === "faucet");
    if (!bucket?.address) return null;
    const r = await rpc("/ext/bc/C/rpc", "eth_getBalance", [bucket.address, "latest"]);
    return typeof r === "string" ? BigInt(r) : null;
  });
  say(assessSolvency(balance, honest, faucet.amountNano), "the faucet can still pay for it");

  const guidePath = path.isAbsolute(GUIDE) ? GUIDE : path.join(ROOT, GUIDE);
  if (!existsSync(guidePath)) {
    console.log(`  ⚪ ${GUIDE} is missing — the guide could not be read\n`);
    return 2;
  }
  const text = readFileSync(guidePath, "utf8");
  const quoted = quotedConstants(text);

  console.log(`\n  lines read from ${GUIDE} — an unread claim is the failure mode:`);
  for (const l of quoted.lines) console.log(`    ${String(l.line).padStart(4)}  ${l.text.slice(0, 118)}`);
  console.log();

  say(assessGuideAgreement(quoted, {
    bond: Number(bondNano / NANO),
    amount: Number(faucet.amountNano / NANO),
    perIpMax: faucet.perIpMax,
  }), "the guide quotes the live surfaces");

  say(assessPromise(text, { forBond: n.forBond, honest, fitsOneWindow: cap.fitsOneWindow }), "the promise the guide makes is true");

  console.log(`\n${worst === 0 ? "✅ PASS" : worst === 2 ? "⚪ INCONCLUSIVE" : "🔴 FAIL"} — a stranger `
    + `${worst === 0 ? "can" : "may not be able to"} self-fund the ${bondNano / NANO}-LOVE9 bond `
    + `(${honest} requests, ${cap.fitsOneWindow ? "one sitting" : "two hourly windows"})\n`);
  return worst;
}

/* ══════════════════════════════════════════════════════════════════════════
   Reverse controls
   ══════════════════════════════════════════════════════════════════════════ */
function selfTest() {
  let pass = 0, fail = 0;
  const ok = (label, got, want) => {
    if (got === want) { pass++; console.log(`  ✓ ${label}`); }
    else { fail++; console.log(`  ✗ ${label} — wanted ${want}, got ${got}`); }
  };
  const nano = (n) => BigInt(n) * NANO;

  console.log("══ REVERSE CONTROLS — check-validator-onboarding ══");

  console.log("\n── the arithmetic that produced the false promise ──");
  ok("🔴 81 at 9 per request needs TEN, not nine — the exact live case",
    requestsNeeded(nano(81), nano(9)).honest, 10);
  ok("nine is what covers the bond, and that is the number that reads right",
    requestsNeeded(nano(81), nano(9)).forBond, 9);
  ok("🔴 a bond that is NOT a whole multiple already needs the extra request, so the two agree",
    requestsNeeded(nano(80), nano(9)).honest, requestsNeeded(nano(80), nano(9)).forBond);
  ok("a bond of 0 still needs one request, never zero", requestsNeeded(0n, nano(9)).honest, 1);
  ok("🔴 a faucet handing out nothing is unanswerable, not infinite", requestsNeeded(nano(81), 0n), null);

  console.log("\n── capacity: a wait is not a defect, an unusable faucet is ──");
  ok("the live shape scores ok and reports the wait",
    assessFaucetCapacity({ amountNano: nano(9), perIpMax: 9 }, nano(81)).fitsOneWindow, false);
  ok("a limit of ten would fit one sitting",
    assessFaucetCapacity({ amountNano: nano(9), perIpMax: 10 }, nano(81)).fitsOneWindow, true);
  ok("🔴 a faucet paying zero FAILS rather than dividing by it",
    assessFaucetCapacity({ amountNano: 0n, perIpMax: 9 }, nano(81)).verdict, "fail");
  ok("🔴 a faucet that did not answer is INCONCLUSIVE, never a pass",
    assessFaucetCapacity({ amountNano: null, perIpMax: null }, nano(81)).verdict, "inconclusive");

  console.log("\n── solvency: measured against a whole bond, not one payout ──");
  ok("a fat faucet passes", assessSolvency(100_000_000n * WEI, 10, nano(9)).verdict, "ok");
  ok("🔴 a faucet holding one payout but not one bond FAILS", assessSolvency(9n * WEI, 10, nano(9)).verdict, "fail");
  ok("🔴 exactly one bond is enough, the boundary is inclusive", assessSolvency(90n * WEI, 10, nano(9)).verdict, "ok");
  ok("🔴 an unreadable balance is INCONCLUSIVE, not empty", assessSolvency(null, 10, nano(9)).verdict, "inconclusive");

  console.log("\n── reading the guide: anchored, and a missing claim is a FAILURE ──");
  const good = [
    "| **Become a validator** | Requires a **self-bond of at least 81 LOVE9**, locked for the term. |",
    "It hands out **9 LOVE9** per request, with a **60-second cooldown** and a limit of",
    "**nine requests per IP per hour** — measured on the live faucet.",
  ].join("\n");
  const q = quotedConstants(good);
  ok("the bond is read from the line that names it", q.bond, 81);
  ok("the payout is read from the line that names it", q.amount, 9);
  ok("the per-IP limit is read as a WORD, because that is how the guide writes it", q.perIpMax, 9);
  ok("🔴 a bare 81 with no anchoring phrase is NOT read as the bond",
    quotedConstants("the set is capped at 81 validators, ranked by stake").bond, null);
  ok("🔴 a guide stating nothing FAILS — silence is not agreement",
    assessGuideAgreement({ bond: null, amount: 9, perIpMax: 9 }, { bond: 81, amount: 9, perIpMax: 9 }).verdict, "fail");
  ok("agreeing on all three passes",
    assessGuideAgreement({ bond: 81, amount: 9, perIpMax: 9 }, { bond: 81, amount: 9, perIpMax: 9 }).verdict, "ok");
  ok("🔴 a guide quoting the OLD 25,000 bond fails",
    assessGuideAgreement({ bond: 25000, amount: 9, perIpMax: 9 }, { bond: 81, amount: 9, perIpMax: 9 }).verdict, "fail");
  ok("🔴 a guide quoting a payout the faucet no longer makes fails",
    assessGuideAgreement({ bond: 81, amount: 10, perIpMax: 9 }, { bond: 81, amount: 9, perIpMax: 9 }).verdict, "fail");

  console.log("\n── the promise: the defect this gate was built for ──");
  const live = { forBond: 9, honest: 10, fitsOneWindow: false };

  // 🔴 EVERY case below asserts the REASON, not just the verdict. The first version of this
  // block asserted `verdict === "fail"` and passed — but passed because the fixture happened to
  // omit the wait warning, i.e. it was green about the false promise the whole time. Q-5b:
  // a self-test case can be right about the answer and wrong about the question.
  ok("🔴 THE ACTUAL DEFECT, verbatim from the retired revision — markdown emphasis and all",
    assessPromise("request, so **nine requests** cover the whole 81-LOVE9 bond. Nothing to apply for, nobody to ask. Budget a wait of up to an hour.", live).reason, "false-promise");
  ok("🔴 the same claim written in digits is caught",
    assessPromise("9 requests cover the bond. Budget a wait of an hour.", live).reason, "false-promise");
  ok("🔴 'nine requests are enough' — a synonym is the same promise",
    assessPromise("nine requests are enough for the bond. Budget a wait of an hour.", live).reason, "false-promise");
  ok("🔴 backticks hide it just as well as asterisks",
    assessPromise("`nine requests` cover the bond. Budget a wait of an hour.", live).reason, "false-promise");
  ok("🔴 the missing-warning case fails for the WARNING reason, not the promise reason",
    assessPromise("the honest number is ten requests.", live).reason, "no-wait-warning");
  ok("the corrected text passes",
    assessPromise("the honest number is **ten requests**, and the tenth crosses the limit: budget one wait of up to an hour.", live).verdict, "ok");
  ok("🔴 a guide that never mentions the wait FAILS when a wait is unavoidable",
    assessPromise("the honest number is ten requests.", live).verdict, "fail");
  ok("no wait needed ⇒ no warning required",
    assessPromise("ask ten times and stake.", { forBond: 9, honest: 10, fitsOneWindow: true }).verdict, "ok");
  ok("🔴 a false promise fails EVEN WHEN the wait is disclosed — two separate obligations",
    assessPromise("nine requests cover the bond, though you may wait an hour.", live).verdict, "fail");

  console.log("\n── `stale-ok`: the FALSE RED this gate produced on its own first live run ──");
  ok("🔴 THE FALSE RED — a corrected guide quoting its own retired promise must PASS",
    assessPromise([
      "the honest number is ten requests; budget one wait of up to an hour.",
      "",
      "an earlier version said *\"nine requests cover the whole bond\"* here. <!-- stale-ok -->",
    ].join("\n"), live).verdict, "ok");
  ok("🔴 quoting is NOT a way to silence it — the same sentence UNMARKED still fails",
    assessPromise([
      "the honest number is ten requests; budget one wait of up to an hour.",
      "",
      "an earlier version said *\"nine requests cover the whole bond\"* here.",
    ].join("\n"), live).verdict, "fail");
  ok("🔴 the marker does not leak past a blank line — one marker must not silence a file",
    assessPromise([
      "a retired note. <!-- stale-ok -->",
      "",
      "nine requests cover the bond. Budget a wait of an hour.",
    ].join("\n"), live).verdict, "fail");
  ok("🔴 a wait warning written INSIDE an exempt paragraph does not warn anybody — still fails",
    assessPromise([
      "the honest number is ten requests.",
      "",
      "we used to tell people to wait an hour for the next window. <!-- stale-ok -->",
    ].join("\n"), live).verdict, "fail");
  ok("the marker covers the whole paragraph, not just its own line",
    exemptLines("first line of it\nnine requests cover\nlast line <!-- stale-ok -->").size, 3);
  ok("an unmarked paragraph is exempt from nothing", exemptLines("plain\nprose\n").size, 0);

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

main().then((code) => process.exit(code)).catch((e) => {
  console.error(`⚪ INCONCLUSIVE — the gate itself could not run: ${e.stack || e.message}`);
  process.exit(2);
});
