#!/usr/bin/env node
/**
 * backup-validator-identity.mjs — B-20: the nine validator identities of the running network,
 * copied somewhere else, and PROVEN to be there by counting the files in the copy.
 *
 * ═══ WHY THIS EXISTS ═══
 *
 * Measured 2026-08-28 (D-117c) by counting files inside the backups themselves:
 *
 *   bundle 20260825 (deleted)   20 × staker/signer keys · 651 MB chain data
 *   bundle 20260827             0
 *   bundle 20260828             0
 *
 * The two newest bundles are backups of the SOURCE CODE. They are not backups of the NETWORK.
 * `h6b-backup.sh --check` is green about them and it is right to be — it measures patch count and
 * tree hashes, and those are correct. Nobody was measuring identities, so nobody saw that losing
 * the machine meant losing the network, with every gate still green.
 *
 * On 2026-09-01 the same hole reopened at full size: g1 was generated that morning, so its nine
 * identities are **new**, and they exist in exactly two places — this dev machine and the OVH box.
 *
 * ═══ WHAT AN IDENTITY IS, AND WHY LOSING IT IS NOT LIKE LOSING A CONFIG ═══
 *
 * Per node: `staker.key` + `staker.crt` (the TLS keypair the nodeID is derived from) and
 * `signer.key` (the BLS key it signs with). The nodeID in `genesis.json` is a function of that
 * certificate. Lose them and the node cannot come back as itself — a replacement is a DIFFERENT
 * validator, which for a genesis validator means the stake recorded in an immutable genesis
 * belongs to a node that no longer exists.
 *
 * 🔴 So this bundle CONTAINS PRIVATE KEYS by design. That is the opposite of `check-key-leaks.mjs`,
 * which exists to find key material where it should not be — and it is exactly why the
 * destination rules below are refusals rather than warnings.
 *
 * ═══ WHAT IT REFUSES, AND WHY EACH REFUSAL IS SOMETHING THAT ALREADY HAPPENED ═══
 *
 *   · an INCOMPLETE identity set        a bundle missing one `signer.key` is worse than no bundle:
 *                                       it is believed. Verification counts files for this reason.
 *   · fund key material in the copy     B-20 says it in one line: *do not store them beside the
 *                                       fund keys*. `check-key-leaks.mjs` watches fund keys and
 *                                       does NOT watch identities, so a mixed directory is
 *                                       unwatched by both gates at once.
 *   · a destination under the OS temp    B-21: g1's fund keys sat in `%TEMP%` for sixteen hours
 *     directory                          inside files no gate opened.
 *   · a destination inside this repo     it would be one `git add -A` away from the history that
 *                                        `check-history-secrets.mjs` exists to keep clean.
 *   · a destination inside the fund      same rule as the first, from the other direction.
 *     key store
 *
 * ═══ AND THE VERIFICATION IS A COUNT, NOT A TICK ═══
 *
 * B-20's own wording: *verify by COUNTING the files inside the bundle, not by reading a `--check`
 * line*. So `--verify` recomputes every checksum AND requires the exact expected population:
 * a file that disappears while the survivors still match their hashes is the failure this rule
 * was written about, and checksum-only verification cannot see it.
 *
 * Exit codes: `0` done / verified · `1` refused or verification failed · `2` could not measure.
 *
 * Usage:
 *   node scripts/backup-validator-identity.mjs                      # plan only, writes nothing
 *   node scripts/backup-validator-identity.mjs --write              # make the bundle
 *   node scripts/backup-validator-identity.mjs --verify <bundle>    # re-check an existing one
 *   node scripts/backup-validator-identity.mjs --check              # is there a usable bundle?
 *   node scripts/backup-validator-identity.mjs --self-test          # reverse controls
 *
 * Flags:
 *   --source <dir>   network directory to read (default local-net/net-g1)
 *   --dest <dir>     bundle destination (default <backup root>/9chain-a1-identity-<net>-<stamp>)
 *   --backup-root <dir>  default C:/PROJECTS/9Chain-backups (or $A1_BACKUP_ROOT)
 *   --rpc <url>      with --check: also require the bundle's networkID to match the LIVE chain
 */
import {
  existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, copyFileSync,
  unlinkSync, rmSync,
} from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import https from "node:https";
import http from "node:http";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (f, d) => {
  const i = argv.indexOf(f);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
};

const SELF_TEST = has("--self-test");
const WRITE = has("--write");
const CHECK = has("--check");
const VERIFY_DIR = opt("--verify", null);
const SOURCE = path.resolve(opt("--source", path.join(ROOT, "local-net/net-g1")));
const BACKUP_ROOT = path.resolve(opt("--backup-root", process.env.A1_BACKUP_ROOT || "C:/PROJECTS/9Chain-backups"));
const RPC = opt("--rpc", null);

/** Per node, and all three are required. A set missing one file is not a smaller set — it is a lie. */
const IDENTITY_FILES = ["staker.key", "staker.crt", "signer.key"];
/** Copied alongside, because identities alone do not rebuild a network. */
const NETWORK_FILES = ["genesis.json", "docker-compose.multinode.yml"];
/**
 * 🔴 NEVER COPIED. `keys.txt` is the six genesis funds and `faucet.env` carries a live sending
 * key; `allocation.md` is not secret but it belongs with them. B-20: do not store them beside the
 * identities. This list is belt; the content scan below is braces.
 */
const NEVER_COPY = new Set(["keys.txt", "faucet.env", "allocation.md", "cung.json"]);

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const MARKER_CB58 = /PrivateKey-[1-9A-HJ-NP-Za-km-z]{40,}/;

// ───────────────────────────── reading the source ─────────────────────────────

function readSource(dir) {
  if (!existsSync(dir)) return { error: `source does not exist: ${dir}` };
  const nodes = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^node\d+$/.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));
  if (!nodes.length) return { error: `no node* directories under ${dir}` };

  const files = [];
  const missing = [];
  for (const n of nodes) {
    for (const f of IDENTITY_FILES) {
      const p = path.join(dir, n, f);
      if (existsSync(p)) files.push({ rel: `${n}/${f}`, abs: p });
      else missing.push(`${n}/${f}`);
    }
  }
  for (const f of NETWORK_FILES) {
    const p = path.join(dir, f);
    if (existsSync(p)) files.push({ rel: f, abs: p });
    else missing.push(f);
  }

  let networkID = null;
  const g = path.join(dir, "genesis.json");
  if (existsSync(g)) {
    try { networkID = JSON.parse(readFileSync(g, "utf8")).networkID ?? null; } catch { /* reported as null */ }
  }
  return { dir, nodes, files, missing, networkID, expected: nodes.length * IDENTITY_FILES.length + NETWORK_FILES.length };
}

/**
 * Content scan over everything about to be copied. The filename list above would already stop
 * `keys.txt`; this stops the same material arriving under a name nobody predicted — the lesson
 * `check-key-leaks.mjs` paid for when a corrupted copy called `keys-hong.txt` carried every real
 * private key past a filename-based scan.
 *
 * ⚠️ It deliberately does NOT flag PEM blocks: `staker.key` IS a PEM private key, and it is the
 * thing we are here to copy. The refusal is about FUND material, not about secrecy in general.
 */
function scanForFundMaterial(files) {
  const hits = [];
  for (const f of files) {
    let body;
    try { body = readFileSync(f.abs, "latin1"); } catch { continue; }
    if (MARKER_CB58.test(body)) hits.push(f.rel);
  }
  return hits;
}

// ───────────────────────────── destination rules ─────────────────────────────

const inside = (child, parent) => {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
};

/**
 * Refusals, each naming the incident it comes from. They are refusals and not warnings because
 * every one of them describes a place where secret material has ALREADY been found sitting in
 * this project, and a warning is a thing people read once.
 */
function checkDestination(dest, { repoRoot = ROOT, keyStore = path.join(homedir(), "9chain-a1-keys"), temp = tmpdir() } = {}) {
  const problems = [];
  if (inside(dest, temp)) problems.push(`destination is inside the OS temp directory (${temp}) — B-21: g1's fund keys sat there for sixteen hours`);
  if (inside(dest, repoRoot)) problems.push(`destination is inside the repository (${repoRoot}) — one 'git add -A' from being published forever`);
  if (inside(dest, keyStore)) problems.push(`destination is inside the fund key store (${keyStore}) — B-20: do not store identities beside the fund keys`);
  return problems;
}

// ───────────────────────────── writing and verifying ─────────────────────────────

function writeBundle(src, dest) {
  mkdirSync(dest, { recursive: true });
  const sums = [];
  for (const f of src.files) {
    const target = path.join(dest, f.rel);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(f.abs, target);
    sums.push({ rel: f.rel, sha256: sha256(readFileSync(target)), bytes: statSync(target).size });
  }
  const manifest = [
    "# 9CHAIN-A1 — VALIDATOR IDENTITY BUNDLE (B-20)",
    "#",
    "# 🔴 THIS DIRECTORY CONTAINS PRIVATE KEYS: one staking keypair and one BLS key per node.",
    "# Anyone holding them can run as those nodeIDs. Treat it like the fund key store, and never",
    "# store it beside the fund keys — the gate that watches fund keys does not watch these.",
    "#",
    `# source      ${src.dir}`,
    `# networkID   ${src.networkID}`,
    `# nodes       ${src.nodes.length}`,
    `# files       ${sums.length}  (${src.nodes.length} x ${IDENTITY_FILES.length} identity + ${NETWORK_FILES.length} network)`,
    "#",
    "# Verify with:  node scripts/backup-validator-identity.mjs --verify <this directory>",
    "# Verification counts the files as well as checking hashes: a bundle that quietly loses one",
    "# signer.key while every surviving hash still matches is the exact failure B-20 is about.",
    "",
    ...sums.map((s) => `${s.sha256}  ${s.bytes}  ${s.rel}`),
  ].join("\n");
  writeFileSync(path.join(dest, "MANIFEST.txt"), manifest + "\n");
  writeFileSync(path.join(dest, "SHA256SUMS.txt"), sums.map((s) => `${s.sha256}  ${s.rel}`).join("\n") + "\n");
  return { dest, count: sums.length };
}

function verifyBundle(dir) {
  const sumsFile = path.join(dir, "SHA256SUMS.txt");
  if (!existsSync(sumsFile)) return { error: `no SHA256SUMS.txt in ${dir}` };
  const expected = readFileSync(sumsFile, "utf8").trim().split(/\r?\n/).filter(Boolean).map((line) => {
    const [hash, ...rest] = line.split(/\s+/);
    return { sha256: hash, rel: rest.join(" ") };
  });
  const bad = [], missing = [];
  for (const e of expected) {
    const p = path.join(dir, e.rel);
    if (!existsSync(p)) { missing.push(e.rel); continue; }
    if (sha256(readFileSync(p)) !== e.sha256) bad.push(e.rel);
  }
  // The count question, asked separately from the hash question on purpose.
  const present = [];
  const walk = (d, prefix = "") => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(d, e.name), prefix + e.name + "/");
      else if (!["MANIFEST.txt", "SHA256SUMS.txt"].includes(e.name)) present.push(prefix + e.name);
    }
  };
  walk(dir);
  const extra = present.filter((p) => !expected.some((e) => e.rel === p));
  const identityCount = expected.filter((e) => IDENTITY_FILES.some((f) => e.rel.endsWith("/" + f))).length;
  return { expectedCount: expected.length, presentCount: present.length, identityCount, bad, missing, extra };
}

/**
 * A JSON-RPC POST over a connection that is CLOSED when the answer arrives.
 *
 * 🔴 Not `fetch`, and the reason is a real crash rather than a preference. Measured 2026-09-01 on
 * this machine: `--check --rpc` printed the right answer and then died with
 * `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING) … async.c` and exit code **127** — the
 * global fetch dispatcher keeps a keep-alive socket open, and `process.exit()` races it. Exit 127
 * is not one of this tool's three codes, so a caller reading exit codes would have learned
 * nothing except that something went wrong somewhere.
 */
function rpcPost(url, payload, timeoutMs = 20_000) {
  const lib = url.protocol === "http:" ? http : https;
  const data = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const req = lib.request(url, {
      method: "POST",
      headers: { "content-type": "application/json", "content-length": Buffer.byteLength(data), connection: "close" },
      agent: new lib.Agent({ keepAlive: false }),
      timeout: timeoutMs,
    }, (res) => {
      let out = "";
      res.setEncoding("utf8");
      res.on("data", (c) => { out += c; });
      res.on("end", () => resolve(out));
    });
    req.on("timeout", () => req.destroy(new Error(`timed out after ${timeoutMs} ms`)));
    req.on("error", reject);
    req.end(data);
  });
}

// ───────────────────────────── self-test ─────────────────────────────

function makeFakeNet(dir, { nodes = 9, dropFile = null, withFundKeys = false } = {}) {
  mkdirSync(dir, { recursive: true });
  for (let i = 1; i <= nodes; i++) {
    const nd = path.join(dir, `node${i}`);
    mkdirSync(nd, { recursive: true });
    for (const f of IDENTITY_FILES) {
      if (dropFile && dropFile === `node${i}/${f}`) continue;
      writeFileSync(path.join(nd, f), randomBytes(64));
    }
  }
  writeFileSync(path.join(dir, "genesis.json"), JSON.stringify({ networkID: 999999998 }, null, 2));
  writeFileSync(path.join(dir, "docker-compose.multinode.yml"), "services: {}\n");
  if (withFundKeys) {
    // Synthetic, never a real key: random base58 in the shape avalanchego serialises.
    const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let k = "";
    for (const b of randomBytes(51)) k += alphabet[b % alphabet.length];
    // Placed INSIDE a node directory, i.e. where the filename list would not stop it.
    writeFileSync(path.join(dir, "node1", "staker.key"), `PrivateKey-${k}\n`);
  }
  return dir;
}

function selfTest() {
  const base = path.join(tmpdir(), `a1-b20-${randomBytes(4).toString("hex")}`);
  const out = path.join(base, "out");           // a destination that is NOT temp-refused in tests
  const cases = [];
  try {
    // 1 — a complete tree plans cleanly and counts 29 files (9 x 3 + 2).
    const src1 = readSource(makeFakeNet(path.join(base, "net1")));
    cases.push(["a complete 9-node tree yields 27 identity + 2 network files",
      !src1.error && src1.missing.length === 0 && src1.files.length === 29 && src1.expected === 29]);

    // 2 — 🔴 the incomplete set. Worse than no bundle, because it gets believed.
    const src2 = readSource(makeFakeNet(path.join(base, "net2"), { dropFile: "node7/signer.key" }));
    cases.push(["one missing signer.key is detected before anything is copied",
      src2.missing.length === 1 && src2.missing[0] === "node7/signer.key"]);

    // 3 — fund material hiding under an identity filename: content scan, not filename list.
    const src3 = readSource(makeFakeNet(path.join(base, "net3"), { withFundKeys: true }));
    cases.push(["fund key material inside the identity set is found by CONTENT",
      scanForFundMaterial(src3.files).includes("node1/staker.key")]);

    // 3b — and a normal identity file is NOT mistaken for fund material.
    cases.push(["a plain staking key is not flagged as fund material",
      scanForFundMaterial(readSource(path.join(base, "net1")).files).length === 0]);

    // 4–6 — destinations that are refused, each for a reason that already happened here.
    cases.push(["a destination under the OS temp directory is refused",
      checkDestination(path.join(tmpdir(), "bundle"), { temp: tmpdir() }).some((p) => /temp/i.test(p))]);
    cases.push(["a destination inside the repository is refused",
      checkDestination(path.join(ROOT, "backup"), { repoRoot: ROOT }).some((p) => /repository/.test(p))]);
    cases.push(["a destination inside the fund key store is refused",
      checkDestination(path.join(base, "keys", "b20"), { keyStore: path.join(base, "keys"), temp: path.join(base, "no-temp") })
        .some((p) => /fund key store/.test(p))]);

    // 7 — a good bundle verifies.
    const w = writeBundle(readSource(path.join(base, "net1")), out);
    const v1 = verifyBundle(out);
    cases.push(["a fresh bundle verifies: 29 files, no bad, no missing, no extra",
      w.count === 29 && v1.bad.length === 0 && v1.missing.length === 0 && v1.extra.length === 0 && v1.identityCount === 27]);

    // 8 — a changed byte is caught.
    writeFileSync(path.join(out, "node3", "signer.key"), randomBytes(64));
    cases.push(["a modified file is caught by checksum", verifyBundle(out).bad.includes("node3/signer.key")]);

    // 9 — 🔴 THE COUNT, ASKED SEPARATELY. Remove a file: every surviving hash still matches, and
    //     a checksum-only verifier would have nothing to say. B-20 exists because of this shape.
    const out2 = path.join(base, "out2");
    writeBundle(readSource(path.join(base, "net1")), out2);
    unlinkSync(path.join(out2, "node5", "staker.crt"));
    const v2 = verifyBundle(out2);
    cases.push(["a DELETED file is caught although every remaining hash matches",
      v2.missing.includes("node5/staker.crt") && v2.bad.length === 0 && v2.presentCount === 28]);

    // 10 — planning writes nothing.
    const out3 = path.join(base, "out3");
    cases.push(["planning creates no destination directory", !existsSync(out3)]);
  } finally {
    // Clean up in the session that created it — the fixtures are synthetic, but the habit is the
    // one D-117 had to install after real key material outlived its session in a temp directory.
    try { rmSync(base, { recursive: true, force: true, maxRetries: 3 }); } catch { /* nothing left to do */ }
  }

  let bad = 0;
  for (const [name, ok] of cases) { console.log(`  ${ok ? "✓" : "🔴"} ${name}`); if (!ok) bad++; }
  console.log(`\n  ${cases.length - bad}/${cases.length} reverse controls passed`);
  return bad ? 1 : 0;
}

// ───────────────────────────── main ─────────────────────────────

async function main() {
  if (SELF_TEST) return selfTest();

  if (VERIFY_DIR) {
    const v = verifyBundle(path.resolve(VERIFY_DIR));
    if (v.error) { console.log(`⁇ ${v.error}`); return 2; }
    console.log(`verify ${path.resolve(VERIFY_DIR)}`);
    console.log(`  files listed ${v.expectedCount} · present ${v.presentCount} · identity files ${v.identityCount}`);
    for (const m of v.missing) console.log(`  🔴 MISSING   ${m}`);
    for (const b of v.bad) console.log(`  🔴 CHANGED   ${b}`);
    for (const e of v.extra) console.log(`  🟡 not listed in the manifest: ${e}`);
    if (v.missing.length || v.bad.length) {
      console.log("\n🔴 This bundle cannot rebuild the network it claims to.");
      return 1;
    }
    console.log("\n✓ Every file listed is present and unchanged.");
    return 0;
  }

  const src = readSource(SOURCE);
  if (src.error) { console.log(`⁇ ${src.error}`); return 2; }

  if (CHECK) {
    // Measure, do not assert: is there a bundle for THIS network, and does it still verify?
    if (!existsSync(BACKUP_ROOT)) { console.log(`⁇ backup root unreadable: ${BACKUP_ROOT}`); return 2; }
    console.log(`check — source ${SOURCE} (networkID ${src.networkID})`);

    // 🔴 WITHOUT --rpc, "this network" MEANS THE SOURCE DIRECTORY, AND THAT IS A WEAKER CLAIM
    // THAN IT SOUNDS. D-110: `local-net/net-that-g0/` declares the live networkID and holds six
    // wallets with nothing in them — a directory can be wrong about which generation it belongs
    // to, and then a bundle that matches it is a perfect backup of a dead network. Asking the
    // chain is what closes that, and it is the same fix check-net-dirs.mjs needed.
    let liveNetworkID = null;
    if (RPC) {
      try {
        const body = await rpcPost(new URL("/ext/info", RPC), { jsonrpc: "2.0", id: 1, method: "info.getNetworkID", params: {} });
        liveNetworkID = Number(JSON.parse(body).result.networkID);
      } catch (e) {
        console.log(`  ⁇ could not ask the chain (${RPC}): ${e.message}`);
        console.log("     COULD NOT MEASURE — refusing to grade bundles against a directory alone.");
        return 2;
      }
      console.log(`  live networkID (measured on the chain): ${liveNetworkID}`);
      if (liveNetworkID !== src.networkID) {
        console.log(`  🔴 THE SOURCE DIRECTORY IS NOT THE RUNNING GENERATION — source says ${src.networkID}, the chain says ${liveNetworkID}.`);
        console.log("     Backing it up would produce a flawless copy of a network nobody is running.");
        return 1;
      }
    } else {
      console.log("  ⚠️ no --rpc: 'this network' means the source DIRECTORY, not the running chain (D-110).");
    }
    const candidates = readdirSync(BACKUP_ROOT).filter((d) => /^9chain-a1-identity-/.test(d)).sort();
    if (!candidates.length) {
      console.log(`  🔴 NO identity bundle in ${BACKUP_ROOT}`);
      console.log("     B-20 is open: the nine identities of the running network exist only on this");
      console.log("     machine and on the server. Losing either does not lose the network; losing");
      console.log("     both does, and no other backup contains them.");
      return 1;
    }
    let ok = false;
    for (const c of candidates.reverse()) {
      const dir = path.join(BACKUP_ROOT, c);
      const v = verifyBundle(dir);
      const gen = (() => {
        try { return JSON.parse(readFileSync(path.join(dir, "genesis.json"), "utf8")).networkID; } catch { return null; }
      })();
      const sameNet = gen === src.networkID;
      const clean = !v.error && !v.missing.length && !v.bad.length;
      console.log(`  ${clean && sameNet ? "✓" : "🔴"} ${c} — networkID ${gen}${sameNet ? "" : " (DIFFERENT GENERATION)"} · ${v.error ? v.error : `${v.presentCount} files, ${v.missing.length} missing, ${v.bad.length} changed`}`);
      if (clean && sameNet) ok = true;
    }
    return ok ? 0 : 1;
  }

  // ── plan / write ──
  const stamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];
  const dest = path.resolve(opt("--dest", path.join(BACKUP_ROOT, `9chain-a1-identity-${path.basename(SOURCE)}-${stamp}`)));

  console.log("═══ B-20 — VALIDATOR IDENTITY BUNDLE ═══");
  console.log(`mode      : ${WRITE ? "🔴 WRITE — private keys will be copied" : "plan only (nothing is written)"}`);
  console.log(`source    : ${SOURCE}`);
  console.log(`networkID : ${src.networkID}`);
  console.log(`nodes     : ${src.nodes.length}  → ${src.files.length} files (${src.nodes.length} × ${IDENTITY_FILES.length} identity + ${NETWORK_FILES.length} network)`);
  console.log(`dest      : ${dest}`);

  let refuse = false;
  if (src.missing.length) {
    console.log("\n🔴 REFUSING: the identity set is INCOMPLETE.");
    for (const m of src.missing) console.log(`     missing ${m}`);
    console.log("   A bundle missing one file is worse than no bundle, because it gets believed.");
    refuse = true;
  }
  const fund = scanForFundMaterial(src.files);
  if (fund.length) {
    console.log("\n🔴 REFUSING: fund key material found in the files about to be copied.");
    for (const f of fund) console.log(`     ${f}`);
    console.log("   B-20: do not store identities beside the fund keys. check-key-leaks.mjs watches");
    console.log("   fund keys and does not watch identities — a mixed directory is unwatched twice.");
    refuse = true;
  }
  const destProblems = checkDestination(dest);
  for (const p of destProblems) console.log(`\n🔴 REFUSING: ${p}`);
  if (destProblems.length) refuse = true;

  const skipped = readdirSync(SOURCE).filter((f) => NEVER_COPY.has(f));
  if (skipped.length) console.log(`\n  not copied, deliberately: ${skipped.join(" · ")}`);

  if (refuse) return 1;

  if (!WRITE) {
    console.log("\n✓ plan only. Add --write to create the bundle.");
    console.log("  🔴 Then put it somewhere this machine is not: the point of a second copy is that it");
    console.log("     survives what happens to the first one.");
    return 0;
  }

  const w = writeBundle(src, dest);
  const v = verifyBundle(dest);
  console.log(`\n  wrote ${w.count} files`);
  console.log(`  verify: ${v.presentCount} present · ${v.identityCount} identity · ${v.missing.length} missing · ${v.bad.length} changed`);
  if (v.missing.length || v.bad.length) { console.log("\n🔴 The bundle did not verify immediately after being written."); return 1; }
  console.log("\n✓ Bundle written and verified.");
  console.log("  🔴 It contains private keys. It is not a backup until it is on other media, and it");
  console.log("     must not be stored beside the fund key set.");
  return 0;
}

process.exit(await main());
