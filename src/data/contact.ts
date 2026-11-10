/**
 * Contact-page data. Every field starts EMPTY — the owner must supply the real
 * values (open-items.md A2/A3/A4/A7). Nothing is invented; when an array or
 * string is empty the UI degrades to the documented fallback instead.
 */

export interface CalConfig {
  /** Cal.com link in `username/event-slug` form; '' = not configured. */
  link: string;
  /** Origin of the Cal.com deployment (app.cal.com for cloud). */
  origin: string;
  /** Fallback deep link opened in a new tab when the embed is unavailable. */
  bookingUrl: string;
}

export interface PhoneNumber {
  label: string;
  /** Human-readable display, e.g. "+91 90000 00000". */
  display: string;
  /** E.164 used for href, e.g. "+919000000000". */
  e164: string;
  /** Optional WhatsApp deep link. */
  whatsapp?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  /** Path under src/assets/team/ (imported via astro:assets). */
  photo?: string;
  linkedin?: string;
  /** Placeholder cards are visibly flagged until real members arrive (A5). */
  placeholder?: boolean;
}

export const CAL: CalConfig = {
  link: import.meta.env.PUBLIC_CAL_LINK || '',
  origin: 'https://app.cal.com',
  bookingUrl: import.meta.env.PUBLIC_CAL_BOOKING_URL || '',
};

export const EMAIL = import.meta.env.PUBLIC_CONTACT_EMAIL || '';

export const PHONES: PhoneNumber[] = [];

/** Contact-form delivery endpoint (Web3Forms/Formspree/owner worker) — A7. */
export const CONTACT_ENDPOINT = import.meta.env.PUBLIC_CONTACT_ENDPOINT || '';
