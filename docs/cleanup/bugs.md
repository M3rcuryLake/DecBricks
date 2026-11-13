# Phase 2 — Bug Hunt Report (`cleanup/2026-11-14`)

Evidence-based audit across all routes (`/`, `/services`, `/about`, `/contact`, `/404`) at `320`, `375`, `768`, `1024`, `1280`, `1920`, and `2560` px via Playwright (`phase2-report.json`), listener leak instrumentation, numerical WCAG contrast checks, and client-side swap gauntlets.

## Visual & Network Checks Summary

- **Horizontal overflow (`scrollWidth > clientWidth`):** `0 px` overflow across all `30` route × width pairs (`320`–`2560` px).
- **Console / Page / HTTP errors:** `0` console errors, `0` uncaught page errors, `0` HTTP `>= 400` responses.
- **Image stretching / aspect distortion:** `0` distorted `<img>` elements (`object-fit: fill` distortion check).
- **Interactive UI contrast (rendered foreground vs effective background):**
  - `.sections-contactForm button[aria-label="Submit"]`: Off-White on Burgundy = **`10.36:1`** (PASS)
  - `[data-cookie="accept"]`: Off-White on Burgundy = **`10.36:1`** (PASS)
  - `.parts-scrollButton span`: Off-White on Burgundy = **`10.36:1`** (PASS)
- **Known owner-gated / oversized assets (reported only, Ground Rule 3):**
  - Hero ambient reel (`/videos/219063fa94bc3a4eb8ae3dad65571723.mp4`): `764,617 B` partial range (`206`).
  - `/images/contact/computer-back-{1600,2000}.webp`: `467 KB` / `638 KB` (responsive `srcset` picks smaller sizes below `1280px`).
  - Three optimized service artwork `.avif` images at `768px` (`325–373 KB`).
  - `sitemap.xml` & `robots.txt` align (`trailingSlash: 'never'`, `PUBLIC_ENV !== 'production'` disallows bots as intended by launch guard).

---

## Confirmed Bugs (`S1` → `S3`)

### BUG-016 (`S1` — High): Mobile Menu Traps Page Scroll When Resized Across `1024px`
- **Location:** `src/scripts/menu.ts:193–226`
- **Repro:** Open mobile menu at `375px` (`html.lenis-stopped` added, `aria-expanded="true"`), then resize viewport to `1280px` (`>= bp.lg`).
- **Observed Evidence:** After resize across `1024px`, `header.structure-menu button` remained `aria-expanded="true"`, mobile nav lost `inert`, and `document.documentElement.classList.contains('lenis-stopped')` remained `true` — permanently freezing desktop scrolling.
- **Root Cause:** `mm.add('(max-width: 1023px)', ...)` cleanup callback killed `menuTl` without closing `menuOpenState`, restoring `setMobileNavInert(true)`, resetting `aria-expanded="false"`, calling `getLenis()?.start()`, or updating header logo color.
- **Status:** Fixed in Phase 3.

### BUG-017 (`S1` — High): Cal.com Embed Fails on Pre-Granted Consent & Runs When `CAL.link` Is Empty
- **Location:** `src/scripts/cal-embed.ts:80, 154`
- **Repro:**
  1. Grant `essential` cookie consent on `/` or reload `/contact` with saved consent, with a valid `PUBLIC_CAL_LINK`.
  2. Or run `/contact` with `CAL.link === ''` and valid fallback contact links + existing cookie consent.
- **Observed Evidence:**
  1. `let loadStarted = false;` (L154) never checked `hasConsent()` on init; `cookies-decided` never re-fires after initial consent, leaving Cal embed stuck showing the fallback card indefinitely.
  2. Line 80 `if (!mount || (!CAL.link && !hasFallbackContent())) return;` allowed execution into `IntersectionObserver` + `start()` even when `CAL.link` was empty, loading external `cal.com/embed/embed.js` with `calLink: ""` and calling `revealEmbed()` (hiding the server-rendered `.cal-fallback` card).
- **Root Cause:** Missing initial `hasConsent()` check and permissive compound boolean on line 80 instead of `if (!mount || !CAL.link) return;`.
- **Status:** Fixed in Phase 3.

### BUG-018 (`S2` — Medium): Mobile Menu Close Leaves Logo Invisible on Dark Heroes & Steals Focus on Route Swaps
- **Location:** `src/scripts/menu.ts:200, 218–226`
- **Repro:** Open mobile menu at `375px` on `/services` (dark hero at `scrollY = 0`: logo flips `text-white` → `text-darkPurple`), then press `Escape` or click Close.
- **Observed Evidence:** After close, `.parts-animatedLogo` retained `text-darkPurple` (`#800020` burgundy on `#800020` burgundy hero). Additionally, `close(false)` on route swaps still scheduled `menuButtonRef?.focus()`, pulling focus back to the header toggle after navigating, and `menuTl.from('.link', ...)` queried document-wide `.link` nodes instead of scoping to `mobileNav`.
- **Root Cause:** `close()` omitted `applyLogoClasses()` and unconditionally focused `menuButtonRef`.
- **Status:** Fixed in Phase 3.

### BUG-019 (`S2` — Medium): Listener, `MomentumHover`, `Draggable`, and Resize Leaks on `/` Client-Side Swaps
- **Location:** `src/scripts/case-studies.ts:294–312, 540–645, 709–715, 736–740, 791–797`; `src/scripts/core/horizontal-loop.ts:135`
- **Repro:** Swap `/about` → `/` → `/about` → `/` → `/about` while tracking unique `EventTarget` listeners (`Map` matching native DOM deduplication).
- **Observed Evidence:** Active global listeners grew from `49` → `51` → `53` (`+1` `window:mousemove` per `/` visit from `ep.startTracking` / `MomentumHover`).
- **Root Cause:** `initMomentumHover()` returned `undefined` instead of the `MomentumHover` instance, so `initCaseStudies()` teardown never called `.destroy()`. Furthermore, `sliderDraggable`, `pageDraggable`, and `pageTimeline` were not killed on teardown, slide/filter listeners had no `AbortController`, and `horizontalLoop()` attached an unremovable anonymous `window` `resize` listener.
- **Status:** Fixed in Phase 3.

### BUG-020 (`S2` — Medium): Contact Form Hover/Focus Listeners Duplicate Across `1024px` Resizes & Leak on Swap
- **Location:** `src/scripts/contact.ts:78–105, 118, 141, 237–239`
- **Repro:** Resize viewport across `1024px` (`bp.lg`) multiple times on `/` or `/about`, or navigate across routes.
- **Root Cause:** Listeners inside `mm.add` (`mouseenter`/`mouseleave`/`focusin`/`focusout`) were not bound to an `AbortController` aborted in `mm`'s cleanup function; `hoverTween` was not killed on revert; `change`/`submit` listeners lacked teardown abort.
- **Status:** Fixed in Phase 3.

### BUG-021 (`S3` — Low): `hero.ts` Unremoved `ScrollTrigger` `'refresh'` Listener & Un-cleared Timeout in `destroy()`
- **Location:** `src/scripts/hero.ts:275, 456–471`
- **Root Cause:** `skipEntranceIfScrolled()` registered `ScrollTrigger.addEventListener('refresh', evaluate)` without removing it in `destroy()`, and `destroy()` did not clear `this.refreshTimeout`.
- **Status:** Fixed in Phase 3.

### BUG-022 (`S3` — Low): `keywords.ts` & `video-player.ts` Pending Timeout / Listener Teardown Gaps
- **Location:** `src/scripts/keywords.ts:142–162`; `src/scripts/video-player.ts:46–50, 213, 393–430`
- **Root Cause:** `keywords.ts` scheduled an un-cleared `setTimeout(..., 100)` inside `mm.add` that could fire after `mm.revert()`; `video-player.ts` attached DOM listeners on `video`, `player`, `controls` buttons without an `AbortController` and had an un-cleared announcement timeout.
- **Status:** Fixed in Phase 3.
