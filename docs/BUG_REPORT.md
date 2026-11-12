# BUG_REPORT.md — Phase 1 audit (2026-11-12)

Read-only QA audit. No source files were edited. Evidence screenshots: `docs/screenshots/audit/<page>-<width>.png` (6 routes × 7 widths, 42 files). Lighthouse JSON kept in `/tmp/opencode/lh/*-prod.json` (production build via `astro preview`, mobile emulation).

## Gates run (all green)

| Gate | Result |
|---|---|
| `npm install` | OK |
| `npm run build` | ✅ 6 pages, chunk-size warning only (BUG-012) |
| `npm run check` | 0 errors, 0 warnings, **1 hint** (BUG-010) |
| `npm run links` | PASS |
| `npm run headings` | PASS (exactly one `<h1>` per page, no level jumps) |
| `npm run check:brand` | PASS |
| Console (all 6 routes) | **0 errors** (the 404 page logs one error — its own 404 status; expected) |
| Horizontal scroll at 1920/1440/1280/1024/768/430/390 | none on any route |
| Broken / missing-alt images | none |
| `lang` attribute | `en` on all pages |

## Lighthouse (production build, mobile)

| Page | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| `/` | 98 | 96 | 100 | 69 |
| `/about` | 100 | 100 | 100 | 100→69 |
| `/contact` | 97 | 100 | 100 | 69 |

SEO 69 on every page is **only** `is-crawlable` — caused by the intentional pre-launch guard `noindex, nofollow` (see BUG-014). Home's a11y 96 drops from two contrast failures (BUG-006) and one label/name mismatch (BUG-007). Home TTI 4.5 s driven by the always-on three.js experience (noted under perf recommendations).

---

## Summary table

Severity: Critical / High / Medium / Low. Effort: S (<30 min) / M (<2 h) / L (larger).

| ID | Page | Area | Sev | Description | Evidence | Suspected file:line | Proposed fix | Effort |
|---|---|---|---|---|---|---|---|---|
| BUG-001 | `/` | Content (launch blocker) | **Critical** | All case-study cards link to **11 external `https://1minus1.com/case-studies/…` URLs** (no `target`/`rel`), showreel + testimonials + "Maison BAP" authorship are 1minus1 content. Known open-items C1/B2. Site cannot ship like this. | `dist/index.html` grep; `audit/home-1440.png`; brand-scan external-link dump | `src/components/Hero.astro`, `CaseStudies.astro`, `Testimonials.astro`, `src/data/services.ts`, `src/scripts/case-studies.ts` | Needs decision — replace with real Decbricks content/case studies (owner items A12/C1); until then consider hiding the Work section or excluding `/` (already) from sitemap | **L (owner-blocked)** |
| BUG-002 | `/services` | Content / SEO | **Critical** | Meta description + page copy are 1minus1's ("An award-winning partner for games studios and publishers…"), client-logo pool commented as 1minus1 CMS dump. Known open-items C2/B2. `/services` is also deliberately excluded from sitemap. | `dist/services/index.html` head grep; `src/data/services.ts:175` | `src/pages/services.astro` (+ `SERVICES_HERO`/`SERVICES` in `src/data/services.ts`) | Needs decision — replace with Decbricks services copy (open-items A12); SEO title/description must come from `docs/Implementation-plan.md` verbatim when available | **L (owner-blocked)** |
| BUG-003 | `/contact` | Functionality | **High** — **Fixed** (batch 1: `name` attrs added to all five fields; payload reads verified FOUND live; build ✅) | All real inputs (email/name/company/message/terms) have **no `name` attribute**; `contact.ts` builds the payload via `[name="…"]` queries → every value resolves to `''`. Once an endpoint (A7) is configured, the form can never transmit data. Currently masked by the graceful "book a call" fallback. Verified live: filled form → all `[name]` lookups NULL. | evaluate probe: `payloadReads {name,email,company,message} = NULL` with filled fields | `src/components/ContactForm.astro:120–166` (inputs), `src/scripts/contact.ts:182` (`value()` reads by name) | Add `name="email|name|company|message"` (+ terms handling) to the five inputs/textarea; keep ids for labels | **S** |
| BUG-004 | all pages | Nav / brand / a11y | **High** — **Fixed** (batch 1: `menu.ts` highlights Contact by href + plain-page route-match branch preserves SSR `router-link-active`/`aria-current`; verified on all 4 routes + hover; 42 after-screenshots clean) | The **Contact highlight pill loses its SSR classes at runtime**: `menu.ts:53` `isHighlight = dataAnchor === '#contact'`, but `Header.astro` changed Contact to a plain href (`anchor: ''`) → `bg-darkPurple`/`text-neonGreen` are toggled **off**, pill renders bare black `rgb(0,0,0)` text on every page (off-palette; the only non-brand colour found anywhere). Also inverts the emphasis design (highlight pill = empty pill, regular pills normal). | evaluate: Contact pill `color=rgb(0,0,0)` while other pills `rgb(128,0,32)`; `audit/home-1440.png` | `src/scripts/menu.ts:53,71–78`; `src/components/Header.astro:10` (Contact `anchor: ''`) | Change the highlight condition to the Contact route (`rawHref === '/contact'`) instead of `dataAnchor === '#contact'`; verify the stripped toggles then preserve the SSR state at rest | **S** |
| BUG-005 | `/` (case-study filter) | A11y / contrast | Medium — **Needs decision** (in-palette options: burgundy pill bg = 10:1, or ≥18.66px bold label) | "ALL" filter pill: off-white `#FFF9F2` text on coral `#D45060` at **3.92:1**, 12 px — below the 4.5:1 minimum (brand rule: coral only for large/bold text). Lighthouse a11y failure. | Lighthouse `color-contrast` item 1 | `src/components/CaseStudies.astro` (filter bar), class hook `parts-btnBlock` there | Needs decision (design): darken pill bg to burgundy `#800020` (10:1 ✅) or enlarge/bold the label ≥18.66 px | **S** |
| BUG-006 | `/` (testimonials) | A11y / contrast | Medium — **Needs decision** (in-palette options: Off-White text on the coral card = 3.92:1, still small-text fail → burgundy card bg + Off-White text = 10:1) | "DRAG TO NAVIGATE" marquee-cursor text: burgundy `#800020` on coral `#D45060` at **2.63:1**, 12 px — fails on both counts (same known C6 family). | Lighthouse `color-contrast` items 2–3; `audit/home-1440.png` testimonials section | `src/components/Testimonials.astro:1001,1004` (`.parts-marqueeCursor__text`) | Needs decision (design): swap text to Off-White on the coral card, or card bg to Beige with burgundy text | **S** |
| BUG-007 | `/` | A11y | Medium — **Fixed** (batch 2 + final: logo/scroll/scroll-top labels include visible text; the 11 case-study cards dropped `aria-label` entirely — their visible text is doubled by the hover-slide markup ("Adhoc StudioAdhoc StudioBrand Web"), which no phrased name can contain, so the accessible name is now computed from contents; Lighthouse `label-content-name-mismatch` cleared, home a11y 96 with colour-contrast as the only remaining failure) | Lighthouse `label-content-name-mismatch` ×3: logo link (`aria-label="Go to homepage"` vs visible "Decbricks"), `SCROLL TO EXPLORE` button, case-study card (`aria-label="Case study: …"` vs visible text) — visible text must be contained in the accessible name. | Lighthouse `label-content-name-mismatch` items | `src/components/Header.astro` (logo), `src/components/Hero.astro` (scroll button), `src/components/CaseStudies.astro` (card) | Include the visible text in each aria-label (e.g. `aria-label="Decbricks — Go to homepage"`, `"Scroll to explore"`, `"Case study: Adhoc Studio — Adhoc Studio, Brand, Web"` or trim the visible-text vs label mismatch) | **S** |
| BUG-008 | all | A11y / touch | Medium — **Fixed** (batch 2: invisible `::after` hit-areas in `decbricks.css`; effective heights now 26/27/26px, visuals untouched) | 3 interactive targets < 24 px CSS height: "Scroll To Explore" (16 px), "Rise to the top" (17 px), "Manage Cookies" (16 px). | evaluate tap-target sweep | `src/components/Hero.astro`, scroll-top button (Footer/menu module), `src/components/CookieBanner.astro` | Pad hit areas to ≥24 px via padding/pseudo-element without changing visuals | **S** |
| BUG-009 | `/contact` | A11y / a11y hygiene | Low — **Won't fix** (false positive: `sr-only` renders `position:absolute; clip-path:inset(50%); aria-hidden; tabindex=-1` — fully invisible to sighted users and AT; the Phase-1 probe read the CSS `visibility` property, not paint state) | Honeypot `_gotcha` input renders visible at 1×1 px (`display:block`, opacity 1) — fine for sighted users, but it is technically focusable/visible; standard is visually-hidden (not `display:none`, which breaks bots). | evaluate: `rect w=1 h=1, visibility=visible, offsetParent=true` | `src/components/ContactForm.astro` (honeypot wrapper) | Move to `position:absolute; left:-9999px` (keeps it in layout for bots, fully invisible) | **S** |
| BUG-010 | build | Hygiene | Low — **Fixed** (batch 2: import removed; `astro check` now 0 errors/0 warnings/**0 hints**) | `astro check` hint: unused `SITE` import in Header.astro. | `npm run check` output | `src/components/Header.astro:2` | Remove the import | **S** |
| BUG-011 | `/`, `/services`, `/the404game` | SEO | Low — **Fixed** (batch 3: home now emits `Organization` + `WebSite` JSON-LD via existing `lib/schema` helpers; verified in built HTML) | No JSON-LD structured data on home/services/game (about + contact have `AboutPage`/`ContactPage` + `Organization` + `BreadcrumbList`). Home should carry `Organization` (+ `WebSite`); `Organization.logo` currently points at `fav1.png` (temp favicon, see BUG-014). | head grep of built pages | `src/pages/index.astro` (no `schema` prop passed to `Base.astro`) | Add Organization/WebSite JSON-LD to home via the existing `schema` prop | **S** |
| BUG-012 | build | Hygiene | Low — **Fixed** (batch 3: removed empty `src/content/` (unused by any code — data lives in `src/data/*.ts`), set `vite.build.chunkSizeWarningLimit: 600` with rationale comment; build now 0 warnings) | Two build warnings: (a) vite chunk > 500 kB (three.js/GSAP vendor), (b) `[glob-loader] No files found in src/content/work` + deprecation (auto-generated collections). No functional impact. | build + dev logs | `astro.config.*` (chunkSizeWarningLimit / manualChunks), `src/content/work/` (empty) | (a) raise limit or split vendor chunk (zero-dep config change); (b) delete empty folder or define `content.config.ts` | **S** |
| BUG-013 | all | A11y polish | Low — **Needs decision** (kept template hover behaviour) | Contact-pill hover feedback is very subtle in the pill bar: `hover:bg-white` on the off-white pill container barely registers; hover label slide works (14/14 chars animate) but the bg change is nearly invisible. | hover probe: bg → `rgb(255,249,242)` | `src/components/Header.astro:43` (same class string) | Needs decision (design): hover could match the template's `focus:bg-white`-visible state or add a subtle border/colour shift on the pill bar — keep template language | **S** |
| BUG-014 | launch checklist | SEO / deploy | **High (launch blocker, intentional today)** — **Documented** (batch 3: launch-day checklist added to `docs/open-items.md` §E; no behaviour change until owner confirms launch date) | `noindex, nofollow` on every page (`PUBLIC_ENV !== 'production'` guard, `Base.astro:44–48`) + `robots.txt` `Disallow: /` — **deliberate pre-launch guards**. Must be flipped at deploy: set `PUBLIC_ENV=production` and rewrite robots allowlist; sitemap already excludes `/services` while BUG-002 stands. Also: favicon is a single 274-byte PNG (`fav1.png`), no SVG/ICO/apple-touch-icon; OG image `og-default.png` is the temporary one (open-items A6). | head grep; `dist/robots.txt`; `public/og-default.png` (17.8 KB) | `src/layouts/Base.astro:44–48`, `public/robots.txt`, open-items A1/A6 | Launch-day checklist item (owner decision, needs dates). Document in PROGRESS/AGENTS "Known issues" | **S (config)** |
| BUG-015 | all pages | Animations / WebGL | **Critical** — **Fixed** (post-QA user report: "animations and pictures break when going from one page to another"; reattach fix + 5-swap gauntlet + reload verified on dev and production preview, zero console errors) | Both `canvas.webgl` elements live inside `.page` (in `Footer.astro:251–252`), which the client-side swap in `page-transition.ts` replaces wholesale (only the persistent header is preserved). After every route transition the renderers kept drawing to the detached old canvases while the new canvases sat at their default 300×150 size. User-visible effects: fixed WebGL background dead after any navigation, and on the home hero the **showreel video card disappears** after navigating away and back (it is drawn by WebGL — the DOM `.start` is `lg:invisible` on desktop). Fresh load / reload were unaffected (boot re-runs `initWebGL`). | `stages/2-about-after-swap.png` vs `1-home-fresh.png`; evaluate probe: canvases 300×150 after swap, 1440×900 on fresh load | `src/scripts/webgl/impl.ts` (`createExperience` canvases/renderers), `src/components/Footer.astro:251–252`, `src/scripts/page-transition.ts` (swap), `src/scripts/main.ts` (`onAfterSwap`) | New `reattachCanvases()` in the WebGL experience: re-query `canvas.webgl`, no-op if unchanged, otherwise create fresh renderers on the new canvases (old ones `dispose()` + `forceContextLoss()` to avoid GPU-context exhaustion), re-apply size/pixelRatio/colorSpace; called from `main.ts` `onAfterSwap` and the facade's chunk-load sync. Zero new deps. | **S** |

## Content / open-items cross-reference (verified live, not new bugs)

- **A2 Cal.com**: not configured; `/contact` shows the fallback card and logs `[decbricks] Cal.com link not configured (open-items A2)` — graceful fallback confirmed working.
- **A7 contact endpoint / email**: `CONTACT_ENDPOINT`/`EMAIL` empty; mailto fallback wired (subject hard-codes "decbricks.com" — update if A1 domain changes).
- **Form validation** works otherwise: empty submit → "Please complete the highlighted fields.", focus moves to first invalid field, `aria-invalid` set, honeypot respected, status element is an `aria-live` region. Labels on every field.
- **Nav / menu**: mobile menu opens, scroll locks, links visible, ESC closes cleanly. Skip-link works. Focus-visible outlines solid (2–3 px) on everything interactive.
- **Header pills** (other than BUG-004): active-state matches route, char-slide hover animates 14/14.
- **About fixes verified**: illustration no longer overflows into Philosophy; Philosophy section clears the fixed nav; opaque pill nav; footer WebGL coral `#D45060` + hover label colour — all good at every width.
- **Overflow counts** (`overflowers` up to ~450) are the template's intentional bleed (giant display words clipped by `overflow-hidden`); zero horizontal scroll at all widths on all routes.

## Performance notes (production numbers)

- Home TTI 4.5 s / TBT 140 ms: three.js experience (`src/scripts/webgl/experience.ts`, 48 KB + three.js) loads on **every** page. Candidate improvement (Phase 2 decision): defer/skip WebGL where unused (e.g. not on `/contact`). No new deps.
- Home FCP/LCP 1.1 s, CLS 0.005 — good. About/contact excellent (FCP 0.9–1.8 s, TBT 30–40 ms).
- Font payloads preloaded (FK Raster, Bricolage, Hanken) — `font-display` fine, no FOUT observed at any width; Departure Mono intentionally not preloaded.

## Could not verify (and why)

1. **`prefers-reduced-motion` at runtime** — Playwright MCP `emulate_media` only supports `screen`/`print`; reduced-motion paths are implemented in code (static check done) but not end-to-end exercised.
2. **Firefox / WebKit** — only Chromium engine builds are installed in the Playwright cache; no identifiable firefox/webkit binaries. Chromium-only.
3. **Real form submission end-to-end** — no endpoint configured (A7); payload-read defect (BUG-003) verified statically + live DOM probe, but the actual POST/mailto path can't be exercised.
4. **Cal.com embed on mobile** — no embed exists yet (A2 fallback card verified instead).
5. **OG image rendering on social platforms** — image file exists (temp, A6); not validated against Facebook/Twitter validators.
6. **Exact contrast of `color-mix`/oklab derived pairs** — spot-checked the two failing pairs Lighthouse reported; remaining oklab composites approximate (all within palette derivatives).

## Prioritised fix plan (Phase 2 batches, grouped by file)

- **Batch 1 — quick wins, Critical/High code bugs (S each)**
  - `src/components/ContactForm.astro` + `src/scripts/contact.ts`: BUG-003 (add `name` attrs).
  - `src/scripts/menu.ts` (+ verify `Header.astro` state): BUG-004 (Contact pill highlight).
- **Batch 2 — a11y & brand polish (CSS/attr-level)**
  - `CaseStudies.astro` BUG-005 (decision: pill colour), BUG-007 (card label) · `Testimonials.astro` BUG-006 (decision: marquee text colour) · `Hero.astro` BUG-007/BUG-008 · `CookieBanner.astro` + scroll-top BUG-008 · `ContactForm.astro` BUG-009 · `Header.astro` BUG-010, BUG-013.
- **Batch 3 — SEO/metadata**
  - `index.astro` BUG-011 (JSON-LD) · `Base.astro`/robots BUG-014 (document launch checklist; no behaviour change until owner confirms) · favicon/OG → open-items A6.
- **Batch 4 — owner-blocked (Needs decision; no copy invented)**
  - BUG-001 (home case studies/showreel/testimonials — A12/C1), BUG-002 (services copy — C2/B2), A2 Cal.com, A7 endpoint/email.
- **Batch 5 — build hygiene**
  - BUG-012 (chunk limit + empty content folder).

Each batch: `npm run build` → re-test affected pages at all 7 widths → save `docs/screenshots/audit/<page>-<width>-after.png` → mark status here.
