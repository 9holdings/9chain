#!/usr/bin/env node
/**
 * arweave-snapshot.mjs — keep chain-snapshot release assets on Arweave, where an upload is paid
 * once and is meant to stay; find the latest one again with nothing but Arweave itself; download it.
 *
 * ═══ WHERE THIS SITS ═══
 *
 *   chain-snapshot.mjs create          → a sealed bundle (directory, ROOT)
 *   chain-snapshot-release.mjs pack    → flat assets (meta.tar, node-data.tar.part-NNN, RELEASE.json …)
 *   arweave-snapshot.mjs upload        → one Arweave transaction per asset + one manifest transaction
 *   arweave-snapshot.mjs latest        → the newest manifest FROM THE PROJECT'S ADDRESS
 *   arweave-snapshot.mjs download      → the assets again, every byte checked
 *   chain-snapshot-release.mjs join --root <published root>   → the bundle, and the verdict
 *
 * ═══ 🔴 FOUR RULES, EACH ONE A FAILURE MODE OF PERMANENT STORAGE ═══
 *
 * 1. **Nothing can be deleted.** So the default command only PRICES an upload. Sending anything to
 *    a non-local gateway needs `--confirm-permanent`, and bundles from the drill band
 *    (899999000–899999999) are refused outright on a non-local gateway: test data stored forever
 *    is a permanent cost and a permanent source of confusion about which network is real.
 * 2. **Anyone can write the same tags.** `App-Name: 9chain-a1-snapshot` proves nothing about who
 *    uploaded it. `latest` and `download` therefore require `--owner <address>` and check the owner
 *    of the manifest AND of every asset transaction it points to. Even then, the bundle's ROOT must
 *    still be compared with the one published elsewhere (D-112).
 * 3. **The wallet holds money.** Its file is read, never printed, and refused if it sits inside
 *    this repository. The only key this tool ever creates is an in-memory throwaway for a LOCAL
 *    gateway (ArLocal), funded with ArLocal's fake `/mint`.
 * 4. **A local emulator is not the network.** ArLocal accepts what it accepts; a green run there
 *    shows this tool's round trip, not that arweave.net will take the same transactions. The first
 *    real upload is the measurement of that, and it costs money — a person decides when.
 *
 * `arweave` is pinned at 1.15.7 (package.json): on 2026-09-16 the 2.x line was two weeks old, and a
 * brand-new major release is the wrong thing to put on a path that writes data forever.
 *
 * ═══ USAGE ═══
 *
 *   node arweave-snapshot.mjs plan <assets dir> --gateway <url>
 *   node arweave-snapshot.mjs upload <assets dir> --gateway <url> (--wallet <jwk file> | --ephemeral-wallet) [--confirm-permanent]
 *   node arweave-snapshot.mjs latest --gateway <url> --owner <address> [--network-id <n>] [--count <n>]
 *   node arweave-snapshot.mjs download <manifest tx id> --gateway <url> --owner <address> --out <dir>
 *   node arweave-snapshot.mjs --self-test
 *
 * Exit codes (repo convention): 0 PASS · 1 FAIL · 2 COULD NOT RUN.
 */
import { createHash } from "node:crypto";
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, statSync, writeSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Arweave from "arweave";
import { EXIT_CANNOT_RUN, guardEntry, isEntryModule } from "../../lib/cli.mjs";
import { CannotRun, Fail, hostPath, parseSums } from "../../../scripts/chain-snapshot.mjs";

const FLAG_SPEC = {
  "--self-test": false, "--gateway": true, "--wallet": true, "--ephemeral-wallet": false, "--confirm-permanent": false,
  "--owner": true, "--network-id": true, "--count": true, "--out": true,
};
export const APP_NAME = "9chain-a1-snapshot";
export const MANIFEST_KIND = "9chain-a1-snapshot-arweave-manifest";
const DRILL_BAND = { lo: 899999000, hi: 899999999 };
/** arweave-js 1.x signs a transaction with its whole data in memory; keep one asset well below that pain. */
export const MAX_ASSET_BYTES = 512 * 1024 * 1024;
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

// ═══════════════════════════════ PURE (self-tested) ═══════════════════════════════

/** Parses a gateway URL and says whether it is local (ArLocal on this machine). */
export function parseGateway(url) {
  let u;
  try { u = new URL(url); } catch { throw new CannotRun(`--gateway is not a URL: ${url}`); }
  if (!["http:", "https:"].includes(u.protocol)) throw new CannotRun(`--gateway must be http(s): ${url}`);
  const host = u.hostname.replace(/^\[|\]$/g, "");
  const local = ["127.0.0.1", "localhost", "::1"].includes(host);
  return { host, port: Number(u.port || (u.protocol === "https:" ? 443 : 80)), protocol: u.protocol.slice(0, -1), local, base: `${u.protocol}//${u.host}` };
}

/** Every reason an upload must not start. Empty = allowed. */
export function uploadRefusals({ gateway, networkId, confirmPermanent, ephemeral, walletPath }) {
  const out = [];
  if (!gateway.local && !confirmPermanent) out.push("a non-local gateway stores data permanently — pass --confirm-permanent after reading the plan");
  if (!gateway.local && networkId >= DRILL_BAND.lo && networkId <= DRILL_BAND.hi) out.push(`network ${networkId} is the drill band — drill data is never stored permanently`);
  if (ephemeral && !gateway.local) out.push("--ephemeral-wallet only works against a local gateway (ArLocal)");
  if (!ephemeral && !walletPath) out.push("pass --wallet <jwk file> (or --ephemeral-wallet for ArLocal)");
  if (walletPath && isInside(REPO_ROOT, walletPath)) out.push("the wallet file is inside the repository — keys live outside it (CLAUDE.md §4)");
  return out;
}

/** True when `child` is `parent` or below it. A different Windows drive yields an absolute `relative()` ⇒ outside. */
export function isInside(parent, child) {
  const rel = relative(resolve(parent), resolve(child));
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

/** Tags written on every transaction. Values are strings; Arweave tags are name/value byte strings. */
export function baseTags({ networkId, bundleRoot, createdAt }) {
  return [
    ["App-Name", APP_NAME], ["Schema", "1"], ["Network-Id", String(networkId)],
    ["Bundle-Root", bundleRoot], ["Created-At", createdAt],
  ];
}

/** Validates a manifest document downloaded from the network. Throws Fail on anything off. */
export function checkManifest(doc) {
  if (!doc || doc.kind !== MANIFEST_KIND || doc.schema !== 1) throw new Fail("not a schema 1 arweave snapshot manifest");
  if (!/^[0-9a-f]{64}$/.test(doc.bundleRoot ?? "")) throw new Fail("manifest bundleRoot is not 64 hex characters");
  if (!Array.isArray(doc.assets) || doc.assets.length === 0) throw new Fail("manifest lists no assets");
  const seen = new Set();
  for (const a of doc.assets) {
    if (!/^[A-Za-z0-9._-]+$/.test(a.name ?? "")) throw new Fail(`unsafe asset name in manifest: ${JSON.stringify(a.name)}`);
    if (seen.has(a.name)) throw new Fail(`asset ${a.name} listed twice`);
    seen.add(a.name);
    if (!/^[0-9a-f]{64}$/.test(a.sha256 ?? "")) throw new Fail(`asset ${a.name} has no sha256`);
    if (!/^[A-Za-z0-9_-]{43}$/.test(a.txId ?? "")) throw new Fail(`asset ${a.name} has no valid transaction id`);
    if (!Number.isSafeInteger(a.bytes) || a.bytes < 0) throw new Fail(`asset ${a.name} has no byte count`);
  }
  for (const needed of ["RELEASE.json", "RELEASE-SHA256SUMS.txt", "meta.tar"]) if (!seen.has(needed)) throw new Fail(`manifest is missing ${needed}`);
  return doc;
}

/** Tag list (as returned by GraphQL or a tx) → Map. Duplicate names are refused: ambiguity is a forgery surface. */
export function tagMap(tags) {
  const m = new Map();
  for (const { name, value } of tags) {
    if (m.has(name)) throw new Fail(`tag ${name} appears twice`);
    m.set(name, value);
  }
  return m;
}

// ═══════════════════════════════ IO ═══════════════════════════════

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const ar = (winston) => (Number(BigInt(winston) * 1000n / 1000000000000n) / 1000).toFixed(3);

function client(gateway) {
  return Arweave.init({ host: gateway.host, port: gateway.port, protocol: gateway.protocol, timeout: 120_000, logging: false });
}

function readAssets(dir) {
  if (!existsSync(join(dir, "RELEASE.json")) || !existsSync(join(dir, "RELEASE-SHA256SUMS.txt"))) throw new CannotRun(`${dir} is not a chain-snapshot-release assets directory`);
  const rel = JSON.parse(readFileSync(join(dir, "RELEASE.json"), "utf8"));
  const listed = parseSums(readFileSync(join(dir, "RELEASE-SHA256SUMS.txt"), "utf8"));
  const names = [...listed.map((e) => e.path), "RELEASE-SHA256SUMS.txt"];
  const extra = readdirSync(dir).filter((n) => !names.includes(n));
  if (extra.length) throw new Fail(`files not listed in RELEASE-SHA256SUMS.txt: ${extra.join(", ")}`);
  const assets = names.map((name) => {
    const bytes = statSync(join(dir, name)).size;
    if (bytes > MAX_ASSET_BYTES) throw new CannotRun(`${name} is ${bytes} bytes; repack with chain-snapshot-release.mjs pack --part-size 256`);
    return { name, bytes };
  });
  for (const { hash, path } of listed) {
    if (sha256(readFileSync(join(dir, path))) !== hash) throw new Fail(`asset ${path} changed since pack`);
  }
  return { rel, assets };
}

async function gql(gateway, query, variables) {
  const res = await fetch(`${gateway.base}/graphql`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query, variables }) });
  const text = await res.text();
  let j; try { j = JSON.parse(text); } catch { throw new CannotRun(`graphql answered ${res.status} with non-JSON: ${text.slice(0, 120)}`); }
  if (j.errors) throw new CannotRun(`graphql: ${JSON.stringify(j.errors).slice(0, 300)}`);
  return j.data;
}

async function plan(dir, gateway) {
  const { rel, assets } = readAssets(dir);
  const arweave = client(gateway);
  let total = 0n;
  for (const a of assets) total += BigInt(await arweave.transactions.getPrice(a.bytes));
  const manifestBytes = 400 + assets.length * 200;
  total += BigInt(await arweave.transactions.getPrice(manifestBytes));
  const bytes = assets.reduce((s, a) => s + a.bytes, 0);
  return { rel, assets, bytes, winston: total.toString() };
}

async function upload(dir, gateway, { walletPath, ephemeral, confirmPermanent }) {
  const p = await plan(dir, gateway);
  const refusals = uploadRefusals({ gateway, networkId: p.rel.networkId, confirmPermanent, ephemeral, walletPath });
  if (refusals.length) throw new CannotRun(refusals.join("; "));
  const arweave = client(gateway);
  const key = ephemeral ? await arweave.wallets.generate() : JSON.parse(readFileSync(walletPath, "utf8"));
  const owner = await arweave.wallets.jwkToAddress(key);
  if (ephemeral) {
    const r = await fetch(`${gateway.base}/mint/${owner}/${(BigInt(p.winston) * 2n).toString()}`);
    if (!r.ok) throw new CannotRun(`ArLocal /mint answered ${r.status}`);
  }
  const balance = BigInt(await arweave.wallets.getBalance(owner));
  if (balance < BigInt(p.winston)) throw new CannotRun(`wallet ${owner} holds ${ar(balance)} AR, the upload needs ${ar(p.winston)} AR`);

  const tags = baseTags({ networkId: p.rel.networkId, bundleRoot: p.rel.bundleRoot, createdAt: p.rel.createdAt });
  const uploaded = [];
  for (const a of p.assets) {
    const data = readFileSync(join(dir, a.name));
    const tx = await arweave.createTransaction({ data }, key);
    for (const [n, v] of [...tags, ["Kind", "asset"], ["Asset-Name", a.name], ["Asset-Sha256", sha256(data)], ["Content-Type", "application/octet-stream"]]) tx.addTag(n, v);
    await arweave.transactions.sign(tx, key);
    const uploader = await arweave.transactions.getUploader(tx);
    while (!uploader.isComplete) await uploader.uploadChunk();
    if (uploader.lastResponseStatus >= 400) throw new Fail(`upload of ${a.name} ended with HTTP ${uploader.lastResponseStatus}: ${uploader.lastResponseError}`);
    uploaded.push({ name: a.name, bytes: data.length, sha256: sha256(data), txId: tx.id });
    console.log(`  ${a.name.padEnd(28)} ${String(data.length).padStart(11)} bytes → ${tx.id}`);
  }
  const manifest = { schema: 1, kind: MANIFEST_KIND, bundleRoot: p.rel.bundleRoot, networkId: p.rel.networkId, createdAt: p.rel.createdAt, owner, assets: uploaded };
  checkManifest(manifest);
  const mtx = await arweave.createTransaction({ data: Buffer.from(JSON.stringify(manifest, null, 2) + "\n") }, key);
  for (const [n, v] of [...tags, ["Kind", "manifest"], ["Content-Type", "application/json"]]) mtx.addTag(n, v);
  await arweave.transactions.sign(mtx, key);
  const res = await arweave.transactions.post(mtx);
  if (res.status >= 400) throw new Fail(`manifest post answered HTTP ${res.status}`);
  if (gateway.local) {
    const mined = await fetch(`${gateway.base}/mine`);
    if (!mined.ok) throw new CannotRun(`ArLocal /mine answered ${mined.status}`);
  }
  return { owner, manifestTx: mtx.id, assets: uploaded.length, winston: p.winston };
}

async function latest(gateway, owner, networkId, count) {
  const tags = [{ name: "App-Name", values: [APP_NAME] }, { name: "Kind", values: ["manifest"] }];
  if (networkId) tags.push({ name: "Network-Id", values: [String(networkId)] });
  const q = `query($owners:[String!],$tags:[TagFilter!],$first:Int){ transactions(owners:$owners, tags:$tags, first:$first, sort:HEIGHT_DESC){ edges{ node{ id owner{address} tags{name value} block{height timestamp} } } } }`;
  const data = await gql(gateway, q, { owners: [owner], tags, first: count });
  // The owner filter is re-checked here, not trusted to the gateway: a gateway is also input.
  return data.transactions.edges.map((e) => e.node).filter((n) => n.owner.address === owner).map((n) => {
    const t = tagMap(n.tags);
    return { id: n.id, height: n.block?.height ?? null, networkId: t.get("Network-Id"), bundleRoot: t.get("Bundle-Root"), createdAt: t.get("Created-At") };
  });
}

async function download(gateway, manifestId, owner, out) {
  if (existsSync(out) && readdirSync(out).length) throw new CannotRun(`${out} is not empty`);
  const arweave = client(gateway);
  const mtx = await arweave.transactions.get(manifestId);
  const mOwner = await arweave.wallets.ownerToAddress(mtx.owner);
  if (mOwner !== owner) throw new Fail(`manifest ${manifestId} was signed by ${mOwner}, not ${owner}`);
  const manifest = checkManifest(JSON.parse(Buffer.from(await arweave.transactions.getData(manifestId, { decode: true })).toString("utf8")));
  if (manifest.owner !== owner) throw new Fail(`manifest names owner ${manifest.owner}, signed by ${owner}`);
  mkdirSync(out, { recursive: true });
  for (const a of manifest.assets) {
    const tx = await arweave.transactions.get(a.txId);
    const txOwner = await arweave.wallets.ownerToAddress(tx.owner);
    if (txOwner !== owner) throw new Fail(`asset ${a.name} (${a.txId}) was signed by ${txOwner}, not the manifest owner — refusing a foreign transaction`);
    const tags = tagMap(tx.get("tags").map((t) => ({ name: t.get("name", { decode: true, string: true }), value: t.get("value", { decode: true, string: true }) })));
    if (tags.get("Asset-Name") !== a.name || tags.get("Asset-Sha256") !== a.sha256 || tags.get("Bundle-Root") !== manifest.bundleRoot) {
      throw new Fail(`asset ${a.name}: its own tags disagree with the manifest`);
    }
    const res = await fetch(`${gateway.base}/${a.txId}`);
    if (!res.ok) throw new Fail(`asset ${a.name} (${a.txId}) answered HTTP ${res.status}`);
    const h = createHash("sha256");
    const fd = openSync(join(out, a.name), "wx");
    let bytes = 0;
    try {
      for await (const chunk of res.body) { writeSync(fd, chunk); h.update(chunk); bytes += chunk.length; }
    } finally { closeSync(fd); }
    const got = h.digest("hex");
    if (bytes !== a.bytes || got !== a.sha256) throw new Fail(`asset ${a.name}: downloaded ${bytes} bytes / ${got}, manifest says ${a.bytes} / ${a.sha256}`);
    console.log(`  ✓ ${a.name.padEnd(28)} ${String(bytes).padStart(11)} bytes`);
  }
  return manifest;
}

// ═══════════════════════════════ SELF-TEST ═══════════════════════════════

async function selfTest() {
  let pass = 0, fail = 0;
  const ok = (n, c, d = "") => { if (c) { pass += 1; console.log(`  ✓ ${n}`); } else { fail += 1; console.log(`  ✗ ${n} ${d}`); } };
  const throwsKind = (fn, Kind) => { try { fn(); return false; } catch (e) { return e instanceof Kind; } };
  const local = parseGateway("http://127.0.0.1:1984"), remote = parseGateway("https://arweave.net");
  const outside = resolve(REPO_ROOT, "..", "keys", "wallet.json");

  console.log("gateway + refusals");
  ok("127.0.0.1 is local, arweave.net is not", local.local && !remote.local && remote.port === 443);
  ok("RED→ a non-URL gateway cannot run", throwsKind(() => parseGateway("arweave.net"), CannotRun));
  ok("ArLocal + ephemeral wallet + drill band is allowed (nothing is permanent there)", uploadRefusals({ gateway: local, networkId: 899999998, ephemeral: true }).length === 0);
  ok("RED→ arweave.net without --confirm-permanent is refused", uploadRefusals({ gateway: remote, networkId: 999999998, walletPath: outside }).some((r) => r.includes("--confirm-permanent")));
  ok("RED→ drill-band data on arweave.net is refused EVEN WITH --confirm-permanent", uploadRefusals({ gateway: remote, networkId: 899999998, confirmPermanent: true, walletPath: outside }).some((r) => r.includes("drill band")));
  ok("RED→ an ephemeral wallet on arweave.net is refused", uploadRefusals({ gateway: remote, networkId: 999999998, confirmPermanent: true, ephemeral: true }).some((r) => r.includes("local gateway")));
  ok("RED→ a wallet file inside the repository is refused", uploadRefusals({ gateway: remote, networkId: 999999998, confirmPermanent: true, walletPath: join(REPO_ROOT, "local-net", "wallet.json") }).some((r) => r.includes("inside the repository")));
  ok("isInside: a sibling directory whose name starts with the repo's name is OUTSIDE", !isInside(REPO_ROOT, `${REPO_ROOT}-web/wallet.json`));
  ok("isInside: another drive is outside, the repo root itself is inside", !isInside("C:/PROJECTS/9Chain-A1", "D:/keys/w.json") && isInside(REPO_ROOT, REPO_ROOT));
  ok("the public network, confirmed, wallet outside the repository → allowed", uploadRefusals({ gateway: remote, networkId: 999999998, confirmPermanent: true, walletPath: outside }).length === 0);

  console.log("manifest + tags");
  const good = { schema: 1, kind: MANIFEST_KIND, bundleRoot: "a".repeat(64), assets: ["RELEASE.json", "RELEASE-SHA256SUMS.txt", "meta.tar"].map((name, i) => ({ name, bytes: i, sha256: "b".repeat(64), txId: "c".repeat(43) })) };
  ok("a well-formed manifest passes", !throwsKind(() => checkManifest(good), Fail));
  ok("RED→ an asset name with a path in it is refused", throwsKind(() => checkManifest({ ...good, assets: [...good.assets, { ...good.assets[0], name: "../x" }] }), Fail));
  ok("RED→ an asset listed twice is refused", throwsKind(() => checkManifest({ ...good, assets: [...good.assets, good.assets[0]] }), Fail));
  ok("RED→ a manifest without RELEASE-SHA256SUMS.txt is refused", throwsKind(() => checkManifest({ ...good, assets: good.assets.filter((a) => a.name !== "RELEASE-SHA256SUMS.txt") }), Fail));
  ok("RED→ a duplicated tag name is refused (which value would be true?)", throwsKind(() => tagMap([{ name: "Bundle-Root", value: "x" }, { name: "Bundle-Root", value: "y" }]), Fail));
  ok("tags carry the app name, schema, network, root and time", baseTags({ networkId: 1, bundleRoot: "r", createdAt: "t" }).map(([n]) => n).join() === "App-Name,Schema,Network-Id,Bundle-Root,Created-At");

  console.log(`\n${fail === 0 ? "✅" : "🔴"} self-test: ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

// ═══════════════════════════════ ENTRY ═══════════════════════════════

const positionals = guardEntry(import.meta.url, FLAG_SPEC);
if (isEntryModule(import.meta.url)) {
  const argv = process.argv.slice(2);
  const flag = (name) => { const i = argv.indexOf(name); return i === -1 ? undefined : argv[i + 1]; };
  try {
    if (argv.includes("--self-test")) process.exitCode = await selfTest();
    else {
      const cmd = positionals[0];
      if (!flag("--gateway")) throw new CannotRun("--gateway <url> is required (http://127.0.0.1:1984 for ArLocal)");
      const gateway = parseGateway(flag("--gateway"));
      if (cmd === "plan") {
        if (!positionals[1]) throw new CannotRun("plan needs <assets dir>");
        const p = await plan(hostPath(positionals[1]), gateway);
        console.log(`${p.assets.length} assets + 1 manifest · ${p.bytes} bytes · network ${p.rel.networkId} · root ${p.rel.bundleRoot}`);
        console.log(`price now at ${gateway.base}: ${p.winston} winston = ${ar(p.winston)} AR (one payment; permanent on a real gateway)`);
      } else if (cmd === "upload") {
        if (!positionals[1]) throw new CannotRun("upload needs <assets dir>");
        const r = await upload(hostPath(positionals[1]), gateway, { walletPath: flag("--wallet") && hostPath(flag("--wallet")), ephemeral: argv.includes("--ephemeral-wallet"), confirmPermanent: argv.includes("--confirm-permanent") });
        console.log(`✅ ${r.assets} assets + manifest ${r.manifestTx} · owner ${r.owner} · ${ar(r.winston)} AR`);
      } else if (cmd === "latest") {
        if (!flag("--owner")) throw new CannotRun("latest needs --owner <address>: tags alone prove nothing about who uploaded");
        const rows = await latest(gateway, flag("--owner"), flag("--network-id"), Number(flag("--count") ?? 5));
        if (!rows.length) throw new Fail(`no manifest from ${flag("--owner")} found`);
        for (const r of rows) console.log(`${r.id}  height ${r.height ?? "pending"}  network ${r.networkId}  created ${r.createdAt}  root ${r.bundleRoot}`);
      } else if (cmd === "download") {
        if (!positionals[1] || !flag("--owner") || !flag("--out")) throw new CannotRun("download needs <manifest tx id> --owner <address> --out <dir>");
        const m = await download(gateway, positionals[1], flag("--owner"), hostPath(flag("--out")));
        console.log(`✅ ${m.assets.length} assets downloaded and matched · bundle root ${m.bundleRoot}\n   next: node scripts/chain-snapshot-release.mjs join <out> --out <bundle> --root <PUBLISHED root>`);
      } else throw new CannotRun("usage: arweave-snapshot.mjs plan|upload|latest|download … | --self-test");
    }
  } catch (e) {
    if (e instanceof Fail) { console.error(`\n🔴 FAIL — ${e.message}`); process.exitCode = 1; }
    else { console.error(`\n⚠️ COULD NOT RUN (exit 2, not a verdict) — ${e instanceof CannotRun ? e.message : e.stack}`); process.exitCode = EXIT_CANNOT_RUN; }
  }
}
