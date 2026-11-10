# Open items (owner must provide / decide)

Agent: never invent these. Implement safe fallbacks, keep this list current, mark resolved with date.

## A. Assets, content, credentials
| # | Item | Needed for | Fallback until provided |
|---|---|---|---|
| A1 | Production domain (existing code hints `decbricks.com`) | canonical, sitemap, OG, schema | `astro.config` `site` + `SITE.url` from env; confirm |
| A2 | Cal.com `username/event-slug` (+ plan: Cal.com cloud vs self-host origin) | booking embed | fallback card (email/phone/direct link) |
| A3 | Contact phone numbers (E.164 + display + label, WhatsApp?) | numbers section, schema `contactPoint` | section hidden + dev warning |
| A4 | Contact email + physical/registered address (if to be public) | schema, footer, form fallback | omitted |
| A5 | Team: names, roles, bios, photos (≥800px, consent), LinkedIn | Meet the Team | clearly-marked placeholder cards, `noindex` not needed; no fake faces |
| A6 | Logo (SVG, light + dark versions), favicon set, OG image 1200×630 | header, `<head>`, social | text wordmark; plain brand PNG flagged TEMP |
| A7 | Contact-form delivery: endpoint (Web3Forms/Formspree/Resend/own API), recipient inbox, spam strategy | form submit | UI works, shows `mailto:` fallback |
| A8 | Social profile URLs (LinkedIn, Instagram, X, YouTube…) | footer, schema `sameAs` | omitted (template links are 1minus1's — remove) |
| A9 | Google Search Console verification token (or DNS method) | GSC | env `PUBLIC_GSC_VERIFICATION` empty ⇒ meta omitted |
| A10 | Analytics choice (GA4/Plausible) + cookie categories | banner wiring | none |
| A11 | Privacy Policy + Terms pages (footer links exist: /privacy-policy, /terms) | legal | links removed until pages exist |
| A12 | Copy for Home and Services pages in Decbricks voice (not in brief) | rest of site | see C1 |
| A13 | Production webfont files / licence confirmation (see B1) | typography | trial files used for dev |
| A14 | Client / project proof (logos, case studies) if wanted | social proof | none shown |
| A15 | **Missing brief**: `docs/Implementation-plan.md`/`docs/mapping.md` cite "brief §4.2 B" for the Contact intro copy ("Let's Start Something Great." block — two paragraphs under the mapped H2/H3), but the brief itself is not in the repo. Please supply the supplied verbatim paragraphs (or a pointer to the brief). | /contact content island, block 5B | H2/H3 render; one neutral navigation sentence + contact-method links shown; verbatim paragraphs slot straight into `src/pages/contact.astro` ($ startProjectBody) |

## B. Licensing / compliance flags
- **B1 — Fonts:** supplied files are named `*TRIAL*` (KH Interference, KH Teka, KH Teka Mono, FK Raster Trial). Trial builds usually exclude web/commercial use and may have reduced glyph sets. You said you hold a licence: confirm it covers **web embedding** and obtain the non-trial webfont/desktop files before launch.
- **B2 — 1minus1 identity:** the template ships 1minus1 copy, logos, videos, client logos, case studies, testimonials, social links and fonts (Neue Power, OffBit, Nohemi — typically licensed to their owner). Before public launch, remove or replace all 1minus1-origin copy/media/fonts and verify you have rights to the code you reuse. Final check: `grep -ri "1minus1" dist/` returns nothing user-visible.
- **B3 — Cookies:** Cal.com iframe and any analytics are third-party; align with CookieBanner categories and the privacy policy.

## C. Scope decisions (agent proceeds with the default; owner can override)
| # | Question | Default |
|---|---|---|
| C1 | Home (`/`) and `/services` still contain 1minus1 content (Hero, CaseStudies 118 KB, Testimonials 59 KB, ServicesClients, `data/services.ts`). Brief covers only About + Contact + global brand + SEO. | Rebrand colours/fonts/metadata only; **do not** rewrite their copy; flag as launch blocker via B2. If owner supplies copy (A12), swap in `data/services.ts` shape-preserving |
| C2 | Services-page nav link / sitemap entry while content is still 1minus1's | Keep route, mark `noindex` until C1 resolved; omit from sitemap; hide from header if owner prefers |
| C3 | `the404game` easter egg | Keep, `noindex`, retitle |
| C4 | `errorRed` colour (needs to differ from coral accent) | warm red derived value; owner may pick |
| C5 | `neonGreen` replacement (beige vs coral highlight) | Warm Beige; revisit after visual check |
| C6 | Coral hover fills fail small-text contrast | darken via `color-mix` toward burgundy only where text sits on the fill |
| C7 | Trailing slash policy | `never` (`/about`) |
| C8 | Static vs server output for the form endpoint | static + third-party endpoint |
| C9 | Footer marquee words (Innovative / Distinct / Authentic / Creative / Brave) — template artefact, no 1minus1 identity in the words themselves | Keep: neutral adjectives, already brand types/colours; owner may supply replacements |

## D. Resolved
(none yet)
