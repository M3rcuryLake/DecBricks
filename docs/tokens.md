# Design tokens

Status: **template tokens extracted** (from `src/styles/global.css` `@layer theme`). Brand mapping = **target**; agent must apply, then tick PROGRESS.md and update this file with the as-built values.

## 1. Template tokens (as found)

### Colours (`--color-*`)
| Token | Template value | Approx hex | Where used |
|---|---|---|---|
| darkPurple | oklch(15.84% .0791 301.94) | #140128 | page/section dark bg, text on light cards, `themeColor`, `bodyClass` |
| darkestPurple | oklch(22.76% .1179 298.93) | #26024A | hero trail SVGs, 15% borders on cards, one `text-[#26024A]` |
| darkerPurple | oklch(23.4% .124 301.5) | ~#27034F | `.is-game-active` text, border |
| purple | oklch(63.01% .225 295.41) | #9860FF | accent: corner squares, eyebrows, bullets, hover fills, 50% borders |
| lightPurple | #efedf0 | #EFEDF0 | sidebar nav bg, borders |
| palePurple | #f2ecff | #F2ECFF | tints (`/10 /13 /40`) |
| mutedPurple | #31045f | #31045F | muted bg |
| neonGreen | oklch(93.35% .1926 125.66) | lime | "Begin your" heading, hover/focus accents |
| errorRed | oklch(66.08% .227868 17.6123) | pink-red | form errors |
| white | oklch(100% 0 0) | #FFFFFF | cards, light text |
| red-500, gray-600 | tailwind defaults | — | misc |

Hardcoded elsewhere: `#140128` ×3 and `#26024A` ×4 in `.astro/.ts` (Base `themeColor`, pages `themeColor`, one text class, scripts). Also check `webgl/experience.ts` for `0x…`/`new Color(...)` (grep `Color\(|0x[0-9a-f]{6}`).
Opacity-variant hex fallbacks in global.css to remap: `140128*`, `26024a*`, `9860ff*`, `f2ecff*`, `ffffff*` (inside `.bg-/.text-/.border-/.stroke-` `/NN` utilities).

### Fonts (`--font-*`, all declared weight 400 only; `html{font-synthesis:none}` ⇒ no faux bold)
| Token | Family | Role in template |
|---|---|---|
| --font-neuePower | Neue Power | headings, UI, buttons, eyebrows, nav (used with `font-bold`) |
| --font-nohemi | Nohemi | body copy (`.copy*`, `.rich-text p`), blockquotes |
| --font-offBit | OffBit | huge display (`.heading-3xl`, `.heading-3.5xl`), giant section numerals (`text-[275px]…[580px]`) |
| --font-offBit101 | OffBit 101 | `.heading-2xl`, `.heading-4xl`, `.btn-menu`, `.heading-cookie`, "Begin your" |
Files: `public/fonts/{neue-power,OffBit,nohemi,OffBit101}.woff2`; preloaded in `Base.astro` (neue-power, OffBit).

### Type scale (utility classes in global.css, mobile → lg → wide)
`.heading` 20→28 · `.heading-lg` 20→36 · `.heading-sm` 12→18 · `.subheading` 12→16 · `.btn-text` 12→15 · `.btn-text-lg` 14→16→18 · `.copy` 16/18→18/22 · `.copy-lg` 16/22→20/30 · `.copy-sm` 12→15 · `.copy-xs` 10→12 · `.copy-2xl` 20→44 · `.heading-blockquote(-sm,-lg)` · `.heading-2xl/3xl/3.5xl/4xl` clamp-based display · `.rich-text` h1–h6/p/li rules. Arbitrary sizes `text-[Npx]` used heavily with breakpoint variants.

### Spacing / layout
`--spacing: .0625rem` (1 unit = 1px; `gap-40` = 40px). Containers: `.container` max 1920 (pad 16→32); `max-w-1850` content island; `max-w-1920` sections. Section island pattern: `rounded-10 lg:rounded-24 bg-white px-9 pt-10 pb-40 …` then inner `max-w-1850 flex-col gap-40 lg:gap-55 xl:gap-65 3xl:gap-80 4xl:gap-95`.

### Breakpoints
xs 456 · sm 640 · md 768 · **lg 1024** (main desktop switch) · xl 1280 · 2xl 1440 · 3xl 1660 · 4xl 1920. Also `pointer:coarse/fine` variants and container queries (`@md`, `@3xl`, `@5xl`).

### Radii / borders / motion
Radii `--radius-{2,4,6,8,10,12,16,20,24,28,30,36,40}` (px). Card border `border-darkestPurple/15`; corner squares `size-9 bg-purple`. Easing `--ease-{in,out,in-out}`; durations 100–700 ms; `--animate-translateX` 10 s linear marquee. Blur `--blur-{sm,lg,xl}`.

## 2. Brand mapping (TARGET → as built)

Brand: Burgundy `#800020` · Warm Beige `#F3E6D5` · Off-White `#FFF9F2` · Coral Red `#D45060`.
Strategy: **keep the existing token names** (hundreds of class usages; renaming = risk), repoint values, and add semantic aliases for new code. Derived shades are produced from the four brand colours with `color-mix(in oklab, …)` — no new hues.

| Token (kept name) | New value | Semantic alias (new code) | Notes |
|---|---|---|---|
| darkPurple | `#800020` | `--brand-bg-dark` | dark page/section bg, text on light cards |
| darkestPurple | `color-mix(in oklab, #800020 78%, black)` (~#640019) | `--brand-bg-deepest` | trails, hairline borders |
| darkerPurple | `color-mix(in oklab, #800020 88%, black)` | `--brand-bg-deeper` | |
| mutedPurple | `color-mix(in oklab, #800020 70%, #FFF9F2)` | `--brand-muted` | check usage before finalising |
| purple (accent) | `#D45060` | `--brand-accent` | decorative squares, bullets, hover fills, borders |
| lightPurple | `#F3E6D5` | `--brand-surface-alt` | sidebar nav bg |
| palePurple | `#FFF9F2` | `--brand-surface` | tints |
| white | `#FFF9F2` | `--brand-on-dark` / card bg | cards + light text. Pure white alpha overlays become Off-White alpha |
| neonGreen | `#F3E6D5` | `--brand-highlight` | big heading highlight + focus/hover on dark. (Alt: coral if beige lacks punch — decide visually, log it) |
| errorRed | keep a distinct warm red, e.g. `#FF8F8F` on dark / `#B3261E` on light | `--brand-error` | must not be confusable with accent coral; non-brand by necessity — logged in open-items |

### 2c. Green supporting layer (owner decision 2026-11-12 — extends the 4-colour palette)
Sage + olive as a supporting layer: **sage for secondary-section backgrounds, olive for text-weight elements** (tags, borders, icons, hover/active states). Burgundy stays the star (one dominant red per screen); coral stays decorative. Never coral/crimson text on sage — burgundy or dark olive instead. Tokens live in `src/styles/decbricks.css` (`:root` → `--brand-sage`, `--brand-olive`; utilities `.bg-sage`, `.bg-olive`) — not in the compiled `global.css` token block, because they are additions, not repoints.

| Token | Value | Role | Contrast facts |
|---|---|---|---|
| `--brand-sage` | `#C9D3C0` | secondary-section backgrounds (pilot: testimonials marquee), inactive pill hover/focus, drag-cursor card | Burgundy on sage **7.0:1** ✅ all sizes |
| `--brand-olive` | `#5A6432` | active tags/pills, input borders on light surfaces | Off-white on olive **6.1:1** ✅ · olive on beige 5.2:1 ✅ · **not a text colour on sage** (4.1:1 small text fails — use burgundy) |

### 2d. Logo lockup (owner-supplied `docs/logo.png`; mark v2 = red blob, 2026-11-12)

Every visible "Decbricks" renders as a lockup: **[LOGO] Decbricks** — logo via `.font-brand::before` (CSS-only, no DOM, accessible name stays the text). Mark v2 (owner swapped the source 2026-11-12, evening): glossy **red** blob `#e00609` (dark rim `#450000`, white speculars) — effectively single-hue. Surface decision (owner, measured): full-colour on light surfaces; **off-white silhouette variant on dark/coral surfaces** (`logo-cream.webp`) — replaces the earlier copper-mark "mode A everywhere" decision, whose contrast premise (10.8:1 highlights) no longer holds: red vs burgundy = **2.17:1**, vs coral footer band = **1.22:1 body**.

| Spec | Value |
|---|---|
| Source | `docs/logo.png` 1308×1203 RGBA, transparent bg, red glossy blob (median `#e00609`, rim `#450000`, speculars `#ffffff`), content bbox 1224×1125 (margins 66/30/18/48), aspect **1.088:1** |
| Trimmed master | `assets/brand/logo-trim.png` (1240×1141, content + 8px uniform pad) |
| Display assets | `public/brand/logo.webp` + `logo.png` 278×256 (128px @2x), webp 17 KB. `logo-cream.webp` 10 KB — alpha-mask silhouette filled `#FFF9F2` (holes preserved); vs burgundy **10.3:1**, vs coral **3.93:1** (colour body on coral is 1.22:1) |
| Variant rule | `.structure-menu`, `.sections-servicesHero`, `.sections-contactForm`, `.structure-footer` → cream file (decbricks.css). Everything else = full-colour (About white cards). New dark contexts: add the section class to that rule |
| Favicon set | `favicon.ico` (16+32), `icon-192/512`, `apple-touch-icon` (180) — **transparent, no plate** (owner decision; red mark on a burgundy plate was 2.17:1 = invisible at 16px) |
| OG image | `public/og-default.png` 1200×630: burgundy plate, cream-variant logo + real FK Raster TTF wordmark in Warm Beige (fontTools woff2→ttf + Pillow) |
| CSS | `.font-brand` → `inline; line-height:inherit; white-space:nowrap; vertical-align:baseline;` (true inline layout shares exact text baseline with surrounding copy and punctuation; eliminates the 8–9.3px float caused by `inline-flex`). `::before` → `display:inline-block;` default `--brand-logo-w: 0.98em; --brand-logo-h: 0.90em; margin-inline-end: 0.28em; vertical-align: var(--brand-logo-shift, -0.15em);` (tuned to cap-height scale to preserve exact line pitch `[20, 20, 20]` and optically center the logo mark on FK Raster's x-height center $+0.292\text{em}$ within 0.05px). Opt-out `.font-brand--no-logo`. Preload targets the **cream** file (header is above the fold on every route) |
| JSON-LD | `Organization.logo` → `${SITE_URL}/brand/logo.png` |

### Contrast audit (computed, WCAG 2.1)

| Pair | Ratio | Verdict |
|---|---|---|
| Off-White `#FFF9F2` on Burgundy | ~10.3:1 | AA/AAA all sizes |
| Burgundy on Off-White | ~10.3:1 | AA/AAA |
| Burgundy on Warm Beige | ~8.9:1 | AA/AAA |
| Warm Beige on Burgundy | ~8.8:1 | AA/AAA |
| Coral on Off-White | ~3.9:1 | **large text only** (≥24px, or ≥18.66px bold) / UI graphics ≥3:1 |
| Coral on Burgundy | ~2.6:1 | **fails** even for UI; decorative only, never text/icons that carry meaning |
| Off-White on Coral | ~3.9:1 | large text only |
| Burgundy on Coral | ~2.6:1 | **fails** — do not put burgundy text on coral fills |

Required follow-ups (agent): (1) grep every `text-purple` / `hover:bg-purple` + text combo; small text on light cards (eyebrows `text-[12–18px]`, nav labels) → switch to `text-darkPurple`. (2) Hover/active button fills in coral: text must be Off-White **and** ≥18.66px bold, otherwise darken the fill using `color-mix(in oklab, #D45060 72%, #800020)` (≥4.5:1 with Off-White) and record it. (3) Re-verify focus rings: ring colour must be ≥3:1 against both adjacent surfaces (use Off-White on burgundy, Burgundy on off-white; coral only as secondary).
Re-run a contrast script after the remap and write the real results into this file.

### 2b. AS BUILT (Phase 1, 2026-11-10) — values applied in `@layer theme` (both `:root` and `:host,:root` copies) + scripted hex remap
| Token | Applied value | Notes |
|---|---|---|
| --color-darkPurple | `#800020` | was oklch(15.84%…); themecolor/meta remapped too |
| --color-darkestPurple | `color-mix(in oklab, #800020 78%, black)` ≈ `#5A0014` | hex fallbacks remapped to `#5A0014(+alpha)` |
| --color-darkerPurple | `color-mix(in oklab, #800020 88%, black)` ≈ `#6B0019` | |
| --color-purple | `#D45060` (Coral) | fallbacks `#9860ff*`→`#D45060*` |
| --color-lightPurple | `#F3E6D5` | fallbacks `#efedf0*`→`#F3E6D5*` |
| --color-palePurple | `#FFF9F2` | fallbacks `#f2ecff*`→`#FFF9F2*` |
| --color-mutedPurple | `color-mix(in oklab, #800020 76%, #FFF9F2)` ≈ `#A34B4E` | **documented deviation from the 70% draft**: Off-White text on it = 5.47:1 (70% mix = 4.70:1, too tight). Used by hero "Jump to" pills only |
| --color-neonGreen | `#F3E6D5` (Warm Beige) | highlight/heading role per C5 |
| --color-errorRed | `#B3261E` | distinct from coral accent; 6.25:1 on Off-White, 5.3:1 on Beige (C4) |
| --color-white | `#FFF9F2` | all `#ffffff(+alpha)` fallbacks → `#fff9f2(+alpha)`; pure-white hex in CSS utilities remapped same-suffix |

Remap counts (global.css): `140128` 12 → 0 · `26024a` 3+2 uppercase-variant → 0 · `9860ff` 6 → 0 · `f2ecff` 6 → 0 · `efedf0` 0 (token-only) · `31045f` 0 (token-only) · `ffffff` 23 → 0. Fixed a `##5a0014` double-hash artifact the script introduced (5 spots) — verify `##` count = 0 after any future hex remap.
Markup/TS remap: `#140128`→`#800020`, `#26024A`→`#5A0014` in `Base.astro` (themeColor default), `services.astro`, `the404game.astro`, `Hero.astro` (4 trail classes).
WebGL fallbacks in `experience.ts`: text `(0.38,0.02,0.74)`→coral `(0.831,0.314,0.376)` ×2, bg `(0.11,0,0.22)`→burgundy `(0.502,0,0.125)`, trail `(0.49,1,0.43)`→beige `(0.976,0.924,0.852)` ×3; `Footer` `data-trail="oklch(1,0,0)"`→`oklch(98.48% 0.0113 71.9)` (Off-White; parseCssColor does not accept hex).

### 2c. Contrast corrective overrides (`src/styles/decbricks.css`, loaded after global.css → unlayered wins cascade layers)
- `hover:bg-purple` / `focus-visible:bg-purple` / `aria-[current=true]:bg-purple` / `active:bg-purple` fills → `--brand-accent-deep` = `color-mix(in oklab, #D45060 72%, #800020)` ≈ `#BC3D4D` (5.13:1 with Off-White — passes normal small text).
- `.part-btnPrimary.bg-purple` (Submit / Accept buttons: coral fill + burgundy text = 2.6:1 fail) → burgundy fill + Off-White text (10.3:1).
- `.parts-keyword__inner.bg-purple` (home-hero pills 12px) → accent-deep.
- Coral `text-purple` small text on dark surfaces fixed in markup: Loader counter numerals + CookieBanner Manage/Save buttons → `text-neonGreen` (Beige, 8.8:1 on Burgundy).
- Remaining decorative coral (corner squares `size-9`, slash/cross/arrow icons on light = 3.9:1 ≥3 UI graphics ✅, 5%-opacity ghost numerals, ~~footer webgl bg~~ (now burgundy, see below)) intentionally untouched.
- ~~Known accepted fail~~ **RESOLVED (F23, re-verified footer phase 0: Off-White on burgundy 10.36:1, worst case on trail colour 5.13:1)** — historical note: Footer `bg-purple` (coral) webgl layer sits under burgundy text `text-darkPurple` (~2.1:1) — mirrors the template's purple-on-dark relationship; resolve when the footer is rebuilt in Phase 3/8 (`--brand-accent-deep` background would also fix it).

## 3. Typography mapping — **Option A: "Bricks & Pixels"** (FONT-SWAP-PROMPT, 2026-11-10)

> **AS BUILT.** Supersedes the KH Type mapping of Phase 2 (see §3 history note below). KH Teka / KH Interference / KH Teka Mono are no longer used or shipped. Measured with fontTools; all glyph needs verified.

### 3a. Final type system

| Role | Family (self-hosted WOFF2 in `public/fonts/`) | Weights declared | Legacy token repointed (load-bearing for the compiled utilities) | Semantic alias (new code) |
|---|---|---|---|---|
| Heading / UI / buttons / eyebrows / nav | **Bricolage Grotesque** — `bricolage-grotesque-latin.woff2` (41 KB, variable 200–800, OFL via Fontsource) | `200 800` (7–800 for headings/buttons, 500 nav/labels) | `--font-neuePower` | `--font-heading` |
| Body / long copy / form text | **Hanken Grotesk** — `hanken-grotesk-latin.woff2` (34 KB, variable 100–900, OFL via Fontsource) | `100 900` (400 body, 500 emphasis) | `--font-nohemi` | `--font-body` |
| Display pixel type: giant numerals, `.heading-2xl/3xl/3.5xl/4xl` (h2s), "Begin your", menu `.btn-menu`, cookie heading | **FK Raster Roman Compact** — `fk-raster-roman-compact.woff2` (23 KB, 400 only; owner decision 2026-11-11 moved display here) | `400` (heading classes request 700; `font-synthesis:none` renders regular — accepted) | `--font-offBit`, `--font-offBit101` | `--font-display` |
| Small mono labels / `--font-mono` | **Departure Mono** — `departure-mono-regular.woff2` (22 KB, 400 only, OFL; from GitHub release rektdeckard/departure-mono v1.500) | `400` | `--font-mono` (global.css token unchanged) | `--font-mono` (decbricks.css alias points directly at Departure Mono) |
| **Brand name "Decbricks" — only** | **FK Raster Roman Compact** — `fk-raster-roman-compact.woff2` (23 KB, 400 only, from `src/assets/Fonts/FKRasterRomanCompact-Smooth.ttf`) | `400` via `.font-brand` | — | `--font-brand` (NOT aliased to any legacy token; exclusive to the brand word via `.font-brand`) |

### 3b. As-built facts
- `global.css`: 6 `@font-face` rules (was 13): Bricolage + Bricolage Fallback, Hanken + Hanken Fallback, Departure Mono, FK Raster Roman Compact. All KH faces removed; 0 `KH ` references remain.
- Glyph audit (fontTools): every char used by the copy — incl. "Decbricks", `. , ’ & -` — present in all 4 fonts. Bricolage 226, Hanken 222, Departure Mono 1079, FK Raster 204 glyphs.
- Variable faces declared with `format("woff2-variations")` so weight ranges resolve; `html{font-synthesis:none}` unchanged.
- CLS fallback faces (local Arial, metric overrides measured from fontTools avg-lowercase advance):
  - "Bricolage Fallback": size-adjust **106.48%**, ascent **95.85%**, descent **27.82%** (Bricolage upem 1000, hhea 930/-270, avg-lc 0.5804 vs Arial 0.5244).
  - "Hanken Fallback": size-adjust **102.61%**, ascent **95.87%**, descent **29.11%** (Hanken upem 1000, hhea 1000/-303, avg-lc 0.5104).
- `Base.astro` preloads **3** WOFF2s (`type="font/woff2" crossorigin`): Bricolage (hero/heading text), Hanken (hero body), FK Raster (header wordmark + all giant display text). **Departure Mono is NOT preloaded** — after the 2026-11-11 owner decision it has no first-paint role; it ships as the fallback face in the display/brand stacks and only downloads if FK Raster fails.
- Tokens repointed ×2 in global.css (both theme blocks); aliases live in `decbricks.css` (`:root { --font-heading/-body/-display/-mono/…--font-brand }`).
- `.font-brand` treatment (`decbricks.css`): `font-family:var(--font-brand); font-weight:400; text-transform:none; letter-spacing:0; font-synthesis:none; font-size:1.06em; line-height:1; white-space:nowrap`. `1.06em` matches the raster x-height to Bricolage/Hanken neighbours; `text-transform:none` keeps exact casing "Decbricks" even inside uppercase contexts (deliberate: the mixed-case wordmark is part of the brand).
- Display re-tune: none needed. FK Raster is narrower than both KH Interference (the face the clamps were designed for) and Departure Mono (e.g. "Begin your" 5.01em vs 6.0/6.36; "2026" 1.88em vs 2.4/2.55; digits ~18% narrower) — the `-0.01em` tracking added for Departure Mono was removed. Giant ghost numerals render ~18% narrower than before: visual check still outstanding (A16).
- Width deltas measured (fontTools advance/em): Bricolage **+9–13%** vs KH Teka ("Services" 4.269 vs 3.81) — running copy is px-width-bounded, so it re-wraps. FK Raster display is narrower than both KH Interference and Departure Mono (no overflow risk).
- **Not verifiable here (no browser tool):** final overflow/wrap of the giant display words at 375/768/1280/1920. Visual confirm in `npm run dev` required before sign-off (owner item §A).
- Regression gate: `npm run check:brand` — every visible "Decbricks" text node in built HTML must sit inside `.font-brand` (currently PASS on all 6 pages).
- Header/Footer wordmarks: text wordmark `<span class="font-brand …">Decbricks</span>` (no logo asset yet — open-item A6).
- `Hero.astro` dead `data-font="OffBitTrial-101"` attr kept (inert; no script consumes it; the load-bearing hook is the class).
- OG image `public/og-default.png` regenerated with Pillow using the real FK Raster TTF (1200×630, burgundy, Off-White wordmark, coral baseline) — still TEMP pending the designed OG asset (A6).

### 3c. History
- **Pre-Phase-2:** template 1minus1 faces (Neue Power, OffBit, OffBit 101, Nohemi) — see git history.
- **Phase 2 (superseded 2026-11-10):** KH Type mapping (Teka/Interference/Teka Mono; FK Raster additionally aliased on `--font-offBit101`) — removed by FONT-SWAP-PROMPT Option A.
- **Now (active):** see §3a/§3b above.
