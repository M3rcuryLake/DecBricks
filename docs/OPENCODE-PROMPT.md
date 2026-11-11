# Opencode kickoff prompt (paste as the first message; model: GLM / Gemini Flash class)

---

You are the implementation agent for the **Decbricks** website, built on an Astro 5 template (1minus1 design). The repo root contains `AGENTS.md`, `astro.config.mjs`, `docs/`, `package.json`, `public/`, `src/`, `tsconfig.json`.

## Step 0 — load context (do this before anything else)
1. Read `AGENTS.md` fully. It contains hard rules (especially: **never open `src/styles/global.css` whole — it is a 157 KB minified Tailwind build; use grep/sed/Python**).
2. Read, in order: `docs/PROGRESS.md`, `docs/Implementation-plan.md`, `docs/tokens.md`, `docs/mapping.md`, `docs/open-items.md`, `docs/Design-handoff.md`, `docs/about-section-data.md`.
3. Run `git status`, `ls public public/fonts public/images`, `cat astro.config.mjs package.json`.
4. Source fonts are in assets/Fonts/; convert from there

## Step 1 — scour the architecture (Phase 0)
Verify the docs against the real code. The docs were written from a static read of `src/`, so correct anything wrong **in the docs** (not silently). Read the files listed in Implementation-plan Phase 0 using slices (`grep -n`, `sed -n`). Specifically confirm:
- `src/pages/contact.astro` imports `astro:content` / `../content/config` which does not exist → the build fails until it is replaced.
- `ContactForm.astro` + `scripts/contact.ts` have no network submission.
- `services-page.ts` assumptions about item counts, videos, clients section, `li[data-slot]`.
- How `page-transition.ts` swaps DOM and which scripts re-run; how `cookies.ts` gates third parties.
- Whether `public/` contains the fonts/images referenced, and the real font file names for KH Type.
Run `npm install` if `node_modules` is stale, then `npm run build` and `npm run check` to get a baseline; record results (and pre-existing errors) in `docs/PROGRESS.md`. Don't fix unrelated pre-existing issues except those blocking the build.

## Step 2 — execute phases 1 → 8 from `docs/Implementation-plan.md`, one at a time
For each phase: implement → `npm run build` + `npm run check` → verify (see plan) → update `docs/PROGRESS.md`, `docs/tokens.md`, `docs/Design-handoff.md`, `docs/open-items.md` → `git commit -m "phase N: <summary>"`. Do not start the next phase with a failing build.

Non-negotiables:
- Preserve the template's layout, motion and component architecture. Reuse `ServicesHero`, `ServicesSidebarNav`, `ContactForm`, `Footer`; generalise with optional props whose defaults keep current behaviour.
- About content is verbatim from `docs/about-section-data.md`; SEO titles/descriptions verbatim from the plan. Content island uses (and replaces) exactly: `<div class="mx-auto flex w-full max-w-1850 flex-col gap-40 lg:gap-55 xl:gap-65 3xl:gap-80 4xl:gap-95">`.
- Palette: `#800020`, `#F3E6D5`, `#FFF9F2`, `#D45060` only (+ `color-mix` derivatives). Respect the contrast table: coral is never small text and never on burgundy.
- Fonts: KH Teka primary; convert OTF→WOFF2, subset, `font-display: swap`, preload max two files.
- Cal.com: official inline embed, lazy-loaded, with loading/error/success states, Lenis `data-lenis-prevent` + iframe pointer-events override, teardown-safe with page transitions. Cal link comes from `src/data/contact.ts`; if empty, show the fallback card and log in open-items — never a blank box.
- No invented people, phone numbers, emails, links or logos. Missing data → typed data file + `docs/open-items.md` + graceful fallback.
- No new dependencies unless justified in `docs/Design-handoff.md` (target: zero).
- Respect `prefers-reduced-motion`; visible focus; one H1 per page.

## Working style
- Small diffs; scripted edits for bulk changes (Python), print before/after counts.
- If blocked, log it in `docs/open-items.md`, implement the fallback, continue. Don't ask me questions mid-run; list questions at the end.
- If you approach your context limit: stop at a clean sub-step, commit, update `docs/PROGRESS.md` with exact next steps.

## Final report (when stopping, even if incomplete)
1. Phases completed / remaining. 2. Build + check status. 3. Files created/changed (grouped). 4. Decisions made. 5. Open items I must supply. 6. Risks (fonts licence, 1minus1 leftovers, perf numbers).

Begin with Step 0.

> Note: agent skills are routed via the "Skills" section in the root `AGENTS.md` (see also `docs/Design-handoff.md` → "Installed skills").
