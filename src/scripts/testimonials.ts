/**
 * Testimonials — editorial spotlight (Concept A), Phase 1.
 *
 * docs/plans/testimonials-redesign-plan.md §8: the section is a static
 * spotlight render in Phase 1 — the first card is server-rendered active
 * (`is-active` + `aria-hidden` handled in the Astro markup) and the
 * prev/next/rail controls are inert until Phase 2 wires the carousel state
 * machine (clicks, ArrowLeft/Right, swipe, deep links, live region).
 *
 * The drag-canvas implementation (placeCards/placeStickers, both Draggables,
 * minimap sync, per-frame ticker, initMarqueeCursor) was deleted with the old
 * markup in this phase. `initTestimonials()` must exist and return a teardown
 * function — it is registered in `main.ts` boot + `onAfterSwap` (unchanged).
 */
export function initTestimonials(): (() => void) | void {
  const section = document.querySelector<HTMLElement>('.tst-band');
  if (!section) return;

  // Phase 2 will attach listeners and own the state machine. Nothing to
  // tear down in the static render yet.
  return () => {};
}
