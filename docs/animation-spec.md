# 1minus1 Frontpage — Complete Animation & WebGL Specification

This document catalogues every animation, custom ease, GSAP timeline, `ScrollTrigger`, `SplitText`, `Draggable`, `Flip`, and Three.js / GLSL shader ported from `https://1minus1.com/` into the Astro codebase.

---

## 1. Core GSAP & Smooth Scroll (`src/scripts/core/gsap.ts`, `src/scripts/smooth-scroll.ts`)

### Custom Eases
| Ease Name | Cubic Bezier Control Points |
| :--- | :--- |
| `smooth` | `0.5, 0, 0, 1` |
| `smooth-2` | `0.63, 0, 0, 1` |
| `smooth-3` | `0.72, 0, 0, 1` |
| `slowDown` | `0, 0, 0, 1` |
| `slowDown-2` | `0, 0.45, 0, 1` |
| `accelerate` | `1, 0, 1, 1` |
| `natural` | `0.8, 0, 0.2, 1` |

### Breakpoints (`bp`)
- `xs`: `456px`, `sm`: `640px`, `md`: `768px`, `lg`: `1024px`, `xl`: `1280px`, `2xl`: `1440px`, `3xl`: `1660px`, `4xl`: `1920px`

### Lenis Smooth Scroll
- Initialized with `autoRaf: false`, `anchors: true`, `prevent: (node) => node.id === 'modal'`, `stopInertiaOnNavigate: true`.
- Driven by `gsap.ticker.add((t) => lenis.raf(t * 1000))` with `gsap.ticker.lagSmoothing(0)` and `lenis.on('scroll', ScrollTrigger.update)`.

---

## 2. Loader Overlay (`src/scripts/loader.ts`)

- **3-stage box expansion** on `.parts-loader__box`:
  - Stage 1 (`0.8s`, `smooth`): `270×200` (desktop) / `200×120` (mobile)
  - Stage 2 (`0.8s`, `smooth`): `620×375` (desktop) / `300×240` (mobile)
  - Stage 3 (`0.8s`, `smooth-3`): `100vw × 100vh`, `borderRadius: 0`
- **Live readout**: `onUpdate` updates `.parts-loader__width` and `.parts-loader__height` with `offsetWidth`/`offsetHeight` padded to 4 digits.
- **`SplitText` heading transitions**:
  - `"Hold Tight"` chars slide in (`y: ±100%`, `stagger: { each: 0.03, from: 'random' }`), then exit (`y: ±100%`) as `"Almost Ready"` chars enter (`<+0.15`), then exit before Stage 3 completes.
- Emits `transition-entrance-done` and `hero-transition-start` on `bus`, triggering the Hero entrance at `>-0.55`.

---

## 3. Header & Animated Logo (`src/scripts/menu.ts`, `src/scripts/buttons.ts`)

- **AnimatedLogo**:
  - Toggles `bg-white/70 backdrop-blur-xl` when scrolled past `top -5px`.
  - Tracks `[data-theme]` sections (`start: 'top ' + logo.offsetHeight`, `end: 'bottom ' + logo.offsetHeight`) to switch between `text-white` and `text-darkPurple`.
- **Mobile Menu**:
  - `.background` enters from `yPercent: -100, rotate: 6, duration: 1, ease: 'elastic.out(1, 0.9)'`.
  - `.link` items stagger in (`yPercent: 100, stagger: 0.05, duration: 0.6, ease: 'smooth'`).
  - Reverses at `timeScale(1.8)` on close.
- **Button Char Hover (`src/scripts/buttons.ts`)**:
  - `.part-btnPrimary`, `.parts-btnBlock`, `.parts-btnText`, `.parts-btnScrollTop`: `SplitText` (`type: 'chars'`) on primary & duplicate labels, sliding `yPercent: -100, stagger: 0.03, duration: 0.2`.

---

## 4. Hero, Showreel Video Player & Services (`src/scripts/hero.ts`, `src/scripts/video-player.ts`, `src/scripts/services.ts`, `src/scripts/smiley-text.ts`)

- **Hero Entrance (`src/scripts/hero.ts`)**:
  - `"DISTINCT"` and `"ALWAYS"` split with `SplitText` (`type: 'lines,chars'`), with desktop kerning adjustments on `W` (`marginRight: -70, marginLeft: -90`) and `Y` (`marginRight: -20, marginLeft: -80`).
  - Scales from `0.1` (`duration: 1, ease: 'smooth'`) while chars stagger from `±100%` (`duration: 0.7, ease: 'slowDown', stagger: { each: 0.03, from: 'random' }`).
  - `.start` preview video enters from `x: 600, y: 150, duration: 1.5, ease: 'elastic.out(1, 1)'`.
  - Triggers `playTimeline-hero-smileyText` on `bus`.
- **SmileyText & SmileyPill (`src/scripts/smiley-text.ts`)**:
  - Replaces `**purple-4**` (Hero) and `**purple-3**` (Contact) with `.parts-smileyPill` containing seeded-random smiley SVGs (`SmileyOne`, `SmileyTwo`, `SmileyThree`) with rotations (`rotate-60`, `-rotate-90`, `-rotate-15`).
  - Splits lines (`mask: 'lines'`), animating lines from `y: '100%'` (`duration: 1, stagger: 0.1, ease: 'slowDown'`) and pills from `clipPath: inset(0 X% 0 0 round 23px)` with icons popping in (`x: -10, rotate: -50, opacity: 0, ease: 'back.out(2)'`).
- **Scroll-Scrubbed Video Morph (`src/scripts/hero.ts`)**:
  - Scrubs `.start` (desktop) / `.start-mobile` (mobile) into the full-bleed `.end` slot (`scrub: 0.5`), interpolating `x`, `y`, `scaleX`, `scaleY`, `rotate: 0`, and `borderRadius: 0` while `"DISTINCT"` and `"ALWAYS"` slide apart (`x: ∓offsetWidth * 0.75`).
  - Pins `.parts-webglVideoPlayer` across `.pin-trigger` while Services cards scroll over it.
- **WebGL Video Player (`src/scripts/video-player.ts`)**:
  - Reveals `.play-button` at `bottom 70%` (`BtnVideoPlayer` inner width expansion + text slide) and hides the header via `toggleheader`.
  - Plays full showreel (`3a265a95e25bd70a0242eb3a163a177b.mp4`) with custom progress bar, timestamp, and volume controls.
- **Services Cards (`src/scripts/services.ts`)**:
  - Alternating entrance (`rotate: ∓8, xPercent: ±10` from `top bottom` to `bottom 90%`) and exit (`rotate: ±8, xPercent: ±10` from `top 60%` to `top -20%`).

---

## 5. Case Studies (`src/scripts/case-studies.ts`)

- **Heading Scrub**: `"OUR"` (`x: 30`) and `"WORK"` (`x: -30`) scrub across `.sections-caseStudies__top`.
- **Desktop Sticker Mouse Trail (`StickerMouseTrail`)**:
  - Pool of 32 sticker clones from `.sticker`.
  - Fires a 3-sticker burst (`createBurst(3)`) when `.mouse-target` enters at `top center`.
  - Spawns stickers on `mousemove` when pointer travel exceeds `targetRect.width / 6`, animating scale `0.5 -> 1` (`slowDown`, `0.2s`), velocity travel (`power4.out`, `1.2s`), and scale-down exit.
- **Mobile Sticker Slider**: Seamless horizontal loop (`xPercent: -50, duration: 25, repeat: -1`).
- **CaseStudySlider**:
  - `Draggable` (`type: 'x'`, `inertia: true`, `throwResistance: 2500`, snap to card pitch) synced with dynamic pagination dots and draggable `.parts-caseStudySlider__paginationControl`.
  - Card entrance stagger (`x: 120, stagger: 0.1, duration: 1.4, ease: 'slowDown-2'`), `MomentumHover` (`InertiaPlugin` velocity hover on `.parts-caseStudyCard__inner`), and `SplitText` title hover.
  - Category filters (`All`, `Brand`, `Web`, `Marketing`) with shuffled elastic scale-out (`elastic.in(1.05, 0.65)`) and scale-in (`elastic.out(1.1, 0.65)`).

---

## 6. Testimonials (`src/scripts/testimonials.ts`)

- **Deterministic 2D Canvas Placement**:
  - `placeCards` (`canvasSize: 3200, minGap: 180, centerHeightRatio: 0.7, seed: 10, angleSeed: 2, radiusSeed: 4`) positions the 9 `.sections-testimonials__card` elements without overlap around card 0.
  - `placeStickers` places the 9 `.sections-testimonials__sticker` elements in a shuffled grid avoiding cards and other stickers.
- **2D Draggable + Minimap**:
  - `Draggable` on `.sections-testimonials__overlay` (`inertia: true, dragResistance: 0.5, edgeResistance: 0.65`) synced bidirectionally with `.parts-testimonialMiniMap__cross`.
  - `gsap.ticker` updates per-card lagged offsets (`followStrength: 0.1, stagger: 0.025`), velocity tilt (`±6deg`), and drag scale (`0.96`).
- **MarqueeCursor**: `"Drag To Navigate"` pill follows pointer over `[data-cursor-target]` and hides over `[data-cursor-prevent]`.

---

## 7. Contact Form, Footer & Cookie Banner (`src/scripts/contact.ts`, `src/scripts/footer.ts`, `src/scripts/cookies.ts`)

- **Contact Form**:
  - Heading scrub (`x: ±75`) on `"DROP US"` / `"A LINE"`.
  - `.parts-form` scroll rotation (`12deg -> 8deg`) smoothly interpolated to `0deg` (`duration: 0.6, ease: 'smooth-2'`) on hover or focus.
- **Footer**:
  - `-100%` `yPercent` parallax reveal on `.structure-footer__inner`.
  - Infinite horizontal marquee on `.structure-footer__marquee`.
  - Non-overlapping placement of `.structure-footer__social` pills + global `InertiaPlugin` hover (`src/scripts/keywords.ts`).
- **Cookie Banner**:
  - Entrance slide-in (`x: 150%, rotate: -15`) and `Flip.from` morph when expanding `"Manage"` preferences.

---

## 8. Three.js & GLSL Shaders (`src/scripts/webgl/experience.ts`)

- **Dual Fullscreen Canvases**: Foreground (`z-10`) and Background (`z-0`) orthographic WebGL scenes synced to Lenis scroll (`camera.position.y = -scrollY`).
- **`TouchTexture` (`TOUCH_VERTEX_SHADER` / `TOUCH_FRAGMENT_SHADER`)**: 150 mouse-trail wave meshes (`scale: 125`, `visibilityDuration: 0.7s`) rendered into a `50 × (50 * aspect)` render target.
- **`WebGLBackground` (`BG_VERTEX_SHADER` / `BG_FRAGMENT_SHADER`)**: Quantizes screen UVs into `25px` blocks (`pixelateUV`), sampling `uMouseTexture` with `step(0.2, ...)` to mix `uColor` and `uTrailColor` (`oklch` / `rgb` parsed into linear-to-sRGB `THREE.Color`).
- **`WebGLTrail` (`TRAIL_VERTEX_SHADER` / `TRAIL_FRAGMENT_SHADER`)**: Parses SVG `<path>` commands into `CatmullRomCurve3` with `100` `InstancedMesh` planes and per-instance `instanceOpacity` attribute buffers.
