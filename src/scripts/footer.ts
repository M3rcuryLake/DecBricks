import { gsap, bp, bus, initSvgRectReveal, prefersReducedMotion } from './core/gsap';
import { getLenis } from './smooth-scroll';

let didWarnMissing = false;

/**
 * Footer lifecycle (Phases 1–3):
 * - Brick-laid wordmark IntersectionObserver adds `.is-built` once and disconnects.
 * - Scrubbed `.structure-footer__inner` reveal scopes `willChange` to active scroll only.
 * - Reduced motion: wordmark renders built statically (CSS), scroll-to-top jumps `immediate: true`.
 * - `.structure-footer__marquee` & social-pill layout retired (open-items C9, A8).
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
  const wordmarkRow = footer.querySelector<HTMLElement>('.structure-footer__wordmarkRow');
  const scrollTopBtn = footer.querySelector<HTMLButtonElement>('.parts-btnScrollTop');
  const manageCookiesBtn = footer.querySelector<HTMLButtonElement>('button[aria-label="Manage Cookies"]');

  let layObserver: IntersectionObserver | null = null;
  if (wordmarkRow) {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      wordmarkRow.classList.add('is-built');
    } else {
      layObserver = new IntersectionObserver(
        (entries, observer) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              wordmarkRow.classList.add('is-built');
              observer.disconnect();
              layObserver = null;
              break;
            }
          }
        },
        { threshold: 0.2 }
      );
      layObserver.observe(wordmarkRow);
    }
  }

  const onScrollTop = () => {
    const reduced = prefersReducedMotion();
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, reduced ? { immediate: true } : undefined);
    } else {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    }
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
            onToggle: (self) => {
              inner.style.willChange = self.isActive ? 'transform' : '';
            },
          },
        });
        revealTl.from(inner, {
          yPercent: -100,
          ease: 'none',
          force3D: true,
        });
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
        if (inner) inner.style.willChange = '';
      };
    }
  );

  return () => {
    layObserver?.disconnect();
    layObserver = null;
    scrollTopBtn?.removeEventListener('click', onScrollTop);
    manageCookiesBtn?.removeEventListener('click', onManageCookies);
    mm.revert();
  };
}
