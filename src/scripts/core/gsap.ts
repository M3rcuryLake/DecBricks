import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Flip, Draggable, InertiaPlugin);

// Custom eases, identical to the original site's plugin.
CustomEase.create('smooth', '0.5, 0, 0, 1');
CustomEase.create('smooth-2', '0.63, 0, 0, 1');
CustomEase.create('smooth-3', '0.72, 0, 0, 1');
CustomEase.create('slowDown', '0, 0, 0, 1');
CustomEase.create('slowDown-2', '0, 0.45, 0, 1');
CustomEase.create('accelerate', '1, 0, 1, 1');
CustomEase.create('natural', '0.8, 0, 0.2, 1');

ScrollTrigger.config({ ignoreMobileResize: true });
if (typeof window !== 'undefined') (window as any).ScrollTrigger = ScrollTrigger;

export { gsap, ScrollTrigger, SplitText, Flip, Draggable, InertiaPlugin };

/** Breakpoints from the original app. */
export const bp = { xs: 456, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1440, '3xl': 1660, '4xl': 1920 } as const;

type Handler = (...args: any[]) => void;
/** Tiny event bus (the original used `window.$bus`). */
class Bus {
  private events = new Map<string, Set<Handler>>();
  on(name: string, fn: Handler) { (this.events.get(name) ?? this.events.set(name, new Set()).get(name)!).add(fn); }
  off(name: string, fn: Handler) { this.events.get(name)?.delete(fn); }
  emit(name: string, ...args: any[]) { [...(this.events.get(name) ?? [])].forEach((fn) => fn(...args)); }
}
export const bus = new Bus();
if (typeof window !== 'undefined') (window as any).__bus = bus;

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Exact LCG seeded PRNG from original chunk `B6KeJywU.js`. */
export function seededRandom(seed?: string): () => number {
  if (!seed) return Math.random;
  let t = 0;
  for (let n = 0; n < seed.length; n++) {
    const r = seed.charCodeAt(n);
    t = (t << 5) - t + r;
    t &= t;
  }
  return function () {
    t = (t * 1103515245 + 12345) & 2147483647;
    return t / 2147483647;
  };
}

/** Shared debounced resize manager matching `useResizeManager`. */
class ResizeManager {
  private fns = new Set<() => void>();
  private timer: number | null = null;
  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        if (this.timer) window.clearTimeout(this.timer);
        this.timer = window.setTimeout(() => {
          this.fns.forEach((fn) => fn());
        }, 150);
      });
    }
  }
  add(fn: () => void) { this.fns.add(fn); }
  remove(fn: () => void) { this.fns.delete(fn); }
}
export const resizeManager = new ResizeManager();

/** Scroll-triggered SVG rect stagger reveal (`9-CR_i0j.js`). */
export function initSvgRectReveal(root: HTMLElement | null) {
  if (!root || prefersReducedMotion()) return;
  const svgs = gsap.utils.toArray<SVGElement>(
    '.svgs-doubleSlash, .svgs-arrowUp, .svgs-arrowRight, .svgs-arrowLeft, .svgs-arrowDown, .svgs-cross, .svgs-slash',
    root
  );
  if (!svgs.length) return;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top 75%',
      toggleActions: 'play none none none',
    },
  });
  svgs.forEach((svg) => {
    const rects = svg.querySelectorAll('rect');
    if (rects.length) {
      tl.from(rects, { opacity: 0, stagger: { each: 0.05, from: 'random' }, duration: 0.3 }, '<');
    }
  });
}
