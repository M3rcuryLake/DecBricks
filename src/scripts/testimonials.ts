/**
 * Testimonials — editorial spotlight (Concept A), Phase 2: interaction.
 *
 * Carousel state machine (docs/plans/testimonials-redesign-plan.md §6/§8):
 * - prev/next + rail clicks, ArrowLeft/Right scoped to the section (focus
 *   follows to the featured card, which is `tabindex="-1"`);
 * - pointer swipe on the stage (48px horizontal-dominant threshold, `pan-y`
 *   `touch-action` keeps vertical scroll native); swipe never moves focus,
 *   and once horizontal intent is detected text selection is suppressed so
 *   an accidental drag doesn't fight the swipe (`.is-swiping` guard);
 * - deep link: `location.hash` `#t-3` opens that quote on init (also across
 *   client-side page swaps, since `initTestimonials()` re-runs after each
 *   swap). The URL is never written — read-only deep link (decision logged
 *   in docs/Design-handoff.md);
 * - `aria-live` status line announces "Quote N of 8"; index numeral, progress
 *   bar and rail `aria-current` stay in sync;
 * - mobile rail disclosure: collapsed by default <1024px once JS is present
 *   (no-JS mobile keeps the rail open), toggled via `.tst-railToggle`.
 *
 * No autoplay anywhere. Pure class/attribute toggles — no GSAP; the CSS
 * transitions (and their reduced-motion zeroing) live in `decbricks.css`.
 * `initTestimonials()` must exist and return a teardown function — it is
 * registered in `main.ts` boot + `onAfterSwap` (unchanged).
 */

import { prefersReducedMotion } from './core/gsap';
import { MomentumHover } from './core/momentum-hover';

const SWIPE_THRESHOLD = 48; // px, horizontal-dominant

export function initTestimonials(): (() => void) | void {
  const section = document.querySelector<HTMLElement>('.tst-band');
  if (!section) return;

  const stage = section.querySelector<HTMLElement>('.tst-stage');
  const cards = Array.from(section.querySelectorAll<HTMLElement>('.tst-card'));
  const rail = section.querySelector<HTMLElement>('.tst-rail');
  const railList = section.querySelector<HTMLElement>('.tst-railList');
  const railButtons = Array.from(section.querySelectorAll<HTMLButtonElement>('.tst-railBtn'));
  const prevBtn = section.querySelector<HTMLButtonElement>('.tst-prev');
  const nextBtn = section.querySelector<HTMLButtonElement>('.tst-next');
  const toggle = section.querySelector<HTMLButtonElement>('.tst-railToggle');
  const live = section.querySelector<HTMLElement>('.tst-live');
  const indexNumeral = section.querySelector<HTMLElement>('.tst-index b');
  const bar = section.querySelector<HTMLElement>('.tst-bar');
  if (!stage || !railList || !cards.length || !railButtons.length || !prevBtn || !nextBtn) return;

  const total = cards.length;
  let current = Math.max(0, cards.findIndex((c) => c.classList.contains('is-active')));

  const pad2 = (n: number) => String(n).padStart(2, '0');

  // Stage height must not depend on which quote is active, or every quote
  // change shifts the page (CLS). Inactive cards are `position: absolute;
  // inset: 0`, so their content height is only visible via scrollHeight —
  // raise the stage to the tallest quote (Phase 3 motion polish: swaps are
  // then pure opacity/transform with zero layout shift).
  const STAGE_MIN_H = 340;
  // ≥1024 the rail is a right column: pin it to the stage's height so the
  // list scrolls internally instead of driving the section height (plan:
  // testimonials-rail-kinetic §Task 2). Below 1024 the grid stacks — no pin.
  const mqDesktop = window.matchMedia('(min-width: 1024px)');
  const equalizeStageHeight = () => {
    if (!stage) return;
    const maxH = cards.reduce((m, c) => Math.max(m, c.scrollHeight), STAGE_MIN_H);
    if (maxH > 0) stage.style.minHeight = `${maxH}px`;
    if (rail) {
      rail.style.height = mqDesktop.matches ? `${Math.round(stage.getBoundingClientRect().height)}px` : '';
    }
  };
  equalizeStageHeight();
  window.addEventListener('resize', equalizeStageHeight);
  // Quote metrics settle again once webfonts swap in.
  document.fonts?.ready.then(equalizeStageHeight).catch(() => {});

  const go = (n: number, opts: { focus?: boolean } = {}) => {
    const previous = current;
    current = ((n % total) + total) % total;
    cards.forEach((card, i) => {
      const on = i === current;
      card.classList.toggle('is-active', on);
      card.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    railButtons.forEach((btn, i) => {
      const on = i === current;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-current', on ? 'true' : 'false');
    });
    const active = cards[current];
    if (indexNumeral) {
      indexNumeral.textContent = pad2(current + 1);
      // Micro-crossfade on the numeral only (skipped for reduced motion by CSS).
      if (current !== previous) {
        indexNumeral.classList.remove('is-swap');
        void indexNumeral.offsetWidth; // restart the CSS animation
        indexNumeral.classList.add('is-swap');
      }
    }
    if (bar) bar.style.width = `${((current + 1) / total) * 100}%`;
    if (live) live.textContent = `Quote ${current + 1} of ${total}`;
    equalizeStageHeight();
    // Focus follows programmatic changes (keyboard/rail/buttons) — never a swipe.
    if (opts.focus && active) active.focus({ preventScroll: true });
  };

  const onPrev = () => go(current - 1, { focus: true });
  const onNext = () => go(current + 1, { focus: true });

  const onRailClick = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>('.tst-railBtn');
    if (!btn) return;
    const i = railButtons.indexOf(btn);
    if (i >= 0) go(i, { focus: true });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (!section.contains(e.target as Node)) return;
    e.preventDefault();
    if (e.key === 'ArrowLeft') onPrev();
    else onNext();
  };

  let swipeStart: { x: number; y: number } | null = null;
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    swipeStart = { x: e.clientX, y: e.clientY };
  };
  // Horizontal-dominant intent (12px) mid-gesture: suppress accidental text
  // selection; never applied statically, so quotes remain selectable.
  const onPointerMove = (e: PointerEvent) => {
    if (!swipeStart) return;
    const dx = e.clientX - swipeStart.x;
    const dy = e.clientY - swipeStart.y;
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) stage.classList.add('is-swiping');
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!swipeStart) return;
    const dx = e.clientX - swipeStart.x;
    const dy = e.clientY - swipeStart.y;
    stage.classList.remove('is-swiping');
    swipeStart = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
    go(dx < 0 ? current + 1 : current - 1); // no focus move on swipe
  };
  const onPointerCancel = () => {
    swipeStart = null;
    stage.classList.remove('is-swiping');
  };

  // Deep link: #t-3 opens quote 3. Read-only — the URL is never mutated.
  // `hashchange` covers history traversal (Back/Forward restoring /#t-3);
  // `initTestimonials()` re-running after client-side swaps covers the rest.
  const fromHash = () => {
    const m = /^#t-(\d+)$/.exec(window.location.hash || '');
    if (!m) return;
    const i = cards.findIndex((c) => c.id === `t-${m[1]}`);
    if (i >= 0 && i !== current) go(i);
  };
  fromHash();

  // Mobile rail disclosure: collapse by default on small viewports (JS only —
  // a no-JS mobile visit keeps the rail open). Per plan §4 the rail is open
  // above 768px; only <768 collapses. Desktop ignores the class entirely.
  const mqMobile = window.matchMedia('(max-width: 767px)');
  let collapsed = false;
  if (toggle && mqMobile.matches) {
    collapsed = true;
    rail?.classList.add('is-collapsed');
    toggle.setAttribute('aria-expanded', 'false');
  }
  const onToggle = () => {
    collapsed = !collapsed;
    rail?.classList.toggle('is-collapsed', collapsed);
    toggle?.setAttribute('aria-expanded', String(!collapsed));
  };

  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);
  railList.addEventListener('click', onRailClick);
  toggle?.addEventListener('click', onToggle);
  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerUp);
  stage.addEventListener('pointercancel', onPointerCancel);
  section.addEventListener('keydown', onKeyDown);
  window.addEventListener('hashchange', fromHash);

  // Kinetic hover (plan: testimonials-rail-kinetic §Task 1) — the template's
  // own MomentumHover (same split as CaseStudies: card outer / inner target,
  // so the CSS crossfade transform on the card is never fought by GSAP).
  // Calmer config than CaseStudies (10/7.5/50/270/15): quote cards are larger
  // and this section is the calm editorial one. Desktop + fine pointer only,
  // never under reduced motion.
  const mmHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let momentum: MomentumHover | null = null;
  if (!prefersReducedMotion() && window.innerWidth >= 1024 && mmHover.matches) {
    momentum = new MomentumHover(
      section,
      cards.map((card) => ({ element: card, target: card.querySelector<HTMLElement>('.tst-cardInner') })),
      { xyMultiplier: 7, rotationMultiplier: 4.5, inertiaResistance: 90, clampXY: 120, clampRotation: 7 }
    );
  }

  return () => {
    momentum?.destroy();
    prevBtn.removeEventListener('click', onPrev);
    nextBtn.removeEventListener('click', onNext);
    railList.removeEventListener('click', onRailClick);
    toggle?.removeEventListener('click', onToggle);
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerup', onPointerUp);
    stage.removeEventListener('pointercancel', onPointerCancel);
    section.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('hashchange', fromHash);
    window.removeEventListener('resize', equalizeStageHeight);
  };
}
