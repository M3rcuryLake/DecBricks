/**
 * Site-wide Decbricks configuration. Values that are not yet supplied by the
 * owner live here so they are only ever corrected in ONE place (see
 * docs/open-items.md §A).
 */

export interface NavLink {
  label: string;
  href: string;
  /** Anchor used by the pixel-transition for same-page jumps. */
  anchor?: string;
  /** Only link pages that actually exist — drives header/footer visibility. */
  enabled?: boolean;
}

/** Production origin. Override with PUBLIC_SITE_URL; confirmed in open-items A1. */
export const SITE_URL =
  import.meta.env.PUBLIC_SITE_URL || 'https://decbricks.com';

export const SITE = {
  name: 'Decbricks',
  legalName: 'Decbricks',
  url: SITE_URL,
  tagline: 'Build Beyond Ordinary.',
  description:
    'Decbricks is a technology, creative and business growth agency helping ambitious businesses with software, websites, applications, AI, automation, digital experiences and growth strategies.',
  /** og/twitter card (1200×630 TEMP asset flagged in open-items A6). */
  ogImage: `${SITE_URL}/og-default.png`,
  locale: 'en',
  themeColor: '#800020',
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || '',
  /** Social profile URLs (open-items A8) — empty until the owner supplies them. */
  socials: [] as Array<{ label: string; href: string }>,
  /** Main nav; in-page links route through the homepage so they work site-wide. */
  nav: [
    { label: 'Home', href: '/', enabled: true },
    { label: 'About Us', href: '/about', enabled: true },
    { label: 'Services', href: '/services', enabled: true },
    { label: 'Our Work', href: '/#work', anchor: '#work', enabled: true },
    { label: 'Insights', href: '/#insights', anchor: '#insights', enabled: true },
    { label: 'Contact', href: '/contact', enabled: true },
  ] as NavLink[],
} as const;
