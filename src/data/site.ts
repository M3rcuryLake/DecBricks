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
  tagline: 'Building Technology. Empowering Businesses. Driving Growth.',
  description:
    'Decbricks is a technology and digital solutions agency helping businesses innovate through software development, AI, automation, design and business growth services.',
  /** og/twitter card (1200×630 TEMP asset flagged in open-items A6). */
  ogImage: `${SITE_URL}/og-default.png`,
  locale: 'en',
  themeColor: '#800020',
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || '',
  /** Social profile URLs (resolved open-items A8). */
  socials: [
    { label: 'X', href: 'https://x.com/decbricks' },
    { label: 'Instagram', href: 'https://www.instagram.com/decbricksofficial' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/decbricks/' },
  ] as Array<{ label: string; href: string }>,
  /** Main nav; pages are enabled as they are rebuilt (About+Contact exist from Phase 4/5). */
  nav: [
    { label: 'About', href: '/about', enabled: false },
    { label: 'Services', href: '/services', enabled: true },
    { label: 'Contact', href: '/contact', enabled: false },
  ] as NavLink[],
} as const;
