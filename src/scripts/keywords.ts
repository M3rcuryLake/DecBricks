import { gsap, bp, prefersReducedMotion } from './core/gsap';

const config = {
  xyMultiplier: 30,
  rotationMultiplier: 20,
  inertiaResistance: 200,
  clampXY: 200,
  clampRotation: 60,
};

const clampXY = gsap.utils.clamp(-config.clampXY, config.clampXY);
const clampRotation = gsap.utils.clamp(-config.clampRotation, config.clampRotation);

let velocity = { x: 0, y: 0 };
let position = { x: 0, y: 0 };
let lastUpdate = 0;
const throttleMs = 16;
let debouncedRecache: gsap.core.Tween | null = null;

const innerEls = new WeakMap<HTMLElement, HTMLElement>();
const elementCenters = new WeakMap<HTMLElement, { x: number; y: number }>();
let centersNeedUpdate = true;

let els: HTMLElement[] = [];

function handleScroll() {
  centersNeedUpdate = true;
  if (debouncedRecache) debouncedRecache.restart(true);
}

function handleMouseMove(e: MouseEvent) {
  const now = performance.now();
  if (now - lastUpdate < throttleMs) return;
  lastUpdate = now;
  velocity.x = e.clientX - position.x;
  velocity.y = e.clientY - position.y;
  position.x = e.clientX;
  position.y = e.clientY;
}

function calculateElementCenter(el: HTMLElement) {
  const { left, top, width, height } = el.getBoundingClientRect();
  return { x: left + width / 2, y: top + height / 2 };
}

function updateElementCenter(el: HTMLElement) {
  const center = calculateElementCenter(el);
  elementCenters.set(el, center);
}

function cacheElementCenters() {
  if (!els.length) return;
  els.forEach((el) => {
    const inner = innerEls.get(el);
    if (inner) {
      const center = calculateElementCenter(inner);
      elementCenters.set(inner, center);
    }
  });
  centersNeedUpdate = false;
}

function getOffsetFromCenter(e: MouseEvent, center: { x: number; y: number }) {
  return { x: e.clientX - center.x, y: e.clientY - center.y };
}

function calculateRotation(offset: { x: number; y: number }) {
  const cross = offset.x * velocity.y - offset.y * velocity.x;
  const d2 = offset.x * offset.x + offset.y * offset.y;
  return d2 < 1 ? 0 : (cross / Math.sqrt(d2)) * config.rotationMultiplier;
}

function calculateVelocities(rotation: number) {
  return {
    x: clampXY(velocity.x * config.xyMultiplier),
    y: clampXY(velocity.y * config.xyMultiplier),
    rotation: clampRotation(rotation),
  };
}

function applyInertiaAnimation(target: HTMLElement, velocities: ReturnType<typeof calculateVelocities>) {
  gsap.to(target, {
    inertia: {
      x: { velocity: velocities.x, end: 0 },
      y: { velocity: velocities.y, end: 0 },
      rotation: { velocity: velocities.rotation, end: 0 },
      resistance: config.inertiaResistance,
    },
  });
}

function handleMouseEnter(e: MouseEvent) {
  if (e.target === document || !innerEls) return;
  const target = (e.target as HTMLElement | null)?.closest<HTMLElement>(
    '.parts-keyword, .structure-footer__social'
  );
  if (!target) return;
  const inner = innerEls.get(target) || target;
  if (!inner) return;
  if (centersNeedUpdate) updateElementCenter(inner);
  const center = elementCenters.get(inner);
  if (!center) return;
  const offset = getOffsetFromCenter(e, center);
  const rotation = calculateRotation(offset);
  const velocities = calculateVelocities(rotation);
  applyInertiaAnimation(inner, velocities);
}

export function initKeywords() {
  const section = document.body;
  if (!section) return;

  const mm = gsap.matchMedia();
  mm.add(
    {
      isDesktop: `(min-width: ${bp.lg}px)`,
      isMobile: `(max-width: ${bp.lg - 1}px)`,
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { reduceMotion } = ctx.conditions as { reduceMotion: boolean };
      if (reduceMotion || prefersReducedMotion()) return;

      els = gsap.utils.toArray<HTMLElement>('.parts-keyword, .structure-footer__social');

      els.forEach((el) => {
        const inner = el.querySelector<HTMLElement>('.parts-keyword__inner, .parts-btnPill');
        if (inner) innerEls.set(el, inner);
      });
      cacheElementCenters();

      document.addEventListener('mousemove', handleMouseMove, { passive: true });

      document.addEventListener('mouseenter', handleMouseEnter as EventListener, {
        capture: true,
      });

      const handleResize = () => cacheElementCenters();
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });

      const recacheTimer = window.setTimeout(() => {
        debouncedRecache = gsap
          .delayedCall(0.15, () => {
            cacheElementCenters();
          })
          .pause();
      }, 100);

      return () => {
        window.clearTimeout(recacheTimer);
        els.forEach((el) => {
          gsap.killTweensOf(el);
          const inner = innerEls.get(el);
          if (inner) gsap.killTweensOf(inner);
        });
        debouncedRecache?.kill();
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseenter', handleMouseEnter as EventListener, true);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        els = [];
      };
    }
  );

  return () => {
    mm.revert();
  };
}
