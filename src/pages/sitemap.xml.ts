import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/site';

/**
 * Hand-written sitemap (zero-dep, per Implementation-plan §6).
 * Lists indexable pages only:
 * - `/services` stays out while its content is still 1minus1's (open-items C2);
 *   it is `noindex` in the meantime and enters here only after A12 copy lands.
 * - `/the404game` and `/404` are easter-egg/system pages, `noindex`.
 * Add a route here when a page becomes indexable.
 */
export const GET: APIRoute = () => {
  const indexable = ['/', '/about', '/contact'];
  const lastmod = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable
  .map(
    (p) => `  <url>
    <loc>${new URL(p, SITE_URL + '/').href.replace(/\/$/, '') || SITE_URL}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>
`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
