import { SITE, SITE_URL } from '../data/site';
import { EMAIL, PHONES } from '../data/contact';
import { DECBRICKS_SERVICES, type DecbricksServiceItem } from '../data/services';

const abs = (path: string) => new URL(path, SITE_URL + '/').href.replace(/\/$/, '');

type Json = Record<string, unknown>;

/** Organization (single source of truth for About/Contact/sitemap pages). */
export function organizationSchema(): Json {
  const contactPoints = PHONES.map((p) => ({
    '@type': 'ContactPoint',
    telephone: p.e164,
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: 'English',
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    description: SITE.description,
    ...(EMAIL ? { email: EMAIL } : {}),
    ...(contactPoints.length ? { contactPoint: contactPoints } : {}),
    ...(SITE.socials.length ? { sameAs: SITE.socials.map((s) => s.href) } : {}),
  };
}

export function webSiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE_URL,
  };
}

/** Breadcrumb trail; items are [name, path] pairs, path '' = home. */
export function breadcrumbSchema(items: Array<{ name: string; path?: string }>): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.path === undefined ? undefined : abs(item.path || '/'),
    })).map((entry) => Object.fromEntries(Object.entries(entry).filter(([, v]) => v !== undefined))),
  };
}

export function aboutPageSchema(description: string): Json[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: `About ${SITE.name}`,
      url: abs('/about'),
      description,
    },
    organizationSchema(),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]),
  ];
}

export function contactPageSchema(description: string): Json[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: `Contact ${SITE.name}`,
      url: abs('/contact'),
      description,
    },
    organizationSchema(),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]),
  ];
}

/**
 * Structured data for `/services` covering all 7 Decbricks services from
 * `DECBRICKS_SERVICES`. Wired into `services.astro` in Phase 4 once visible
 * Decbricks copy replaces 1minus1 copy on `/services` (Implementation-plan §6).
 */
export function servicePageSchema(
  description: string,
  services: readonly DecbricksServiceItem[] = DECBRICKS_SERVICES
): Json[] {
  const pageUrl = abs('/services');
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Services | ${SITE.name}`,
      url: pageUrl,
      description,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: services.length,
        itemListElement: services.map((service, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Service',
            name: service.title,
            serviceType: service.title,
            description: [service.tagline, ...service.description].join(' '),
            url: `${pageUrl}#${service.id}`,
            provider: {
              '@type': 'Organization',
              name: SITE.name,
              url: SITE_URL,
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: service.title,
              itemListElement: service.items.map((capability) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: capability,
                },
              })),
            },
          },
        })),
      },
    },
    organizationSchema(),
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]),
  ];
}
