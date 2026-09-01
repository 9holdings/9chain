#!/usr/bin/env node
/**
 * check-live-page.mjs — gate: **do the pages a visitor is actually SERVED agree with the network
 * that is actually RUNNING?**
 *
 * ═══ 🔴 WHY IT EXISTS ═══
 *
 * Reported 2026-09-01 by an outside tester (finding G-3), and it is the sharpest thing in their
 * report. Every gate this project owns reads the REPO. But `web/` is deployed from the `web-home`
 * branch of another worktree — a branch that is not even on the public remote — so
 * `check-doc-drift`, which walks `git ls-files`, can never reach the thing serving users.
 *
 * Measured here the same day, over plain HTTP:
 *
 *   https://a1.9chain.org/          footer: "Chain ID 9000000009 · LOVE9 · networkID 999999999"
 *   https://a1.9chain.org/faucet/   the same footer
 *   the running chain               info.getNetworkID -> 999999998
 *
 * 🔴 TWO OF THE THREE VALUES IN THAT FOOTER ARE RIGHT. The chainId is right, the token symbol is
 * right, and the networkID belongs to a generation that died at 09:26Z on G-day. That is what
 * makes it invisible: a line that is mostly correct reads as correct. And a person building a node
 * copies that number into `--network-id=` and waits for a network that does not exist.
 *
 * ## WHAT IT MEASURES, AND WHERE (CLAUDE.md section 2)
 *
 * | Question | Measured by | Where |
 * |---|---|---|
 * | What identity is running? | `info.getNetworkID`, `eth_chainId` | THE CHAIN |
 * | How many validators? | `platform.getCurrentValidators` | THE CHAIN |
 * | What is a visitor told? | GET of the published URL | THE PUBLIC SURFACE |
 *
 * 🔴 **NOT the source. Not the server's files. The bytes Cloudflare hands out.** A gate that reads
 * `web/lib/chain.ts` would be reading a branch nobody deploys from; a gate that reads the server's
 * files would still miss the CDN. This one asks the same question a browser asks.
 *
 * ## 🔴 LABEL-ANCHORED, ON PURPOSE
 *
 * It does not hunt for bare numbers. `9000000010` on a page may be the record of a retired chain
 * and perfectly correct; `27` may be a paragraph count. Only a number sitting next to the LABEL
 * that gives it meaning ("networkID", "Chain ID", "validators") is judged. A gate that reddens on
 * correct writing is one people route around, and then it is not there for the case it was built
 * for — the lesson `check-patch-count` learned the same day by nearly condemning a correct file.
 *
 * ## EXIT CODES (shared convention across the tool set)
 *
 *   0  PASS          — every labelled claim on every scanned page matches the running network
 *   1  FAIL          — a page states an identity that is not the one serving
 *   2  INCONCLUSIVE  — the chain or a page could not be reached (⚠️ NOT "clean")
 *
 * Usage:
 *   node scripts/check-live-page.mjs
 *   node scripts/check-live-page.mjs --self-test
 */
import https from "node:https";
import http from "node:http";
import { RPC_URL } from "../local-net/lib/server.mjs";
import { PUBLIC_SITE_DEFAULT } from "../local-net/lib/chain-ledger.mjs";

const argv = process.argv.slice(2);
const SELF_TEST = argv.includes("--self-test");
const flag = (n, d) => {
  const i = argv.indexOf(n);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d;
};
const SITE = flag("--site", process.env.A1_PUBLIC_SITE || PUBLIC_SITE_DEFAULT);
const RPC = flag("--rpc", RPC_URL);

/** The pages a stranger lands on. Each is fetched exactly as a browser would fetch it. */
const PAGES = ["/", "/faucet/", "/chains/", "/create-chain/"];

/**
 * Hostnames that have RETIRED. Seeing one on a live page is always a defect.
 *
 * `rpc-testnet-a1.9chain.org` is not hypothetical: it is the URL 9Scan pasted into every visitor's
 * MetaMask for four days. Both retired names still answer — with 525, which reads like "the server
 * is having a moment" rather than "this address is gone" (gotcha 9b).
 */
export const RETIRED_HOSTS = ["rpc-testnet-a1.9chain.org", "testnet-a1.9chain.org"];

/** Raw https: `fetch` + `process.exit()` on Windows aborts with UV_HANDLE_CLOSING and exit 127. */
export function request(url, { method = "GET", payload = null, timeoutMs = 25_000, hops = 3 } = {}) {
  const u = new URL(url);
  const lib = u.protocol === "http:" ? http : https;
  const data = payload === null ? null : JSON.stringify(payload);
  const headers = { connection: "close", "user-agent": "9chain-a1-check-live-page" };
  if (data !== null) {
    headers["content-type"] = "application/json";
    headers["content-length"] = Buffer.byteLength(data);
  }
  return new Promise((resolve, reject) => {
    const req = lib.request(u, { method, headers, agent: new lib.Agent({ keepAlive: false }), timeout: timeoutMs }, (res) => {
      // Follow redirects, but only within the same host. A page that bounces a reader to another
      // origin is a finding, not a detour to chase — the same rule check-chain-ledger applies to
      // RPC URLs it reads out of a fetched file.
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && hops > 0) {
        const next = new URL(res.headers.location, url);
        res.resume();
        if (next.host !== u.host) return resolve({ status: res.statusCode, body: "", redirectedOffHost: next.host });
        return resolve(request(next.toString(), { method, payload, timeoutMs, hops: hops - 1 }));
      }
      let out = ""; res.setEncoding("utf8");
      res.on("data", (c) => { out += c; });
      res.on("end", () => resolve({ status: res.statusCode, body: out }));
    });
    req.on("timeout", () => req.destroy(new Error(`timed out after ${timeoutMs} ms`)));
    req.on("error", reject);
    req.end(data);
  });
}

/** The identity that is actually serving. Asked of the chain, never read from this repo. */
export async function measureChain(ask = request, rpcBase = RPC) {
  const post = (path, payload) => ask(`${rpcBase}${path}`, { method: "POST", payload });

  const netRes = await post("/ext/info", { jsonrpc: "2.0", id: 1, method: "info.getNetworkID", params: {} });
  const networkID = Number(JSON.parse(netRes.body)?.result?.networkID);
  if (!Number.isSafeInteger(networkID) || networkID <= 0) throw new Error(`info.getNetworkID answered ${netRes.body.slice(0, 80)}`);

  const evmRes = await post("/ext/bc/C/rpc", { jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] });
  const raw = JSON.parse(evmRes.body)?.result;
  const chainId = Number(typeof raw === "string" && raw.startsWith("0x") ? BigInt(raw) : raw);
  if (!Number.isSafeInteger(chainId) || chainId <= 0) throw new Error(`eth_chainId answered ${JSON.stringify(raw)}`);

  const valRes = await post("/ext/bc/P", { jsonrpc: "2.0", id: 1, method: "platform.getCurrentValidators", params: {} });
  const validators = JSON.parse(valRes.body)?.result?.validators;
  if (!Array.isArray(validators)) throw new Error("platform.getCurrentValidators did not answer with a list");

  return { networkID, chainId, validatorCount: validators.length, rpcHost: new URL(rpcBase).host };
}

/**
 * Pull the LABELLED claims out of a served page.
 *
 * Next.js hydration markers (`<!-- -->`) sit between a label and its value, so they are stripped
 * before matching — without that the footer reads as `networkID <!-- -->999999999` and no
 * label-anchored pattern finds anything. A gate that silently matches nothing reports calm.
 */
export function visibleText(html) {
  return html
    // 🔴 SCRIPTS AND STYLES FIRST, AND THIS IS NOT TIDYING. Measured 2026-09-01: the first run of
    // this gate reported `/chains/` as claiming "5 validators". It does not. That number lives in
    // a SOURCE COMMENT inside a shipped JS bundle, explaining why an L1 subnet keeps returning
    // five validators after its chain is dead. Nobody reading the page ever sees it, and the
    // sentence is not even about the primary network. A gate that judges a bundle's comments
    // judges something no visitor is told — and its red would have sent someone to "fix" a
    // correct explanation.
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

export function extractClaims(html) {
  const text = visibleText(html);
  const claims = [];
  for (const m of text.matchAll(/networkID\s*:?\s*([0-9]{3,12})/gi)) claims.push({ kind: "networkID", value: Number(m[1]), near: m[0] });
  for (const m of text.matchAll(/chain\s*id\s*:?\s*([0-9]{3,12})/gi)) claims.push({ kind: "chainId", value: Number(m[1]), near: m[0] });
  for (const m of text.matchAll(/([0-9]{1,4})\s+validators?\b/gi)) claims.push({ kind: "validators", value: Number(m[1]), near: m[0] });
  return claims;
}

/**
 * Which retired hostnames does this page hand to a reader?
 *
 * 🔴 LONGEST MATCH WINS. `testnet-a1.9chain.org` is a SUBSTRING of `rpc-testnet-a1.9chain.org`, so
 * a plain `includes` reports one URL as two findings — inflating the count and pointing the reader
 * at a hostname that is not on the page. Each occurrence is attributed to the longest retired name
 * that covers it.
 */
export function retiredHostsIn(html, hosts = RETIRED_HOSTS) {
  const byLength = [...hosts].sort((a, b) => b.length - a.length);
  const found = [];
  let rest = html;
  for (const h of byLength) {
    if (rest.includes(h)) {
      found.push(h);
      rest = rest.split(h).join(" ");   // consume it so a shorter name cannot claim the same bytes
    }
  }
  return found;
}

/**
 * @param pages [{path, html}] @param chain {networkID, chainId, validatorCount}
 *
 * 🔴 `validators` is compared as "not more than measured". A page saying 9 when 9 run is right; a
 * page saying 10 is the S-3 defect. A page saying fewer is stale but not a lie that costs anyone a
 * node, so it is reported at the same level rather than excused — the reader still deserves it.
 */
export function judge(pages, chain) {
  const reds = [];
  for (const p of pages) {
    for (const c of extractClaims(p.html)) {
      if (c.kind === "networkID" && c.value !== chain.networkID) {
        reds.push({ path: p.path, reason: `states networkID ${c.value} — the chain answers ${chain.networkID}`, near: c.near });
      }
      if (c.kind === "chainId" && c.value !== chain.chainId) {
        reds.push({ path: p.path, reason: `states Chain ID ${c.value} — the chain answers ${chain.chainId}`, near: c.near });
      }
      if (c.kind === "validators" && c.value !== chain.validatorCount) {
        reds.push({ path: p.path, reason: `states ${c.value} validators — the chain has ${chain.validatorCount}`, near: c.near });
      }
    }
    for (const h of retiredHostsIn(p.html)) {
      reds.push({ path: p.path, reason: `hands the reader a RETIRED hostname: ${h} (it answers 525, which reads as a temporary fault)`, near: h });
    }
  }
  return reds;
}

async function main() {
  if (SELF_TEST) return selfTest();

  console.log(`\n══ LIVE PAGES — ${SITE} measured against ${RPC} ══\n`);

  let chain;
  try {
    chain = await measureChain();
  } catch (e) {
    console.log(`   🔴 could not measure the running network: ${e.message}`);
    console.log(`   ⁇ INCONCLUSIVE — without the chain there is nothing to compare a page TO.`);
    return 2;
  }
  console.log(`   running: networkID ${chain.networkID} · chainId ${chain.chainId} · ${chain.validatorCount} validators   ⇦ MEASURED\n`);

  const pages = [];
  for (const path of PAGES) {
    try {
      const r = await request(`${SITE}${path}`);
      if (r.redirectedOffHost) {
        console.log(`   ⁇ ${path} — redirects off-host to ${r.redirectedOffHost}; not followed`);
        continue;
      }
      if (r.status !== 200) {
        console.log(`   ⁇ ${path} — HTTP ${r.status}, not scanned`);
        continue;
      }
      pages.push({ path, html: r.body });
    } catch (e) {
      console.log(`   🔴 ${path} — could not be fetched: ${e.message}`);
      console.log(`   ⁇ INCONCLUSIVE — "could not read" is not "says nothing wrong".`);
      return 2;
    }
  }
  if (pages.length === 0) {
    console.log(`   ⁇ INCONCLUSIVE — no page could be read.`);
    return 2;
  }

  const reds = judge(pages, chain);
  for (const p of pages) {
    const n = reds.filter((r) => r.path === p.path).length;
    const claims = extractClaims(p.html).length;
    console.log(`  ${n ? "🔴" : "✓"} ${p.path}  — ${claims} labelled claim(s)${n ? `, ${n} wrong` : ""}`);
  }
  console.log();
  if (reds.length) {
    console.log(`🔴 FAIL — ${reds.length} thing(s) a visitor is told that the chain contradicts:`);
    for (const r of reds) console.log(`   ${r.path} — ${r.reason}\n      near: ${String(r.near).slice(0, 90)}`);
    console.log(`\n   These bytes come from the deployed site, not from this repo. Fixing them means`);
    console.log(`   changing what is DEPLOYED — for A1 that is the web-home worktree (hard rule #4).`);
    return 1;
  }
  console.log(`✅ PASS — every labelled claim on ${pages.length} page(s) matches the running network.`);
  return 0;
}

/** Counter-check — the gate must go red when it should, and red FOR THE RIGHT REASON. */
async function selfTest() {
  let pass = 0, fail = 0;
  const ok = (name, cond, seen) => {
    if (cond) { pass++; console.log(`  ✓ ${name}`); }
    else { fail++; console.log(`  ✗ ${name}  — got: ${seen}`); }
  };
  const CHAIN = { networkID: 999999998, chainId: 9000000009, validatorCount: 9 };
  const page = (html) => [{ path: "/", html }];
  const j = (html) => judge(page(html), CHAIN);

  console.log("\n══ COUNTER-CHECK — check-live-page ══\n");

  console.log("── 1. The real defect, in the real markup ──");
  // Byte-for-byte the shape served on 2026-09-01, hydration markers and all.
  const realFooter = `<p class="font-mono text-xs">Chain ID <!-- -->9000000009<!-- --> · <!-- -->LOVE9<!-- --> · networkID <!-- -->999999999</p>`;
  ok("🔴 the served footer's dead networkID => RED", j(realFooter).length === 1, JSON.stringify(j(realFooter)));
  ok("…and the reason names BOTH numbers, so the reader can act",
    /999999999.*999999998|states networkID 999999999/.test(j(realFooter)[0]?.reason ?? ""), j(realFooter)[0]?.reason);
  // 🔴 THE CASE THAT MATTERS MOST. Two of three values in that footer are correct. A gate that
  // stopped at "the page mentions the right chainId" would pass it.
  const fixedFooter = realFooter.replace("999999999", "999999998");
  ok("🔴 CONTROL — the SAME footer with the live networkID is clean", j(fixedFooter).length === 0, JSON.stringify(j(fixedFooter)));

  console.log("\n── 2. Hydration markers must not hide the value ──");
  ok("🔴 a label split from its number by <!-- --> is still read",
    extractClaims(`networkID <!-- -->999999999`).length === 1, JSON.stringify(extractClaims(`networkID <!-- -->999999999`)));
  ok("…and by a tag boundary too", extractClaims(`<span>networkID</span><span>999999999</span>`).length === 1, "missed");

  console.log("\n── 3. 🔴 LABEL-ANCHORED — a bare number is not a claim ──");
  // Judging every number would redden the retired-chain records and any page with an id on it,
  // which is how a gate stops being run at all.
  ok("a bare number with no label is NOT judged", j("<p>9000000010</p>").length === 0, JSON.stringify(j("<p>9000000010</p>")));
  ok("…and prose that happens to contain digits is not judged", j("<p>we shipped 27 patches</p>").length === 0, "red");

  console.log("\n── 4. Validator count (S-3) ──");
  ok("🔴 '10 validators' while 9 run => RED", j("<p>10 validators secure the network</p>").length === 1, "green");
  ok("CONTROL — '9 validators' is clean", j("<p>9 validators secure the network</p>").length === 0, JSON.stringify(j("<p>9 validators</p>")));

  console.log("\n── 5. Retired hostnames — the four-day MetaMask bug ──");
  // 🔴 The shorter retired name is a SUBSTRING of the longer one. A plain `includes` counts one
  // URL twice and names a host that is not on the page.
  ok("🔴 rpc-testnet-a1 on a page => RED, counted ONCE not twice",
    j(`<a href="https://rpc-testnet-a1.9chain.org">RPC</a>`).length === 1,
    JSON.stringify(retiredHostsIn(`<a href="https://rpc-testnet-a1.9chain.org">RPC</a>`)));
  ok("…and the bare retired name still reports as itself",
    retiredHostsIn(`go to https://testnet-a1.9chain.org/`).join() === "testnet-a1.9chain.org", "wrong host");
  ok("…and BOTH names present report as two",
    retiredHostsIn(`https://rpc-testnet-a1.9chain.org and https://testnet-a1.9chain.org`).length === 2, "not two");
  ok("🔴 …and the reason explains WHY 525 is worse than 404",
    /reads as a temporary fault/.test(j(`<a href="https://rpc-testnet-a1.9chain.org">x</a>`)[0]?.reason ?? ""), "no explanation");
  ok("CONTROL — the live RPC host is clean", j(`<a href="https://rpc-a1.9chain.org">RPC</a>`).length === 0, "red");

  console.log("\n── 6. 🔴 A BUNDLE IS NOT A PAGE ──");
  // The real /chains/ shape: a source comment inside a shipped script, about an L1's validators.
  const bundled = `<p>fine</p><script>// getCurrentValidators still returns 5 validators for a dead chain</script>`;
  ok("🔴 a number inside <script> is NOT a claim to the reader", j(bundled).length === 0, JSON.stringify(j(bundled)));
  ok("CONTROL — the same sentence in the BODY is still judged",
    j(`<p>getCurrentValidators still returns 5 validators</p>`).length === 1, "missed");
  ok("…and a footer next to a script is still read", j(`${realFooter}<script>var x=1</script>`).length === 1, "missed");

  console.log("\n── 7. The chain is measured, never assumed ──");
  const stub = (net, cid, vals) => async (url, opt) => {
    const m = opt?.payload?.method;
    if (m === "info.getNetworkID") return { status: 200, body: JSON.stringify({ result: { networkID: String(net) } }) };
    if (m === "eth_chainId") return { status: 200, body: JSON.stringify({ result: cid }) };
    return { status: 200, body: JSON.stringify({ result: { validators: Array(vals).fill({}) } }) };
  };
  const measured = await measureChain(stub(999999998, "0x218711a09", 9), "https://x");
  ok("the string networkID and hex chainId are parsed",
    measured.networkID === 999999998 && measured.chainId === 9000000009 && measured.validatorCount === 9, JSON.stringify(measured));
  for (const [label, s] of [
    ["a missing networkID", stub(0, "0x1", 9)],
    ["a non-hex chainId", stub(999999998, null, 9)],
  ]) {
    let threw = false;
    await measureChain(s, "https://x").then(() => {}, () => { threw = true; });
    ok(`🔴 ${label} THROWS — it must never fall back to a repo constant`, threw, "returned");
  }

  console.log(`\n${fail === 0 ? "✅" : "🔴"} ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

main().then((c) => process.exit(c)).catch((e) => { console.error(`\n🔴 ${e.stack ?? e.message}`); process.exit(2); });
