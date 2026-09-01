/**
 * chain-ledger.mjs — judging the chain directory the PUBLIC is served. One place, no side effects.
 *
 * ═══ 🔴 WHY THIS IS A LIBRARY AND NOT A GATE ═══
 *
 * The judgement lives here; `scripts/check-chain-ledger.mjs` is the gate that prints it, and
 * `scripts/reopen-chain-creation.mjs` is a second reader that needs the same verdict as one step
 * of a four-step order. That second reader had exactly the two choices `factory-wallets.mjs`
 * describes: import the gate — which runs `main()` at module scope and then `process.exit`s,
 * killing the importer (the `watch-network.mjs` trap) — or copy the logic into itself.
 *
 * The copy is the worse one, and not by a little. The whole point of D-154 is that a public
 * surface must be measured in BOTH directions (inside the generation's block AND the advertised
 * RPC answering with the id it claims). A second implementation of that pair is a second thing
 * that can drift out of agreement with the first, silently, one generation later — which is the
 * failure D-154 exists to close, reintroduced by the act of reusing it.
 *
 * ⇒ One implementation. Nothing in this file reads `process.argv`, prints, or exits: callers
 *   decide how to speak. `assessPublicLedger()` returns the whole verdict as data.
 */
import { readFileSync } from "node:fs";
import https from "node:https";
import http from "node:http";
import { NETWORK_ID, GOC_DAI_CHAINID, TRAN_DAI_CHAINID, TEN_MANG } from "./chainid.mjs";

/**
 * 🔴 `fetch` + `process.exit()` on Windows aborts with `UV_HANDLE_CLOSING` and exit code 127 — a
 * gate that crashes on the way OUT is read as a failure whatever it measured. Raw http/https with
 * `connection: close`, the shape `check-doc-drift` already settled on.
 */
export function request(url, { method = "GET", payload = null, timeoutMs = 20_000 } = {}) {
  const u = new URL(url);
  const lib = u.protocol === "http:" ? http : https;
  const data = payload === null ? null : JSON.stringify(payload);
  const headers = { connection: "close" };
  if (data !== null) {
    headers["content-type"] = "application/json";
    headers["content-length"] = Buffer.byteLength(data);
  }
  return new Promise((resolve, reject) => {
    const req = lib.request(u, { method, headers, agent: new lib.Agent({ keepAlive: false }), timeout: timeoutMs }, (res) => {
      let out = ""; res.setEncoding("utf8");
      res.on("data", (c) => { out += c; });
      res.on("end", () => resolve({ status: res.statusCode, body: out }));
    });
    req.on("timeout", () => req.destroy(new Error(`timed out after ${timeoutMs} ms`)));
    req.on("error", reject);
    req.end(data);
  });
}

/** The running identity, asked of the node. Never inferred from a constant in this repo. */
export async function measureLiveNetworkId(ask = request, rpcBase) {
  const res = await ask(`${rpcBase}/ext/info`, { method: "POST", payload: { jsonrpc: "2.0", id: 1, method: "info.getNetworkID", params: {} } });
  const parsed = JSON.parse(res.body);
  const id = Number(parsed?.result?.networkID);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error(`info.getNetworkID answered ${JSON.stringify(parsed?.result?.networkID)}`);
  return id;
}

/**
 * Ask one advertised RPC what chain it is.
 *
 * 🔴 A DEAD CHAIN DOES NOT ANSWER WITH AN HTTP CODE — it answers with a BODY. Measured on the
 * live network: an L1 blockchainID that no longer exists returns the seven words `404 page not
 * found` as plain text. Judging by status would also mean judging by Cloudflare, which cuts long
 * POSTs at ~100s with a 524 of its own. Hard rule #1: read the CONTENT.
 *
 * Returns one of:
 *   { kind: "id", chainId }          the chain answered, and this is what it says it is
 *   { kind: "refused", detail }      it answered something that is not a chainId — a real defect
 *   { kind: "unreachable", detail }  transport failed — NOT a verdict, this is "unknown"
 */
export async function probeChainId(rpcUrl, ask = request) {
  let res;
  try {
    res = await ask(rpcUrl, { method: "POST", payload: { jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] } });
  } catch (e) {
    // Transport failure is INCONCLUSIVE, never a defect: a flaky moment must not be published as
    // "this chain is dead", and the opposite mistake — silently treating it as fine — is worse.
    return { kind: "unreachable", detail: e.message };
  }
  let parsed;
  try {
    parsed = JSON.parse(res.body);
  } catch {
    // Print VERBATIM what came back, truncated. A gate that paraphrases a body teaches the reader
    // to trust its paraphrase; `404 page not found` says more than "invalid response" ever will.
    return { kind: "refused", detail: `HTTP ${res.status} · body: ${JSON.stringify(res.body.slice(0, 60))}` };
  }
  if (parsed?.error) return { kind: "refused", detail: `JSON-RPC error: ${parsed.error.message ?? JSON.stringify(parsed.error)}` };
  const raw = parsed?.result;
  const id = typeof raw === "string" ? Number(raw.startsWith("0x") ? BigInt(raw) : raw) : Number(raw);
  if (!Number.isSafeInteger(id) || id <= 0) return { kind: "refused", detail: `eth_chainId answered ${JSON.stringify(raw)}` };
  return { kind: "id", chainId: id };
}

/**
 * Everything that can be judged WITHOUT touching the network: shape, band membership, and the
 * two lists' relationship to each other. Pure, so the counter-check can drive it directly.
 *
 * `band` is passed in, never read from the repo here, because the caller is the one that has to
 * prove the repo's band belongs to the generation that is actually running.
 */
export function judgeLedgerShape(ledger, band) {
  const problems = [];
  if (ledger === null || typeof ledger !== "object" || Array.isArray(ledger)) {
    return { fatal: "the ledger is not a JSON object", problems, live: [], retired: [] };
  }
  const live = Array.isArray(ledger.chains) ? ledger.chains : null;
  if (live === null) return { fatal: "the ledger has no `chains` array", problems, live: [], retired: [] };
  const retired = Array.isArray(ledger.retired) ? ledger.retired : [];

  for (const entry of live) {
    const label = `${entry?.name ?? "<unnamed>"} #${entry?.chainId ?? "<no chainId>"}`;
    const id = Number(entry?.chainId);
    if (!Number.isSafeInteger(id)) {
      problems.push({ label, kind: "red", reason: `chainId is not a number: ${JSON.stringify(entry?.chainId)}` });
      continue;
    }
    if (id < band.floor || id > band.ceiling) {
      problems.push({
        label,
        kind: "red",
        reason: `chainId ${id} is OUTSIDE the running generation's block [${band.floor}–${band.ceiling}] `
          + `— a chain of a dead generation is being advertised as live`,
      });
    }
  }

  // 🔴 An id in BOTH lists is the block-list failing in the direction that matters: a name and a
  // number that were retired are back in circulation while the record still says they are gone.
  const retiredIds = new Set(retired.map((r) => Number(r?.chainId)).filter(Number.isSafeInteger));
  for (const entry of live) {
    const id = Number(entry?.chainId);
    if (retiredIds.has(id)) {
      problems.push({ label: `${entry?.name ?? "<unnamed>"} #${id}`, kind: "red", reason: `chainId ${id} is listed as RETIRED and as LIVE at the same time` });
    }
  }
  return { fatal: null, problems, live, retired };
}

/**
 * Is this entry's advertised RPC one this gate may ask?
 *
 * 🔴 TWO REASONS, and the second is the one worth writing down. (a) A public directory that sends
 * users to a host which is not the network's RPC is itself a defect — that is exactly how 9Scan
 * spent four days handing out `rpc-testnet-a1`, a network that could not sign. (b) This gate
 * fetches a file from the network and would otherwise send a request to whatever URL that file
 * names. The ledger is ours today; a tool that turns a fetched document into outbound requests is
 * a shape to refuse on principle, not after it is abused.
 */
export function sameHostAsRpc(rpcUrl, rpcBase) {
  try {
    return new URL(rpcUrl).host === new URL(rpcBase).host;
  } catch {
    return false;
  }
}

/**
 * The whole verdict, as data. No printing, no exiting — the caller decides how to speak.
 *
 * `stage` says how far it got, so a caller can explain an inconclusive result rather than
 * flattening every "could not measure" into one sentence:
 *
 *   "network"     the running networkID could not be measured        -> code 2
 *   "generation"  the chain and the repo describe different ones     -> code 2
 *   "fetch"       the ledger could not be read or parsed             -> code 2
 *   "shape"       the ledger is not the shape this knows how to judge-> code 2
 *   "complete"    every advertised chain was judged; code is 0/1/2
 *
 * 🔴 `code 2` is never "clean". A caller that treats it as a pass has rebuilt the exact defect
 * this file was written for: a surface nobody measured, reported as a surface that is fine.
 */
export async function assessPublicLedger({ ledgerUrl, ledgerFile = null, rpcBase, ask = request } = {}) {
  let liveId;
  try {
    liveId = await measureLiveNetworkId(ask, rpcBase);
  } catch (e) {
    return { code: 2, stage: "network", error: e.message, reds: [], unknowns: [], entries: [], live: [], retired: [] };
  }

  // 🔴 The repo's chainId block is used ONLY once the chain confirms the repo is describing the
  // generation that is actually serving. Between a bump and its re-genesis the repo is ahead on
  // purpose, and judging the ledger with a block from a generation that does not exist yet would
  // condemn every correct entry. That is D-134 in this file's terms: a constant meaning "some
  // other generation" walking into the live slot.
  if (liveId !== NETWORK_ID) {
    return {
      code: 2, stage: "generation", liveId, repoNetworkId: NETWORK_ID, repoNetworkName: TEN_MANG,
      reds: [], unknowns: [], entries: [], live: [], retired: [],
    };
  }
  const band = { floor: GOC_DAI_CHAINID, ceiling: TRAN_DAI_CHAINID };

  let ledger;
  try {
    const raw = ledgerFile ? readFileSync(ledgerFile, "utf8") : (await ask(ledgerUrl)).body;
    ledger = JSON.parse(raw);
  } catch (e) {
    return { code: 2, stage: "fetch", liveId, band, error: e.message, reds: [], unknowns: [], entries: [], live: [], retired: [] };
  }

  const { fatal, problems, live, retired } = judgeLedgerShape(ledger, band);
  if (fatal) {
    return { code: 2, stage: "shape", liveId, band, fatal, reds: [], unknowns: [], entries: [], live: [], retired: [] };
  }

  const reds = [...problems];
  const unknowns = [];
  const entries = [];

  for (const entry of live) {
    const label = `${entry?.name ?? "<unnamed>"} #${entry?.chainId ?? "?"}`;
    const rpcUrl = entry?.rpc;
    if (typeof rpcUrl !== "string" || !rpcUrl) {
      const reason = "publishes no `rpc` — a directory entry nobody can use";
      reds.push({ label, kind: "red", reason });
      entries.push({ label, verdict: "no-rpc", detail: reason });
      continue;
    }
    if (!sameHostAsRpc(rpcUrl, rpcBase)) {
      const reason = `publishes an RPC on a FOREIGN host: ${rpcUrl} (this network's RPC is ${new URL(rpcBase).host})`;
      reds.push({ label, kind: "red", reason });
      entries.push({ label, verdict: "foreign-host", detail: reason });
      continue;
    }
    const probe = await probeChainId(rpcUrl, ask);
    if (probe.kind === "unreachable") {
      unknowns.push({ label, reason: `could not be asked (${probe.detail})` });
      entries.push({ label, verdict: "unreachable", detail: probe.detail });
      continue;
    }
    if (probe.kind === "refused") {
      reds.push({ label, kind: "red", reason: `the advertised RPC does not serve a chain: ${probe.detail}` });
      entries.push({ label, verdict: "refused", detail: probe.detail });
      continue;
    }
    if (probe.chainId !== Number(entry.chainId)) {
      reds.push({ label, kind: "red", reason: `the ledger says ${entry.chainId}, the chain answers ${probe.chainId}` });
      entries.push({ label, verdict: "wrong-id", detail: `answers ${probe.chainId}`, chainId: probe.chainId });
      continue;
    }
    entries.push({ label, verdict: "ok", detail: "answers with the id it claims", chainId: probe.chainId });
  }

  const code = reds.length ? 1 : unknowns.length ? 2 : 0;
  return { code, stage: "complete", liveId, band, live, retired, entries, reds, unknowns };
}

/**
 * One line a SECOND reader can put beside three other steps, built from the verdict's DATA.
 *
 * 🔴 Composed from fields, never scraped out of the gate's printed text. A reader that greps
 * another tool's output is a reader that breaks when that tool improves a sentence — and worse,
 * one that can silently start matching nothing and report the absence as calm.
 */
export function summariseLedger(v) {
  if (v.stage === "network") return `could not measure the running network: ${v.error}`;
  if (v.stage === "generation") return `the chain says networkID ${v.liveId}, the repo describes ${v.repoNetworkId} (${v.repoNetworkName}) — refusing to judge`;
  if (v.stage === "fetch") return `could not read the public ledger: ${v.error}`;
  if (v.stage === "shape") return `the ledger's shape cannot be judged: ${v.fatal}`;
  if (v.code === 0) return `${v.live.length} live · ${v.retired.length} retired — every advertised chain answers as claimed`;
  if (v.code === 1) {
    return [`${v.reds.length} problem(s) in the directory the PUBLIC is served:`, ...v.reds.map((r) => `  ${r.label} — ${r.reason}`)].join("\n       ");
  }
  return [`${v.unknowns.length} advertised chain(s) could not be asked — "could not ask" is NOT "answered correctly":`,
    ...v.unknowns.map((u) => `  ${u.label} — ${u.reason}`)].join("\n       ");
}
