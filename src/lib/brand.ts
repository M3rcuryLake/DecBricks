/**
 * Brand-name typographic treatment (FONT-SWAP-PROMPT §4).
 * Every VISIBLE "Decbricks" in copy renders in `.font-brand` (FK Raster).
 * Escape first so `set:html` output is safe for arbitrary strings, then
 * case-insensitively wrap the word, preserving its original casing.
 */
export const BRAND = 'Decbricks';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);

/** HTML-escaped text where every `Decbricks` word is a `.font-brand` span. */
export function brandify(text: string): string {
  return escape(text).replace(/\bDecbricks\b/gi, (m) => `<span class="font-brand">${m}</span>`);
}

/** True when a string contains the brand word (for decisions at call sites). */
export const hasBrand = (s: string) => /\bDecbricks\b/i.test(s);
