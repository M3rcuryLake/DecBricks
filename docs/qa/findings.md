# Visual QA findings

Format: ID · page · viewport · severity · description · evidence · status · fix commit
Evidence in `docs/qa/shots/` (`<page>-<w>-<before|after>-<id>.png`, git-ignored) or measurement values inline.

| ID | Page | Viewport | Sev | Description | Evidence | Status | Fix commit |
|---|---|---|---|---|---|---|---|
| F1 | /contact | all | S1 | h2/h3 rendered literal `set:html=Book a Meeting` / `set:html=Let's Start Something Great.` as visible text (attribute written as child content by earlier scripted patch; `check:brand` missed it — no brand word in those strings) | browser h2 textContent before: "set:html=Book a Meeting" | FIXED | qa1 |
| F2 | all | all | S2 | GSAP console warning every page: `invalidateOnRefresh` passed as tween property instead of ScrollTrigger property (footer.ts) | console log | FIXED | qa1 |
| F3 | all pages | 375 (coarse pointers) | S2 | tap targets 12–30px: `.parts-serviceNavLink` 30px, `.parts-btnScrollTop` 17px, footer "Manage Cookies" `.parts-btnText` 12px, `.parts-btnBlock` filter pills 24px | measured rects | FIXED (rule in served CSS; `pointer:coarse` can't be emulated in this env — on-device check pending) | qa1 |
| F4 | menu overlay | all | S2 | CLOSE button: burgundy text on coral bg = 2.64:1 (bg-purple token now coral after Phase-1 remap) | computed ratio 2.64 | FIXED → burgundy bg + off-white text, 10.36:1 | qa1 |
| F5 | menu overlay | all | S2 | keyboard focus ring = UA default light blue rgb(168,199,250), off-palette; some elements get none via `focus:outline-none` | computed outlineStyle auto + screenshot | FIXED → `:focus-visible { outline:2px solid currentColor }` in decbricks.css; ring now rgb(128,0,32) | qa1 |
| F6 | / home hero | all | S2 | hero tag pills: 11–14px off-white text on coral bg = 3.93:1 (<4.5) | computed colours + size | FIXED → burgundy pills (`bg-darkPurple text-white`), 10:1 | qa1 |
| F7 | /about | all | S2 (latent) | TeamSection member img alt contained literal `Portrait of $<Fragment …>` (Fragment inside template literal) | source line 27 | FIXED → plain string alt | qa1 |
| F8 | /contact | 375 | S2 | no Cal link configured → `.cal-embed` mount reserved 700px as an empty beige box; fallback copy pushed to bottom behind cookie banner | contact-375-before-calfallback.png | FIXED → `[data-has-cal='false'] .cal-embed { display:none }`; island now shows fallback card (contact-375-after-calfallback.png) | qa1 |
| F9 | docs | — | S3 | `docs/AGENTS.md` is a stale duplicate (KH fonts, "contact BROKEN") and auto-loads for work under docs/ — misleads future sessions | file diff vs root AGENTS.md | OPEN (fix at end of pass) | — |
| F10 | / (theme-4 service slab) | 1920/all | S2 | Coral slab carried its own small text (eyebrow "PUSHING" 18px bold, body 17px = 3.93:1; no palette colour passes on pure coral) | home-1920-before-coralslab.png | FIXED → slab deepened to brick coral via existing `--brand-accent-deep` token: theme-4 `innerClass` → `bg-brick before:bg-brick` + new decbricks.css utilities; measured 5.13:1; 4-slab rhythm (off-white/beige/burgundy/brick) preserved (home-1920-after-brickslab.png) | qa2 |
| F11 | / (theme-4 slab) | all | S2 | "+N" badge: `bg-white/25` veil over coral + darkPurple text ≈ 2.9:1 | measured | FIXED → solid burgundy chip `bg-darkPurple text-white` (10:1), consistent with tag pills | qa2 |
| F12 | / (testimonials) | ≥1024 | S2 | "Minimap" widget + slash widget: coral bg with darkPurple frame/label = 2.64:1 | measured | FIXED → `bg-darkPurple text-white` (10.36:1), white cross kept | qa2 |
| F13 | header nav (runtime) | all | S2 | menu.ts toggled `bg-purple text-white` on the active nav pill = coral + white 12–14px = 3.93:1 (disagreed with Header.astro SSR styling) | measured 3.93 | FIXED → `bg-darkPurple text-neonGreen` (8.8:1), matching SSR pair | qa2 |
| V1 | all | 1280 | — | Verification: page transitions /about→/contact→… click + back/forward all correct (h1 swap, scroll reset, no `lenis-stopped` leak, 1× Cal widget + 1× sidebar, 0 console errors); earlier "no-link" was my selector hitting the 0px closed-menu duplicate | measurements | VERIFIED | qa2 |
| F14 | /about (hero) | all | S2 | Copy bug: hero body rendered "strategic execution.." — `about.astro` blindly appended `'.'` to a sentence already ending in one | rendered text | FIXED → period guard (`[.!?…]$` test before append); source copy untouched | qa3 |
| F15 | all pages | all | S3 | `#__nuxt` wrapper div = Nuxt-template relic, zero CSS/script references (verified in global.css + all scripts) | grep 0 refs | FIXED → wrapper + closing div removed from index/about/contact/services; dist divs balanced | qa3 |
| F16 | all pages | all | S3 | Text selection used the browser default blue — the last unbranded surface | n/a | FIXED → `::selection` burgundy/off-white in decbricks.css; rule verified in served CSS (highlight doesn't paint in headless screenshots) | qa3 |
| F17 | all pages | all | S3 | Default grey scrollbar clashed on burgundy/beige pages | about-1280-after-selection.png (visible) | FIXED → palette scrollbar (Firefox `scrollbar-color` + webkit pseudos, thin, brick hover) | qa3 |
| F18 | all pages | all | S3 | Long headings/paragraphs could orphan single words | n/a | FIXED → `text-wrap: balance` on h1–h6, `pretty` on p/li; computed balance/pretty verified live; no-op on w-max display words | qa3 |
| F19 | all pages (prod) | all | — | Font preload warnings on every page: investigated — preload URLs match @font-face exactly, fonts fetch at ~20 ms (start:20 dur:7–9), exactly 3 font requests (no double download), statuses all "loaded". Chrome heuristic false-positive tied to loader-delayed first paint. Left as-is (cosmetic console noise, no perf impact) | measured resource timings | INVESTIGATED — no action | qa3 |
| F20 | all pages | all viewports | S1 | Brand lockup baseline float & line-pitch disruption: `.font-brand` (`display: inline-flex; align-items: center;`) synthesized baseline from empty `::before` logo box, causing word to float 8.2–15.2px ABOVE baseline, detaching touching punctuation (commas, periods) which sat on parent baseline; line-pitch expanded and split (pitch delta 5.58px). | Baseline probe: 1280px deltaBefore = -8.16px (p), -9.33px (tagline) → 0.0000px after. Logo x-height offset = 4.5–5.0px → 0.05–0.08px after. Pitch: [5.58, 20, 20, 20] → [20, 20, 20] matching plain text. Crops in `docs/qa/shots/*-{before,after}.png`. | FIXED → true inline layout (`display:inline; vertical-align:baseline; line-height:inherit;`) + tuned `::before` cap-height size (0.90em/0.98em) and vertical-align (-0.15em) in `decbricks.css`. | qa4 |

## F20 Baseline & Optical Alignment Measurement Table (qa4)

| Context | Viewport | Metric | Before Fix | After Fix | Delta / Status |
|---|---|---|---|---|---|
| About Paragraph (`font-nohemi` 14.8px) | 1280px | Baseline Delta vs sibling text | -8.1562px | **0.0000px** | Exact baseline alignment ✅ |
| About Paragraph | 1280px | Sibling punctuation delta (comma) | -8.1562px | **0.0000px** | Comma attached to word ✅ |
| About Paragraph | 1280px | Logo vertical offset from word x-height | 4.5000px | **0.0541px** | Optically centered within 0.05px ✅ |
| About Paragraph | 1280px | Paragraph line pitch (consecutive tops) | `[5.58, 20, 20, 20]` (5 lines) | `[20, 20, 20]` (4 lines) | Bit-identical to plain text ✅ |
| About Tagline (`font-neuePower` uppercase) | 1280px | Baseline Delta vs sibling text | -9.3281px | **0.0000px** | Exact baseline alignment ✅ |
| About Tagline | 1280px | Period `.` baseline delta | -9.3281px | **0.0000px** | Period attached to word ✅ |
| About Tagline | 1280px | Logo vertical offset from word x-height | 5.0078px | **0.0810px** | Optically centered within 0.08px ✅ |
| Header Logo (`.structure-menu__logo`) | 1280px | Baseline Delta | -9.3281px | **0.0000px** | Exact baseline alignment ✅ |
| Upper Footer Logo (`.structure-footer .mb-40`) | 1280px | Baseline Delta vs Rise-to-top button | 9.3125px | **0.0000px** | Baseline aligned in flex row ✅ |
| Footer Copyright (`subheading text-darkPurple`) | 1280px | Baseline Delta | -9.3281px | **0.0000px** | Exact baseline alignment ✅ |
| Contact Smiley (`.parts-smileyText`) | 1280px | Baseline Delta | -12.8281px | **0.0000px** | Exact baseline alignment ✅ |
| Contact Services Hero (`.sections-servicesHero`) | 1280px | Baseline Delta | -12.8281px | **0.0000px** | Exact baseline alignment ✅ |
| About Paragraph | 375px | Baseline Delta | -9.3281px | **0.0000px** | Mobile baseline aligned ✅ |
| About Paragraph | 375px | Line Pitch | `[5.80, 22, 22, 22, 22, 22, 22]` | `[22, 22, 22, 22, 22, 22]` | Mobile line pitch restored ✅ |
| About Tagline | 1920px | Baseline Delta | -12.8281px | **0.0000px** | 4K baseline aligned ✅ |
| All contexts | all | Text wrap / overflow | 0 wraps, 0 overflow | 0 wraps, 0 overflow | `white-space: nowrap` preserved ✅ |

## Phase 0 — redesign-polish stabilise (2026-11-13, plan `docs/plans/redesign-polish-plan.md`)

| ID | Page | Viewport | Sev | Description | Evidence | Status | Fix commit |
|---|---|---|---|---|---|---|---|
| F21 | /contact | all | S2 | Cal fallback card showed dev-facing copy "Online booking is not configured yet." (A2 unconfigured) + "Tell us what you want to build." duplicated in Start-a-Project body | probe /tmp/opencode/p0-t1.cjs RED 2 → GREEN | FIXED → visitor-neutral "Online booking is coming soon." both envs (dev signal stays in console.warn + sr-only status); Start-a-Project body "Book a call above, or send the form below — we reply to every message." | phase 0.1 `e689e73` |
| F22 | all (fixed overlay) | 375/1280 | S1 | Cookie banner covered first-viewport content (/contact "Book a Call" + H2) at scroll-0 and footer interactives at scroll-end | probes p0-t2.cjs / p0-t2-desktop.cjs RED → GREEN 7/7 + hits:[] | FIXED → `--cookie-safe-area` reservation (pre-paint via inline head script + 186/269px CSS defaults; cookies.ts re-measures for manage mode): `.page` bottom pad, viewport heroes shrink, ServicesHero fills viewport, <lg nav row mt 50→10, lg nav translate. Mid-scroll overlap of scrolling content accepted (inherent to fixed overlays; one-tap dismiss) | phase 0.2 `eee3573` + 0.2b `02734dd` |
| F23 | all (footer) | all | S2 | Footer webgl band coral #D45060 with burgundy text = 2.64:1 | probe p0-t3.cjs RED 3 samples → GREEN 10.36:1; shots `docs/qa/shots/footer-band-after-t3{,-settled}.png` | FIXED → band burgundy `--brand-bg-dark` (shader samples computed bg = single source), footer text Off-White 10.36:1, trail `rgb(188,61,77)` `--brand-accent-deep`. Transient trail-block rectangle in shots decays naturally (not a defect) | phase 0.3 `e0e1871` |
| F24 | all | all | S2 | Tap rects: R12 promotion to ALL pointers of the 44px minimum (F3 covered coarse only; desktop pills/scroll-top were 30/17px); hit-areas from F3 (+5px) insufficient for wrapped rows | probe p0-t4.cjs GREEN 16/16 h≥44; shot `docs/qa/shots/tap-targets-t4-contact-pills.png` | FIXED → `.parts-serviceNavLink/.parts-btnBlock/.parts-btnScrollTop/.parts-btnText/.parts-scrollButton` min-height 44px all pointers (padding, not type size — compact look kept). NOTE: grew pills → re-overlapped cookie banner; resolved in F22 phase 0.2b. Deferred to Phase 2: header Menu 36px / Close 34px / skip link 40px | phase 0.4 `58b4a4b` |
| F25 | / | all | S3 | Plan hypothesised unreserved video slot causing CLS — disproven: slot aspect-resolved (`aspect-video-mobile` + `sm:aspect-video`), player stable 768×432 | probes p0-t5-*; transform-vs-layout CLS experiments (ancestor/self transforms emit NO shift entries) | INVESTIGATED — residual CLS = t≈350ms font-swap reflow behind opaque loader + t≈3.5s deliberate GSAP entrance choreography (0.19). No code change; **CLS ≤0.01 metric moved to Phase 7** (font metrics / entrance gating). Pre-paint cookie reservation removed the banner-appear shift (contact@375 0.1→0.008) | phase 0.2b `02734dd` |
| F26 | all heroes | 375/1280/1920 | S3 | R8 "display word clipped at both edges" — does not reproduce; all giant words bleed at most ONE edge (intended motif) | probes p0-t6-red/-1920/-375 GREEN | NO DEFECT — hero composition goes to Phase 3 as planned | — |

