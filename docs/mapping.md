# Component mapping — Decbricks ⇄ 1minus1 template

## Page assemblies

### /services (reference, `src/pages/services.astro`)
`Base` → `#__nuxt > main.layout` → `Loader` → `div.page.page-services` → `Header`, `ServicesHero`, `section.sections-servicesList[data-theme=light]` (white island → `max-w-1850 flex-col gap…` → `ServiceBlock ×4`), `ServicesSidebarNav`, `ServicesClients`, `ContactForm`, `Footer`; siblings `CookieBanner`, `TransitionOverlay`; `<script>import '../scripts/main'</script>`.

### /about (NEW) — same shell
| Slot | Component | Change |
|---|---|---|
| hero | `ServicesHero` | add props `{ srTitle, headingParts, body, navItems }`; defaults = current services values. About: srTitle "About Decbricks", headingParts ['About','Decbricks'], body = tagline + first paragraph |
| hero in-page nav (`.parts-serviceNavLink`) | inside ServicesHero | driven by `navItems` (id + label) |
| content island `max-w-1850 …` | **NEW `AboutBlock.astro`** cloned from `ServiceBlock` chrome (4 corner squares, giant numeral, alternating layout, `border-darkestPurple/15`) minus video/capabilities/projects | content from `src/data/about.ts` (verbatim from docs/about-section-data.md) |
| block media column (all 7 sections) | `AboutBlock.astro` | same classes as ServiceBlock's video column (`lg:w-260 xl:w-300 3xl:w-360 4xl:w-410` + `aspect-4/5 rounded-40 rounded-tr-none`), `<Picture formats={['avif','webp']} fallbackFormat="webp" quality={50}>`; `image?: {src, alt, position?}` in `about.ts`; tags row dropped (no data). See `docs/plans/about-pictures-plan.md` |
| side nav | `ServicesSidebarNav` | add props `{ items, ariaLabel }`; default = SERVICES |
| clients strip | `ServicesClients` | **omit** on About (1minus1 logos; brief doesn't list it). Verify `services-page.ts` null-guards `.sections-servicesClients` |
| form | `ContactForm` | add props for smiley copy + heading words (currently hard-coded "Begin your / story", games copy) |
| footer | `Footer` (`FooterCta`, `FooterNav`, `FooterContact`, `FooterStatus`, `FooterWordmark`, `FooterLegal`, `FooterWebgl` + `src/data/footer.ts`) | Concept A "Foundation": brick-laid FK Raster wordmark, data-driven nav/contact/status (empty slots hide until owner data supplied), `cta="auto"` omits redundant CTA on `/contact` (emits `<h2 class="sr-only">Site footer</h2>`) |

About section list → blocks (numeral / eyebrow / H2 / content):
01 Intro — "Who we are" · H2 "Building Technology. Empowering Businesses. Driving Growth." (the doc's `# About Decbricks` is the page H1 via hero) — 2 paragraphs + "technology should serve a purpose" paragraph
02 "What Drives Us" · 03 "Our Mission" · 04 "Our Vision" · 05 "Our Values" (5 items as H3: Innovation, Commitment, Collaboration, Quality, Growth) · 06 "Our Experience" · 07 "Our Philosophy" (+ closing line "Decbricks. Building ideas into reality.")
Sidebar items = the 7 blocks (labels: Who We Are, What Drives Us, Mission, Vision, Values, Experience, Philosophy). Check `services-page.ts` for any assumption of exactly 4 items (`li[data-slot]`, index maths).

### /contact (NEW, replaces broken `contact.astro`)
Same shell as About. Content island holds, in order, as blocks with the same card chrome:
1. **Book a meeting** — Cal.com inline embed (`CalEmbed.astro` + `scripts/cal-embed.ts`)
2. **Let's Start Something Great.** (H2) / **Tell us what you want to build.** (H3) / the two paragraphs (verbatim from brief §4.2 B — **A15: brief missing, placeholder nav sentence until supplied**)
3. **Meet the Team** — `TeamSection.astro` (single component; separate `TeamCard.astro` merged into it — deviation logged in Design-handoff), data `src/data/team.ts`
4. **Contact Numbers** — `ContactNumbers.astro`, data `src/data/contact.ts`, `tel:` links
then `ContactForm`, `Footer`. Hero: srTitle "Contact Decbricks"/headingParts ['Contact','Us'].
Sidebar items: Book a Call, Start a Project, Team, Call Us.
Blocks 3+4 hide while their arrays are empty (dev warnings; sidebar item no-ops).

## Class hooks scripts depend on (do not rename; null-guard)
- services-page.ts: `.sections-servicesHero`, `.sections-servicesHero__trail`, `.sections-servicesList`, `.sections-servicesSidebarNav`, `.sections-servicesSidebarNavItem(__bullet|__index|__label|__text)`, `.parts-serviceNavLink(__label)`, `.parts-autoplayVideo`, `.sections-servicesClients`, `.structure-loader`, `.structure-menu`, `li[data-slot]`
- contact.ts: `.sections-contactForm`, `.parts-form`, `.parts-formCheckbox`, `.part-btnPrimary__text`, `input/textarea[name]`
- **VERIFIED (Phase 0):** services-page.ts imports `SERVICES`/`CLIENT_LOGOS` directly and drives all ScrollTrigger + sidebar/hero active-state logic from that array (`SERVICES[0].id`, `SERVICES.forEach`, `SERVICES[length-1]`) — so `initServicesPage()` is not N-generic as-is; Phase 4 adds an optional per-page items override, defaulting to the current import. `.sections-servicesClients` and `.parts-autoplayVideo` are null-guarded (early returns; `CLIENT_LOGOS.length <= slots.length` → rotation off). About/Contact must reuse the `.sections-servicesList` class on their content-island `<section>` for the sidebar script, and keep `#contact` on the ContactForm section.
- contact.ts form logic VERIFIED: client-side validation only; "success" is cosmetic (`Message Sent!` + reset). Phase 5 adds real fetch submission.
- ContactForm.astro VERIFIED: `smileyCopy` prop already exists; "Begin your / story" + "Get In Touch" hard-coded; reCAPTCHA note is decorative text with no script — drop in Phase 5 rewrite or keep as copy.
- footer.ts: `.structure-footer(__inner|__wordmarkRow|__wordmark|__copyBtn|__toast|__clock|__brick)`, `.parts-btnScrollTop`, `button[aria-label="Manage Cookies"]`; retired `.structure-footer__marquee` / `initSocialPillsRandomLayout` (null-guarded); `FooterWebgl.astro` isolates the global `canvas.webgl` pair in unchanged DOM order for `reattachCanvases()`
- testimonials.ts (home): `.tst-band` — spotlight hooks `.tst-*` (card/rail/controls). Old drag-canvas hooks `.sections-testimonials*`, `.parts-testimonialCard`, `.parts-testimonialMiniMap*`, `.parts-marqueeCursor` were removed WITH the component rewrite (deliberate no-rename-rule exception; nothing outside the section queried them — verified by grep at rewrite time). Amendment A 2026-11-14 (plan `docs/plans/testimonials-upgrade-plan.md` §10, owner-locked): the rail is a LISTBOX (`.tst-railList` role=listbox, `data-lenis-prevent`, `overscroll-behavior: contain`) capped at exactly 6 rows via tokens (`--tst-railRowH: 52px`, `--tst-railGap: 8px`), rows are `div.tst-railOpt` (renamed from `.tst-railBtn`) with `aria-selected` + roving tabindex; `<768` it becomes a horizontal scroll-snap strip (same row content); scroll cues are `.is-fadeTop`/`.is-fadeBottom` mask-image classes + `.tst-railMore` button (`+N more`, count computed, hidden at end, click = one page). Auto-scroll on quote change: `scrollOptionIntoView()` — direct scrollTop/scrollLeft math on the list, never the page. Two-phase swap via `.tst-card.is-leaving` (140ms; reduced motion completes synchronously). Card is content-sized: stage height = tallest quote's natural content (hidden height:auto clones — card scrollHeight tracks the stage itself), NO floors; author row pinned (`.tst-cardInner` flex column + `.tst-attr` margin-top:auto). DELETED across upgrade + amendment: `.tst-qmark`, `.tst-railTitle`, `.tst-railQuote`, `.tst-railMeta`, `.tst-railToggle*`, disclosure (`is-collapsed`/`mqMobile`), P6 rail pin/scroll, `.tst-dots`/`.tst-dot` (dots superseded by the strip). Kinetic hover (P6, kept): `.tst-cardInner` — visible card + MomentumHover mount.
- services.ts (home): `.sections-services`, `.parts-serviceCard(__inner)`
- main.ts: `.sections-hero` (home), `.sections-servicesHero`; page transitions via `page-transition.ts`
- Anchors: block `id` = nav `href="#id"`; heading `id="{id}-heading"` with `aria-labelledby` on the `<article>`.

## Other template pieces (not part of the brief but they ship 1minus1 identity)
`Hero`, `CaseStudies`, `ServicesClients`, `index.astro`, `services.astro`, `data/services.ts`, `404.astro`, `the404game.astro`, `Header` logo — see open-items.md "Scope decisions". (Footer left this list in Footer Phase 1–6: template marquee/social links removed, copy/nav/contact data-driven via `src/data/footer.ts`; Testimonials left in 2026-11-13 P1.)

## Brand typography layer (FONT-SWAP-PROMPT Option A, 2026-11-10)
- `src/lib/brand.ts` — `BRAND`, `brandify(text)` (HTML-escape → wrap every `Decbricks` word in `<span class="font-brand">`), `hasBrand`. Use at RENDER points; data strings stay verbatim.
- `src/components/BrandText.astro` — `<BrandText text className?>` convenience wrapper (Fragment inline / span when `className` given).
- `.font-brand` (decbricks.css) — FK Raster Roman Compact, 400, `text-transform:none`, `font-size:1.06em`, `line-height:1`, `white-space:nowrap`. 2026-11-11 owner decision: FK Raster ALSO carries the display/numeral role (`--font-offBit`/`--font-offBit101` → `.heading-2xl/3xl/3.5xl/4xl`, giant numerals); Departure Mono keeps only the small `--font-mono` role and is no longer preloaded (fallback-only).
- Type hooks (unchanged names, repointed values): `.font-neuePower`→Bricolage, `.font-nohemi`→Hanken, `.font-offBit`/`.font-offBit101`/`.font-mono`→Departure Mono. Semantic aliases `--font-heading/-body/-display/-brand/-mono` in `decbricks.css`.

### Brand inventory (every visible "Decbricks")
| Where | Treatment |
|---|---|
| Header wordmark | `<span class="font-brand …">Decbricks</span>` — 2026-11-12 `.font-brand` = **logo lockup** (`::before` logo + FK Raster name); sized 22/26px |
| Footer wordmark | Brick-laid `<div class="font-brand structure-footer__wordmark" translate="no">Decbricks</div>` (`clamp(62px, 22.8cqi, 424px)`, centered `0.30em × 0.275em` cream crest, `viewBox="0 0 96 48"` running-bond SVG fill via `background-clip: text`, stepped `clip-path` `.is-built` reveal) |
| Footer copyright | `brandify('© 2026 Decbricks. All rights reserved.')` with `translate="no"` on `.font-brand` lockup |
| Hero giant word(s) | `brandify(headingParts[*])` via `set:html` (~6% wider in Departure Mono — visual check §A) |
| Logo lockup | `.font-brand::before` = `/brand/logo.webp` via `--brand-logo-w/h` (**1.2em/1.1em**, aspect 1.088:1, mark v2 red blob); dark/coral contexts (`.structure-menu`, `.sections-servicesHero`, `.sections-contactForm`, `.structure-footer`) get the **cream variant** `/brand/logo-cream.webp` (owner decision 2026-11-12 — red mark fails 2.17:1 on burgundy, 1.22:1 on the coral footer band); opt-out `.font-brand--no-logo` (**zero opt-outs in use**); giant-context cap hook = set `--brand-logo-w/h` on a context class (none needed today: no giant brand contexts exist — hero H1s have no brand word) |
| Hero / smiley copy | `brandify(body/smileyCopy)` on sr-only + visual spans |
| ServicesHero | `brandify(srTitle, headingParts[0/1], body)` |
| AboutBlock | title h2, first/rest paragraphs, value names/texts, closing line |
| ContactBlock | title h2, h3 |
| TeamSection | member name/role/bio |
| ContactNumbers | labels + display strings |
| CalEmbed fallback | fallback title + help line |
| ContactForm | smiley copy (sr-only + visual) |
| contact.astro | "start a project" body |
| `scripts/smiley-text.ts` | GSAP SplitText `type:'lines', deepSlice:true` preserves nested `.font-brand` spans — no splitter change. If config ever becomes `chars`, brand-aware post-processing required. |
| NOT stylable (by rule) | `<title>`, meta/OG/Twitter, JSON-LD, `alt`, `aria-label`, mailto subjects |
| Gate | `npm run check:brand` (scripts/check-brand.py) must PASS before shipping |
