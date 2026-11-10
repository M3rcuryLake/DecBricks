#!/usr/bin/env node
/**
 * Headings audit (Implementation-plan §6): parse every built HTML file and
 * assert per page exactly one <h1> and no skipped heading levels.
 * Prints a table; exits 1 on violation. Run after `npm run build`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
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

const files = walk(DIST);
if (!files.length) {
  console.error('No dist HTML found — run `npm run build` first.');
  process.exit(1);
}

let failures = 0;
const rows = files.map((file) => {
  const html = readFileSync(file, 'utf8');
  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const h1 = levels.filter((l) => l === 1).length;
  // no skipped levels going deeper (allow jumps UP, e.g. h2 → h2 sibling reuse)
  const skips = [];
  let prev = 0;
  for (const l of levels) {
    if (prev && l > prev + 1) skips.push(`h${prev}>h${l}`);
    prev = l;
  }
  const page = relative(DIST, file).replace(/\\/g, '/');
  if (h1 !== 1) failures++;
  if (skips.length) failures++;
  return `| ${page} | ${h1} | ${levels.length} | ${skips.join(', ') || '—'} |`;
});

console.log('| Page | H1 | Heading count | Skips |');
console.log('|---|---|---|---|');
console.log(rows.join('\n'));
console.log(failures ? `\nFAIL: ${failures} page(s) with a heading problem.` : '\nPASS: every page has exactly ONE <h1> and no level jumps.');
process.exit(failures ? 1 : 0);
