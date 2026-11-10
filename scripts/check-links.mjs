#!/usr/bin/env node
/**
 * Internal link checker (Implementation-plan §8): every local href/src in the
 * built HTML must resolve to a built file or public asset. Anchors and
 * external URLs are skipped. Exits 1 on missing targets.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist', import.meta.url).pathname;

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const urlFor = (raw) => {
  if (/^(?:[a-z]+:|#|\/\/)/i.test(raw)) return null; // external, anchor, protocol-relative
  const [path, query] = raw.split(/[?#]/);
  if (!path) return null;
  // folder-formatted build: /about → /about/index.html; /file.png → /file.png
  const opts = path.endsWith('/')
    ? [join(DIST, path, 'index.html')]
    : [
        join(DIST, path, 'index.html'),
        join(DIST, path + '.html'),
        join(DIST, path),
      ];
  return opts.some(existsSync) ? null : path;
};

let failures = 0;
for (const file of walk(DIST)) {
  const html = readFileSync(file, 'utf8');
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const raw of refs) {
    const miss = urlFor(raw);
    if (miss) {
      failures++;
      console.error(`MISSING ${miss} — referenced in ${relative(DIST, file)}`);
    }
  }
}
console.log(failures ? `FAIL: ${failures} broken internal link(s).` : 'PASS: every internal href/src resolves.');
process.exit(failures ? 1 : 0);
