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

## Phase 0 — redesign-polish stabilise (2026-11-13)

Plan `docs/plans/redesign-polish-plan.md`, executed inline with per-task RED→GREEN probes; full decision trail in `.superpowers/sdd/redesign-polish-plan/progress.md`, findings in `docs/qa/findings.md` F21–F26. Key non-obvious decisions:

- **Cal fallback copy (R5)**: visitor-neutral in both envs ("Online booking is coming soon.") — AGENTS.md rule 6's dev-visibility requirement is met via console.warn + sr-only status, not on-page copy.
- **Cookie safe area (R9)**: reservation happens **pre-paint** (inline head script in `Base.astro` adds `.has-cookie-banner` when no `essential-consent` cookie + CSS defaults 186px <lg / 269px lg+) so the banner appearing causes zero CLS; `cookies.ts` re-measures for manage mode. Mid-scroll overlap of scrolling content is accepted as inherent to fixed overlays. /about's 7-item pill stack cannot geometrically clear the banner zone at <lg → accepted residual, open-items A17.
- **Footer band (R11)**: repaint is pure CSS (`.structure-footer .webgl-background`) because the three.js shader samples the element's computed background-color — single source of truth. Trail recoloured `rgb(188,61,77)` (`--brand-accent-deep`) so strokes stay visible on burgundy without washing out Off-White text.
- **Tap targets (R12)**: promoted the coarse-pointer 44px block to **all pointers** (padding/min-height, not type size). This grew the ServicesHero pills and re-triggered the R9 overlap at <lg and lg — fixed in phase 0.2b with an additive hook `.parts-servicesHeroNavRow` (mt 50→10 <lg) and a deeper lg nav translate (offset 62→22px). Lesson recorded: re-run p0-t2 after any pill-size change.
- **CLS (R14)**: plan hypothesis disproven empirically — the video slot is aspect-resolved; residual CLS is font-swap reflow behind the opaque loader + deliberate GSAP entrance choreography (transform-only tweens emit no shift entries; verified with isolated pages). CLS ≤0.01 metric target moved to Phase 7.
- **Display-word clipping (R8)**: no defect at 375/1280/1920; one-edge bleeds are the intended motif.
- Deferred minors: header `Menu` 36px / `Close` 34px / skip link 40px tap sizes → Phase 2.

No new dependencies. No class renames; one additive hook (`.parts-servicesHeroNavRow`). No skill conflicts.

## Phase 2 — Global chrome (2026-11-13)

**Owner decision:** loader "plan default" approved — first-visit intro ≤1.2s, sessionStorage skip on repeat visits, 1.5s hard cap.

**What:**
- **Loader (F27/F28):** `initLoader` gates on `sessionStorage['decbricks:loader-seen']` + a pre-paint `html.loader-skip` class (inline script in `Base.astro`, rule in `decbricks.css`) so repeat visits never flash the overlay; the timeline is compressed with `timeScale(natural/1.1s)`; a 1500ms hard cap releases the hero hold and boosts the tail; reduced-motion now zeroes the heading char tweens (previously hardcoded 0.3/0.35s) and releases the hold immediately. **CLS side-effect found and fixed:** the box's layout-anchored readout + corner ticks swept ~370px through layout during the scale-in → one coalesced 0.19 layout-shift entry; they are now anchored at the box's static top-left and positioned per-frame via GSAP transforms (exempt from CLS), and stage 0 runs after the scale-in. Site-wide CLS ≤0.008.
- **Header (F29/F31):** mono `01–04` indexes (Departure Mono, `aria-hidden`, outside the hover-slide masks); active route = 2px `currentColor` bar via `::after` on the link (text-decoration is clipped by the labels' tight `overflow-hidden` slide mask); Contact CTA keeps the burgundy fill with Off-White text (`.parts-btnBlock.bg-darkPurple` scoped rule; `text-neonGreen` removed); `menu.ts` pill-toggle block deleted (route state = `router-link-active` + underline).
- **Mobile menu (F30):** full editorial overlay — `min-height:100svh` nav, straight grid (rotation + 1minus1 glyph svg deleted), hairline link separators with mono indexes, `MENU / ESC TO CLOSE` mono meta row (`u-kicker`), off-white `.background`. Esc-close, focus trap, inert handling were already present in `menu.ts` and are verified by probe.
- **Rects (F29):** Menu 36→44px, Close 34→44px, skip link 40→44px (min-height + flex, padding untouched). Skip link restyled: signature radius 40/0/40/40, Departure Mono 12px.
- **Footer (F32):** scrollTop / copyright / Manage-Cookies labels → `u-kicker` (Departure Mono 12px). Dead columns: none remain (social pills removed earlier, A8).
- **Transitions (F33):** cover/reveal 0.7→0.5s (`--dur-reveal`); stagger, easing and the swap lifecycle untouched (BUG-015 rule).

**Files:** `src/scripts/loader.ts`, `src/scripts/menu.ts`, `src/scripts/page-transition.ts`, `Header.astro`, `Footer.astro`, `Loader.astro`, `Base.astro`, `decbricks.css`.

**Verification:** `p2-t1.cjs` (loader cut + skip, 3-run timing), `p2-t2.cjs` (12 header/menu checks), `p2-t3.cjs` (footer mono), `p2-cls*.cjs` (CLS isolation matrix), `p2-t1x.cjs` (timing incl. reduced motion); audit-main 0 contrast fails / 0 overflow / CLS ≤0.008; audit-behav transitions 0 errs, canvases 1280×900 after swaps; p0-t2 cookie probes still GREEN. Shots `docs/qa/shots/phase2-*.png`.

**Not done / deliberate:** CookieBanner needed no further work (Phase 0 covered safe-area, 44px targets, contrast). Footer marquee words are 1minus1 brand adjectives — content, not chrome (A12/Phase 4). Rollback: loader flag is additive (`decbricks:loader-seen` absence restores old behaviour minus the compression).

## Phase 1 — Foundation tokens (2026-11-13)

**Owner decision:** ink neutral APPROVED (`#2A0208` body/muted on light+sage; headings keep burgundy).

**What:** all §3 tokens live in `decbricks.css` (`--color-ink/-muted`, `--hairline/-dark`, `--radius-pill`, `--dur-micro/std/reveal`, `--ease-brand`, `--fs-display/h2/lede`) + utilities `u-display/u-h2/u-lede/u-kicker/u-ink/u-ink-muted/u-section/u-btn-primary/u-btn-ghost`. Applied per-component, additive only: `u-h2` → 4 shared section h2s (AboutBlock/ContactBlock/ServiceBlock/ServicesClients), `u-kicker` → 3 eyebrows (Bricolage 12px bold → Departure Mono 12px/400/+14% — "mono gets a real job"), `u-lede` → ContactBlock secondary h3, `u-ink` → About body paragraphs, contact fallback paragraphs, form fieldset + checkbox label, `u-btn-primary` → form submit (radius 8→40/0/40/40 signature; fill was already burgundy/off-white via the scoped `.part-btnPrimary.bg-purple` rule, which stays).

**Not applied (deliberate):** `u-display` — hero display words are GSAP-measured (Phase 3 owns heroes); `u-section` — no light free-standing band exists today (caseStudies band is transparent over the burgundy WebGL canvas per the not-painted decision; testimonials/clients are inverted bands) — the one-padding-value + hairline rhythm lands per-section in Phases 3–4; `u-btn-ghost` — no ghost button exists yet (Phase 2 header CTA candidate).

**Files:** `src/styles/decbricks.css` (token + utility block), AboutBlock/ContactBlock/ServiceBlock/ServicesClients/ContactForm.astro, `src/pages/contact.astro`. No renames, no new deps, copy verbatim.

**Verification:** probes `/tmp/opencode/p1-t1.cjs` (tokens), `p1-t2.cjs` (applications), `p1-t5.cjs` (§3 contrast sweep — ink 18.08:1), `p1-t6.cjs` (reduced-motion baseline); full audit + transitions re-run clean; Phase-0 cookie probes still GREEN. Evidence `docs/qa/shots/phase1-{before,after}-*.png`.

## Phase 3 — Task 1+2: home hero v2 + hero→content band (2026-11-13, commit 061fc01)

**What:** home hero rebuilt behind a `[data-hero-v2]` gate on `.sections-hero` (Hero.astro): two contained `u-display` words (Distinct / Always, Bricolage 800), body copy in its own grid column, the video preview in a ticked media cell (corner ticks at −1px on the CELL, media inset 10px via decbricks.css so the WebGL texture can't paint over them), a Departure Mono capability row (4 pills → `/services#id`, 44px targets), tilt removed from the hero (single-tilt rule; the collage keeps the page's one tilt). Task 2: `.end` row `lg:min-h-screen` slack removed; `#services` `lg:pt-100`→`lg:pt-45` (280px dead burgundy → 45px). All template class hooks preserved (`.sections-hero*`, `.start`, `.start-mobile*`, `.end`, `.pin-trigger__mobile`, `.parts-*`, `#services`, trails).

**Why / rulings:**
- Display face = Bricolage per plan §3 (FK Raster collapses below ~140px; v1 set it ~230px). `u-display` now carries `font-family: var(--font-neuePower)` — it had none, falling to system-ui (caught on shots).
- `initServicesPin` mobile branch bug fixed (`y: s`, not `baseY + s`): the old formula wrote the flight's END offset at rest — the real source of the mobile "empty burgundy screens" (F35). `pinBaseY` became write-only → removed.
- FK W/Y kerning hack removed: `innerText` reflects `text-transform: uppercase`, so it matched lowercase w/y and wrecked Bricolage metrics (F36). Rule of thumb recorded: char-level logic on uppercase elements must use `textContent`.
- Departure Mono preloaded (was a fallback face): hero mono rows re-wrapped on late swap, /@375 CLS 0.205 → 0.0002 (F37). New pills `<ul>` needed explicit `color` or its whitespace nodes failed the contrast sweep (F38).
- /@768 LCP 152 → ~440-500ms ACCEPTED: the pin fix surfaces the preview video, which legitimately becomes the LCP element at 768 (F39). Owner copy for `/` still pending (A12/C1) — words held verbatim per approved holding pattern.

**Files:** Hero.astro, hero.ts, decbricks.css (gated Phase-3 block: hero-v2-row/mediaCell/pills/word2/frame/hero-top padding — supplies responsive utilities absent from compiled global.css: `lg:w-320`, `2xl:w-480`, `lg:aspect-3/2`, `max-lg:min-h-svh`, `sm:px-30`), Base.astro. main.ts untouched (BUG-015 rule).

**Verification:** probe `/tmp/opencode/p3-t1.cjs` RED 12 → GREEN 20/20; audit-main ALL CLEAN ×20; build/check/check:brand pass; shots `docs/qa/shots/phase3-t1b/t1c/t1d-hero-*`, `phase3-t1-scroll-*`. Reduced-motion: entrance path unchanged (Phase-1 p1-t6 baseline still applies); no new motion added.

## Phase 3 — Task 3: ServicesHero rebuild (2026-11-13, commit 4bb8fc0)

**What:** shared services/about/contact hero (ServicesHero.astro) rebuilt behind `[data-serviceshero-v2]`: contained `u-display` Bricolage-800 words (word2 one-step offset via `hero-v2-word2`), padded top (15/30px), body cell right-aligned as before; "Jump to" pills moved to the mono system face (outline + hairline border + tracking) via a gated CSS override. All template hooks untouched: `.parts-servicesHeroNavRow`, `.parts-serviceNavLink` + `__label` char-roll double labels + `aria-current` machinery, `.sections-servicesHero__trail(Wrapper)`, `.parts-smileyText`, section class + cookie rules.

**Why / rulings:**
- The Phase-0 cookie-banner lg nav-lift translate was tuned to the old hero's height; after the rebuild it placed the pills INSIDE the body text (found on shots, F41). Removed — the shorter hero clears the banner zone naturally at lg (content ends ~400px; banner top ≥499px at the 768px min-lg viewport height). p0-t2/p0-t2-desktop re-verified GREEN.
- Home v2 mobile frame is content-sized (v1 was fixed-height), so the banner-aware height shrink can't cap it: at 375×812 the scroll button dipped ~69px under the card (F42). Fixed with a banner-visible-only compression of discretionary spacing (~106px), reverting on dismiss. Ruling: compression instead of forcing the frame height — the v2 media cell is in flow by design (the v1 absolute preview was the R1 breakage).
- Pills keep the char-roll SplitText hover/focus (services-page.ts) — masks measured exact-fit with mono tracking (no clipping).
- `heading-3.5xl` is no longer used anywhere (scripts/styles/components verified); words align to the home hero's display scale (one system).

**Files:** ServicesHero.astro, decbricks.css (gated `[data-serviceshero-v2]` block + cookie-banner compression rules). services-page.ts, main.ts untouched.

**Verification:** p3-t3 GREEN 100/100 (6 page-width combos, incl. pills/body/word overlap checks in the banner-visible state); p0-t2 + p0-t2-desktop GREEN; audit-behav transitions 0 errors + canvases 1280×900 after swaps; p3-cls375 0.0001; build/check/check:brand pass; shots `docs/qa/shots/phase3-t3{,b}-hero-*`.

## Phase 3 — Tasks 4+5: scale verification + LCP-safe hero media (2026-11-13, commit b7ee964)

**Task 4 (scale):** /about + /contact inherit the Task-3 rebuild via ServicesHero props — no spacing changes needed. Verified: p3-t3 GREEN includes both pages × 1280/375; 1920 shots composed (same 104px `--fs-display` cap as home — one system scale).

**Task 5 (LCP-safe media):** poster frames extracted from the actual hero videos with ffmpeg (`hero-preview-poster.webp` 13.8KB, `showreel-poster.webp` 6.3KB → `public/images/heroes/`) and wired to the two preview variants + the `preload="none"` showreel player. Posters are real frames of the real videos — no invented imagery. The showreel poster sits behind the GSAP opacity-0 overlay until play, where it removes the black flash. Lazy source injection (media.ts, active variant only) untouched. Display faces all load at first paint (Departure Mono preloaded in 3.1) — no font swap. `/@768` LCP 436-508 → 168ms, superseding the F39 ruling.

**Files:** Hero.astro (3 poster attrs), public/images/heroes/*, Base.astro (from 3.1). No new deps (ffmpeg is a local tool).

**Verification:** p3-t5 GREEN 12/12; audit-main ALL CLEAN ×20 (CLS ≤0.0002 on /@375, LCP inside ±10% everywhere); build/check/check:brand pass.

## Footer redesign — Phase 1 (2026-11-13)

**What:** Split `Footer.astro` into a thin shell composing `src/components/footer/{FooterCta,FooterNav,FooterContact,FooterStatus,FooterWordmark,FooterLegal,FooterWebgl}.astro` backed by typed `src/data/footer.ts` (`FOOTER`, `FOOTER_CONTACT`). Added scoped `.structure-footer__*` layout/type rules in `src/styles/decbricks.css`. Updated `src/scripts/footer.ts` to retire `initSocialPillsRandomLayout` (social data empty under A8), emit once-per-session dev warnings for `[data-dev-missing]`, keep `initSvgRectReveal(footer)` and `.structure-footer__inner` scrub reveal with `invalidateOnRefresh: true`, and guard `.structure-footer__marquee`.

**Decisions:**
- **Inverted `.structure-footer__ctaBtn` vs `.u-btn-primary`:** `.u-btn-primary` is burgundy-on-light (`#2a0208` / `#800020`), invisible on the burgundy footer field, so `.structure-footer__ctaBtn` inverts to Off-White `#FFF9F2` fill with burgundy `#800020` text (10.36:1).
- **Retired `C9` marquee + `initSocialPillsRandomLayout`:** Removed 1minus1 adjective marquee from DOM (words archived in `FOOTER.marqueeRetiredWords`) and removed unused ~120-line random social pill physics; `.structure-footer__marquee` remains null-guarded in `footer.ts`.
- **`cta="auto"` on `/contact`:** Auto-suppresses the redundant "Let's Start Something Great" `<h2>` CTA on `/contact` and emits `<h2 class="sr-only">Site footer</h2>` so the single-`<h1>` and no-skipped-heading gates hold without duplicating the contact page CTA.
- **Hidden missing-data slots (`A2`/`A3`/`A4`/`A8`/`A11`/`C1`):** Services column (`links: []`), phones/email/Cal/socials, TZ/availability, and legal links render nothing in prod and log once-per-session dev warnings (`data-dev-missing` omitted in prod builds). Added `A18` and `A19` to `docs/open-items.md`.

**Files:** `src/data/footer.ts`, `src/components/footer/*.astro`, `src/components/Footer.astro`, `src/scripts/footer.ts`, `src/styles/decbricks.css`, `docs/open-items.md`.


## Footer redesign — Phase 2 (2026-11-13)

**What:** Shipped Concept A ("Foundation") visual system and signature moment across [Footer.astro](file:///home/ankit/GitHub/decbricks/src/components/Footer.astro), [FooterWordmark.astro](file:///home/ankit/GitHub/decbricks/src/components/footer/FooterWordmark.astro), and [decbricks.css](file:///home/ankit/GitHub/decbricks/src/styles/decbricks.css).

**Decisions & fixes vs prototype:**
- **Wordmark sizing + `.font-brand` lockup crest:** Measured FK Raster Roman Compact `"Decbricks"` width in Chromium at `4.25em` (`425×86` @ 100px). Using container query sizing (`.structure-footer__wordmarkRow { container-type: inline-size }` + `clamp(62px, 22.8cqi, 424px)` with `min-height: clamp(76px, 28cqi, 520px)` on `.structure-footer__wordmarkBox`) fills ~97% of the padded container width with zero right-edge clipping from `320` to `2560px` and `0` footer CLS. Capped `--brand-logo-w: 0.30em; --brand-logo-h: 0.275em` on `.font-brand::before` as a centered crest above the wordmark (`display: block; margin: 0 auto 0.07em; -webkit-text-fill-color: initial` inside `@supports (background-clip: text)`).
- **2× DPR brick-tile artefact fix:** Replaced prototype stroked `92×44` SVG (which lacked a `viewBox` and doubled horizontal tile seams `3+2px`) with an exact-integer `<rect>` running-bond module (`viewBox="0 0 96 48"`, `3px` mortar, uniform courses across tile wraps), scaled `em`-relatively (`0.34em × 0.17em` below `640px`, `0.27em × 0.135em` ≥ `640px`).
- **25px grid texture:** `.structure-footer__gridBg` sits at `z-index: 15` (above WebGL `z-0`/`z-10` canvases and below `.structure-footer__inner` `z-20`) with a static `25px × 25px` 6% Off-White `linear-gradient` pair; no desktop CSS glow overlay (WebGL trail handles pointer reactivity).
- **CTA & columns rhythm:** Set CTA title to `clamp(44px, 7.4vw, 128px)` with `max-width: 15.5ch` (clean 2-line wrap at `1440px`) and fixed 4-column desktop grid (`repeat(4, minmax(0, 1fr))` ≥ `900px`, 2-up below) so `Pages` and `Company` occupy predictable left tracks. All footer text pairs use full Off-White (`10.36:1` on burgundy, `5.13:1` over `#BC3D4D` trail) except `.structure-footer__ctaBtn` (`10.36:1` burgundy on Off-White).

**Skill precedence log:** Kept Departure Mono `u-kicker` headings/legal labels per AGENTS.md/plan §5.7 despite `frontend-design` generic mono-label caution.



## Footer redesign — Phase 3 (2026-11-13)

**What:** Added stepped brick-laying choreography, hover/active states, reduced-motion branches, and runtime-scoped `will-change` cleanup across [Footer.astro](file:///home/ankit/GitHub/decbricks/src/components/Footer.astro), [footer.ts](file:///home/ankit/GitHub/decbricks/src/scripts/footer.ts), and [decbricks.css](file:///home/ankit/GitHub/decbricks/src/styles/decbricks.css).

**Decisions:**
- **IntersectionObserver brick-laying (`.is-built`):** Triggered once at `threshold: 0.2` on `.structure-footer__wordmarkRow` and disconnected immediately (plus cleaned up in `initFooter()` teardown). Under `@media (prefers-reduced-motion: no-preference)`, `.structure-footer__wordmark` starts at `clip-path: inset(100% 0 0 0)` and transitions via `--ft-lay: 1.3s steps(14, end)` to `inset(0 0 0 0)`. Under `prefers-reduced-motion: reduce`, no clip-path or transition is attached so `getAnimations().length === 0` and the wordmark is immediately visible.
- **Scoped `will-change`:** Removed permanent `will-change-transform` from `.structure-footer__inner`; `initFooter()` sets `inner.style.willChange = 'transform'` only while the scrub ScrollTrigger `onToggle` is active and resets it to `''` on leave and teardown.
- **Reduced-motion scroll & hover:** `onScrollTop` uses `lenis.scrollTo(0, { immediate: true })` (or `window.scrollTo({ top: 0, behavior: 'auto' })`) when `prefersReducedMotion()` is true; `.structure-footer__ctaBtn`, `.structure-footer__ctaGhost`, and `.structure-footer__topBtn .svgs-arrowUp` drop transform transitions and shrink hovers to colour/underline under `@media (prefers-reduced-motion: reduce)`.




## Footer redesign — Phase 4 (2026-11-13)

**What:** Implemented functional controls in [FooterContact.astro](file:///home/ankit/GitHub/decbricks/src/components/footer/FooterContact.astro), [FooterStatus.astro](file:///home/ankit/GitHub/decbricks/src/components/footer/FooterStatus.astro), [FooterLegal.astro](file:///home/ankit/GitHub/decbricks/src/components/footer/FooterLegal.astro), [footer.ts](file:///home/ankit/GitHub/decbricks/src/scripts/footer.ts), and [decbricks.css](file:///home/ankit/GitHub/decbricks/src/styles/decbricks.css). P4b newsletter remains deferred (blocked until A7 endpoint + A11 privacy page).

**Decisions:**
- **Studio clock & availability (`FooterStatus`):** SSR renders `--:--` inside `min-width: 5ch` FK Raster tabular numerals (`clamp(48px, 5vw, 84px)`) so layout never jumps on hydrate and invalid `PUBLIC_STUDIO_TZ` degrades cleanly via `try/catch`. `footer.ts` updates via `Intl.DateTimeFormat` (`en-GB`, 24-hour) only when the formatted minute string changes, pauses the interval on `document.hidden === true` (`visibilitychange`), and clears both interval and listener on teardown. Availability dots encode state by shape as well as colour (solid sage + calm step-blink for `open`, beige for `limited`, hollow ring for `closed`).
- **Copy-email + fallback (`FooterContact`):** Preserves `mailto:` beside a ≥44×44px `"Copy"` pill and `role="status" aria-live="polite"` toast (`"Email copied"` / fallback `"Copy failed – select the address"`). Uses `navigator.clipboard.writeText` with an off-screen `<textarea>` + `document.execCommand('copy')` fallback; guarded by `disposed` flag and cleared timer on teardown. When `EMAIL === ''`, the entire email row and copy/toast controls stay absent.
- **6-brick scroll-progress `"Rise to the top"` (`FooterLegal`):** Replaced `.svgs-arrowUp` with a 3-course staggered running-bond 6-brick stack (`data-brick="1..6"`), while keeping `.parts-btnScrollTop` and `.parts-btnScrollTop__label` intact for `buttons.ts` char-slide hover. Driven by a single `ScrollTrigger` (`start: 0, end: 'max'`, killed on teardown), clamped to `0` at top (`scrollY <= 2` or `p <= 0.02`) and `6` at bottom (`p >= 0.985`), updating DOM classes only when `filled` changes; `lenis.scrollTo(0, { duration: 0.55 })` keeps scroll-to-top under 1 s across `/` (reduced-motion uses `immediate: true`).





## Testimonials redesign — Phase 0 (2026-11-13)

Plan `docs/plans/testimonials-redesign-plan.md` (owner-approved, Concept A spotlight), evidence `docs/plans/audit/testimonials-current.md`. What/why/files:

- **Data extraction:** `src/data/testimonials.ts` (typed, mirrors `services.ts` pattern) holds 8 clearly-marked placeholder quotes derived from the template's own set — sentiments and length variety kept, all real clients/"1minus1" removed, `service` mapped to the real Strategy/Creative/Web-Development/Campaigns taxonomy. The old 9 hardcoded cards (incl. the Team17 duplicate) are gone.
- **IP removal in `Testimonials.astro` (1011 → ~90 lines):** all 10 sticker `<picture>` blocks (1minus1 "Group 508xx" art), the one-off service chip, the 45 pixel-cross "rating" SVGs (owner decision: stars stay off until a real ratings policy exists), minimap chip, counter chip, vertical "Testimonials" span and the drag-cursor marquee. Underlying image files stay in `public/images/case-studies/` (possibly referenced elsewhere); unused-hash cull list recorded in open-items B2.
- **Placeholder launch guard:** prod renders nothing while any `placeholder: true` exists unless `PUBLIC_SHOW_PLACEHOLDER_TESTIMONIALS=true` (preview-only — `check-placeholders.mjs` fails if the flag is raised while placeholders lack consent); dev always previews + `console.warn`. Zero-dep script + `check:placeholders` npm script. No Review/AggregateRating schema now or later (Google: self-serving Organization reviews are ineligible — stated in plan §6).
- **Script:** `testimonials.ts` sticker placement now skipped when the section has no stickers; drag-canvas init/teardown wiring in `main.ts` unchanged (still registered in boot + `onAfterSwap`; 3-swap gauntlet clean). Draggable/Inertia registrations in `core/gsap` deliberately untouched — they die in Phase 1 with the drag canvas.
- **Skill conflict log:** `astro-best-practices` (islands/hydration, scoped component styles) conflicts with the template's init+teardown architecture and the decbricks.css convention — AGENTS.md precedence wins; no islands introduced, styles land in `decbricks.css` (P1+).
- **Interim state accepted:** the drag canvas keeps its known a11y/cut-card issues until Phase 1 replaces it; placeholders make it visibly interim ("Client Name — Role, Company" attribution).

## Testimonials redesign — Phase 1 (2026-11-13)

Plan §8 P1 (static spotlight, Concept A). What/why/files:

- **Layout:** `Testimonials.astro` renders the §6 structure — band (`role="region"` + `aria-roledescription="carousel"`, `aria-labelledby`), mono kicker, section `h2` (removes the pre-existing h1→h3 heading skip), FK-Raster index numeral (aria-hidden; live-region announce is P2), 8 quote cards with the first `is-active` server-rendered (inactive cards are `aria-hidden` + `position:absolute` behind the in-flow active card — active card defines stage height, so nothing is ever cut), rail of 8 `aria-controls` buttons, 44px prev/next, decorative progress bar. Prototype proportions kept (owner-approved proto A); plan's ~700px height estimate was superseded by the prototype (~1058px @1440 measured) — recorded in PROGRESS.
- **Script:** `testimonials.ts` is now a 23-line stub — all drag-canvas/sticker/minimap/cursor code deleted; `initTestimonials()` returns a no-op teardown so the `main.ts` boot + `onAfterSwap` registration is untouched (BUG-015 pattern preserved; section owns no canvases). **Correction to plan §6:** Draggable/InertiaPlugin registrations in `core/gsap` stay — `case-studies.ts` still uses them (the plan claimed nothing else did).
- **Styles:** `tst-*` block appended to `decbricks.css` (EOF append; file also carries the parallel session's unrelated edits — staged by hunk isolation). Tokens only (--brand-*/--font-*/--dur-*/--ease-brand), no global.css edits, no new utilities. Focus outlines use `--brand-on-dark` (offwhite on burgundy ≈10:1; coral would fail non-text 3:1). `prefers-reduced-motion` zeroes the card/bar/btn transitions. Contrast sweep ≥6.08:1 everywhere (worst: olive chip 6.08, ink-muted attribution 6.15).
- **Controls inert by design:** per plan, prev/next/rail render but no-op in P1; the "Arrow keys work too" hint from the prototype was deliberately OMITTED until P2 makes it true (avoids promising behaviour that doesn't exist).
- **Removed hooks:** `.sections-testimonials*`, `.parts-testimonialCard`, `.parts-testimonialMiniMap*`, `.parts-marqueeCursor` died with the markup; grep confirms nothing outside the section referenced them. `docs/mapping.md` hooks section + "Other template pieces" list updated (Testimonials left the 1minus1-identity list).

## Testimonials redesign — Phase 2 (2026-11-13)

Plan §8 P2 (interaction). Decisions worth remembering:

- **`touch-action: pan-y pinch-zoom` on `.tst-stage`** — the plan forbade `touch-action: none` (vertical scroll must pass through) but said nothing about the *minimum*: with default `auto`, Chrome fires `pointercancel` at the first horizontal touch-move over the card (unconsumed gesture) and the swipe never reaches `pointerup` (probe-verified). `pan-y pinch-zoom` keeps vertical panning + pinch native while horizontal drags stream to JS. This is the standard carousel contract, not a scroll blocker.
- **Deep links are read-only:** `go()` never writes the URL (no `replaceState('#t-N')`). The template's transition system already preserves hashes across client-side navigations (pushState `${path}${anchor}`) and `popstate` restores them, so a `/#t-3` link or Back/Forward round-trip re-opens the quote via `fromHash()` on init + a `hashchange` listener. Writing hashes from the carousel would fight the transition system's own URL bookkeeping for zero gain.
- **Focus policy:** ArrowLeft/Right, rail clicks and prev/next move focus to the featured card (`tabindex="-1"` on all cards; only reachable via explicit focus, so `aria-hidden` inactive cards stay non-tabbable). Swipe deliberately does not move focus (plan §6). `preventScroll: true` avoids jumps.
- **Mobile disclosure is JS-gated on purpose:** CSS collapses the rail <1024px only when the script adds `.is-collapsed`, so a no-JS mobile visit still sees every rail button. Desktop hides the toggle via `min-width: 1024px` and ignores the collapse class (rule is scoped inside `max-width: 1023px`), so resize can't strand content.
- The prototype's "Arrow keys work too" hint stays omitted (still not re-added; progress bar + live region communicate state).

## Footer redesign — Phase 5 (2026-11-13)

**What:** Responsive, touch, and accessibility hardening across [FooterLegal.astro](file:///home/ankit/GitHub/decbricks/src/components/footer/FooterLegal.astro) and [decbricks.css](file:///home/ankit/GitHub/decbricks/src/styles/decbricks.css), plus visual/Playwright audit logged in [findings.md](file:///home/ankit/GitHub/decbricks/docs/qa/findings.md).

**Decisions:**
- **44px touch targets & cookie safe-area (`decbricks.css`):** Enforced `min-width: 44px; min-height: 44px; touch-action: manipulation` on all `.structure-footer a, .structure-footer button` and added `env(safe-area-inset-left/right/bottom, 0px)` padding on `.structure-footer__shell`, keeping the bottom control clear (`lastCtrlBottom: 602 < bannerTop: 626` at `375×812`).
- **Focus & forced colors (`decbricks.css`):** Scoped `.structure-footer a:focus-visible, .structure-footer button:focus-visible` to `2px solid var(--brand-on-dark)` (`outline-offset: 3px`) and added `@media (forced-colors: active)` fallback resetting `.structure-footer__wordmark` to solid `CanvasText` (`background-image: none; background-clip: border-box`) and `.structure-footer__brick.is-filled` to `Highlight`.
- **`translate="no"` brand guard (`FooterLegal.astro`):** Added `translate="no"` on the copyright `.font-brand` lockup span alongside `FooterWordmark.astro` so auto-translators preserve `"Decbricks"`.
- **`@media print` sheet (`decbricks.css`):** Hides `.structure-loader` (caught via screenshot inspect where the fixed loader overlay masked scrolled print captures on fresh page loads), `.webgl`, `.structure-footer .webgl-background`, `.structure-footer__gridBg`, `.structure-footer__wordmarkRow`, `.structure-footer__ctaActions`, `.structure-footer__copyBtn`, `.structure-footer__topBtn`, `.structure-footer__legalBtn`; resets `.structure-footer__inner` transform, sets `.structure-footer { background: #ffffff !important }` with `#111111` ink, and switches the copyright `.font-brand::before` crest to `/brand/logo.webp` + `filter: brightness(0)` so the mark stays legible on paper.
## Testimonials redesign — Phase 3 (2026-11-13)

Plan §8 P3 (motion polish). Small phase, two real findings:

- **Stage-height equalisation is the CLS fix:** inactive cards are `position:absolute; inset:0`, so the stage height was whatever the *active* quote needed — swapping short→long quotes visibly shifted everything below. The script now raises the stage to the tallest quote (measured via `scrollHeight` of the absolute cards, `document.fonts.ready` + resize re-checks, 340px floor). Result: quote changes are pure opacity/transform, 0 layout-shift entries measured at 1440 and 375.
- **Reduced-motion overrides must come after their base rules:** putting the tst reduced-motion block mid-file (before the Phase-2/3 additions) silently lost the cascade to later same-specificity rules — chevron and numeral kept animating under emulation until the override was re-homed at EOF. Comment left in the CSS so the ordering constraint survives future edits.
- Numeral micro-crossfade is class-replay based (`.is-swap` + forced reflow), skipped for reduced motion by CSS; the `/ 08` denominator never animates.
- Long tasks on home at 1440 are pre-existing (WebGL loop, ~57/4s idle, no container attribution); the section contributes none (identical idle vs swap rates; 375 fully clean).
## Testimonials redesign — Phase 4 (2026-11-13)

Plan §8 P4 (hardening + full verification battery). Findings:

- **Plan §4 vs implemented breakpoints diverged in P1** (quote clamp + rail disclosure at 1024). Reconciled to the approved spec: quote 24 → 28 @640 → `clamp(28px,2.6vw,40px)` @1024 → 44px @≥1920 (line-height 1.2 below 1024, 1.15 above); index 40/56/72; title 52px and 320px rail column at ≥1920.
- **Rail disclosure moved 1024→768:** at 1024–1919 the old code rendered a *collapsed by default* rail with no toggle (toggle is display:none ≥1024) — unopenable content. Per §4 the rail is a plain column above 768; only <768 collapses with the toggle. JS `mqMobile` now `(max-width: 767px)`.
- **The coral index numeral failed Lighthouse's 3:1 large-text bar (2.63:1)** — the numeral is live position info, not decoration, so it can't claim the decorative exemption. Recolored beige (`--brand-surface-alt`, 8.82:1); the head keeps its two-tone rhythm via the coral kicker slashes. Rationale comment lives in the CSS next to the rule.
- **Probe lesson (tooling, not product):** this Playwright version has no `page.accessibility` — SR snapshots come from CDP `Accessibility.getFullAXTree`, and the walk must descend *through* `ignored` generic nodes (skip the row, keep recursing) or whole subtrees silently vanish.
- Page-level CLS 0 (0.0001 input-inclusive); long tasks unchanged idle-vs-swap (pre-existing WebGL loop); all §4 contrast pairs ≥6.08:1.

## Footer redesign — Phase 6 (2026-11-13)

**What:** Added automated footer/schema consistency verification ([check-footer-schema.mjs](file:///home/ankit/GitHub/decbricks/scripts/check-footer-schema.mjs) wired as `npm run check:footer` in [package.json](file:///home/ankit/GitHub/decbricks/package.json)), ran full Lighthouse, throttled CLS/INP, 30-swap WebGL gauntlet, and env-matrix QA, and closed documentation ([PROGRESS.md](file:///home/ankit/GitHub/decbricks/docs/PROGRESS.md), [mapping.md](file:///home/ankit/GitHub/decbricks/docs/mapping.md), [tokens.md](file:///home/ankit/GitHub/decbricks/docs/tokens.md), [open-items.md](file:///home/ankit/GitHub/decbricks/docs/open-items.md), [findings.md](file:///home/ankit/GitHub/decbricks/docs/qa/findings.md)).

**Decisions:**
- **Optional canvas relocation spike skipped intentionally:** Plan §10 explicitly keeps global `canvas.webgl` inside `FooterWebgl.astro` (`reattachCanvases()` in [impl.ts](file:///home/ankit/GitHub/decbricks/src/scripts/webgl/impl.ts)). The 30-swap gauntlet across `/services`, `/about`, `/contact`, and `/` completed **30/30** transitions (`0` failures, `0` console/page errors, `2` connected `1280×800` canvases, `hasWebGL: true`), confirming relocation is unnecessary.
- **Footer/schema gate (`scripts/check-footer-schema.mjs`):** Parses built `.structure-footer` HTML and `Organization` JSON-LD across `dist/` without runtime dependencies, asserting `1` `<h2>`, no empty/broken `href`/`mailto:`/`tel:` attributes, `Organization.logo` file presence, and exact set equality for `email`, `contactPoint[].telephone`, and `sameAs`.
- **Bundle & perf budgets:** `src/scripts/footer.ts` measures `4,271 B` minified / `1,995 B` gzipped (vs `1,626 B` gzipped P0 baseline; well under the `<= 3 KB` gzipped budget) with zero new dependencies or network requests. Throttled `375px` `4× CPU` footer scroll+scrollTop probe improved from P0 (`cls: 0.0402`, `scrollTopClickMs: 176`, `maxInpMs: 512`) to `cls: 0`, `footerCls: 0`, `maxInpMs: 80`. Lighthouse desktop reached Perf `61` / A11y `97` / TBT `2,830ms` (vs P0 `60` / `96` / `13,290ms`); `/about` mobile scored Perf `99` / A11y `100` / CLS `0` / LCP `1.1s` / TBT `70ms` (`/` mobile showed `CLS 0.4` from pre-existing WIP `Hero.astro` changes with `0` footer shift).
- **Skill precedence summary (Phases 0–6):** Kept template init+teardown lifecycle in [main.ts](file:///home/ankit/GitHub/decbricks/src/scripts/main.ts), unlayered styles in [decbricks.css](file:///home/ankit/GitHub/decbricks/src/styles/decbricks.css), FK Raster `.font-brand` / Bricolage / Hanken / Departure Mono type system, and Burgundy/Warm Beige/Off-White palette per `AGENTS.md` over `frontend-design` / `astro-best-practices` island/token advice.
## Testimonials redesign — Phase 5 (2026-11-13)

Plan §8 P5 (final QA + docs + launch checklist). Small phase; the audit found real polish:

- **Swipe vs text selection:** a horizontal drag across the quote could start an accidental text selection mid-swipe. Fixed with an intent guard — JS adds `.tst-stage.is-swiping` once movement is >12px horizontal-dominant, CSS sets `user-select:none` only on that class. Never static: quotes stay selectable outside a swipe gesture.
- **Controls got `touch-action: manipulation`** (double-tap zoom delay), the index counter `font-variant-numeric: tabular-nums` (no width jitter across the numeral crossfade), and the title `text-wrap: balance` — all `web-design-guidelines` findings, fixed same phase, re-verified by probe (swipe works, selection suppressed mid-gesture only, vertical scroll pass-through intact at 165px delta).
- **Accepted deviation from the guidelines:** "URL reflects state" — the deep link is deliberately read-only (`#t-N` restores state, URL never written), per the owner-approved P2 decision; evidence in findings T-9.
- All consolidated evidence lives in `docs/qa/findings.md` §"Testimonials redesign — Phase 5" (T-1…T-12). `check:placeholders` sits in open-items §E5 as the launch gate; the section ships hidden in prod until real consented quotes land (plan §10 owner inputs).
## Testimonials — rail scroll + kinetic hover (2026-11-13)

Plan `docs/plans/testimonials-rail-kinetic-plan.md`. Owner request; both features reuse template machinery — no new motion code:

- **Rail pin lives in `equalizeStageHeight()`** (not new CSS): the stage height is already JS-equalised there, and CSS-only sizing would need a known title height or fight circular grid sizing. The rail gets the stage's measured height ≥1024 (`mqDesktop` check inside the same function); below 1024 the grid stacks and the pin clears (`rail.style.height = ''`).
- **`.tst-cardInner` is a motion-only mount, zero CSS:** the card's crossfade uses a CSS transform transition; GSAP on the same element would fight it. This is exactly CaseStudies' slide/`__inner` split, so MomentumHover moves the inner and the crossfade keeps the outer.
- **Calmer kinetic config than CaseStudies** (7/4.5/90/120/7 vs 10/7.5/50/270/15) — quote cards are much larger than the 26vw case cards and this section is the calm editorial one. Gated `(hover:hover) and (pointer:fine)` + ≥1024 + reduced-motion (MomentumHover's internal check alone is too lenient for touch laptops).
- **`data-lenis-prevent` + `overscroll-behavior: contain`** on the rail list: Lenis otherwise hijacks the wheel over scrollable regions; contain stops scroll chaining to the page. Keyboard reach is free — the 8 buttons are focusable, so focus scrolls clipped buttons into view.
## Testimonials — stage + identity rail upgrade (2026-11-14)

Plan `docs/plans/testimonials-upgrade-plan.md` (owner-approved in conversation; supersedes the layout parts of the P0–P5 Concept A plan — its placeholder guard, data shape and a11y floor carry forward). Key decisions beyond the plan text:

- **All cards are now `position: absolute; inset: 0` and the stage height is JS-set exactly** (was: active card `relative` + JS `minHeight`). The old trick made the active card content-sized — shorter quotes left dead band space below the card; and measuring via card `scrollHeight` had a latent P3-era feedback loop (an absolute card's scrollHeight ≥ the stage's own height, so the stage could grow but never shrink — verified stuck at 480px after a 1440→768 resize). `equalizeStageHeight()` now clones each `.tst-cardInner` at `height: auto` into a hidden probe at stage width and takes the max; runs on init/resize/`fonts.ready` only. CSS `.tst-stage` fallback floor lowered 340→260 to match.
- **`.tst-dot` class handover**: the mobile selector dots needed the `.tst-dot` name per plan §4, so the card's initials disc renamed to `.tst-attrDisc` (grep-verified nothing queried the old hook). JS syncs `.tst-railBtn` and `.tst-dots .tst-dot` as two independent index-aligned lists — both exist in the DOM at all widths (CSS decides visibility), so the sync loop never depends on media queries.
- **Dot hit targets on narrow screens**: 8 exact 44px targets + gaps don't fit below ~416px of band width; flex was silently shrinking them to 37px. Fixed with `flex: none` + negative inline margins (hit targets overlap slightly, visual dot centred; ≤415px −3.5px, ≤345px −6px) — measured 44×44 at 390.
- **Reduced-motion swap**: CSS transitions are zeroed there, so the JS phase timer (140ms) would leave a blank stage between the outgoing cut and the incoming pop. `LEAVE_MS = prefersReducedMotion() ? 0 : 140` — reduced motion completes the swap synchronously. Also added `.tst-card.is-active`/`.is-leaving` to both reduced-motion blocks (the enter transition lives on the compound selector and out-specificity-loses a bare `.tst-card` zeroing).
- **Rail aria-label "All clients"** (rows are people, not quotes); visible "All quotes" title + toggle deleted — one control model per breakpoint: rail ≥1024, dots <1024.
- `data-lenis-prevent` removed from the rail list with the P6 scroll machinery (no scroll container anymore).

## Testimonials — stage + identity rail upgrade (2026-11-14)

Plan `docs/plans/testimonials-upgrade-plan.md` (owner-approved in conversation; supersedes the layout parts of the P0–P5 Concept A plan — its placeholder guard, data shape and a11y floor carry forward). Key decisions beyond the plan text:

- **All cards are now `position: absolute; inset: 0` and the stage height is JS-set exactly** (was: active card `relative` + JS `minHeight`). The old trick made the active card content-sized — shorter quotes left dead band space below the card; and measuring via card `scrollHeight` had a latent P3-era feedback loop (an absolute card's scrollHeight ≥ the stage's own height, so the stage could grow but never shrink — verified stuck at 480px after a 1440→768 resize). `equalizeStageHeight()` now clones each `.tst-cardInner` at `height: auto` into a hidden probe at stage width and takes the max; runs on init/resize/`fonts.ready` only. CSS `.tst-stage` fallback floor lowered 340→260 to match.
- **`.tst-dot` class handover**: the mobile selector dots needed the `.tst-dot` name per plan §4, so the card's initials disc renamed to `.tst-attrDisc` (grep-verified nothing queried the old hook). JS syncs `.tst-railBtn` and `.tst-dots .tst-dot` as two independent index-aligned lists — both exist in the DOM at all widths (CSS decides visibility), so the sync loop never depends on media queries.
- **Dot hit targets on narrow screens**: 8 exact 44px targets + gaps don't fit below ~416px of band width; flex was silently shrinking them to 37px. Fixed with `flex: none` + negative inline margins (hit targets overlap slightly, visual dot centred; ≤415px −3.5px, ≤345px −6px) — measured 44×44 at 390.
- **Reduced-motion swap**: CSS transitions are zeroed there, so the JS phase timer (140ms) would leave a blank stage between the outgoing cut and the incoming pop. `LEAVE_MS = prefersReducedMotion() ? 0 : 140` — reduced motion completes the swap synchronously. Also added `.tst-card.is-active`/`.is-leaving` to both reduced-motion blocks (the enter transition lives on the compound selector and out-specificity-loses a bare `.tst-card` zeroing).
- **Rail aria-label "All clients"** (rows are people, not quotes); visible "All quotes" title + toggle deleted — one control model per breakpoint: rail ≥1024, dots <1024.
- `data-lenis-prevent` removed from the rail list with the P6 scroll machinery (no scroll container anymore).

**Review fixes (fresh-context review of d53caad, 0 Critical / 1 Important / 3 Minor):**
- **Important, fixed:** the claimed CSS floor 340→260 was lost from `decbricks.css` between probe and commit (the parallel session rewrote the file mid-flight; the shrink probe had passed on the tree state at that moment, then the tree was restored underneath). At d53caad the effective mobile floor was 340 — the JS 260 was dead below 1024. Fixed: `.tst-stage { min-height: 260px }` — now in HEAD (it reached the file via the parallel session's whole-file commit sweep in `8e21500`; shrink probe re-run on COMPUTED height: 480→260→480 ✓; measure: stage 343@390 / 260@768 / 480@≥1024).
- **Minor, fixed:** `go()` no longer calls `equalizeStageHeight()` — the stage size is the max over all cards at constant width and cannot change between navigations; the call cost 8 clones + forced reflows per click. Runs on init/resize/`fonts.ready` only.
- **Minor, deferred:** `LEAVE_MS` is evaluated once at init — a mid-session OS reduced-motion toggle leaves the JS 140ms phase until the next init (CSS already hard-cuts; same one-shot pattern as the MomentumHover gate, template-consistent).
- **Minor, deferred (documented):** incoming card enters from the 12px base offset, plan §5 said 6px — code comment in `.tst-card.is-active` documents the actual value.

## Services 4 → 7 Expansion (2026-11-14)

- **What / Why:** Expanded Decbricks' service catalogue from 4 placeholder 1minus1 items to 7 verbatim services sourced from `docs/services-content.md` across `/` (`Hero.astro` stacked cards) and `/services` (`ServicesHero.astro`, `ServicesSidebarNav.astro`, `ServiceBlock.astro`), removed all 41 legacy 1minus1 service videos and client logos (`11,028,019` bytes), and upgraded `/services` SEO + JSON-LD.
- **Files:** `src/data/services.ts`, `src/lib/schema.ts`, `src/components/Hero.astro`, `src/components/ServicesHero.astro`, `src/components/ServicesSidebarNav.astro`, `src/components/ServiceBlock.astro`, `src/components/ServiceArtwork.astro`, `src/components/ServicesClients.astro`, `src/pages/services.astro`, `src/pages/sitemap.xml.ts`, `src/scripts/services.ts`, `src/scripts/services-page.ts`, `src/styles/decbricks.css`, `docs/open-items.md`.
- **Single source of truth (`src/data/services.ts`):** Typed `Service` model with `slug`, `index`, `title`, `shortLabel`, `homeSummary`, `pageDescription`, `tags` (`7–8` capabilities per service), `homeCardTheme` (`--t1..--t7`), `artworkMotif`, and optional `media` override slot for future owner photos/videos. Both `/` and `/services` import directly from `SERVICES`; unpopulated `PROJECTS` tag rows and `CLIENT_LOGOS` strip fail gracefully by hiding until real data exists (`docs/open-items.md`).
- **Generative 7-motif `ServiceArtwork.astro`:** Zero-request brick/pixel SVG compositions per service (`strategy`, `design`, `web`, `mobile`, `ai`, `growth`, `outreach`) paired with a documented `media` override slot so owner photography/video can drop in without layout edits.
- **Non-green 7-card `/` stack (`Phase 5.5` owner decision):** Replaced initial green theme rotation with 7 non-green `--t1..--t7` high-contrast burgundy / warm-beige / off-white pairs where no two adjacent cards share a background (`Hero.astro` + `decbricks.css`), removed `.sections-services__intro` above the stack, and kept breathable vertical padding (`150–180px`) with `-55..-65px` card overlaps while preserving `min-h` and ScrollTrigger clearance (`card7` → Work `>= 15px` across all viewports).
- **7-item `/services` hero nav & sidebar:** Short `shortLabel` values (`Strategy`, `Design`, `Web & Software`, `Mobile Apps`, `AI & Automation`, `Growth`, `Outreach`) keep all 7 nav items compact; `<768px` switches to a 2-column grid with a `grid-column: 1 / -1` orphan rule on the 7th item (`Outreach`). Hash deep links (`/services#<slug>`) resolve cleanly under the sticky header via `scroll-margin-top` and `services-page.ts` hash jump + ScrollTrigger sidebar active sync.
- **SEO & JSON-LD (`src/lib/schema.ts`, `src/pages/services.astro`, `src/pages/sitemap.xml.ts`):** Removed the temporary `/services` `noindex` block (`robots="index, follow"` when `PUBLIC_ENV === 'production'`), restored `/services` to `sitemap.xml.ts`, and generated `Service` + `BreadcrumbList` JSON-LD directly from `SERVICES`.
- **Skill vs. `AGENTS.md` note:** Followed `AGENTS.md` over `frontend-design` / `frontend-ui-engineering` defaults by keeping the compiled CSS / `decbricks.css` setup, `brandify()`, zero new packages, and existing `.sections-*` / `.parts-*` JS class hooks intact.
