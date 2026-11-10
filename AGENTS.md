# AGENTS.md — Decbricks website (Astro 5 on the 1minus1 template)

Auto-loaded every session. Read this first, then `docs/PROGRESS.md`. Keep this file under ~150 lines.

## Mission
Turn this template into the Decbricks site: brand palette + Bricolage Grotesque / Hanken Grotesk / Departure Mono fonts globally (brand name "Decbricks" only in FK Raster via `.font-brand`), new **About** and **Contact** pages built on the Services-page architecture, Cal.com inline booking, full SEO, good Core Web Vitals. **Preserve the template's design language, motion and component architecture.** Do not redesign.

## Stack (verified from package.json)
Astro ^5, TypeScript, GSAP ^3.15 (+ScrollTrigger), Lenis smooth scroll, three ^0.187 (WebGL). Scripts: `npm run dev | build | preview | check`.
**There is NO Tailwind dependency.** `src/styles/global.css` is a *compiled, minified Tailwind v4 output* (~157 KB, effectively one line, 2 newline-terminated lines). Utilities in markup only work if the class already exists in that file. See "CSS rules".

## Layout
```
src/layouts/Base.astro          <head>, SEO props, font preload, JSON-LD slot
src/pages/                      index, services, contact (BROKEN, rewrite), 404, the404game
src/components/                 Header, Footer, Loader, TransitionOverlay, CookieBanner, ContactForm,
                                ServicesHero, ServicesSidebarNav, ServiceBlock, ServicesClients,
                                Hero, CaseStudies(118KB), Testimonials(59KB)
src/data/services.ts            SERVICES, SERVICES_HERO, CLIENT_LOGOS (typed)
src/scripts/main.ts             boot + per-route init/teardown, page-transition swap lifecycle
src/scripts/*.ts                one module per feature; services-page.ts = Services page GSAP/Lenis logic
src/scripts/webgl/experience.ts three.js (48KB) — loaded on every page
public/                         fonts/, images/, videos/ (NOT in the zip you were given; inspect on disk)
docs/                           project docs (see below)
```

## Hard rules
1. **Never `cat`/`view` `src/styles/global.css` whole.** Use `grep -o`, `sed -n`, or a Python script. Never paste it into context.
2. Read `src/scripts/page-transition.ts` and `src/scripts/main.ts` before adding any page-level JS. Pages are swapped client-side; every new interactive module must expose `init*()` returning a teardown fn and be registered in BOTH the initial boot and `onAfterSwap` in `main.ts`. Inline `<script>` tags in swapped bodies may not re-run.
3. Reuse components; generalise by adding **optional props with defaults equal to current behaviour** (e.g. `ServicesHero` currently imports `SERVICES`/`SERVICES_HERO` directly → add props, keep defaults so `/services` is unchanged until it is rebranded).
4. Do not rename existing CSS class hooks that scripts query (`.sections-servicesHero`, `.sections-servicesList`, `.sections-servicesSidebarNav*`, `.parts-serviceNavLink*`, `.parts-autoplayVideo`, `.sections-contactForm`, `.parts-form`, `.structure-footer*`, etc.). `docs/mapping.md` lists them. Null-guard every query in code you touch.
5. About copy is **verbatim** from `docs/about-section-data.md`. Do not rewrite or invent. Same for the SEO titles/descriptions in `docs/Implementation-plan.md`.
6. No fake data presented as real: no invented people, phone numbers, emails, addresses, Cal links, client logos. Use typed data files + `docs/open-items.md` entries. Missing values must fail visibly in dev (console warning) and gracefully in prod (section hides or shows a safe fallback).
7. No new dependency without a one-line justification in `docs/Design-handoff.md`. Prefer zero-dep (hand-written sitemap/robots endpoints, vanilla Cal embed loader).
8. One H1 per page. No skipped heading levels. Visible `:focus-visible` on everything interactive.
9. Typography: use typographic apostrophes/quotes in copy exactly as supplied.
10. Honour `prefers-reduced-motion` for anything new.

## CSS rules (compiled Tailwind)
- Spacing unit is **1px** (`--spacing: .0625rem`): `gap-40` = 40px, `pt-135` = 135px. Breakpoints: xs456 sm640 md768 lg1024 xl1280 `2xl`1440 `3xl`1660 `4xl`1920.
- Theme tokens live in `@layer theme { :root { --color-*, --font-*, --radius-* } }`. Brand changes happen there (see `docs/tokens.md`).
- Opacity variants have **hardcoded hex fallbacks** (`#14012899`, `#26024a26`, `#9860ff4d`, `#f2ecff1a`, `#ffffff..`) inside `@supports` blocks. Re-colouring only the variables leaves these stale. Use a script (Python `re`) to remap hex families and report counts before/after.
- A new utility class that does not exist in global.css does nothing. For new components either (a) compose only existing classes, or (b) add a small hand-written block in a new `src/styles/decbricks.css` imported after global.css in `Base.astro`. Never hand-edit the minified file except the token block + scripted hex remap.
- `.lenis.lenis-smooth iframe{pointer-events:none}` exists in global.css → iframes (Cal.com) are unclickable unless the container has `data-lenis-prevent` and an explicit `pointer-events:auto` override in decbricks.css.

## Brand (source of truth: docs/tokens.md)
Burgundy `#800020`, Warm Beige `#F3E6D5`, Off-White `#FFF9F2`, Coral Red `#D45060`.
Contrast facts: Off-White on Burgundy ≈10:1 ✅; Burgundy on Off-White ≈10:1 ✅; **Coral on Burgundy ≈2.6:1 ❌ (decorative/large only)**; Coral on Off-White ≈3.9:1 (large/bold ≥18.66px only). Small text = Burgundy on light, Beige/Off-White on dark.
Fonts: Bricolage Grotesque (headings/UI) / Hanken Grotesk (body) / Departure Mono (display) — legacy tokens `--font-neuePower/-nohemi/-offBit/-offBit101` are repointed, keep the names. Brand name "Decbricks" renders ONLY in FK Raster via `.font-brand` (`src/lib/brand.ts` → `brandify()`; gate: `npm run check:brand`). FK Raster file is a "Trial"-named source — see open-items B1.

## Workflow
- Work in phases from `docs/Implementation-plan.md`. After each phase: `npm run build` and `npm run check` must pass, update `docs/PROGRESS.md`, `git commit -m "phase N: …"`.
- If blocked on a missing asset/value: add it to `docs/open-items.md`, implement a safe fallback, continue. Do not stop to ask.
- Record every non-obvious decision in `docs/Design-handoff.md` (what / why / files).
- Context hygiene: read files in slices; prefer `grep -n` + `sed -n 'a,bp'`; large files: Hero.astro, CaseStudies.astro, Testimonials.astro, global.css, experience.ts — do not open unless the task needs them.

## Docs index
PROGRESS.md · Design-handoff.md · tokens.md · mapping.md · open-items.md · Implementation-plan.md · about-section-data.md
