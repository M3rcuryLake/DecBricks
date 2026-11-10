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
- Remaining decorative coral (corner squares `size-9`, slash/cross/arrow icons on light = 3.9:1 ≥3 UI graphics ✅, 5%-opacity ghost numerals, footer webgl bg) intentionally untouched.
- Known accepted fail (flagged, launch-blocker B2 scope): Footer `bg-purple` (coral) webgl layer sits under burgundy text `text-darkPurple` (~2.1:1) — mirrors the template's purple-on-dark relationship; resolve when the footer is rebuilt in Phase 3/8 (`--brand-accent-deep` background would also fix it).

## 3. Typography mapping (TARGET) — KH Type

Files supplied (all `TRIAL` except FK Raster ttf): FKRasterRomanCompact-Smooth.ttf, FKRasterRomanCompactTrial-Smooth.otf, KHInterferenceTRIAL-{Regular,Bold}.otf, KHTekaMonoTRIAL-{Regular,Bold}.otf, KHTekaTRIAL-{Regular,Medium,Bold}.otf.

| Template token | New family stack | Files / weights | Rationale |
|---|---|---|---|
| --font-neuePower (headings/UI) | `"KH Teka", system sans` | Medium 500 + Bold 700 | brief: KH Teka primary; template uses `font-bold` for headings/buttons → real Bold now exists |
| --font-nohemi (body) | `"KH Teka", system sans` | Regular 400 | body copy |
| --font-offBit (giant display/numerals) | `"KH Interference", "KH Teka", sans` | Bold 700 | pixel/raster display analogue of OffBit — **justified deviation**; verify glyph coverage |
| --font-offBit101 (display, "Begin your", menu, cookie) | `"KH Interference", "FK Raster Roman Compact", "KH Teka", sans` | Regular 400 | |
| (new) --font-mono | `"KH Teka Mono", ui-monospace, monospace` | Regular 400 | numerals, labels, phone numbers, section index "01" if it improves legibility |

Rules: `@font-face` for family "KH Teka" declares weights 400/500/700 in one family; `font-display: swap`; **convert OTF → WOFF2** (e.g. `pyftsubset … --flavor=woff2 --unicodes=U+0020-007E,U+00A0-00FF,U+2018-201D,U+2013-2014,U+2026,U+20B9 --layout-features='*'`), self-host in `public/fonts/`, preload only the two above-the-fold files (Teka Bold + Teka Regular), no preload for Interference/Mono/FK. Fallback metrics: add `size-adjust/ascent-override/descent-override` fallback faces to limit CLS. Template hard-codes giant px sizes tuned to OffBit/Neue Power widths (`text-[580px]` numerals, `.heading-3xl` clamps) — render a specimen page at 375/768/1280/1920 and fix overflow/line-height regressions. Record final tokens here.
