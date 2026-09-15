#!/usr/bin/env node
/**
 * chain-snapshot-release.mjs — carry a sealed chain-snapshot bundle through GitHub Releases, and
 * get back the SAME bundle, byte for byte, on the other side.
 *
 * ═══ WHY A SEPARATE STEP ═══
 *
 * A bundle (`chain-snapshot.mjs create`) is a directory. A GitHub release is a FLAT list of files,
 * and GitHub refuses any single file of 2 GiB or more. Both limits bite:
 *
 *   - `node-data.tar` grows with the chain; the drill band is already 279 MiB.
 *   - `chain-configs/<chain>/config.json` is nested, and one file per chain would not fit the
 *     release's asset count once the network carries thousands of L1s.
 *
 * So a bundle becomes release ASSETS:
 *
 *   meta.tar                    every small file of the bundle (ustar, deterministic bytes)
 *   node-data.tar.part-000 …    the data tar cut into parts below the size limit
 *   node-image.tar.part-000 …   only when the bundle carries the node image
 *   SHA256SUMS.txt · ROOT.txt   copied out of meta.tar so a person can check the root without
 *                               downloading gigabytes
 *   RELEASE.json                how to put the parts back together
 *   RELEASE-SHA256SUMS.txt      sha256 of every asset above
 *
 * ═══ 🔴 WHAT PROVES THE ROUND TRIP ═══
 *
 * Not the asset checksums: RELEASE.json and RELEASE-SHA256SUMS.txt travel with the assets, so
 * whoever can replace an asset can replace them too. The proof is the bundle's ROOT — published
 * OUTSIDE the release (D-112) — checked on the REJOINED directory:
 *
 *   join → verify every part against RELEASE.json → concatenate → the rebuilt tar must hash to the
 *   value in the bundle's own SHA256SUMS.txt → `verify --root <published root>` on the result.
 *
 * Asset checksums only make failures early and specific ("part-002 is corrupt" instead of "the tar
 * is wrong"); they are never the verdict.
 *
 * ═══ USAGE ═══
 *
 *   node scripts/chain-snapshot-release.mjs pack <bundle> --out <assets dir> [--part-size <MiB>]
 *   node scripts/chain-snapshot-release.mjs join <assets dir> --out <bundle dir> [--root <hex>]
 *   node scripts/chain-snapshot-release.mjs upload <assets dir> --repo <owner/name> [--tag <tag>] [--publish]
 *   node scripts/chain-snapshot-release.mjs --self-test
 *
 * `upload` creates a DRAFT release unless `--publish` is given: a draft is visible only to people
 * with write access, so the upload can be checked before anyone downloads it. After uploading it
 * reads the release back from GitHub and compares every asset's name and size, and the bytes of the
 * small assets, with the local ones.
 *
 * Exit codes (repo convention): 0 PASS · 1 FAIL · 2 COULD NOT RUN.
 */
import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, readSync, rmSync, statSync, writeFileSync, writeSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix, resolve } from "node:path";
import { EXIT_CANNOT_RUN, guardEntry, isEntryModule } from "../local-net/lib/cli.mjs";
import { CannotRun, Fail, hostPath, parseSums, seal, verifyFiles } from "./chain-snapshot.mjs";

const FLAG_SPEC = { "--self-test": false, "--out": true, "--part-size": true, "--root": true, "--repo": true, "--tag": true, "--publish": false };

export const RELEASE_KIND = "9chain-a1-chain-snapshot-release";
/** GitHub refuses a release asset of 2 GiB or more. */
export const GITHUB_ASSET_LIMIT = 2 * 1024 ** 3;
/** A release holds at most this many assets. */
export const GITHUB_ASSET_COUNT_LIMIT = 1000;
/** Default part size: 1,900 MiB leaves ~148 MiB of margin under the limit. */
export const DEFAULT_PART_MIB = 1900;
const BIG_FILES = ["node-data.tar", "node-image.tar"];
const CHUNK = 8 * 1024 * 1024;

// ═══════════════════════════════ USTAR (deterministic, small files only) ═══════════════════════════════

function octal(value, width) {
  return value.toString(8).padStart(width - 1, "0") + "\0";
}

/**
 * A POSIX ustar archive of `entries` ([{ path, data }]), with every header field that could vary
 * fixed (mtime 0, mode 0644, uid/gid 0, no user names). Same files ⇒ same bytes ⇒ same sha256, so
 * packing one bundle twice yields identical assets.
 */
export function ustarWrite(entries) {
  const blocks = [];
  for (const { path, data } of [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))) {
    if (Buffer.byteLength(path) > 99) throw new CannotRun(`path too long for a plain ustar name: ${path}`);
    const h = Buffer.alloc(512, 0);
    h.write(path, 0, "utf8");
    h.write(octal(0o644, 8), 100, "ascii");
    h.write(octal(0, 8), 108, "ascii");
    h.write(octal(0, 8), 116, "ascii");
    h.write(octal(data.length, 12), 124, "ascii");
    h.write(octal(0, 12), 136, "ascii");
    h.write("        ", 148, "ascii");
    h.write("0", 156, "ascii");
    h.write("ustar\0", 257, "ascii");
    h.write("00", 263, "ascii");
    let sum = 0;
    for (const byte of h) sum += byte;
    h.write(sum.toString(8).padStart(6, "0") + "\0 ", 148, "ascii");
    blocks.push(h, data, Buffer.alloc((512 - (data.length % 512)) % 512, 0));
  }
  blocks.push(Buffer.alloc(1024, 0));
  return Buffer.concat(blocks);
}

/**
 * Reads a ustar archive. Refuses anything that is not a plain file, a bad checksum, and — the
 * reason this is not a one-liner — any path that could write outside the target directory
 * (absolute, `..`, drive letters, backslashes). An archive downloaded from the internet is input.
 */
export function ustarRead(buf) {
  const out = [];
  let off = 0;
  while (off + 512 <= buf.length) {
    const h = buf.subarray(off, off + 512);
    if (h.every((b) => b === 0)) return out;
    const stored = parseInt(h.subarray(148, 156).toString("ascii").replace(/\0.*$/s, "").trim(), 8);
    let sum = 0;
    for (let i = 0; i < 512; i += 1) sum += i >= 148 && i < 156 ? 32 : h[i];
    if (stored !== sum) throw new Fail(`meta.tar header checksum mismatch at byte ${off}`);
    const name = h.subarray(0, 100).toString("utf8").replace(/\0.*$/s, "");
    const prefix = h.subarray(345, 500).toString("utf8").replace(/\0.*$/s, "");
    const path = prefix ? `${prefix}/${name}` : name;
    const type = String.fromCharCode(h[156]);
    const size = parseInt(h.subarray(124, 136).toString("ascii").replace(/\0.*$/s, "").trim() || "0", 8);
    if (type !== "0" && type !== "\0") throw new Fail(`meta.tar entry ${path} is not a plain file (type ${JSON.stringify(type)})`);
    if (!path || path.startsWith("/") || path.includes("\\") || /^[A-Za-z]:/.test(path) || path.split("/").some((s) => s === ".." || s === "")) {
      throw new Fail(`meta.tar entry has an unsafe path: ${JSON.stringify(path)}`);
    }
    const start = off + 512;
    if (start + size > buf.length) throw new Fail(`meta.tar entry ${path} is truncated`);
    out.push({ path, data: Buffer.from(buf.subarray(start, start + size)) });
    off = start + size + ((512 - (size % 512)) % 512);
  }
  throw new Fail("meta.tar has no end-of-archive marker (truncated)");
}

// ═══════════════════════════════ PURE PLANNING (self-tested) ═══════════════════════════════

/** Part size in bytes from a MiB flag, refused unless it fits under GitHub's asset limit. */
export function partBytes(mib) {
  const n = Number(mib);
  if (!Number.isFinite(n) || n < 1 || !Number.isInteger(n)) throw new CannotRun(`--part-size must be a whole number of MiB (got ${mib})`);
  const bytes = n * 1024 * 1024;
  if (bytes >= GITHUB_ASSET_LIMIT) throw new CannotRun(`--part-size ${n} MiB is not below GitHub's 2 GiB asset limit`);
  return bytes;
}

/** Names of the parts a file of `size` bytes is cut into. An empty file still gets one part. */
export function partNames(file, size, bytesPerPart) {
  const count = Math.max(1, Math.ceil(size / bytesPerPart));
  if (count > 999) throw new CannotRun(`${file} would need ${count} parts — raise --part-size`);
  return Array.from({ length: count }, (_, i) => `${file}.part-${String(i).padStart(3, "0")}`);
}

/** Every problem with a planned asset list against GitHub's limits. Empty = uploadable. */
export function assetProblems(assets) {
  const problems = [];
  if (assets.length > GITHUB_ASSET_COUNT_LIMIT) problems.push(`${assets.length} assets exceed GitHub's ${GITHUB_ASSET_COUNT_LIMIT} per release`);
  const seen = new Set();
  for (const a of assets) {
    if (a.bytes >= GITHUB_ASSET_LIMIT) problems.push(`${a.name} is ${a.bytes} bytes, not below 2 GiB`);
    if (!/^[A-Za-z0-9._-]+$/.test(a.name)) problems.push(`${a.name}: GitHub rewrites names outside [A-Za-z0-9._-]`);
    if (seen.has(a.name)) problems.push(`${a.name} appears twice`);
    seen.add(a.name);
  }
  return problems;
}

// ═══════════════════════════════ FILE HELPERS ═══════════════════════════════

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

function hashFile(path) {
  const h = createHash("sha256");
  const fd = openSync(path, "r");
  const buf = Buffer.allocUnsafe(CHUNK);
  try {
    for (;;) {
      const n = readSync(fd, buf, 0, CHUNK, null);
      if (n === 0) break;
      h.update(buf.subarray(0, n));
    }
  } finally { closeSync(fd); }
  return h.digest("hex");
}

function listFiles(dir) {
  const out = [];
  const walk = (d, rel) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(join(d, e.name), r);
      else out.push(r);
    }
  };
  walk(dir, "");
  return out.sort();
}

/** Streams `src` into consecutive part files, returning [{ name, bytes, sha256 }] and the whole-file hash. */
function splitFile(src, outDir, baseName, bytesPerPart) {
  const size = statSync(src).size;
  const names = partNames(baseName, size, bytesPerPart);
  const whole = createHash("sha256");
  const fd = openSync(src, "r");
  const buf = Buffer.allocUnsafe(CHUNK);
  const parts = [];
  try {
    for (const name of names) {
      const h = createHash("sha256");
      const out = openSync(join(outDir, name), "wx");
      let written = 0;
      try {
        while (written < bytesPerPart) {
          const n = readSync(fd, buf, 0, Math.min(CHUNK, bytesPerPart - written), null);
          if (n === 0) break;
          const slice = buf.subarray(0, n);
          writeSync(out, slice);
          h.update(slice); whole.update(slice);
          written += n;
        }
      } finally { closeSync(out); }
      parts.push({ name, bytes: written, sha256: h.digest("hex") });
    }
  } finally { closeSync(fd); }
  return { parts, sha256: whole.digest("hex"), bytes: size };
}

// ═══════════════════════════════ COMMANDS ═══════════════════════════════

export async function pack(bundle, out, bytesPerPart) {
  const { problems, root } = await verifyFiles(bundle);
  if (problems.length) throw new Fail(`the bundle does not verify — refusing to release it:\n    ${problems.join("\n    ")}`);
  if (existsSync(out) && readdirSync(out).length) throw new CannotRun(`${out} is not empty`);
  mkdirSync(out, { recursive: true });

  const files = listFiles(bundle);
  const small = files.filter((f) => !BIG_FILES.includes(f));
  const meta = ustarWrite(small.map((f) => ({ path: f, data: readFileSync(join(bundle, ...f.split("/"))) })));
  writeFileSync(join(out, "meta.tar"), meta);
  writeFileSync(join(out, "SHA256SUMS.txt"), readFileSync(join(bundle, "SHA256SUMS.txt")));
  writeFileSync(join(out, "ROOT.txt"), readFileSync(join(bundle, "ROOT.txt")));

  const reassemble = [];
  for (const big of BIG_FILES.filter((f) => files.includes(f))) {
    const r = splitFile(join(bundle, big), out, big, bytesPerPart);
    reassemble.push({ file: big, bytes: r.bytes, sha256: r.sha256, parts: r.parts });
  }
  const snapshot = JSON.parse(readFileSync(join(bundle, "snapshot.json"), "utf8"));
  const release = {
    schema: 1,
    kind: RELEASE_KIND,
    bundleRoot: root,
    networkId: snapshot.network.networkId,
    createdAt: snapshot.createdAt,
    partBytes: bytesPerPart,
    meta: { name: "meta.tar", bytes: meta.length, sha256: sha256(meta), files: small.length },
    reassemble,
  };
  writeFileSync(join(out, "RELEASE.json"), JSON.stringify(release, null, 2) + "\n");

  const assets = listFiles(out).map((name) => ({ name, bytes: statSync(join(out, name)).size }));
  const limits = assetProblems([...assets, { name: "RELEASE-SHA256SUMS.txt", bytes: 0 }]);
  if (limits.length) throw new Fail(`assets do not fit GitHub Releases:\n    ${limits.join("\n    ")}`);
  const sums = assets.map((a) => `${hashFile(join(out, a.name))}  ${a.name}`).join("\n") + "\n";
  writeFileSync(join(out, "RELEASE-SHA256SUMS.txt"), sums);
  return { release, assets: assets.length + 1, root };
}

export async function joinRelease(assetsDir, out, publishedRoot) {
  const rel = JSON.parse(readFileSync(join(assetsDir, "RELEASE.json"), "utf8"));
  if (rel.kind !== RELEASE_KIND || rel.schema !== 1) throw new CannotRun("RELEASE.json is not a schema 1 chain-snapshot release");
  if (existsSync(out) && readdirSync(out).length) throw new CannotRun(`${out} is not empty`);

  // Asset-level checks first: they name the broken asset. They are NOT the verdict (see header).
  const expected = parseSums(readFileSync(join(assetsDir, "RELEASE-SHA256SUMS.txt"), "utf8"));
  const listed = new Set(expected.map((e) => e.path));
  const problems = [];
  for (const name of readdirSync(assetsDir)) if (name !== "RELEASE-SHA256SUMS.txt" && !listed.has(name)) problems.push(`asset not listed in RELEASE-SHA256SUMS.txt: ${name}`);
  for (const { hash, path } of expected) {
    const p = join(assetsDir, path);
    if (!existsSync(p)) problems.push(`missing asset: ${path}`);
    else if (hashFile(p) !== hash) problems.push(`asset bytes changed: ${path}`);
  }
  if (problems.length) throw new Fail(`release assets are not the ones listed:\n    ${problems.join("\n    ")}`);

  mkdirSync(out, { recursive: true });
  const metaBytes = readFileSync(join(assetsDir, rel.meta.name));
  if (sha256(metaBytes) !== rel.meta.sha256) throw new Fail("meta.tar does not match RELEASE.json");
  for (const { path, data } of ustarRead(metaBytes)) {
    const target = join(out, ...path.split("/"));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, data, { flag: "wx" });
  }
  const bundleSums = new Map(parseSums(readFileSync(join(out, "SHA256SUMS.txt"), "utf8")).map((e) => [e.path, e.hash]));

  for (const r of rel.reassemble) {
    if (!BIG_FILES.includes(r.file)) throw new Fail(`RELEASE.json asks to rebuild an unexpected file: ${r.file}`);
    const names = r.parts.map((p) => p.name);
    if (names.join() !== partNames(r.file, r.bytes, rel.partBytes).join()) throw new Fail(`${r.file}: part list is not the contiguous sequence its size implies`);
    const whole = createHash("sha256");
    const fd = openSync(join(out, r.file), "wx");
    const buf = Buffer.allocUnsafe(CHUNK);
    let total = 0;
    try {
      for (const part of r.parts) {
        const src = openSync(join(assetsDir, part.name), "r");
        try {
          for (;;) {
            const n = readSync(src, buf, 0, CHUNK, null);
            if (n === 0) break;
            writeSync(fd, buf.subarray(0, n));
            whole.update(buf.subarray(0, n));
            total += n;
          }
        } finally { closeSync(src); }
      }
    } finally { closeSync(fd); }
    const got = whole.digest("hex");
    if (total !== r.bytes || got !== r.sha256) throw new Fail(`${r.file} rebuilt to ${total} bytes / ${got}, RELEASE.json says ${r.bytes} / ${r.sha256}`);
    if (bundleSums.get(r.file) !== got) throw new Fail(`${r.file} rebuilt to ${got}, but the bundle's own SHA256SUMS.txt says ${bundleSums.get(r.file)}`);
  }
  // The verdict: the rebuilt directory against the root kept outside the release.
  return verifyFiles(out, publishedRoot);
}

function gh(args, allowFail = false) {
  const r = spawnSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new CannotRun(`gh not runnable: ${r.error.message}`);
  if (r.status !== 0 && !allowFail) throw new CannotRun(`gh ${args.slice(0, 2).join(" ")} exited ${r.status}: ${(r.stderr || r.stdout).trim().slice(-500)}`);
  return r;
}

async function upload(assetsDir, repo, tagFlag, publish) {
  const rel = JSON.parse(readFileSync(join(assetsDir, "RELEASE.json"), "utf8"));
  const expected = parseSums(readFileSync(join(assetsDir, "RELEASE-SHA256SUMS.txt"), "utf8"));
  const problems = expected.filter(({ hash, path }) => !existsSync(join(assetsDir, path)) || hashFile(join(assetsDir, path)) !== hash).map((e) => e.path);
  if (problems.length) throw new Fail(`local assets changed since pack: ${problems.join(", ")}`);
  const names = [...expected.map((e) => e.path), "RELEASE-SHA256SUMS.txt"];
  const limits = assetProblems(names.map((name) => ({ name, bytes: statSync(join(assetsDir, name)).size })));
  if (limits.length) throw new Fail(limits.join("; "));

  const stamp = rel.createdAt.replace(/[-:]/g, "").replace(/\..*$/, "").replace("T", "-");
  const tag = tagFlag ?? `a1-snapshot-${rel.networkId}-${stamp}`;
  if (!/^[A-Za-z0-9._-]+$/.test(tag)) throw new CannotRun(`tag ${tag} has characters outside [A-Za-z0-9._-]`);
  if (gh(["release", "view", tag, "--repo", repo, "--json", "tagName"], true).status === 0) throw new CannotRun(`release ${tag} already exists on ${repo} — refusing to add to or overwrite it`);

  const notesDir = mkdtempSync(join(tmpdir(), "a1snap-notes-"));
  try {
    const notes = join(notesDir, "notes.md");
    writeFileSync(notes, [
      `Chain snapshot of network ${rel.networkId}, created ${rel.createdAt}.`,
      "",
      `Bundle root: \`${rel.bundleRoot}\``,
      "",
      "Check the root against the one the project publishes OUTSIDE this release before trusting anything here.",
      "",
      "```bash",
      "sha256sum -c RELEASE-SHA256SUMS.txt",
      `node scripts/chain-snapshot-release.mjs join <download dir> --out <bundle dir> --root <published root>`,
      "```",
      "",
      "Or with standard tools only: `cat node-data.tar.part-* > node-data.tar`, `tar -xf meta.tar`, then `sha256sum -c SHA256SUMS.txt`.",
      "",
      "See docs/COMMUNITY-SNAPSHOTS.md for what a snapshot can and cannot restore.",
    ].join("\n") + "\n");
    const args = ["release", "create", tag, "--repo", repo, "--title", `A1 chain snapshot ${rel.networkId} ${stamp}`, "--notes-file", notes];
    if (!publish) args.push("--draft");
    args.push(...names.map((n) => join(assetsDir, n)));
    console.log(`  uploading ${names.length} assets to ${repo} as ${publish ? "a PUBLISHED" : "a DRAFT"} release ${tag}…`);
    gh(args);
  } finally { rmSync(notesDir, { recursive: true, force: true }); }

  // Read it back from GitHub: names and sizes of every asset, bytes of the small ones.
  const view = JSON.parse(gh(["release", "view", tag, "--repo", repo, "--json", "assets,isDraft,url"]).stdout);
  const remote = new Map(view.assets.map((a) => [a.name, a.size]));
  const diffs = [];
  for (const n of names) {
    const local = statSync(join(assetsDir, n)).size;
    if (remote.get(n) !== local) diffs.push(`${n}: GitHub has ${remote.get(n) ?? "nothing"} bytes, local ${local}`);
  }
  for (const n of remote.keys()) if (!names.includes(n)) diffs.push(`${n}: on GitHub but not in the local assets`);
  const dl = mkdtempSync(join(tmpdir(), "a1snap-dl-"));
  try {
    for (const n of ["RELEASE.json", "RELEASE-SHA256SUMS.txt", "ROOT.txt"]) {
      gh(["release", "download", tag, "--repo", repo, "--pattern", n, "--dir", dl]);
      if (hashFile(join(dl, n)) !== hashFile(join(assetsDir, n))) diffs.push(`${n}: bytes downloaded from GitHub differ from local`);
    }
  } finally { rmSync(dl, { recursive: true, force: true }); }
  if (diffs.length) throw new Fail(`the release on GitHub is not what was uploaded:\n    ${diffs.join("\n    ")}`);
  return { tag, url: view.url, isDraft: view.isDraft, assets: names.length };
}

// ═══════════════════════════════ SELF-TEST ═══════════════════════════════

async function selfTest() {
  let pass = 0, fail = 0;
  const ok = (name, cond, detail = "") => { if (cond) { pass += 1; console.log(`  ✓ ${name}`); } else { fail += 1; console.log(`  ✗ ${name} ${detail}`); } };
  const throwsKind = async (fn, Kind) => { try { await fn(); return false; } catch (e) { return e instanceof Kind; } };

  console.log("limits");
  ok("default part size is below GitHub's 2 GiB asset limit", partBytes(DEFAULT_PART_MIB) < GITHUB_ASSET_LIMIT);
  ok("RED→ a part size of exactly 2 GiB is refused (the limit is exclusive)", await throwsKind(() => partBytes(2048), CannotRun));
  ok("a 2.2 GiB file at 1,900 MiB cuts into 2 parts, zero-padded so a shell glob keeps their order",
    partNames("node-data.tar", 2.2 * 1024 ** 3, partBytes(1900)).join() === "node-data.tar.part-000,node-data.tar.part-001");
  ok("an empty file still gets one part", partNames("x", 0, 10).length === 1);
  ok("RED→ 1,001 assets are refused", assetProblems(Array.from({ length: 1001 }, (_, i) => ({ name: `a${i}`, bytes: 1 }))).length === 1);
  ok("RED→ an asset of 2 GiB is refused", assetProblems([{ name: "big", bytes: GITHUB_ASSET_LIMIT }]).length === 1);
  ok("RED→ a name GitHub would rewrite is refused", assetProblems([{ name: "chain configs.tar", bytes: 1 }]).length === 1);

  console.log("ustar");
  const entries = [{ path: "chain-configs/abc/config.json", data: Buffer.from("{}\n") }, { path: "genesis.json", data: randomBytes(1300) }];
  const tarA = ustarWrite(entries);
  ok("the same files produce byte-identical archives in any input order", sha256(tarA) === sha256(ustarWrite([...entries].reverse())));
  const back = ustarRead(tarA);
  ok("read back: same paths and bytes", back.length === 2 && back[1].path === "genesis.json" && back[1].data.equals(entries[1].data));
  const sysTar = spawnSync("tar", ["-tf", "-"], { input: tarA, encoding: "utf8" });
  ok("a standard `tar` lists the archive (a stranger does not need our reader)", sysTar.status === 0 && sysTar.stdout.includes("chain-configs/abc/config.json"), sysTar.stderr);
  const evil = ustarWrite([{ path: "ok.json", data: Buffer.from("1") }]);
  evil.write("../escape.json\0", 0, "utf8");
  let sum = 0; evil.write("        ", 148, "ascii"); for (let i = 0; i < 512; i += 1) sum += evil[i];
  evil.write(sum.toString(8).padStart(6, "0") + "\0 ", 148, "ascii");
  ok("RED→ a `..` path is refused even with a valid checksum (downloaded input)", await throwsKind(() => ustarRead(evil), Fail));
  const flipped = Buffer.from(tarA); flipped[10] ^= 1;
  ok("RED→ a flipped header byte fails the checksum", await throwsKind(() => ustarRead(flipped), Fail));
  ok("RED→ a truncated archive is refused", await throwsKind(() => ustarRead(tarA.subarray(0, 700)), Fail));

  console.log("pack → join round trip, with a part size that forces 4 parts");
  const base = mkdtempSync(join(tmpdir(), "a1snap-release-selftest-"));
  try {
    const bundle = join(base, "bundle");
    mkdirSync(join(bundle, "chain-configs", "abc"), { recursive: true });
    writeFileSync(join(bundle, "genesis.json"), '{"networkID":899999998}\n');
    writeFileSync(join(bundle, "chain-configs", "abc", "config.json"), "{}\n");
    writeFileSync(join(bundle, "snapshot.json"), JSON.stringify({ network: { networkId: 899999998 }, createdAt: "2026-09-15T00:00:00.000Z" }) + "\n");
    writeFileSync(join(bundle, "node-data.tar"), randomBytes(3.5 * 1024 * 1024));
    const { root } = await seal(bundle, "self-test");
    const assets = join(base, "assets");
    const packed = await pack(bundle, assets, 1024 * 1024);
    ok("3.5 MiB at 1 MiB parts → 4 parts", packed.release.reassemble[0].parts.length === 4);
    const joined = await joinRelease(assets, join(base, "back1"), root);
    ok("the rejoined bundle verifies against the ORIGINAL root", joined.problems.length === 0, joined.problems.join("; "));
    const assets2 = join(base, "assets2");
    await pack(bundle, assets2, 1024 * 1024);
    ok("packing the same bundle twice gives identical asset checksums", readFileSync(join(assets, "RELEASE-SHA256SUMS.txt"), "utf8") === readFileSync(join(assets2, "RELEASE-SHA256SUMS.txt"), "utf8"));

    const p2 = join(assets, "node-data.tar.part-002");
    const good = readFileSync(p2);
    rmSync(p2);
    ok("RED→ a missing part is named", (await joinRelease(assets, join(base, "back2")).catch((e) => e)).message?.includes("missing asset: node-data.tar.part-002"));
    const bad = Buffer.from(good); bad[5] ^= 1; writeFileSync(p2, bad);
    ok("RED→ a corrupt part is named", (await joinRelease(assets, join(base, "back3")).catch((e) => e)).message?.includes("asset bytes changed: node-data.tar.part-002"));

    // An attacker who swaps a part AND regenerates every asset checksum: only the root can say no.
    writeFileSync(p2, bad);
    const rel = JSON.parse(readFileSync(join(assets, "RELEASE.json"), "utf8"));
    const parts = rel.reassemble[0].parts;
    parts[2].sha256 = sha256(bad);
    const wh = createHash("sha256"); for (const p of parts) wh.update(readFileSync(join(assets, p.name)));
    rel.reassemble[0].sha256 = wh.digest("hex");
    writeFileSync(join(assets, "RELEASE.json"), JSON.stringify(rel, null, 2) + "\n");
    writeFileSync(join(assets, "RELEASE-SHA256SUMS.txt"), readdirSync(assets).filter((n) => n !== "RELEASE-SHA256SUMS.txt").sort().map((n) => `${hashFile(join(assets, n))}  ${n}`).join("\n") + "\n");
    const forged = await joinRelease(assets, join(base, "back4"), root).catch((e) => e);
    ok("RED→ a part swapped with ALL release checksums regenerated is still caught — by the bundle's own sums", forged instanceof Fail && forged.message.includes("bundle's own SHA256SUMS.txt"), forged.message);
    writeFileSync(p2, good);

    const reordered = JSON.parse(readFileSync(join(assets2, "RELEASE.json"), "utf8"));
    [reordered.reassemble[0].parts[1], reordered.reassemble[0].parts[2]] = [reordered.reassemble[0].parts[2], reordered.reassemble[0].parts[1]];
    writeFileSync(join(assets2, "RELEASE.json"), JSON.stringify(reordered, null, 2) + "\n");
    writeFileSync(join(assets2, "RELEASE-SHA256SUMS.txt"), readdirSync(assets2).filter((n) => n !== "RELEASE-SHA256SUMS.txt").sort().map((n) => `${hashFile(join(assets2, n))}  ${n}`).join("\n") + "\n");
    ok("RED→ parts listed out of order are refused before any byte is written", (await joinRelease(assets2, join(base, "back5")).catch((e) => e)).message?.includes("contiguous sequence"));

    // A COMPLETE forgery: different data, re-sealed bundle, freshly packed release. Every checksum
    // inside the release agrees with every other one. Only the root published elsewhere says no.
    const fake = join(base, "fake-bundle");
    mkdirSync(join(fake, "chain-configs", "abc"), { recursive: true });
    for (const f of ["genesis.json", "snapshot.json", "chain-configs/abc/config.json"]) writeFileSync(join(fake, ...f.split("/")), readFileSync(join(bundle, ...f.split("/"))));
    writeFileSync(join(fake, "node-data.tar"), randomBytes(3.5 * 1024 * 1024));
    await seal(fake, "forged");
    await pack(fake, join(base, "assets-fake"), 1024 * 1024);
    const selfConsistent = await joinRelease(join(base, "assets-fake"), join(base, "back6"));
    ok("a complete forgery rejoins cleanly WITHOUT --root (that is exactly why --root exists)", selfConsistent.problems.length === 0);
    const withRoot = await joinRelease(join(base, "assets-fake"), join(base, "back7"), root);
    ok("RED→ …and the published root rejects it", withRoot.problems.some((p) => p.startsWith("published root")), withRoot.problems.join("; "));

    writeFileSync(join(bundle, "genesis.json"), '{"networkID":1}\n');
    ok("RED→ a bundle edited after sealing is refused at pack time", await throwsKind(() => pack(bundle, join(base, "assets3"), 1024 * 1024), Fail));
  } finally { rmSync(base, { recursive: true, force: true }); }

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
    else if (positionals[0] === "pack") {
      if (!positionals[1] || !flag("--out")) throw new CannotRun("pack needs <bundle> --out <assets dir>");
      const r = await pack(hostPath(positionals[1]), hostPath(flag("--out")), partBytes(flag("--part-size") ?? DEFAULT_PART_MIB));
      console.log(`✅ ${r.assets} assets · ${r.release.reassemble.map((x) => `${x.file} → ${x.parts.length} part(s)`).join(" · ")} · bundle root ${r.root}`);
    } else if (positionals[0] === "join") {
      if (!positionals[1] || !flag("--out")) throw new CannotRun("join needs <assets dir> --out <bundle dir>");
      const root = flag("--root");
      const { problems, root: got } = await joinRelease(hostPath(positionals[1]), hostPath(flag("--out")), root);
      if (problems.length) throw new Fail(`rejoined bundle does not verify:\n    ${problems.join("\n    ")}`);
      console.log(`✅ rejoined · root ${got}${root ? " · equals the published root" : "\n⚠️ no --root: the bundle agrees with ITSELF, not necessarily with the published one"}`);
    } else if (positionals[0] === "upload") {
      if (!positionals[1] || !flag("--repo")) throw new CannotRun("upload needs <assets dir> --repo <owner/name>");
      const r = await upload(hostPath(positionals[1]), flag("--repo"), flag("--tag"), argv.includes("--publish"));
      console.log(`✅ ${r.isDraft ? "DRAFT" : "PUBLISHED"} release ${r.tag} · ${r.assets} assets read back from GitHub and matched · ${r.url}`);
    } else throw new CannotRun("usage: chain-snapshot-release.mjs pack <bundle> --out <dir> | join <dir> --out <dir> [--root <hex>] | upload <dir> --repo <owner/name> | --self-test");
  } catch (e) {
    if (e instanceof Fail) { console.error(`\n🔴 FAIL — ${e.message}`); process.exitCode = 1; }
    else { console.error(`\n⚠️ COULD NOT RUN (exit 2, not a verdict) — ${e instanceof CannotRun ? e.message : e.stack}`); process.exitCode = EXIT_CANNOT_RUN; }
  }
}
