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
