# Redesign audit — measured evidence (2026-11-12, dev server :4321)

Probes: `/tmp/opencode/audit-main.cjs` (5 routes × 375/768/1280/1920), `audit-behav.cjs` (transitions, menu, cookie, loader, Cal, CLS source), `audit-shots.cjs` (section shots). Raw JSON: `/tmp/opencode/audit.json`. Screenshots: `docs/plans/audit/*.png`.

## Machine findings (all routes × 4 viewports unless noted)

| # | Area | Result |
|---|---|---|
| A1 | Horizontal overflow | **0 everywhere** (5 routes × 4 widths; offenders list empty) |
| A2 | Headings | 1× h1 on every route, **0 level skips** |
| A3 | Console errors | **0** on /, /services, /about, /contact; /404 logs only its own 404 status |
| A4 | Failed requests | **0** (except /404's own status) |
| A5 | Fonts | 3 preloaded faces load (Bricolage/Hanken/FK Raster); Departure Mono ships un-preloaded (by design) |
| A6 | Focus-visible | Tab stops sampled 12/page: **0 without visible ring** (outline currentColor) |
| A7 | Lockup baseline | `.font-brand` inline; heights match sibling text (F20 fix holds) |
| A8 | Contrast (computed sweep) | Real fails: **footer coral band × burgundy text ≈2.1–2.6:1** (documented accepted fail, tokens §2c-7). All other flags = false positives (hidden menu-overlay links, sr-only, ghost display words, fg==bg point-hits — classified in qa2) |
| A9 | Tap targets <44px | `Menu` 36px, `Close` 34px, skip link 40px, sidebar `.parts-serviceNavLink` 30px, **"Scroll To Explore" 12–16px**, **"Rise to the top" 12–16px**, **"Manage Cookies" 16px**, "Video progress" 10px (fine-pointer rects; F3 added invisible hit-areas to 3 of these for coarse pointers) |
| A10 | LCP (dev, no throttle) | 92–188 ms — healthy; prod budgets in plan §7 |
| A11 | CLS | home **@768 = 0.0344** (one shift 0.0398 from `DIV.relative` t≈356ms — hero video card slot), contact **@375 = 0.0117**; all others <0.009 |
| A12 | Oversized payloads | services block videos **2.5–2.8 MB each ×4**, home hero video 747 KB, `computer-back-2000.webp` 623 KB, three.js dev chunk 1.6 MB (prod ≈557 KB min / 140 KB gzip) |
| A13 | Loader | **≈3.0 s** brand loader before hero on first visit |
| A14 | Page transitions | /→/about→/contact→/services + back/forward: h1 swap, scroll reset, canvases 1280×900 reattached, 1 sidebar, **0 errors** |
| A15 | Cookie banner | Fixed bottom-right card **overlaps hero subheading (375)** and content blocks on desktop; wrapper covers viewport, dismissable |
| A16 | Cal.com | No link configured (A2) → embed hidden, fallback card shown. **Fallback copy reads "ONLINE BOOKING IS NOT CONFIGURED YET."** (dev-facing copy visible to visitors) + duplicated sentence in Start-a-Project block |
| A17 | 1minus1 content | 3 text hits on `/` (hero subhead "…agency for video games", work band, testimonial); /services hero "games studios and publishers" + projects/client logos + all block media = 1minus1 (C1/B2) |

## Ranked findings (design + UX critique)

| ID | Page | Sev | Finding | Evidence | Phase |
|---|---|---|---|---|---|
| R1 | / | S1 | Hero collage reads broken: tilted video card overlaps the display word, second display word clipped by viewport, no focal point | home-1920-hero.png, home-375-hero.png | 3 |
| R2 | / | S1 | ~2 screens of empty burgundy between hero and service slabs — the page's largest "section" is empty | home-1280-full.png | 3 |
| R3 | /services | S1 | All 4 block videos are 1minus1 game-studio media; Strategy block video is **neon green** (#b0ff00-family) — palette-breaking artifact | services-1280-full.png | 4 (+A12 asset) |
| R4 | /, /services | S1 | 1minus1 copy everywhere: "Award-winning creative agency for video games…", "WE WORK WITH THE BEST IN THE GAMES INDUSTRY", services hero, projects pills, client logos, testimonials | C1/B2, A12 | blocked on owner copy (every phase treats structure only) |
| R5 | /contact | S2 | Fallback copy visible: "ONLINE BOOKING IS NOT CONFIGURED YET." + duplicated "Tell us what you want to build." sentence | contact-1280-full.png | 0 |
| R6 | all | S2 | Tilt-collage overused: every major section (slabs, cards, form, marquee) is rotated — nothing sits straight; scan path chaotic; template-like at full-page view | home-1280-full.png | 1–4 |
| R7 | / | S2 | Testimonials sage panel ~60% empty (one quote card + minimap in a full-bleed sage band) | home-1280-full.png | 4 |
| R8 | all | S2 | Giant display words clipped at both edges on every hero (DISTINCT/OUR WORK/BEGIN YO/CONTACT) — bleeds past any alignment rhythm; CTA of section unreadable | home-1920-hero.png, contact-1280-full.png | 3 |
| R9 | all | S2 | Cookie banner overlaps primary content (hero subhead @375, "JUMP TO" pills) with no spacing awareness | home-375-hero.png, contact-1280-full.png | 2 |
| R10 | /contact | S2 | Form fields are pale coral/pink fills on cream card — washed, low field affordance; label contrast borderline | contact-1280-full.png | 6 |
| R11 | /services | S3 | Footer burgundy text on coral band ≈2.1:1 (documented; also affects all pages) | tokens.md §2c-7 | 2 |
| R12 | all | S3 | Tap targets <44px (Scroll To Explore, Rise to top, Manage Cookies, sidebar links 30px) | A9 | 5 |
| R13 | / | S3 | Loader 3.0s before any content; every first visit pays it | A13 | 2 |
| R14 | / | S3 | CLS 0.034 @768 (hero video slot) | A11 | 7 |
| R15 | /services, / | S3 | 2.5–2.8 MB block videos; 623KB poster image | A12 | 7 |
| R16 | /404 | S3 | Clean, but dead-end: "OUR SERVICES" is text link style, no other recovery path | 404-1280.png | 6 |
| R17 | /about | — | **Strongest page**: media cards, values grid, rhythm work. Keep as the reference for the system | about-1280-full.png | — |

## Designer critique (taste-skill checklist applied)

- **Generic/templated**: the tilt-collage is the only compositional idea; repeated on every section it stops being a signature and becomes noise. The 1minus1 case-study/testimonial sections are stock AI-template patterns (card grids + minimap widget).
- **Flat**: surface hierarchy relies on one border + flat fills; no elevation system, so inverted burgundy bands, beige islands and white cards all compete at the same depth. Coral used as section background (footer) vs as accent (cards) with no rule.
- **Type**: giant FK Raster display is strong, but it's clipped both sides on every hero with no anchor; Bricolage/Hanken roles are clean; Departure Mono is underused (only fallback) — mono labels would give the "brick/pixel" identity a voice.
- **Imagery**: About's halftone set proves the direction works (image_2 bust is excellent). Home/services lean on 1minus1 game-media that fights the palette (neon green video, dark gun imagery).
- **Consistency**: buttons exist in ≥3 shapes (pill, block, text+arrow); radii mix 40/0/40/40, 20, 24, 12, 999 without a scale; section paddings vary 40–95px per breakpoint ad hoc.
