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
  // from current #0 (one-liner) → Strategy
  {
    id: 't-1',
    quote: 'It felt like having another strategist on our side — not just another agency.',
    name: 'Client Name',
    role: 'Founder',
    company: 'Studio Name',
    service: 'Strategy',
    consent: false,
    placeholder: true,
  },
  // from current #1 (medium) → Creative
  {
    id: 't-2',
    quote: 'We worked as one force from first sketch to final cut — and the recognition followed.',
    name: 'Client Name',
    role: 'Creative Director',
    company: 'Brand Name',
    service: 'Creative',
    consent: false,
    placeholder: true,
  },
  // from current #2 (one-liner; removes the verbatim "1minus1" mention) → Web Development
  {
    id: 't-3',
    quote: 'We found the perfect partner. Highly recommended.',
    name: 'Client Name',
    role: 'Producer',
    company: 'Company Name',
    service: 'Web Development',
    consent: false,
    placeholder: true,
  },
  // from current #3 (long) → Web Development
  {
    id: 't-4',
    quote:
      'A tremendous thank-you to the entire team — your dedication and collaboration have been invaluable from day one.',
    name: 'Client Name',
    role: 'Product Lead',
    company: 'Company Name',
    service: 'Web Development',
    consent: false,
    placeholder: true,
  },
  // from current #4 (long) → Strategy
  {
    id: 't-5',
    quote:
      'Their expertise lifted our engagement to new heights. Always pushing the boundaries, with the flexibility and creativity you hope for in a partner.',
    name: 'Client Name',
    role: 'Head of Growth',
    company: 'Company Name',
    service: 'Strategy',
    consent: false,
    placeholder: true,
  },
  // from current #5 (medium) → Creative
  {
    id: 't-6',
    quote:
      'From the collaborative design process to the meticulous execution of our vision, they have been a joy to work with.',
    name: 'Client Name',
    role: 'Studio Head',
    company: 'Company Name',
    service: 'Creative',
    consent: false,
    placeholder: true,
  },
  // from current #6 (medium) → Campaigns
  {
    id: 't-7',
    quote: 'They exemplify professionalism and offer invaluable insights. Their execution was impeccable.',
    name: 'Client Name',
    role: 'Marketing Manager',
    company: 'Company Name',
    service: 'Campaigns',
    consent: false,
    placeholder: true,
  },
  // from current #7 (long; removes the "Hell Let Loose" chip and metric claims) → Campaigns
  // current #8 (Team17) duplicated #7's client and carried a "1minus1 team" mention — dropped.
  {
    id: 't-8',
    quote:
      'Exceptional work across the board — campaigns drove a real revenue uplift and supported rapid audience growth ahead of our launch.',
    name: 'Client Name',
    role: 'Publishing Director',
    company: 'Company Name',
    service: 'Campaigns',
    consent: false,
    placeholder: true,
  },
];

/** True while any quote in the shipped set is still a placeholder. */
export const hasPlaceholderTestimonials = TESTIMONIALS.some((t) => t.placeholder);
