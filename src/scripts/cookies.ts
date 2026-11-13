import { gsap, Flip, ScrollTrigger, bus } from './core/gsap';

const ESSENTIAL = 'essential-consent';
const ANALYTICS = 'analytics-consent';
const MAX_AGE = 31556952;

const getCookie = (n: string) => document.cookie.split('; ').find((c) => c.startsWith(n + '='))?.split('=')[1];
const setCookie = (n: string, v: string) => (document.cookie = `${n}=${v}; max-age=${MAX_AGE}; path=/; samesite=lax`);
const delCookie = (n: string) => (document.cookie = `${n}=; max-age=0; path=/`);

/** Cookie consent banner: slides in after the loader, Manage morphs it into the preferences view. */
export function initCookies() {
  const root = document.querySelector<HTMLElement>('.structure-cookieBanner');
  const card = root?.querySelector<HTMLElement>('[data-cookie-card]');
  if (!root || !card) return;
  const manage = card.querySelector<HTMLElement>('[data-manage]')!;
  const buttons = card.querySelector<HTMLElement>(':scope > div:last-of-type')!;
  const btn = (k: string) => card.querySelector<HTMLButtonElement>(`[data-cookie="${k}"]`)!;
  const analytics = card.querySelector<HTMLInputElement>('[data-cookie-analytics]')!;
  const box = analytics.nextElementSibling as HTMLElement; // visual checkbox
  let managing = false;
  analytics.checked = getCookie(ANALYTICS) === 'true';
  const paintBox = () => {
    box.classList.toggle('bg-purple', analytics.checked);
    box.innerHTML = analytics.checked
      ? '<svg viewBox="0 0 12 12" class="w-10 text-darkPurple" fill="none"><path d="M1 6l3 3 7-7" stroke="currentColor" stroke-width="2"/></svg>' : '';
  };
  paintBox();
  box.addEventListener('click', () => { analytics.checked = !analytics.checked; paintBox(); });

  // Phase 0 (R9): while the banner is visible, reserve its footprint via
  // `--cookie-safe-area` (decbricks.css consumers: .page bottom padding +
  // viewport-height heroes shrink) so it never sits over real content or
  // interactive elements. Mid-scroll overlap of scrolling content is inherent
  // to any fixed overlay; this guarantees scroll-end and first-viewport.
  const setSafeArea = () => {
    const mb = parseFloat(getComputedStyle(card).marginBottom) || 0;
    const h = Math.ceil(card.getBoundingClientRect().height) || 0;
    if (!h) return;
    const de = document.documentElement;
    de.classList.add('has-cookie-banner');
    de.style.setProperty('--cookie-safe-area', `${h + mb}px`);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  const clearSafeArea = () => {
    const de = document.documentElement;
    de.classList.remove('has-cookie-banner');
    de.style.removeProperty('--cookie-safe-area');
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  const hide = () => {
    clearSafeArea();
    gsap.to(card, { autoAlpha: 0, duration: 0.5, onComplete: () => { card.hidden = true; } });
  };
  const show = () => {
    card.hidden = false;
    setSafeArea();
    gsap.fromTo(card, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 });
  };
  const enterManage = () => {
    const state = Flip.getState(card);
    managing = true;
    manage.hidden = false;
    card.classList.add('w-[95%]', '!rotate-0', 'sm:w-450', 'lg:w-480');
    const bs = buttons.querySelectorAll('button');
    btn('manage').hidden = true; btn('delete').hidden = false; btn('save').hidden = false;
    gsap.set([manage, bs], { opacity: 0 });
    Flip.from(state, {
      duration: 0.4, ease: 'power2.inOut',
      onComplete: () => {
        setSafeArea(); // manage view is taller — re-reserve
        gsap.to([manage, ...buttons.querySelectorAll('button')], { opacity: 1, duration: 0.3, ease: 'power2.out', stagger: { from: 'random', each: 0.05 } });
      },
    });
  };

  btn('accept').addEventListener('click', () => { setCookie(ESSENTIAL, 'true'); setCookie(ANALYTICS, 'true'); analytics.checked = true; paintBox(); hide(); bus.emit('cookies-decided', true); });
  btn('manage').addEventListener('click', enterManage);
  // Original manage view: clear consent cookies and reload.
  btn('delete').addEventListener('click', () => { delCookie(ESSENTIAL); delCookie(ANALYTICS); window.location.reload(); });
  btn('save').addEventListener('click', () => { setCookie(ESSENTIAL, 'true'); setCookie(ANALYTICS, String(analytics.checked)); hide(); bus.emit('cookies-decided', analytics.checked); });
  bus.on('manage-cookies', () => { show(); if (!managing) enterManage(); });

  if (!getCookie(ESSENTIAL)) {
    const go = () => setTimeout(show, 1000);
    (window as any).animationsEnabled ? go() : bus.on('animationsEnabled', () => go());
  }
}
