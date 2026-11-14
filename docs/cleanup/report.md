# Code Cleanup, Bug Fix & Audit Report (`cleanup/2026-11-14`)

Verified engineering summary of Phases 0–6 on branch `cleanup/2026-11-14` (and optional CSS purge branch `cleanup/global-css-purge-2026-11-14`), branched from `34c55c9`.

---

## 1. Before / After Metrics

| Metric | Phase 0 Baseline (`21c70e7`) | Phase 6 Final (`cleanup/2026-11-14`) | Delta |
|---|---:|---:|---|
| `dist/` total size | `92,417,843 B` (`88.14 MiB`) | `89,342,721 B` (`85.20 MiB`) | **`-3,075,122 B` (`-3.33%`)** |
| `dist/` file count | `385` | `352` | **`-33 files`** |
| `dist/` `.png` / `.webp` | `117` (`43.42 MB`) / `178` (`15.62 MB`) | `100` (`40.94 MB`) / `162` (`15.01 MB`) | `-17 .png`, `-16 .webp` |
| `dist/` `.js` / `.css` | `7` (`878,235 B`) / `1` (`195,217 B`) | `7` (`877,068 B`) / `1` (`196,107 B`) | `-1,167 B` JS, `+890 B` CSS |
| `src/` file count / LOC | `95` files / `17,334` lines | `94` files / `17,377` lines | `-1` file (`BrandText.astro`) |
| `public/` file count | `227` files | `194` files (`63,595,747 B`) | **`-33 files`** (`fav1.png` + 32 stickers) |
| `package.json` deps | `4` prod / `3` dev | `4` prod / `3` dev | `0` unused (verified via `depcheck`) |
| `astro check` diagnostics | `0` err, `0` warn, `2` hints | `0` err, `0` warn, `1` hint | Resolved `ts(6133)` in `menu.ts:27` |
| `tsc --noEmit` | default (`astro/tsconfigs/base`) | `0` errors (`noUnusedLocals` + `noUnusedParameters` enabled) | Stricter unused-symbol gate |
| Build & static gates (7 scripts) | 7/7 PASS | **7/7 PASS** | `build`, `check`, `check:brand`, `headings`, `links`, `check:placeholders`, `check:footer` |
| Playwright runtime console errors | `0` across all 5 routes | **`0`** across all 5 routes + swap gauntlet | Zero runtime regressions |
| Playwright requests (`/` · `/about` · `/contact` · `/services` · `/404`) | `87 · 30 · 31 · 30 · 11` | `87 · 30 · 30 · 30 · 11` | `-1` req on `/contact`, `0` 4xx/5xx |
| Overflow X (`320–2560 px`, reduced motion) | `0 px` | **`0 px`** | Clean across all breakpoints |

> **Working-tree note:** `src/data/testimonials.ts` had an uncommitted local edit present on disk prior to Phase 2 (`placeholder: false, consent: true`), which enables the Testimonials band on `/` (`docHeight` `7,678 -> 8,375 px`, `check:placeholders` passes with `8 consented`). It was left unstaged and untouched in all cleanup commits.

---

## 2. Bugs Found & Fixed (Phase 2 → Phase 3)

| ID | Sev | Symptom & Root Cause | Fix Commit & Files | Verification |
|---|---|---|---|---|
| **BUG-016** | `S1` | Mobile menu trapped desktop page scroll (`html.lenis-stopped`, `aria-expanded="true"`, `inert` cleared) when resized across `1024px` (`bp.lg`) while open. `mm.add('(max-width: 1023px)', ...)` cleanup killed timeline without resetting state/Lenis. | [`db9a538`](file:///home/ankit/GitHub/decbricks/src/scripts/menu.ts) (`src/scripts/menu.ts`) | Playwright resize `375 -> 1280px`: `ariaExpanded: "false"`, `lenisStopped: false`, `inertSet: true`. |
| **BUG-017** | `S1` | Cal.com embed stayed stuck on fallback when consent was already stored in `localStorage` (`loadStarted` ignored `hasConsent()`), and entered `IntersectionObserver` + loaded `embed.js` even when `CAL.link` was empty (`!CAL.link && !hasFallbackContent()`). | [`1be25ad`](file:///home/ankit/GitHub/decbricks/src/scripts/cal-embed.ts) (`src/scripts/cal-embed.ts`) | `loadStarted = hasConsent()`, early exit on `!mount || !CAL.link`, removed unused fallback imports. |
| **BUG-018** | `S2` | Closing mobile menu on dark heroes (`/services`) left header logo burgundy-on-burgundy (`text-darkPurple`); route-swap `close(false)` stole focus back to menu toggle; `.link` tween queried document-wide nodes. | [`db9a538`](file:///home/ankit/GitHub/decbricks/src/scripts/menu.ts) (`src/scripts/menu.ts`) | Playwright close on `/services`: logo restored `text-white`; `.link` scoped to `mobileNav`; focus guarded by `resumeLenis`. |
| **BUG-019** | `S2` | `initCaseStudies()` leaked `MomentumHover` `window:mousemove` listener (+1 per `/` visit), un-killed `Draggable`/`pageTimeline`, un-aborted DOM listeners, and anonymous `horizontalLoop` `resize` listener. | [`0828dea`](file:///home/ankit/GitHub/decbricks/src/scripts/case-studies.ts) (`src/scripts/case-studies.ts`, `src/scripts/core/horizontal-loop.ts`) | Playwright swap gauntlet: `mousemove` & `draggable` cleaned up on exit (`leaked: []` across `/about <-> /`). |
| **BUG-020** | `S2` | Contact form duplicated hover/focus listeners across `1024px` resizes and leaked `change`/`submit` listeners on route swap. | [`d7309e0`](file:///home/ankit/GitHub/decbricks/src/scripts/contact.ts) (`src/scripts/contact.ts`) | Added `AbortController` inside `mm.add` and outer `initContact`; killed `hoverTween` on revert. |
| **BUG-021** | `S3` | `HeroAnimator` (`hero.ts`) left `ScrollTrigger`'s `'refresh'` listener and `refreshTimeout` active after `destroy()`. | [`aff35aa`](file:///home/ankit/GitHub/decbricks/src/scripts/hero.ts) (`src/scripts/hero.ts`) | Removed `'refresh'` callback + cleared `refreshTimeout` in `destroy()`. |
| **BUG-022** | `S3` | `keywords.ts` had un-cleared 100ms timeout inside `mm.add`; `video-player.ts` leaked media/control listeners and announcement timer on destroy. | [`aff35aa`](file:///home/ankit/GitHub/decbricks/src/scripts/keywords.ts) (`src/scripts/keywords.ts`, `src/scripts/video-player.ts`) | Cleared timers on revert/destroy; bound all video/player/control listeners to an `AbortController`. |

Detailed reproduction evidence lives in [`docs/cleanup/bugs.md`](file:///home/ankit/GitHub/decbricks/docs/cleanup/bugs.md).

---

## 3. Redundant Code & Dead Assets Removed (Phase 4)

Every deletion followed static `grep` + build proof → quarantine in `.cleanup-trash/` (`db4c79d`) → Playwright 0-404/0-error gauntlet → permanent removal (`a3475d7`):

| Batch / Commit | Removed Item(s) | Static & Runtime Proof |
|---|---|---|
| `476fc7e` | `currentAnchor` in [`menu.ts`](file:///home/ankit/GitHub/decbricks/src/scripts/menu.ts); retired `.structure-footer__marquee` + `initSocialPillsRandomLayout` in [`footer.ts`](file:///home/ankit/GitHub/decbricks/src/scripts/footer.ts) | `currentAnchor` never read (`ts(6133)`); `.structure-footer__marquee` absent from `src/` & `dist/` since Footer P1 |
| `db4c79d` → `a3475d7` | [`src/components/BrandText.astro`](file:///home/ankit/GitHub/decbricks/src/components/BrandText.astro); `public/fav1.png`; **32** orphaned sticker files (`3,083,193 B`, 16 PNG+WebP pairs) in `public/images/case-studies/` | 0 imports/URLs across `src/` & `dist/`; Playwright gauntlet returned `errs: []`, `badReqs: []` across all routes |
| `6ca7177` | Unused `hasBrand` export in [`src/lib/brand.ts`](file:///home/ankit/GitHub/decbricks/src/lib/brand.ts) | 0 imports across `src/` and `scripts/` |
| `6d3ac6c` | Dead `.parts-marqueeCursor__card` rule + standalone raw hex literals replaced with exact `var(--brand-*)` tokens in [`src/styles/decbricks.css`](file:///home/ankit/GitHub/decbricks/src/styles/decbricks.css) | Computed `rgb()`/`oklab()` colors verified identical in Chromium; 0 style regressions |
| `82ff2f4` | [`tsconfig.json`](file:///home/ankit/GitHub/decbricks/tsconfig.json) hardened with `"noUnusedLocals": true` and `"noUnusedParameters": true` | `npx tsc --noEmit` & `npm run check` exit `0` |

---

## 4. Phase 5 — `src/styles/global.css` Utility Purge (Separate Branch)

Because Phase 1C estimated >20% removable utility CSS (`24.6%`), a conservative CSS AST purge was executed and committed on separate branch **`cleanup/global-css-purge-2026-11-14`** (commit `6b74533`), preserving 100% of `@layer properties`, `@layer theme`, `@layer base`, `@font-face`, `@keyframes`, `@property`, and all classes matching `src/**`, `dist/**/*.html`, GSAP `SplitText`, Lenis, and dynamic JS prefixes.

| File / Check | Before Purge (`82ff2f4`) | After Purge (`6b74533`) | Delta |
|---|---:|---:|---|
| `src/styles/global.css` | `157,642 B` | **`97,735 B`** | **`-59,907 B` (`-38.00%`)** |
| Selectable rules | `2,888` total | `1,717` kept | **`-1,171` removed** |
| `dist/_astro/*.css` (`about.*.css`) | `196,107 B` | **`136,317 B`** | **`-59,790 B` (`-30.49%`)** |
| Playwright 6-width × 5-route + 4-state check | PASS | **PASS** | `0` console errors, `0` 4xx/5xx; 88/94 shots `<0.5%` diff (`0.000%` on 61 shots); remaining 6 shots differed only from animated CRT WebGL frames, cookie slide-in timing, or 1px scroll settle |

> **Merge status:** Kept on `cleanup/global-css-purge-2026-11-14` as requested so the team can merge (`git merge cleanup/global-css-purge-2026-11-14`) after visual sign-off without mutating `cleanup/2026-11-14`'s compiled template stylesheet directly.

---

## 5. Refactors Deferred (Logged as Candidates)

1. **`DoubleSlashIcon` SVG extraction (`9` files, `15` occurrences):** Left inline to stay safely within the single-PR file-touch ceiling (~10 files) and preserve zero-churn markup parity; low-risk component extraction candidate later.
2. **`AboutBlock` / `ServiceBlock` chrome unification:** Left separate because `AboutBlock` renders `values` + `<Picture>` media while `ServiceBlock` renders `ServiceArtwork` / video + `projects` + `actionRow` fallbacks and distinct script hooks (`docs/mapping.md`).
3. **Full TypeScript `"strict": true` in `tsconfig.json`:** `npx tsc --noEmit --strict` surfaces only `2` errors (`src/scripts/contact.ts:191` closure narrowing on `firstInvalid`, and `src/scripts/webgl/impl.ts:1111` `return;` instead of `return null;`); deferred to avoid touching protected WebGL code without dedicated WebGL regression tests.
4. **`document.execCommand('copy')` fallback in `src/scripts/footer.ts:22`:** Retained intentionally as legacy clipboard fallback when `navigator.clipboard` is unavailable (`astro check` emits 1 deprecation hint).

---

## 6. Open / Owner-Blocked Items (Unchanged Scope)

Remaining blockers in [`docs/open-items.md`](file:///home/ankit/GitHub/decbricks/docs/open-items.md) require owner assets, copy, or production environment flips and were intentionally untouched:
- Home (`Hero` / `CaseStudies`) `1minus1` showreel videos and case-study copy (`A12`, `B2`, `C1`).
- Missing Contact intro copy (`A15`), Cal.com slug (`A2`), team profiles (`A5`), contact phone/address/email/form endpoint (`A3`, `A4`, `A7`), privacy/terms pages (`A11`).
- Font web-embedding licence confirmation for FK Raster (`B1`) and image rights check for `vision` poster (`B4`).
- Launch-day flip (`PUBLIC_ENV=production` for indexing + `robots.txt`, `E.1–5`).
