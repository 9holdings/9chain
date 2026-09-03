/**
 * symbol-test.mjs — reverse controls for `lib/l1-symbol.mjs`.
 *
 * Every rule is exercised from BOTH sides: a value that must pass, and for each rule a value
 * that must fail FOR THAT RULE — asserted on the message, not just on "it threw". A gate with
 * several duties whose tests only check "fail" lets the fragile duty hide behind the easy one
 * (D-161). Run:  node local-net/console/symbol-test.mjs
 */
import { validateSymbol, symbolFromName, symbolOf, RESERVED_SYMBOLS } from "../lib/l1-symbol.mjs";

let pass = 0, fail = 0;
function ok(label, cond, detail = "") {
  if (cond) { pass++; console.log(`  ✓ ${label}`); }
  else { fail++; console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`); }
}
function throwsWith(label, fn, fragment) {
  try { const v = fn(); ok(label, false, `did not throw (returned ${JSON.stringify(v)})`); }
  catch (e) { ok(label, String(e.message).includes(fragment), `message was: ${e.message}`); }
}

// The ledger as it looks on g1 today: six chains, none with a symbol key, plus one retired
// chain that DID choose a symbol.
const LEDGER = [
  { name: "Adam Chain" }, { name: "Eva Chain" }, { name: "9S Union" },
  { name: "BBWay Chain" }, { name: "9Mall Chain" }, { name: "9Cashback Chain" },
  { name: "Old Retired One", symbol: "OLDR", thuHoiLuc: 1 },
];

console.log("fallback rule");
ok("BBWay Chain -> BBWAY (trailing 'Chain' dropped)", symbolFromName("BBWay Chain") === "BBWAY");
ok("9S Union -> 9SUNIO (6 chars)", symbolFromName("9S Union") === "9SUNIO");
ok("9Cashback Chain -> 9CASHB", symbolFromName("9Cashback Chain") === "9CASHB");
ok("'Chain' alone is not dropped (it is the whole name)", symbolFromName("Chain") === "CHAIN");
ok("symbolOf prefers the recorded symbol", symbolOf({ name: "X Y", symbol: "XY9" }) === "XY9");
ok("symbolOf falls back when the key is missing", symbolOf({ name: "Adam Chain" }) === "ADAM");
ok("symbolOf falls back when the key is blank", symbolOf({ name: "Adam Chain", symbol: "  " }) === "ADAM");

console.log("accepts");
ok("plain symbol", validateSymbol("CASH9", LEDGER) === "CASH9");
ok("trims surrounding whitespace", validateSymbol("  CASH9 ", LEDGER) === "CASH9");
ok("2 chars", validateSymbol("A1", LEDGER) === "A1");
ok("8 chars", validateSymbol("ABCDEFG8", LEDGER) === "ABCDEFG8");

console.log("refuses — each for its own reason");
throwsWith("empty", () => validateSymbol("", LEDGER), "2-8 characters");
throwsWith("1 char", () => validateSymbol("A", LEDGER), "2-8 characters");
throwsWith("9 chars", () => validateSymbol("ABCDEFGHI", LEDGER), "2-8 characters");
throwsWith("lower case names the character and the fix", () => validateSymbol("cash9", LEDGER), "Write it as CASH9");
throwsWith("space", () => validateSymbol("CA SH", LEDGER), "Character 3 is U+0020");
throwsWith("NBSP is named as invisible", () => validateSymbol("CA SH", LEDGER), "U+00A0");
throwsWith("zero-width space is named as invisible", () => validateSymbol("CA​SH", LEDGER), "invisible");
throwsWith("punctuation", () => validateSymbol("CASH-9", LEDGER), "Character 5 is U+002D");
throwsWith("non-string", () => validateSymbol(9, LEDGER), "must be a string");
for (const r of RESERVED_SYMBOLS) throwsWith(`reserved ${r}`, () => validateSymbol(r, LEDGER), "reserved");
throwsWith("LOVE9 explains it is the network coin", () => validateSymbol("LOVE9", LEDGER), "network's own coin");
throwsWith("clash with a RECORDED symbol (retired chain)", () => validateSymbol("OLDR", LEDGER), 'used by "Old Retired One"');
throwsWith("clash with a FALLBACK symbol of a legacy chain", () => validateSymbol("BBWAY", LEDGER), "derived from its name");
throwsWith("missing ledger is an error, not an empty ledger", () => validateSymbol("CASH9"), "ledger must be an array");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
