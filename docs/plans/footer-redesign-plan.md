# Footer redesign plan — "Foundation" (brick-laid wordmark)

Status: **PLAN ONLY — nothing under `src/`, `public/`, `package.json` or config was touched.** Written 2026-11-13.
Evidence: `docs/plans/audit/footer-audit.json` (5 routes × 7 widths), `docs/plans/audit/footer-behav.json` (swap gauntlet, focus walk, scroll cost), probes in `docs/plans/audit/probes/`, screenshots in `docs/qa/shots/footer-base-*` and `footer-proto-*`, prototypes in `docs/plans/proto/footer-{a,b,c}/`.

---

## 1. Executive summary

1. The footer is already burgundy with Off-White text: **10.36:1 measured at all 35 route × width samples**. The "coral 2.64:1" fail in the older docs (tokens §2c-7, `Footer.astro` comments, `decbricks.css`) is stale. It was fixed in F23. The legal-link 404s are also gone, because the links were removed. The docs and code comments need correcting.
2. The real problem is **content and character**, not colour. The footer has 3 controls (Rise to the top, Play Our 404 Game, Manage Cookies) and no site navigation, CTA, contact data or legal links.
3. Its visual centre is a clipped template marquee ("NOVATI…") of adjectives that say nothing about Decbricks.
4. The WebGL canvases survive client-side navigation: 6 consecutive swaps, 2 canvases connected at 1280×800 each time, 1 footer, 0 page errors. The footer does own them (see §5.3), so the redesign must preserve them.
5. **Recommended concept A "Foundation"**: a giant FK Raster "Decbricks" wordmark *laid brick by brick* on scroll. Each letter is filled with a running-bond brick course. It sits on the existing 25 px pixel grid and WebGL cursor trail, under a closing CTA and a real sitemap/contact/status block.
6. Seven phases, each shippable alone (P0–P6). P0 is a safety net with no visual change.
7. No new dependencies. Everything is CSS + `Intl` + the existing GSAP/Lenis. All unknown owner data (Cal, phones, email, socials, legal, timezone, availability) becomes a typed entry in `src/data/footer.ts` that hides gracefully, plus an open-items entry.
8. Three questions block approval: concept, retiring the marquee (C9), and the studio-time / availability policy (§9).

---

## 2. Findings (ranked)

Evidence names refer to files in `docs/qa/shots/` and `docs/plans/audit/`.

| # | Sev | Finding | Evidence |
|---|---|---|---|
| F1 | S1 | **Dead-end footer.** Tab order inside it is exactly: Rise to the top → Play Our 404 Game → Manage Cookies. There is no link to About, Services, Contact, legal, email or phone, and no closing CTA. | `footer-behav.json › focus`; `Footer.astro:8-246` |
| F2 | S1 | **Generic centrepiece.** The "Innovative / Distinct / Authentic / Creative / Brave" marquee is `aria-hidden`, decorative and clipped at every width ("NOVATI…", "…DVATIVE"). The footer never says who Decbricks is, which is the template tell the owner flagged. | `footer-base-home-1280.png`, `footer-base-home-375.png`, `footer-base-after-swaps-trail-1280.png` |
| F3 | S2 | **Flat hierarchy.** Everything is 12 px Departure Mono caps, so no element is the hero. The Decbricks lockup appears twice (the header lockup floats over the footer top, and the footer has its own top-right lockup). | same shots |
| F4 | S2 | **Identity data absent.** The footer has no email, phone, socials (A8, `SITE.socials=[]`) or legal links (A11). The schema.ts `contactPoint` / `sameAs` exist, but the footer cannot show the same values. | `site.ts`, `contact.ts`, `schema.ts:10-26` |
| F5 | S2 | **Inconsistent bottom edge.** First load at 1280×800 shows an off-white band under the footer (cookie safe-area reserve). After 6 swaps the same area is burgundy and the WebGL trail is visible. The WebGL plane and the reserved area disagree on first load. Verify in P0. | `footer-base-home-1280.png` vs `footer-base-after-swaps-trail-1280.png` |
| F6 | S2 | **Tap target.** "Play Our 404 Game" is 150×34 px at ≤768 (below the 44 px policy). Scroll-top is 44 px and Manage Cookies passes through the F3 hit-area. | `footer-audit.json › tapFails` (320/375/768) |
| F7 | S2 | **Semantics.** `role="text"` on the copyright `<span>` is non-standard (`Footer.astro:53`). The `<nav>` at `:56` has no accessible name and wraps a game link plus a cookie button, which is not navigation. The scroll-top has duplicate visible and absolute labels, with one `aria-hidden`. | `Footer.astro` |
| F8 | S3 | **Dead code and cost.** `footer.ts` carries ~120 lines of `initSocialPillsRandomLayout` for pills that no longer exist (7.3 KB source / 2.3 KB gz in total). The marquee tween runs for 45 s on a loop with no pause control (WCAG 2.2.2 gap, mitigated by `aria-hidden` and the reduced-motion guard). `will-change: transform` is permanent on `__inner`. | `footer.ts`, `Footer.astro:5` |
| F9 | S3 | **Stale docs and comments.** `Footer.astro` (header comments), `decbricks.css:66-70` and tokens §2c-7 still describe a "coral band" and "accepted fail". The band is `--brand-bg-dark`, and `.webgl-background` keeps the legacy `bg-purple` class, overridden by CSS. | `decbricks.css:773-787`, `findings.md` F23 |
| F10 | S3 | **Mobile.** At 375 the copyright wraps to 2 lines and the legal row is cramped. The footer is only 384 px tall and mostly the clipped marquee. | `footer-base-home-375.png` |
| F11 | Info | **Works today:** 0 horizontal overflow; 0 page errors (only SwiftShader "GPU stall" perf warnings from headless GL, and /404's own 404 status); focus ring is a visible 2 px Off-White outline; the swap gauntlet passes; there are no long tasks in the footer scroll window. | `footer-audit.json`, `footer-behav.json › swaps/cost` |

**What makes it feel template-like:** an adjective marquee, equal-weight mono labels, no brand moment, no CTA, no information scent.

**Web Interface Guidelines pass** (rules fetched live from `vercel-labs/web-interface-guidelines`):
- `Footer.astro:53` non-standard `role=text`.
- `Footer.astro:56` unlabeled `<nav>`.
- `Footer.astro:5` permanent `will-change`.
- `footer.ts` marquee needs a pause or stop if it stays (autoplay >5 s).
- No `translate="no"` on the brand word, which belongs on the wordmark.
- No `touch-action: manipulation` on footer controls.
- No `text-wrap: balance` (there is no heading yet).
- Labels use caps via CSS, which is fine.
- Hover states exist, but the 404 pill has no distinct `:active` state.

**Measured at runtime:** `footer.ts` script time during a 55-step scroll through the footer was 123 ms. Task time was 2.2 s, dominated by software-GL WebGL rendering in headless Chrome (not representative). The real-device baseline is captured in P0.

---

## 3. Concept decision

### Prototypes (static, real fonts and logo, served over http for screenshots)

| | 1440 | 375 |
|---|---|---|
| **A · Foundation** | ![A 1440](../qa/shots/footer-proto-a-1440.png) | ![A 375](../qa/shots/footer-proto-a-375.png) |
| **B · Control Room** | ![B 1440](../qa/shots/footer-proto-b-1440.png) | ![B 375](../qa/shots/footer-proto-b-375.png) |
| **C · Brick Wall** | ![C 1440](../qa/shots/footer-proto-c-1440.png) | ![C 375](../qa/shots/footer-proto-c-375.png) |

Prototype artefacts, not design faults:
- A's mark was capped to 0.3em after the first pass (giant-context hook).
- B uses olive on sage for micro-labels, which measures **4.11:1 and fails AA**. The real build uses burgundy on sage.
- C's running-bond offset is crude.

### Concepts

**A · Foundation (recommended).**
- *Thesis:* Decbricks builds, so the page ends with the thing being built.
- *Composition:*
  - Closing CTA headline (Bricolage 700) with Start a project and Book a call.
  - A hairline, then four columns: Pages / Company / Reach / Studio time.
  - A full-bleed FK Raster wordmark. Each glyph is clipped from a running-bond brick tile (Off-White bricks, burgundy mortar).
  - A legal row with the stacking-bricks back-to-top control.
- *Surface:* burgundy `#800020` with a 25 px hairline grid at 6% Off-White. The grid matches the shader's `uPixelSize: 25`, so the CSS grid and the WebGL cursor trail look like one system.
- *Type:* FK Raster for the wordmark and the clock numerals (display and numerals). Bricolage for the CTA and links. Hanken for the status pill. Departure Mono for micro-labels only.
- *Motion:* the wordmark is laid in 14 stepped courses once, when ≥20% is in view. The existing scrub reveal (`__inner` yPercent −100→0) and the WebGL trail are kept.
- *Signature moment:* the brick-laid wordmark.

**B · Control Room.** Status-first: a sage panel with live time, availability, copy-email and a pulsing pixel bar; an indexed sitemap strip; FK Raster headline. It is the most functional, but it feels like a SaaS status page and has no brand moment beyond the headline. Departure Mono carries too much text (a mono-overuse tell).

**C · Brick Wall.** Beige field and the sitemap as a running-bond wall of colour bricks. It is playful and the most "bricks", but it **leaves the burgundy WebGL footer plane** (the shader samples the computed bg, so trail and colours would need a rework). It also reads as a grid of identical tiles (the SaaS-card kit), and the sage / olive / coral tile mix gets busy.

### Recommendation: A
- It is the only concept whose *signature* is unmistakably Decbricks. It uses the existing brand face (FK Raster), the existing logo lockup, and the pixel / brick language.
- It keeps the burgundy surface, so the WebGL footer plane, trail colour and contrast model need no rework. Worst-case contrast (Off-White on the trail colour) is 5.13:1.
- Cost is small: one clipped text element, one tiling SVG, one IntersectionObserver.
- **Fallback if you disagree:** "A-lite" — same layout, but the wordmark is solid Off-White with no brick fill and no stepped reveal. It is cheaper and zero-risk for paint, and the brick fill can be added later. Alternative direction: C's brick-wall nav as a *module inside A* (no surface change).
- **Borrowed from C:** the stacking-bricks back-to-top and scroll-progress control.
- **Borrowed from B:** the live-time and availability block, plus copy-email with a toast.

### Rejected ideas

| Idea | Why |
|---|---|
| Keep the marquee | Template adjectives; clipped; fails WCAG 2.2.2 intent; owner sign-off needed (C9) |
| Social pills with random layout (existing code) | Overlap risk; needs socials that do not exist (A8); remove the code |
| Light / beige footer (C) | Breaks WebGL footer-plane colour assumptions |
| Cursor-reactive brick physics / custom cursor | Cost, a11y, and the WebGL trail already does this |
| Keyboard shortcuts, language / region note, "skip to footer" | Low value; the site already has a skip link |
| Trust / credentials strip | No real data (A14) |
| Moving the canvases out of `.page` (as default) | See §5.3 |

---

## 4. Footer design spec (concept A)

### 4.1 Layout grid

The container is unchanged: `mx-auto w-full max-w-1920`, `px-20` below lg and `lg:px-36` from lg up. Spacing unit is 1 px (`--spacing: .0625rem`). New rules go in `src/styles/decbricks.css` under a `.structure-footer …` scope.

| Breakpoint | Layout | Approx. height |
|---|---|---|
| 320–455 | CTA stacked (H2 46px, buttons full width stacked); columns 2-up (Pages / Company), Reach full width, Studio time full width; wordmark = container width (font-size ≈ 23.4vw, min 80 px); legal row wraps, copyright on its own line, links in a 2-col grid, back-to-top right | ~1100–1250 |
| 456–767 | As above, buttons inline, 2-up columns | ~1050 |
| 768–1023 | CTA row (H2 + buttons wrap); columns 2×2 (4 col from 900); wordmark full width; legal row inline | ~1150 |
| 1024–1439 | 4 columns; CTA row (H2 left, buttons right, baseline-aligned); WebGL canvases visible | ~1250 |
| 1440–1919 | As 1024, H2 clamp(44px, 7.4vw, 128px) | ~1360 |
| 1920 / 2560 | Content capped at 1920 and centred; wordmark capped at font-size 460 px (≈1910 px wide); the footer background stays full-bleed | ~1450 |

Rhythm: section gaps `clamp(48px, 6vw, 96px)`, column gap 32 px, link rows 6 px vertical padding (so each row is ≥44 px). One footer is 1–2 screens tall at 1440×900, per the taste rules.

### 4.2 Type roles

| Role | Face | Size / weight |
|---|---|---|
| CTA H2 (`Let’s Start Something Great.` — **existing copy, verbatim** from `contact.astro:91`, curly apostrophe) | Bricolage Grotesque 700, `text-wrap: balance`, tracking −.025em | clamp(44, 7.4vw, 128) |
| Column links | Bricolage 500 | 20 px / 1.2 |
| Column headings (H3) | Departure Mono, caps, Off-White | 12 px |
| Wordmark | `.font-brand` (FK Raster, logo lockup, `translate="no"`) | clamp(88px, 23.4vw, 460px) |
| Clock | FK Raster tabular numerals | clamp(48, 5vw, 84) |
| Status pill, buttons | Hanken 500 / Bricolage 600 | 15–16 |
| Legal row | Departure Mono 12 px caps (existing `u-kicker`) | 12 |

Headings: H2 for the CTA block and an `sr-only` H2 ("Site footer") when the CTA is hidden. Column headings are H3, so there are no skipped levels. On `/contact` the existing page already has the same headline, so the footer CTA hides there (`cta="auto"` prop).

### 4.3 Colour roles and measured contrast

Computed from the real hex values (WCAG relative luminance). "Trail" is the WebGL cursor-trail colour `--brand-accent-deep` (`#BC3D4D`), the worst-case background behind footer text.

| Foreground → background | Ratio | Use |
|---|---|---|
| Off-White `#FFF9F2` → burgundy `#800020` | **10.36** | All body, links, headings |
| Off-White → trail `#BC3D4D` | **5.13** | Worst case when the trail passes under text ✅ |
| Beige `#F3E6D5` → burgundy | 8.82 | Headings only; **beige → trail 4.37 ✗**, so no small beige text |
| Sage `#C9D3C0` → burgundy | 7.00 | Status dot / decorative; **sage → trail 3.47 ✗** (non-text only) |
| Burgundy → Off-White (primary button) | 10.36 | Button label |
| Burgundy → Beige (button hover) | 8.82 | Button hover |
| Burgundy → Sage (reserved chip) | 7.00 | Optional availability chip |
| Coral `#D45060` → burgundy | 2.64 ✗ | **Never text**; large decorative only |
| Off-White → coral-deep surface | 5.21 | A text-bearing coral surface, if ever used |
| Olive `#5A6432` → sage | **4.11 ✗** | Not for small text; olive appears only as a ≥3:1 non-text accent |
| Hairlines (Off-White 22%) | 1.58 | Decorative, so exempt |

**Rule:** all small text is **full Off-White** (no reduced-opacity muted text; Off-White at 85% on the trail is 3.81:1, a fail).

### 4.4 Surfaces
- `.structure-footer .webgl-background` stays the computed burgundy (single source for the shader).
- Pixel-grid texture: one `linear-gradient` pair at 25 px, 6% Off-White, static CSS, on all viewports.
- Optional ≥lg only: nothing new in CSS. The WebGL trail already provides the cursor-reactive layer, and the prototype's CSS cursor glow is not shipped.

### 4.5 Motion tokens

| Token | Value |
|---|---|
| `--ft-ease` | `cubic-bezier(.2,.7,.2,1)` for hovers |
| `--ft-hover` | 200–300 ms, transform / background-size only |
| `--ft-lay` | 1.3 s `steps(14, end)` on `clip-path: inset()` for the brick laying; plays once, at ≥20% visibility via IntersectionObserver (not scrubbed) |
| Link underline | `background-size` 0→100% (no `transition: all`) |
| Back-to-top bricks | `transform: translateY(-3px/-2px)` on hover, class-toggled fill on scroll |
| Availability dot | `steps(2)` 1.6 s blink; stops under reduced-motion |

Only `transform`, `opacity`, `clip-path` and `background-size` are animated. `transform-origin` is explicit. There is no marquee. `will-change: transform` is restricted to the reveal tween's lifetime (set and cleared by GSAP `force3D` / `clearProps`, replacing the permanent class).

### 4.6 States

| Control | Rest | Hover | Focus-visible | Active | Disabled / hidden | Loading / error |
|---|---|---|---|---|---|---|
| Link | Off-White | underline draws (`background-size`) | 2 px Off-White outline, 3 px offset (existing ring) | opacity .85 | not rendered if href missing | n/a |
| Primary button | Off-White bg, burgundy text | lifts 2 px, bg → Beige | same ring | 1 px press | hidden if no target | n/a |
| Ghost button (Book a call) | 1.5 px border | bg 10% Off-White | ring | press | **hidden unless `CAL.link`/`bookingUrl`** | n/a |
| Copy email | button, label "Copy" | underline | ring | press | hidden if `EMAIL=''` | copied: toast "Email copied" (`role=status`); failure: toast "Copy failed – select the address" and the mailto link still works |
| Back-to-top | 6 brick glyph | top 2 bricks rise 3 / 2 px | ring | press | always present | n/a |
| Newsletter (P4b) | input + button | – | ring + `aria-describedby` | – | hidden if no endpoint **or** no privacy page | sending: button `aria-busy`, label "Sending…"; error: inline message with next step; success: inline "Check your inbox" |

### 4.7 Reduced motion
- The wordmark renders fully built (no clip-path animation).
- The availability dot is static.
- The scrub reveal stays skipped (existing guard), and scroll-to-top uses `immediate: true`.
- Hover transitions shrink to colour only.
- The clock still updates (information, not motion).

---

## 5. Component and architecture plan

### 5.1 File plan

**New**
- `src/data/footer.ts` — typed `FOOTER` data (shape in §6.1).
- `src/components/footer/FooterCta.astro`, `FooterNav.astro`, `FooterContact.astro`, `FooterStatus.astro`, `FooterWordmark.astro`, `FooterLegal.astro`, `FooterWebgl.astro` (holds only the two `canvas.webgl` and `.webgl-background`).
- Later, in P4b if approved: `FooterNewsletter.astro`.
- `scripts/footer-check.mjs` (optional): a static check that every href in the footer resolves or is hidden.

**Changed**
- `src/components/Footer.astro` — a thin shell that composes the subcomponents. It keeps the root `<footer class="structure-footer …" role="contentinfo">`, `__inner`, and the canvases in the same document order.
- `src/scripts/footer.ts` — remove `initSocialPillsRandomLayout`; add the brick-laying observer, clock, copy-email and scroll-progress; one teardown function.
- `src/styles/decbricks.css` — a new `/* Footer v2 */` block.
- `docs/PROGRESS.md`, `Design-handoff.md`, `open-items.md`, `tokens.md` (correct the stale coral text).

**Not changed:** `main.ts` (it already calls `teardown(initFooter())` on boot and in `onAfterSwap`), `page-transition.ts`, `webgl/*`, `global.css`, `package.json`.

**Class hooks kept:** `.structure-footer`, `.structure-footer__inner`, `.parts-btnScrollTop`, `button[aria-label="Manage Cookies"]` (kept, because footer.ts queries it), `.structure-footer__social` (re-used for socials *without* the absolute-position JS). `.structure-footer__marquee` stays null-guarded in `footer.ts` (no markup uses it) and its removal is logged in Design-handoff. Everything is null-guarded.

### 5.2 Visible Decbricks word
- The visible word is always `brandify()` / `.font-brand` (the cream-variant logo comes from the existing `.structure-footer .font-brand::before` rule).
- The giant wordmark sets `--brand-logo-w/h` on a `.structure-footer__wordmark` context to cap the mark at ≈0.3em (documented hook in mapping.md). Prototype A shows the cap.
- `translate="no"` is added to the wordmark.

### 5.3 WebGL canvases — what the footer owns vs global

| Item | Where | Owner | Notes |
|---|---|---|---|
| `canvas.webgl` ×2 (fixed, z-10 fg, z-0 bg; `hidden lg:block`) | **end of `Footer.astro` (lines 251–252), inside `.page`** | Global: the whole-page background and foreground effects | `createExperience()` takes `querySelectorAll('canvas.webgl')`, **[0] = fg, [1] = bg**. `reattachCanvases()` re-binds after every swap |
| `.webgl-background` div (inside `<footer>`) | Footer | Footer | Shader plane created in `scanPageTargets()`; colour = **computed `background-color`**, trail = `data-trail` attr (`rgb(188, 61, 77)`) |
| `.structure-footer` element | Footer | Footer + global | `impl.ts` reads its rect for `uClipY` (fg clip at the footer top) |
| `.structure-footer__inner` | Footer | `footer.ts` | scrubbed slide-reveal (yPercent −100→0) |

**Verified behaviour:**
- 6 consecutive swaps leave 2 connected canvases at 1280×800, 1 footer and `hasWebGL = true` (`footer-behav.json`).
- Below 1024 the canvases are `display:none` (probe: `canv.display none`), and the footer bg is the burgundy div.

**Design consequences:**
1. Keep the canvases in `FooterWebgl.astro`, rendered **last inside Footer.astro, in the same fg-then-bg order**.
2. Colours stay CSS-sourced. Any new surface the shader samples must resolve to `rgb()`. `oklab` / `color-mix` computed strings fall back (open-items C11), so use hex or `rgb()` for any element carrying `.webgl-background`.
3. The footer height changes with the redesign (≈498 → ≈1360 at 1280). `footerEl.getBoundingClientRect` feeds `uClipY` and the plane geometry, so the layout must be settled before the first `refresh`. The wordmark therefore has a fixed `aspect-ratio` box (no font-load shift), and the clock reserves its width.
4. **Moving canvases out of `.page`** (into `Base.astro`) would stop them being replaced, and `reattachCanvases()` would early-return. It looks safe but touches transition z-ordering and `Loader`. **Decision: not part of this redesign.** Revisit only as an optional P6 spike with the swap gauntlet (§8) as the gate.

### 5.4 `footer.ts` changes
- Remove ~120 lines of social-pill layout.
- `initFooter()` returns one teardown that: disconnects the IntersectionObserver, clears the clock interval, removes the visibilitychange listener, kills the scroll-progress ScrollTrigger, removes the click handlers, and runs `mm.revert()`.
- The clock updates once a minute and pauses when the tab is hidden (`visibilitychange`).
- Copy-email uses `navigator.clipboard` with a `document.execCommand('copy')` fallback.
- Scroll progress uses a single ScrollTrigger (`onUpdate`, quantised to 6 steps; the DOM is touched only when the step changes).
- The scrub reveal keeps `end: +=footer.offsetHeight`, recomputed on refresh.
- Every module is registered in `main.ts` boot and `onAfterSwap`. This is already true for `initFooter`, so no `main.ts` edit is needed.

### 5.5 SEO and schema
- The footer reads `SITE.socials`, `EMAIL` and `PHONES` (the same sources as `schema.ts`). A check script asserts that the footer's `mailto:`, `tel:` and social hrefs are a subset of the schema's `contactPoint` / `sameAs`.
- Real `<a href>` links in the footer pass crawlers internal links (About anchors, Services, Contact). Legal links appear only when the pages exist.
- No new JSON-LD.

### 5.6 Print
`@media print`: hide the canvases, the grid, the wordmark and the CTA buttons; keep contact text, links and the copyright, dark-on-light.

### 5.7 Skill precedence conflicts (logged for `Design-handoff.md`)
1. `frontend-design` says to avoid a tracked ALL-CAPS eyebrow plus mono labels everywhere → **project rule keeps Departure Mono micro-labels**. Mitigation: mono is limited to column headings, the legal row and one micro-label.
2. `design-taste-frontend` says shader scenes only on tech sites → Decbricks is a tech agency, and the footer shader already exists. No conflict.
3. `design-taste-frontend` rule 9 (no real-format phone / address) → we use only owner-supplied values and hide when absent.
4. `frontend-ui-engineering` assumes React / Tailwind file structure → ignored. The subcomponents are plain Astro files.
5. `astro-best-practices` prefers islands → ignored. The init + teardown pattern in `main.ts` rules.

---

## 6. Functionality spec

### 6.1 Data shape (`src/data/footer.ts`)

```ts
export interface FooterLink { label: string; href: string; external?: boolean; enabled?: boolean }
export interface FooterColumn { id: string; heading: string; links: FooterLink[] }
export const FOOTER = {
  cta: { heading: 'Let’s Start Something Great.',           // EXISTING copy (contact.astro:91)
         primary: { label: 'Start a project', href: '/contact' },   // PROPOSED label
         bookingLabel: 'Book a call' },                              // PROPOSED label; shown only if CAL configured
  columns: [
    { id: 'pages',   heading: 'Pages',   links: [Home, About, Services, Contact] },
    { id: 'company', heading: 'Company', links: [/about#who-we-are … from src/data/about.ts navLabel/id (verbatim)] },
  ] as FooterColumn[],
  studio: { timeZone: import.meta.env.PUBLIC_STUDIO_TZ || '',
            availability: (import.meta.env.PUBLIC_STUDIO_AVAILABILITY || '') as ''|'open'|'limited'|'closed' },
  legal: [{ label:'Privacy', href:'/privacy-policy', enabled:false },
          { label:'Terms',   href:'/terms',          enabled:false }],   // flip when A11 pages exist
  newsletter: { endpoint: import.meta.env.PUBLIC_NEWSLETTER_ENDPOINT || '' },
  game: { label: 'Play Our 404 Game', href: '/the404game' },            // EXISTING copy
  cookieLabel: 'Manage Cookies',                                         // EXISTING copy
};
```

Contact and social data come from the existing `EMAIL`, `PHONES`, `CAL`, `SITE.socials` (no duplication).

Services deep links: `SERVICES` currently holds 1minus1 content (Strategy / Creative / Web Development / Campaigns; open-items C1/B2). The footer therefore has **no** services-deep-link column until the owner supplies real services (a `services` column stays empty and hides). The "Company" column deep-links to `/about#<id>` using the verbatim About nav labels (Who We Are, What Drives Us, Mission, Vision, Values, Experience, Philosophy). Show 4 on the footer, link the rest through `/about`.

### 6.2 Final feature list

| Feature | UX value | Owner data | JS / perf | A11y | Privacy / consent | Fallback if data missing | Class | Phase |
|---|---|---|---|---|---|---|---|---|
| Closing CTA (headline + **Start a project** → `/contact`) | High — kills the dead end | none (label proposed) | 0 | real link, 52 px target | none | always shown; hidden on `/contact` | **Include** (low risk / high impact) | P1 |
| **Book a call** (Cal) | High | A2 Cal link | 0 (link only) | link | Cal is third party; link opens `/contact` or `bookingUrl` and does **not** load the embed | hidden | Include | P1 |
| Sitemap columns Pages / Company | High; internal linking | none | 0 | `<nav aria-label="Footer">` per column group, H3 | none | Pages always; Company hides if About disabled | **Include** | P1 |
| Services capabilities deep links | Medium | C1 real services | 0 | – | none | **empty → hidden** | Defer until C1 | P1 (data only) |
| Contact block: email (`mailto`) | High | A4 email | 0 | link | none | hidden | **Include** | P1 |
| Copy-to-clipboard + toast | Medium–high | A4 | ~0.4 KB | button + `role=status` live region; mailto stays | none | hidden with email | Include | P4 |
| `tel:` links (+ WhatsApp if `whatsapp` field set) | Medium | A3 phones | 0 | `tel:` | none | hidden | Include | P1 |
| Address / hours | Low–medium | A4 (only if owner wants public) | 0 | – | privacy of address | omitted | Include only if supplied | P1 (data) |
| Live local time (Intl, configurable TZ) | Medium; "alive" cue | timezone (proposed IST) | ~0.3 KB; 1/min; pauses hidden | `<time>`, not live; not read repeatedly | none | **hidden if no TZ** | **Include** (owner decision) | P4 |
| Availability status | Medium; honest signal | owner-set flag | 0 | text, not colour-only | none | hidden if unset; **never auto-derived from hours** | Include (policy Q) | P4 |
| Social links with accessible icons | Medium | A8 | 0 | `aria-label`, `rel="noopener"` | outbound links only | hidden per missing profile | Include | P1 |
| Newsletter signup | Medium; needs a list owner | endpoint + **privacy page** | ~1 KB, `fetch` | label, honeypot, `aria-live`, inline errors | needs consent text and a privacy policy | **hidden** | **Defer / cut for now** (P4b optional) | P4b |
| Back-to-top with brick scroll-progress | Medium; replaces plain button | none | 1 ScrollTrigger | keeps name "Rise to the top"; progress decorative | none | n/a | **Include** | P4 |
| Cookie settings reopen (`bus.emit('manage-cookies')`) | Required for consent UX | none | existing | button; label **Manage Cookies** | consent control | always | Include (exists) | P1 |
| Legal links | Required for launch | A11 pages | 0 | – | – | **hidden until pages exist** (minimal shell pages are an option; copy needs the owner) | Include (gated) | P0/P1 |
| 404-game easter egg | Brand play | none | 0 | 44 px target, quiet text link | none | n/a | **Keep** (demoted to a quiet link) | P1 |
| Landmarks / skip | A11y | none | 0 | `<footer>`, labelled navs; skip link already exists | – | – | Include | P1/P5 |
| Print styles | Polish | none | 0 | – | – | – | Include | P5 |
| Structured-data consistency check | SEO safety | none | build-time | – | – | – | Include | P6 |
| Keyboard shortcuts | Low | – | – | – | – | – | **Cut** | – |
| Language / region note | Low | – | – | – | – | – | **Cut** | – |
| Trust / credentials strip | Needs real proof | A14 | – | – | – | – | **Cut** until data | – |
| Marquee words | Template artefact | C9 | tween | pause gap | – | – | **Cut** (owner confirm) | P1 |
| Social-pill random layout | n/a | A8 | JS | overlap | – | – | **Cut** | P1 |

Low-risk / high-impact: CTA, sitemap, contact block, brick wordmark, back-to-top bricks, legal gating, dead-code removal.
Gimmicks: custom cursor, brick physics, keyboard shortcuts, auto availability.

---

## 7. Phases

Each phase is a separate PR. After each: `npm run build` ✅, `npm run check` ✅, `npm run check:brand`, `node scripts/check-links.mjs`, `node scripts/check-headings.mjs`, update `docs/PROGRESS.md`, and commit `footer phase N: …`.

### P0 — Safety net (S)
- **Goal:** lock the baseline and prove the WebGL swap contract before touching markup.
- **Tasks:**
  1. Promote `probes/footer-audit.cjs` and `footer-behav.cjs` to `docs/qa/` (the latter as the swap gauntlet).
  2. Capture baseline screenshots and metrics (footer height, canvas size, CLS and INP on a real mid-range profile, Lighthouse a11y / perf).
  3. Investigate F5 (off-white band under the footer on first load vs burgundy after swaps).
  4. Correct stale "coral band" comments and docs (`Footer.astro` head, `decbricks.css:66-70`, tokens §2c-7).
  5. Raise the "Play Our 404 Game" target to ≥44 px.
  6. Legal links: do **not** add `/privacy-policy` or `/terms` links (404s); keep them out of the footer until A11. Decide whether to ship minimal shell pages. **Needs the owner's copy, so no invented legal text.**
- **Skills:** `webapp-testing`, `web-design-guidelines` (audit).
- **Acceptance (Playwright):**
  - After 6 swaps, `canvas.webgl` count === 2, both `isConnected`, `clientWidth` === `innerWidth` at 1280.
  - `document.querySelectorAll('.structure-footer').length === 1`.
  - Computed `.webgl-background` bg is `rgb(128, 0, 32)` and every footer text pair has contrast ≥ 4.5.
  - 404-game rect height ≥ 44 at 320/375/768.
  - 0 `pageerror`, 0 failed requests.
- **Risk / rollback:** minimal; revert the commit.
- **Dependencies:** none. **Owner input:** none.

### P1 — Structure and content architecture (M)
- **Goal:** replace the dead-end footer with a real footer in the existing look (no brick or wordmark effects yet).
- **Tasks:**
  1. Create `src/data/footer.ts`.
  2. Split Footer into subcomponents (§5.1), with the canvases last and in the same order.
  3. Build the CTA block (hidden on `/contact`), Pages and Company columns, contact block, socials, and legal row (links gated by `enabled`).
  4. Retire the marquee and the pill layout code.
  5. Add `<nav aria-label="Footer">` groups; fix `role=text`.
- **Skills:** `frontend-ui-engineering`, `astro-best-practices`, `frontend-design`.
- **Acceptance:**
  - Tab order is CTA → Pages → Company → contact → legal → Manage Cookies → back-to-top.
  - All footer `href`s return 200 or are absent (check-links).
  - 1 H1 per page, no heading skips (check-headings).
  - With all env unset: no empty column, no empty `href`, a dev `console.warn` per missing datum, no visible warning in production.
  - The swap gauntlet (P0 script) still passes.
  - `/contact` shows no duplicate "Let’s Start Something Great." H2 within the page.
- **Risk / rollback:** medium (footer height changes the WebGL plane). Revert, since the canvas component is isolated.
- **Dependencies:** P0 and owner answers to the 3 blocking questions. **Owner input:** concept; C9 (marquee); A2 / A3 / A4 / A8 are optional at this point.

### P2 — Visual system and signature moment (L)
- **Goal:** the brick-laid wordmark, grid texture, type scale and responsive layout of §4.
- **Tasks:**
  1. The `.structure-footer__wordmark` context and `.font-brand` lockup cap.
  2. The brick tile SVG data URI and `background-clip:text` fill. **Prototype artefact fix:** make the tile size em-relative and confirm anti-aliasing at 2× DPR.
  3. The 25 px grid texture.
  4. Responsive CSS per §4.1. The wordmark box has a fixed `aspect-ratio` to prevent font-load CLS.
  5. Correct copy sizes; verify the wordmark fits at 320–2560 without clipping the "s".
- **Skills:** `design-taste-frontend` (checker + finish gate in a real browser), `frontend-design`.
- **Acceptance:**
  - At 320 / 375 / 768 / 1024 / 1280 / 1920 / 2560 there is no horizontal overflow (`scrollWidth - innerWidth === 0`).
  - The wordmark box width ≤ container width.
  - All text pairs ≥ 4.5 (including with the trail forced on the pixel under text, via screenshot sampling).
  - CLS contribution of the footer ≤ 0.005.
  - Screenshots at 375 and 1440 reviewed.
- **Risk / rollback:** medium (paint cost of clipped text, mitigated by a single static paint). Roll back to "A-lite" (solid fill).
- **Dependencies:** P1. **Owner input:** confirm A or the fallback; FK Raster licence (B1) is a standing flag.

### P3 — Motion and micro-interactions (M)
- **Goal:** laying animation, hover states, reduced-motion behaviour.
- **Tasks:**
  1. IntersectionObserver that adds `.is-built` once.
  2. Stepped `clip-path` reveal (`--ft-lay`).
  3. Link underline draw, button lift, back-to-top brick hover.
  4. Reduced-motion branch.
  5. Keep the existing scrub reveal; recompute `end` on refresh.
  6. Remove permanent `will-change`.
- **Skills:** `design-taste-frontend` (motion rules), `web-design-guidelines`.
- **Acceptance:**
  - With `reducedMotion: 'reduce'`: no `clip-path` transition running (`getAnimations().length === 0` on the wordmark), wordmark fully visible.
  - Normal motion: the wordmark is clipped before intersect and fully visible after; the observer disconnects (no listeners left).
  - No long task >50 ms during the reveal (PerformanceObserver `longtask`).
  - After 5 swaps there is no leaked ScrollTrigger (count equals a fresh load of the same route).
- **Risk / rollback:** low; CSS class removal restores the static wordmark.
- **Dependencies:** P2.

### P4 — Functionality (M–L)
- **Goal:** copy-email, studio time and availability, back-to-top progress, Manage Cookies polish. (P4b newsletter stays optional.)
- **Tasks:**
  1. `FooterStatus` (clock via `Intl.DateTimeFormat`, minute updates, hidden if no TZ).
  2. Availability pill (static from env).
  3. Copy-email button, toast live region, clipboard fallback.
  4. Stacking-bricks progress control on `.parts-btnScrollTop` (keeps name "Rise to the top").
  5. Verify `bus.emit('manage-cookies')`.
  6. **P4b (only if approved):** newsletter form (honeypot, `fetch`, success / error states, consent text). It is **blocked** until a privacy page exists (A11) and the endpoint is chosen.
- **Skills:** `frontend-ui-engineering`, `web-design-guidelines`.
- **Acceptance:**
  - Clock text matches `Intl` for the TZ within one minute; no element changes while the tab is hidden.
  - Copy button writes the email to the clipboard (Playwright clipboard permission) and the toast text appears in a `role=status` node.
  - With `EMAIL=''`, neither the email row nor the copy button exists.
  - Progress control: scrolled to 0% → 0 filled bricks, 100% → 6.
  - Click returns `scrollY` to 0 (≤1 s).
  - All teardown paths leave 0 intervals / listeners after a swap (instrumented counters).
- **Risk / rollback:** low–medium; each feature is separately flagged by data.
- **Dependencies:** P1–P3. **Owner input:** timezone, availability policy, A4; A7 / A11 for P4b.

### P5 — Responsive, touch and a11y hardening (M)
- **Goal:** meet the quality floor on every device and input.
- **Tasks:**
  1. 44 px targets everywhere (invisible hit areas on mono links).
  2. `touch-action: manipulation`.
  3. Cookie-banner overlap check (`--cookie-safe-area`).
  4. Print stylesheet.
  5. `translate="no"` on the brand word.
  6. Focus order and `:focus-visible` audit.
  7. Safe-area insets at the bottom.
  8. Forced-colors fallback for the wordmark (a solid fill).
- **Skills:** `web-design-guidelines` (audit → `docs/qa/findings.md`), `webapp-testing`.
- **Acceptance:**
  - 0 interactive footer targets <44 px (fine and coarse pointer).
  - Every tab stop shows a visible ring (outline width ≥2 px, contrast ≥3:1 against the local background).
  - With the cookie banner open at 375×812, the last footer control is reachable by scrolling.
  - Axe-style checks (or Lighthouse a11y ≥ 95 on 5 routes).
  - `@media print` screenshot shows contact text, no canvas.
- **Risk / rollback:** low. **Dependencies:** P1–P4.

### P6 — Performance, final QA, docs (S)
- **Goal:** release-quality sign-off.
- **Tasks:**
  1. Lighthouse (mobile + desktop) before / after; INP and CLS on a throttled profile.
  2. Verify bundle deltas; `footer.ts` after the pill-code removal should be ≤ baseline.
  3. The schema / footer consistency check script.
  4. Update `PROGRESS.md`, `Design-handoff.md` (decisions + skill conflicts), `open-items.md`, `mapping.md`, `tokens.md`.
  5. Optional spike: evaluate moving canvases outside `.page` (gate: the swap gauntlet, 30 swaps, context-count check).
- **Acceptance:** §8 matrix all green; no regression vs the P0 baseline (LCP, CLS, INP); no new console errors.
- **Risk:** none (read-mostly).

Effort: P0 S · P1 M · P2 L · P3 M · P4 M–L · P5 M · P6 S.

---

## 8. Verification plan

| Check | P0 | P1 | P2 | P3 | P4 | P5 | P6 |
|---|---|---|---|---|---|---|---|
| `npm run build` / `check` (0 errors) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `check:brand`, `check-links`, `check-headings` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Swap gauntlet** (6+ swaps across /, /services, /about, /contact: canvases connected & sized; 1 footer; `hasWebGL`; 0 `pageerror`; ScrollTrigger count equals fresh load) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 30 swaps |
| Contrast sweep: every text node vs computed `.webgl-background` bg, **plus** worst-case against the trail colour | ✓ | ✓ | ✓ | – | ✓ | ✓ | ✓ |
| Focus order and `:focus-visible` walk | ✓ | ✓ | – | – | ✓ | ✓ | ✓ |
| Overflow at 320 / 375 / 768 / 1024 / 1280 / 1920 / 2560 on 5 routes | ✓ | ✓ | ✓ | – | – | ✓ | ✓ |
| Tap targets (fine + coarse) | ✓ | ✓ | – | – | – | ✓ | ✓ |
| Reduced-motion run (`reducedMotion: 'reduce'`) | – | – | – | ✓ | ✓ | ✓ | ✓ |
| CLS / INP (throttled 4× CPU, 375 px) | baseline | – | ✓ | ✓ | ✓ | – | ✓ |
| Lighthouse a11y / perf (mobile + desktop) | baseline | – | – | – | – | ✓ | ✓ |
| Missing-data matrix: all env empty vs all env set → no empty links, no layout holes | – | ✓ | – | – | ✓ | – | ✓ |
| Print preview | – | – | – | – | – | ✓ | ✓ |
| Visual review: screenshots at 375 and 1440 per route | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Budgets: footer's CLS contribution ≤ 0.005; no long task >50 ms attributable to the footer; `footer.ts` gz ≤ 3 KB; no new network requests (fonts and logo are already loaded).

---

## 9. Owner inputs and decisions

**Blocking (max 3):**
1. **Concept sign-off** — A "Foundation" (recommended), A-lite, B or C? *Default: A.*
2. **Retire the marquee words (C9)?** *Default: yes. The wordmark replaces it; the words stay in the data file as optional copy.*
3. **Studio time and availability** — show a live local time? In which timezone, and who sets availability? *Default: Asia/Kolkata time via `PUBLIC_STUDIO_TZ`, the availability pill hidden until a flag is supplied; never auto-derived.*

**Non-blocking, with defaults (open-items entries to add in P1):**

| # | Input | Default until supplied |
|---|---|---|
| A2 | Cal link / booking URL | "Book a call" hidden |
| A3 | Phones (+WhatsApp) | not rendered |
| A4 | Email (+ address, if public) | not rendered; the footer CTA still routes to `/contact` |
| A8 | Social profiles | not rendered |
| A11 | Privacy and Terms copy | legal links hidden; **no invented legal text** |
| A7 | Form endpoint | n/a for footer; newsletter would also need its own endpoint |
| New | Newsletter provider and list owner | feature stays cut |
| New | Proposed labels: "Start a project", "Book a call", "Open for projects", "Studio time" | marked PROPOSED in the data file and in the plan; owner approves or replaces |
| B1 | FK Raster web licence (the giant wordmark makes it more prominent) | standing flag |

---

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| WebGL canvas relocation | Renderers draw to detached canvases (BUG-015 history) | Do **not** move them; isolate in `FooterWebgl.astro`, same order; swap gauntlet is a hard gate each phase |
| Taller footer changes the shader plane and `uClipY` | Trail offset or clipped band | Fixed `aspect-ratio` boxes, single `refresh` after layout; verify plane vs rect in P2 |
| Lenis / ScrollTrigger refresh | Wrong `end` on the scrub reveal; stale positions after font load | `invalidateOnRefresh`, `end` as a function, `document.fonts.ready.then(ScrollTrigger.refresh)` guarded; counts compared across swaps |
| CLS from fonts, wordmark, clock | Layout shift in the footer | `aspect-ratio` wordmark box, tabular reserved clock width, preloaded FK Raster / Departure Mono already in use |
| Paint cost of `background-clip:text` + `clip-path` on mid-range phones | Jank | Static single paint; the stepped reveal runs once; below lg skip the scrub; fallback is A-lite |
| Mobile cost | Wasted GPU | Canvases stay `hidden <lg`; no pointer effects; the CSS grid is static |
| Giant `.font-brand` mark | Oversized logo | `--brand-logo-w/h` cap on `.structure-footer__wordmark` |
| Third-party embeds / consent | Cal and newsletter | Footer links to `/contact`; **no embed or third-party script loads from the footer**; newsletter blocked on privacy page |
| Hidden data | Empty-looking columns | Every datum optional; the missing-data matrix test |
| Duplicate headline on `/contact` | Redundant H2 | `cta="auto"` hides it on that route |
| FK Raster licensing | Legal | B1 stays a launch flag |
| First-load bottom band inconsistency (F5) | Visual bug | Reproduced and fixed in P0 before redesign work |

---

## 11. Phase 0 execution prompt (ready to paste)

```
You are implementing Phase 0 of docs/plans/footer-redesign-plan.md (safety net, no visual change).
Read AGENTS.md, docs/PROGRESS.md and the plan §2, §5.3, §7-P0 first.

Allowed: docs/qa/, docs/PROGRESS.md, docs/Design-handoff.md, docs/tokens.md, comments in
src/components/Footer.astro and src/styles/decbricks.css, and the 404-game tap-target CSS.
NOT allowed: moving the canvases, markup restructuring, new deps, adding /privacy-policy or /terms links.

Tasks:
1. Copy docs/plans/audit/probes/footer-audit.cjs and footer-behav.cjs into docs/qa/ (rename footer-gauntlet.cjs);
   fix the base URL (http://localhost:4321), write baseline JSON + screenshots to docs/qa/.
2. Record baseline metrics (footer height per width, CLS/INP at 375 throttled, Lighthouse a11y/perf).
3. Reproduce plan finding F5 (off-white band below the footer on first load vs burgundy after swaps).
   Root-cause it (read webgl/impl.ts relayout + the cookie safe-area padding), fix if it is a CSS-only change, else log in open-items.
4. Correct stale "coral band" wording in Footer.astro head comments, decbricks.css:66-70, docs/tokens.md §2c-7.
5. Make "Play Our 404 Game" >=44px tall at 320/375/768 (CSS only; keep class hooks).
6. Run: npm run build, npm run check, npm run check:brand, node scripts/check-links.mjs, node scripts/check-headings.mjs.

Acceptance: after 6 client-side swaps canvas.webgl count===2 and both isConnected and clientWidth===innerWidth (1280);
1 .structure-footer; .webgl-background bg is rgb(128,0,32); every footer text pair >=4.5:1; 404-game height>=44;
0 pageerrors. Update docs/PROGRESS.md, commit "footer phase 0: baseline + safety net". Then stop and report.
```
