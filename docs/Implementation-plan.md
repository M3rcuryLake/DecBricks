# Implementation plan

Gate after every phase: `npm run build` ✅ · `npm run check` ✅ · visual check at 375 / 768 / 1280 / 1920 (screenshots if a browser tool exists; otherwise static review of classes + build) · update `PROGRESS.md` · `git commit`.
If a phase is too big for one session, stop at a sub-step, update PROGRESS.md, continue next session.

## Phase 0 — Recon (read-only, write docs)
1. `git status`; list `public/` (fonts, images, videos); read `astro.config.mjs`, `tsconfig.json`, `package.json`.
2. Read in order: `Base.astro`, `pages/services.astro`, `pages/contact.astro`, `ServicesHero`, `ServicesSidebarNav`, `ServiceBlock`, `ContactForm` (skim), `Header`, `Footer` (grep hrefs/text), `data/services.ts` (types), `scripts/main.ts`, `page-transition.ts`, `services-page.ts`, `contact.ts`, `smooth-scroll.ts`.
3. Verify and correct `docs/tokens.md` + `docs/mapping.md` against the real files (they were written from a static analysis). Fix errors in place; note deltas in Design-handoff.md.
4. Decide & record: `site` URL (astro.config), output mode (static vs adapter), contact-form endpoint strategy, whether `content/config` exists (it does not; `contact.astro` imports `astro:content` and will fail the build).
Known facts to confirm: contact.astro references `getEntry('pages','contact')`, `/images/contact/computer-back-*.webp`, `decbricks.com`; ContactForm/contact.ts contain **no network submit** (no fetch/action) → the form currently goes nowhere.

## Phase 1 — Brand colours (§3.1)
1. Backup tokens: copy the `:root` theme block into Design-handoff.md.
2. Edit `--color-*` per tokens.md §2 (token block only).
3. Scripted remap (Python `re`, run on global.css, print match counts): hex families `140128→800020`, `26024a→<darkest derived hex>`, `9860ff→D45060`, `f2ecff→FFF9F2`, `efedf0→F3E6D5`, `31045f→<muted derived>`, `ffffff(alpha)→fff9f2(alpha)`. Keep alpha suffixes. Also remap `#140128`/`#26024A` in `.astro/.ts` and `themeColor` props, and any three.js colours.
4. Audit `text-purple`, `hover:bg-purple`, `border-purple`, `focus:outline-*`, `placeholder-*`, form error states against the contrast table; fix with existing classes where possible.
5. Check `<meta theme-color>` (burgundy) and `webgl` clear/fog colours.
6. Write real as-built values and contrast results into tokens.md.

## Phase 2 — Typography (§3.2)
1. Inspect font files (`fc-scan`/fontTools): family names, weights, glyph coverage (₹, &, ’ “ ” – —, digits, @, +). Record in tokens.md. If a role font lacks required glyphs, change mapping and log it.
2. Convert to WOFF2 + Latin subset; place in `public/fonts/`; remove unused 1minus1 font files from preload (keep files until Phase 8 cleanup).
3. Replace the 4 `@font-face` rules in global.css with KH Teka (400/500/700), KH Interference (400/700), KH Teka Mono (400), FK Raster Roman Compact fallback; `font-display:swap`.
4. Repoint `--font-*` tokens (tokens.md §3). Add `--font-mono`.
5. Update `Base.astro` preloads: Teka Bold + Teka Regular only (`crossorigin`).
6. Add fallback-metric faces to limit CLS.
7. Specimen check at all breakpoints; fix overflow of giant numerals / `.heading-3xl`, nav, buttons, form labels. Prefer token-level fixes (letter-spacing/line-height in one place) over per-component edits.

## Phase 3 — Shared scaffolding
1. `src/data/site.ts`: `SITE` { name 'Decbricks', url (from astro `site`), tagline, defaultOg, themeColor, locale 'en', socials[], phones from contact.ts, email }.
2. `Base.astro`: remove 1minus1 defaults (title, description, og site_name, og image, canonical base, `rel=sitemap` ok), derive `canonical` from `Astro.url.pathname` + `SITE.url` when not given, add `og:locale`, `twitter:site` if known, GSC verification meta from `import.meta.env.PUBLIC_GSC_VERIFICATION` (omit if unset), `<slot name="head">` kept. `noindex` support kept; **default noindex when `import.meta.env.PUBLIC_ENV !== 'production'`**.
3. Generalise components via optional props (see mapping.md): `ServicesHero`, `ServicesSidebarNav`, `ContactForm`. Defaults keep `/services` rendering identical. Add `aria-label` prop to sidebar.
4. Header/Footer: rebrand name, logo (open-item if asset missing → text wordmark fallback), nav = Home, Services?, About, Contact (only link pages that exist), footer legal links must resolve or be removed, socials from `SITE` (omit unknown). Footer `href="/the404game"` easter egg: keep or drop (log).
5. `src/styles/decbricks.css` (imported after global.css in Base): only what new components need and existing utilities can't express; no tokens redefined here.

## Phase 4 — About page (§4.1)
- `src/data/about.ts` typed (`AboutSection { id, number, eyebrow, title, navLabel, paragraphs[], items?[] }`) — verbatim text.
- `AboutBlock.astro` (clone ServiceBlock chrome, remove video/capabilities; values rendered as H3 list; alternating layout preserved; giant numeral kept).
- `src/pages/about.astro` assembled per mapping.md. Container exactly: `<div class="mx-auto flex w-full max-w-1850 flex-col gap-40 lg:gap-55 xl:gap-65 3xl:gap-80 4xl:gap-95">`.
- SEO: title `About Decbricks | Digital & Technology Solutions Agency`; description `Discover Decbricks, a technology and digital solutions agency helping businesses innovate through software development, AI, automation, design and business growth services.`; canonical `/about`; JSON-LD `AboutPage` + `Organization` + `BreadcrumbList`.
- Verify `initServicesPage()` works with N=7 items, no clients section, no videos. Fix with null-guards (do not fork the file unless unavoidable).
- Heading outline: H1 (hero) → H2 per block → H3 values. UX copy for eyebrows/nav labels: sentence-case-agnostic (template uppercases), ≤2 words.

## Phase 5 — Contact page (§4.2)
- **Delete/replace** `pages/contact.astro` (broken). New page per mapping.md.
- SEO: title `Contact Decbricks | Start Your Digital Project`; description `Contact Decbricks for website development, app development, AI automation, custom software, digital marketing and business outreach services.`; canonical `/contact`; JSON-LD `ContactPage` + `Organization` (with `contactPoint` from contact.ts) + `BreadcrumbList`.
- **5A Cal.com** (`CalEmbed.astro`, `scripts/cal-embed.ts`, `src/data/contact.ts` → `CAL = { link: 'username/event', origin: 'https://app.cal.com' }`):
  - Use Cal.com's official inline embed (vanilla loader, `embed.js` from `https://app.cal.com/embed/embed.js`), namespaced; NOT a custom UI.
  - Lazy-init when the section nears the viewport (IntersectionObserver, rootMargin ~400px) → no LCP/INP cost. Show skeleton in brand colours while loading.
  - Config: `cal('inline',{elementOrSelector, calLink, layout:'month_view'})` and `cal('ui',{ theme:'light', cssVarsPerTheme:{light:{'cal-brand':'#800020'}}, hideEventTypeDetails:false })`.
  - Handle: script load failure / 8–10 s timeout → fallback card (direct Cal link `target=_blank` + `mailto:` + phone), `role="status"` messages; `cal('on',{action:'bookingSuccessful',callback})` → show confirmation state + move focus; `linkFailed` → error state.
  - Responsive: container min-height ~700px mobile / ~650px desktop, width 100%, no horizontal scroll at 320px.
  - **Lenis conflict**: container gets `data-lenis-prevent`; add in decbricks.css `.cal-embed iframe{pointer-events:auto}` to beat `.lenis.lenis-smooth iframe{pointer-events:none}`. Verify wheel/touch scroll inside the embed and page scroll beyond it.
  - **Page-transition**: init in `main.ts` boot + `onAfterSwap`; teardown removes observers/listeners; guard against double `cal('inline')` on the same node; embed.js loaded once.
  - If `CAL.link` is empty: dev console warning + production fallback card (email/phone) — never a blank box. Add to open-items.
  - Privacy: Cal embed sets third-party cookies → mention in CookieBanner category if the banner has categories; load only after consent if the existing banner gates third parties (read `cookies.ts`).
- **5B** Let's Start Something Great block (verbatim copy, H2/H3 as given).
- **5C** Meet the Team: `TeamCard` (photo via `<img loading="lazy" decoding="async" width height>` with `alt`, name, role, short bio, optional LinkedIn). Grid 1/2/3 cols (existing grid classes). Data array empty-safe; ship with entries clearly flagged placeholder until the owner supplies real ones; **no invented names/faces**. Image pipeline: accept jpg/png in `src/assets/team/`, use `astro:assets` `<Image>` (WebP/AVIF, responsive `widths`).
- **5D** Contact numbers: list of `{label, display, e164}`; `<a href="tel:+…">`, min 44×44 tap target, visible focus, copy-safe text; optional WhatsApp link if owner provides. Hide section if no numbers + dev warning.
- Contact form: wire a real submission. Default (keeps site static): POST to `PUBLIC_CONTACT_ENDPOINT` (Web3Forms/Formspree/own worker) using fetch in `contact.ts`, with loading/success/error states, honeypot field, server-error fallback to `mailto:`. If an Astro adapter already exists, a `/api/contact` route is acceptable. Document in Design-handoff + open-items.

## Phase 6 — SEO & technical (§5)
- Per-page unique title/description for **every** page incl. index, services, 404 (noindex), the404game (noindex).
- OG/Twitter: `og:image` 1200×630 (open-item asset; interim: generate a plain brand-colour PNG with wordmark and flag it), `og:site_name Decbricks`, `og:locale`.
- Headings audit script: build → parse `dist/**/*.html` → assert exactly one `<h1>`, no level jumps; print table. Fix offenders (e.g. ContactForm `h2` sr-only is fine; ServicesHero `h1` sr-only must be the only H1).
- URLs: `/about`, `/contact`, `/services`; trailing-slash policy set in astro.config (`trailingSlash`/`build.format`) and canonicals consistent with it.
- `src/pages/sitemap.xml.ts` (static endpoint, lists indexable pages with lastmod = build date) and `src/pages/robots.txt.ts` (Allow all + `Sitemap:`; `Disallow: /` unless production env). No new dependency.
- JSON-LD builder `src/lib/schema.ts`: `Organization` (name, url, logo, sameAs, contactPoint[telephone, email, areaServed IN + international]), `WebSite`, `Service` entries for the capability list (custom software, web & mobile apps, AI, business automation, UI/UX design, digital marketing, business development) on the Services page **only if** that page's content is Decbricks content, `BreadcrumbList`, `AboutPage`, `ContactPage`. Must match visible content; no invented ratings/addresses.
- Internal linking: About ↔ Contact ↔ Services via descriptive anchors (e.g. "start a project", "our services"); header/footer consistent. Natural keywords from the supplied copy only; no stuffing.
- Images: `astro:assets` for new images; descriptive alt; `loading="lazy"` except LCP candidate (`fetchpriority="high"`); explicit width/height.
- GSC: `PUBLIC_GSC_VERIFICATION` meta (and note DNS option), sitemap URL ready, canonical + robots correct. Document in open-items.

## Phase 7 — Performance & a11y
- Measure first: `npm run build && npm run preview`; Lighthouse (mobile) on `/about`, `/contact` if available; else inspect bundle sizes in `dist/_astro`.
- Known suspects: `webgl/experience.ts` + three (≈48 KB source, large bundle) boots on every page via `main.ts` → lazy `import()` after first paint/idle and only where `.webgl-*` targets exist; Loader overlay delaying LCP; CookieBanner; font weights (max 4 files above fold); render-blocking CSS (157 KB) — consider `inlineStylesheets` / critical split only if safe.
- INP: avoid long tasks in init functions; ScrollTrigger refresh debounced; passive listeners.
- CLS: reserve Cal embed height; font fallback metrics; image dimensions.
- Preserve animations. Reduced-motion: disable trail/marquee/transition extras where template lacks it, for new code at minimum.
- a11y: skip link (`#main-content`), landmarks (`main`, `nav` labels), focus order through sidebar nav (it has `inert` + `lg:block` — confirm intended), form labels/errors (`aria-describedby`, live region), Cal fallback announcements, link purposes, 44px targets, colour contrast re-test.

## Phase 8 — Cleanup & handoff
- Remove or park 1minus1-identity leftovers per open-items "Scope decisions"; delete unused fonts/images only after confirming no references (`grep -r`).
- `npm run build`, `npm run check`, headings script, link checker (all internal hrefs resolve), no `1minus1` string in shipped HTML (`grep -ri 1minus1 dist`, excluding docs).
- Finalise all docs; PROGRESS.md fully current.
