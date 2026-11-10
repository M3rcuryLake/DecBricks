# Progress

Legend: ✅ done · 🔄 in progress · ⏳ pending · ⛔ blocked (see open-items.md)
Last updated: 2026-11-10 (agent session, Phase 0)

## Baseline facts (VERIFIED on real repo + build, Phase 0)
- Astro 5 + gsap + lenis + three. No Tailwind dep; `global.css` is compiled Tailwind v4 (≈157 KB, verified token block = 1.8 KB).
- Pages present: index, services, contact (BROKEN, confirmed: imports `astro:content` + `../content/config`, both missing → `astro build` fails on /contact and `astro check` reports 3 errors, all in contact.astro), 404, the404game. No /about.
- Source fonts are in `src/assets/Fonts/` (KHTekaTRIAL R/M/B, KHTekaMonoTRIAL R/B, KHInterferenceTRIAL R/B, FKRasterRomanCompact ttf+otf). Template woff2 in `public/fonts/` (neue-power, nohemi, OffBit, OffBit101).
- `public/` EXISTS on disk: fonts/, images/ (case-studies, clients, contact/computer-back+front 300–2000 webp+png, og-default.png, square-solid.png), videos/, fav1.png, robots.txt, sitemap.xml (stale 1minus1 ones).
- Build baseline (before fixes): `astro build` fails only at /contact (missing `pages` collection). 404 + the404game bundles ≈ 868 KB JS (three.js inlined; big but route-isolated).
- `astro check` baseline: 3 errors, all `src/pages/contact.astro`. No other TS errors.
- services-page.ts VERIFIED: imports `SERVICES`/`CLIENT_LOGOS` directly and uses them for ScrollTriggers (`SERVICES[0].id`, `SERVICES.forEach`, last-id maths) → NOT N-item generic as mapping.md assumed. Will be generalised in Phase 4 with an optional items param (see handoff).
- contact.ts VERIFIED: client-side validation only; fake "Message Sent!" success; no fetch/network.
- cookies.ts VERIFIED: essential-consent + analytics-consent cookies only. No third-party gate API (no bus event to await consent) → Cal.com loads lazily regardless, flagged B3.
- page-transition.ts VERIFIED: swaps `.page` children (keeps `.structure-menu` header), copies body/page className, re-runs `onAfterSwap` callbacks in main.ts. Inline body scripts never re-run (confirmed main.ts structure).
- Base.astro VERIFIED: default title/desc/og/canonical are 1minus1's; preloads neue-power + OffBit; `schema` slot exists.
- Footer ships YouTube/LinkedIn/Instagram links to 1minus1 profiles (must go); legal links /privacy-policy /terms (/terms also in ContactForm) resolve to 404 pages currently.

## Docs
| Doc | Status |
|---|---|
| AGENTS.md (root) | ✅ drafted — agent verifies in Phase 0 |
| docs/Implementation-plan.md | ✅ drafted |
| docs/tokens.md | 🔄 template tokens extracted; brand + as-built values pending |
| docs/mapping.md | 🔄 drafted from static analysis; verify in Phase 0 |
| docs/open-items.md | ✅ initial list |
| docs/Design-handoff.md | 🔄 skeleton |
| docs/about-section-data.md | ✅ source content |

## Phases
| # | Phase | Status |
|---|---|---|
| 0 | Recon & doc verification | ✅ 2026-11-10 |
| 1 | Brand colours | ✅ 2026-11-10 |
| 2 | Typography (KH Type) | ✅ 2026-11-10 |
| 3 | Shared scaffolding (site config, Base, prop-ified components, Header/Footer) | ✅ 2026-11-10 |
| 4 | About page | ✅ 2026-11-10 |
| 5 | Contact page (5A Cal.com, 5B CTA copy, 5C Team, 5D Numbers, form submit) | ✅ 2026-11-10 (fallbacks for missing owner data — see open-items A2/A3/A5/A7/A15) |
| 6 | SEO & structured data | ⏳ |
| 7 | Performance & accessibility | ⏳ |
| 8 | Cleanup & handoff | ⏳ |

## Blocked / waiting on owner
See `docs/open-items.md` §A.

## Session log
(append: date · phase · what changed · build/check result · commit hash)
- 2026-11-10 · Phase 0 · Verified all docs against real repo; baseline build fails only on /contact (3 check errors, same file); no other pre-existing errors. Fonts found in `src/assets/Fonts/`. Docs/mapping corrected: services-page.ts is SERVICES-import-driven (needs optional-items generalisation), not N-generic.
- 2026-11-10 · Phase 5 · Contact page rebuilt: `ContactBlock`/`CalEmbed`/`TeamSection`/`ContactNumbers` + `src/data/team.ts`; `scripts/cal-embed.ts` (IntersectionObserver 400px, official `Cal(...)` queue loader loaded once-per-page, `Cal('inline')` idempotent per mount via WeakSet, `month_view`, light theme + `cal-brand:#800020`, 10s sanity timeout, `bookingSuccessful`/`linkFailed` handlers, fallback card, consent-gated on `essential-consent` via new `cookies-decided` bus event from cookies.ts); ContactForm → real `fetch` POST to `CONTACT_ENDPOINT` (FormData, honeypot `_gotcha`, aria-invalid + focus on invalid, sending/success/error states, `mailto:` fallback when endpoint or network missing); `main.ts` registers `initCalEmbed` boot + `onAfterSwap`; decbricks.css adds Cal skeleton/fallback/status + team-grid/numbers styles (compiled global.css lacks `sm:/lg:` grid cols and `min-w-44/min-h-44`); 5B paragraphs missing (brief §4.2 B not in repo → open-items A15) — block ships with supplied H2/H3 + one neutral nav sentence; TEAM empty ⇒ hidden + dev warning (A5); PHONES empty ⇒ hidden + dev warning (A3). Build ✅ 6 pages, check ✅ 0 errors. Skeleton/fallback-markup verified via `PUBLIC_CAL_LINK=…` build; prod fallback card verified.
