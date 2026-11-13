import { gsap, bp, initSvgRectReveal } from './core/gsap';

export function initServices() {
  const section = document.querySelector<HTMLElement>('.sections-services');
  if (!section) return;

  const cards = section.querySelectorAll<HTMLElement>('.parts-serviceCard');
  cards.forEach((card) => initSvgRectReveal(card));

  const mm = gsap.matchMedia();
  mm.add(
    {
      isDesktop: `(min-width: ${bp.lg}px)`,
      isMobile: `(max-width: ${bp.lg - 1}px)`,
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { isMobile, reduceMotion } = ctx.conditions as {
        isMobile: boolean;
        reduceMotion: boolean;
      };
      if (reduceMotion) return;

      const timelines: gsap.core.Timeline[] = [];

      cards.forEach((card, idx) => {
        const inner = card.querySelector<HTMLElement>('.parts-serviceCard__inner');
        const even = idx % 2 === 0;
        const i = isMobile ? 2 : 3.5;
        const a = isMobile ? 2 : 4;

        const enterTl = gsap.timeline({
          scrollTrigger: {
            id: `service-card-${idx}-entrance`,
            trigger: card,
            start: 'top bottom',
            end: 'top 20%',
            scrub: true,
          },
        });
        enterTl.from(card, {
          rotate: even ? i : -i,
          xPercent: even ? -a : a,
          ease: 'power1.out',
        });
        timelines.push(enterTl);

        if (inner) {
          const exitTl = gsap.timeline({
            scrollTrigger: {
              id: `service-card-${idx}-exit`,
              trigger: card,
              start: 'top 20%',
              end: 'bottom top',
              scrub: true,
            },
          });
          exitTl.to(inner, {
            rotate: even ? -i : i,
            xPercent: even ? -a : a,
            ease: 'power1.in',
          });
          timelines.push(exitTl);
        }
      });

      return () => {
        timelines.forEach((tl) => tl.kill());
      };
    }
  );

  return () => {
    mm.revert();
  };
}
