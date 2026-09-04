#!/usr/bin/env node
/**
 * gen-version.mjs — the version anchor for a static build. (Đ1-11b, part 1)
 *
 * ═══ THE REAL INCIDENT THIS FILE CLOSES ═══
 * `/version.txt` was added to the Caddyfile's `@trangmoi` back in **Đ1-1** — but nothing ever
 * produced that file. Measured `27/08` against the public site:
 *
 *     https://a1.9chain.org/version.txt  →  404, nginx, content-type: text/html
 *
 * That is **the route shipping ahead of the product**, and the result was a dead path being
 * served publicly. `check-routes.mjs` stayed green throughout because it asks *"does every file
 * in out/ have a route?"* — the other direction (*"does every route have a file?"*) was asked by
 * nobody.
 * ⇒ Same family as `/moi/` masking a genuine 404, and as the shared `og:*`: **a gate is green
 *   because it measures one direction of a two-directional relationship.** The other direction
 *   now has a gate.
 *
 * ═══ WHAT THIS ANCHOR IS FOR ═══
 * It answers a question no other measurement on the site can answer:
 * **"is what is being served out there really what I just built?"**
 * `curl https://a1.9chain.org/version.txt` must match `cat web/out/version.txt` byte for byte.
 * A mismatch = old HTML still in cache or on disk, or an incomplete copy.
 *
 * 🔴 `dirty` IS REQUIRED — and it is the more important half of this file.
 * An anchor carrying only a SHA lies with great confidence when someone builds from a working
 * tree with uncommitted edits: the SHA points at a commit that does NOT contain what just went
 * live. Declaring `dirty` turns "this build is commit X" into "this build is commit X **plus
 * uncommitted work**" — the second sentence is true, the first is a signed false statement.
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const GOC = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const OUT = path.join(GOC, 'out');

function git(...args) {
  try {
    return execFileSync('git', args, { cwd: GOC, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    // No git (a clean build container) is not an error — but do NOT invent a SHA.
    return null;
  }
}

if (!existsSync(OUT)) {
  console.log(`✗ no ${OUT} yet — gen-version must run AFTER \`next build\``);
  process.exit(1);
}

const sha = git('rev-parse', '--short=12', 'HEAD') ?? 'khong-co-git';
const nhanh = git('rev-parse', '--abbrev-ref', 'HEAD') ?? '?';
// An empty `status --porcelain` = a clean tree. Any line at all = uncommitted work.
const bo = git('status', '--porcelain');
const dirty = bo === null ? 'khong-biet' : bo.length > 0 ? 'yes' : 'no';

// Count the chunks so a deploy has one cheap number to compare against (Đ1-11b part 2 will
// compare the LIST, not just the count — two different file sets can have the same count).
const thuMucChunk = path.join(OUT, '_next', 'static', 'chunks');
const soChunk = existsSync(thuMucChunk) ? readdirSync(thuMucChunk).filter((f) => f.endsWith('.js')).length : 0;

const noiDung =
  [
    `commit=${sha}`,
    `branch=${nhanh}`,
    `uncommitted=${dirty}`,
    `built-at=${new Date().toISOString()}`,
    `js-chunks=${soChunk}`,
  ].join('\n') + '\n';

// LF explicitly: the repo runs on Windows, and CRLF here makes every byte-for-byte comparison
// between `curl` and `cat` differ for no visible reason (the same trap that bit `sha256sum -c`).
writeFileSync(path.join(OUT, 'version.txt'), noiDung, { encoding: 'utf8' });

console.log(`✓ version.txt — ${sha} (${nhanh}) · uncommitted: ${dirty} · ${soChunk} chunks`);
if (dirty === 'yes') {
  console.log('   ⚠️ THE WORKING TREE HAS UNCOMMITTED CHANGES — this build cannot be reproduced from the SHA above.');
}
