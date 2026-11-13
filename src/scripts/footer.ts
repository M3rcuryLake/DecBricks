import { gsap, bp, bus, initSvgRectReveal } from './core/gsap';
import { getLenis } from './smooth-scroll';

let didWarnMissing = false;

/**
 * Footer lifecycle (Phase 1):
 * - Social-pill random layout retired (open-items A8).
 * - `.structure-footer__marquee` retired in Phase 1 (open-items C9); left
 *   null-guarded below so no orphan ScrollTrigger runs without markup.
 */
export function initFooter() {
  const footer = document.querySelector<HTMLElement>('.structure-footer');
  if (!footer) return;

  if (import.meta.env.DEV && !didWarnMissing && footer.dataset.devMissing) {
    didWarnMissing = true;
    for (const item of footer.dataset.devMissing.split('|')) {
      console.warn(`Decbricks footer: missing ${item} — section/link hidden.`);
    }
  }

  initSvgRectReveal(footer);

  const inner = footer.querySelector<HTMLElement>('.structure-footer__inner');
  const marquee = footer.querySelector<HTMLElement>('.structure-footer__marquee');
  const scrollTopBtn = footer.querySelector<HTMLButtonElement>('.parts-btnScrollTop');
  const manageCookiesBtn = footer.querySelector<HTMLButtonElement>('button[aria-label="Manage Cookies"]');

  const onScrollTop = () => {
    getLenis()?.scrollTo(0);
  };
  const onManageCookies = () => {
    bus.emit('manage-cookies');
  };

  scrollTopBtn?.addEventListener('click', onScrollTop);
  manageCookiesBtn?.addEventListener('click', onManageCookies);

  const mm = gsap.matchMedia();
  mm.add(
    {
      isDesktop: `(min-width: ${bp.lg}px)`,
      isMobile: `(max-width: ${bp.lg - 1}px)`,
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { reduceMotion } = ctx.conditions as { reduceMotion: boolean; isDesktop: boolean };
      if (reduceMotion) return;

      let revealTl: gsap.core.Timeline | null = null;
      let marqueeTween: gsap.core.Tween | null = null;

      if (inner) {
        revealTl = gsap.timeline({
          scrollTrigger: {
            trigger: footer,
            start: 'top bottom',
            end: () => `+=${footer.offsetHeight}px`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        revealTl.from(inner, { yPercent: -100, ease: 'none' });
      }

      if (marquee) {
        marqueeTween = gsap.to(marquee, {
          x: () => (marquee.offsetWidth + 100) * -0.5,
          duration: 45,
          repeat: -1,
          ease: 'none',
          scrollTrigger: {
            trigger: footer,
            start: 'top bottom',
            end: 'bottom top',
            toggleActions: 'play pause play pause',
            invalidateOnRefresh: true,
          },
        });
      }

      return () => {
        revealTl?.kill();
        marqueeTween?.kill();
      };
    }
  );

  return () => {
    scrollTopBtn?.removeEventListener('click', onScrollTop);
    manageCookiesBtn?.removeEventListener('click', onManageCookies);
    mm.revert();
  };
}
