#!/usr/bin/env node
/**
 * chain-snapshot.mjs — a RESTORABLE, publishable snapshot of one node's chain data, meant to be
 * produced every day and mirrored by anyone in the community.
 *
 * ═══ WHY IT EXISTS ═══
 *
 * Before this file the repo had two things called "backup", and neither restores a blockchain:
 *
 *   scripts/h6b-backup.sh     source code, patch series, git bundle — zero bytes of chain data
 *   scripts/export-chain.mjs  blocks exported over RPC — EVIDENCE, and its own header says it
 *                             cannot rebuild a node
 *
 * The goal here is narrower and harder: a stranger holding one day's bundle can bring up a node
 * that holds EXACTLY the chain state of that day — P, X, C and every tracked L1 — and prove the
 * bytes are the ones that were published.
 *
 * ═══ WHAT A BUNDLE CAN AND CANNOT DO — say this before anything else ═══
 *
 *   A. read and verify history as of the snapshot       YES
 *   B. run a node that starts from the snapshot height  YES (it then catches up from live peers)
 *   C. make the chain produce blocks again after every  NO  — that needs validator identities
 *      validator is gone                                    (staker.key / signer.key) holding enough
 *                                                           stake, and those must NEVER be public.
 *
 * ═══ 🔴 THREE THINGS MEASURED BEFORE THIS FILE WAS WRITTEN (drill band, 2026-09-15) ═══
 *
 * 1. A restored data directory booted with no network NEVER finishes bootstrapping. The P-Chain
 *    loops on "bootstrapping skipped: no provided bootstraps" and every API call answers "chain is
 *    not done bootstrapping" — while the log shows the DB loaded fine (lastAcceptedHeight 23101…).
 *    "Boot it and ask" is therefore not a restore drill on its own. With
 *    `--sybil-protection-enabled=false` the same bytes bootstrap in seconds and serve the heights
 *    the log printed. The drill uses that mode, on `--network none`, and nothing else ever should.
 *
 * 2. The restored node GENERATED its own `staking/staker.key` inside the data directory. So a data
 *    directory that already contains `staking/` hands its node identity to every person who
 *    restores it. The pack step refuses identity-shaped files anywhere in what it copies, and it
 *    copies an ALLOWLIST (`db/`, `chainData/`), never "the data dir minus a few things".
 *
 * 3. 🔴 With sybil protection OFF the node creates EVERY chain on the P-Chain, tracked or not
 *    (`vms/platformvm/config/internal.go:98` — the track-subnets filter only applies when sybil
 *    protection is on). The first probe saw chains boot from empty DBs ("Upgrade blockchain database
 *    version from=<nil>") and this header first blamed the COPY for it; measuring which subnets
 *    those chains belonged to showed all six were untracked. Two consequences, both handled:
 *      - tips are read ONLY for primary + tracked chains; the empty untracked ones are counted and
 *        recorded (`untrackedChainsStartedEmpty`), never compared;
 *      - the drill's cost grows with the number of chains ON THE NETWORK, not in the bundle — one
 *        plugin process each. The drill records its own memory so that cost is a number in every
 *        bundle, not a surprise at a thousand ledgers.
 *    Separately, a TRACKED chain whose data directory is absent from the bundle is still "uncovered"
 *    (e.g. a subnet added to the track list after the node last synced); `create` refuses to seal
 *    such a bundle unless told `--allow-uncovered`.
 *
 * ═══ WHERE EACH NUMBER IS MEASURED (CLAUDE.md section 2) ═══
 *
 * | Quantity                          | Measured on                                             |
 * |-----------------------------------|---------------------------------------------------------|
 * | node flags, image, data layout    | `docker inspect` of the SOURCE container (not a copy)   |
 * | data file hashes                  | inside the source volume, before tar                    |
 * | tips (heights, block hashes)      | a node RESTORED FROM THE BUNDLE, not the source node    |
 * | "these tips are the real chain"   | `--reference-rpc`: the same heights on a live node      |
 * | "the bundle was not altered"      | `verify --root <published hex>`: a value kept OUTSIDE   |
 *
 * 🔴 The tips come from the restored node on purpose. Reading them from the source node before it
 * stops measures a node that may accept one more block before it halts; reading them from the
 * bundle measures what a stranger will actually get.
 *
 * 🔴 `verify` without `--root` only proves the bundle agrees WITH ITSELF (D-112): whoever rewrites
 * a file can rewrite SHA256SUMS.txt and ROOT.txt too. The root must be published somewhere the
 * bundle's host cannot edit, and checked from there.
 *
 * ═══ USAGE ═══
 *
 *   node scripts/chain-snapshot.mjs create --container <node> --out <dir>
 *        [--stop-start] [--stop-timeout <s>] [--boot-timeout <s>] [--include-image]
 *        [--allow-uncovered] [--reference-rpc <url>]...
 *   node scripts/chain-snapshot.mjs verify <dir> [--root <hex>] [--drill] [--image <ref>]
 *        [--boot-timeout <s>] [--reference-rpc <url>]...
 *   node scripts/chain-snapshot.mjs --self-test
 *
 * `create` refuses a RUNNING container unless `--stop-start` is given: a copy of a live LevelDB is
 * not a snapshot. With `--stop-start` it stops the node (`docker stop -t <stop-timeout>`), copies,
 * and starts it again BEFORE the drill, so downtime is the copy only.
 *
 * Exit codes (repo convention): 0 PASS · 1 FAIL (the bundle is wrong) · 2 COULD NOT RUN.
 */
import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, posix, relative, resolve, sep } from "node:path";
import { EXIT_CANNOT_RUN, guardEntry, isEntryModule } from "../local-net/lib/cli.mjs";
import { fetchWithDeadline } from "../local-net/lib/http.mjs";
import { findKeyMaterial, MAX_SCAN_BYTES } from "../local-net/lib/key-material.mjs";

const FLAG_SPEC = {
  "--self-test": false,
  "--container": true,
  "--out": true,
  "--stop-start": false,
  "--stop-timeout": true,
  "--boot-timeout": true,
  "--include-image": false,
  "--allow-uncovered": false,
  "--reference-rpc": true,
  "--root": true,
  "--drill": false,
  "--image": true,
};

export const SCHEMA = 1;
export const KIND = "9chain-a1-chain-snapshot";
const SUMS = "SHA256SUMS.txt";
const ROOT_FILE = "ROOT.txt";
const DATA_TAR = "node-data.tar";
const DATA_SUMS = "node-data.files.sha256";
const PRIMARY_SUBNET = "11111111111111111111111111111111LpoYY";

/** A refusal that is not a verdict: exit 2. */
export class CannotRun extends Error {}
/** The bundle, or what it restores to, is wrong: exit 1. */
export class Fail extends Error {}

// ═══════════════════════════════ PURE PARTS (self-tested) ═══════════════════════════════

/**
 * avalanchego flags that change which bytes exist or what they mean. Everything else on the source
 * command line (ports, hosts, log level, staking file paths) is deliberately NOT carried into the
 * bundle: it is either the operator's business or, for `*-content` flags, a secret.
 */
const CARRIED_FLAGS = ["network-id", "track-subnets", "partial-sync-primary-network"];

/** Flags whose value this tool cannot see, so it cannot know the node's real layout. */
const OPAQUE_FLAGS = ["config-file", "config-file-content", "genesis-file-content", "chain-config-content", "subnet-config-content"];

/**
 * Reads the flags avalanchego will actually use from `docker inspect` output.
 * Precedence is avalanchego's: command-line flag, then `AVAGO_<NAME>` environment variable.
 */
export function readNodeConfig(inspect, imageWorkingDir = "") {
  const cfg = inspect?.Config ?? {};
  const argv = [...(cfg.Entrypoint ?? []), ...(cfg.Cmd ?? [])];
  const flags = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const eq = token.indexOf("=");
    if (eq !== -1) { flags.set(token.slice(2, eq), token.slice(eq + 1)); continue; }
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith("--")) { flags.set(token.slice(2), next); i += 1; }
    else flags.set(token.slice(2), "true");
  }
  const env = new Map();
  for (const line of cfg.Env ?? []) {
    const eq = line.indexOf("=");
    if (eq > 0) env.set(line.slice(0, eq), line.slice(eq + 1));
  }
  const get = (name) => flags.has(name) ? flags.get(name) : env.get(`AVAGO_${name.toUpperCase().replace(/-/g, "_")}`);

  for (const name of OPAQUE_FLAGS) {
    if (get(name) !== undefined) throw new CannotRun(`source node uses --${name}; its real layout is not visible to this tool`);
  }
  if (cfg.User && !["root", "0", "0:0"].includes(cfg.User)) {
    throw new CannotRun(`source container runs as user "${cfg.User}"; the default data dir cannot be derived`);
  }
  const networkId = get("network-id");
  if (!networkId || !/^\d+$/.test(networkId)) {
    throw new CannotRun("source node has no numeric --network-id; a default would silently mean mainnet");
  }
  const genesisFile = get("genesis-file");
  if (!genesisFile) throw new CannotRun("source node has no --genesis-file; a custom network cannot be restored without it");

  const dataDir = get("data-dir") ?? "/root/.avalanchego";
  const dbDir = get("db-dir") ?? `${dataDir}/db`;
  const chainDataDir = get("chain-data-dir") ?? `${dataDir}/chainData`;
  if (posix.basename(dbDir) !== "db" || posix.basename(chainDataDir) !== "chainData") {
    throw new CannotRun(`unsupported layout: db-dir ${dbDir} / chain-data-dir ${chainDataDir} (basenames must be db / chainData)`);
  }

  const program = argv.find((t) => !t.startsWith("--"));
  if (!program) throw new CannotRun("cannot find the node binary on the source command line");
  const binaryPath = program.startsWith("/") ? posix.normalize(program) : posix.normalize(posix.join(imageWorkingDir || "/", program));

  const carried = {};
  for (const name of CARRIED_FLAGS) if (get(name) !== undefined) carried[name] = get(name);

  return {
    networkId: Number(networkId),
    trackSubnets: (get("track-subnets") ?? "").split(",").map((s) => s.trim()).filter(Boolean).sort(),
    partialSyncPrimaryNetwork: get("partial-sync-primary-network") === "true",
    genesisFile,
    dataDir,
    dbDir,
    chainDataDir,
    chainConfigDir: get("chain-config-dir") ?? `${dataDir}/configs/chains`,
    subnetConfigDir: get("subnet-config-dir") ?? `${dataDir}/configs/subnets`,
    pluginDir: get("plugin-dir") ?? `${dataDir}/plugins`,
    binaryPath,
    carriedFlags: carried,
  };
}

/**
 * Which chain-config files go into a bundle. ALLOWLIST: `<chain>/config.json` and
 * `<chain>/upgrade.json`, nothing else. A config directory on a real host also holds console state,
 * journals and binaries; and a stray `upgrade.json.prev-*` beside the real one stops a node from
 * booting at all (D-195). Everything left out is reported, never dropped silently.
 */
export function selectChainConfigFiles(relativePaths) {
  const included = [];
  const excluded = [];
  for (const raw of relativePaths) {
    const p = raw.split("\\").join("/").replace(/^\.\//, "");
    const parts = p.split("/");
    if (parts.length === 2 && ["config.json", "upgrade.json"].includes(parts[1]) && parts[0] && !parts[0].startsWith(".")) included.push(p);
    else excluded.push(p);
  }
  return { included: included.sort(), excluded: excluded.sort() };
}

/**
 * Lines of one `--- <name>` section of the pack container's output, up to the next `--- ` marker.
 * Line-based on purpose: the first version split on "\n--- ", so an EMPTY section swallowed the
 * following marker and `--- end` was copied as a file name (measured, 2026-09-15).
 */
export function readSection(output, name) {
  const lines = String(output).split("\n");
  const start = lines.indexOf(`--- ${name}`);
  if (start === -1) return [];
  const out = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("--- ")) break;
    const clean = line.replace(/^\.\//, "").trim();
    if (clean) out.push(clean);
  }
  return out;
}

/** Paths in the data that look like node identity. Any hit refuses the pack. */
export function identityShapedPaths(relativePaths) {
  return relativePaths.filter((p) => {
    const parts = p.split("/");
    const base = parts[parts.length - 1];
    return parts.includes("staking") || /\.(key|crt|pem)$/i.test(base);
  });
}

/** Key material in a TEXT file (genesis, chain configs). Never run on the LevelDB bytes. */
export function textLeaks(text) {
  const hits = findKeyMaterial(text);
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text)) hits.push("PEM private key block");
  return hits;
}

/** Parses a `sha256sum`-format file into [{hash, path}]. Throws on a malformed line. */
export function parseSums(text) {
  return text.split("\n").filter((l) => l.trim()).map((line) => {
    const m = line.match(/^([0-9a-f]{64}) [ *](.+)$/);
    if (!m) throw new Fail(`malformed checksum line: ${line.slice(0, 80)}`);
    return { hash: m[1], path: m[2] };
  });
}

/** The chain data directories a per-file data manifest proves are in the bundle. */
export function coveredChainDirs(dataSumsText) {
  const dirs = new Set();
  for (const { path } of parseSums(dataSumsText)) {
    const m = path.match(/^chainData\/([^/]+)\//);
    if (m) dirs.add(m[1]);
  }
  return dirs;
}

/**
 * A tracked chain is UNCOVERED when the bundle holds no data directory for it. Height alone cannot
 * decide it: a chain that genuinely never left genesis also sits at height 0, and it is covered.
 * Primary-network chains (P, X, C) live in `db/` and are always covered when `db/` is.
 */
export function uncoveredChains(chains, coveredDirs) {
  return chains.filter((c) => c.subnetId !== PRIMARY_SUBNET && !coveredDirs.has(c.blockchainId)).map((c) => c.blockchainId);
}

/** The fields that define a tip. Anything else in tips.json (timestamps, versions) may differ. */
function tipKey(chain) {
  return JSON.stringify([chain.height, chain.blockSha256 ?? null, chain.hash ?? null, chain.stateRoot ?? null]);
}

/** Differences between two tip sets, keyed by blockchainId. Empty array = identical. */
export function compareTips(expected, actual) {
  const diffs = [];
  const byId = new Map(actual.map((c) => [c.blockchainId, c]));
  for (const want of expected) {
    const got = byId.get(want.blockchainId);
    if (!got) { diffs.push(`${label(want)}: missing after restore`); continue; }
    if (tipKey(want) !== tipKey(got)) diffs.push(`${label(want)}: expected ${tipKey(want)} got ${tipKey(got)}`);
    byId.delete(want.blockchainId);
  }
  for (const extra of byId.values()) diffs.push(`${label(extra)}: present after restore but not in tips.json`);
  return diffs;
}

function label(chain) {
  return chain.alias ? `${chain.alias}-Chain` : `${chain.name ?? "chain"} (${chain.blockchainId})`;
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

// ═══════════════════════════════ JSON-RPC ═══════════════════════════════

/** A JSON-RPC caller. `transport(path, body) -> text` so the same code runs via docker exec or HTTP. */
function rpcClient(transport) {
  return async (path, method, params = {}) => {
    const body = JSON.stringify({ jsonrpc: "2.0", id: 1, method, params });
    const text = await transport(path, body);
    let json;
    try { json = JSON.parse(text); } catch { throw new Error(`${method}: not JSON: ${String(text).trim().slice(0, 120)}`); }
    if (json.error) throw new Error(`${method}: ${json.error.message ?? JSON.stringify(json.error)}`);
    return json.result;
  };
}

function httpTransport(baseUrl) {
  const base = baseUrl.replace(/\/+$/, "");
  return async (path, body) => {
    const res = await fetchWithDeadline(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body }, 15_000);
    return res.text();
  };
}

/**
 * Reads every tip a node serves. Hash choice per VM, so two nodes can be compared byte for byte:
 * P and X — sha256 of the block's raw hex bytes (no reliance on a JSON field a version may rename);
 * EVM chains — block hash plus state root (the state root certifies the balances at that block).
 */
export async function readTips(rpc, trackSubnets) {
  const tips = [];
  for (const alias of ["P", "X", "C"]) {
    const { blockchainID } = await rpc("/ext/info", "info.getBlockchainID", { alias });
    tips.push({ alias, blockchainId: blockchainID, subnetId: PRIMARY_SUBNET });
  }
  const p = tips[0], x = tips[1], c = tips[2];

  p.kind = "platform";
  p.height = Number((await rpc("/ext/bc/P", "platform.getHeight")).height);
  p.blockSha256 = sha256(Buffer.from(stripHex((await rpc("/ext/bc/P", "platform.getBlockByHeight", { height: p.height, encoding: "hex" })).block), "hex"));

  x.kind = "avm";
  x.height = Number((await rpc("/ext/bc/X", "avm.getHeight")).height);
  x.blockSha256 = sha256(Buffer.from(stripHex((await rpc("/ext/bc/X", "avm.getBlockByHeight", { height: x.height, encoding: "hex" })).block), "hex"));

  Object.assign(c, { kind: "evm", ...(await evmTip(rpc, "/ext/bc/C/rpc")) });

  const { blockchains } = await rpc("/ext/bc/P", "platform.getBlockchains");
  const tracked = new Set(trackSubnets);
  for (const chain of blockchains.filter((b) => tracked.has(b.subnetID)).sort((a, b) => a.id.localeCompare(b.id))) {
    const entry = { blockchainId: chain.id, name: chain.name, subnetId: chain.subnetID, vmId: chain.vmID };
    try { Object.assign(entry, { kind: "evm", ...(await evmTip(rpc, `/ext/bc/${chain.id}/rpc`)) }); }
    catch (e) { Object.assign(entry, { kind: "unreadable", error: e.message }); }
    tips.push(entry);
  }
  return tips;
}

function stripHex(s) { return String(s).replace(/^0x/, ""); }

async function evmTip(rpc, path) {
  const chainId = parseInt(await rpc(path, "eth_chainId", []), 16);
  const block = await rpc(path, "eth_getBlockByNumber", ["latest", false]);
  return { chainId, height: parseInt(block.number, 16), hash: block.hash, stateRoot: block.stateRoot };
}

/**
 * Asks a LIVE node for the block at each snapshot height. Per chain: match · MISMATCH · behind
 * (reference has not reached that height) · not-served. Only a MISMATCH is a failure; a reference
 * that confirms nothing at all is inconclusive, never a pass.
 */
export async function compareWithReference(tips, rpc) {
  const rows = [];
  for (const t of tips) {
    const row = { chain: label(t), status: "not-served", detail: "" };
    try {
      if (t.kind === "platform" || t.kind === "avm") {
        const [heightMethod, blockMethod, path] = t.kind === "platform"
          ? ["platform.getHeight", "platform.getBlockByHeight", "/ext/bc/P"]
          : ["avm.getHeight", "avm.getBlockByHeight", "/ext/bc/X"];
        const refHeight = Number((await rpc(path, heightMethod)).height);
        if (refHeight < t.height) Object.assign(row, { status: "behind", detail: `reference at ${refHeight} < ${t.height}` });
        else {
          const got = sha256(Buffer.from(stripHex((await rpc(path, blockMethod, { height: t.height, encoding: "hex" })).block), "hex"));
          Object.assign(row, got === t.blockSha256 ? { status: "match" } : { status: "MISMATCH", detail: `block ${t.height}: ${got} ≠ ${t.blockSha256}` });
        }
      } else if (t.kind === "evm") {
        const path = t.alias === "C" ? "/ext/bc/C/rpc" : `/ext/bc/${t.blockchainId}/rpc`;
        const block = await rpc(path, "eth_getBlockByNumber", ["0x" + t.height.toString(16), false]);
        if (!block) Object.assign(row, { status: "behind", detail: `reference has no block ${t.height}` });
        else if (block.hash === t.hash && block.stateRoot === t.stateRoot) row.status = "match";
        else Object.assign(row, { status: "MISMATCH", detail: `block ${t.height}: ${block.hash} ≠ ${t.hash}` });
      } else row.detail = "chain was unreadable in the snapshot";
    } catch (e) { row.detail = e.message; }
    rows.push(row);
  }
  const count = (s) => rows.filter((r) => r.status === s).length;
  return { rows, matches: count("match"), mismatches: count("MISMATCH"), unchecked: rows.length - count("match") - count("MISMATCH") };
}

// ═══════════════════════════════ SEAL / VERIFY (files only) ═══════════════════════════════

function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(relative(dir, full).split(sep).join("/"));
    }
  };
  walk(dir);
  return out.sort();
}

function hashFile(path) {
  return new Promise((ok, fail) => {
    const h = createHash("sha256");
    createReadStream(path).on("data", (d) => h.update(d)).on("end", () => ok(h.digest("hex"))).on("error", fail);
  });
}

/** Writes SHA256SUMS.txt over every file and ROOT.txt over SHA256SUMS.txt. LF only (Windows host). */
export async function seal(dir, summary) {
  const files = listFiles(dir).filter((f) => f !== SUMS && f !== ROOT_FILE);
  const lines = [];
  let bytes = 0;
  for (const f of files) {
    lines.push(`${await hashFile(join(dir, f))}  ${f}`);
    bytes += statSync(join(dir, f)).size;
  }
  const sums = Buffer.from(lines.join("\n") + "\n", "utf8");
  writeFileSync(join(dir, SUMS), sums);
  const root = sha256(sums);
  writeFileSync(join(dir, ROOT_FILE), `${root}  ${SUMS}\n# ${files.length} files · ${bytes} bytes · ${summary}\n`);
  return { root, files: files.length, bytes };
}

/**
 * Checks a bundle's files. Returns a list of problems (empty = consistent). `publishedRoot` is the
 * value kept OUTSIDE the bundle; without it the result only means "consistent with itself".
 */
export async function verifyFiles(dir, publishedRoot) {
  const problems = [];
  if (!existsSync(join(dir, SUMS)) || !existsSync(join(dir, ROOT_FILE))) throw new CannotRun(`${dir} has no ${SUMS} / ${ROOT_FILE} — not a sealed bundle`);
  const sumsBytes = readFileSync(join(dir, SUMS));
  const entries = parseSums(sumsBytes.toString("utf8"));
  const listed = new Set(entries.map((e) => e.path));
  for (const { hash, path } of entries) {
    const full = join(dir, ...path.split("/"));
    if (!existsSync(full)) { problems.push(`missing file: ${path}`); continue; }
    if ((await hashFile(full)) !== hash) problems.push(`bytes changed: ${path}`);
  }
  for (const f of listFiles(dir)) {
    if (f !== SUMS && f !== ROOT_FILE && !listed.has(f)) problems.push(`file not listed in ${SUMS}: ${f}`);
  }
  const actualRoot = sha256(sumsBytes);
  const claimedRoot = readFileSync(join(dir, ROOT_FILE), "utf8").match(/[0-9a-f]{64}/)?.[0];
  if (claimedRoot !== actualRoot) problems.push(`${ROOT_FILE} says ${claimedRoot}, ${SUMS} hashes to ${actualRoot}`);
  if (publishedRoot && publishedRoot.toLowerCase() !== actualRoot) problems.push(`published root ${publishedRoot} ≠ bundle root ${actualRoot}`);
  return { problems, root: actualRoot };
}

// ═══════════════════════════════ DOCKER ═══════════════════════════════

function docker(args, { allowFail = false, input } = {}) {
  const r = spawnSync("docker", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, input });
  if (r.error) throw new CannotRun(`docker not runnable: ${r.error.message}`);
  if (r.status !== 0 && !allowFail) throw new CannotRun(`docker ${args.slice(0, 3).join(" ")} … exited ${r.status}: ${(r.stderr || r.stdout).trim().slice(-600)}`);
  return r;
}

const shq = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;
const bind = (source, target, ro = true) => ["--mount", `type=bind,source=${resolve(source)},target=${target}${ro ? ",readonly" : ""}`];

function inspectContainer(name) {
  const r = docker(["inspect", "--type", "container", name], { allowFail: true });
  if (r.status !== 0) throw new CannotRun(`no container named ${name}`);
  return JSON.parse(r.stdout)[0];
}

function imageWorkingDir(image) {
  return docker(["image", "inspect", image, "--format", "{{.Config.WorkingDir}}"]).stdout.trim();
}

/** sha256 of the node binary and every plugin, measured INSIDE a container of `image`. */
function measureBuild(image, cfg, extraDockerArgs = []) {
  const script = `set -e; sha256sum ${shq(cfg.binaryPath)}; if [ -d ${shq(cfg.pluginDir)} ]; then for f in ${shq(cfg.pluginDir)}/*; do [ -f "$f" ] && sha256sum "$f"; done; fi; true`;
  const r = docker(["run", "--rm", ...extraDockerArgs, "--entrypoint", "sh", image, "-c", script], { allowFail: true });
  if (r.status !== 0) throw new CannotRun(`cannot hash the node binary in ${image}: ${r.stderr.trim().slice(-300)}`);
  const plugins = {};
  let binarySha256 = null;
  for (const { hash, path } of parseSums(r.stdout)) {
    if (path === cfg.binaryPath) binarySha256 = hash;
    else plugins[posix.basename(path)] = hash;
  }
  if (!binarySha256) throw new CannotRun(`binary ${cfg.binaryPath} not found in ${image}`);
  return { binarySha256, plugins };
}

// ═══════════════════════════════ PACK ═══════════════════════════════

async function pack({ container, out, stopStart, stopTimeout, includeImage }) {
  if (existsSync(out) && readdirSync(out).length) throw new CannotRun(`${out} is not empty — overwriting a bundle destroys it`);
  mkdirSync(out, { recursive: true });

  const before = inspectContainer(container);
  const image = before.Image;
  const cfg = readNodeConfig(before, imageWorkingDir(image));
  const source = { container, imageRef: before.Config.Image, imageId: image };

  let wasStopped = false;
  if (before.State.Running) {
    if (!stopStart) throw new CannotRun(`${container} is running. A copy of a live LevelDB is not a snapshot — stop it first or pass --stop-start`);
    console.log(`  stopping ${container} (docker stop -t ${stopTimeout})…`);
    source.stoppedAt = new Date().toISOString();
    docker(["stop", "-t", String(stopTimeout), container]);
    wasStopped = true;
  }
  try {
    const stopped = inspectContainer(container);
    source.exitCode = stopped.State.ExitCode;
    source.finishedAt = stopped.State.FinishedAt;
    source.cleanStop = stopped.State.ExitCode === 0;

    const env = {
      DB_DIR: cfg.dbDir, CD_DIR: cfg.chainDataDir, DATA_DIR: cfg.dataDir, GENESIS: cfg.genesisFile,
      CCD: cfg.chainConfigDir, SCD: cfg.subnetConfigDir,
    };
    // Runs in the source image with the source container's mounts, READ-ONLY. It copies an
    // allowlist; identity-shaped files inside that allowlist abort the whole pack (exit 42).
    const script = [
      "set -eu",
      'refuse(){ echo "REFUSE: $*" >&2; exit 42; }',
      '[ -d "$DB_DIR" ] || refuse "db dir $DB_DIR does not exist"',
      'roots="$DB_DIR"; [ -d "$CD_DIR" ] && roots="$roots $CD_DIR"',
      'bad=$(find $roots \\( -name staking -o -name "*.key" -o -name "*.crt" -o -name "*.pem" \\) -print | head -5)',
      '[ -z "$bad" ] || refuse "identity-shaped files inside the data: $bad"',
      'dbp=$(dirname "$DB_DIR"); cdp=$(dirname "$CD_DIR")',
      `( cd "$dbp" && find db -type f | LC_ALL=C sort | xargs -r -d '\\n' sha256sum ) > /out/${DATA_SUMS}`,
      `if [ -d "$CD_DIR" ]; then ( cd "$cdp" && find chainData -type f | LC_ALL=C sort | xargs -r -d '\\n' sha256sum ) >> /out/${DATA_SUMS}; fi`,
      `if [ -d "$CD_DIR" ]; then tar --numeric-owner -cf /out/${DATA_TAR} -C "$dbp" db -C "$cdp" chainData; else tar --numeric-owner -cf /out/${DATA_TAR} -C "$dbp" db; fi`,
      '[ -f "$GENESIS" ] || refuse "genesis file $GENESIS not found"',
      "cp \"$GENESIS\" /out/genesis.json",
      'echo "--- data-dir-top"; ls -A "$DATA_DIR" 2>/dev/null || true',
      'echo "--- chain-config-files"; if [ -d "$CCD" ]; then ( cd "$CCD" && find . -type f | LC_ALL=C sort ); fi',
      'echo "--- subnet-config-files"; if [ -d "$SCD" ]; then ( cd "$SCD" && find . -maxdepth 1 -type f -name "*.json" | LC_ALL=C sort ); fi',
      'echo "--- end"',
    ].join("\n");
    const envArgs = Object.entries(env).flatMap(([k, v]) => ["-e", `${k}=${v}`]);
    const r = docker(["run", "--rm", "--volumes-from", `${container}:ro`, ...bind(out, "/out", false), ...envArgs, "--entrypoint", "sh", image, "-c", script], { allowFail: true });
    if (r.status === 42) throw new Fail(r.stderr.trim());
    if (r.status !== 0) throw new CannotRun(`pack container exited ${r.status}: ${r.stderr.trim().slice(-600)}`);

    const section = (name) => readSection(r.stdout, name);
    const { included, excluded } = selectChainConfigFiles(section("chain-config-files"));
    const subnetConfigs = section("subnet-config-files");

    // Second, narrow copy of exactly the selected config files — nothing chosen by a glob.
    if (included.length || subnetConfigs.length) {
      const copy = [
        "set -eu",
        ...included.map((p) => `mkdir -p /out/chain-configs/${shq(posix.dirname(p))} && cp "$CCD"/${shq(p)} /out/chain-configs/${shq(p)}`),
        ...subnetConfigs.map((p) => `mkdir -p /out/subnet-configs && cp "$SCD"/${shq(p)} /out/subnet-configs/${shq(p)}`),
      ].join("\n");
      docker(["run", "--rm", "--volumes-from", `${container}:ro`, ...bind(out, "/out", false), "-e", `CCD=${cfg.chainConfigDir}`, "-e", `SCD=${cfg.subnetConfigDir}`, "--entrypoint", "sh", image, "-c", copy]);
    }

    const build = measureBuild(image, cfg, ["--volumes-from", `${container}:ro`]);

    if (includeImage) {
      console.log(`  saving image ${source.imageRef} (this is large)…`);
      docker(["save", "-o", join(out, "node-image.tar"), source.imageRef]);
    }

    // Text files that will be published get a key scan; the LevelDB bytes do not (arbitrary
    // transaction data may contain anything, and a gate that cries wolf gets skipped).
    const leaks = [];
    for (const f of listFiles(out).filter((f) => f.endsWith(".json"))) {
      const full = join(out, ...f.split("/"));
      if (statSync(full).size > MAX_SCAN_BYTES * 50) continue;
      for (const hit of textLeaks(readFileSync(full, "utf8"))) leaks.push(`${f}: ${hit.slice(0, 16)}…`);
    }
    if (leaks.length) throw new Fail(`key material in files that would be published:\n    ${leaks.join("\n    ")}`);

    const dataSums = readFileSync(join(out, DATA_SUMS), "utf8");
    const dataEntries = parseSums(dataSums);
    const identity = identityShapedPaths(dataEntries.map((e) => e.path));
    if (identity.length) throw new Fail(`identity-shaped files in the data manifest: ${identity.join(", ")}`);

    const snapshot = {
      schema: SCHEMA,
      kind: KIND,
      createdAt: new Date().toISOString(),
      source,
      network: { networkId: cfg.networkId, trackSubnets: cfg.trackSubnets, partialSyncPrimaryNetwork: cfg.partialSyncPrimaryNetwork },
      node: { binaryPath: cfg.binaryPath, pluginDir: cfg.pluginDir, ...build },
      data: { tar: DATA_TAR, fileManifest: DATA_SUMS, files: dataEntries.length, tarBytes: statSync(join(out, DATA_TAR)).size },
      configs: { chainConfigs: included, chainConfigsLeftOut: excluded, subnetConfigs },
      leftOutOfDataDir: section("data-dir-top").filter((n) => !["db", "chainData"].includes(n)),
      image: includeImage ? "node-image.tar" : null,
    };
    writeFileSync(join(out, "snapshot.json"), JSON.stringify(snapshot, null, 2) + "\n");
    return snapshot;
  } finally {
    if (wasStopped) {
      docker(["start", container]);
      source.restartedAt = new Date().toISOString();
      console.log(`  ${container} started again`);
    }
  }
}

// ═══════════════════════════════ DRILL ═══════════════════════════════

/**
 * Restores a bundle into a throwaway volume, boots it with NO network and sybil protection off,
 * and reads every tip twice. Always removes what it created.
 */
async function drill(dir, { image: imageOverride, bootTimeout }) {
  const snapshot = JSON.parse(readFileSync(join(dir, "snapshot.json"), "utf8"));
  if (snapshot.kind !== KIND || snapshot.schema !== SCHEMA) throw new CannotRun(`snapshot.json is not a schema ${SCHEMA} ${KIND}`);
  const image = imageOverride ?? snapshot.source.imageRef;
  if (docker(["image", "inspect", image], { allowFail: true }).status !== 0) {
    throw new CannotRun(`image ${image} is not on this machine — load node-image.tar or build it from the patch set, then pass --image`);
  }
  const cfg = { binaryPath: snapshot.node.binaryPath, pluginDir: snapshot.node.pluginDir };
  const build = measureBuild(image, cfg);
  const buildDiffs = [];
  if (build.binarySha256 !== snapshot.node.binarySha256) buildDiffs.push(`node binary ${build.binarySha256} ≠ recorded ${snapshot.node.binarySha256}`);
  for (const [vm, hash] of Object.entries(snapshot.node.plugins)) {
    if (build.plugins[vm] !== hash) buildDiffs.push(`plugin ${vm}: ${build.plugins[vm] ?? "absent"} ≠ recorded ${hash}`);
  }
  if (buildDiffs.length) throw new Fail(`image ${image} is not the binary this data was written by:\n    ${buildDiffs.join("\n    ")}`);

  const name = `a1snap-drill-${randomBytes(4).toString("hex")}`;
  docker(["volume", "create", name]);
  try {
    console.log(`  restoring ${snapshot.data.files} files into volume ${name}…`);
    const restore = [
      "set -eu",
      `cd /data && tar -xf /bundle/${DATA_TAR}`,
      `sha256sum -c --quiet /bundle/${DATA_SUMS}`,
      `want=$(wc -l < /bundle/${DATA_SUMS}); got=$(find db chainData -type f 2>/dev/null | wc -l)`,
      '[ "$want" -eq "$got" ] || { echo "file count after extract: $got, manifest lists $want" >&2; exit 43; }',
    ].join("\n");
    const r = docker(["run", "--rm", ...bind(dir, "/bundle"), "--mount", `type=volume,source=${name},target=/data`, "--entrypoint", "sh", image, "-c", restore], { allowFail: true });
    if (r.status !== 0) throw new Fail(`restored data does not match its manifest:\n    ${(r.stderr + r.stdout).trim().split("\n").slice(-8).join("\n    ")}`);

    const flags = [
      `--network-id=${snapshot.network.networkId}`,
      "--genesis-file=/a1snap/genesis.json",
      `--plugin-dir=${snapshot.node.pluginDir}`,
      "--data-dir=/root/.avalanchego",
      "--http-host=127.0.0.1",
      "--public-ip=127.0.0.1",
      "--bootstrap-ids=",
      "--bootstrap-ips=",
      "--sybil-protection-enabled=false",
      "--log-level=info",
    ];
    const mounts = [...bind(join(dir, "genesis.json"), "/a1snap/genesis.json")];
    if (existsSync(join(dir, "chain-configs"))) { flags.push("--chain-config-dir=/a1snap/chain-configs"); mounts.push(...bind(join(dir, "chain-configs"), "/a1snap/chain-configs")); }
    if (existsSync(join(dir, "subnet-configs"))) { flags.push("--subnet-config-dir=/a1snap/subnet-configs"); mounts.push(...bind(join(dir, "subnet-configs"), "/a1snap/subnet-configs")); }
    if (snapshot.network.trackSubnets.length) flags.push(`--track-subnets=${snapshot.network.trackSubnets.join(",")}`);
    if (snapshot.network.partialSyncPrimaryNetwork) flags.push("--partial-sync-primary-network=true");

    docker(["run", "-d", "--name", name, "--network", "none", "--mount", `type=volume,source=${name},target=/root/.avalanchego`, ...mounts, "--entrypoint", snapshot.node.binaryPath, image, ...flags]);

    const rpc = rpcClient(async (path, body) => {
      const x = docker(["exec", name, "curl", "-s", "-m", "10", "-H", "content-type:application/json", "--data", body, `http://127.0.0.1:9650${path}`], { allowFail: true });
      if (x.status !== 0) throw new Error(`curl exit ${x.status}`);
      return x.stdout;
    });

    const started = Date.now();
    let lastError = "";
    for (;;) {
      if (!inspectContainer(name).State.Running) {
        const logs = docker(["logs", "--tail", "15", name], { allowFail: true });
        throw new Fail(`restored node exited during boot:\n    ${(logs.stdout + logs.stderr).trim().split("\n").join("\n    ")}`);
      }
      try {
        const chains = ["P", "X", "C"];
        const { blockchains } = await rpc("/ext/bc/P", "platform.getBlockchains");
        const tracked = new Set(snapshot.network.trackSubnets);
        chains.push(...blockchains.filter((b) => tracked.has(b.subnetID)).map((b) => b.id));
        let all = true;
        for (const chain of chains) {
          if (!(await rpc("/ext/info", "info.isBootstrapped", { chain })).isBootstrapped) { all = false; lastError = `${chain} not bootstrapped`; break; }
        }
        if (all) break;
      } catch (e) { lastError = e.message; }
      if (Date.now() - started > bootTimeout * 1000) throw new Fail(`restored node not bootstrapped after ${bootTimeout}s (last: ${lastError})`);
      await new Promise((ok) => setTimeout(ok, 3000));
    }
    const bootSeconds = Math.round((Date.now() - started) / 1000);

    const first = await readTips(rpc, snapshot.network.trackSubnets);
    await new Promise((ok) => setTimeout(ok, 5000));
    const second = await readTips(rpc, snapshot.network.trackSubnets);
    const drift = compareTips(first, second);
    if (drift.length) throw new Fail(`restored node moved on its own between two reads — its tips are not the bundle's:\n    ${drift.join("\n    ")}`);

    const version = await rpc("/ext/info", "info.getNodeVersion");
    const covered = coveredChainDirs(readFileSync(join(dir, DATA_SUMS), "utf8"));
    const uncovered = uncoveredChains(first, covered);
    const { blockchains: allChains } = await rpc("/ext/bc/P", "platform.getBlockchains");
    const trackedSet = new Set(snapshot.network.trackSubnets);
    const untrackedStarted = allChains.filter((b) => b.subnetID !== PRIMARY_SUBNET && !trackedSet.has(b.subnetID)).length;
    const stats = docker(["stats", "--no-stream", "--format", "{{.MemUsage}}", name], { allowFail: true }).stdout.trim();
    return {
      tips: {
        schema: SCHEMA,
        measuredAt: new Date().toISOString(),
        measuredBy: "offline restore drill: bundle extracted into an empty volume, node booted with --network none and --sybil-protection-enabled=false, tips read twice 5 s apart",
        bootSeconds,
        drillCost: { memoryUsage: stats || null, chainsOnPChain: allChains.length, untrackedChainsStartedEmpty: untrackedStarted },
        node: { version: version.version, gitCommit: version.gitCommit, databaseVersion: version.databaseVersion },
        networkId: snapshot.network.networkId,
        chains: first.map((c) => ({ ...c, covered: !uncovered.includes(c.blockchainId) })),
        uncovered,
      },
      snapshot,
    };
  } finally {
    docker(["rm", "-f", name], { allowFail: true });
    docker(["volume", "rm", "-f", name], { allowFail: true });
  }
}

// ═══════════════════════════════ REPORTS ═══════════════════════════════

function printTips(tips) {
  for (const c of tips.chains) {
    const id = c.alias ? `${c.alias}-Chain` : `${c.name ?? "?"}`;
    const fp = c.kind === "evm" ? `${c.hash?.slice(0, 18)}… chainId ${c.chainId}` : c.blockSha256 ? `${c.blockSha256.slice(0, 16)}…` : c.error;
    console.log(`    ${c.covered ? " " : "✗"} ${id.padEnd(22)} height ${String(c.height ?? "?").padStart(8)}  ${fp}${c.covered ? "" : "  ← NO DATA IN BUNDLE"}`);
  }
}

async function runReferences(tips, urls) {
  let failed = false, confirmed = false;
  for (const url of urls) {
    const result = await compareWithReference(tips.chains, rpcClient(httpTransport(url)));
    console.log(`\n  reference ${url}: ${result.matches} match · ${result.mismatches} MISMATCH · ${result.unchecked} unchecked`);
    for (const row of result.rows.filter((r) => r.status !== "match")) console.log(`    ${row.status.padEnd(10)} ${row.chain}  ${row.detail}`);
    if (result.mismatches) failed = true;
    if (result.matches) confirmed = true;
  }
  if (failed) throw new Fail("the snapshot disagrees with a live node at the same height — it is not the chain that reference serves");
  if (!confirmed) throw new CannotRun("no reference confirmed a single chain — nothing about the live chain was measured");
}

function readFirst(snapshot, tips, allowUncovered) {
  const primary = tips.chains.filter((c) => c.alias);
  const l1 = tips.chains.filter((c) => !c.alias);
  return `# 9Chain A1 chain snapshot

Network ID **${snapshot.network.networkId}** · node \`${tips.node.version}\` · build \`${tips.node.gitCommit}\` ·
created ${snapshot.createdAt}

| Chain | Height | Fingerprint |
|---|---:|---|
${tips.chains.map((c) => `| ${c.alias ? `${c.alias}-Chain` : `${c.name} \`${c.blockchainId}\``} | ${c.height ?? "?"} | ${c.kind === "evm" ? `\`${c.hash}\`` : c.blockSha256 ? `sha256 \`${c.blockSha256}\`` : c.error}${c.covered ? "" : " 🔴 **NO DATA IN THIS BUNDLE**"} |`).join("\n")}

${primary.length} primary chains · ${l1.length} L1 chains tracked${tips.uncovered.length ? ` · 🔴 **${tips.uncovered.length} tracked chain(s) have NO data here** (sealed with --allow-uncovered: ${allowUncovered})` : ""}.

## Check it — before trusting anything in it

\`\`\`bash
sha256sum -c SHA256SUMS.txt && sha256sum SHA256SUMS.txt     # standard tools, no need to trust ours
node scripts/chain-snapshot.mjs verify <this dir> --root <ROOT PUBLISHED ELSEWHERE> --drill
\`\`\`

🔴 \`ROOT.txt\` inside this directory proves nothing on its own: whoever can change the files can change
it too. Compare against the root published by the project **outside** the place you downloaded this from.

## What it can and cannot do

- ✅ **Read and verify history** as of the heights above.
- ✅ **Start a node from these heights** instead of syncing from genesis (see below). It catches up
  from live peers afterwards.
- ❌ **It cannot make the chain produce blocks** if the network's validators are gone. That needs the
  validators' own identity keys, which are deliberately **not** here and never will be.
- ❌ No logs, no node identity (\`staking/\`), no operator secrets. Left out of the source data dir:
  ${snapshot.leftOutOfDataDir.length ? snapshot.leftOutOfDataDir.map((n) => `\`${n}\``).join(", ") : "nothing"}.
- Chain config files left out on purpose: ${snapshot.configs.chainConfigsLeftOut.length}.
- Blocks are complete; how much **historical state** a restored node can answer follows the source
  node's pruning settings (see \`chain-configs/\`).

## Run a node from it (joins the live network)

1. Build or load the node image whose binary hashes to \`${snapshot.node.binarySha256}\`
   (\`snapshot.json\` → \`node\`). A different binary is refused by \`verify --drill\`.
2. Extract \`${DATA_TAR}\` into your node's data directory (it creates \`db/\` and \`chainData/\`).
3. Put \`chain-configs/*\` into your \`--chain-config-dir\`${snapshot.configs.subnetConfigs.length ? " and `subnet-configs/*` into `--subnet-config-dir`" : ""}.
4. Start with \`--network-id=${snapshot.network.networkId}\`, \`--genesis-file=genesis.json\`, the network's normal
   bootstrap peers, and \`--track-subnets=${snapshot.network.trackSubnets.join(",") || "(none)"}\`.
   Your node generates **its own** identity. Never copy someone else's \`staking/\`.

🔴 The drill that measured the table above runs the node with \`--sybil-protection-enabled=false\` and
**no network**. That mode is for inspection only — never connect such a node to the real network.
`;
}

// ═══════════════════════════════ COMMANDS ═══════════════════════════════

function flagValue(argv, name, fallback) {
  const i = argv.indexOf(name);
  if (i !== -1) return argv[i + 1];
  const inline = argv.find((t) => t.startsWith(`${name}=`));
  return inline ? inline.slice(name.length + 1) : fallback;
}
function flagValues(argv, name) {
  const out = [];
  argv.forEach((t, i) => { if (t === name) out.push(argv[i + 1]); else if (t.startsWith(`${name}=`)) out.push(t.slice(name.length + 1)); });
  return out.filter(Boolean);
}
/**
 * 🔴 Measured 2026-09-15: from Git Bash with MSYS_NO_PATHCONV=1, Node on Windows received
 * `/c/Users/…` literally and `resolve()` turned it into `C:\c\Users\…` WITHOUT an error — two
 * bundles landed in a directory nobody would look in. A drive-less POSIX drive path is refused.
 */
export function hostPath(p, platform = process.platform) {
  if (platform === "win32" && /^\/[a-zA-Z](\/|$)/.test(p)) {
    throw new CannotRun(`${p} looks like a Git Bash path; on Windows pass it as ${p[1].toUpperCase()}:${p.slice(2) || "/"}`);
  }
  return resolve(p);
}

function positiveInt(value, name) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) throw new CannotRun(`${name} must be a positive whole number (got ${value})`);
  return n;
}

async function commandCreate(argv) {
  const container = flagValue(argv, "--container");
  const outFlag = flagValue(argv, "--out");
  if (!container || !outFlag) throw new CannotRun("create needs --container <node> and --out <dir>");
  const out = hostPath(outFlag);
  const stopTimeout = positiveInt(flagValue(argv, "--stop-timeout", "120"), "--stop-timeout");
  const bootTimeout = positiveInt(flagValue(argv, "--boot-timeout", "300"), "--boot-timeout");
  const allowUncovered = argv.includes("--allow-uncovered");
  const references = flagValues(argv, "--reference-rpc");

  console.log(`═══ chain snapshot · create · ${container} → ${out} ═══`);
  const t0 = Date.now();
  const snapshot = await pack({ container, out, stopStart: argv.includes("--stop-start"), stopTimeout, includeImage: argv.includes("--include-image") });
  console.log(`  packed ${snapshot.data.files} data files · ${(snapshot.data.tarBytes / 1048576).toFixed(1)} MiB · ${snapshot.configs.chainConfigs.length} chain config files (${snapshot.configs.chainConfigsLeftOut.length} left out) · ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (!snapshot.source.cleanStop) console.log(`  ⚠️ source exited with code ${snapshot.source.exitCode} — not a clean stop; the drill decides whether the data still opens`);

  console.log("  drill: restore into an empty volume and boot offline…");
  const { tips } = await drill(out, { bootTimeout });
  console.log(`  restored node bootstrapped in ${tips.bootSeconds} s · ${tips.node.gitCommit}`);
  console.log(`  drill cost: memory ${tips.drillCost.memoryUsage ?? "?"} · ${tips.drillCost.untrackedChainsStartedEmpty} untracked chain(s) of ${tips.drillCost.chainsOnPChain} on the P-Chain started empty (sybil-off mode starts all of them)`);
  printTips(tips);
  writeFileSync(join(out, "tips.json"), JSON.stringify(tips, null, 2) + "\n");

  if (tips.uncovered.length && !allowUncovered) {
    throw new Fail(`${tips.uncovered.length} tracked chain(s) have no data in this bundle — NOT sealed. Snapshot a node that holds them, or pass --allow-uncovered to publish a bundle that says so`);
  }
  if (references.length) await runReferences(tips, references);

  writeFileSync(join(out, "00-READ-FIRST.md"), readFirst(snapshot, tips, allowUncovered));
  const sealed = await seal(out, `network ${snapshot.network.networkId} · ${snapshot.createdAt}`);
  console.log(`\n✅ sealed ${sealed.files} files · ${(sealed.bytes / 1048576).toFixed(1)} MiB`);
  console.log(`\n  ROOT = ${sealed.root}`);
  console.log("\n🔴 Publish this root OUTSIDE the bundle (a commit, the website). Next to the data it protects, it protects nothing.");
}

async function commandVerify(argv, positionals) {
  if (!positionals[1]) throw new CannotRun("verify needs a bundle directory");
  const dir = hostPath(positionals[1]);
  const publishedRoot = flagValue(argv, "--root");
  if (publishedRoot && !/^[0-9a-fA-F]{64}$/.test(publishedRoot)) throw new CannotRun("--root must be 64 hex characters");
  console.log(`═══ chain snapshot · verify · ${dir} ═══`);
  const { problems, root } = await verifyFiles(dir, publishedRoot);
  if (problems.length) throw new Fail(`bundle files are not what was sealed:\n    ${problems.join("\n    ")}`);
  console.log(`  ✓ every file matches ${SUMS} · root ${root}`);
  if (publishedRoot) console.log("  ✓ root equals the published root");
  else console.log("  ⚠️ no --root given: this only proves the bundle agrees with ITSELF, not that it is the published one");

  const tipsRecorded = JSON.parse(readFileSync(join(dir, "tips.json"), "utf8"));
  if (argv.includes("--drill")) {
    const bootTimeout = positiveInt(flagValue(argv, "--boot-timeout", "300"), "--boot-timeout");
    const { tips } = await drill(dir, { image: flagValue(argv, "--image"), bootTimeout });
    const diffs = compareTips(tipsRecorded.chains, tips.chains);
    if (diffs.length) throw new Fail(`restored tips differ from tips.json:\n    ${diffs.join("\n    ")}`);
    console.log(`  ✓ restored again: ${tips.chains.length} chains at the recorded heights and hashes (boot ${tips.bootSeconds} s)`);
  }
  const references = flagValues(argv, "--reference-rpc");
  if (references.length) await runReferences(tipsRecorded, references);
  if (tipsRecorded.uncovered?.length) console.log(`  ⚠️ this bundle was sealed WITHOUT data for ${tipsRecorded.uncovered.length} tracked chain(s)`);
  console.log("\n✅ PASS");
}

// ═══════════════════════════════ SELF-TEST ═══════════════════════════════

async function selfTest() {
  let pass = 0, fail = 0;
  const ok = (name, cond, detail = "") => { if (cond) { pass += 1; console.log(`  ✓ ${name}`); } else { fail += 1; console.log(`  ✗ ${name} ${detail}`); } };
  const throwsKind = (fn, Kind) => { try { fn(); return false; } catch (e) { return e instanceof Kind; } };

  console.log("readNodeConfig — shape copied from `docker inspect 9chain-a1-tap-node-2` (2026-09-15)");
  const inspect = {
    Config: {
      Cmd: ["./avalanchego", "--network-id=899999998", "--genesis-file=/9chain-a1/net/genesis.json", "--plugin-dir=/9chain-a1/build/plugins",
        "--chain-config-dir=/9chain-a1/config/chains", "--staking-tls-key-file=/9chain-a1/node/staker.key", "--http-host=0.0.0.0", "--bootstrap-ids="],
      Env: ["AVAGO_TRACK_SUBNETS=bbb,aaa", "PATH=/usr/bin"],
      User: "",
    },
  };
  const cfg = readNodeConfig(inspect, "/9chain-a1/build");
  ok("network id, sorted track list, binary resolved against WorkingDir",
    cfg.networkId === 899999998 && cfg.trackSubnets.join() === "aaa,bbb" && cfg.binaryPath === "/9chain-a1/build/avalanchego", JSON.stringify(cfg));
  ok("default data layout", cfg.dbDir === "/root/.avalanchego/db" && cfg.chainDataDir === "/root/.avalanchego/chainData");
  const withFlag = structuredClone(inspect); withFlag.Config.Cmd.push("--track-subnets=zzz");
  ok("a command-line flag beats the AVAGO_ env var", readNodeConfig(withFlag, "/").trackSubnets.join() === "zzz");
  const spaced = structuredClone(inspect); spaced.Config.Cmd = ["/bin/avalanchego", "--network-id", "5", "--genesis-file", "/g.json"];
  ok("`--flag value` form and absolute binary path", readNodeConfig(spaced).networkId === 5 && readNodeConfig(spaced).binaryPath === "/bin/avalanchego");
  const secret = structuredClone(inspect); secret.Config.Cmd.push("--staking-tls-key-file-content=SECRETBYTES");
  ok("RED→ a *-content secret never reaches the recorded config", !JSON.stringify(readNodeConfig(secret, "/")).includes("SECRETBYTES"));
  const opaque = structuredClone(inspect); opaque.Config.Cmd.push("--config-file=/x.json");
  ok("RED→ --config-file is refused as CANNOT RUN (layout invisible)", throwsKind(() => readNodeConfig(opaque, "/"), CannotRun));
  const noNet = structuredClone(inspect); noNet.Config.Cmd = noNet.Config.Cmd.filter((t) => !t.startsWith("--network-id"));
  ok("RED→ no --network-id is refused, never defaulted", throwsKind(() => readNodeConfig(noNet, "/"), CannotRun));
  const custom = structuredClone(inspect); custom.Config.Cmd.push("--db-dir=/data/leveldb");
  ok("RED→ an unsupported db-dir layout is refused", throwsKind(() => readNodeConfig(custom, "/"), CannotRun));

  console.log("selectChainConfigFiles — allowlist");
  const sel = selectChainConfigFiles(["abc/config.json", "abc/upgrade.json", "abc/upgrade.json.prev-20260904", "console-chains.json", "C/config.json", "x/y/config.json", ".hidden/config.json"]);
  ok("keeps <chain>/config.json and <chain>/upgrade.json only", sel.included.join() === "C/config.json,abc/config.json,abc/upgrade.json", sel.included.join());
  ok("RED→ the D-195 `.prev-` bomb, top-level console state and deeper files are left out AND reported",
    sel.excluded.includes("abc/upgrade.json.prev-20260904") && sel.excluded.includes("console-chains.json") && sel.excluded.includes("x/y/config.json"));

  console.log("readSection — the pack container's marker output");
  const packOut = "--- data-dir-top\ndb\nlogs\n--- chain-config-files\n./abc/config.json\n--- subnet-config-files\n--- end\n";
  ok("reads a section's lines without the ./ prefix", readSection(packOut, "chain-config-files").join() === "abc/config.json");
  ok("RED→ an EMPTY section is empty — the next marker is never read as a file (measured bug)", readSection(packOut, "subnet-config-files").length === 0);

  console.log("hostPath");
  ok("RED→ a Git Bash drive path on Windows is refused, not resolved to C:\\c\\… (measured)", throwsKind(() => hostPath("/c/Users/x", "win32"), CannotRun));
  ok("the same path on Linux is an ordinary absolute path", hostPath("/c/Users/x", "linux").length > 0);

  console.log("identity and key scans");
  ok("LevelDB files are not identity", identityShapedPaths(["db/9chain-a1/v1.4.5/000476.ldb", "chainData/abc/db/CURRENT"]).length === 0);
  ok("RED→ staking/staker.key and a stray signer.key are identity", identityShapedPaths(["staking/staker.key", "chainData/x/signer.key", "db/a.crt"]).length === 3);
  // Separate case on purpose: with only `.key` names above, deleting the `staking` rule stayed
  // green — the extension rule hid it. Found by sabotaging this file, 2026-09-15.
  ok("RED→ any file under a staking/ directory is identity, whatever its name", identityShapedPaths(["staking/bls-seed"]).length === 1);
  const fakeKey = "PrivateKey-" + "3".repeat(10) + "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMN";
  ok("prose mentioning PrivateKey-* is not a leak", textLeaks("rotate PrivateKey-* keys yearly").length === 0);
  ok("RED→ a cb58 key in a config is a leak", textLeaks(`{"k":"${fakeKey}"}`).length === 1);
  ok("RED→ a PEM private key block is a leak", textLeaks("-----BEGIN RSA PRIVATE KEY-----\nMII").length === 1);

  console.log("coverage");
  const sums = `${"a".repeat(64)}  db/x/CURRENT\n${"b".repeat(64)}  chainData/AAA/db/CURRENT\n`;
  const chains = [
    { blockchainId: "P", subnetId: PRIMARY_SUBNET },
    { blockchainId: "AAA", subnetId: "s1", height: 0 },
    { blockchainId: "BBB", subnetId: "s1", height: 0 },
  ];
  const unc = uncoveredChains(chains, coveredChainDirs(sums));
  ok("a chain at height 0 WITH a data dir is covered; primary chains are covered", !unc.includes("AAA") && !unc.includes("P"));
  ok("RED→ a tracked chain with no data dir is uncovered", unc.join() === "BBB");
  ok("RED→ a malformed manifest line is a failure, not a skip", throwsKind(() => parseSums("nothash  file\n"), Fail));

  console.log("compareTips");
  const tipsA = [{ alias: "P", blockchainId: "P", height: 5, blockSha256: "aa" }, { blockchainId: "L", name: "L", height: 9, hash: "0x1", stateRoot: "0x2" }];
  ok("identical tips → no differences", compareTips(tipsA, structuredClone(tipsA)).length === 0);
  const moved = structuredClone(tipsA); moved[1].stateRoot = "0x3";
  ok("RED→ a changed state root at the same height is a difference", compareTips(tipsA, moved).length === 1);
  ok("RED→ a chain gone after restore is a difference", compareTips(tipsA, [tipsA[0]]).length === 1);

  console.log("seal / verify — on a temporary bundle");
  const dir = mkdtempSync(join(tmpdir(), "a1snap-selftest-"));
  try {
    mkdirSync(join(dir, "chain-configs", "abc"), { recursive: true });
    writeFileSync(join(dir, "genesis.json"), '{"networkID":1}\n');
    writeFileSync(join(dir, "chain-configs", "abc", "config.json"), "{}\n");
    writeFileSync(join(dir, DATA_TAR), randomBytes(4096));
    const { root } = await seal(dir, "self-test");
    ok("a freshly sealed bundle verifies against its published root", (await verifyFiles(dir, root)).problems.length === 0);

    const tar = readFileSync(join(dir, DATA_TAR)); tar[100] ^= 1; writeFileSync(join(dir, DATA_TAR), tar);
    ok("RED→ one flipped bit in the data tar is caught", (await verifyFiles(dir, root)).problems.some((p) => p.includes(DATA_TAR)));

    await seal(dir, "attacker re-seals");
    ok("an attacker who re-seals makes the bundle consistent WITH ITSELF…", (await verifyFiles(dir)).problems.length === 0);
    ok("RED→ …and the published root still catches it (D-112)", (await verifyFiles(dir, root)).problems.some((p) => p.startsWith("published root")));

    const { root: root2 } = await seal(dir, "again");
    writeFileSync(join(dir, "extra.json"), "{}");
    ok("RED→ a file added after sealing is caught", (await verifyFiles(dir, root2)).problems.some((p) => p.includes("extra.json")));
    rmSync(join(dir, "extra.json"));
    rmSync(join(dir, "genesis.json"));
    ok("RED→ a file removed after sealing is caught", (await verifyFiles(dir, root2)).problems.some((p) => p.includes("missing file: genesis.json")));
  } finally { rmSync(dir, { recursive: true, force: true }); }

  console.log("compareWithReference — against a local fake JSON-RPC node");
  const pBytes = "00aa11bb", xBytes = "00cc";
  const tips = [
    { alias: "P", blockchainId: "P", kind: "platform", height: 7, blockSha256: sha256(Buffer.from(pBytes, "hex")) },
    { alias: "X", blockchainId: "X", kind: "avm", height: 1, blockSha256: sha256(Buffer.from(xBytes, "hex")) },
    { alias: "C", blockchainId: "C", kind: "evm", height: 3, hash: "0xh", stateRoot: "0xs" },
  ];
  const fake = (mode) => async (path, body) => {
    const { method } = JSON.parse(body);
    const result = {
      "platform.getHeight": { height: mode === "behind" ? "6" : "9" },
      "platform.getBlockByHeight": { block: "0x" + pBytes },
      "avm.getHeight": { height: "1" },
      "avm.getBlockByHeight": { block: "0x" + xBytes },
      "eth_getBlockByNumber": { hash: mode === "forked" ? "0xother" : "0xh", stateRoot: "0xs" },
    }[method];
    return JSON.stringify(result ? { jsonrpc: "2.0", id: 1, result } : { jsonrpc: "2.0", id: 1, error: { message: "not served" } });
  };
  const same = await compareWithReference(tips, rpcClient(fake("same")));
  ok("a live node holding the same blocks → 3 match", same.matches === 3 && same.mismatches === 0, JSON.stringify(same.rows));
  const forked = await compareWithReference(tips, rpcClient(fake("forked")));
  ok("RED→ a different C-Chain block at the same height is a MISMATCH", forked.mismatches === 1 && forked.rows[2].status === "MISMATCH");
  const behind = await compareWithReference(tips, rpcClient(fake("behind")));
  ok("a reference below the snapshot height is 'behind', not a mismatch", behind.rows[0].status === "behind" && behind.mismatches === 0);

  // One real HTTP round trip, so the transport is exercised and not only the fake.
  const server = createServer((req, res) => {
    let body = ""; req.on("data", (d) => { body += d; });
    req.on("end", async () => { res.setHeader("content-type", "application/json"); res.end(await fake("same")(req.url, body)); });
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  try {
    const http = await compareWithReference(tips, rpcClient(httpTransport(`http://127.0.0.1:${server.address().port}/`)));
    ok("the same comparison over real HTTP", http.matches === 3, JSON.stringify(http.rows));
  } finally {
    // Closed and AWAITED: on Windows, process exit while this handle is still closing aborts in
    // libuv (`UV_HANDLE_CLOSING`, exit 127) AFTER printing a green summary — a gate whose text and
    // exit code disagree. Measured on the first run of this self-test.
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
  const dead = await compareWithReference(tips, rpcClient(httpTransport("http://127.0.0.1:9")));
  ok("RED→ an unreachable reference confirms nothing (unchecked, never match)", dead.matches === 0 && dead.unchecked === 3);

  console.log(`\n${fail === 0 ? "✅" : "🔴"} self-test: ${pass} passed · ${fail} failed`);
  process.exitCode = fail === 0 ? 0 : 1;
}

// ═══════════════════════════════ ENTRY ═══════════════════════════════

const positionals = guardEntry(import.meta.url, FLAG_SPEC);
if (isEntryModule(import.meta.url)) {
  const argv = process.argv.slice(2);
  try {
    if (argv.includes("--self-test")) await selfTest();
    else if (positionals[0] === "create") await commandCreate(argv);
    else if (positionals[0] === "verify") await commandVerify(argv, positionals);
    else throw new CannotRun("usage: chain-snapshot.mjs create --container <node> --out <dir> | verify <dir> [--root <hex>] [--drill] | --self-test");
  } catch (e) {
    // exitCode, not exit(): let pending handles close so the code the shell sees is this one.
    if (e instanceof Fail) { console.error(`\n🔴 FAIL — ${e.message}`); process.exitCode = 1; }
    else if (e instanceof CannotRun) { console.error(`\n⚠️ COULD NOT RUN (exit 2, not a verdict) — ${e.message}`); process.exitCode = EXIT_CANNOT_RUN; }
    else { console.error(`\n⚠️ COULD NOT RUN (exit 2, not a verdict) — unexpected: ${e.stack ?? e}`); process.exitCode = EXIT_CANNOT_RUN; }
  }
}
