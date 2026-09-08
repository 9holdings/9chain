/**
 * track-files.mjs — which subnets each node tracks, as written on disk.
 *
 * Lifted out of `console/server.mjs` on 2026-09-08 (D-251, P-106 step 3). Two files, and the
 * console is not the reader of either — that is the whole point of both of them.
 *
 * ═══ 🔴 WHY THE `.env` FILE EXISTS AT ALL ═══
 *
 * The console passes `A1_TRACK_SUBNETS` through the environment when it runs compose, so it does
 * not need the file. But ANYONE who later types `docker compose up -d` by hand — to fix one node,
 * to raise an image — picks up an empty value, and that node SILENTLY stops tracking every L1.
 * The chain still looks alive by every outward sign; it is just one validator thinner, and nobody
 * knows. This project has already been bitten by exactly that shape once, with
 * `--http-allowed-hosts`: a console `up` dropped it back to `*` on the public node.
 *
 * ═══ 🔴 WHY THE OVERRIDE LISTS EVERY SERVICE, EVEN IDLE ONES ═══
 *
 * The per-node override (P-83) is `{ services: { <svc>: { environment: ["AVAGO_TRACK_SUBNETS=…"] } } }`.
 * A service MISSING from it does not track nothing — it falls back to the base compose file's
 * shared variable, i.e. back to the every-node model, silently. So an idle node is written with an
 * empty list rather than left out.
 *
 * ═══ BOTH ARE WRITTEN tmp + rename ═══
 *
 * A half-written `.env` kills EVERY compose command, including the one someone would use to fix
 * it. The same applies to the override.
 *
 * The two paths arrive through a factory rather than module scope so these rules can be exercised
 * against a temporary directory; the console passes its real files.
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

const TRACK_VAR = "AVAGO_TRACK_SUBNETS=";
const ENV_VAR_RE = /^\s*A1_TRACK_SUBNETS\s*=/;

export function createTrackFiles({ overrideFile, composeFile }) {
  if (!overrideFile || !composeFile) throw new Error("createTrackFiles needs overrideFile and composeFile");

  const envPath = () => path.join(path.dirname(path.resolve(composeFile)), ".env");

  /** Write the per-node override for EVERY managed service — see the header on idle ones. */
  const writeTrackOverride = (lists) => {
    const services = {};
    for (const [svc, subnets] of [...lists.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
      services[svc] = { environment: [`${TRACK_VAR}${subnets.join(",")}`] };
    }
    const tmp = `${overrideFile}.tmp`;
    writeFileSync(tmp, JSON.stringify({ services }, null, 2) + "\n");
    renameSync(tmp, overrideFile);
  };

  /**
   * What every node tracks RIGHT NOW according to disk: the override when there is one, else the
   * shared `.env` list on every node (the every-node model). This is the "before" that a rollout
   * diffs against to decide which nodes must restart.
   */
  const readTrackLists = (services) => {
    const lists = new Map(services.map((s) => [s, []]));
    if (existsSync(overrideFile)) {
      const j = JSON.parse(readFileSync(overrideFile, "utf8"));
      for (const [svc, def] of Object.entries(j?.services ?? {})) {
        const line = (def?.environment ?? []).find((e) => String(e).startsWith(TRACK_VAR));
        lists.set(svc, line ? String(line).slice(TRACK_VAR.length).split(",").filter(Boolean) : []);
      }
      return lists;
    }
    const p = envPath();
    const line = existsSync(p) ? readFileSync(p, "utf8").split(/\r?\n/).find((d) => ENV_VAR_RE.test(d)) : null;
    const shared = line ? line.replace(ENV_VAR_RE, "").trim().split(",").filter(Boolean) : [];
    for (const s of services) lists.set(s, [...shared]);
    return lists;
  };

  /**
   * Pin the subnet list into the `.env` beside the compose file, for the next person who runs
   * compose by hand.
   *
   * 🔴 A failure here does NOT fail the operation: the console passed the value through the
   * environment, so the run in progress is correct either way. What broke is the safety net for
   * some later manual run — which is worth a warning, and is not worth aborting a chain creation
   * that has already spent money. The caller is given the error so it can say so out loud.
   */
  const pinTrackListToEnv = (trackList) => {
    const p = envPath();
    const previous = existsSync(p) ? readFileSync(p, "utf8") : "";
    const kept = previous.split(/\r?\n/).filter((line) => !ENV_VAR_RE.test(line));
    while (kept.length && kept.at(-1).trim() === "") kept.pop();
    kept.push(`A1_TRACK_SUBNETS=${trackList}`, "");
    const tmp = `${p}.tmp`;
    writeFileSync(tmp, kept.join("\n"));
    renameSync(tmp, p);
    return p;
  };

  return { writeTrackOverride, readTrackLists, pinTrackListToEnv, envPath };
}
