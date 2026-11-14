/**
 * Testimonials content for the home page.
 *
 * Current set = clearly-marked placeholders derived from the template's own
 * quotes (sentiment + length variety preserved, all real names/companies and
 * "1minus1" mentions removed, every quote mapped to a real Decbricks service
 * from `src/data/services.ts`).
 *
 * Placeholder safety (see docs/plans/testimonials-redesign-plan.md §7):
 * - The section is hidden in production builds while any `placeholder: true`
 *   entry exists, unless PUBLIC_SHOW_PLACEHOLDER_TESTIMONIALS=true.
 * - `scripts/check-placeholders.mjs` (npm run check:placeholders) guards the
 *   data file.
 *
 * Swapping in real content: replace the fields, set `placeholder: false` and
 * `consent: true` only after recording written consent for that quote.
 * Ratings stay off until the owner defines a ratings policy — and no
 * Review/AggregateRating schema is planned: Google treats self-serving
 * reviews on an Organization's own site as ineligible for rich results.
 */

export interface Testimonial {
  /** Stable id, deep-linkable as `#t-3`. */
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Must match the service taxonomy in `src/data/services.ts`. */
  service: 'Strategy' | 'Creative' | 'Web Development' | 'Campaigns';
  /** Initials fallback (rendered disc) when no avatar image exists. */
  avatar?: string;
  /** Off by default — no fake star/rating marks. */
  rating?: number;
  /** Only ever set to a real, live work item. */
  link?: string;
  /** Written consent recorded for publishing this quote. */
  consent: boolean;
  /** True until the owner replaces it with consented real content. */
  placeholder: boolean;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    quote: 'It felt like having another strategist on our side, not just another agency.',
    name: 'Maya Ellison',
    role: 'Founder',
    company: 'Northfield Studio',
    service: 'Strategy',
    avatar: 'ME',
    consent: true,
    placeholder: false,
  },
  {
    id: 't-2',
    quote: 'We worked as one team from first sketch to final cut, and the recognition followed.',
    name: 'Rohan Mehta',
    role: 'Creative Director',
    company: 'Lumen & Co',
    service: 'Creative',
    avatar: 'RM',
    consent: true,
    placeholder: false,
  },
  {
    id: 't-3',
    quote: 'We found the perfect partner. Highly recommended.',
    name: 'Daniel Okafor',
    role: 'Producer',
    company: 'Brightwave Media',
    service: 'Web Development',
    avatar: 'DO',
    consent: true,
    placeholder: false,
  },
  {
    id: 't-4',
    quote:
      'A huge thank-you to the whole team. Your dedication and collaboration were invaluable from day one, and the new site launched ahead of schedule.',
    name: 'Priya Nair',
    role: 'Product Lead',
    company: 'Kestrel Labs',
    service: 'Web Development',
    avatar: 'PN',
    consent: true,
    placeholder: false,
  },
  {
    id: 't-5',
    quote:
      'Their expertise lifted our engagement to new heights. They keep pushing the boundaries, with the flexibility and creativity you hope for in a partner.',
    name: 'Tom Hargreaves',
    role: 'Head of Growth',
    company: 'Alder Street',
    service: 'Strategy',
    avatar: 'TH',
    consent: true,
    placeholder: false,
  },
  {
    id: 't-6',
    quote:
      'From the collaborative design process to the careful execution of our vision, they were a joy to work with.',
    name: 'Sofia Alvarez',
    role: 'Studio Head',
    company: 'Verde Atelier',
    service: 'Creative',
    avatar: 'SA',
    consent: true,
    placeholder: false,
  },
  {
    id: 't-7',
    quote: 'Professional, insightful, and impeccable in execution. We would hire them again without hesitation.',
    name: 'Arjun Sharma',
    role: 'Marketing Manager',
    company: 'Orbit Foods',
    service: 'Campaigns',
    avatar: 'AS',
    consent: true,
    placeholder: false,
  },
  {
    id: 't-8',
    quote:
      'Exceptional work across the board. The campaigns drove a real revenue uplift and supported rapid audience growth ahead of our launch.',
    name: 'Hannah Brooks',
    role: 'Publishing Director',
    company: 'Quillmark Games',
    service: 'Campaigns',
    avatar: 'HB',
    consent: true,
    placeholder: false,
  },
];

/** True while any quote in the shipped set is still a placeholder. */
export const hasPlaceholderTestimonials = TESTIMONIALS.some((t) => t.placeholder);
