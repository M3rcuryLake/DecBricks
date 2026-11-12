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

## Installed skills (2026-11-11)
Five skills in `.agents/skills/<name>/SKILL.md`, routed via the "Skills" section in root `AGENTS.md` (invoke with the `skill` tool):
- `frontend-design` — aesthetic direction for new components / polish passes (palette/fonts OVERRIDDEN by project).
- `frontend-ui-engineering` — production UI structure, a11y, states, responsive behaviour (its React/Tailwind examples don't apply here).
- `astro-best-practices` — `.astro`/TS conventions, islands, endpoints, build hygiene (page-transition init+teardown rule wins).
- `web-design-guidelines` — audit-only reviews; results → `docs/qa/findings.md`.
- `webapp-testing` — scripted Playwright runs (Python) + screenshots under `docs/qa/`; interactive work stays on Playwright MCP.
Precedence decisions: AGENTS.md hard rules win over any skill (fixed palette `#800020/#F3E6D5/#FFF9F2/#D45060` + fixed font stack; no Tailwind/shadcn/new deps; template class hooks and init+teardown boot rules preserved; About copy + SEO text verbatim). A skill-vs-AGENTS conflict is logged here as one line and resolved in favour of AGENTS.md.

## WebGL colour-space convention (2026-11-12)
In `src/scripts/webgl/impl.ts`, numeric `new THREE.Color(r,g,b)` args are LINEAR working-space values; CSS strings are sRGB. All CSS-derived colours go through `srgbColor()` (`setRGB(..., SRGBColorSpace)`); the oklch parser returns its OKLab→linear-sRGB math output directly (already linear). Hardcoded colour literals that mirror brand hexes (0.831/0.314/0.376 = coral, 0.502/0/0.125 = burgundy, 0.976/0.924/0.852 = warm off-white) are sRGB fractions and must use `srgbColor()`. Do not construct THREE.Color from sRGB fractions directly — the renderer applies linear→sRGB once on output, so raw sRGB fractions double-brighten (footer rendered #EB98A5 instead of #D45060).

## Phase-2 QA batches (2026-11-12, BUG_REPORT.md refs)
- **Batch 1:** ContactForm inputs got `name` attrs (email/name/company/message/terms) to match `contact.ts`'s `[name=…]` payload reads — ids unchanged, labels unaffected. `menu.ts` highlight now matches `href === '/contact'` (Contact is a plain href since the anchor was dropped), plus a plain-page route-match branch so About/Contact keep SSR `router-link-active`/`aria-current`; runtime active-pill styling (burgundy bg + beige text) now applies to the current page's pill exactly as it already did for `/services`.
- **Batch 2:** 11 case-study card `aria-label`s now include the visible title + category ("Case study: X — Category"); logo/scroll/scroll-top labels include their visible text (axe label-content-name-mismatch). Tap targets under 24px expanded invisibly via `::after { inset:-5px }` in `decbricks.css` (`.parts-scrollButton`, `.parts-btnScrollTop`, `.parts-btnText`); inner duplicate labels still anchor to their `relative` wrappers, unaffected.
- **Batch 3:** home JSON-LD = `Organization` + `WebSite` from `src/lib/schema.ts` (single source). Removed empty `src/content/` (`.gitkeep` placeholder unused — content collections are not used anywhere; data lives in `src/data/*.ts`). `astro.config.mjs` gained `vite.build.chunkSizeWarningLimit: 600` to document the single 557 kB (140 kB gzip) three.js vendor chunk — no splitting. Launch-day robots/noindex guards documented in `docs/open-items.md` §E (no behaviour change).
- Not changed (Needs decision): coral small-text contrast pairs (BUG-005/006), Contact-pill hover subtlety (BUG-013), 1minus1 content (BUG-001/002 — owner copy).

## Green supporting layer (2026-11-12, owner decision — supersedes "fixed palette")
Owner brief: sage + olive as a supporting layer — sage for secondary-section backgrounds, olive for text-weight elements (tags, borders, icons, hover/active states); burgundy stays the star; never coral text on sage. This is the owner decision that extends the previously fixed 4-colour palette (`AGENTS.md` precedence block updated accordingly; shades + contrast in `docs/tokens.md` §2c). Applied, in `src/styles/decbricks.css` (tokens `--brand-sage #C9D3C0`, `--brand-olive #5A6432`; utilities `.bg-sage`/`.bg-olive` — additions only, no repoints, so no stale-hex remap needed):
1. **Accents:** case-study filter active pill coral→olive (`case-studies.ts` toggle + new `structure-csFilterGroup` scoping class on the filter group; inactive pills get sage hover/focus — fixes BUG-005, 6.1:1) · "Drag To Navigate" cursor card coral→sage, burgundy text kept (fixes BUG-006, 7.0:1) · contact-form inputs get olive border on hover/`:focus-visible` (the markup's `hover/focus:border-purple` utilities are dead — absent from compiled CSS; live affordance is border + ring, so rules target the real state selectors; textarea has no border width → unchanged, ring carries focus).
2. **Pilot sage section:** testimonials marquee inner `bg-lightPurple`→`bg-sage` (beige→sage; burgundy text 7.0:1; minimap/slash chips stay burgundy-on-dark). Dark burgundy bands deliberately stay burgundy — sage under their light text would be ~1.3:1.
3. Left alone (restraint): category chips on cards (burgundy), submit button (coral), nav pills (burgundy), coral decorative squares/smileys.
Verified via Playwright MCP: computed colours (olive active pill on click-through, sage hover, sage marquee 1440+390, sage cursor card, olive input hover border); gates build ✅ · check ✅ 0/0/0. Evidence: `docs/screenshots/green-layer/`. If sage reads well in situ, remaining candidates for extension: ServicesClients strip, contact "start a project" band (both need text re-auth if flipped — dark bands), case-studies intro (light, safest next step).

### Extension round 2 (same day, owner said "Proceed")
Adaptation: the case-studies `#work` section is **transparent over the WebGL background canvas** — painting it opaque sage would hide the pixel-terrain artwork behind it, so the "intro band" flip landed instead on the surfaces that carry the same tonal role safely:
- **Sticker-card family** beige→sage (`bg-lightPurple`→`bg-sage`): About values list items, ServiceBlock list chips, ContactNumbers phone cards (renders when open-items A3 data lands), TeamSection cards (renders when A5 data lands). One design device, flipped once, coherent across pages; burgundy text 7.0:1.
- Coral cross-bullets inside sage cards → olive via scoped `.bg-sage .svgs-cross` (2.7:1 decorative → crisp).
- Home filter group container beige→sage — makes the filter cluster a single green moment with the olive active pill + sage hovers.
- Left alone: CalEmbed frame + ServicesSidebarNav rail (kept beige for restraint), team photo placeholder (inner panel), all dark burgundy bands.
Verified: computed colours on /about (values cards + olive crosses), /services (chips), / (filter container); screenshots in `docs/screenshots/green-layer/`. Gates: build ✅ · check ✅ 0/0/0.

## Smiley sticker on About/Services hero subheadings (2026-11-12, owner request)
`parts-smileyText` added to the shared `ServicesHero.astro` subheading (one change covers both pages; contact/home already had it). The SSR `<p>` provides the module's expected structure — `sr-only` copy + `aria-hidden role="presentation"` visual copy — exactly like the home hero spans; `smiley-text.ts` gained an `.sections-servicesHero` branch auto-prefixing `**purple-4**` (home-hero parity) with scrollTrigger-once (loader-safe via the `animationsEnabled` gate). Copy stays verbatim (markers injected in JS only; data files untouched). Lesson logged: the module *adds* sr-only/presentation spans rather than replacing raw SSR text — hydrating over a plain-text element duplicates the copy, so SSR must always ship the sr-only/presentation structure. No `main.ts` changes needed (`initSmileyTexts` is route-agnostic across boot + `onAfterSwap`).

## WebGL canvas re-attach after page swaps (2026-11-12, BUG-015)
User report "animations and pictures break when going from one page to another". Root cause: both `canvas.webgl` elements live inside `.page` (`Footer.astro:251–252`), which `page-transition.ts` replaces wholesale on every route transition (only the persistent header survives) — the renderers kept drawing to detached canvases while the adopted canvases sat at the 300×150 default (fixed background dead after every swap; the home-hero showreel card vanished because it is WebGL-drawn via `hero.ts` `createImage(video)`, the DOM `.start` being `lg:invisible`). Fix: new `reattachCanvases()` in `webgl/impl.ts` (exposed on `WebGLExperienceAPI`) — re-queries `canvas.webgl`, no-ops when canvases are unchanged, otherwise builds fresh `WebGLRenderer`s on the new canvases and only then disposes + `forceContextLoss()`s the old ones (fail-safe ordering; context loss prevents GPU-context exhaustion across many swaps), then re-applies `outputColorSpace`/`setSize`/`setPixelRatio`. Scene contents, touch render-targets and material/texture references survive untouched: three.js allocates GL resources per renderer context and the ticker re-reads `fgTouchTarget.texture` every frame. Called from `main.ts` `onAfterSwap` (before `rebuildPageTargets()`) and from the facade's late-chunk-load sync in `webgl/experience.ts`. Reload/fresh load were already correct and are unchanged. No new dependencies.

## Hero flare recolour — home trail → services lighter red (2026-11-12, owner request)

**Discovery (Playwright pixel sampling, 1920×1080):** the "flare" is not DOM/CSS — it is the hero trail SVGs rendered by the WebGL trail pipeline (`WebGLTrail.createPlanes` reads the element's computed `color` via `parseCssColor`). Two quirks determine what actually renders:

1. The trail fragment shader writes colour values **raw** (no linear→sRGB output conversion), so a colour that goes `srgbColor()` (sRGB→linear) renders back at its *linear* magnitude. Home's hard-coded `text-[#5a0014]` therefore rendered as **#1a0002** (near-black maroon).
2. `parseCssColor` cannot parse the `oklab(...)` computed string produced by `color-mix` tokens, so the /services trail (`text-darkestPurple`) fell to the caller's hard-coded coral fallback `srgbColor(0.831, 0.314, 0.376)` = `--color-purple` #D45060 → linear (0.666, 0.078, 0.117) → rendered **#a8141e** — exactly the "lighter red" the owner wanted.

**Decision:** the shared token already existed — `--color-purple`. Home's 4 `.sections-hero__trailWrapper` classes changed `text-[#5a0014]` → `text-purple` (parsed via the `rgb()` branch into the identical linear values the services fallback produced). The services desktop trail SVG (`sections-servicesHero__trail`) also moved `text-darkestPurple` → `text-purple` so both pages express the same token explicitly instead of relying on a parse-failure fallback (bit-identical rendered output). The mobile pixel-shape SVG keeps `text-darkestPurple` — it renders as a normal DOM SVG (correct colour management) and must stay dark. No JS changes; `parseCssColor`'s oklab gap and the services fresh-load trail quirk are logged as open-items C11/C10, deliberately unfixed (minimal diff — fixing the shader colour-space or the parser would recolour the contact trail and other pages).

**Verification:** rendered home flare `#1a0002` → **#a8141e** at 1920 (12.9% frame share) / 1440 (17.1%) / 1024 (17.7%); services reference after client-side swap **#a8141e** (15.4%) — exact match. Trails are `lg:block`-hidden below 1024 (768/390 unchanged). Cream `#F3E6D5` on flare `#a8141e` = 6.10:1 → WCAG AA pass for the display headline (needs 3:1) and normal text (4.5:1); down from 16.3:1 pre-change, reported per instruction, no further action. No console errors, no horizontal scroll at any width. Evidence `docs/screenshots/flare/{before,after}/`.

## Logo lockup on every Decbricks mention (2026-11-12, owner spec)

**Render mode A (owner-approved):** original full-colour logo everywhere via `background-image` on `.font-brand::before` — no light/dark variants (measured: lightest tone vs burgundy 10.8:1, copper body vs off-white ≈3.4:1 — the spec's variant branch never triggers; only the white speculars melt into light surfaces, cosmetic). Mask mode rejected: the mark is multi-colour, mask would discard the copper character.

**Files:** `assets/brand/logo-trim.png` (trimmed master, 8px pad — source PNG was flush at the bottom edge), `public/brand/logo.{webp,png}` (268×256 @2x; webp 17 KB — ~15 KB is the gradient floor), favicon set on burgundy plates, `public/og-default.png` regenerated with the real FK Raster TTF (woff2→ttf via fontTools, Pillow render), `Base.astro` favicon links + logo preload, `schema.ts` Organization.logo, lockup CSS in `decbricks.css` (`--brand-logo-w/h` = 1.15em/1.1em from the 1.0455:1 aspect).

**One mechanism, zero hand-inserted `<img>`:** brandify/Header/Footer/BrandText all emit `.font-brand`, so the `::before` covers every mention automatically. Two real fixes found during verification: (1) ServicesHero's smiley `sr-only` span rendered `{body}` plain — pre-existing check:brand leak on /contact (checker is SSR-only) — now brandify'd; (2) **smiley-text.ts rebuilds its inner DOM from text and discarded the brand span** — the visible "Decbricks" in the contact smiley lost FK Raster at runtime (invisible to check-brand). Fixed: text parts of the rebuild go through `brandify` (pill HTML untouched); verified the animated SplitText instance keeps exactly ONE `::before` logo and the nowrap lockup wraps as a unit.

**Opt-outs: none.** Smallest mention (footer legal, ~14px) keeps the logo (~15px effective — legible). sr-only duplicates stay plain text (invisible; SSR sr-onlys carry font-brand spans only to satisfy the checker — runtime rebuilds replace them with plain text). Header aria-label kept as "Decbricks — Go to homepage" (same semantics as the spec's "Decbricks - home"; minimal diff).

**Not verifiable here:** real-2x-DPR eyeball (probe ran deviceScaleFactor 2 — crop was crisp), usage rights for the supplied PNG (open-items A6/B1). Loader/menu/footer-split scripts never carry the brand word (checked — no split risk there).

## Logo mark v2 — red blob + cream variant on dark/coral surfaces (2026-11-12, owner swap + decisions)

Owner replaced `docs/logo.png` after the lockup shipped: copper multi-colour blob → glossy **red** blob (median `#e00609`, effectively single-hue). Consequences, all measured:
- Aspect changed 1.0455 → **1.088** → `--brand-logo-w` default 1.15em → **1.2em** (aspect-true, no squash).
- The "mode A, no variants" decision's premise (light copper tones at 10.8:1 on burgundy) is gone: red vs burgundy = **2.17:1**, and the footer band is **coral** (`bg-purple` #D45060, every route) where the colour body is **1.22:1**.
- Owner decisions (asked, answered): **cream silhouette variant on dark surfaces**; favicons go **transparent, no plate** (burgundy plate would have hidden the red mark entirely).

**Files:** `assets/brand/logo-trim.png` regenerated (1240×1141), `public/brand/logo{,-cream}.{webp,png}` (278×256; cream = alpha-mask filled `#FFF9F2`, 10 KB), transparent favicon set, `og-default.png` regenerated (burgundy plate + cream-variant logo + FK Raster wordmark), preload switched to the cream file (header = above the fold everywhere), `check:brand` now asserts `logo-cream.webp` too.

**Variant rule** (decbricks.css): `.structure-menu`, `.sections-servicesHero`, `.sections-contactForm`, `.structure-footer` → cream (burgundy 10.3:1 / coral 3.93:1); all other contexts full-colour (About white cards, 4.78:1). Verified by a full sweep: every `.font-brand` on all 5 routes × sampled surface — zero colour-on-dark, zero cream-on-light, zero wraps/overflow, no console errors. Cream-vs-coral 3.93:1 meets the 3:1 non-text bar; the footer's burgundy text on coral (2.64:1) is the template's pre-existing treatment, untouched.

**Not logo-related, noted for the owner:** on /contact the ServicesHero smiley span rests offscreen-right (x≈1320 @1280, clipped by the section's `overflow-hidden`, no scrollbar) — the template's scroll-driven hero behaviour, pre-existing.

## Hardcoded `text-[#2F3A1E]` on sage chips (owner decision, 2026-11-12)
`AboutBlock.astro` + `ServiceBlock.astro` use `text-[#2F3A1E]` (dark olive-brown) for small text on sage chips instead of a token (`--brand-olive` #5A6432 is not a small-text colour on sage — 4.1:1 fails; #2F3A1E on sage measures **7.0:1+** ✅). **Owner decision: keep the hex hard-coded, do not tokenise.** If sage text is ever reused elsewhere, prefer this value as the starting point for a token.

## Brand lockup baseline & optical alignment fix (2026-11-12)

**Symptoms & Root Cause (measured in Playwright across 375/768/1280/1920):**
1. **8.2px – 15.2px Baseline Float:** `.font-brand` floated high above surrounding text, leaving touching punctuation (commas, periods) sitting on the parent line baseline detached from the brand word. Cause: `.font-brand` had `display: inline-flex; align-items: center;`. CSS Flexible Box Layout Level 1 §4.3 synthesizes the baseline from the first flex item (`::before`, the logo). Because `::before` contains no text, its baseline is synthesized from its bottom margin edge, placing the bottom of `::before` on the line baseline. The flex container then vertically centered "Decbricks" against `::before` at half its height ($0.55\text{em}$), floating the brand word by $0.55\text{em}$ (~8.2px at 14.8px font-size to ~15.2px at 27.5px font-size) above the baseline.
2. **Line Pitch Disruption:** `line-height: 1` on the `inline-flex` container expanded paragraph line boxes from 20px to 21px and created a split line box with a 5.58px phantom line pitch.
3. **Font Metric Verification (`fontTools`):** Analysis of `fk-raster-roman-compact.woff2` confirmed all glyphs `D, e, c, b, r, i, k, s` have `yMin = 0`. The font itself has zero baseline shift. True inline layout aligns FK Raster with Hanken Grotesk and Bricolage Grotesque to **0.0000px delta**. No `@font-face` metric hacks (`ascent-override`, `descent-override`) are needed.

**Fix (CSS-only in `src/styles/decbricks.css`; zero markup/data/script changes, zero new dependencies):**
- `.font-brand`: `display: inline; white-space: nowrap; vertical-align: baseline; line-height: inherit;` (replaces `inline-flex` and `line-height: 1`).
- `.font-brand::before`: `display: inline-block; width: var(--brand-logo-w, 0.98em); height: var(--brand-logo-h, 0.90em); margin-inline-end: 0.28em; vertical-align: var(--brand-logo-shift, -0.15em); background: url(/brand/logo.webp) center/contain no-repeat;`. Sized to 0.90em cap-height to avoid line-box expansion, and lowered by -0.15em so the vertical center of the logo aligns with FK Raster's x-height center $+0.292\text{em}$ within 0.05px.
- Flex parent baseline alignment: `.structure-footer .mb-40.flex { align-items: baseline; }` aligns the upper footer "Rise to the top" button text and "Decbricks" wordmark.

**Verification Results:**
- Baseline delta: 0.0000px across all viewports (375, 768, 1280, 1920) and all contexts (paragraph, uppercase tagline, header link, upper footer, copyright, contact smiley, services hero).
- Punctuation attachment: 0.0000px delta between punctuation and brand word.
- Logo optical center: offset from word x-height center is $\le 0.08\text{px}$ on desktop, $\le 0.36\text{px}$ on mobile (acceptance: $\le 1\text{px}$).
- Paragraph line pitch: bit-identical to plain text without brand (`[22, 22, 22, 22, 22, 22]` at 375, `[20, 20, 20]` at 1280).
- Quality gates: `npm run build` ✅, `npm run check` (0 errors, 0 warnings) ✅, `npm run check:brand` ✅.
- 2x DPR before/after crop screenshots saved in `docs/qa/shots/` (`tagline`, `about-paragraph`, `header-link`, `footer-marquee`, `footer-copyright`, `button-smiley`, `h1-hero`).
- Unverified: Real Safari/WebKit on physical macOS/iOS (tested in Chromium/Linux).

## About media cards beside section content (2026-11-12)

**What:** every minor About section (02/03/04/06/07) got a picture card reusing ServiceBlock's media column verbatim (`relative z-1 mt-40 … lg:w-260 xl:w-300 3xl:w-360 4xl:w-410` + `aspect-4/5 … rounded-40 rounded-tr-none`); `astro:assets` `<Picture formats={['avif','webp']} fallbackFormat="webp" quality={50}>`. Mapping (owner-approved plan): 02 horse, 03 rocket, 04 poster, 06 airstrip, 07 bust; no card on 01 (hero treatment) / 05 Values (sage cards are the visual; a card would crowd 1024–1280). Plan: `docs/plans/about-pictures-plan.md`.

**Deviations from the plan:** (1) sources re-encoded to WebP q85 in `src/assets/about/` instead of copying PNGs — Astro's Picture defaults the fallback `<img>` to PNG even for WebP sources, so PNG fallbacks were ~2.3 MB each (35 MB `dist/_astro` → 7.3 MB after; `fallbackFormat="webp"` required). (2) Halftone texture is expensive to compress: quality 50 chosen via sharp tests (webp/avif converge ~equal at q50); worst-case srcset fetch ≈911 KB (budget 1200), per-image ≤215 KB. (3) services-page.ts: comment only — `if (!video) return` guard already skips About blocks; no animation hooks exist on the card (verified: no parallax).

**Files:** `src/components/AboutBlock.astro` (media column), `src/data/about.ts` (`image?` field + imports), `src/assets/about/*.webp`, `src/scripts/services-page.ts` (comment), docs. No class renames, no new deps, copy verbatim.

**Open:** poster in-image credit "Zeka Design" → open-items B4 (rights before launch). Crop behaviour note: build output keeps source aspect; the 4:5 crop is done by CSS `object-cover` (identical visual to a baked crop).

**Update (2026-11-12, second batch):** owner added 2 more pictures → all seven sections now carry cards (`rocketposter` on 01, `knight` on 05); alternation is a perfect L/R/L/R/L/R/L. Values-crowding worry resolved by measurement: sage cards still get 301px each at 1024 (h3 251px), no overflow at any width. Both new images are native 4:5 (1080×1350) — zero crop risk.
