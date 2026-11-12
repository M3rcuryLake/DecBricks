# About pictures — media cards beside each minor section (plan)

> On approval: copy this file to `docs/plans/about-pictures-plan.md` (first implementation step). PLAN ONLY — nothing implemented.

Owner brief: on `/about`, give every minor section (all except the intro "Who We Are", 01) a picture card beside the text, looking and behaving **exactly like the media cards beside the sections on `/services`**. Pictures supplied in `docs/aboutPics/` (5 files).

## 1. Findings

### Reference measurements — Services media card vs the About slot (node/Playwright probes, dev build 2026-11-12; screenshots in `docs/qa/shots/recon-*.png`)

| Breakpoint | Card size (w×h) | Aspect | Radius | Position / offset | Mobile order |
|---|---|---|---|---|---|
| 375 | 327×409 (full width minus block padding) | 0.800 | `40px 0 40px 40px` | below text (DOM order) | text first, card below |
| 768 | 720×900 (full width) | 0.800 | same | below text | same |
| 1280 | 300×375 (`xl:w-300`) | 0.800 | same | even idx → LEFT, odd → RIGHT; gap to text 60px | side column |
| 1920 | 410×513 (`4xl:w-410`) | 0.800 | same | alternates; gap 218px (justify-between) | side column |

- Intermediate: `lg:w-260` (1024–1279), `3xl:w-360` (1660–1919). Aspect 4:5 everywhere (`aspect-4/5 w-full overflow-hidden rounded-40 rounded-tr-none`).
- **Alternation:** `index % 2 === 0` → `lg:flex-row-reverse` → media renders LEFT (indices 0,2,4); odd → RIGHT. Verified on /services: strategy L, creative R, web-development L, campaigns R.
- **Corner ticks:** the 4 `size-9 bg-purple` squares sit on the *article* corners — **AboutBlock already has them** (copied chrome). The small red dashes seen at the card edge in screenshots are video content, not chrome — nothing extra to replicate for images.
- **Ghost numeral:** bottom-left on even blocks, bottom-right on odd (`lg:-right-15 left-auto`), font 275–580px, `z: auto`, `pointer-events-none` — sits behind both text (`z-1`) and the media column (`z-1`). About already renders it identically.
- **Scroll behaviour:** no parallax/reveal on the card. The only JS hook is `initServiceBlocks()` in `src/scripts/services-page.ts`: `.parts-autoplayVideo` video autoplay/pause via ScrollTrigger, **null-guarded** (`if (!video) return`). `initServicesPage()` runs on every route (gates on `.sections-servicesHero`), so its teardown/init lifecycle already covers /about. **No assumptions about block count anywhere** (queries are by class). No global.css rules touch `.parts-serviceBlock` / `.parts-autoplayVideo` / `aspect-4/5` (0 occurrences — grep).
- **Tags row:** "Projects" label + beige pills under the card are Services-specific markup (`service.projects`). **Drop for About** (no data; would be invented content — AGENTS.md rule 6).
- **Current About slot:** 7 blocks (`ABOUT`, 01–07). The empty side column is exactly where the Services card sits (measured: text.right 1221 @1920 on odd blocks, article width 1850 — ~600px free for the 410px card + gap). Values block (05) is the busiest: 5 sage cards in a 2-col grid, height 687px @1920 vs ~479px for a text-only block.
- **Previous overflow bug** (illustration vs Philosophy tagline, fixed): lives in the ContactForm section (`clipIllustration` on /about), *below* the blocks — adding media inside `.parts-serviceBlock` cannot reintroduce it; verify after implementation (§6).

## 2. Picture inventory + mapping

All 5 files are halftone/retro-filtered, palette-adjacent. Native PNG sources copied unchanged to `src/assets/about/`; sharp (already in `node_modules`, transitive Astro dep — **no new dependency**) produces WebP/AVIF at build.

| File | Size | Subject / colours | Section | Focal / crop to 4:5 | Clash notes | Alt text (new, ≤125 chars) |
|---|---|---|---|---|---|---|
| `image_3_horse_retro_filter.png` | 907×1200, 0.756, 122 KB | Red lithograph print, wild horses over a small city skyline | **02 What Drives Us** | crop sides ~5%; energy centred | **none — full red, on-brand** | "Red print-style artwork of wild horses surging above a small city skyline." |
| `image_0_rocket_retro_filter.png` | 698×872, 0.800, 43 KB | Rocket lifting off, seen from above; cool grey + warm glow | **03 Mission** | native aspect, no crop | muted cool tones, ok on off-white | "Rocket lifting off over coastal wetlands, seen from above in a halftone print style." |
| `image_4_poster_retro_filter.png` | 1414×2000, 0.707, 332 KB | Retro-typography poster collage; hot pink/cyan/blue + halftone portraits | **04 Vision** | crop sides ~12%; full-bleed texture, no single focal | **flagged:** hot pink ≈ coral family, but cyan/blue fights the palette; third-party credit visible in-image ("Zeka Design") → rights question §7 | "Retro typography poster collage mixing halftone portraits, liquid lettering and experimental colour." |
| `image_1_airstrip_retro_filter.png` | 1143×1428, 0.800, 205 KB | Satellite recon view of an airbase, jet shadows, printed coordinates | **06 Experience** | native aspect, uniform texture | sand/olive tones harmonise | "Aerial survey view of an airbase with jet shadows and coordinate markings along the edges." |
| `image_2_bust_retro_filter.png` | 1125×2000, 0.562, 134 KB | Classical marble bust, beige halftone dots on charcoal | **07 Philosophy** | vertical crop (face at ~35–45% height) → `position: 50% 40%` | beige/charcoal = palette-perfect | "Classical marble bust rendered in beige halftone dots against a charcoal ground." |

**Rationale:** horses surging forward = *drive* (and the only full-red image lands on an even/left block next to the burgundy ghost numeral); liftoff = *mission*; an emerging-trends poster = *vision* ("embrace emerging technologies"); field reconnaissance = *experience* (prospect research, targeted outreach); the thinker = *philosophy*.

**Sections without a picture:** **05 Values** (recommendation) and **01 Who We Are** (intro). There are 5 pictures for 6 minor sections + intro, so one minor section must go without — Values is the right one: its 5 sage cards are already the visual, and a 260–410px card beside a 2-col card grid crowds 1024–1280 (see §3). The intro keeps its hero treatment (smiley text, giant display) — no card.

## 3. Design spec

- **Card:** reuse the Services column verbatim — `relative z-1 mt-40 flex flex-col lg:mt-0 lg:w-260 lg:shrink-0 xl:w-300 3xl:w-360 4xl:w-410`, media wrapper `aspect-4/5 w-full overflow-hidden rounded-40 rounded-tr-none`. Sizes/radius match Services exactly per breakpoint (measured table §1).
- **Side alternation:** inherit block parity (`isEven`) exactly like ServiceBlock — with Values skipped: 02 R, 03 L, 04 R, 06 R, 07 L — pattern still alternates visually (L/R/L/R/L in sequence), consistent with Services.
- **Ghost numeral layering:** unchanged — numeral stays `absolute … pointer-events-none` behind; media column gets `relative z-1` (same as text column). No z-index changes.
- **Mobile/tablet (<1024):** media column flows below the text (DOM: text div, then media div — same order as ServiceBlock), full width minus padding, aspect 4:5.
- **Tags row: dropped.** No "Projects" pills on About (no data; rule 6).
- **Values block (05):** **no picture.** Fallback if the owner insists: add the card only at `xl`+ (≥1280, where the measured gap absorbs it) and let the 5 sage cards drop to a single column below `3xl` — noted as the crowding workaround, not recommended.
- **Image rendering:** `astro:assets` `<Picture formats={['avif', 'webp']}>` (Astro-native, zero deps), explicit `widths`, `sizes="(min-width: 1920px) 410px, (min-width: 1660px) 360px, (min-width: 1280px) 300px, (min-width: 1024px) 260px, calc(100vw - 47px)"`, `loading="lazy" decoding="async"`, `alt` from the data file. Crop `position` per row §2. `object-cover` inside the fixed-aspect wrapper → **zero CLS** (layout is independent of image load).

## 4. Implementation steps (ordered, file by file)

1. **Plan doc into the repo:** copy this file to `docs/plans/about-pictures-plan.md`.
2. **Copy assets** (no edits to the files): `docs/aboutPics/image_{0,1,2,3,4}_*.png` → `src/assets/about/{rocket,airstrip,bust,horse,poster}.png`. New directory; nothing in `public/` (astro:assets emits hashed build assets).
3. **`src/data/about.ts`** — extend the interface: `image?: { src: ImageMetadata; alt: string; position?: string }` (import the 5 files via `import rocket from '../assets/about/rocket.png'` etc.; `ImageMetadata` from `astro`). Attach `image` to sections 02, 03, 04, 06, 07 with the alt texts + positions from §2. About copy stays verbatim — this only *adds* an optional field.
4. **`src/components/AboutBlock.astro`** — add the media column as the last child of the `<article>` (after the text div), mirroring ServiceBlock's media column but with `<Picture>` instead of the video wrapper:
   ```astro
   {section.image && (
     <div class="relative z-1 mt-40 flex flex-col lg:mt-0 lg:w-260 lg:shrink-0 xl:w-300 3xl:w-360 4xl:w-410">
       <div class="aspect-4/5 w-full overflow-hidden rounded-40 rounded-tr-none">
         <Picture formats={['avif','webp']} src={section.image.src} alt={section.image.alt}
           widths={[328, 660, 736, 820]} sizes={SIZES} loading="lazy" decoding="async"
           {...(section.image.position ? { position: section.image.position } : {})}
           class="h-full w-full object-cover" />
       </div>
     </div>
   )}
   ```
   Import `Picture` from `astro:assets`. No class renames; existing hooks (`.parts-serviceBlock`, corner ticks, numeral) untouched.
5. **`src/scripts/services-page.ts`** — **no change required**: `initServiceBlocks()` queries `.parts-autoplayVideo` and already null-guards the missing `<video>`. Optional one-line comment noting About blocks intentionally have no video (keeps future readers from "fixing" it).
6. **Docs:** PROGRESS.md entry, mapping.md row for the About media slot (points at the same ServiceBlock classes), Design-handoff note (Values/intro skip decision + rights flag).

No new dependencies; no copy changes; no GSAP additions; `prefers-reduced-motion` unaffected (no new motion).

## 5. Risks & edge cases

- **CLS / ScrollTrigger refresh:** fixed `aspect-4/5` wrapper + explicit intrinsic size from astro:assets → no reflow when images decode; ScrollTrigger offsets don't shift. No refresh hook needed.
- **Page transitions:** media is static markup inside `.parts-serviceBlock`; swap lifecycle (main.ts) re-inits everything by class — no new teardown needed. Video autoplay wiring is the only per-block JS and ignores images.
- **Values layout:** solved by not giving it a card (§3 fallback documented).
- **320px:** article `px-14` → card ≈264px wide, aspect-locked — fine. **2560px (4xl):** column caps at `4xl:w-410`, same as Services — fine.
- **Weight budget:** sharp WebP at ~410–820px wide from these halftone PNGs ≈ 15–60 KB each (AVIF less); whole-page image payload well under the 600 KB mobile / 1.2 MB @1920 budget. Sources total 860 KB but are build-time only.
- **Heading hierarchy:** untouched — media adds no headings; `aria-labelledby` per block stays.
- **Sidebar nav:** untouched; ids/numbers unchanged, tracking unaffected.
- **check:brand:** alt texts contain no "Decbricks" → no impact.
- **Poster image rights** (third-party credit visible in-image): owner question, §7 — flagged in open-items when implemented.

## 6. Verification plan (post-implementation, node/Playwright probes at 375/768/1280/1920)

1. Screenshots per section (02, 03, 04, 06, 07) at the 4 widths → `docs/qa/shots/`.
2. Card box equals the Services card at the same breakpoint (±2px: 327×409 / 720×900 / 300×375 / 410×513), radius `40px 0 40px 40px`, `rounded-tr-none`.
3. Alternation: 02 R, 03 L, 04 R, 06 R, 07 L; Values (05) and intro (01) have no card.
4. `document.scrollingElement.scrollWidth === innerWidth` at all widths (no horizontal overflow — incl. the Philosophy/illustration area).
5. Served format/size: `img.currentSrc` ends `.avif` or `.webp`; natural sizes ≤2× layout size; per-image transfer <100 KB.
6. CLS ≈ 0 (aspect box fixed before load — probe with network throttling on the images).
7. Console clean; sidebar nav still tracks sections 01–07; ghost numeral still behind the card (numeral z auto < card z-1).
8. Gates: `npm run build`, `npm run check` (0/0/0), `npm run check:brand`.

## 7. Open questions for the owner

1. **Picture rights/credits:** `image_4_poster` visibly credits "Zeka Design" (third-party designer) in-image, and the set's provenance/licence is unknown — same class of question as the logo (open-items B1-style). Ship as-is, or swap that picture before launch?
2. **Values (05) without a picture, and intro (01) without one** — confirmed as the recommendation (5 pictures < 6 minor sections + intro). If you'd rather the intro get a picture and a different minor section go bare, say which.
3. **Crop preference** for `bust` (face at ~40% height, cropped top/bottom to 4:5) and `poster` (side-cropped ~12%) — I've picked focal positions; override if you want different crops.

## 8. Effort & order

| Step | Size |
|---|---|
| 1. Plan doc into the repo (`docs/plans/`) | XS |
| 2. Copy 5 assets to `src/assets/about/` | S |
| 3. `about.ts` data shape + image fields | S |
| 4. `AboutBlock.astro` media column (Picture) | M |
| 5. Optional services-page.ts comment | XS |
| 6. Verification probes + screenshots + gates | M |
| 7. Docs (PROGRESS/mapping/Design-handoff/open-items) | S |

Total: small — roughly half a day including verification. Order as listed; steps 2–4 are one commit, verification + docs follow.
