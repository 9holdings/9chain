#!/usr/bin/env node
/**
 * e2e-arlocal-forgery.mjs — the two forgeries `arweave-snapshot.mjs` exists to refuse, run against a
 * LOCAL ArLocal gateway with throwaway in-memory wallets. Nothing here can reach a real network.
 *
 *   A. A stranger publishes a manifest with IDENTICAL tags (same App-Name, Kind, Network-Id and
 *      Bundle-Root) that points at the project's real asset transactions, and is mined AFTER the real
 *      one. `latest --owner <project>` must not list it; `download --owner <project>` must refuse it.
 *   B. A manifest really signed by the owner points at an asset transaction signed by someone else.
 *      `download` must refuse the foreign transaction.
 *
 * Usage: node e2e-arlocal-forgery.mjs --gateway http://127.0.0.1:1984 --owner <project address>
 *        --manifest <project manifest tx id>
 * Exit: 0 = both forgeries refused for the right reason · 1 = one was accepted · 2 = could not run.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Arweave from "arweave";
import { guardEntry, isEntryModule } from "../../lib/cli.mjs";
import { APP_NAME, MANIFEST_KIND, parseGateway } from "./arweave-snapshot.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
guardEntry(import.meta.url, { "--gateway": true, "--owner": true, "--manifest": true });

async function main(argv) {
  const flag = (n) => { const i = argv.indexOf(n); return i === -1 ? undefined : argv[i + 1]; };
  const gateway = parseGateway(flag("--gateway") ?? "");
  if (!gateway.local) { console.error("refusing: this forgery test only runs against a local gateway"); return 2; }
  const owner = flag("--owner"), realManifest = flag("--manifest");
  if (!owner || !realManifest) { console.error("--owner and --manifest are required"); return 2; }
  const arweave = Arweave.init({ host: gateway.host, port: gateway.port, protocol: gateway.protocol });
  const fund = async (addr) => { const r = await fetch(`${gateway.base}/mint/${addr}/1000000000000000`); if (!r.ok) throw new Error(`mint ${r.status}`); };
  const post = async (key, data, tags) => {
    const tx = await arweave.createTransaction({ data }, key);
    for (const [n, v] of tags) tx.addTag(n, v);
    await arweave.transactions.sign(tx, key);
    const res = await arweave.transactions.post(tx);
    if (res.status >= 400) throw new Error(`post ${res.status}`);
    return tx.id;
  };
  const cli = (...args) => spawnSync(process.execPath, [join(HERE, "arweave-snapshot.mjs"), ...args, "--gateway", gateway.base], { encoding: "utf8" });

  const real = JSON.parse(Buffer.from(await arweave.transactions.getData(realManifest, { decode: true })).toString("utf8"));
  const tags = (kind) => [["App-Name", APP_NAME], ["Schema", "1"], ["Network-Id", String(real.networkId)], ["Bundle-Root", real.bundleRoot], ["Created-At", new Date().toISOString()], ["Kind", kind], ["Content-Type", "application/json"]];
  let bad = 0;

  // ─── A: identical tags, stranger's signature, mined later ───
  const stranger = await arweave.wallets.generate();
  const strangerAddr = await arweave.wallets.jwkToAddress(stranger);
  await fund(strangerAddr);
  const forgedA = { ...real, owner, createdAt: new Date().toISOString() };
  const idA = await post(stranger, Buffer.from(JSON.stringify(forgedA)), tags("manifest"));
  await fetch(`${gateway.base}/mine`);
  const latestRun = cli("latest", "--owner", owner, "--count", "10");
  const listsForged = latestRun.stdout.includes(idA);
  const listsReal = latestRun.stdout.includes(realManifest);
  console.log(`A. stranger manifest ${idA} (identical tags, mined later)`);
  console.log(`   latest --owner project: lists real ${listsReal} · lists forged ${listsForged}`);
  if (listsForged || !listsReal) bad += 1;
  const dlA = cli("download", idA, "--owner", owner, "--out", mkdtempSync(join(tmpdir(), "a1snap-forge-a-")));
  const refusedA = dlA.status === 1 && /was signed by .* not /.test(dlA.stderr);
  console.log(`   download --owner project: exit ${dlA.status} · ${dlA.stderr.trim().split("\n").pop()}`);
  if (!refusedA) bad += 1;

  // ─── B: owner-signed manifest, one asset signed by someone else ───
  const project = await arweave.wallets.generate();
  const projectAddr = await arweave.wallets.jwkToAddress(project);
  await fund(projectAddr);
  const foreignData = Buffer.from("{}\n");
  const foreignSha = createHash("sha256").update(foreignData).digest("hex");
  const foreignId = await post(stranger, foreignData, [...tags("asset"), ["Asset-Name", "RELEASE.json"], ["Asset-Sha256", foreignSha]]);
  const assets = real.assets.map((a) => (a.name === "RELEASE.json" ? { ...a, txId: foreignId, sha256: foreignSha, bytes: foreignData.length } : a));
  const manifestB = { ...real, owner: projectAddr, assets };
  const idB = await post(project, Buffer.from(JSON.stringify(manifestB)), tags("manifest"));
  await fetch(`${gateway.base}/mine`);
  const dlB = cli("download", idB, "--owner", projectAddr, "--out", mkdtempSync(join(tmpdir(), "a1snap-forge-b-")));
  const refusedB = dlB.status === 1 && /signed by .* not the manifest owner/.test(dlB.stderr);
  console.log(`B. owner-signed manifest ${idB} with a foreign RELEASE.json ${foreignId}`);
  console.log(`   download --owner owner: exit ${dlB.status} · ${dlB.stderr.trim().split("\n").pop()}`);
  if (!refusedB) bad += 1;

  console.log(bad === 0 ? "\n✅ both forgeries refused, each for its own reason" : `\n🔴 ${bad} check(s) accepted a forgery`);
  return bad === 0 ? 0 : 1;
}

if (isEntryModule(import.meta.url)) {
  try { process.exitCode = await main(process.argv.slice(2)); }
  catch (e) { console.error(`⚠️ COULD NOT RUN (exit 2) — ${e.message}`); process.exitCode = 2; }
}
