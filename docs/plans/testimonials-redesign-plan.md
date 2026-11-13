# Testimonials redesign plan — Decbricks home page

Status: PLAN ONLY (awaiting owner approval) · Date: 2026-11-13
Evidence: `docs/plans/audit/testimonials-current.md` · Shots: `docs/qa/shots/testi-current-*.png`, `testi-proto-{a,b,c}-{375,1440}.png`
Prototypes: `docs/plans/proto/testimonials-{a,b,c}/index.html` (static, never imported by the site)

## 1. Executive summary

- Today's section is a drag-only 3200px scatter canvas with 1minus1 sticker art and HUD chips: **keyboard users reach 1 of 9 quotes** (80 Tab stops, 0 focusables), mobile shows **0 fully-visible cards** (360px cards in a 339px field), touch is trapped (`touch-action:none`), and ~1 MB of decorative 1minus1 IP loads per visit.
- Redesign to an **editorial spotlight (Concept A)**: one featured quote in confident Bricolage type inside an off-white card on the burgundy band, an FK Raster "01 / 08" index as the typographic signature, an **"All quotes" rail** that keeps every quote visible and reachable without any drag, prev/next buttons + keyboard arrows + swipe.
- All content moves to a typed `src/data/testimonials.ts` with a clearly-marked **placeholder set** derived from the current quotes (no "1minus1", no real names, no fake ratings) and a **launch guard** (`check:placeholders` + `PUBLIC_SHOW_PLACEHOLDER_TESTIMONIALS`).
- 1minus1 sticker art, minimap, counter chip, drag-cursor marquee, Draggable/Inertia scatter and the per-frame ticker are **deleted** (~535-line script → ~150-line script; ~1 MB payload removed).
- No Review/AggregateRating schema while placeholders exist — and, plainly: Google treats self-serving reviews on your own site as ineligible for rich results; this section should never carry Review schema even with real quotes.
- 6 phases, each shippable independently; per-phase `npm run build` + `check` + `check:brand` + Playwright acceptance.

## 2. Findings (ranked — full evidence in the audit doc)

| Rank | Problem | Evidence |
|---|---|---|
| 1 | Drag-only navigation; 0 focusables; quotes as bare `<h3>`s; no section heading/landmark (WCAG 2.1.1, 1.3.1, 4.1.2) | F-T1, F-T5 |
| 2 | Content cut: 360px cards in 339px field @375 (0 fully visible); 7/9 quotes need dragging @1920; vast empty sage field | F-T2, F-T3 + shots |
| 3 | 1minus1 IP: sticker art (~1 MB, dual-format over-fetch) + 2 verbatim "1minus1" quotes + template-client attributions | F-T6, F-T8 + open-items B2/C1 |
| 4 | Touch scroll trap on the field (`touch-action:none`; synthetic swipe did not scroll) | F-T4 |
| 5 | Game feel: minimap, counter chip, "Drag To Navigate" cursor marquee, scattered tilted cards, meaningless 5×pixel-cross "ratings" ×9 | F-T7 |
| 6 | Perf: permanent GSAP ticker, InertiaPlugin, ~20 `will-change` layers, 1 MB decorative images | F-T6, F-T9 |
| 7 | A11y noise: 45 unlabeled star SVGs; one-off "Hell Let Loose / Web" chip inconsistency | F-T5 |
| 8 | Reduced-motion only zeroes wiggle; access model unchanged | F-T10 |

Confirmed OK to preserve: init/teardown registered in boot + `onAfterSwap` (6-swap gauntlet clean, no console errors), wheel-scroll friendliness, card colour pairs (burgundy on off-white ≈10:1, beige ≈8.6:1, sage 7.0:1).

## 3. Concept decision

**Chosen: A — editorial spotlight** (`docs/qa/shots/testi-proto-a-{375,1440}.png`).

Thesis: social proof works when one voice is loud and everything else is calm. One huge quote, one attribution, a typographic index, and a rail that makes the *whole* set visible — the exact opposite of "hunt for quotes in a scatter field".

- **Composition (1440):** burgundy band → head row (mono kicker `/// SOCIAL PROOF` + h2 "What our clients say" left, FK Raster `01 / 08` right) → 2 columns: featured off-white card (quote ≤44px Bricolage SemiBold, attribution row: burgundy initials disc + name/role + olive service chip) and the "All quotes" rail (beige text on burgundy; each item a real `<button>` — the rail **is** navigation *and* content). Controls row: prev/next 44px discs + thin coral progress bar.
- **Composition (375):** full-width featured card; rail becomes a collapsed disclosure ("All 8 quotes" — 8 stacked buttons @375 is too tall open by default); controls below.
- **Type roles:** Bricolage Grotesque = quotes + section title; Hanken Grotesk = body/attribution; FK Raster = index numerals + `///` marks (the display moment); Departure Mono = kicker/meta/chips.
- **Colour pairs (measured):** burgundy text on off-white card ≈10:1; burgundy on beige ≈8.6:1; beige rail text on burgundy ≈10:1; olive chip text on off-white 6.1:1-class (uses existing olive/off-white pair); coral only decorative (`///` marks, progress bar, focus ring on burgundy = large/decorative use). Attribution secondary text uses ink `#2A0208` at ≥72% opacity on light surfaces.
- **Motion:** crossfade + 12px rise on change (0.35s ease-out), index numeral crossfades, progress bar animates width; nothing else. No autoplay.
- **Signature moment:** the FK Raster index rolling 01→02 as a quote changes, with the coral progress edge drawing across.
- **Scales 3→20:** rail is the pressure valve — 3 quotes: rail hidden, just buttons; 20: rail scrolls with `data-lenis-prevent` container.
- **Replaces stickers/HUD:** no images at all; typography (FK Raster numerals, `///` marks, initials discs) carries the character. Minimap/counter → the `01 / 08` index. Burgundy frame/sage field → the band *is* the frame (current outer band kept, inner sage field retired).
- **Why not B (brick wall):** honest and on-brand, but the featured card spanning the grid breaks the brick rhythm (prototype shows the seams), filters add logic the placeholder set doesn't earn yet, and nothing about it is a *moment*. **Fallback if the owner prefers B:** it is fully specced by the prototype; P1 swaps layout only, P2 becomes filter+reveal instead of carousel.
- **Why not C (split sticky):** calm but flat — no signature moment, weak on mobile (sticky collapses), and the left column invites fake trust stats (which we refuse to invent). Marquee variant rejected outright: duplicated content for screen readers, motion noise, weak hierarchy.

## 4. Design spec per breakpoint

| | 320–455 | 640–1023 | 1024–1919 | ≥1920 |
|---|---|---|---|---|
| Band padding | 20px sides, 48px top | 24–32px | 48px | 64px |
| Head | kicker + title stack; index right | same | 2-col head, title ≤44px | title ≤52px |
| Featured card | full width, min-h auto, padding 24px | full width, padding 32px | quote ≤40px, padding 48px | quote ≤44px |
| Quote size | 24px/1.2 | 28px/1.2 | clamp → 40px | 44px/1.15 |
| Rail | `<details>` disclosure, closed by default | `<details>` open above 768 | right column 300px | 320px, top-aligned |
| Index | 40px FK Raster | 56px | 72px | 72px |
| Controls | under card, 44px targets | same | under grid, full-width progress | same |
| Grid | 1 col | 1 col | `minmax(0,1fr) 300px` | `minmax(0,1fr) 320px` |

- **Surfaces:** band burgundy `#800020`; featured card off-white `#FFF9F2` (card 2/5 variants could use beige `#F3E6D5` per-quote for rhythm — keep uniform in v1); rail on burgundy; chips olive-border/off-white-text; progress track `rgba(243,230,213,.25)` + coral fill.
- **States:** buttons hover → off-white bg/burgundy text; `:focus-visible` → 2px coral outline, 2px offset (matches Phase-1 tokens); rail active item → off-white bg/burgundy text; swipe threshold 48px horizontal.
- **Reduced motion:** crossfade/rise → instant swap, no transition; index still updates (it's text).
- **Type/spacing tokens:** Phase-1 vars (`--radius-14/16`, motion tokens, ink) from `decbricks.css`; no hardcoded shadows.

## 5. Template testimonials (ready to paste into `src/data/testimonials.ts`)

All `placeholder: true`, `consent: false`, `rating` omitted, `avatar`/`link` omitted. `service` uses the real taxonomy from `src/data/services.ts` (Strategy / Creative / Web Development / Campaigns). Mapping to current quotes noted; sentiments and length variety preserved; zero real names, companies, or metrics.

```ts
// src/data/testimonials.ts
export interface Testimonial {
  id: string;            // 't-1' … — deep-linkable (#t-3)
  quote: string;
  name: string;
  role: string;
  company: string;
  service: 'Strategy' | 'Creative' | 'Web Development' | 'Campaigns';
  avatar?: string;       // initials fallback when absent
  rating?: number;       // default off — no fake stars
  link?: string;         // only with a real, live case study
  consent: boolean;      // written consent recorded
  placeholder: boolean;
}

export const TESTIMONIALS: Testimonial[] = [
  // from current #0 (one-liner) → Strategy
  { id: 't-1', quote: 'It felt like having another strategist on our side — not just another agency.',
    name: 'Client Name', role: 'Founder', company: 'Studio Name', service: 'Strategy', consent: false, placeholder: true },
  // from current #1 (medium) → Creative
  { id: 't-2', quote: 'We worked as one force from first sketch to final cut — and the recognition followed.',
    name: 'Client Name', role: 'Creative Director', company: 'Brand Name', service: 'Creative', consent: false, placeholder: true },
  // from current #2 (one-liner; removes verbatim "1minus1") → Web Development
  { id: 't-3', quote: 'We found the perfect partner. Highly recommended.',
    name: 'Client Name', role: 'Producer', company: 'Company Name', service: 'Web Development', consent: false, placeholder: true },
  // from current #3 (long) → Web Development
  { id: 't-4', quote: 'A tremendous thank-you to the entire team — your dedication and collaboration have been invaluable from day one.',
    name: 'Client Name', role: 'Product Lead', company: 'Company Name', service: 'Web Development', consent: false, placeholder: true },
  // from current #4 (long) → Strategy
  { id: 't-5', quote: 'Their expertise lifted our engagement to new heights. Always pushing the boundaries, with the flexibility and creativity you hope for in a partner.',
    name: 'Client Name', role: 'Head of Growth', company: 'Company Name', service: 'Strategy', consent: false, placeholder: true },
  // from current #5 (medium) → Creative
  { id: 't-6', quote: 'From the collaborative design process to the meticulous execution of our vision, they have been a joy to work with.',
    name: 'Client Name', role: 'Studio Head', company: 'Company Name', service: 'Creative', consent: false, placeholder: true },
  // from current #6 (medium) → Campaigns
  { id: 't-7', quote: 'They exemplify professionalism and offer invaluable insights. Their execution was impeccable.',
    name: 'Client Name', role: 'Marketing Manager', company: 'Company Name', service: 'Campaigns', consent: false, placeholder: true },
  // from current #7 (long; removes "Hell Let Loose" chip/metric claims) → Campaigns
  { id: 't-8', quote: 'Exceptional work across the board — campaigns drove a real revenue uplift and supported rapid audience growth ahead of our launch.',
    name: 'Client Name', role: 'Publishing Director', company: 'Company Name', service: 'Campaigns', consent: false, placeholder: true },
];
// current #8 (Team17) duplicates #7's client — dropped; #2 "1minus1" mention and #8 "1minus1 team"
// mention are IP copy and are gone.
```

## 6. Architecture

**Delete** (all 1minus1-origin or drag-canvas-only):
- `Testimonials.astro`: 10 sticker `<picture>` blocks (`/images/case-studies/*` "Group 508xx" art — do **not** delete the files from `/images/case-studies/` wholesale: other sections reference some; only the 10 sticker references die with the markup; flag the now-unused hashes in open-items B2), minimap chip + SVG, vertical "Testimonials" span, counter chip, `parts-marqueeCursor` block, bordered sage field frame.
- `src/scripts/testimonials.ts`: `placeCards`, `placeStickers`, both `Draggable`s, minimap sync, per-frame ticker, `initMarqueeCursor`. Draggable/InertiaPlugin registrations in `core/gsap` stay untouched (used by nothing else after this — note in handoff, revisit later).

**New/rewritten**:
- `src/data/testimonials.ts` — typed set + `export const hasPlaceholderTestimonials = TESTIMONIALS.some(t => t.placeholder)`.
- `src/components/Testimonials.astro` — one section reading the data file; structure:
  `section.tst-band[aria-labelledby]` → head (`p.tst-kicker` "/// SOCIAL PROOF", `h2#testimonials-title`, `p.tst-index[aria-hidden]` + a visually-hidden live region announcing "Quote 3 of 8") → grid: featured `article.tst-card` (quote `<blockquote>`, attribution: initials disc, name/role, service chip) + `nav.tst-rail[aria-label="All quotes"]` of `<button aria-controls="t-N">` items → controls (`button.tst-prev/.tst-next` with SVG arrows, `div.tst-progress`).
  Old hooks `.sections-testimonials*`, `.parts-testimonialCard`, `.parts-testimonialMiniMap*` are removed with the component — documented in `docs/mapping.md` (this is a deliberate exception to the no-rename rule: the script is rewritten in the same change).
- `src/scripts/testimonials.ts` (rewrite, ~150 lines) — `initTestimonials()` returns teardown; sets up: current index state; prev/next click; `keydown` ArrowLeft/Right scoped to the section; rail button clicks; pointer swipe on the featured card (pointerdown/up, 48px threshold, horizontal-only, no `touch-action:none` — vertical scroll always passes through); deep-link `location.hash` → `#t-3` opens that quote; focus moves to the featured card on programmatic change (only for keyboard/rail activation, not swipe); `aria-hidden`+`inert` on non-active cards? **No**: v1 shows exactly one quote; inactive quotes exist only in the rail (buttons), so nothing is hidden from screen readers except the duplicate featured card, which is `aria-hidden` when not active. Teardown: remove listeners, kill no GSAP (pure CSS transitions via `.tst-anim` class toggle).
- `src/styles/decbricks.css` — one new `/* Testimonials (tst-*) */` block: band, card, rail, controls, disclosure, states, reduced-motion media query, focus rules. No global.css edits, no new utilities needed beyond existing tokens.
- `main.ts` — **no change required**: `initTestimonials()` already registered in boot + `onAfterSwap` with generic teardown. `reattachCanvases()` path untouched (section owns no canvases; it sits in normal flow above the WebGL background band like today).
- Lenis: no `data-lenis-prevent` needed on desktop; if the ≥20-quote rail needs internal scroll it gets `data-lenis-prevent` + explicit `pointer-events:auto` (per AGENTS.md iframe/lenis note).
- SEO/schema: JSON-LD **unchanged** — no Review/AggregateRating ever while `hasPlaceholderTestimonials`; even with real quotes, self-serving reviews on your own Organization are ineligible for Google rich results — recommend never adding it; third-party profiles carry ratings instead.
- Icons/arrows: inline SVG like today's crosses (no icon dep).

**Class-hook policy:** new `tst-*` hooks used only by the rewritten script; nothing outside this section queries the removed hooks.

## 7. Placeholder launch guard

1. `PUBLIC_SHOW_PLACEHOLDER_TESTIMONIALS` env (default unset): when `hasPlaceholderTestimonials && !flag` → component renders **nothing** for the section in prod build (keeps heading-count/anchors stable: the guard also removes the rail anchor) and in dev logs `console.warn('[testimonials] hiding section: placeholder quotes present (set PUBLIC_SHOW_PLACEHOLDER_TESTIMONIALS=true to preview)')`.
2. `scripts/check-placeholders.mjs` (zero-dep node script): fails `npm run check:placeholders` (new package.json script, added in implementation) if any shipped testimonial has `placeholder: true` **and** consent false when the env flag is set — i.e. forces the owner to clear placeholders consciously. Also scans for forbidden strings (`1minus1`, real-client names from a denylist) in the data file.
3. open-items §E launch checklist entry: "Testimonials: either real quotes with recorded consent, or the section is hidden — `npm run check:placeholders` must pass".
4. Owner swap-in path: replace fields in `src/data/testimonials.ts`, set `placeholder: false, consent: true` per quote + recorded consent date; ratings stay off unless a policy exists.

## 8. Phases

**P0 — Make it shippable (S).** Goal: remove 1minus1 IP from the section without building the new UI.
Tasks: create `src/data/testimonials.ts`; swap the 9 hardcoded cards to render from data (same drag-canvas layout, placeholders in, sticker art + minimap + cursor marquee + counter chip removed, "1minus1" quotes replaced); add guard + `check:placeholders`; open-items §E + B2 entries.
Acceptance: `grep -ri "1minus1" dist/` clean for this section; no `/images/case-studies/` sticker loads in devtools; build/check/check:brand/check:placeholders green; drag section still boots+tears down across 3 swaps; 44px+ tap targets on whatever remains interactive (none — it's drag-only until P1, flagged interim).
Risk: drag canvas with 9 sparse cards may look emptier; accepted interim (owner sees new UI at P1). Rollback: revert commit.

**P1 — New static layout (M).** Goal: spotlight + rail, no motion, old script deleted.
Tasks: rewrite `Testimonials.astro` + `testimonials.ts` script (static first-card render, buttons render but no-op), `decbricks.css` `tst-*` block, delete sticker/drag/minimap code, mapping.md update.
Skills: frontend-design (layout/type decisions already fixed by prototype), frontend-ui-engineering, astro-best-practices.
Acceptance (Playwright): section renders h2 + 1 featured quote + 8 rail buttons; 0 sticker requests; section height 320→~700px depending on viewport with **0 cut cards** at 375/768/1440/1920; buttons focusable with visible focus; swap gauntlet ×3 clean; build/check/check:brand green.
Risk: rail buttons duplicate quotes for SR (acceptable: they're controls, not hidden content). Rollback: revert commit (old component stays in git history).

**P2 — Interaction (M).** Goal: keyboard, swipe, deep links, state.
Tasks: carousel state machine from §6; `aria-live` announce; hash deep-link; swipe; rail active state sync; disclosure behaviour on mobile.
Acceptance: Tab reaches prev/next + 8 rail buttons (11 stops, all 44px); ArrowLeft/Right changes quote + focus; `#t-3` opens quote 3 after client-side nav; swipe at 375 changes quote without blocking vertical scroll (scrollY changes when swiping vertically on the card); no autoplay anywhere; reduced-motion swaps instantly (CSS media query, verified by emulation); console clean.

**P3 — Motion polish (S).** Goal: calm motion language.
Tasks: crossfade + 12px rise via CSS transitions (GSAP not needed); index numeral micro-crossfade; progress bar width transition; honour prefers-reduced-motion globally for the block.
Acceptance: no layout shift from motion (CLS delta ≤0.008 during change); reduced-motion emulation shows instant swap; 60fps during transition (trivial — transform/opacity only).

**P4 — Responsive/a11y/perf hardening (M).**
Acceptance: full keyboard traversal battery; screen-reader snapshot (audit doc format) shows: region + h2 + 1 quote + 8 named buttons, no unlabeled images; contrast spot-check pairs from §4; Lighthouse a11y ≥95; CLS ≤0.008, no long tasks >50ms attributable to the section; swap gauntlet ×5; 320/375/768/1024/1440/1920/2560 screenshot battery.

**P5 — QA + docs + launch checklist (S).**
Tasks: findings → `docs/qa/findings.md`; handoff/tokens/mapping/PROGRESS/open-items updates; `check:placeholders` wired into the pre-launch checklist; final review via web-design-guidelines.

Dependencies: P1 needs nothing (data file from P0). Owner inputs block only the *real-content* swap, not any phase.

## 9. Verification plan (per-phase matrix)

| Check | P0 | P1 | P2 | P3 | P4 | P5 |
|---|---|---|---|---|---|---|
| build + check + check:brand | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| check:placeholders | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| No 1minus1 strings/art in section | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Keyboard battery (Tab + arrows) | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| SR snapshot (region/heading/buttons) | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cut-card probe (7 viewports) | – | ✓ | ✓ | ✓ | ✓ | ✓ |
| Touch: vertical scroll passes through | – | – | ✓ | ✓ | ✓ | ✓ |
| Deep-link #t-N | – | – | ✓ | ✓ | ✓ | ✓ |
| Reduced-motion | – | – | ✓ | ✓ | ✓ | ✓ |
| Swap gauntlet ×5 | ✓×3 | ✓ | ✓ | ✓ | ✓ | ✓ |
| CLS/long-tasks | – | – | – | ✓ | ✓ | ✓ |
| Contrast spot-checks | – | ✓ | ✓ | ✓ | ✓ | ✓ |

## 10. Owner inputs (needed before real content ships — none block P0–P4)

1. Real quotes: text + client name + role + company + written consent (per quote).
2. Ratings policy (default: none shown).
3. Avatars/logos: real files or initials-only (initials is the default).
4. Case-study links for any quote (only to real work items).
5. Video testimonial: out of scope for v1 (slot reserved in data shape); decision deferred.
6. CTA copy: "Start a project" → `/contact` reuses existing contact copy ("Begin your story") — confirm wording.

## 11. Risks

- **Placeholder visibility:** biggest risk is shipping fake social proof. Mitigated twice (env default hides in prod + check script + §E checklist).
- **Interim P0 emptiness:** drag canvas without stickers looks sparse for one phase; acceptable, P1 lands the redesign.
- **Concept drift from template language:** spotlight is calmer than the template's playfulness — deliberate (owner asked to lose the game feel); the band, rounded corners, mono kickers and pixel motifs keep it on-brand.
- **Rail duplication (mobile disclosure):** quotes exist once in DOM; disclosure toggling must not create duplicate reading order — verified in P2 a11y battery.
- **B2 residual:** unused sticker image files remain in `/images/case-studies/`; flagged in open-items for the final B2 sweep rather than deleted here (some hashes may be referenced elsewhere).

## 12. P0 execution prompt stub (ready to paste)

> Implement Phase 0 of `docs/plans/testimonials-redesign-plan.md` on the Decbricks repo (work on main, TDD probes where applicable, commit at the end):
> 1. Create `src/data/testimonials.ts` exactly as §5 of the plan (typed interface + 8 placeholder entries + `hasPlaceholderTestimonials`).
> 2. Refactor `src/components/Testimonials.astro` to map over the data file: same drag-canvas layout for now, but (a) delete all 10 sticker `<picture>` blocks, (b) delete the minimap, counter chip, vertical span and `parts-marqueeCursor` markup, (c) replace the two "1minus1" quotes with the placeholder set.
> 3. Update `src/scripts/testimonials.ts` so it null-guards the removed nodes (stickers/minimap/cursor arrays may be empty) — no behaviour change otherwise.
> 4. Add the placeholder guard: in dev, `console.warn` + still render when `PUBLIC_SHOW_PLACEHOLDER_TESTIMONIALS=true`; in prod build (`import.meta.env.PROD`), render nothing when placeholders exist and the flag is unset. Add `scripts/check-placeholders.mjs` + `"check:placeholders"` npm script; run it in CI-style battery.
> 5. Update `docs/open-items.md` (§E entry + B2 note on unused sticker files), `docs/PROGRESS.md`, `docs/Design-handoff.md` (one line: data-file extraction, IP removal).
> 6. Acceptance: `npm run build && npm run check && npm run check:brand && npm run check:placeholders` green; `grep -ri "1minus1" dist/` shows no testimonial-section hits; Playwright probe confirms 0 sticker requests and swap gauntlet ×3 clean; commit `testimonials p0: data file + placeholder guard + 1minus1 art removal`.
