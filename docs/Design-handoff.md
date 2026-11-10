# Design handoff / decision log

Purpose: let a fresh session resume without chat history. Append decisions as they are made: **Decision · Why · Files · Date**.

## Orientation (static analysis, pre-build)
- Template look: dark purple page + white rounded "island" cards with 1px low-opacity borders and four 9px accent corner squares, giant ghost numerals (OffBit), uppercase bold Neue Power headings, Nohemi body, GSAP/ScrollTrigger reveals, Lenis smooth scroll, WebGL (three) background/trails, custom client-side page transitions (`page-transition.ts`) + loader overlay.
- Rebrand effect: burgundy page + off-white islands + coral accent squares/bullets + beige secondary surfaces; KH Teka for text, KH Interference/FK Raster for the display role previously held by OffBit.
- Services shell is the master layout for About and Contact (see mapping.md). Only the content island changes.

## Architectural notes
- Boot/teardown: every interactive module returns a teardown; registered twice in `main.ts` (initial + `onAfterSwap`). New modules (`cal-embed.ts`, any team/number scripts) follow this.
- CSS: compiled Tailwind; new styling = existing utilities or `src/styles/decbricks.css`. Token changes only in `@layer theme` + scripted hex remap (see AGENTS.md).
- Data-driven pages: `src/data/*.ts` typed arrays (services, about, team, contact, site) → components. Content edits never touch markup.
- SEO: `Base.astro` is the single owner of `<head>`; pages pass title/description/canonical/schema.
- Lenis × iframe: `pointer-events:none` rule in global.css; Cal container opts out via `data-lenis-prevent` + CSS override.

## Dependency log
(agent: list any added dependency + one-line reason; target: none)

## Decisions
(append below)

## Phase 0 verification deltas (2026-11-10) — docs vs real repo
- fonts live in `src/assets/Fonts/` (all TRIAL otf/ttf) — not `assets/Fonts/`; template woff2 in `public/fonts/`. Docs updated.
- Build/check baseline: build fails only on /contact (missing `astro:content` collection); check = 3 errors, all contact.astro. Everything else compiles. Recorded in PROGRESS.md. Contact build-blocker will be fixed at the start of Phase 1 with a minimal placeholder page (full rewrite stays in Phase 5) so every phase gates on a green build.
- services-page.ts is data-import driven (see mapping.md) → will need a small generalisation (optional items param / override) before About/Contact reuse it. Logged here first; change lands in Phase 4.
- cookies.ts exposes no consent-gate API (only essential/analytics cookie writes + 'manage-cookies' bus event for reopening the banner). Therefore Cal.com will lazy-init without consent gating; flagged in open-items B3 for owner decision.
- WebGL (`experience.ts`) reads colours from computed CSS styles (`parseCssColor`, `data-trail="oklch(...)"`, fallback THREE.Color constants). Phase 1 remap must therefore cover: token values, hardcoded hex fallbacks (§: `0.38,0.02,0.74` purple fallback, `0.49,1,0.43` neonGreen trail fallback, `0.11,0,0.22` bg fallback in experience.ts) and `Footer`'s `data-trail="oklch(1, 0, 0)"`.
- Footer/Header hard-code 1minus1 logo SVG paths + socials + `© 2026 1minus1 Limited` (+ `/the404game` easter-egg pill). Phase 3 replaces with Decbricks wordmark + SITE data.
