#!/usr/bin/env node
/**
 * Placeholder-testimonial launch guard (docs/plans/testimonials-redesign-plan.md §7).
 *
 * Zero-dependency: parses src/data/testimonials.ts with regexes rather than
 * importing TS. Fails when:
 *   1. the data file contains forbidden 1minus1-origin strings, or
 *   2. PUBLIC_SHOW_PLACEHOLDER_TESTIMONIALS=true while any quote is still a
 *      placeholder without recorded consent (the flag may not be used to
 *      publish fake social proof — it only previews in development).
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = resolve(root, 'src/data/testimonials.ts');
const src = readFileSync(file, 'utf8');

const FORBIDDEN = ['1minus1', 'Maison BAP', 'TTK Games', 'Invoke Studios', 'Turn 10', 'Crema', 'Lightspeed', 'Blind Squirrel', 'Team17', 'Hell Let Loose'];

// Strip comment lines and block comments, then count shipped entries only
// (interface defaults excluded).
const shipped = src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

// Scan only the shipped string fields (quote/name/role/company), not comments.
const values = [...shipped.matchAll(/(?:quote|name|role|company):\s*'([^']*)'/g)].map((m) => m[1]);
const problems = [];
for (const word of FORBIDDEN) {
  if (values.some((v) => v.includes(word))) problems.push(`forbidden string in shipped testimonial fields: "${word}"`);
}

const entries = (shipped.match(/id:\s*'t-\d+'/g) || []).length;
const placeholders = (shipped.match(/placeholder:\s*true/g) || []).length;
const consents = (shipped.match(/consent:\s*true/g) || []).length;
const flag = process.env.PUBLIC_SHOW_PLACEHOLDER_TESTIMONIALS === 'true';

console.log(`check:placeholders — ${entries} testimonials, ${placeholders} placeholder, ${consents} consented`);

if (placeholders > 0) {
  if (flag && consents < placeholders) {
    problems.push(
      `PUBLIC_SHOW_PLACEHOLDER_TESTIMONIALS=true while ${placeholders} quote(s) are still placeholders without recorded consent — the flag only previews, it may not publish fake social proof.`
    );
  } else if (!flag) {
    console.log('section will be hidden in production while placeholders exist (set PUBLIC_SHOW_PLACEHOLDER_TESTIMONIALS=true to preview)');
  }
} else if (consents < entries) {
  problems.push(`${entries - consents} non-placeholder quote(s) without consent: true`);
}

if (problems.length) {
  console.error('check:placeholders FAILED:');
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('check:placeholders OK');
