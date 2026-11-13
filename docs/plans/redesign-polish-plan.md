# Redesign & polish plan — Decbricks website
Date: 2026-11-12 · Status: **DRAFT — awaiting owner approval** · Evidence: `docs/plans/audit/findings-redesign.md` (+ `docs/plans/audit/*.png`, raw `/tmp/opencode/audit.json`)

## 1. Executive summary

- Audit of 5 routes × 375/768/1280/1920 (+320/2560 spot-checks): **0 horizontal overflow, 0 console errors, 0 failed requests, 1 h1/no skips, focus rings everywhere**. The engineering is sound; the *design* is the problem.
- Biggest problems: (1) home hero collage reads broken (tilted video card overlaps display word); (2) ~2 screens of empty burgundy on `/`; (3) the only compositional idea — the tilt-collage — is repeated on every section until it becomes noise; (4) 1minus1 game-studio content (copy + neon-green video) everywhere on `/` and `/services`; (5) fallback copy visible on `/contact` ("ONLINE BOOKING IS NOT CONFIGURED YET."); (6) cookie banner overlaps content; (7) footer coral-band contrast fail (documented); (8) loader 3.0 s; (9) 2.5–2.8 MB block videos; (10) CLS 0.034 home@768.
- Recommended direction: **Editorial brick** — flatten the collage into straight editorial grids; keep the 40/0/40/40 radius + corner-tick signature; give Departure Mono a real job (labels/numerals/tags); FK Raster reserved for a few big display moments. Prototype: `docs/plans/audit/proto-editorial-brick-{1280,375}.png`.
- `/about` is the strongest page — it becomes the reference the system is generalised from.
- Phases: **0 Stabilise (S) · 1 Foundation (M) · 2 Global chrome (M) · 3 Heroes (L) · 4 Content (L) · 5 Interaction (M) · 6 UX/conversion (M) · 7 Perf/a11y (M) · 8 Final QA (S)**.
- Hard dependency: owner copy for `/` and `/services` (A12/C1) blocks *content* redesign; phases 3–4 deliver structure + system with 1minus1 copy held verbatim.

## 2. Findings & direction decision

### 2a. Findings (full tables in `findings-redesign.md`)

Machine sweep A1–A17 (all clean except the noted): contrast fail = footer coral band × burgundy text ≈2.1:1 (A8/R11); tap targets 12–36 px (A9/R12); CLS home@768 0.0344 from hero video slot `DIV.relative` t≈356 ms (A11/R14); loader ≈3.0 s (A13/R13); oversized payloads: 4× services block videos 2.5–2.8 MB, home video 747 KB, `computer-back-2000.webp` 623 KB, three.js 557 KB prod (A12/R15); Cal fallback copy (A16/R5); cookie overlap (A15/R9); 3× 1minus1 text on `/`, full set on `/services` (A17/R4).

Ranked design findings (sev S1 = launch blocker, S2 = must-fix, S3 = polish):

| ID | Where | Sev | Finding |
|---|---|---|---|
| R1 | / hero | S1 | Tilted video card overlaps display word; second word clipped; no focal point (`home-1920-hero.png`, `home-375-hero.png`) |
| R2 | / | S1 | ~2 full screens of empty burgundy between hero and service slabs (`home-1280-full.png`) |
| R3 | /services | S1 | All 4 block videos are 1minus1 game media; Strategy video is neon green — palette-breaking (`services-1280-full.png`) |
| R4 | / /services | S1 | 1minus1 copy/logos/testimonials everywhere (blocked on owner, C1/A12) |
| R5 | /contact | S2 | "ONLINE BOOKING IS NOT CONFIGURED YET." visible + duplicated sentence (`contact-1280-full.png`) |
| R6 | all | S2 | Tilt-collage overused on every section — scan path chaotic, template-like |
| R7 | / | S2 | Testimonials sage panel ~60% empty |
| R8 | all heroes | S2 | Giant display words clipped both edges with no anchor (`DISTINCT/BEGIN YO/CONTACT`) |
| R9 | all | S2 | Cookie banner overlaps hero subhead (375) and "JUMP TO" pills |
| R10 | /contact | S2 | Form fields pale coral on cream — washed affordance, borderline label contrast |
| R11 | all | S3 | Footer coral band × burgundy text ≈2.1:1 (tokens §2c-7, accepted-fail today) |
| R12 | all | S3 | Tap targets <44 px: Scroll To Explore, Rise to top, Manage Cookies, sidebar links |
| R13 | / | S3 | Loader 3.0 s on every first visit |
| R14 | / | S3 | CLS 0.034 @768 (hero video slot) |
| R15 | / /services | S3 | 2.5–2.8 MB videos; 623 KB poster |
| R16 | /404 | S3 | Dead-end recovery (single styled text link) |
| R17 | /about | — | Strongest page — reference for the system (`about-1280-full.png`) |

### 2b. Direction decision (Step 2 prototypes)

Three static prototypes built and screenshotted at 1280 + 375 (`docs/plans/proto/*.html`, shots `docs/plans/audit/proto-*-*.png`):

| Direction | Thesis | Verdict |
|---|---|---|
| **Editorial brick** ⭐ | Straight asymmetric grids, hairline rules, big Bricolage display with FK Raster reserved for hero numerals/ghost words; 40/0/40/40 radius + coral corner-tick as the repeated brand signature; mono labels (kickers, indices, meta rows); burgundy inverted bands used deliberately, not as filler | **Recommended** |
| Pixel craft | Burgundy canvas, dot-grid texture, mono-first chrome, clipped-corner "brick" cards, pixel corner brackets | Bold but dark and heavy; would push a rewrite of every surface and reads "gaming", which collides with the future non-games positioning |
| Warm minimal | Calm off-white, soft radii, quiet burgundy band, photography blocks | Safe but generic — exactly the "looks like every agency" trap the taste checklist warns about; weakens the brick identity |

**Recommendation: Editorial brick.** It is the smallest delta that fixes the biggest problems (R1/R2/R6/R8 are all *composition* problems), it keeps every existing token and font, and `/about` already proves it works. If you disagree: pick **Pixel craft** only if you want a dark, high-attitude site and accept ~2× Phase 4 effort; pick **Warm minimal** only if the brand should read calm-professional rather than bold-builder (prototypes are side-by-side for comparison). The plan below is written for Editorial brick; Phases 0–2 and 5–8 are direction-neutral and survive either choice.

## 3. Design system spec — "Editorial brick"

All values reuse or extend existing tokens (`docs/tokens.md`); new classes go in `src/styles/decbricks.css` only. No Tailwind, no new deps.

**Surfaces & elevation** (flat brand — elevation via value contrast, not shadows):

| Role | Surface | Text | Border/hairline |
|---|---|---|---|
| Page | Off-White `#FFF9F2` | Ink | `--hairline: rgba(42,2,8,.16)` |
| Island | Warm Beige `#F3E6D5` | Ink | none |
| Card | Off-White on Beige island, or Beige on Off-White page | Ink | hairline or none |
| Inverted band | Burgundy `#800020` | Off-White (≈10:1) | `rgba(255,249,242,.22)` |
| Secondary band | Sage `#C9D3C0` | Ink | `rgba(42,2,8,.16)` |
| Accent band | Coral `#D45060` | **Off-White only, ≥18.66 px bold** (3.9:1 large-text pass); small burgundy text on coral is BANNED (2.1:1 — fix footer, R11) | — |

- Depth rule: at most ONE inverted band per viewport-scroll at a time; bands alternate light→dark→light with a hairline or radius transition, never burgundy-on-burgundy (kills R2).
- **"Ink" neutrals — owner decision requested**: introduce `--color-ink: #2A0208` (warm near-black from the burgundy family) and `--color-ink-muted: color-mix(in oklab, #2A0208 62%, #FFF9F2)` for body/muted text on light surfaces, replacing today's burgundy-as-body-text and mixed greys. Measured: ink on Off-White ≈13.5:1, on Beige ≈12.5:1. Dark surfaces keep Off-White/Beige text.

**Type scale** (sizes clamp() fluid between breakpoints; Bricolage = display/UI, Hanken = body, Departure Mono = labels, FK Raster via `.font-brand` only):

| Role | Face | Size (375→1280+) | Weight/leading | Tracking |
|---|---|---|---|---|
| Display hero | Bricolage (+ FK Raster numeral option) | clamp(44px, 7.2vw, 104px) | 800 / 0.98 | −1.5% |
| Section heading | Bricolage | clamp(28px, 3.6vw, 52px) | 800 / 1.04 | −1% |
| Card heading | Bricolage | 19–20px | 700 / 1.2 | 0 |
| Lede | Hanken | clamp(17px, 1.4vw, 21px) | 400–500 / 1.55 | 0 |
| Body | Hanken | 16px / 15px (cards) | 400 / 1.6 | 0 |
| Kicker/label | Departure Mono | 11–12px, uppercase | 400 / 1 | +14% |
| Meta/mono index | Departure Mono | 10–12px | 400 | +10% |

- FK Raster display words are anchored, never edge-clipped on both sides (fix R8): either contained in a card/grid cell with corner ticks, or deliberately oversized off ONE edge with the readable span starting ≥8% in.

**Spacing rhythm**: 8-based steps in rem terms but rendered via existing px-integer utilities: section padding `clamp(56px, 8vw, 120px)` top/bottom (one value everywhere — replaces today's ad-hoc 40–95 px); card padding 28/26/30; grid gaps `clamp(18px, 2.4vw, 32px)`; header 64px; baseline hairline between every major section.

**Radii & borders** (scale, no more free-form): `0` · `12` (chips/inputs) · `20` (media thumbs) · `40 0 40 40` signature (cards/buttons/hero frames — unchanged) · `999` (tags/pills). Borders: 1px hairlines on light, 1px `rgba(255,249,242,.22)` on dark; coral corner-tick 8×8 px absolute top-right on signature cards.

**Iconography / pixel motifs**: Departure Mono glyphs (`◆ + → ↗`) for kickers/arrows; coral corner-ticks; optional 1px dot-grid at 22px on sage/burgundy bands only (restrained — no full-page texture).

**Imagery rules**: straight (≤2° rotation, hero collage exception only), duotone/halftone treatment consistent with `/about` cards, `Picture` avif+webp pattern, aspect-ratio boxes reserved in markup (kills CLS R14). Neon/1minus1 media replaced or neutralised (Phase 4 / open-items A12).

**Motion tokens**: micro 150ms / standard 250ms / reveal 500ms, all `cubic-bezier(.22,.61,.36,1)`; hover lift −2px max; one scroll-reveal pattern (fade+rise 24px) applied via existing GSAP setup; `prefers-reduced-motion` disables all transforms/parallax (existing pattern, extended to anything new).

**States**: focus-visible = 2px currentColor outline + 2px offset (existing pattern, audit-verified A6); hover = surface tint shift or lift, never colour-only on text links (underline offset 4px); active = pressed scale .98 on cards/buttons; disabled = 45% opacity + `aria-disabled`.

## 4. Phases

Every phase: independently shippable, `npm run build` + `npm run check` + `npm run check:brand` green, docs updated, revertable by `git revert`. Acceptance = exact Playwright checks listed.

### Phase 0 — Stabilise (S)
- **Goal**: zero S1/S2 defects that aren't blocked on owner copy.
- **Scope**: `/contact` fallback copy; cookie banner overlap; footer coral band contrast; tap-target minimums; hero-video CLS slot; display-word clipping (worst offenders only).
- **Tasks**: (1) `ContactForm`/Cal fallback: hide "ONLINE BOOKING IS NOT CONFIGURED YET." in prod, replace with owner-neutral copy, kill duplicated sentence (`.cal-fallback`, `decbricks.css` lines ~333–368); (2) cookie banner: reserved bottom inset (`--cookie-safe-area` on `body` when banner visible) so hero subhead/pills never overlap; (3) footer coral band: switch text to Off-White ≥19px bold or repaint band burgundy with coral hairline — owner pick default = burgundy band (passes 10:1); (4) enforce 44px tap rects on Scroll To Explore / Rise to top / Manage Cookies / sidebar links (padding, not font size); (5) fixed aspect-ratio slot for home hero video (kills 0.0398 shift at t≈356 ms); (6) clip-safe display words: contain or inset per R8.
- **Skills**: frontend-ui-engineering, web-design-guidelines (verify), webapp-testing.
- **Acceptance**: re-run audit probes → 0 contrast fails (except none), 0 overlaps (banner vs interactive/content rects), all tap rects ≥44px (or documented invisible hit-area), CLS home@768 ≤0.01, `home-375-after.png` shows no overlap/clipping.
- **Risks & rollback**: footer change touches `structure-footer*` hooks — style-only, revert = single commit.
- **Deps**: none. **Owner inputs**: footer band choice (default burgundy), fallback wording approval.

### Phase 1 — Foundation (M)
- **Goal**: design-system tokens from §3 live site-wide before any section is redesigned.
- **Scope**: `src/styles/decbricks.css` (+ token block in global.css theme layer via scripted edit only), typography, spacing, hairlines, states.
- **Tasks**: (1) add `--color-ink`/`--color-ink-muted` (if approved) + `--hairline`, `--radius-*` scale, motion durations/easings as CSS vars; (2) fluid type via `clamp()` utility classes (`u-display`, `u-h2`, `u-lede`, `u-kicker` in decbricks.css) applied per-component, no renames; (3) one section-padding value + hairline rhythm; (4) unify button shapes to 2 (primary block + ghost) + pill tags; (5) selection/scrollbar already branded — verify only; (6) reduced-motion baseline audit.
- **Skills**: frontend-design, frontend-ui-engineering, astro-best-practices.
- **Acceptance**: contrast table in §3 all measured-passing (Playwright sweep); visual diff vs before shows only intended changes (screenshot pair per page); no class-hook renames (grep audit); build+check green.
- **Risks**: global spacing change can shift GSAP ScrollTrigger pins — re-run transitions probe; rollback per-component.
- **Deps**: Phase 0. **Owner inputs**: ink-neutral decision.

### Phase 2 — Global chrome (M)
- **Goal**: header, menu, footer, cookie banner, loader, transitions feel designed, not default.
- **Scope**: `Header`, menu overlay, `Footer`, `CookieBanner`, `Loader`, `TransitionOverlay`, skip link.
- **Tasks**: (1) header: active-state clarity (mono index + underline), CTA visibility, condensed-on-scroll behaviour kept; (2) mobile menu: 62px-bar → full editorial overlay per direction proto (straight grid, mono meta row); (3) footer: apply Phase-0 band fix, add mono meta grid, kill dead columns; (4) loader: cut to ≤1.2s default (skip on repeat visit via sessionStorage; hard cap 1.5s) — R13; (5) transitions: keep swap lifecycle untouched (BUG-015 rule), polish overlay timing only; (6) skip link styling.
- **Skills**: frontend-design, frontend-ui-engineering.
- **Acceptance**: loader ≤1.5s measured (3 runs); menu covers viewport, Esc closes, focus trapped; header rects ≥44px; transition probe still 0 errors + canvases 1280×900 after swap.
- **Risks**: loader change touches boot path — guard with feature flag, rollback flag-off.
- **Deps**: Phase 1. **Owner inputs**: loader policy approval.

### Phase 3 — Heroes & first impressions (L)
- **Goal**: every hero is one composed moment (fixes R1/R2/R8).
- **Scope**: Home, Services, About, Contact heroes + home hero→content bridge.
- **Tasks**: (1) home hero: straight editorial grid (proto pattern) — display line + video card in its own cell with corner ticks, capability pills as mono row; remove tilt from all but one element; (2) delete/replace the ~2 empty burgundy screens with a single burgundy band that has content (work band redesign deferred to Phase 4 for copy); (3) services hero: same system; (4) about/contact heroes: align to scale; (5) LCP-safe: hero media = poster + lazy video, no font swap of display face.
- **Skills**: frontend-design (primary), frontend-ui-engineering, design-taste checklist.
- **Acceptance**: screenshots at 375/1280/1920 vs proto reference; LCP unchanged ±10%; CLS ≤0.01; 1minus1 copy untouched verbatim (check:brand + grep).
- **Risks**: home hero is the most GSAP-dense area — implement behind `data-hero-v2` gate, teardown-safe, revertable.
- **Deps**: Phase 1–2. **Owner inputs**: hero copy still 1minus1 — approve holding pattern (C1).

### Phase 4 — Content sections (L)
- **Goal**: sections read as one system (fixes R6/R7/R3 structure).
- **Scope**: About blocks (polish only — reference page), Services blocks, home work band, testimonials, case studies, clients, team placeholder, 404.
- **Tasks**: (1) straight-grid section headers (mono index + heading + lede — proto `.shead` pattern); (2) services blocks: keep media-column architecture, replace rotation with corner-tick cards; neutralise neon (overlay/grayscale until owner media arrives — A12); (3) testimonials: fill sage band with 2–3 quote grid + mono attribution placeholders clearly marked; (4) case studies/clients: keep hooks, apply card system; (5) 404: add recovery paths (home + contact buttons); (6) inverted-band rhythm per §3 depth rule.
- **Skills**: frontend-design, frontend-ui-engineering, astro-best-practices.
- **Acceptance**: full-page screenshots all routes; no section with >50% empty band; no neon/1minus1 artefacts beyond copy (sweep); heading outline intact.
- **Risks**: CaseStudies.astro (118KB) + Testimonials.astro (59KB) are huge — edit in slices, class hooks untouched.
- **Deps**: Phase 1–3. **Owner inputs**: replacement media/videos (A12), real testimonials/team (A5) — all have safe fallbacks.

### Phase 5 — Interaction & motion polish (M)
- **Goal**: micro-interactions feel intentional; reduced-motion parity.
- **Scope**: cards, buttons, pills, marquee, cursor affordances, sidebar nav behaviour.
- **Tasks**: (1) hover/press states per §3; (2) scroll choreography: one reveal pattern site-wide, remove duplicate/competing triggers; (3) drag-cursor card affordance check; (4) tap-target re-verify; (5) reduced-motion pass on every new interaction.
- **Skills**: frontend-ui-engineering, webapp-testing.
- **Acceptance**: no INP regression (long-task probe), reduced-motion run shows 0 transform animations, tap sweep ≥44px.
- **Deps**: Phases 1–4. **Owner inputs**: none.

### Phase 6 — UX & conversion (M)
- **Goal**: paths to "start a project" are obvious; forms/states are complete.
- **Scope**: nav IA, CTA hierarchy, contact flow, form UX, 404, empty/loading/error states, microcopy proposals (supplied copy stays verbatim).
- **Tasks**: (1) CTA hierarchy: one primary per page-fold (header CTA ↔ hero CTA ↔ contact); (2) contact: Cal-first layout when A2 lands, form fallback already solid — polish field affordance (R10: ink borders + beige→offwhite field fills), error/success states restyle; (3) microcopy proposals doc (owner-approved wording only); (4) 404 recovery shipped in Phase 4 — verify.
- **Skills**: frontend-ui-engineering, frontend-design.
- **Acceptance**: form keyboard-only completion; error focus management intact; CTA reachable within 2 interactions from any page.
- **Deps**: Phases 2–4; A2/A3/A4 for full contact flow. **Owner inputs**: Cal link, numbers, microcopy approvals.

### Phase 7 — Performance & accessibility hardening (M)
- **Goal**: budgets met, WCAG 2.2 AA clean.
- **Tasks**: (1) media diet: services videos ≤800KB each or poster+on-demand, `computer-back` resize, three.js lazy-init off hero-visible routes; (2) CLS ≤0.02 all routes; (3) LCP prod (preview server) ≤2.5s simulated; (4) axe-style sweep: labels, aria, landmarks, keyboard trap check; (5) font loading audit.
- **Skills**: astro-best-practices, webapp-testing.
- **Acceptance**: probe table shows targets met; three.js absent from network on reduced-motion/contact-only visits (if lazy path chosen).
- **Deps**: Phases 3–4. **Owner inputs**: none.

### Phase 8 — Final QA & handoff (S)
- **Tasks**: full matrix re-run (5 routes × 7 widths + behaviour probes), update `docs/BUG_REPORT.md`/`PROGRESS.md`/`open-items.md`, known-issues list, tag release candidate.
- **Acceptance**: zero S1/S2 open (except owner-blocked items listed); all docs current.
- **Deps**: all. **Owner inputs**: sign-off.

## 5. Cross-cutting rules for implementers
- Small commits per task (`phase N.task: …`); `npm run build` + `check` + `check:brand` after each.
- Evidence per fix: before/after screenshot or probe value in `docs/qa/shots/` + line in `docs/qa/findings.md`.
- No class-hook renames (grep before/after); null-guard every query; JS = `init*()` + teardown registered in both boot and `onAfterSwap`; canvases stay inside `.page` (BUG-015 rule).
- One source of truth: tokens in `@layer theme` + `decbricks.css` aliases; no hardcoded brand hex in components.
- Never open `global.css` whole; scripted edits only for the token block/hex remaps.
- About copy + SEO strings verbatim; `brandify()` for visible "Decbricks".
- Skill conflicts logged (one line) in `docs/Design-handoff.md`. Precedence logged this session: design-taste build-kit "deal" system not used; frontend-design palette/font advice overridden by fixed brand.

## 6. Asset & content needs
| Need | For | Fallback if not supplied |
|---|---|---|
| Owner copy `/` + `/services` (A12/C1) | Phases 3–4 content | **1minus1 copy stays verbatim; structure/system ships anyway** |
| Replacement videos/posters for 4 services blocks (neon one first) | Phase 4/7 | Grayscale+duotone overlay treatment |
| Real testimonials, team (A5), client logos | Phase 4 | Clearly-marked placeholder cards, no fake faces/names |
| Cal link (A2), phone/email (A3/A4) | Phase 6 | Existing fallback card (prod-safe wording after Phase 0) |
| Logo SVG (have PNG from owner) + OG 1200×630 | Phase 7/8 | PNG as-is; OG generated from hero shot |
| Real photography (studio/site) | Heroes/About depth | Halftone-treated existing assets /about style |

Design alone cannot fix: 1minus1 copy, fake-data bans, missing Cal/contact details — all carry visible fallbacks and open-items entries.

## 7. Metrics baseline → targets
| Metric | Baseline (dev, 2026-11-12) | Target |
|---|---|---|
| Horizontal overflow | 0 | 0 |
| Console errors | 0 (404 logs own status) | 0 |
| Contrast fails | 1 real (footer band) | 0 |
| Tap targets <44px | 4 patterns | 0 (coarse-pointer) |
| CLS worst | 0.0344 home@768 | ≤0.02 all |
| LCP (dev) | 92–188 ms | prod sim ≤2.5 s |
| Loader | ~3.0 s | ≤1.5 s cap, skip on repeat |
| Transfer | services videos 2.5–2.8 MB ×4 | ≤800 KB each or on-demand |
| three.js | 557 KB prod min | lazy-init off light routes |
| Empty-band sections | ~2 screens on `/` | 0 |

## 8. Open questions (defaults if unanswered)
1. **Confirm direction** Editorial brick (prototypes at `docs/plans/audit/proto-editorial-brick-*.png`)? *Default: proceed as recommended.*
2. **Tilt fate**: reduce collage rotation to the single hero video card only? *Default: yes.*
3. **Loader**: shorten to ≤1.5s + skip on repeat visits? *Default: yes.*
4. **Ink neutrals** `#2A0208` + muted derivative adopted? *Default: yes (measured 12.5–13.5:1).*
5. **1minus1 copy timing**: hold verbatim through phases 3–4 and swap when owner copy lands? *Default: hold + structure redesign now.*

## 9. Phase 0 execution prompt stub
> Execute **Phase 0 — Stabilise** of `docs/plans/redesign-polish-plan.md` exactly: the 6 tasks (Cal fallback wording, cookie-banner safe-area, footer band contrast, 44px tap targets, hero-video CLS slot, display-word clipping). Plan mode is OFF; implement in small commits, run `npm run build && npm run check && npm run check:brand` after each, re-run the audit probes (`/tmp/opencode/audit-main.cjs` + `audit-behav.cjs`) and update `docs/qa/findings.md` + `docs/PROGRESS.md` + `docs/Design-handoff.md`. Stop when the Phase-0 acceptance criteria all pass and report evidence. Do not touch anything outside the Phase-0 scope.
