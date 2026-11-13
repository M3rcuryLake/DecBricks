#!/usr/bin/env node
/**
 * Footer <-> Organization schema consistency checker (Footer Phase 6).
 * Reads built HTML under dist/ and verifies:
 *  - Every rendered footer has a single <h2> and no empty href/mailto/tel links.
 *  - Organization JSON-LD (email, contactPoint telephones, sameAs socials) matches
 *    what FooterContact / Footer renders on built pages.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

const decodeHtml = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const collectOrgs = (node, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) {
    for (const item of node) collectOrgs(item, out);
    return out;
  }
  if (node['@type'] === 'Organization') out.push(node);
  if (Array.isArray(node['@graph'])) collectOrgs(node['@graph'], out);
  return out;
};

const normTel = (s) => s.replace(/^tel:/i, '').replace(/\s+/g, '');

const failures = [];
let pagesChecked = 0;
let orgsChecked = 0;

for (const file of walk(DIST)) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(DIST, file);
  const footerMatch = html.match(/<footer\b[\s\S]*?<\/footer>/i);
  if (!footerMatch) continue;
  pagesChecked++;
  const footerHtml = footerMatch[0];

  const h2Count = (footerHtml.match(/<h2\b/gi) || []).length;
  if (h2Count !== 1) failures.push(`${rel}: expected 1 <h2> in footer, found ${h2Count}`);

  const hrefs = [...footerHtml.matchAll(/href="([^"]*)"/gi)].map((m) => decodeHtml(m[1]));
  for (const href of hrefs) {
    if (!href || href === 'mailto:' || href === 'tel:') {
      failures.push(`${rel}: empty/broken href "${href}" in footer`);
    }
  }

  const emails = [...new Set(hrefs.filter((h) => h.startsWith('mailto:')).map((h) => h.slice(7).split('?')[0]))].sort();
  const tels = [...new Set(hrefs.filter((h) => h.startsWith('tel:')).map(normTel))].sort();
  const socials = [...new Set(hrefs.filter((h) => /^https?:\/\//i.test(h) && !h.startsWith('https://cal.com/')))].sort();

  const jsonBlocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of jsonBlocks) {
    let parsed;
    try {
      parsed = JSON.parse(m[1]);
    } catch (e) {
      failures.push(`${rel}: invalid JSON-LD (${e.message})`);
      continue;
    }
    for (const org of collectOrgs(parsed)) {
      orgsChecked++;
      const schemaEmail = org.email ? [String(org.email)] : [];
      if (JSON.stringify(schemaEmail) !== JSON.stringify(emails)) {
        failures.push(`${rel}: Organization.email ${JSON.stringify(schemaEmail)} != footer mailto ${JSON.stringify(emails)}`);
      }
      const cps = Array.isArray(org.contactPoint)
        ? org.contactPoint.map((c) => normTel(String(c.telephone || ''))).filter(Boolean).sort()
        : [];
      if (JSON.stringify(cps) !== JSON.stringify(tels)) {
        failures.push(`${rel}: Organization.contactPoint ${JSON.stringify(cps)} != footer tel ${JSON.stringify(tels)}`);
      }
      const sameAs = Array.isArray(org.sameAs) ? [...new Set(org.sameAs.map(String))].sort() : [];
      if (JSON.stringify(sameAs) !== JSON.stringify(socials)) {
        failures.push(`${rel}: Organization.sameAs ${JSON.stringify(sameAs)} != footer socials ${JSON.stringify(socials)}`);
      }
      if (typeof org.logo === 'string' && org.logo.endsWith('/brand/logo.png')) {
        if (!existsSync(join(DIST, 'brand/logo.png'))) {
          failures.push(`${rel}: missing dist/brand/logo.png referenced by Organization.logo`);
        }
      }
    }
  }
}

if (pagesChecked === 0 || orgsChecked === 0) {
  failures.push(`Insufficient coverage: pagesChecked=${pagesChecked}, orgsChecked=${orgsChecked}`);
}

if (failures.length) {
  for (const f of failures) console.error('FAIL:', f);
  process.exit(1);
}
console.log(`PASS: footer/schema consistency verified (${pagesChecked} pages with footer, ${orgsChecked} Organization JSON-LD block(s)).`);
