import { gsap, ScrollTrigger, bp, bus, prefersReducedMotion, resizeManager } from './core/gsap';
import { getLenis } from './smooth-scroll';
import { clearPendingAnchor, getPendingAnchor, normalizePath } from './page-transition';

export function getHeaderOffset(): number {
  const header = document.querySelector<HTMLElement>('.structure-menu');
  return header ? header.offsetHeight + 16 : 0;
}

export function scrollToAnchor(hash: string, durationOverride?: number) {
  if (!hash) return;
  const normalized = hash.startsWith('#') ? hash : `#${hash}`;
  const target = document.querySelector<HTMLElement>(normalized);
  if (!target) return;
  const offset = -getHeaderOffset();
  const duration = prefersReducedMotion() ? 0 : (durationOverride ?? 1);
  const lenis = getLenis();
  if (lenis) {
    lenis.start();
    lenis.scrollTo(target, { offset, duration });
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: duration === 0 ? 'auto' : 'smooth' });
  }
}

let currentAnchor: string | null = null;
let anchorClearTimer: number | undefined;
let rebuildThemeTriggersFn: (() => void) | null = null;
let closeMenuFn: ((resumeLenis?: boolean) => void) | null = null;

function updateHeaderActiveUI(pathname = normalizePath(window.location.pathname)) {
  const header = document.querySelector<HTMLElement>('.structure-menu');
  if (!header) return;

  const isHome = pathname === '/';
  const isServices = pathname === '/services';

  // 1. Logo active state
  const logo = header.querySelector<HTMLAnchorElement>('.parts-animatedLogo');
  if (logo) {
    logo.classList.toggle('router-link-active', isHome);
    logo.classList.toggle('router-link-exact-active', isHome);
    if (isHome) logo.setAttribute('aria-current', 'page');
    else logo.removeAttribute('aria-current');
  }

  // 2. Desktop & mobile nav links (matching BtnBlock in D53SQfW8.js)
  header.querySelectorAll<HTMLAnchorElement>('nav a[href]').forEach((link) => {
    const rawHref = link.getAttribute('href') || '';
    const dataAnchor = link.getAttribute('data-anchor') || '';
    const isDesktopBtn = link.classList.contains('parts-btnBlock');
    const isHighlight = dataAnchor === '#contact';

    let isRouteMatch = false;
    let isActive = false;

    if (dataAnchor) {
      isRouteMatch = isHome;
      isActive = currentAnchor === dataAnchor;
    } else if (rawHref === '/services') {
      isRouteMatch = isServices;
      isActive = isServices;
    }

    link.classList.toggle('router-link-active', isRouteMatch);
    link.classList.toggle('router-link-exact-active', isRouteMatch);
    if (isRouteMatch) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');

    if (isDesktopBtn && !isHighlight) {
      // Active pill = burgundy + beige text (matches Header.astro's SSR class
      // for `link.current`); the coral `bg-purple` token can't carry 12–14px
      // white text (3.9:1).
      link.classList.toggle('bg-darkPurple', isActive);
      link.classList.toggle('text-neonGreen', isActive);
      link.classList.toggle('hover:bg-white', !isActive);
      link.classList.toggle('focus:bg-white', !isActive);
    }
  });
}

export function setActiveAnchor(anchor: string | null) {
  window.clearTimeout(anchorClearTimer);
  currentAnchor = anchor;
  updateHeaderActiveUI();
  // Exact 5000ms auto-clear from D53SQfW8.js:
  // r(R, e => { e && (P &&= (clearTimeout(P), null), P = setTimeout(() => { O(), D.value = null }, 5e3)) })
  if (anchor) {
    anchorClearTimer = window.setTimeout(() => {
      clearPendingAnchor();
      currentAnchor = null;
      updateHeaderActiveUI();
    }, 5000);
  }
}

export function closeMobileMenuIfOpen(resumeLenis = true) {
  closeMenuFn?.(resumeLenis);
}

export function refreshHeaderForRoute(pathname: string) {
  updateHeaderActiveUI(pathname);
  rebuildThemeTriggersFn?.();
}

export function initMenu() {
  const header = document.querySelector<HTMLElement>('.structure-menu');
  if (!header) return;

  const logo = header.querySelector<HTMLElement>('.parts-animatedLogo');
  const openBtn = header.querySelector<HTMLButtonElement>('button:not(.close)');
  const navs = header.querySelectorAll<HTMLElement>('nav');
  const mobileNav = navs[1]; // second nav is the mobile menu

  // 1. AnimatedLogo theme triggers (CHshU5z5.js)
  let currentTheme: string | null = 'dark';
  let scrolled = false;
  let menuOpenState = false;

  const applyLogoClasses = () => {
    if (!logo) return;
    const open = menuOpenState || scrolled || currentTheme !== 'dark';
    logo.classList.toggle('text-white', !open);
    logo.classList.toggle('text-darkPurple', open);
    logo.classList.toggle('bg-white/70', scrolled);
    logo.classList.toggle('backdrop-blur-xl', scrolled);
  };

  const setTheme = (el: Element) => {
    currentTheme = el.getAttribute('data-theme') || null;
    applyLogoClasses();
  };

  const setScrolled = () => {
    scrolled = true;
    applyLogoClasses();
  };

  if (logo) {
    const triggers: ScrollTrigger[] = [];
    const buildTriggers = () => {
      triggers.forEach((t) => t.kill());
      triggers.length = 0;
      scrolled = window.scrollY > 50;
      const themedEls = gsap.utils.toArray<HTMLElement>('[data-theme]');
      themedEls.forEach((el) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: 'top top+=100px',
            end: '+=200px',
            onEnter: () => setTheme(el),
            onEnterBack: () => setTheme(el),
            onLeave: () => setScrolled(),
            onLeaveBack: () => setScrolled(),
          })
        );
      });
      const first = themedEls[0];
      if (first && window.scrollY <= 50) {
        scrolled = false;
        setTheme(first);
      } else {
        applyLogoClasses();
      }
    };

    rebuildThemeTriggersFn = buildTriggers;
    buildTriggers();
    let refresh: number | undefined;
    resizeManager.add(() => {
      window.clearTimeout(refresh);
      refresh = window.setTimeout(buildTriggers, 100);
    });
  }

  // 2. Mobile menu open/close timeline (BQJKm7mv.js)
  let menuTl: gsap.core.Timeline | null = null;
  const mm = gsap.matchMedia();

  if (mobileNav) {
    const closeBtn = mobileNav.querySelector<HTMLElement>('.close');
    const menuButtonRef = openBtn;

    // H2: while the mobile menu is closed it is visually offscreen but its links
    // stayed keyboard-focusable. Mirror the hidden state with inert + aria-hidden.
    const setMobileNavInert = (inert: boolean) => {
      mobileNav.inert = inert;
      if (inert) mobileNav.setAttribute('aria-hidden', 'true');
      else mobileNav.removeAttribute('aria-hidden');
    };
    setMobileNavInert(true);

    const firstLinkFocus = () =>
      setTimeout(() => {
        const link = mobileNav.querySelector<HTMLElement>('a');
        if (link) link.focus();
        else if (closeBtn) closeBtn.focus();
      });

    mm.add(`(max-width: ${bp.lg - 1}px)`, () => {
      const reduced = prefersReducedMotion();
      menuTl = gsap.timeline({
        paused: true,
        defaults: { duration: reduced ? 0 : 0.5 },
      });
      menuTl.from(mobileNav, { yPercent: -150, duration: reduced ? 0 : 0.75, ease: 'elastic.out(1, 1.25)' });
      menuTl.from('.link', { yPercent: 100, stagger: 0.1, ease: 'power2.inOut' }, '<-=0.1');
      if (closeBtn) menuTl.from(closeBtn, { autoAlpha: 0 }, '>-=0.1');
      return () => {
        menuTl?.kill();
        menuTl = null;
      };
    });

    const open = async () => {
      menuOpenState = true;
      setMobileNavInert(false);
      openBtn?.setAttribute('aria-expanded', 'true');
      applyLogoClasses();
      getLenis()?.stop();
      if (menuTl) await menuTl.play();
      firstLinkFocus();
    };

    const close = (resumeLenis = true) => {
      if (!menuOpenState) return;
      menuOpenState = false;
      setMobileNavInert(true);
      openBtn?.setAttribute('aria-expanded', 'false');
      menuTl?.timeScale(1).reverse();
      if (resumeLenis) getLenis()?.start();
      setTimeout(() => menuButtonRef?.focus());
    };

    closeMenuFn = close;

    openBtn?.addEventListener('click', () => open());
    closeBtn?.addEventListener('click', () => close());

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!menuOpenState) return;
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'Tab': {
          const focusables = mobileNav.querySelectorAll<HTMLElement>(
            'a, button, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
  }

  updateHeaderActiveUI();

  // Handle initial hash / pending-anchor after initial loader completes
  let initialAnchorHandled = false;
  const handleInitialAnchor = () => {
    if (initialAnchorHandled) return;
    initialAnchorHandled = true;
    getLenis()?.start();
    const pending = getPendingAnchor();
    if (pending) clearPendingAnchor();
    const hash = pending || window.location.hash;
    if (hash) {
      setActiveAnchor(hash);
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        scrollToAnchor(hash);
      });
    }
  };

  bus.on('page-transition-complete', handleInitialAnchor);
  bus.on('hero-entrance-complete', handleInitialAnchor);

  // 4. toggleheader event (BQJKm7mv.js)
  document.addEventListener('toggleheader', ((e: CustomEvent<{ show?: boolean }>) => {
    const show = !!e.detail?.show;
    gsap.to(header, { autoAlpha: show ? 1 : 0 });
  }) as EventListener);
}
