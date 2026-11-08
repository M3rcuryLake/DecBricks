import { gsap, ScrollTrigger } from './gsap';

export interface MomentumItem {
  /** Element that receives mouseenter / mouseleave. */
  element: HTMLElement;
  /** Element that is actually moved (defaults to nothing: item is skipped). */
  target: HTMLElement | null;
}

export interface MomentumConfig {
  xyMultiplier: number;
  rotationMultiplier: number;
  inertiaResistance: number;
  clampXY: number;
  clampRotation: number;
}

const DEFAULTS: MomentumConfig = {
  xyMultiplier: 7.5,
  rotationMultiplier: 5,
  inertiaResistance: 400,
  clampXY: 270,
  clampRotation: 15,
};

/**
 * Port of the original site's MomentumHover: while `trigger` is on screen the
 * window mouse velocity is tracked; on mouseenter the target is thrown with that
 * velocity (InertiaPlugin) and settles back to 0, on mouseleave it eases home
 * in 0.6s power2.out. Only active for (hover: hover) and (pointer: fine).
 */
export class MomentumHover {
  private config: MomentumConfig;
  private velX = 0;
  private velY = 0;
  private prevX = 0;
  private prevY = 0;
  private clampXY: (v: number) => number;
  private clampRot: (v: number) => number;
  private scrollTrigger?: ScrollTrigger;
  private controller = new AbortController();

  constructor(
    private trigger: HTMLElement,
    private items: MomentumItem[],
    config: Partial<MomentumConfig> = {},
    private onUpdate?: (target: HTMLElement, element: HTMLElement) => void
  ) {
    this.config = { ...DEFAULTS, ...config };
    this.clampXY = gsap.utils.clamp(-this.config.clampXY, this.config.clampXY);
    this.clampRot = gsap.utils.clamp(-this.config.clampRotation, this.config.clampRotation);
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth < 1024) return;
    this.initScrollTrigger();
    this.initHoverListeners();
  }

  private trackVelocity = (e: MouseEvent) => {
    this.velX = e.clientX - this.prevX;
    this.velY = e.clientY - this.prevY;
    this.prevX = e.clientX;
    this.prevY = e.clientY;
  };

  private isTracking = false;
  private startTracking = () => {
    if (!this.isTracking) {
      this.isTracking = true;
      window.addEventListener('mousemove', this.trackVelocity, {
        passive: true,
        signal: this.controller.signal,
      });
    }
  };
  private stopTracking = () => {
    if (this.isTracking) {
      this.isTracking = false;
      window.removeEventListener('mousemove', this.trackVelocity);
      this.velX = 0;
      this.velY = 0;
    }
  };

  private initScrollTrigger() {
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.trigger,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: this.startTracking,
      onEnterBack: this.startTracking,
      onLeave: this.stopTracking,
      onLeaveBack: this.stopTracking,
    });
    this.startTracking();
  }

  private initHoverListeners() {
    const { signal } = this.controller;
    this.items.forEach(({ element, target }) => {
      if (!target) return;
      element.addEventListener(
        'mouseenter',
        (e) => {
          const vx =
            this.prevX || this.prevY ? e.clientX - this.prevX || this.velX : this.velX;
          const vy =
            this.prevX || this.prevY ? e.clientY - this.prevY || this.velY : this.velY;
          this.prevX = e.clientX;
          this.prevY = e.clientY;
          const r = target.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const swirl = (dx * vy - dy * vx) / (Math.hypot(dx, dy) || 1);
          gsap.to(target, {
            inertia: {
              x: { velocity: this.clampXY(vx * this.config.xyMultiplier), end: 0 },
              y: { velocity: this.clampXY(vy * this.config.xyMultiplier), end: 0 },
              rotation: { velocity: this.clampRot(swirl * this.config.rotationMultiplier), end: 0 },
              resistance: this.config.inertiaResistance,
            },
            onUpdate: () => {
              this.onUpdate?.(target, element);
            },
          });
        },
        { signal }
      );
      element.addEventListener(
        'mouseleave',
        () =>
          gsap.to(target, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.6,
            ease: 'power2.out',
            onUpdate: () => {
              this.onUpdate?.(target, element);
            },
          }),
        { signal }
      );
    });
  }

  destroy() {
    this.scrollTrigger?.kill();
    this.stopTracking();
    this.controller.abort();
  }
}
