import { gsap, bp, initSvgRectReveal } from './core/gsap';

export function initContact() {
  const section = document.querySelector<HTMLElement>('.sections-contactForm');
  if (!section) return;

  initSvgRectReveal(section);

  const formEl = section.querySelector<HTMLFormElement>('.parts-form');
  if (formEl) {
    initSvgRectReveal(formEl);
  }

  const state = {
    scrollRotation: 12,
    hoverProgress: 0,
  };
  let isHovered = false;
  let isFocused = false;
  let hoverTween: gsap.core.Tween | null = null;

  const updateHoverState = (active: boolean) => {
    hoverTween?.kill();
    hoverTween = gsap.to(state, {
      hoverProgress: active ? 1 : 0,
      duration: 0.6,
      ease: 'smooth-2',
    });
  };

  const mm = gsap.matchMedia();
  mm.add(
    {
      isDesktop: `(min-width: ${bp.lg}px)`,
      isMobile: `(max-width: ${bp.lg - 1}px)`,
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions as { isDesktop: boolean; reduceMotion: boolean };
      if (reduceMotion) return;

      const headingTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scrub: true,
          start: 'top bottom',
          end: 'bottom top',
        },
      });
      headingTl
        .to('.sections-contactForm__headingLeft', { x: isDesktop ? 75 : 25, ease: 'none' }, 0)
        .to('.sections-contactForm__headingRight', { x: isDesktop ? -75 : -25, ease: 'none' }, 0);

      let formTl: gsap.core.Timeline | null = null;
      const tick = () => {
        if (!formEl) return;
        const rot = gsap.utils.interpolate(state.scrollRotation, 0, state.hoverProgress);
        gsap.set(formEl, { rotate: rot });
      };

      if (isDesktop && formEl) {
        state.scrollRotation = 12;
        state.hoverProgress = 0;
        gsap.set(formEl, { rotate: 12 });

        formTl = gsap.timeline({
          scrollTrigger: {
            trigger: formEl,
            start: 'top bottom',
            end: 'top center',
            scrub: true,
          },
        });
        formTl.to(state, { scrollRotation: 8, ease: 'none' });
        gsap.ticker.add(tick);

        formEl.addEventListener('mouseenter', () => {
          isHovered = true;
          updateHoverState(true);
        });
        formEl.addEventListener('mouseleave', () => {
          isHovered = false;
          if (!isFocused) updateHoverState(false);
        });
        formEl.addEventListener('focusin', () => {
          isFocused = true;
          updateHoverState(true);
        });
        formEl.addEventListener('focusout', (e) => {
          if (!formEl.contains(e.relatedTarget as Node | null)) {
            isFocused = false;
            if (!isHovered) updateHoverState(false);
          }
        });
      } else if (formEl) {
        gsap.set(formEl, { rotate: 0 });
      }

      return () => {
        headingTl.kill();
        formTl?.kill();
        gsap.ticker.remove(tick);
      };
    }
  );

  // Form checkbox & client-side validation (UI-only)
  if (!formEl) return;

  const checkboxInput = formEl.querySelector<HTMLInputElement>('.parts-formCheckbox input[type="checkbox"]');
  const checkboxSvg = formEl.querySelector<SVGElement>('.parts-formCheckbox svg');
  if (checkboxInput && checkboxSvg) {
    const syncCheckbox = () => {
      checkboxSvg.classList.toggle('opacity-0', !checkboxInput.checked);
    };
    syncCheckbox();
    checkboxInput.addEventListener('change', syncCheckbox);
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = Array.from(formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[required], textarea[required], input[name], textarea[name]'));
    let valid = true;
    inputs.forEach((inp) => {
      if (inp.type === 'checkbox') {
        if (!(inp as HTMLInputElement).checked) valid = false;
      } else if (!inp.value.trim()) {
        valid = false;
      }
    });

    // The original form ships the submit <button> without a type attribute (defaults to submit).
    const submitBtn =
      formEl.querySelector<HTMLButtonElement>('button[type="submit"]') ??
      formEl.querySelector<HTMLButtonElement>('button[aria-label="Submit"]');
    const btnTexts = submitBtn?.querySelectorAll<HTMLElement>('.part-btnPrimary__text');
    if (!valid) {
      gsap.fromTo(formEl, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(2, 0.2)' });
      return;
    }
    if (btnTexts) {
      btnTexts.forEach((t) => {
        t.textContent = 'Message Sent!';
      });
    }
    formEl.reset();
    if (checkboxSvg) checkboxSvg.classList.add('opacity-0');
  });

  return () => {
    mm.revert();
  };
}
