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
| 6 | SEO & structured data | ✅ 2026-11-10 (OG image = TEMP brand PNG — open-items A6) |
| 7 | Performance & accessibility | ✅ 2026-11-10 (three.js → async chunk; numeric Lighthouse run left as follow-up) |
| 8 | Cleanup & handoff | ✅ 2026-11-10 (template webfonts deleted, link checker added; launch blockers tracked via B2 + open-items C1/C3/C9) |

## Blocked / waiting on owner
See `docs/open-items.md` §A.

## Status
All 9 phases (0→8) are complete as of 2026-11-10. Launch blockers (owner-supplied values) live in `docs/open-items.md` §A/§B — the site is dev-complete with graceful fallbacks everywhere, but `PUBLIC_ENV=production` should only ship after A1–A9 are resolved.

## Session log
(append: date · phase · what changed · build/check result · commit hash)
- 2026-11-10 · Phase 0 · Verified all docs against real repo; baseline build fails only on /contact (3 check errors, same file); no other pre-existing errors. Fonts found in `src/assets/Fonts/`. Docs/mapping corrected: services-page.ts is SERVICES-import-driven (needs optional-items generalisation), not N-generic.
- 2026-11-10 · Phase 5 · Contact page rebuilt: `ContactBlock`/`CalEmbed`/`TeamSection`/`ContactNumbers` + `src/data/team.ts`; `scripts/cal-embed.ts` (IntersectionObserver 400px, official `Cal(...)` queue loader loaded once-per-page, `Cal('inline')` idempotent per mount via WeakSet, `month_view`, light theme + `cal-brand:#800020`, 10s sanity timeout, `bookingSuccessful`/`linkFailed` handlers, fallback card, consent-gated on `essential-consent` via new `cookies-decided` bus event from cookies.ts); ContactForm → real `fetch` POST to `CONTACT_ENDPOINT` (FormData, honeypot `_gotcha`, aria-invalid + focus on invalid, sending/success/error states, `mailto:` fallback when endpoint or network missing); `main.ts` registers `initCalEmbed` boot + `onAfterSwap`; decbricks.css adds Cal skeleton/fallback/status + team-grid/numbers styles (compiled global.css lacks `sm:/lg:` grid cols and `min-w-44/min-h-44`); 5B paragraphs missing (brief §4.2 B not in repo → open-items A15) — block ships with supplied H2/H3 + one neutral nav sentence; TEAM empty ⇒ hidden + dev warning (A5); PHONES empty ⇒ hidden + dev warning (A3). Build ✅ 6 pages, check ✅ 0 errors. Skeleton/fallback-markup verified via `PUBLIC_CAL_LINK=…` build; prod fallback card verified.
- 2026-11-10 · Phase 6 · SEO/technical: hand-written `src/pages/sitemap.xml.ts` and `src/pages/robots.txt.ts` (prod: Allow + Sitemap; non-prod: `Disallow: /` — same gate as Base.astro; template `public/robots.txt`/`public/sitemap.xml` with 1minus1 URLs deleted). Sitemap lists indexable `/,/about,/contact` only — `/services` withheld while its content is 1minus1's (C2), 404 + the404game stay `noindex` (the404game now passes `noindex` explicitly). `scripts/check-headings.mjs` + `npm run headings` (per-page table: exactly one H1, no level skips — PASS on all 6 pages). Interim `og:image`: 1200×630 pure-Python flat brand PNG at `public/og-default.png` (wordmark needs the real logo — open-items A6, TEMP), absolute URL + `og:site_name`/`og:locale`/Twitter tags already in Base.astro. `schema.ts` provides Organization (contactPoint from PHONES when supplied)/WebSite/BreadcrumbList/AboutPage/ContactPage; `Service` entries intentionally skipped while Services content is 1minus1's (C1). Typed meta verified: dist `robots.txt` = `Disallow: /` in dev builds; sitemap locs = canonic URLs ✓; GSC note stays open-items A9. Build ✅, check ✅ 0 err, headings ✅.
- 2026-11-10 · Phase 6 note · Internal About↔Contact↔Services text links deferred (A12/A15 owner copy must land first — flagging here so it isn't forgotten; header/footer already crosslink all existing pages).
- 2026-11-10 · Phase 8 · Cleanup/handoff: template webfonts `neue-power/nohemi/OffBit/OffBit101 .woff2` deleted from `public/fonts` (verify: no @font-face or preload references — grep clean; only KH faces ship: 7 files, preload = kh-teka regular+bold only). Template `public/robots.txt`/`public/sitemap.xml` already replaced by endpoints (Phase 6). `scripts/check-links.mjs` + `npm run links`: every internal href/src in dist resolves — PASS. Final `grep -ri 1minus1 dist`: only `dist/index.html` (14 hits — Hero/CaseStudies/Testimonials 1minus1 copy) = expected open-items C1 launch blocker; about/contact/services/404/game are clean. Footer marquee words kept, logged as open-items C9. All scripts: build ✅ · check ✅ 0/0/1 · headings ✅ · links ✅.
- 2026-11-10 · Phase 7 · Performance/a11y: **WebGL lazy-split** — `experience.ts` is now a tiny facade; the three.js implementation moved to `src/scripts/webgl/impl.ts` loaded via dynamic `import()` from `initWebGL()` (non-blocking, chunk downloads while the loader intro plays; `rebuildPageTargets()` runs after late loads; consumers keep their existing `getWebGLExperience()` null-guards + `window.hasWebGL` fallback behaviour). `case-studies.ts` loses its static `three` import (types via `import type`, group via new `exp.createGroup()`). Result: render-blocking bundle **871 KB → 315 KB**; three.js + renderer now a separate 556 KB async chunk (`dist/_astro/impl.*.js`). Also: `core/gsap.ts` resize listener made `{passive:true}` (the other resize handlers were already debounced 150–200ms — verified loader.ts/gsap.ts/media.ts); **skip link** `part-skipLink` → `#main-content` added in Base.astro + decbricks.css (hidden until focus, brand pill); `id="main-content"` added to the 4 pages whose `<main>` lacked it (index/services/404/the404game — About/Contact had it); form error live-region + `aria-invalid`/focus management landed in Phase 5; Cal fallback announcements + tap targets ≥44px landed in Phase 5. Build ✅, check ✅, headings ✅ (PASS all pages).
- 2026-11-10 · Phase 7 note · Remaining perf items for owner/follow-up: numeric Lighthouse run (no browser tool here), banner/loader threshold tuning, replacing the 157 KB compiled CSS is out of scope (template artefact).
