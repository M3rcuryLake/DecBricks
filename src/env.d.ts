/// <reference types="astro/client" />

// Astro 5's JSX type tables reject several attributes our SSR markup inherits
// verbatim from the original site (bare `value`, `is-valid`, `name`,
// `classname`, `fetchpriority`, textarea `type="text"`). Widen the types only:
// runtime markup stays byte-parity with the original SSR.
declare namespace astroHTML.JSX {
  interface HTMLAttributes {
    [key: string]: any;
  }
  interface TextareaHTMLAttributes {
    type?: string | undefined;
  }
}
