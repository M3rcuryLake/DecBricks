# Open items (owner must provide / decide)

Agent: never invent these. Implement safe fallbacks, keep this list current, mark resolved with date.

## A. Assets, content, credentials
| # | Item | Needed for | Fallback until provided |
|---|---|---|---|
| A1 | Production domain (existing code hints `decbricks.com`) | canonical, sitemap, OG, schema | `astro.config` `site` + `SITE.url` from env; confirm |
| A2 | Cal.com `username/event-slug` (+ plan: Cal.com cloud vs self-host origin) | booking embed | fallback card (email/phone/direct link). 2026-11-13: fallback copy is visitor-neutral in both envs — "Online booking is coming soon." (dev signal lives in console.warn + sr-only status, `CalEmbed.astro`) |
| A3 | Contact phone numbers (E.164 + display + label, WhatsApp?) | numbers section, schema `contactPoint` | section hidden + dev warning |
| A4 | Contact email + physical/registered address (if to be public) | schema, footer, form fallback | omitted |
| A5 | Team: names, roles, bios, photos (≥800px, consent), LinkedIn | Meet the Team | clearly-marked placeholder cards, `noindex` not needed; no fake faces |
| A6 | ~~Logo (SVG, light + dark versions), favicon set, designed OG image 1200×630~~ **Partially resolved 2026-11-12:** owner supplied `docs/logo.png` (multi-colour copper blob, transparent bg) — favicon set + OG lockup + `.font-brand` logo lockup shipped (see Design-handoff "Logo lockup"). **Still open:** SVG source + light/dark monochrome variants if the brand wants them; confirm usage rights for the supplied PNG (B1-style licence check) | header, `<head>`, social | shipped from the supplied PNG; SVG/variants slot in via the same `.font-brand::before` mechanism (swap the files, no CSS change) |
| A7 | Contact-form delivery: endpoint (Web3Forms/Formspree/Resend/own API), recipient inbox, spam strategy | form submit | UI works, shows `mailto:` fallback |
| A8 | Social profile URLs (LinkedIn, Instagram, X, YouTube…) | footer, schema `sameAs` | omitted (template links are 1minus1's — remove) |
| A9 | Google Search Console verification token (or DNS method) | GSC | env `PUBLIC_GSC_VERIFICATION` empty ⇒ meta omitted |
| A10 | Analytics choice (GA4/Plausible) + cookie categories | banner wiring | none |
| A11 | Privacy Policy + Terms pages (footer links exist: /privacy-policy, /terms) | legal | links removed until pages exist |
| A12 | Copy for Home and Services pages in Decbricks voice (not in brief) | rest of site | see C1 |
| A13 | Production webfont files / licence confirmation (see B1) | typography | Bricolage/Hanken/Departure Mono are OFL — production-ready as shipped; only FK Raster still carries a "Trial" filename (same non-trial TTF body as before — confirm web licence, B1) |
| A14 | Client / project proof (logos, case studies) if wanted | social proof | none shown |
| A15 | **Missing brief**: `docs/Implementation-plan.md`/`docs/mapping.md` cite "brief §4.2 B" for the Contact intro copy ("Let's Start Something Great." block — two paragraphs under the mapped H2/H3), but the brief itself is not in the repo. Please supply the supplied verbatim paragraphs (or a pointer to the brief). | /contact content island, block 5B | H2/H3 render; one neutral navigation sentence + contact-method links shown; verbatim paragraphs slot straight into `src/pages/contact.astro` ($ startProjectBody) |
| A16 | **Font visual pass** (no browser tool in the build env): open `/`, `/about`, `/contact` at 375/768/1280/1920. 2026-11-11: display role = FK Raster (narrower than both previous faces — no overflow risk), but giant ghost numerals render ~18% narrower than the KH Interference baseline — confirm the card/hero compositions still look balanced; confirm brand `.font-brand` words sit ≥14px; confirm display headings render at regular weight (700 requested, single-weight face, synthesis off). | all pages | gate is green (build/check/check:brand/headings/links); only the eyeball pass is outstanding |
| A17 | **/about @<lg cookie-banner residual (accepted, owner may override)**: the About hero nav has 7 pills → 4 wrapped rows at 375; even lifted 40px while the banner is visible, rows 2–4 sit under the card (banner zone = 186px card + 50px margin of an 812px viewport — geometrically impossible to clear without compressing the hero, i.e. a redesign). Fixed-overlay overlap is dismissed in one tap; `/` `/contact` `/services` are fully clear at scroll-0 (probes p0-t2*.cjs). Options if the owner wants zero overlap: shorten About nav labels, allow 3-per-row wrap, or auto-dismiss the banner on scroll. | /about 375/768 | accepted residual (phase 0.2b); banner never blocks scroll or the page below |
| A18 | **Footer studio time & availability + newsletter**: `PUBLIC_STUDIO_TZ` (proposed `Asia/Kolkata`), `PUBLIC_STUDIO_AVAILABILITY` (`open`/`limited`/`closed`), `PUBLIC_NEWSLETTER_ENDPOINT` + list owner. | footer status & P4b newsletter | hidden until supplied (never auto-derived from hours; newsletter blocked until A11 privacy page exists) |
| A19 | **Proposed footer labels**: `"Start a project"`, `"Book a call"`, `"Open for projects"`, `"Studio time"` (`src/data/footer.ts`). | footer CTA & status | shipped as marked PROPOSED defaults; owner approves or replaces |

## B. Licensing / compliance flags
- **B1 — Fonts:** KH faces were removed on 2026-11-10 (FONT-SWAP-PROMPT). Now shipping: Bricolage Grotesque + Hanken Grotesk + Departure Mono — all **OFL**, no licence action needed. Remaining flag — **raised in priority 2026-11-11**: FK Raster is now the site's display face (headings h2, giant numerals) as well as the brand word, so a web-embedding licence for it is launch-critical. Confirm in writing; the shipped `fk-raster-roman-compact.woff2` derives from `FKRasterRomanCompact-Smooth.ttf` (filename clean; `src/assets/Fonts/` is git-ignored, not redistributed, and also holds `FKRasterRomanCompactTrial-Smooth.otf` — trial licence terms unknown).
- **B2 — 1minus1 identity:** the template ships 1minus1 copy, logos, videos, client logos, case studies, testimonials, social links and fonts (Neue Power, OffBit, Nohemi — typically licensed to their owner). Before public launch, remove or replace all 1minus1-origin copy/media/fonts and verify you have rights to the code you reuse. Final check: `grep -ri "1minus1" dist/` returns nothing user-visible.
- **B3 — Cookies:** Cal.com iframe and any analytics are third-party; align with CookieBanner categories and the privacy policy.
- **B4 — About pictures (added 2026-11-12):** the 7 About media-card images (`src/assets/about/*.webp`, from owner-supplied `docs/aboutPics/`) ship as-is on the owner's say-so, but the **Vision poster visibly credits a third party ("Zeka Design", "POSTER BY ZEKA DESIGN") in-image** — provenance/licence unknown. Before launch: confirm rights or swap the image (`about.ts` id `vision`). Also note the set carries no model/property-release info (halftone portraits).

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
| C9 | Footer marquee words (Innovative / Distinct / Authentic / Creative / Brave) — template artefact, no 1minus1 identity in the words themselves | Retired in footer Phase 1 (`footer-redesign-plan.md`); preserved in `FOOTER.marqueeRetiredWords` (`src/data/footer.ts`) as optional reference copy |
| C10 | Discovered 2026-11-12 (flare task): the /services hero WebGL trail does **not** draw on a fresh full-page load (entrance timeline stays paused after the loader's `hero-transition-start` emissions), only after a client-side nav swap. Pre-existing template behaviour, owner-visible only on direct URL loads. | Leave as-is (out of scope of the flare fix); investigate loader event ordering (`hero-transition-start` vs `transition-entrance-done`) if owner wants it fixed |
| C11 | Discovered 2026-11-12 (flare task): `parseCssColor` (webgl/impl.ts) cannot parse `oklab(...)`/`color(...)` computed strings (only `rgb()`/`oklch()`), so any element coloured via a `color-mix` token falls to the caller's fallback. Now harmless for the trails (both use `text-purple`, parsed as `rgb()`), but a latent trap for future WebGL-coloured elements. | Leave; add `oklab()`/`color()` parsing only if a future element needs it |

## D. Resolved
(none yet)

## E. Launch-day checklist (from BUG_REPORT BUG-014; intentional guards until launch)
1. Set `PUBLIC_ENV=production` at deploy — `Base.astro` then emits `index, follow…` instead of the current pre-launch `noindex, nofollow` on every page.
2. Rewrite `public/robots.txt` (currently `User-agent: * / Disallow: /`) to allow crawling; keep `/services` disallowed while C1/C2 stand.
3. Regenerate `og-default.png` with the real FK Raster wordmark (A6) and add a proper favicon set (SVG/ICO/apple-touch-icon).
4. Confirm A1 domain matches `PUBLIC_SITE_URL`/canonicals before flipping 1.
