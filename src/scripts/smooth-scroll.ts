import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './core/gsap';

let lenis: Lenis | null = null;

/** Lenis, driven by gsap.ticker, started stopped (the loader unlocks it). */
export function initSmoothScroll(): Lenis {
  if (lenis) return lenis;
  history.scrollRestoration && (history.scrollRestoration = 'manual');
  lenis = new Lenis({
    easing: (t: number) => Math.sin((t * Math.PI) / 2),
    duration: 0.5,
    orientation: 'vertical',
    anchors: false,
  });
  lenis.stop();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  (window as any).$lenis = lenis;
  return lenis;
}

export const getLenis = () => lenis;
