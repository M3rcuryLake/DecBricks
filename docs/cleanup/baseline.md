# Phase 0 — Baseline Metrics (`cleanup/2026-11-14`)

Captured on branch `cleanup/2026-11-14` at commit `21c70e7` (clean tree over `34c55c9`).

## 1. Build & Gate Checks

| Command | Result | Details |
|---|---|---|
| `npm run build` | PASS | 5 page(s) built in 3.36s (`404.html`, `about/index.html`, `contact/index.html`, `index.html`, `services/index.html`, `robots.txt`, `sitemap.xml`, 136 optimized images) |
| `npm run check` | PASS | 71 files checked: 0 errors, 0 warnings, 2 hints (`src/scripts/footer.ts:22:25` deprecated `document.execCommand`, `src/scripts/menu.ts:27:5` unused `currentAnchor`) |
| `npm run check:brand` | PASS | 5 built page(s) checked |
| `npm run headings` | PASS | `404.html`: 1 H1/5 headings; `about/index.html`: 1/21; `contact/index.html`: 1/12; `index.html`: 1/30; `services/index.html`: 1/16; 0 skipped levels |
| `npm run links` | PASS | 0 broken internal links |
| `npm run check:placeholders` | PASS | 8 testimonials, 8 placeholder, 0 consented (hidden in prod) |
| `npm run check:footer` | PASS | 5 pages with footer, 4 Organization JSON-LD block(s) |

## 2. Repository & Bundle Size

- **`dist/` total:** `92,417,843 bytes` (`88.14 MiB`), `385 files`
  - `.png`: 117 files (`43,422,364 bytes`)
  - `.mp4`: 2 files (`19,664,488 bytes`)
  - `.webp`: 178 files (`15,617,074 bytes`)
  - `.avif`: 68 files (`11,985,066 bytes`)
  - `.js`: 7 files (`878,235 bytes`)
  - `.html`: 5 files (`529,579 bytes`)
  - `.css`: 1 file (`195,217 bytes`)
  - `.woff2`: 4 files (`121,648 bytes`)
  - `.ico`: 1 file (`3,661 bytes`)
  - `.xml`: 1 file (`485 bytes`)
  - `.txt`: 1 file (`26 bytes`)
- **`src/` total:** `95 files` (incl. `src/env.d.ts` and `src/assets/`), `17,334 lines` (`17,322` across code folders incl. `global.css`'s 2 minified lines):
  - `src/components`: 27 files, `5,350` lines
  - `src/data`: 7 files, `777` lines
  - `src/layouts`: 1 file, `108` lines
  - `src/lib`: 3 files, `191` lines
  - `src/pages`: 7 files, `484` lines
  - `src/scripts`: 24 files, `7,982` lines
  - `src/styles`: 2 files, `2,430` lines (`global.css`: 2 lines / `157,642` bytes; `decbricks.css`: `2,428` lines / `76,299` bytes)
- **`public/` total:** `227 files` (`187` in `public/images/case-studies`, `24` in `public/images/contact`, `7` in `public/brand`, `4` in `public/fonts`, `2` in `public/videos`, plus `fav1.png`, `square-solid.png`, `og-default.png`)

## 3. Runtime Performance & Console Baseline (Playwright @ 1280px headless Chrome)

Captured against `npx astro preview --port 4333`:

| Route | Requests | Console Errors | Console Warnings | Page Errors | Failed Reqs | LCP (ms) | CLS | Overflow X | Doc Height (px) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 87 | 0 | 4 (`GL_CLOSE_PATH_NV` SwiftShader ReadPixels) | 0 | 0 | 128 | 0.00008 | 0 | 7,678 |
| `/about` | 30 | 0 | 0 | 0 | 0 | 96 | 0.00087 | 0 | 7,444 |
| `/contact` | 31 | 0 | 0 | 0 | 0 | 128 | 0.00416 | 0 | 3,937 |
| `/services` | 30 | 0 | 0 | 0 | 0 | 104 | 0.00135 | 0 | 7,571 |
| `/404` | 11 | 0 | 0 | 0 | 0 | 68 | 0.00008 | 0 | 1,759 |

## 4. Visual Baseline

- `60` screenshots captured in `docs/qa/baseline/` (gitignored):
  - Routes: `/`, `/services`, `/about`, `/contact`, `/404`
  - Widths: `375`, `768`, `1280`, `1920`
  - Scroll stops: `top`, `mid`, `bot` (~800 ms settle per stop for Lenis/ScrollTrigger reveals)
- Diff runner: `scripts/visual-diff.py` (Pillow `ImageChops.difference`, zero production bundle footprint).
