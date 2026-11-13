# Testimonials rail scroll + kinetic hover — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rail column matches the featured card's height and scrolls internally (≥1024); the featured card gets the template's MomentumHover kinetic response.

**Architecture:** Two additive features on the Phase-5 spotlight. (1) The existing `equalizeStageHeight()` JS (P3) additionally pins `.tst-rail` to the stage's measured height ≥1024; `.tst-railList` becomes a bounded flex scroller. (2) A new `.tst-cardInner` wrapper inside each `.tst-card` is the kinetic target for the template's existing `MomentumHover` core class (`src/scripts/core/momentum-hover.ts`, GSAP `InertiaPlugin` already registered in `core/gsap.ts`) — the same slide/`__inner` split CaseStudies uses, so the card's own CSS crossfade transform is untouched.

**Tech Stack:** Astro 5 components, hand-written CSS appended to `decbricks.css`, TS in `src/scripts/testimonials.ts`, Playwright CDP probes for verification.

**Spec:** This document's §Design. Design short-form of the 2026-11-13 conversation (owner-approved: calmer-than-CaseStudies kinetic numbers, single follow-up phase).

## Design (spec)

- **Intent:** Owner request — (a) `nav.tst-rail` height matches the featured testimonial card and the rail list scrolls vertically; (b) card is "kinetic like `parts-caseStudyCard__inner`".
- **Approaches considered:** (rail) CSS-only absolute-position scroller vs **JS pin in `equalizeStageHeight()`** — picked JS because the stage height is already JS-equalised there and CSS-only needs a known title height or circular grid sizing; (kinetic) CSS hover tilt / cursor-follow vs **reuse `MomentumHover`** — picked reuse: template's own motion language, zero new effect code, inertia feel is exactly what the owner pointed at.
- **Decisions (owner-approved):**
  - Kinetic config **calmer than CaseStudies** (their numbers: 10 / 7.5 / 50 / 270 / 15): `{ xyMultiplier: 7, rotationMultiplier: 4.5, inertiaResistance: 90, clampXY: 120, clampRotation: 7 }`.
  - One phase, gates as before, commit `testimonials p6: rail scroll + kinetic hover`.
- **Non-goals:** no change to swipe, keyboard, deep-link, rail disclosure, placeholder guard; no scroll styling beyond a thin brand scrollbar; no edge-fade masks; no autoplay.

## Global Constraints

- AGENTS.md: preserve template design language/motion; no class renames (`.tst-cardInner` is additive → `docs/mapping.md`); no new dependencies (`MomentumHover`/InertiaPlugin already exist); `prefers-reduced-motion` honoured for anything new; null-guard every query; init+teardown pattern in `testimonials.ts` (registered in `main.ts` — unchanged).
- Shared worktree: isolate hunks when staging (parallel session edits `decbricks.css`, docs).
- Probe environment: dev server `[::1]:4321`; `NODE_PATH=/home/ankit/.npm/_npx/e41f203b7505f1fb/node_modules`, chromium `executablePath: '/usr/bin/google-chrome'`, `args: ['--no-sandbox']`.
- Gates: `npm run build`, `check`, `check:brand`, `check:placeholders`, `headings` all green; prod guard holds (no `tst-band` in `dist/index.html`).

## Review Focus

- **Reduced motion:** kinetic must not initialise (cards never move) — reduced-motion context probe in Task 1.
- **Touch devices:** `(hover:none)` or width <1024 → no kinetic init; vertical scroll pass-through on the stage unchanged — Task 1/2 probes at 768 + touch context.
- **Lenis wheel hijack:** wheel over the scrollable rail must scroll the list, not the page — Task 2 probe with `scrollY` assertion.
- **Keyboard reach:** focus entering the rail list must scroll clipped buttons into view; ArrowUp/Down untouched by the section handler — Task 2 probe.
- **CLS regression:** rail pinning must not shift the page (same resize listener, transform-only motion) — page CLS probe in Task 3.

---

### Task 1: Kinetic hover (`.tst-cardInner` + MomentumHover)

**Files:**
- Modify: `src/components/Testimonials.astro` (wrap each card's children in `<div class="tst-cardInner">`)
- Modify: `src/scripts/testimonials.ts` (instantiate + teardown)
- Modify: `docs/mapping.md` (additive hook)

**Interfaces:**
- Consumes: `MomentumHover` from `./core/momentum-hover` — `new MomentumHover(trigger, items, config?, onUpdate?)`, items `{ element, target }`, `.destroy()`.
- Produces: `.tst-cardInner` mount point (no CSS needed — motion mount only).

- [ ] **Step 1: Markup — wrap card children**

In `Testimonials.astro`, inside the `TESTIMONIALS.map` card `<article>`, wrap `<span class="tst-qmark">…</span>` … `<div class="tst-attr">…</div>` in `<div class="tst-cardInner">`. Nothing else changes.

- [ ] **Step 2: JS — instantiate in `initTestimonials()`**

After the existing listeners block, gate then instantiate:

```ts
const mmHover = window.matchMedia('(hover: hover) and (pointer: fine)');
let momentum: MomentumHover | null = null;
if (!prefersReducedMotion() && window.innerWidth >= 1024 && mmHover.matches) {
  momentum = new MomentumHover(
    section,
    cards.map((card) => ({ element: card, target: card.querySelector<HTMLElement>('.tst-cardInner') })),
    { xyMultiplier: 7, rotationMultiplier: 4.5, inertiaResistance: 90, clampXY: 120, clampRotation: 7 }
  );
}
```

`prefersReducedMotion` from `./core/gsap`. Import `MomentumHover`. In the teardown: `momentum?.destroy()`.

- [ ] **Step 3: mapping.md**

Append `.tst-cardInner` to the testimonials.ts line (additive hook, motion mount, no styles).

- [ ] **Step 4: Verify — kinetic probe** (`/tmp/opencode/testi-p6-kinetic.cjs`)

At 1440: build mouse velocity with two `mouse.move`s, `mouseenter` a `.tst-card` → within 150ms the `.tst-cardInner` has non-zero GSAP x/y/rotation (`gsap.getProperty` or computed transform matrix); wait 2.5s → settles |x|,|y|,rotation < 1; `mouseleave` → eases to ~0. Reduced-motion context: inner has no transform. Width 768: no transform applied. `.tst-card`'s own computed transform stays the CSS crossfade value only. Console clean.

- [ ] **Step 5: Commit** (deferred to Task 3)

### Task 2: Rail height match + internal scroll

**Files:**
- Modify: `src/components/Testimonials.astro` (`data-lenis-prevent` on `.tst-railList`)
- Modify: `src/scripts/testimonials.ts` (extend `equalizeStageHeight`)
- Modify: `src/styles/decbricks.css` (EOF `tst` P6 block, ≥1024 scoped)

**Interfaces:**
- Consumes: existing `equalizeStageHeight()` (resize + `fonts.ready` listeners, teardown already wired), `rail` element ref, P2 `mqMobile`.

- [ ] **Step 1: CSS** (append to `decbricks.css` with a `Testimonials — Phase 6` banner)

```css
@media (min-width: 1024px) {
  .tst-railList {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(243, 230, 213, 0.35) transparent;
    scrollbar-gutter: stable;
  }
}
```

- [ ] **Step 2: Markup** — add `data-lenis-prevent` attribute to the `.tst-railList` div.

- [ ] **Step 3: JS — pin rail height in `equalizeStageHeight()`**

```ts
const mqDesktop = window.matchMedia('(min-width: 1024px)');
```

Inside `equalizeStageHeight()`, after setting the stage `minHeight`: if `rail && mqDesktop.matches`, read `stage.getBoundingClientRect().height` and set `rail.style.height` to that value (rounded); else `rail.style.height = ''`. No new listeners (reuses resize/`fonts.ready`).

- [ ] **Step 4: Verify — rail probe** (`/tmp/opencode/testi-p6-rail.cjs`)

At 1440: `rail.getBoundingClientRect().height` ≈ stage height (±1). Wheel over `.tst-railList` → its `scrollTop` grows, `window.$lenis.scroll` unchanged. Focus `.tst-railBtn`[7] → clipped button scrolled into view (list `scrollTop` > 0). At 768: `rail.style.height === ''`, list doesn't clip. At 375: collapse toggle still works, no scroll container behaviour. At 1440 reduced motion: height pin still applies (it's layout, not motion). Page CLS 0 while resizing 1024→1920.

- [ ] **Step 5: Commit** (deferred to Task 3)

### Task 3: Gates, gauntlet, docs, commit

**Files:**
- Modify: `docs/PROGRESS.md`, `docs/Design-handoff.md` (appends)

- [ ] **Step 1: Gates** — `npm run build` ✅ · `check` ✅ · `check:brand` ✅ · `check:placeholders` ✅ · `headings` ✅ · prod guard (no `tst-band` in dist).
- [ ] **Step 2: Swap gauntlet ×3** (existing pattern probe) — section re-inits clean across client-side swaps, kinetic + rail behave after each return.
- [ ] **Step 3: Docs appends** — PROGRESS.md phase line; Design-handoff.md section (MomentumHover reuse, wrapper rationale, rail pin rationale, calmer config numbers).
- [ ] **Step 4: Commit with hunk isolation** — `testimonials p6: rail scroll + kinetic hover`. Stage `testimonials.ts` whole; `decbricks.css` only my hunks (inspect `git diff` first); docs via HEAD+dedup+append; never sweep the parallel session's hunks.
