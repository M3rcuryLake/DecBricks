import { gsap, bp, initSvgRectReveal } from './core/gsap';
import { CONTACT_ENDPOINT, EMAIL } from '../data/contact';

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

  // Status live region (`#status-message` carries aria-live in the markup).
  const statusEl = formEl.querySelector<HTMLElement>('#status-message');
  const setStatus = (msg: string, tone: 'ok' | 'error') => {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = `mt-20 form-status${tone === 'error' ? ' form-status--error' : ''}`;
  };
  // While a POST is in flight, disable the submit row so double-clicks queue.
  const setSending = (busy: boolean) => {
    submitBtn?.toggleAttribute('disabled', busy);
    (submitBtn as HTMLButtonElement | null)?.setAttribute('aria-busy', String(busy));
  };

  // The original form ships the submit <button> without a type attribute (defaults to submit).
  const submitBtn =
    formEl.querySelector<HTMLButtonElement>('button[type="submit"]') ??
    formEl.querySelector<HTMLButtonElement>('button[aria-label="Submit"]');
  const btnTexts = submitBtn?.querySelectorAll<HTMLElement>('.part-btnPrimary__text');
  const setBtn = (label: string) => btnTexts?.forEach((t) => (t.textContent = label));

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = Array.from(formEl.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[required], textarea[required], input[name], textarea[name]'));
    let valid = true;
    let firstInvalid: HTMLElement | null = null;
    inputs.forEach((inp) => {
      if (inp.name === '_gotcha') return; // honeypot, never user-visible
      let fieldValid = true;
      if (inp.type === 'checkbox') {
        fieldValid = (inp as HTMLInputElement).checked;
      } else if (!inp.value.trim()) {
        fieldValid = false;
      } else if (inp.type === 'email' && !/^\S+@\S+\.\S+$/.test(inp.value.trim())) {
        fieldValid = false;
      }
      inp.setAttribute('aria-invalid', String(!fieldValid));
      inp.setAttribute('aria-describedby', 'status-message');
      if (!fieldValid && !firstInvalid) {
        firstInvalid = inp as HTMLElement;
        valid = false;
      }
    });

    // The original form ships the submit <button> without a type attribute (defaults to submit).
    if (!valid) {
      setBtn('Submit');
      gsap.fromTo(formEl, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(2, 0.2)' });
      setStatus('Please complete the highlighted fields.', 'error');
      firstInvalid?.focus();
      return;
    }

    // Honeypot: filled ⇒ a bot reached the field; accept silently, never send.
    const honeypot = formEl.querySelector<HTMLInputElement>('input[name="_gotcha"]');
    if (honeypot?.value) {
      setStatus('Thanks for reaching out.', 'ok');
      setBtn('Message Sent!');
      setSending(true);
      return;
    }

    const value = (name: string) => (formEl.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() ?? '';
    const payload = {
      name: value('name'),
      email: value('email'),
      company: value('company'),
      message: value('message'),
    };

    if (!CONTACT_ENDPOINT) {
      // No endpoint configured (open-items A7): degrade to the owner's inbox.
      if (!EMAIL) {
        setStatus('We could not send your message automatically. Please book a call instead.', 'error');
        setBtn('Try again');
        return;
      }
      const body = encodeURIComponent(`Name: ${payload.name}\nCompany: ${payload.company}\n\n${payload.message}`);
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Project enquiry from decbricks.com')}&body=${body}`;
      setStatus('Opening your email client — press send there and we will reply.', 'ok');
      setBtn('Message Sent!');
      formEl.reset();
      if (checkboxSvg) checkboxSvg.classList.add('opacity-0');
      return;
    }

    setBtn('Sending…');
    setSending(true);
    fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      body: buildFormData(payload, formEl),
      headers: { Accept: 'application/json' },
    })
      .then((res) => {
        if (res.ok) {
          setStatus('Message sent. We will get back to you shortly.', 'ok');
          setBtn('Message Sent!');
          formEl.reset();
          if (checkboxSvg) checkboxSvg.classList.add('opacity-0');
          setSending(false);
        } else {
          throw new Error(String(res.status));
        }
      })
      .catch(() => {
        if (!EMAIL) {
          setStatus('Something went wrong sending your message. Please book a call instead.', 'error');
        } else {
          const body = encodeURIComponent(`Name: ${payload.name}\nCompany: ${payload.company}\n\n${payload.message}`);
          window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Project enquiry from decbricks.com')}&body=${body}`;
          setStatus('Sending failed — opening your email client as a fallback.', 'error');
        }
        setBtn('Try again');
        setSending(false);
      });
  });

  return () => {
    mm.revert();
  };
}

/** Provider-agnostic POST body (works for Formspree, Web3Forms, custom workers). */
function buildFormData(
  payload: { name: string; email: string; company: string; message: string },
  formEl: HTMLFormElement
): FormData {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
  fd.append('_subject', 'Project enquiry from decbricks.com');
  const honeypot = formEl.querySelector<HTMLInputElement>('input[name="_gotcha"]');
  if (honeypot?.value) fd.append('_gotcha', honeypot.value);
  return fd;
}
