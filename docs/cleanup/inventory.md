# Phase 1 — Codebase Inventory (`cleanup/2026-11-14`)

Read-only inventory produced from static AST/regex scans across `src/`, `public/`, `dist/`, `docs/`, `package.json`, `tsconfig.json`, and `astro.config.mjs` (supplemented by `depcheck`).

## A. Dead / Unused Items

| ID | Category | Item / File & Line | Evidence / Proof | Risk | Safe Action / Batch |
|---|---|---|---|---|---|
| A1 | Unused `public/` assets | 32 files (16 PNG+WebP sticker pairs, `3,083,193 B`) in `public/images/case-studies/` (`076efea6…`, `10225d36…`, `1fe4e18d…`, `3f56234a…`, `3f7a6730…`, `68945de5…`, `842fd75f…`, `92a44a91…`, `94eec461…`, `9f0d6357…`, `b52e32b4…`, `e17c25f2…`, `e4ce2cd8…`, `e70bd62c…`, `ef6eba72…`, `f566efd3…`) | 0 matches across `src/`, `dist/`, `global.css`, and `CaseStudies.astro`; leftover from 1minus1 `Testimonials` marquee stickers deleted in `950518b` (`open-items.md` §B2) | Low | Quarantine to `.cleanup-trash/` → full build + 404/Playwright gauntlet → delete |
| A2 | Unused `public/` favicon | `public/fav1.png` (`274 B`) | Added in day-one clone `7be4d2e`; 0 references in `src/`, `dist/`, `docs/`; replaced by `public/brand/favicon.ico` & `public/brand/icon-192.png` in `src/layouts/Base.astro` | Low | Quarantine → Playwright 404 gauntlet → delete |
| A3 | Unreferenced component | `src/components/BrandText.astro` (`23` lines) | 0 imports/references across `src/` and `dist/` (all components call `brandify()` from `src/lib/brand.ts` directly) | Low | Quarantine → build + `check` + `check:brand` → delete |
| A4 | Unused TS local | `src/scripts/menu.ts:27` `let currentAnchor` | `astro check` emits `ts(6133)` hint (`'currentAnchor' is declared but its value is never read`); 0 reads in `menu.ts` | Low | Batch with safe Phase 4 cleanup |
| A5 | Unused helper exports | `src/lib/brand.ts:7,18` (`BRAND`, `hasBrand`), `src/lib/schema.ts:41` (`breadcrumbSchema`), type exports in `src/data/*.ts`, `src/lib/image-preload.ts:11`, `src/scripts/core/{horizontal-loop,momentum-hover}.ts`, `src/scripts/webgl/impl.ts:456` | 0 cross-file imports across `src/`. Note: `breadcrumbSchema` is useful schema utility for future pages; type exports document data contracts | Low–Med | Keep public data/contract types & `breadcrumbSchema`; review unexporting/removing dead helper functions (`hasBrand`) if unused |
| A6 | Dead CSS selector | `src/styles/decbricks.css:751` `.parts-marqueeCursor__card` | Belonged to deleted testimonials marquee drag cursor (`950518b`); 0 occurrences anywhere in `src/` or `dist/` | Low | Remove dead rule in Phase 4 CSS tidy |
| A7 | Stale comment ref | `src/styles/decbricks.css:1553` `.tst-dot` comment | Documents non-existent removed `.tst-dot` class; harmless but can clarify/clean | Low | Optional doc cleanup |
| A8 | Placeholder / owner-gated live assets | `public/brand/icon-512.png`, `public/fonts/departure-mono-regular.woff2`, `src/components/ServicesClients.astro` | `icon-512.png` intentionally generated in `814a5ab` as brand icon set; `departure-mono-regular.woff2` referenced in `global.css` `@font-face`; `ServicesClients.astro` imported by `services.astro` waiting on `A14/B2` | High (Protected) | **KEEP** (Ground Rule 3) |
| A9 | Intentional `1minus1` placeholder strings | `src/components/CaseStudies.astro` (11 links), `src/components/Hero.astro:326,401` | Tracked in `open-items.md` §B2/C1/A12 until owner copy arrives | High (Protected) | **KEEP** — report only (Ground Rule 3) |
| A10 | Unused CSS tokens (intentional aliases) | `src/styles/decbricks.css` (`--font-heading`, `--font-body`, `--font-display`, `--brand-bg-deepest`, `--brand-muted`, `--brand-highlight`, `--hairline-dark`, `--radius-pill`) | Defined in `tokens.md` / `:root` token vocabulary (single definitions inside `decbricks.css`); semantic foundation tokens | Med | **KEEP** semantic token layer (`tokens.md`); check if raw hex literals in `decbricks.css` should use `var(--brand-*)` tokens instead |

## B. Redundant / Duplicated Patterns

| ID | Category | Pattern & Locations | Proof & Notes | Risk | Safe Action / Deferral |
|---|---|---|---|---|---|
| B1 | Repeated SVG icon markup | Inline `<svg class="svgs-doubleSlash" viewBox="0 0 18 10">…</svg>` appears `15` times across `9` components (`CaseStudies` 5×, `Header` 2×, `ServicesHero` 2×, `ServiceBlock` 2×, `AboutBlock`, `ContactBlock`, `Hero`, `CookieBanner`, `ContactForm`) | Identical 6-`<rect>` geometry with only `class` & optional `aria-hidden` varying | Low | Extract `<DoubleSlashIcon class="..." ariaHidden />` or defer — check touch-count (~9 files, borderline 10-file rule → evaluate or skip to stay under 10-file batch cap / keep as candidate refactor) |
| B2 | Repeated repeated hex literals in CSS | `src/styles/decbricks.css` hardcodes `#800020` (`30×`), `#FFF9F2`/`#fff9f2` (`28×`), `#F3E6D5`/`#f3e6d5` (`12×`), `#BC3D4D` (`11×`), `#5A0014` (`7×`), `#D45060` (`6×`), `#5A6432` (`3×`), `#C9D3C0` (`2×`) despite having `--brand-*` tokens | Inside CSS property values (`color:`, `border:`, `background:`), `var(--brand-*)` matches identically | Low | Replace safe standalone property values with `var(--brand-*)` tokens (verify computed styles & `visual-diff.py`; keep raw hex inside `color-mix()` only if needed or swap safely) |
| B3 | Repeated `@media` blocks in CSS | `src/styles/decbricks.css` splits `@media (min-width: 1024px)` (`11×`), `(prefers-reduced-motion: reduce)` (`5×`), `(min-width: 900px)` (`3×`), `(max-width: 1023px)` (`3×`), etc. | Intentional per-section grouping keeps component styles cohesive; consolidating unrelated sections saves negligible bytes and hurts locality | Low | Leave section-grouped queries cleanly structured; merge only duplicate adjacent blocks within the same feature section if trivial |
| B4 | `!important` usage | `12×` in `src/styles/decbricks.css`: L295 (`loader-skip`), L1372–1396 (`@media print` `8×`), L2238–2240 (`prefers-reduced-motion: reduce` `3×`) | All `12` are structurally justified (paint gate, print overrides, reduced-motion override over inline GSAP transforms) | High | **KEEP** all `12` |
| B5 | Section shell chrome | `AboutBlock.astro`, `ServiceBlock.astro`, `ContactBlock.astro` | Structurally similar editorial shells (`AboutBlock` vs `ServiceBlock`), but each has distinct props, grids, artworks (`ServiceArtwork`), numbers (`ContactNumbers`), and script class hooks (`docs/mapping.md`) | Med | **Candidate refactor (defer)** — merging shells risks script hook divergence & touches live brand styling |
| B6 | Deprecated DOM clipboard call | `src/scripts/footer.ts:22:25` `document.execCommand('copy')` | Triggered as fallback for `navigator.clipboard`; produces `ts(6385)` deprecation hint in `astro check` | Low | Keep safe fallback or isolate/annotate cleanly; verify during Phase 2/4 |

## C. Compiled `src/styles/global.css` Purge Assessment

- **File:** `src/styles/global.css` (`157,642 bytes`, 2 minified lines: theme/properties `42,773 B`, utilities/components `114,867 B`). **Never hand-edit.**
- **Rule scan (heuristic AST brace parser):**
  - Total selectable rules: `2,801`
  - Unreferenced utility/component rules (using strict `src/**` literal + dynamic prefix safelist): `792` rules
  - Estimated removable bytes: **`38,740 bytes` (`24.6%` of `157,642 B`)**
  - Examples: `.sections-testimonials__card` (old deleted card rule), unused spacing utilities (`.bottom-18`, `.mr-25`, `.mb-28`, `.w-456`), unused aspect ratios (`.aspect-8/11`, `.aspect-10/9`), unused calc positions (`.top-[calc(100%+10px)]`).
- **Verdict (>= 20% threshold met):** Eligible for **Phase 5** scripted purge on a separate branch (`cleanup/global-css-purge-2026-11-14`), gated by the full multi-width + interactive-state Playwright `visual-diff.py` matrix.

## D. Dependencies, Config & Environment Hygiene

- **`package.json` dependencies:** `astro` (`^5.0.0`), `gsap` (`^3.15.1`), `lenis` (`^1.3.27`), `three` (`^0.187.0`); devDependencies: `@astrojs/check` (`^0.9.12`), `@types/three` (`^0.187.0`), `typescript` (`^5.9.3`). All 7 are actively used (`depcheck` confirmed zero unused runtime deps; flagged `@astrojs/check` & `typescript` only because they are invoked via `astro check` CLI).
- **`tsconfig.json`:** Extends `astro/tsconfigs/base` without `compilerOptions` (`strict` not forced — avoids breaking template JS/GSAP typings unless carefully scoped; candidate hygiene check in Phase 4).
- **`astro.config.mjs`:** Sets `site` (`PUBLIC_SITE_URL || 'https://decbricks.com'`), `trailingSlash: 'never'`, `compressHTML: true`, `inlineStylesheets: 'auto'`, `chunkSizeWarningLimit: 600` (documented for WebGL chunk). Trailing-slash & canonical policy (`trailingSlash: 'never'`) aligns with `sitemap.xml.ts` / `Base.astro` (verify exact runtime URLs in Phase 2).
- **`import.meta.env.*` vars:** All `11` distinct env keys (`PUBLIC_ENV`, `PUBLIC_GSC_VERIFICATION`, `PUBLIC_STUDIO_TZ`, `PUBLIC_STUDIO_AVAILABILITY`, `PUBLIC_NEWSLETTER_ENDPOINT`, `PUBLIC_SITE_URL`, `PUBLIC_CONTACT_EMAIL`, `PUBLIC_CAL_LINK`, `PUBLIC_CAL_BOOKING_URL`, `PUBLIC_CONTACT_ENDPOINT`, `PUBLIC_SHOW_PLACEHOLDER_TESTIMONIALS`, plus Astro built-ins `DEV`/`PROD`) are actively consumed.
- **No lint/format config** (`eslint` / `prettier`) — omitted intentionally to avoid adding runtime/dev dependencies (Ground Rule 4).

## E. Ranked Batch Priority

1. **High / Low-risk Batch 1 (Phase 4 Step 1–4):** Remove unused `menu.ts:27` `currentAnchor`, quarantine & delete `public/fav1.png`, 32 dead `public/images/case-studies/*.{png,webp}` sticker files (~3.08 MB saved from `public/` + `dist/`), and `src/components/BrandText.astro`.
2. **Medium Batch 2 (Phase 4 Step 7):** Remove dead `.parts-marqueeCursor__card` in `decbricks.css`; swap pure repeated hex literals for `var(--brand-*)` where visually identical.
3. **Phase 5 Branch:** Automated utility purge of `src/styles/global.css` (~38.7 KB / 24.6% potential savings) verified against full visual matrix.
4. **Deferred Candidates:** SVG icon partial consolidation across 9+ components (borderline file-count budget, visual parity identical either way); section chrome consolidation (`AboutBlock` / `ServiceBlock`).
