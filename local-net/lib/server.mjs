/**
 * server.mjs — the SINGLE source of truth for the public server's coordinates.
 *
 * ═══ 🔴 WHY THIS FILE EXISTS ═══
 *
 * Measured 2026-08-28: **one concept — "the server" — had SIX environment-variable names**,
 * one per script, each carrying its own copy of the same `"$A1_SSH_HOST"`:
 *
 *   A1_HOST         check-ports.sh · console-deploy.sh
 *   A1_SSH_HOST     web-deploy.sh
 *   A1_BACKUP_HOST  h6b-backup.sh            ← the BACKUP script itself
 *   A1_SSH_TARGET   wallet-tunnel/enter.sh
 *   A1_SRC / A1_REMOTE_DIR   two names for the source directory
 *   --host / --target        two flag names, and `--target` meant two different things
 *
 * It had not burned yet, but the path to the burn was already built and already named: **O4**
 * — moving a node to a second provider. Whoever does it will set *one* variable, watch a few
 * commands point at the new box, and then `h6b-backup.sh` will **quietly back up the old
 * one**. Backing up the wrong machine does not raise an error: it finishes, prints a green
 * line, and is wrong only on the day you finally need it.
 *
 * Same shape as `A1Gen ↔ A1_GEN` (D-093) and `--network-id=9001` in the compose files
 * (D-111): **a constant copied by hand into several places, with no gate joining them.**
 *
 * ⇒ Now: one name per concept, and `scripts/check-single-source.mjs` keeps it that way.
 *
 * Environment variables (all overridable, and **identical on the `.sh` side**):
 *   A1_SSH_HOST   ssh destination, `user@host`
 *   A1_SSH_KEY    path to the ssh private key
 *   A1_SRC_DIR    source directory on the server
 *   A1_RPC_URL    public RPC endpoint
 */
import { homedir } from "node:os";
import path from "node:path";

/**
 * 🔴 THE FOUR STRINGS BELOW ARE THE ONLY COPY IN THE REPO. Putting a second copy anywhere
 * else rebuilds precisely the trap this file exists to remove — `check-single-source.mjs`
 * will go red.
 */
export const SSH_HOST = process.env.A1_SSH_HOST || ""$A1_SSH_HOST"";
// Written as the single string `".ssh/9chain-a1"` (not `join(".ssh", "9chain-a1")`) on
// purpose: `check-single-source.mjs` matches on the literal, and a constant split across
// arguments is invisible to it — the gate would then report "declared but absent", i.e. it
// would be green for the wrong reason.
export const SSH_KEY = process.env.A1_SSH_KEY || path.join(homedir(), ".ssh/9chain-a1");
export const SRC_DIR = process.env.A1_SRC_DIR || "~/9chain-a1/src";
export const RPC_URL = process.env.A1_RPC_URL || "https://rpc-a1.9chain.org";
