# Testimonials upgrade plan — "What our clients say" (drastic UI/UX pass)

> Status: DRAFT awaiting owner approval (Phase 5 gate). On approval: commit to
> `docs/plans/testimonials-upgrade-plan.md`, then implement with targeted edits.
> Supersedes the layout parts of `docs/plans/testimonials-redesign-plan.md`
> (Concept A, 2026-11-13); its placeholder guard, data shape, class-hook and
> a11y invariants all carry forward.

## 1. Chosen direction and why

**Direction A — stage + identity rail** (owner-seeded option A, extended).

The spotlight skeleton (burgundy band, cream stage card, right rail, controls
row) is Decbricks-native and structurally sound; the confirmed defects are in
the rail's *content model* (truncated quote text used as navigation), the
*transition* (crossfade ghosting), and *hierarchy/counter placement*. So the
drastic change is concentrated there:

1. **Rail becomes an identity list** — initials disc + name + role/company +
   service tag per row, one line each, no truncated quotes. This kills the
   cramping, the tag collisions, and the mid-sentence truncation in one move,
   and reads as "people/companies" as the owner asked.
2. **Clean sequential swap** — outgoing card fades up-and-out (140ms), then the
   incoming card fades in from below (180ms). No overlap, no ghosting, no
   layout shift (stage height stays equalised to the tallest quote, P3
   machinery kept).
3. **One bold move: the quote set in FK Raster** (`--font-offBit`, the
   template's display face used by `heading-2xl/3xl`), `clamp(26px, 2.8vw, 44px)`.
   Everything else gets quieter: the giant `01 / 08` counter shrinks to a
   22px FK Raster counter living in the controls row next to the progress bar
   (kept because it is real navigation information — it mirrors the polite
   live region "Quote N of 8" and the `#t-N` deep links); the filler `///`
   qmark is deleted; the `///` stays only in the kicker (template motif).
4. **Rail height pin reverted** — yesterday's P6 pin (rail == stage 340px) is
   the root cause of the cramped rail. With identity rows (8 × ~52px + title ≈
   470px) the rail naturally matches a stage floor of ~480px; the pin and the
   P6 scroll CSS are removed and superseded here.
5. **Mobile (<1024): the rail is replaced by a dot control** — 8 dots (44px
   hit targets, aria-labelled) synced with the existing swipe, under the
   controls row. The <768 disclosure list is deleted outright (one control
   model everywhere below 1024).

Why not B (featured + wall): shows more quotes at once but halves the quote's
visual dominance — the brief says the quote is the one strong element — and
doubles DOM/transition complexity for it. Why not C (scroll-snap strip):
scanning 8 quotes requires scrolling through all of them, it fights the page's
vertical rhythm, and oversized-type strips are the weakest fit for the template's
band-and-card language.

## 2. Tokens and type scale (existing tokens only)

| Role | Token | Value / face |
|---|---|---|
| Band bg | `--brand-bg-dark` | `#800020` |
| Card bg | `--brand-surface` | `#FFF9F2` |
| Text on dark | `--brand-surface-alt` / `--brand-on-dark` | `#F3E6D5` |
| Text on light | `--brand-on-light` | `#800020` |
| Tag/border accent | `--brand-olive` | `#5A6432` (off-white on olive 6.1:1; olive border chip on off-white 6.08:1 measured) |
| Decorative only | `--brand-accent` | `#D45060` coral — kicker slashes, progress fill; never small text |
| Quote face | `--font-offBit` (FK Raster Roman Compact, 400; `font-synthesis: none`) | `clamp(26px, 2.8vw, 44px)` / 1.15 |
| Title face | `--font-neuePower` (Bricolage Grotesque) 700 | `clamp(28px, 3.2vw, 44px)` (unchanged) |
| Body/meta | `--font-nohemi` (Hanken) 400–500 | 12–14px |
| Counter | `--font-offBit` 400, `font-variant-numeric: tabular-nums` | 22px |
| Mono labels | `--font-mono` (Departure Mono) | 10–11px uppercase |
| Radii | card 16px, rail rows 10px, dots pill — unchanged scale | |
| Spacing | 1px scale; band padding `clamp(48px, 6vw, 96px)` unchanged | |

No new palette entries, no new typefaces, no new dependencies.

## 3. Wireframes per breakpoint

**1440 / ≥1024 (2-col)**
```
┌──────────────────────────────────────────────────────────┐
│ /// CLIENT WORDS            (kicker, mono, template motif)│
│ What our clients say                                      │
│                                                           │
│ ┌───────────────────────────────────┐  ALL QUOTES         │
│ │ (cream stage card, FK Raster)     │  ┌────────────────┐ │
│ │                                   │  │ CN Client Name │ │
│ │ "It felt like having another      │  │    Founder · S │ │
│ │  strategist on our side — not     │  ├────────────────┤ │
│ │  just another agency."            │  │ WO Client Name │ │
│ │                                   │  │    Creative D… │ │
│ │  CN  Client Name        [STRATEGY]│  ├────────────────┤ │
│ │     Founder, Studio Name          │  │ … ×6 more rows │ │
│ └───────────────────────────────────┘  └────────────────┘ │
│ (‹)(›)  01 / 08 ▓▓▓▓░░░░░░░░░░░░░   ← controls row        │
└──────────────────────────────────────────────────────────┘
```
Rail rows: 48px min-height, initials disc 28px + name 14px/600 + role one line
12px truncated + 10px mono service tag right-aligned. Active row: beige bg,
burgundy text (10.36:1). No quote text, no truncation mid-sentence, no clipping.

**1024 (2-col begins)** — same as 1440 with tighter gaps; rail column 300px.

**768 (1-col)**
```
┌──────────────────────────────┐
│ /// CLIENT WORDS             │
│ What our clients say         │
│ ┌──────────────────────────┐ │
│ │ stage card (full width)  │ │
│ └──────────────────────────┘ │
│ (‹)(›)  01 / 08  ▓▓▓░░░░░░░  │
│  ● ○ ○ ○ ○ ○ ○ ○  ← dots     │
└──────────────────────────────┘
```
Rail and disclosure toggle: removed. Dots + swipe are the only selectors.

**390** — same as 768; band padding 20px sides; quote 26px; dots row
scrollable-free (8 × 44px hit targets fit 390 with 8px gaps: 8×44=352 ✓).

## 4. File-by-file change list (targeted edits)

1. **`src/components/Testimonials.astro`** —
   - Delete `.tst-qmark` span; move `<p class="tst-index">` from head into the
     controls row (markup only, same `b` child the script writes).
   - Rebuild rail rows: initials disc + `<b>name</b>` + role/company line +
     service tag; same `button.tst-railBtn` hook, same `aria-controls` /
     `aria-current` contract. Remove the `<p class="tst-railTitle">` duplicate
     (nav keeps `aria-label="All quotes"`).
   - Delete the `.tst-railToggle` button and the `tst-railList` disclosure
     wrapper attributes that only served it.
   - Add dot row `<div class="tst-dots">` with 8 `button.tst-dot` (44px hit,
     `aria-label="Quote N"`, `aria-current` synced).
2. **`src/scripts/testimonials.ts`** —
   - `go()`: two-phase swap — add `.is-leaving` to the outgoing card, after
     140ms timeout move `.is-active`; store + clear the timeout in teardown.
   - `railButtons` selector becomes `'.tst-railBtn, .tst-dot'` (one sync path
     for aria-current/active class on both).
   - Delete the mobile disclosure block (`mqMobile`, `collapsed`, `onToggle`,
     toggle listeners) — hook removed with the markup.
   - Delete the P6 rail-height pin (`mqDesktop` block inside
     `equalizeStageHeight()`); keep stage equalisation untouched.
   - MomentumHover instantiation and teardown: unchanged.
3. **`src/styles/decbricks.css`** (tst block edits + one appended phase block) —
   - Quote: `font-family: var(--font-offBit); font-weight: 400; font-size:
     clamp(26px, 2.8vw, 44px); line-height: 1.15;` (keep `text-wrap: balance`).
   - New `.tst-railRow` internals: disc (28px, olive border), name/role/tag
     grid, `gap: 8px` on the list, row `min-height: 48px`.
   - `.tst-dot` styles (8px visual dot in a 44px button, active = beige fill).
   - `.tst-index` restyle (22px FK Raster, tabular-nums, inline in controls).
   - Transition classes: `.tst-card.is-leaving { opacity: 0; transform:
     translateY(-6px); }` with the incoming card's from-state handled by the
     existing transition (staggered by the JS phase); reduced-motion overrides
     appended after all base rules (cascade rule from P3).
   - Delete: P6 rail-pin/scroll block, disclosure blocks, `.tst-qmark`,
     `.tst-railTitle`, `.tst-railToggle*` rules.
4. **`docs/mapping.md`** — add `.tst-dot(s)`, remove dead hooks, note the
   supersession of the P6 pin.
5. **`docs/PROGRESS.md` / `docs/Design-handoff.md`** — phase entries at ship.
6. **`src/data/testimonials.ts`** — untouched structurally (copy table below is
   suggestion-only); placeholder guard, `check:placeholders` intact.

## 5. Interaction, motion, accessibility spec

- **State model:** unchanged — active index, prev/next (wrap), rail/dot select,
  read-only `#t-N` deep link, swipe on stage (48px horizontal-dominant,
  selection guard), no autoplay anywhere (nothing to pause).
- **Swap motion:** outgoing 140ms (opacity→0, translateY −6px), incoming 180ms
  (opacity 0→1, translateY 6px→0, starts at +140ms). Transform/opacity only.
  `prefers-reduced-motion`: both phases 0s → hard cut (existing cascade rule).
  MomentumHover (kinetic mouse response) kept as-is on the inner card.
- **Stage height:** equalised to the tallest quote (P3 JS kept); 480px floor at
  ≥1024 so the 8-row rail fits without scrolling; nothing shifts between quotes.
- **A11y floor:** region + `aria-roledescription="carousel"` +
  `aria-labelledby`; cards `tabindex="-1"` with focus-follow on programmatic
  changes (never on swipe); polite live region "Quote N of 8"; rail buttons +
  dots carry `aria-current`; ArrowLeft/Right scoped to the section;
  visible `:focus-visible` (2px beige outline, 3px offset) on every control;
  all hit targets ≥44×44; contrast — every text pair AA-verified at
  implementation (current measured floor 6.08:1; new pairs must match);
  tag + role display stays `10px mono olive-border chip` / `12px Hanken` so
  real data lands without restyle.
- **Placeholder guard:** unchanged — section hidden in prod while
  `placeholder: true` exists; `check:placeholders` green.

## 6. Copy table (suggestions only — data file not overwritten in planning)

| Element | Current | Proposal | Why |
|---|---|---|---|
| Kicker | `/// Social proof` | `/// Client words` | "Social proof" is marketing filler; the kicker should name the content. Template motif (mono + slashes) kept. |
| H2 | `What our clients say` | **keep** | Plain, specific, sentence case, matches site voice. |
| Rail label (aria) | `All quotes` | `All clients` | The rows are now people/companies, not quotes. Visible label deleted (was duplicated with the toggle). |
| Dots aria | — | `Quote 1 of 8` … `Quote 8 of 8` | Screen-reader equivalent of the visual control. |
| Prev/next aria | `Previous quote` / `Next quote` | **keep** | Already plain and correct. |
| Live region | `Quote N of 8` | **keep** | Matches the counter and deep links. |
| Quote text | placeholder set | keep all 8 texts | Placeholder-guarded and owner-swapped later; not weak enough to rewrite blind. |
| Attribution slots | `Client Name` / `Founder, Studio Name` | **keep values, they are the marked placeholders** (`placeholder: true` + prod-hidden + `check:placeholders`) | Never invent people/companies; the visible pattern already reads as placeholder. |

## 7. Acceptance criteria

1. No layout shift between quotes (page CLS 0 during swaps; stage height stable).
2. No overlapping/ghosting text during transitions (sequential swap verified
   frame-by-frame via probe screenshots at t=0/70/140/210/320ms).
3. No truncated or clipped rail content (rows show name + role un-clipped or
   ellipsised by design, never colliding; last row fully visible or scrolled
   by a bounded, labelled mechanism — target: no scroll needed at 1440).
4. All interactive targets ≥44×44 (dots included).
5. AA contrast on every text pair (measured, not assumed).
6. Keyboard operable: Tab reaches prev/next, 8 rail rows, 8 dots; arrows work
   inside the section; focus visible everywhere.
7. Reduced-motion: hard-cut swap, no numeral/card animation, kinetic inert.
8. No console errors/warnings; `npm run build`, `check`, `check:brand`,
   `check:placeholders`, `headings` all green; prod guard holds.
9. Deep link `#t-N`, swipe, rail/dot sync all still work.

## 8. Verification steps

- Before screenshots: `docs/qa/shots/testi-up-before-{1440,1024,768,390}.png`;
  after: `testi-up-after-*.png` — Playwright probes (dev server `4321`,
  `NODE_PATH=/home/ankit/.npm/_npx/e41f203b7505f1fb/node_modules`,
  chromium `--no-sandbox`), scroll-to-section, full-page + section crops.
- Probes: transition frame sequence (overlap check), CLS observer, contrast
  computed-style pass, keyboard walk + arrow battery, reduced-motion context,
  swap gauntlet ×3 across client-side page transitions, dot/rail sync,
  console/pageerror collector.
- Commands per AGENTS.md: `npm run build`, `npm run check`,
  `npm run check:brand`, `npm run check:placeholders`, `npm run headings`.

## 9. Execution tasks (added at implementation, 2026-11-14)

### Task 1: Code — identity rail, dots, two-phase swap, counter move, deletions

**Files:** `src/components/Testimonials.astro` (rail rows → initials disc + name + role/company + service tag; dots row <1024; counter `<p class="tst-index">` into controls row; delete `.tst-qmark`, `.tst-railToggle`, disclosure attrs) · `src/scripts/testimonials.ts` (two-phase swap with `.is-leaving` 140ms; `railButtons` = `'.tst-railBtn, .tst-dot'`; delete disclosure block + P6 pin in `equalizeStageHeight()`; teardown stores/clears phase timeout; MomentumHover untouched) · `src/styles/decbricks.css` (quote → `--font-offBit` clamp(26px,2.8vw,44px)/1.15; rail-row internals 48px rows, 28px disc, gap 8px; `.tst-dot`; `.tst-index` 22px tabular-nums; `.is-leaving` transition classes; delete P6 pin/scroll block + disclosure + qmark/railTitle/toggle rules; stage floor ~480px ≥1024).

**Interfaces:** consumes existing state machine hooks (`.tst-railBtn` aria contract, `equalizeStageHeight`); produces `.tst-dot`, `.tst-railDisc`, `.is-leaving` hooks for Task 2 verification.

- [ ] RED probes first: rail-row content model, dots at 390/768, swap frame sequence (no overlap), CLS 0, keyboard walk, reduced-motion hard cut, 44px targets, contrast.
- [ ] Implement, re-run probes GREEN, `npm run check` clean.

### Task 2: Docs, gates, commit

- [ ] `docs/mapping.md` (add `.tst-dot/.tst-railDisc/.is-leaving`, remove dead hooks, note P6-pin supersession) · `docs/PROGRESS.md` + `docs/Design-handoff.md` (HEAD+dedup+append, per-phase keep-last).
- [ ] Gates: `npm run build` · `check` · `check:brand` · `check:placeholders` · `headings` · prod guard (0 `tst-band` in `dist/index.html`).
- [ ] Swap gauntlet ×3; before/after screenshots at 1440/1024/768/390 → `docs/qa/shots/testi-up-*.png`; isolated commit; fresh-context review.
