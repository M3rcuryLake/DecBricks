import type { APIRoute } from 'astro';
import { SITE_URL } from '../data/site';

/**
 * robots.txt (zero-dep): production build allows crawling and points at the
 * sitemap; any non-production build (`PUBLIC_ENV !== 'production'` — same gate
 * as Base.astro's noindex) blocks crawlers entirely.
 */
export const GET: APIRoute = ({ site }) => {
  const isProduction = import.meta.env.PUBLIC_ENV === 'production';
  const origin = site?.origin || SITE_URL;
  const body = isProduction
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', origin).href}\n`
    : `User-agent: *\nDisallow: /\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
