#!/usr/bin/env node
/**
 * measure-snapshot-join.mjs — does a node restored from a chain-snapshot bundle JOIN a live network
 * and catch up, and how much faster is that than a node starting from an empty data directory?
 *
 * ═══ WHY IT EXISTS ═══
 *
 * `chain-snapshot.mjs` proves a bundle restores the recorded tips OFFLINE, with sybil protection
 * off. That says nothing about the use the community actually has for a bundle: start a normal
 * node from it, connect to peers, and follow the chain. D-262 listed this as "not measured".
 *
 * ═══ WHAT IS MEASURED, AND WHERE ═══
 *
 * | Quantity                              | Measured on                                         |
 * |---------------------------------------|-----------------------------------------------------|
 * | where each chain STARTED bootstrapping | the joining node's own log (`lastAcceptedHeight`)  |
 * | seconds until every chain bootstraps   | `info.isBootstrapped` on the joining node          |
 * | lag and tip hash, while the chain moves | joining node vs `--reference-rpc`, same height     |
 *
 * The node runs with NORMAL flags: sybil protection ON, real bootstrap peers, its own freshly
 * generated identity. Nothing about the drill mode of `chain-snapshot.mjs` is used here.
 *
 * 🔴 "Caught up" is judged by BLOCK HASH at the same height, never by height alone: a node on a
 * different chain can sit at the same number.
 *
 * 🔴 `--empty` is the control, not an extra. If a bundle-restored node bootstraps in the same time
 * as an empty one, the bundle was not used — and only the pair can show that.
 *
 * Usage (drill band only — it refuses a network ID outside 899999000–899999999):
 *
 *   node scripts/measure-snapshot-join.mjs --bundle <dir> --network <docker network> --ip <free ip>
 *        --bootstrap-id NodeID-… --bootstrap-ip <ip:port> --reference-rpc http://127.0.0.1:9660
 *        --watch-chain <blockchainID> [--empty] [--timeout <s>] [--image <ref>]
 *   node scripts/measure-snapshot-join.mjs --self-test
 *
 * Exit codes: 0 caught up · 1 did not catch up / wrong chain · 2 could not run.
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { EXIT_CANNOT_RUN, guardEntry, isEntryModule } from "../local-net/lib/cli.mjs";
import { fetchWithDeadline } from "../local-net/lib/http.mjs";

const FLAG_SPEC = {
  "--self-test": false, "--bundle": true, "--network": true, "--ip": true, "--bootstrap-id": true,
  "--bootstrap-ip": true, "--reference-rpc": true, "--watch-chain": true, "--empty": false,
  "--timeout": true, "--image": true,
};
const DRILL_BAND = { lo: 899999000, hi: 899999999 };

class CannotRun extends Error {}

// ═══════════════════════════════ PURE (self-tested) ═══════════════════════════════

/**
 * One poll's verdict. Caught up means: bootstrapped, same height as the reference or AHEAD by at
 * most one block (the two reads are not simultaneous), and the same hash at the joining node's
 * height. Returns { caughtUp, lag, reason }.
 */
export function judgePoll({ bootstrapped, joinHeight, joinHash, refHeight, refHashAtJoinHeight }) {
  if (!bootstrapped) return { caughtUp: false, lag: null, reason: "not bootstrapped" };
  if (!Number.isInteger(joinHeight) || !Number.isInteger(refHeight)) return { caughtUp: false, lag: null, reason: "height unreadable" };
  const lag = refHeight - joinHeight;
  if (refHashAtJoinHeight && joinHash && refHashAtJoinHeight !== joinHash) {
    return { caughtUp: false, lag, reason: `DIFFERENT CHAIN: block ${joinHeight} ${joinHash} ≠ reference ${refHashAtJoinHeight}` };
  }
  if (!refHashAtJoinHeight) return { caughtUp: false, lag, reason: `reference has no block ${joinHeight}` };
  if (lag > 1) return { caughtUp: false, lag, reason: `behind by ${lag}` };
  return { caughtUp: true, lag, reason: "same hash at the joining node's tip" };
}

/** Starting heights per chain from avalanchego's "starting bootstrapper" log lines. */
export function bootstrapStarts(logText) {
  const starts = {};
  for (const line of String(logText).split("\n")) {
    const m = line.match(/<([^ >]+) Chain>.*starting bootstrapper.*"lastAcceptedHeight": (\d+)/);
    if (m && !(m[1] in starts)) starts[m[1]] = Number(m[2]);
  }
  return starts;
}

// ═══════════════════════════════ IO ═══════════════════════════════

function docker(args, allowFail = false) {
  const r = spawnSync("docker", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new CannotRun(`docker not runnable: ${r.error.message}`);
  if (r.status !== 0 && !allowFail) throw new CannotRun(`docker ${args.slice(0, 2).join(" ")} exited ${r.status}: ${(r.stderr || r.stdout).trim().slice(-400)}`);
  return r;
}

async function rpc(base, path, method, params = {}) {
  const res = await fetchWithDeadline(`${base}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) }, 8000);
  const j = JSON.parse(await res.text());
  if (j.error) throw new Error(`${method}: ${j.error.message}`);
  return j.result;
}

const flag = (argv, name, fallback) => { const i = argv.indexOf(name); return i === -1 ? fallback : argv[i + 1]; };

async function measure(argv) {
  const need = ["--bundle", "--network", "--ip", "--bootstrap-id", "--bootstrap-ip", "--reference-rpc", "--watch-chain"];
  for (const n of need) if (!flag(argv, n)) throw new CannotRun(`missing ${n}`);
  const bundle = resolve(flag(argv, "--bundle"));
  const empty = argv.includes("--empty");
  const timeout = Number(flag(argv, "--timeout", "900"));
  const ref = flag(argv, "--reference-rpc").replace(/\/+$/, "");
  const watch = flag(argv, "--watch-chain");
  const snapshot = JSON.parse(readFileSync(join(bundle, "snapshot.json"), "utf8"));
  const image = flag(argv, "--image", snapshot.source.imageRef);
  const networkId = snapshot.network.networkId;
  if (networkId < DRILL_BAND.lo || networkId > DRILL_BAND.hi) throw new CannotRun(`network ${networkId} is outside the drill band — this measurement starts and wipes nodes`);
  const refNet = Number((await rpc(ref, "/ext/info", "info.getNetworkID")).networkID);
  if (refNet !== networkId) throw new CannotRun(`reference serves network ${refNet}, bundle is ${networkId}`);

  const name = `a1snap-join-${empty ? "empty" : "bundle"}-${randomBytes(3).toString("hex")}`;
  const port = 19700 + Math.floor(Math.random() * 200);
  docker(["volume", "create", name]);
  try {
    if (!empty) {
      const r = docker(["run", "--rm", "--mount", `type=bind,source=${bundle},target=/bundle,readonly`, "--mount", `type=volume,source=${name},target=/data`,
        "--entrypoint", "sh", image, "-c", "cd /data && tar -xf /bundle/node-data.tar && sha256sum -c --quiet /bundle/node-data.files.sha256"], true);
      if (r.status !== 0) throw new CannotRun(`bundle extract/verify failed: ${r.stderr.trim().slice(-300)}`);
    }
    const flags = [
      `--network-id=${networkId}`, "--genesis-file=/a1snap/genesis.json", `--plugin-dir=${snapshot.node.pluginDir}`,
      "--chain-config-dir=/a1snap/chain-configs", "--http-host=0.0.0.0", "--http-allowed-hosts=*",
      `--public-ip=${flag(argv, "--ip")}`, `--bootstrap-ids=${flag(argv, "--bootstrap-id")}`, `--bootstrap-ips=${flag(argv, "--bootstrap-ip")}`,
      `--track-subnets=${snapshot.network.trackSubnets.join(",")}`, "--log-level=info",
    ];
    const t0 = Date.now();
    docker(["run", "-d", "--name", name, "--network", flag(argv, "--network"), "--ip", flag(argv, "--ip"), "-p", `127.0.0.1:${port}:9650`,
      "--mount", `type=volume,source=${name},target=/root/.avalanchego`,
      "--mount", `type=bind,source=${join(bundle, "genesis.json")},target=/a1snap/genesis.json,readonly`,
      "--mount", `type=bind,source=${join(bundle, "chain-configs")},target=/a1snap/chain-configs,readonly`,
      "--entrypoint", snapshot.node.binaryPath, image, ...flags]);
    const base = `http://127.0.0.1:${port}`;
    const chains = ["P", "X", "C", ...snapshot.network.trackSubnets.length ? (await rpc(ref, "/ext/bc/P", "platform.getBlockchains")).blockchains.filter((b) => snapshot.network.trackSubnets.includes(b.subnetID)).map((b) => b.id) : []];
    const bootAt = {};
    let caughtAt = null, last = null, streak = 0;
    console.log(`  ${name}: ${empty ? "EMPTY data dir (control)" : "restored from bundle"} · ${chains.length} chains · watching ${watch}`);
    for (;;) {
      const elapsed = (Date.now() - t0) / 1000;
      if (elapsed > timeout) break;
      try {
        for (const c of chains) {
          if (bootAt[c] === undefined && (await rpc(base, "/ext/info", "info.isBootstrapped", { chain: c })).isBootstrapped) bootAt[c] = Math.round(elapsed);
        }
        const all = chains.every((c) => bootAt[c] !== undefined);
        let joinHeight = null, joinHash = null, refHeight = null, refHash = null;
        if (bootAt[watch] !== undefined) {
          const jb = await rpc(base, `/ext/bc/${watch}/rpc`, "eth_getBlockByNumber", ["latest", false]);
          joinHeight = parseInt(jb.number, 16); joinHash = jb.hash;
          refHeight = parseInt(await rpc(ref, `/ext/bc/${watch}/rpc`, "eth_blockNumber", []), 16);
          refHash = (await rpc(ref, `/ext/bc/${watch}/rpc`, "eth_getBlockByNumber", ["0x" + joinHeight.toString(16), false]))?.hash ?? null;
        }
        last = { t: Math.round(elapsed), bootstrapped: Object.keys(bootAt).length, of: chains.length, ...judgePoll({ bootstrapped: all, joinHeight, joinHash, refHeight, refHashAtJoinHeight: refHash }), joinHeight, refHeight };
        if (last.reason.startsWith("DIFFERENT CHAIN")) break;
        streak = last.caughtUp ? streak + 1 : 0;
        if (streak >= 2) { caughtAt = caughtAt ?? last.t; break; }
        if (last.caughtUp && caughtAt === null) caughtAt = last.t;
        if (!last.caughtUp) caughtAt = null;
      } catch (e) { last = { t: Math.round(elapsed), reason: `not answering yet: ${e.message.slice(0, 60)}` }; }
      if (Math.round(elapsed) % 15 < 2) console.log(`    t=${last.t}s  bootstrapped ${last.bootstrapped ?? 0}/${chains.length}  ${last.reason}  (join ${last.joinHeight ?? "-"} / ref ${last.refHeight ?? "-"})`);
      await new Promise((r) => setTimeout(r, 2000));
    }
    const logs = docker(["logs", name], true);
    const starts = bootstrapStarts(logs.stdout + logs.stderr);
    const result = {
      mode: empty ? "empty" : "bundle", chains: chains.length, bootstrappedSeconds: bootAt,
      allBootstrappedSeconds: chains.every((c) => bootAt[c] !== undefined) ? Math.max(...Object.values(bootAt)) : null,
      caughtUpSeconds: streak >= 2 ? caughtAt : null, last, startedFromHeight: { [watch]: starts[watch] ?? null },
      memory: docker(["stats", "--no-stream", "--format", "{{.MemUsage}}", name], true).stdout.trim(),
    };
    console.log(JSON.stringify(result, null, 2));
    return result.caughtUpSeconds !== null ? 0 : 1;
  } finally {
    docker(["rm", "-f", name], true);
    docker(["volume", "rm", "-f", name], true);
  }
}

function selfTest() {
  let pass = 0, fail = 0;
  const ok = (n, c) => { if (c) { pass += 1; console.log(`  ✓ ${n}`); } else { fail += 1; console.log(`  ✗ ${n}`); } };
  const base = { bootstrapped: true, joinHeight: 100, joinHash: "0xa", refHeight: 100, refHashAtJoinHeight: "0xa" };
  ok("same height, same hash → caught up", judgePoll(base).caughtUp);
  ok("reference one block ahead (reads are not simultaneous) → still caught up", judgePoll({ ...base, refHeight: 101 }).caughtUp);
  ok("RED→ behind by 5 → not caught up", !judgePoll({ ...base, refHeight: 105 }).caughtUp);
  ok("RED→ same height, DIFFERENT hash → not caught up, named as a different chain", judgePoll({ ...base, refHashAtJoinHeight: "0xb" }).reason.startsWith("DIFFERENT CHAIN"));
  ok("RED→ not bootstrapped → not caught up even at equal height", !judgePoll({ ...base, bootstrapped: false }).caughtUp);
  ok("RED→ reference lacks the block → not caught up", !judgePoll({ ...base, refHashAtJoinHeight: null }).caughtUp);
  const log = '[x] INFO <qpw Chain> bootstrap/bootstrapper.go:194 starting bootstrapper {"lastAcceptedID": "z", "lastAcceptedHeight": 23194}\n[y] INFO <qpw Chain> starting bootstrapper {"lastAcceptedHeight": 5}';
  ok("reads the FIRST start height per chain from the node log", bootstrapStarts(log).qpw === 23194);
  console.log(`\n${fail === 0 ? "✅" : "🔴"} self-test: ${pass} passed · ${fail} failed`);
  return fail === 0 ? 0 : 1;
}

guardEntry(import.meta.url, FLAG_SPEC);
if (isEntryModule(import.meta.url)) {
  const argv = process.argv.slice(2);
  try {
    process.exitCode = argv.includes("--self-test") ? selfTest() : await measure(argv);
  } catch (e) {
    console.error(`\n⚠️ COULD NOT RUN (exit 2, not a verdict) — ${e.message}`);
    process.exitCode = EXIT_CANNOT_RUN;
  }
}
