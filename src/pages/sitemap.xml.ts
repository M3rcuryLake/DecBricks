import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/site';

/**
 * Hand-written sitemap (zero-dep, per Implementation-plan §6).
 * Lists indexable pages only:
 * - `/`, `/about`, `/services` (7 Decbricks services landed 2026-11-14), `/contact`.
 * - `/404` is a system error page (`noindex`).
 * Add a route here when a page becomes indexable.
 */
export const GET: APIRoute = () => {
  const indexable = ['/', '/about', '/services', '/contact'];
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
