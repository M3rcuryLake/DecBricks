# Testimonials — current-state audit (evidence)

Date: 2026-11-13 · Probes: `/tmp/opencode/testi-audit.cjs`, `testi-audit2.cjs` (Playwright + Chromium, dev server `[::1]:4321`)
Shots: `docs/qa/shots/testi-current-{375,768,1920,2560}.png`, `testi-current-{after-drag,reduced-motion,after-swaps}-1440.png`, `testi-current-touch-375.png`
Raw numbers: `/tmp/opencode/testi-audit.json`

## 1. How it works today (source-verified)

- `src/components/Testimonials.astro` (1011 lines): 9 absolutely-positioned cards (`w-360` / `lg:w-540`) inside a sage field (`bg-sage`, `aspect-8/11` mobile → `aspect-5/2` + `min-h-720` desktop) inside a burgundy band (`bg-darkPurple`). 10 sticker `<picture>` elements (1minus1 artwork "Group 50839–50846", served from `/images/case-studies/*.{png,webp}`), a bordered frame (`border-lightPurple`/`darkPurple`), a minimap chip (`parts-testimonialMiniMap`), a vertical "Testimonials" span, and a fixed "Drag To Navigate" marquee cursor.
- `src/scripts/testimonials.ts` (535 lines): seeded random scatter of cards over a 3200px virtual canvas (`placeCards`), sticker placement avoiding cards, one `Draggable` (type x,y, `inertia: true`) on the slider + a second on the minimap cross, a per-frame `gsap.ticker` applying per-card lag/rotation (±6°)/scale while dragging, cursor card with `gsap.matchMedia`, teardown kills tickers/draggables/resize (pattern intact — `initTestimonials()` registered in both boot and `onAfterSwap` in `main.ts`).
- Cards use `heading-blockquote` (font-nohemi → Hanken Grotesk, 36px/33px mobile, 24px/28.8px for long quotes) and `subheading` attribution (12px bold uppercase). 5 pixel-cross SVGs (`svgs-cross`) per card act as "stars". Card 7 has a service chip ("Hell Let Loose / Web").
- Draggable plugin is registered globally in `core/gsap` (used elsewhere? drag+inertia only here — removable in redesign).

## 2. Measured findings (Playwright, 7 viewports)

| # | Evidence | Finding |
|---|---|---|
| F-T1 | keyboard: 80 Tab stops | **0 focusable elements inside the section.** Navigation is drag-only; keyboard/screen-reader users can reach only 1 of 9 quotes. Content is hidden from assistive tech by default. |
| F-T2 | 375/320 sweep, `testi-current-375.png` | Mobile: field is 339px wide; cards are 360px wide — **0 fully visible cards**, the centered card is cut at both edges (cut=11–38px), second visible card cut by 370–408px. At 768: 1 full, 2 cards cut 237–478px. |
| F-T3 | 1920 sweep, `testi-current-1920.png` | Desktop: **1 fully visible card + up to 4 partially cut** (7 of 9 need dragging). Vast empty sage field (1856×742 with one 540px card). Composition reads as "empty", not "confident". |
| F-T4 | touch probe (`testi-current-touch-375.png`) | `touch-action: none` on the slider + `data-lenis-prevent-touch`: a vertical swipe starting on the field **did not scroll the page** (scrollY unchanged) and did not navigate either. The field is a scroll trap on touch. |
| F-T5 | a11y snapshot | No section landmark or section heading (the "Testimonials" label is a decorative vertical span). Quotes are `<h3>` elements (semantically headings), attributions are bare text, the 5 pixel-crosses are unlabeled `img`s ×45, no `region`/`aria-roledescription`. Page heading order: H1 → H2s → H3 quotes with no H2 for this section. |
| F-T6 | resources | The 10 sticker `<picture>`s load **both** webp (300w+500w) *and* png fallback variants: sticker art ≈ 460 KB webp + ≈ 600 KB png ≈ **~1 MB of decorative 1minus1 IP** (open-items B2), plus `sizes="100vw"` forcing 500w at all viewports. |
| F-T7 | `testi-current-1920.png`, `testi-current-375.png` | Game-HUD furniture: minimap chip (desktop), counter chip, "Drag To Navigate" marquee cursor card, `cursor: none/grab`. The cursor marquee collides with the page's own marquee band at the section's top edge (375 shot). |
| F-T8 | quotes | 2 of 9 quotes contain "1minus1" verbatim (Invoke Studios, Team17). All attributions are template clients (Maison BAP, TTK Games, Invoke Studios, Turn 10, Crema, Lightspeed L.A., Blind Squirrel Games, Team17 ×2) — B2/C1: cannot ship as Decbricks social proof. |
| F-T9 | GSAP cost | Draggable + InertiaPlugin + a permanent `gsap.ticker` callback running every frame for the whole session (lag/rotation/scale even when the section is off-screen), `will-change-transform` on ~20 elements. |
| F-T10 | reduced-motion (source-verified; measured drag produced no rotation in either mode — `rotate` prop reads `none` because GSAP writes matrices) | Script zeroes rotation/offset/scale under `prefers-reduced-motion`, but drag-only navigation remains the only access path — reduced-motion users still cannot reach quotes except by mouse-dragging. |
| F-T11 | swap gauntlet (audit2, 6 swaps) | Re-init after swaps is **fine**: 9 cards, transforms re-applied, no console errors in any probe. (First probe's `section:false` was a probe artifact — not a site bug.) |
| F-T12 | wheel probe | Mouse wheel over the field scrolls the page normally on desktop (no wheel conflict) — only touch and drag semantics are affected. |

## 3. Ranked problem list

1. **P0 a11y: drag-only navigation** (F-T1, F-T5) — keyboard/SR users get 1 of 9 quotes; zero focusables; no roles; quotes-as-headings; no section heading. WCAG 2.1.1/1.3.1/4.1.2 failures.
2. **P0 content cut + emptiness** (F-T2, F-T3, shots) — 360px cards in 339px field on mobile; 7/9 quotes require dragging on desktop; huge dead space at 1920.
3. **P0 IP/content** (F-T8 + B2) — 1minus1 clients' quotes + 2 verbatim "1minus1" mentions + ~1 MB of 1minus1 sticker art cannot ship.
4. **P1 touch scroll trap** (F-T4) — `touch-action:none` + inertial panning hijacks vertical scroll on the field; user must start the swipe outside the field to move on.
5. **P1 game feel** (F-T7) — minimap, counter, cursor marquee, scattered tilted cards = playful arcade, opposite of "top-studio editorial social proof". No hierarchy: no featured quote, random scatter, 5 identical pixel-cross "ratings" on every card (rating without meaning, and per-card stars imply metrics).
6. **P2 performance** (F-T6, F-T9) — ~1 MB decorative images (dual-format + dual-width over-fetch), permanent ticker, InertiaPlugin, 20 `will-change` layers; all for a section users mostly cannot read.
7. **P2 semantics/noise** (F-T5) — 45 unlabeled star SVGs pollute the a11y tree; "Hell Let Loose / Web" chip appears on one card only (inconsistent).
8. **P3 motion semantics** (F-T10) — reduced-motion zeroes the wiggle but leaves drag-only access; motion isn't the problem, the interaction model is.

## 4. Current quotes (verbatim, for placeholder derivation ONLY — reference, never ship)

| # | Attribution | Quote (trimmed) | Type | Card bg |
|---|---|---|---|---|
| 0 | Maison BAP | "It felt like having another marketing-focused co-founder on our side." | one-liner | off-white |
| 1 | TTK Games | "We worked as one force to deliver the best. We have received lots of recognition." | medium | beige |
| 2 | Invoke Studios | "We found the perfect partner with 1minus1 … Highly recommended." | one-liner ⚠ "1minus1" | beige |
| 3 | Turn 10 | "A tremendous expression of gratitude to the entire team … your dedication and collaboration have been invaluable." | long | off-white |
| 4 | Crema | "Their expertise boosted our engagement to new heights … Always pushing the boundaries … flexibility, and creativity made them an invaluable partner." | long | off-white |
| 5 | Lightspeed L.A. | "From the collaborative design process, to the meticulous execution of our vision, they have been a joy to work with." | medium | off-white |
| 6 | Blind Squirrel Games | "They exemplify professionalism and offer invaluable insights. Their execution was impeccable." | medium | beige |
| 7 | Team17 (chip: Hell Let Loose / Web) | "The team delivered exceptional work across the board. Marketing efforts drove substantial revenue uplift and helped us hit a record sales target, while also supporting rapid wishlist growth for Hell Let Loose: Vietnam." | long | beige |
| 8 | Team17 | "The website ... exceeded every expectation, establishing a solid web foundation for the future of the franchise. Absolutely no hesitation in recommending the 1minus1 team." | long ⚠ "1minus1" | off-white |

All cards show 5 pixel-cross marks. One service chip on card 7 only.

## 5. Confirmed OK (preserve)

- init + teardown pattern registered in boot and `onAfterSwap` (F-T11) — any redesign must keep this.
- Wheel-scroll friendliness (F-T12); no console errors; CLS ≈ 0 for the section itself.
- Colour pairs on cards are accessible: burgundy #800020 on off-white ≈10:1, on beige ≈8.6:1, on sage 7.0:1 (docs/tokens.md §2c).
