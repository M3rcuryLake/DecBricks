/**
 * Testimonials — editorial spotlight (upgrade plan: stage + identity rail).
 *
 * Carousel state machine (docs/plans/testimonials-upgrade-plan.md §5):
 * - prev/next + rail/dot clicks, ArrowLeft/Right scoped to the section (focus
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
 *   bar and rail/dot `aria-current` stay in sync;
 * - two-phase visual swap (plan §5): the outgoing card fades up-and-out over
 *   140ms, THEN the incoming card fades in from below over 180ms — no
 *   crossfade ghosting. Nav info (numeral, bar, live region, aria-current)
 *   updates immediately; only the visual classes are phased.
 * - rail is a desktop (≥1024) identity list; below 1024 it is CSS-hidden and
 *   the `.tst-dot` buttons are the selector (synced with swipe). No
 *   disclosure toggle, no rail height pin (upgrade plan supersedes P6).
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
  const railList = section.querySelector<HTMLElement>('.tst-railList');
  const railButtons = Array.from(section.querySelectorAll<HTMLButtonElement>('.tst-railBtn'));
  const dotsWrap = section.querySelector<HTMLElement>('.tst-dots');
  const navDots = Array.from(section.querySelectorAll<HTMLButtonElement>('.tst-dots .tst-dot'));
  const prevBtn = section.querySelector<HTMLButtonElement>('.tst-prev');
  const nextBtn = section.querySelector<HTMLButtonElement>('.tst-next');
  const live = section.querySelector<HTMLElement>('.tst-live');
  const indexNumeral = section.querySelector<HTMLElement>('.tst-index b');
  const bar = section.querySelector<HTMLElement>('.tst-bar');
  if (!stage || !railList || !cards.length || !railButtons.length || !navDots.length || !prevBtn || !nextBtn) return;

  const total = cards.length;
  let current = Math.max(0, cards.findIndex((c) => c.classList.contains('is-active')));

  const pad2 = (n: number) => String(n).padStart(2, '0');

  // Stage height must not depend on which quote is active, or every quote
  // change shifts the page (CLS). All cards are `position: absolute;
  // inset: 0` (they fill the stage), so their content height is only
  // visible via scrollHeight — set the stage to the tallest quote (P3
  // machinery, kept; explicit height so cards always fill it). ≥1024 the
  // identity rail (8 rows) sits beside the stage: the floor is raised so
  // neither column starves (upgrade plan §5). Below 1024 the grid stacks —
  // the old 340px floor applies. (The P6 rail height pin is gone: identity
  // rows fit the stage naturally, and the pin was the cramping root cause.)
  const STAGE_MIN_H = 260; // mobile safety floor (tallest placeholder quote is ~342/208)
  const STAGE_MIN_H_DESKTOP = 480; // balances the ~448px identity rail (upgrade plan §5)
  const mqDesktop = window.matchMedia('(min-width: 1024px)');
  const equalizeStageHeight = () => {
    if (!stage) return;
    // Cards are `position: absolute; inset: 0` (they fill the stage), so a
    // card's own scrollHeight tracks the stage's CURRENT height — measuring
    // it would pin the stage to its previous size forever (it could grow
    // but never shrink). Measure natural content instead: clone each inner
    // at height:auto into a hidden probe at the stage's width. Runs on
    // init/resize/fonts.ready only — 8 small clones per call.
    const probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;';
    document.body.appendChild(probe);
    probe.style.width = `${stage.clientWidth}px`;
    const contentH = cards.map((card) => {
      const inner = card.querySelector('.tst-cardInner');
      if (!inner) return 0;
      const clone = inner.cloneNode(true) as HTMLElement;
      clone.style.height = 'auto';
      probe.appendChild(clone);
      const h = Math.ceil(clone.getBoundingClientRect().height);
      clone.remove();
      return h;
    });
    probe.remove();
    const maxH = Math.max(...contentH, mqDesktop.matches ? STAGE_MIN_H_DESKTOP : STAGE_MIN_H);
    if (maxH > 0) stage.style.height = `${maxH}px`;
  };
  equalizeStageHeight();
  window.addEventListener('resize', equalizeStageHeight);
  // Quote metrics settle again once webfonts swap in.
  document.fonts?.ready.then(equalizeStageHeight).catch(() => {});

  // Two-phase swap (upgrade plan §5): nav info syncs immediately; visuals
  // run leave (140ms) → enter (180ms), CSS-timed in decbricks.css. Rapid
  // nav mid-phase force-completes the pending swap first, so exactly one
  // card is ever leaving and end state stays consistent. Reduced motion
  // skips the phase entirely (CSS transitions are zeroed there — a 140ms
  // blank stage between the cut would otherwise read as a flicker).
  const LEAVE_MS = prefersReducedMotion() ? 0 : 140;
  let phaseTimer: ReturnType<typeof setTimeout> | null = null;
  const completeSwap = () => {
    phaseTimer = null;
    cards.forEach((card, i) => {
      const on = i === current;
      card.classList.toggle('is-active', on);
      card.classList.remove('is-leaving');
      card.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
  };

  const setSelection = (btns: HTMLButtonElement[]) =>
    btns.forEach((btn, i) => {
      const on = i === current;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-current', on ? 'true' : 'false');
    });

  const go = (n: number, opts: { focus?: boolean } = {}) => {
    if (phaseTimer) {
      clearTimeout(phaseTimer);
      phaseTimer = null;
      completeSwap(); // finish the in-flight swap instantly (its target is `current`)
    }
    const target = ((n % total) + total) % total;
    if (target === current) return;
    const from = current;
    current = target;

    setSelection(railButtons);
    setSelection(navDots);
    cards.forEach((card, i) => card.setAttribute('aria-hidden', i === current ? 'false' : 'true'));
    const active = cards[current];
    if (indexNumeral) {
      indexNumeral.textContent = pad2(current + 1);
      // Micro-crossfade on the numeral only (skipped for reduced motion by CSS).
      indexNumeral.classList.remove('is-swap');
      void indexNumeral.offsetWidth; // restart the CSS animation
      indexNumeral.classList.add('is-swap');
    }
    if (bar) bar.style.width = `${((current + 1) / total) * 100}%`;
    if (live) live.textContent = `Quote ${current + 1} of ${total}`;
    equalizeStageHeight();
    // Focus follows programmatic changes (keyboard/rail/buttons) — never a swipe.
    if (opts.focus && active) active.focus({ preventScroll: true });

    const outgoing = cards[from];
    if (LEAVE_MS === 0) {
      completeSwap();
      return;
    }
    outgoing.classList.add('is-leaving');
    phaseTimer = setTimeout(completeSwap, LEAVE_MS);
  };

  const onPrev = () => go(current - 1, { focus: true });
  const onNext = () => go(current + 1, { focus: true });

  const onRailClick = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>('.tst-railBtn');
    if (!btn) return;
    const i = railButtons.indexOf(btn);
    if (i >= 0) go(i, { focus: true });
  };

  const onDotClick = (e: MouseEvent) => {
    const btn = (e.target as HTMLElement | null)?.closest<HTMLButtonElement>('.tst-dot');
    if (!btn) return;
    const i = navDots.indexOf(btn);
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

  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);
  railList.addEventListener('click', onRailClick);
  dotsWrap?.addEventListener('click', onDotClick);
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
    if (phaseTimer) clearTimeout(phaseTimer);
    prevBtn.removeEventListener('click', onPrev);
    nextBtn.removeEventListener('click', onNext);
    railList.removeEventListener('click', onRailClick);
    dotsWrap?.removeEventListener('click', onDotClick);
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerup', onPointerUp);
    stage.removeEventListener('pointercancel', onPointerCancel);
    section.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('hashchange', fromHash);
    window.removeEventListener('resize', equalizeStageHeight);
  };
}
