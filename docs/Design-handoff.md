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

### Phase 8 decisions (2026-11-10) — cleanup & handoff
- Deleted the four unreferenced template webfonts (`neue-power`, `nohemi`, `OffBit`, `OffBit101`) from `public/fonts` — before deleting, grepped `src/` + `global.css`: no @font-face, preload, or class→font mapping references them (Phase 2 repointed the font tokens; display roles use KH Interference / FK Raster). Trial OT/TTF sources remain in `src/assets/Fonts/` (licence to confirm — open-items B1).
- `scripts/check-links.mjs` (`npm run links`): every `href`/`src` in built HTML must resolve in `dist` (skips external/`#`/protocol-relative) — PASS. No new dependency.
- Full-cleanship check `grep -ri 1minus1 dist/ --include=*.html`: only the home page carries 1minus1 copy (Hero/CaseStudies/Testimonials, open-items C1/B2 launch blockers by scope decision); Services 1minus1 *copy* has no literal "1minus1" strings. Header/Footer are Decbricks-clean everywhere.
- Footer marquee words kept; logged for owner sign-off as open-items C9.
- Hand-off checklist for the owner: provide A1–A9 (Cal link, email, phones, team, socials, form endpoint, GSC, domain env vars), confirm B1 font licence, supply A12/A15 copy ⇒ then set `PUBLIC_ENV=production`, verify robots/sitemap flips, run `npm run build && npm run headings && npm run links`.

### Phase 7 decisions (2026-11-10) — performance & a11y
- **Bundle split**: `src/scripts/webgl/impl.ts` = former `experience.ts` body exported as `createExperience()`; facade keeps the public API (types re-exported, singleton getter) and dynamic-imports the impl. `initWebGL()` still no-ops < lg or with <2 `canvas.webgl` elements — *and now also nothing loads unless that holds*, saving three.js from the 404/game/contact/about critical path entirely. `case-studies.ts` gets its scene group via the new `exp.createGroup()` + type-only `three` import, so `three` is reachable ONLY from `impl.ts`. Bundle: main JS render-blocking 871→315 KB; three chunk 556 KB lazy. Behaviour parity: consumers already treat a null experience as "use CSS/video fallback"; late `rebuildPageTargets()` covers swaps during load; on idle-ish non-mounted pages nothing changes.
- Skip link + `#main-content` ids + passive resize added; everything else measured and left as-is per "measure first" (loader/cookie banner untouched — template motion is a launch-visual requirement; numeric Lighthouse is a follow-up since no browser tool is available here).

### Phase 6 decisions (2026-11-10) — SEO & technical
- `smtp.xml.ts`/`robots.txt.ts` are razor-simple static endpoints (zero-dep); the old template `public/robots.txt` + `public/sitemap.xml` (1minus1 URLs) were deleted so the endpoints win. `robots.txt` mirrors Base.astro's `PUBLIC_ENV === 'production'` gate — production gets `Allow: / + Sitemap: /sitemap.xml`, everything else `Disallow: /`.
- Interim OG image `public/og-default.png` is a 1200×630 flat brand PNG (burgundy + off-white inset frame + coral baseline) written with stdlib `zlib`/`struct` — a wordmark needs the real logo (open-items A6, TEMP for launch).
- `scripts/check-headings.mjs` (`npm run headings`, must run after build) parses `dist/**/*.html` for exactly-one-H1 + no level skips; currently PASS on 6 pages. Added to package.json with no deps.
- the404game got explicit `noindex` (previously relied on env gate only); `/services` deliberately **omitted from sitemap** while its content is 1minus1's (open-items C2) — add when A12 copy lands.
- Internal `About↔Contact↔Services` in-copy text links deferred until owner copy arrives (A12/A15) to avoid injecting links into verbatim/fallback text; header + footer already crosslink the three pages.

### Phase 5 decisions (2026-11-10) — Contact page
- **Cal.com loader**: used the official vanilla queue loader (`window.Cal` + `Cal('inline'|'ui'|'on', …)`, plan says `cal('…')` — the official global is `Cal`); `embed.js` (one <script>, once per page load) from `CAL.origin`; `Cal('inline')` on the *element* (not selector) so swapped-mount nodes can never collide; per-mount `WeakSet` guard. Events via `Cal('on',{action:'bookingSuccessful'|'linkFailed'})`; Plus a 10s sanity timer (script error / blocked network / no iframe ⇒ fallback card). Layout `month_view`, theme `light`, `cssVarsPerTheme.light['cal-brand'] = '#800020'`. `decbricks.css` owns `.cal-embed` min-heights (700/650), skeleton pulses + `:has(iframe)` skeleton removal, fallback/status styles. `data-lenis-prevent` + existing iframe pointer-events override keep wheel/touch working.
- **Consent gate**: cookies.ts (both accept and manage→save) now emits `bus 'cookies-decided'`; `cal-embed.ts` loads only after `essential-consent` cookie exists (open-items B3 note: analytics-only checkbox exists; treating banner-confirmed consent as permission for the booking iframe — owner may refine). Without consent (or on failure): server-rendered `.cal-fallback` card (Cal deep link/email/phone) with `role="status"` announcements; embed swap-in happens on the consent event.
- **5B copy missing**: Implementation-plan/mapping reference "brief §4.2 B" but the brief itself is not in the repo — the two paragraphs were never supplied. Block renders the mapped H2 ("Let's Start Something Great.") + H3 ("Tell us what you want to build.") and one neutral navigation sentence; logged as open-items **A15**.
- **Contact island blocks**: `ContactBlock.astro` clones the AboutBlock/ServiceBlock chrome (corner squares, ghost numeral, border) but uses a *stacked* (not alternating two-column) inner layout so the Cal embed, team grid and numbers list keep full card width. Team cards live in `TeamSection.astro` (single markup, inline `astro:assets`-compatible `<img>`; separate `TeamCard.astro` skipped — deviation from mapping.md, noted). Empty `TEAM`/`PHONES` hide their blocks with dev console warnings; sidebar keeps all 4 items (scroll no-ops gracefully) as on About.
- **Form submit**: `contact.ts` posts FormData (provider-agnostic: Formspree/Formspree/Web3Forms/custom worker all accept multipart; `accept: application/json`) to `CONTACT_ENDPOINT`, honeypot `input[name="_gotcha"]` in markup (sr-only, tabindex=-1) is checked before sending (filled ⇒ pretend-success, never posts); per-field `aria-invalid`, focus moves to first invalid, status line `#status-message` reuses the template's aria-live div with `.form-status(--error)` colours; on success/`mailto:` fallback the button labels ('Sending…' → 'Message Sent!' / 'Try again'). No endpoint or send failure ⇒ `mailto:` via owner email (open-items A7). No new dependency.
- **ContactForm generalisation**: optional `srHeading`, `headingParts` props added (defaults = current hard-coded values, so /services unchanged). Decorative reCAPTCHA paragraph **removed** (claim without script — false statement); checkbox label's `/terms` + `/privacy-policy` anchors replaced with plain text (pages don't exist — open-items A11) until those pages land.
- **Hero/smiley copy on /contact**: hero body = the owner-supplied SEO description (Implementation-plan §4.2, verbatim); smiley line = "Start your digital project with Decbricks." — derived from the supplied H1 strings because the template default there is 1minus1 copy (B2) and no richer owner copy exists yet (A12/A15).
- **Server fallback safety**: if `CAL.link` is empty, the fallback card renders visible in markup (never a blank box) — confirmed by grep in `dist/contact/index.html`.

## Phase 0 verification deltas (2026-11-10) — docs vs real repo
- fonts live in `src/assets/Fonts/` (all TRIAL otf/ttf) — not `assets/Fonts/`; template woff2 in `public/fonts/`. Docs updated.
- Build/check baseline: build fails only on /contact (missing `astro:content` collection); check = 3 errors, all contact.astro. Everything else compiles. Recorded in PROGRESS.md. Contact build-blocker will be fixed at the start of Phase 1 with a minimal placeholder page (full rewrite stays in Phase 5) so every phase gates on a green build.
- services-page.ts is data-import driven (see mapping.md) → will need a small generalisation (optional items param / override) before About/Contact reuse it. Logged here first; change lands in Phase 4.
- cookies.ts exposes no consent-gate API (only essential/analytics cookie writes + 'manage-cookies' bus event for reopening the banner). Therefore Cal.com will lazy-init without consent gating; flagged in open-items B3 for owner decision.
- WebGL (`experience.ts`) reads colours from computed CSS styles (`parseCssColor`, `data-trail="oklch(...)"`, fallback THREE.Color constants). Phase 1 remap must therefore cover: token values, hardcoded hex fallbacks (§: `0.38,0.02,0.74` purple fallback, `0.49,1,0.43` neonGreen trail fallback, `0.11,0,0.22` bg fallback in experience.ts) and `Footer`'s `data-trail="oklch(1, 0, 0)"`.
- Footer/Header hard-code 1minus1 logo SVG paths + socials + `© 2026 1minus1 Limited` (+ `/the404game` easter-egg pill). Phase 3 replaces with Decbricks wordmark + SITE data.

## Font swap (FONT-SWAP-PROMPT Option A "Bricks & Pixels", 2026-11-10)
- **Decision — FK Raster exclusivity**: FK Raster Roman Compact is set ONLY on the brand word via `.font-brand` (not aliased onto any legacy display token). Departure Mono takes the whole OffBit/offBit101/mono display role. Rationale: keeps the raster wordmark distinctive; §5 legibility guardrail (≥14px effective, inherit surrounding colour, never coral-on-burgundy for the brand).
- **Decision — `text-transform:none` on `.font-brand`**: template sets `uppercase` on many contexts the brand word appears in (headings, eyebrow-adjacent spots); the mixed-case "Decbricks" casing is part of the identity, so the class cancels transform locally (logged in decbricks.css comment).
- **Decision — preloads**: all 4 WOFF2s preloaded with `type="font/woff2" crossorigin`. Each serves above-the-fold text on `/`, `/about`, `/contact` (verified against hero/header/contact markup). Total = 4 = ship budget; no unused preload.
- **Dependencies**: Fontsource packages installed to COPY 2 latin variable WOFF2 files, then `npm rm`'d — **zero runtime deps added**. Departure Mono from GitHub release rektdeckard/departure-mono v1.500 (OFL). FK Raster subset pre-existing from Phase 2.
- **KH revert**: 12 KH `@font-face` rules removed via Python script, 6 new faces added, legacy token names `--font-neuePower/-nohemi/-offBit/-offBit101` repointed ×2 each (hundreds of compiled utility usages depend on them); 0 `KH ` refs in `src/styles/global.css`; 6 `kh-*.woff2` deleted from `public/fonts/` (4 files ship). `.gitignore += assets/Fonts/` (trial fonts must not be redistributed).
- **Fallback metrics** (CLS): Bricolage Fallback size-adjust 106.48%/asc 95.85%/desc 27.82%; Hanken Fallback 102.61%/95.87%/29.11% (fontTools-measured avg-lowercase advance vs Arial). Departure Mono, ui-monospace fallback — no override face (monospace metrics are stable).
- **Width deltas vs previous faces** (fontTools advance/em): Departure Mono +6.3% vs KH Interference; Bricolage +9–13% vs KH Teka. Bricolage re-wraps fine (px max-widths). The giant vw-clamped display words grow ~6% → `-0.01em` tracking added on `.heading-2xl/3xl/3.5xl/4xl` in decbricks.css. **Visual overflow pass not possible here (no browser)** — flagged §A for owner dev-server check, esp. hero words at 375px.
- **Copy untouched**: brandify runs at render points only; `about.ts`/About data stay verbatim (per AGENTS hard rule 5).
- **Splitter safety**: `smiley-text.ts` GSAP SplitText `lines+deepSlice` preserves nested `.font-brand`; verified conceptually — regression gate is `npm run check:brand` post-build.
- **OG image**: `public/og-default.png` regenerated (Pillow) with the real FK Raster TTF — no longer synthetic-looking placeholder glyphs; still TEMP until designed OG (A6).
- Gate results (2026-11-10): `npm run build` ✅ · `npm run check` 0 errors ✅ · `npm run check:brand` PASS 6/6 pages ✅ · `npm run headings` ✅ · `npm run links` ✅ · grep `KH |KHTeka|KHInterference|Neue Power|OffBit|Nohemi` in src/public code = only load-bearing legacy class names + historical docs/comments.

## Display → FK Raster (owner decision, 2026-11-11)
- Owner moved the display/numeral role (`.heading-2xl/3xl/3.5xl/4xl`, giant numerals `text-[275px…580px]`, "Begin your", menu/cookie display, 404 numeral) from Departure Mono to **FK Raster Roman Compact**: `--font-offBit` + `--font-offBit101` repointed ×2 in global.css to `"FK Raster Roman Compact","Departure Mono",ui-monospace,monospace`. Supersedes the earlier "FK Raster is brand-exclusive" decision (brand + display now share the face; the brand word inside display headings is visually the same family — the `.font-brand` wrapper still distinguishes it semantically and keeps `text-transform:none`/`1.06em`).
- `--font-mono` (decbricks.css alias) repointed directly to `"Departure Mono",ui-monospace,monospace` — small mono labels stay Departure Mono. `--font-mono` currently has no consumers in global.css utilities (verified by grep).
- Preload set reduced 4 → 3: **departure-mono-regular.woff2 preload removed** (no first-paint usage; still ships as fallback face, downloads only if FK Raster fails). First-paint font files: 3 ≤ budget.
- `-0.01em` heading tracking removed (was Departure Mono width compensation; FK Raster is narrower than KH Interference — measured, no overflow risk).
- Display headings request `font-weight:700` but FK face is 400-only; with `html{font-synthesis:none}` they render regular — accepted (raster faces are single-weight).
- Gate: build ✅ · check 0 err ✅ · check:brand ✅ · headings ✅ · links ✅.

## Visual QA + polish pass (2026-11-11)
Full audit log with evidence: `docs/qa/findings.md` (F1–F19). Non-obvious decisions:

- **Coral policy formalised**: pure `#D45060` cannot carry small text with *any* palette colour (best pair off-white = 3.93:1; burgundy pair 2.6:1). Where a coral fill sits under text the fill switches to `--brand-accent-deep` (`#BC3D4D` brick, 5.1:1 with off-white) or burgundy. Applied to: theme-4 hero slab (new `.bg-brick`/`.before\:bg-brick` utilities reusing the existing token — keeps the 4-slab off-white/beige/burgundy/brick rhythm without a new token), "+N" badges (solid burgundy chips like the tag pills), testimonial minimap + slash widgets (burgundy/off-white). `hover/active/focus-visible\:bg-purple` tie-break overrides already in decbricks.css cover the pill/pressed states.
- **menu.ts active-pill pair** (`bg-darkPurple text-neonGreen`, 8.8:1) chosen to match Header.astro's own SSR styling for `link.current` — runtime and SSR now agree; coral `bg-purple` runtime toggle was a template remnant (3.93:1).
- **Polish block** appended to `src/styles/decbricks.css` (S3): `::selection` (burgundy/off-white — last default-blue surface), palette scrollbar (`scrollbar-color` + `scrollbar-width:thin` for Firefox, webkit pseudos for Blink; brick thumb hover), `text-wrap: balance` on h1–h6 + `pretty` on p/li (no-op on `w-max` display words; pure CSS, zero JS, honours nothing new about reduced-motion).
- **`#__nuxt` wrapper div removed** from index/about/contact/services: grep-verified zero references in global.css, all scripts, and dist; a Nuxt-template relic that could confuse future DOM queries. Opening + orphaned closing div both removed; dist div counts balanced.
- **About hero period guard** (`about.astro`): `split('. ')` slice + blind `'.'` append produced "execution.." from verbatim copy; now appends only when the sentence doesn't already end with `.!?…`. Source copy untouched.
- **Font preload warnings investigated, no action**: on every prod page Chrome warns all 3 preloads "not used within a few seconds". URLs match @font-face exactly (`as=font`, `crossorigin=anonymous`), fonts fetch at ~20 ms, exactly 3 font requests (no double download), `document.fonts` all "loaded". Chrome heuristic false-positive tied to the loader delaying first paint; removing preloads would *hurt* LCP.
- **docs/AGENTS.md** replaced with a pointer to the root AGENTS.md (it was a stale duplicate: KH fonts, "contact BROKEN") — prevents future drift.
- `.gitignore` += `.playwright-mcp/`, `docs/qa/shots/` (QA artefacts are session-local evidence, not repo content).
- Gates (2026-11-11): build ✅ · check 0 err ✅ · check:brand ✅.
