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
 *   bar and rail `aria-selected` stay in sync;
 * - two-phase visual swap (plan §5): the outgoing card fades up-and-out over
 *   140ms, THEN the incoming card fades in from below over 180ms — no
 *   crossfade ghosting. Nav info (numeral, bar, live region, aria-selected)
 *   updates immediately; only the visual classes are phased.
 * - rail (Amendment A): a listbox capped at 6 visible rows scrolling inside
 *   itself (≥768, vertical), a horizontal scroll-snap strip below 768. On
 *   every quote change the active row auto-scrolls into view inside the
 *   list only (scrollTop math, never the page); scroll cues (edge fades +
 *   "+N more") derive from the list's scroll position. Roving tabindex on
 *   the options; ArrowUp/Down/Home/End move the selection.
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
  const railOptions = Array.from(section.querySelectorAll<HTMLElement>('.tst-railOpt'));
  const moreBtn = section.querySelector<HTMLButtonElement>('.tst-railMore');
  const prevBtn = section.querySelector<HTMLButtonElement>('.tst-prev');
  const nextBtn = section.querySelector<HTMLButtonElement>('.tst-next');
  const live = section.querySelector<HTMLElement>('.tst-live');
  const indexNumeral = section.querySelector<HTMLElement>('.tst-index b');
  const bar = section.querySelector<HTMLElement>('.tst-bar');
  if (!stage || !railList || !cards.length || !railOptions.length || !prevBtn || !nextBtn) return;

  const total = cards.length;
  let current = Math.max(0, cards.findIndex((c) => c.classList.contains('is-active')));

  const pad2 = (n: number) => String(n).padStart(2, '0');

  // Stage height = the TALLEST quote's content (Amendment A: content-sized
  // card, no floors). It must not depend on which quote is active, or every
  // quote change shifts the page (CLS). All cards are `position: absolute;
  // inset: 0` (they fill the stage), so a card's own scrollHeight tracks
  // the stage's CURRENT height — measuring it would pin the stage to its
  // previous size forever (it could grow but never shrink). Measure natural
  // content instead: clone each inner at height:auto into a hidden probe at
  // the stage's width. Runs on init/resize/fonts.ready only — 8 small
  // clones per call.
  const equalizeStageHeight = () => {
    if (!stage) return;
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
    const maxH = Math.max(...contentH);
    if (maxH > 0) stage.style.height = `${maxH}px`;
  };
  equalizeStageHeight();
  const onResize = () => {
    equalizeStageHeight();
    updateListCues();
  };
  window.addEventListener('resize', onResize);
  // Quote metrics settle again once webfonts swap in.
  document.fonts?.ready.then(() => {
    equalizeStageHeight();
    updateListCues();
  }).catch(() => {});

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

  // Listbox selection sync (Amendment A): class + aria-selected + roving
  // tabindex (active option is the only tab stop, so the scroll container
  // itself needs no tabindex).
  const setSelection = (opts: HTMLElement[]) =>
    opts.forEach((opt, i) => {
      const on = i === current;
      opt.classList.toggle('is-active', on);
      opt.setAttribute('aria-selected', on ? 'true' : 'false');
      opt.tabIndex = on ? 0 : -1;
    });

  // Scroll the active row into view INSIDE the list only — direct
  // scrollTop/scrollLeft math (never scrollIntoView, which can scroll
  // ancestor/page scrollers). `nearest` semantics: no movement when the row
  // is already visible; wrapping 8→1 lands on scrollTop 0 naturally (row 0
  // is above the viewport then). Vertical ≥768, horizontal strip below.
  const mqStrip = window.matchMedia('(max-width: 767px)');
  const EDGE = 12; // breathing room past the list padding
  const scrollOptionIntoView = (idx: number, behavior: ScrollBehavior) => {
    if (!railList) return;
    const row = railOptions[idx];
    if (!row) return;
    if (mqStrip.matches) {
      const left = row.offsetLeft;
      let target: number | null = null;
      if (left < railList.scrollLeft + 4) target = left - EDGE;
      else if (left + row.offsetWidth > railList.scrollLeft + railList.clientWidth - 4)
        target = left + row.offsetWidth - railList.clientWidth + EDGE;
      if (target === null) return;
      railList.scrollTo({ left: Math.max(0, Math.min(target, railList.scrollWidth - railList.clientWidth)), behavior });
    } else {
      const top = row.offsetTop;
      let target: number | null = null;
      if (top < railList.scrollTop + 4) target = top - EDGE;
      else if (top + row.offsetHeight > railList.scrollTop + railList.clientHeight - 4)
        target = top + row.offsetHeight - railList.clientHeight + EDGE;
      if (target === null) return;
      railList.scrollTo({ top: Math.max(0, Math.min(target, railList.scrollHeight - railList.clientHeight)), behavior });
    }
  };

  const go = (n: number, opts: { focus?: boolean; listScroll?: ScrollBehavior } = {}) => {
    if (phaseTimer) {
      clearTimeout(phaseTimer);
      phaseTimer = null;
      completeSwap(); // finish the in-flight swap instantly (its target is `current`)
    }
    const target = ((n % total) + total) % total;
    if (target === current) return;
    const from = current;
    current = target;

    setSelection(railOptions);
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
    // NOTE: equalizeStageHeight() is deliberately NOT called here — the
    // stage size is the max over ALL cards at a constant width, so it can't
    // change between navigations (review fix; it runs on
    // init/resize/fonts.ready only, see above).
    // Active row follows inside the list (never the page). Default smooth;
    // init/deep-link pass 'auto'; reduced motion hard-cuts.
    scrollOptionIntoView(current, opts.listScroll ?? (prefersReducedMotion() ? 'auto' : 'smooth'));
    // Focus follows programmatic changes (keyboard/prev-next) — never a
    // swipe, and never a list click/keyboard (the option keeps focus there).
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
    const opt = (e.target as HTMLElement | null)?.closest<HTMLElement>('.tst-railOpt');
    if (!opt) return;
    const i = railOptions.indexOf(opt);
    if (i >= 0) go(i, { focus: false, listScroll: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  // Listbox keyboard (Amendment A): ArrowUp/Down move the selection (and
  // auto-scroll the list), Home/End jump. Focus STAYS on the option (roving
  // tabindex; APG listbox pattern). Left/Right remain section-level.
  const onListKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    let next: number;
    if (e.key === 'ArrowDown') next = Math.min(total - 1, current + 1);
    else if (e.key === 'ArrowUp') next = Math.max(0, current - 1);
    else if (e.key === 'Home') next = 0;
    else next = total - 1;
    if (next === current) return;
    go(next, { listScroll: prefersReducedMotion() ? 'auto' : 'smooth' });
    // preventScroll: a synchronous focus() would snap the list instantly and
    // cancel the smooth glide go() just started (review fix).
    railOptions[next]?.focus({ preventScroll: true });
  };

  // Scroll cues (Amendment A): bottom fade while rows exist below, top fade
  // when scrolled down; the "+N more" button counts rows fully below the
  // fold (computed from offsets — never hardcoded). On the horizontal strip
  // (<768), mirror the same edge mask left/right from scrollLeft.
  const updateListCues = () => {
    if (!railList) return;
    if (mqStrip.matches) {
      railList.classList.remove('is-fadeTop', 'is-fadeBottom');
      const maxLeft = Math.max(0, railList.scrollWidth - railList.clientWidth);
      railList.classList.toggle('is-fadeLeft', maxLeft > 2 && railList.scrollLeft > 2);
      railList.classList.toggle('is-fadeRight', maxLeft > 2 && railList.scrollLeft < maxLeft - 2);
      if (moreBtn) moreBtn.hidden = true;
      return;
    }
    railList.classList.remove('is-fadeLeft', 'is-fadeRight');
    const bottomEdge = railList.scrollTop + railList.clientHeight;
    let hidden = 0;
    for (const row of railOptions) if (row.offsetTop >= bottomEdge - 1) hidden++;
    railList.classList.toggle('is-fadeBottom', hidden > 0);
    railList.classList.toggle('is-fadeTop', railList.scrollTop > 1);
    if (moreBtn) {
      if (hidden > 0) {
        moreBtn.hidden = false;
        moreBtn.textContent = `+${hidden} more`;
        moreBtn.setAttribute('aria-label', `Show ${hidden} more quotes`);
      } else {
        // Hiding a focused button drops focus to <body> (review fix) — hand
        // focus to the active option first (roving tabindex keeps it in the
        // listbox).
        if (moreBtn.matches(':focus')) railOptions[current]?.focus({ preventScroll: true });
        moreBtn.hidden = true;
      }
    }
  };
  const onMoreClick = () => {
    if (!railList) return;
    railList.scrollBy({ top: railList.clientHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
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
    if (i >= 0 && i !== current) go(i, { listScroll: 'auto' }); // deep link: jump, no animation
  };
  fromHash();
  updateListCues();

  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);
  railList.addEventListener('click', onRailClick);
  railList.addEventListener('keydown', onListKeyDown);
  railList.addEventListener('scroll', updateListCues, { passive: true });
  moreBtn?.addEventListener('click', onMoreClick);
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
    railList.removeEventListener('keydown', onListKeyDown);
    railList.removeEventListener('scroll', updateListCues);
    moreBtn?.removeEventListener('click', onMoreClick);
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerup', onPointerUp);
    stage.removeEventListener('pointercancel', onPointerCancel);
    section.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('hashchange', fromHash);
    window.removeEventListener('resize', onResize);
  };
}
