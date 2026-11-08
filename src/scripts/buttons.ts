import { gsap, bp, ScrollTrigger, SplitText, prefersReducedMotion, bus } from './core/gsap';
import { getLenis } from './smooth-scroll';

function initCharSlideButton(btn: HTMLElement, textSelector: string) {
  if (btn.dataset.btnInit === '1') return;
  btn.dataset.btnInit = '1';
  const texts = btn.querySelectorAll<HTMLElement>(textSelector);
  if (texts.length < 2) return;

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
      if (isMobile || reduceMotion) return;

      const tl = gsap.timeline({ paused: true });

      const split = SplitText.create(gsap.utils.toArray<HTMLElement>(texts), {
        type: 'lines,chars',
        charsClass: 'char',
        autoSplit: true,
        onSplit: (self) => {
          self.lines.forEach((line, i) => {
            tl.to(
              line.querySelectorAll('.char'),
              { yPercent: -100, ease: 'power1.inOut', stagger: 0.03, duration: 0.2 },
              i === 0 ? 0 : '<+0.1'
            );
          });
          return tl;
        },
      });

      const play = () => tl.play();
      const reverse = () => tl.reverse();
      btn.addEventListener('mouseenter', play);
      btn.addEventListener('mouseleave', reverse);
      btn.addEventListener('focus', play);
      btn.addEventListener('blur', reverse);

      return () => {
        tl.kill();
        btn.removeEventListener('mouseenter', play);
        btn.removeEventListener('mouseleave', reverse);
        btn.removeEventListener('focus', play);
        btn.removeEventListener('blur', reverse);
        split.revert();
      };
    }
  );

  return () => {
    mm.revert();
  };
}

function initScrollButton(btn: HTMLElement) {
  const hero = btn.closest<HTMLElement>('.sections-hero');
  if (!hero) return;

  const scrollToSection = () => {
    getLenis()?.scrollTo('#showreel', { duration: 1 });
  };
  btn.addEventListener('click', scrollToSection);

  if (prefersReducedMotion()) return;

  const mm = gsap.matchMedia();
  mm.add(
    {
      isDesktop: `(min-width: ${bp.lg}px)`,
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    () => {
      if (prefersReducedMotion()) return;

      const text = new SplitText('.parts-scrollButton__text', { type: 'chars' });
      const copy = new SplitText('.parts-scrollButton__textCopy', { type: 'chars' });

      const leftRects = gsap.utils.shuffle(
        gsap.utils.toArray<SVGRectElement>('.parts-scrollButton__arrowLeft rect')
      );
      const rightRects = gsap.utils.shuffle(
        gsap.utils.toArray<SVGRectElement>('.parts-scrollButton__arrowRight rect')
      );

      const loop = gsap.timeline({
        repeat: -1,
        repeatDelay: 2,
        scrollTrigger: {
          trigger: hero,
          start: 'top bottom',
          end: 'bottom top',
          toggleActions: 'restart pause restart pause',
        },
      });
      loop
        .to(text.chars, { yPercent: -100, ease: 'power1.inOut', stagger: 0.05, duration: 0.3 }, 0)
        .to(copy.chars, { yPercent: -100, ease: 'power2.inOut', stagger: 0.05, duration: 0.5 }, 0)
        .to(leftRects, { autoAlpha: 0, stagger: 0.1, duration: 0.3 }, 0)
        .to(rightRects, { autoAlpha: 0, stagger: 0.1, duration: 0.3 }, 0)
        .to(leftRects, { autoAlpha: 1, stagger: 0.1, duration: 0.3 }, '>-=0.5');
      loop.to(rightRects, { autoAlpha: 1, stagger: 0.1, duration: 0.3 }, '<');
      (loop.scrollTrigger as ScrollTrigger).disable();

      const enable = () => {
        bus.off('hero-transition-start', enable);
        (loop.scrollTrigger as ScrollTrigger).enable();
      };
      bus.on('hero-transition-start', enable);

      let textState: { yPercent: number }[] = [];
      let copyState: { yPercent: number }[] = [];

      const resetButton = () => {
        if (!text.chars || !copy.chars) return;
        gsap
          .timeline({
            onComplete: () => loop.play(),
          })
          .to('.parts-scrollButton__arrowMiddle', { opacity: 0 })
          .to(
            text.chars,
            { yPercent: 0, ease: 'power1.inOut', stagger: 0.05, duration: 0.3 },
            '<+0.1'
          )
          .set(copy.chars, { yPercent: 0, stagger: 0.05 }, '<');
      };

      const exitButton = () => {
        if (!text.chars || !copy.chars) return;
        loop?.pause();
        textState = text.chars.map((el) => ({ yPercent: Number(gsap.getProperty(el, 'yPercent')) }));
        copyState = copy.chars.map((el) => ({ yPercent: Number(gsap.getProperty(el, 'yPercent')) }));
        gsap
          .timeline()
          .to(
            text.chars,
            {
              yPercent: -100,
              ease: 'power1.inOut',
              stagger: 0.05,
              duration: (_i: number, el: any) => {
                const idx = text.chars.indexOf(el);
                const n = (-100 - textState[idx].yPercent) / -100;
                return Math.max(0.1, 0.3 * n);
              },
            },
            0
          )
          .to(
            copy.chars,
            {
              yPercent: -200,
              ease: 'power1.inOut',
              stagger: 0.05,
              duration: (_i: number, el: any) => {
                const idx = copy.chars.indexOf(el);
                const n = (-200 - copyState[idx].yPercent) / -200;
                return Math.max(0.1, 0.3 * n);
              },
            },
            0
          )
          .to('.parts-scrollButton__arrowMiddle', { opacity: 1 });
      };

      let exitST: ScrollTrigger | undefined;
      exitST = ScrollTrigger.create({
        trigger: hero,
        start: 'bottom bottom',
        end: 5,
        onEnter: resetButton,
        onEnterBack: resetButton,
        onLeave: exitButton,
        onLeaveBack: exitButton,
      });

      return () => {
        loop.kill();
        exitST?.kill();
        bus.off('hero-transition-start', enable);
        text.revert();
        copy.revert();
      };
    },
    hero
  );

  return () => {
    btn.removeEventListener('click', scrollToSection);
    mm.revert();
  };
}

export function initButtons() {
  const teardowns: Array<(() => void) | undefined> = [];
  document.querySelectorAll<HTMLElement>('.part-btnPrimary').forEach((btn) => {
    teardowns.push(initCharSlideButton(btn, '.part-btnPrimary__text'));
  });
  document.querySelectorAll<HTMLElement>('.parts-btnBlock').forEach((btn) => {
    teardowns.push(initCharSlideButton(btn, '.parts-btnBlock__text, .parts-btnBlock__label'));
  });
  document.querySelectorAll<HTMLElement>('.parts-btnText').forEach((btn) => {
    teardowns.push(initCharSlideButton(btn, '.parts-btnText__text, .parts-btnText__label'));
  });
  document.querySelectorAll<HTMLElement>('.parts-btnScrollTop').forEach((btn) => {
    teardowns.push(initCharSlideButton(btn, '.parts-btnScrollTop__text, .parts-btnScrollTop__label'));
  });
  document.querySelectorAll<HTMLElement>('.parts-scrollButton').forEach((btn) => {
    teardowns.push(initScrollButton(btn));
  });
  return () => teardowns.forEach((t) => t?.());
}
