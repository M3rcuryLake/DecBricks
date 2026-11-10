import { gsap, ScrollTrigger, SplitText, bp, bus, prefersReducedMotion } from './core/gsap';
import { getLenis } from './smooth-scroll';
import { getWebGLExperience, type WebGLTrail } from './webgl/experience';
import { CLIENT_LOGOS, type ClientLogo, SERVICES } from '../data/services';

/** Section items derived from hero "Jump to" links so any page can reuse this
 * init with its own section list (defaults to the SERVICES ids when absent). */
function deriveNavItems(links: HTMLAnchorElement[]) {
  const items = links
    .map((link) => ({
      id: (link.getAttribute('href') || '').replace(/^#/, ''),
    }))
    .filter((it) => it.id);
  return items.length ? items : SERVICES.map((s) => ({ id: s.id }));
}

function initServicesHero(heroEl: HTMLElement) {
  // 1. "Jump to" ServiceNavLink char roll hover/focus (ZYPH-moW.js).
  // Desktop-only matchMedia gate; reverse runs at default timescale; charsClass 'char'.
  const navLinks = Array.from(heroEl.querySelectorAll<HTMLAnchorElement>('.parts-serviceNavLink'));  const mmRoll = gsap.matchMedia();
  mmRoll.add(
    { isDesktop: `(min-width: ${bp.lg}px)`, reduceMotion: '(prefers-reduced-motion: reduce)' },
    (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions as { isDesktop: boolean; reduceMotion: boolean };
      if (!isDesktop || reduceMotion) return;
      const splits: SplitText[] = [];
      navLinks.forEach((link) => {
        const labels = link.querySelectorAll<HTMLElement>('.parts-serviceNavLink__label');
        if (!labels.length) return;
        const split = SplitText.create(labels, { type: 'chars', charsClass: 'char' });
        splits.push(split);
        const tl = gsap.timeline({ paused: true });
        tl.to(split.chars, { yPercent: -100, ease: 'power1.inOut', stagger: 0.03, duration: 0.2 });
        const onEnter = () => tl.play();
        const onLeave = () => tl.reverse();
        link.addEventListener('mouseenter', onEnter);
        link.addEventListener('mouseleave', onLeave);
        link.addEventListener('focus', onEnter);
        link.addEventListener('blur', onLeave);
      });
      return () => splits.forEach((s) => s.revert());
    }
  );

  // 2. Hero-side activeHash tracking (Bcraduc1.js useServicesNav): the first item is
  // active immediately at mount; per-section triggers ('top center' → 'bottom center')
  // keep it in sync in both scroll directions. NOT held-gated, runs on mobile too.
  const sectionIdOf = (link: HTMLAnchorElement) => (link.getAttribute('href') || '').replace(/^#/, '');
  const setHeroActive = (id: string) => {
    navLinks.forEach((l) => l.setAttribute('aria-current', sectionIdOf(l) === id ? 'true' : 'false'));
  };
  const heroNavItems = deriveNavItems(navLinks);
  setHeroActive(heroNavItems[0].id);
  const heroTriggers: ScrollTrigger[] = [];
  heroNavItems.forEach(({ id }) => {
    const service = { id };
    const sectionEl = document.getElementById(service.id);
    if (!sectionEl) return;
    heroTriggers.push(
      ScrollTrigger.create({
        trigger: sectionEl,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) setHeroActive(service.id);
        },
      })
    );
  });

  // 3. ServicesHero WebGLTrail entrance (DkMVPGq6.js)
  let webGLTrail: WebGLTrail | null = null;
  let entranceTl: gsap.core.Timeline | null = null;
  let playQueued = false;

  const setupHeroEntrance = () => {
    const trailSvg = heroEl.querySelector<SVGSVGElement>('.sections-servicesHero__trail');
    const isDesktop = window.innerWidth >= bp.lg;
    const reduced = prefersReducedMotion();

    if (isDesktop && trailSvg && (window as any).hasWebGL) {
      const exp = getWebGLExperience();
      if (exp) {
        webGLTrail = exp.createTrail(trailSvg, {
          // Original gates on the 2xl breakpoint (1440px), not xl.
          planeSize: () => ({
            width: window.innerWidth < bp['2xl'] ? 75 : 100,
            height: window.innerWidth < bp['2xl'] ? 75 : 100,
          }),
        });
      }
    }

    if (webGLTrail && !reduced) {
      let completedEmitted = false;
      const emitComplete = () => {
        if (completedEmitted) return;
        completedEmitted = true;
        bus.emit('hero-entrance-complete');
        getLenis()?.start();
      };
      entranceTl = gsap.timeline({
        paused: !playQueued,
        onComplete: () => {
          entranceTl?.kill();
          entranceTl = null;
          emitComplete();
        },
      });
      entranceTl
        .to(webGLTrail.timeline, {
          progress: 1,
          duration: 1,
          ease: 'power1.out',
        })
        .call(emitComplete, undefined, '<+0.2');
    }

    bus.emit('hero-ready');
  };

  const onPlayHero = () => {
    bus.off('hero-transition-start', onPlayHero);
    if (entranceTl) {
      entranceTl.play();
    } else {
      playQueued = true;
      bus.emit('hero-entrance-complete');
      getLenis()?.start();
    }
  };

  const onTransitionEntranceDone = () => {
    bus.off('transition-entrance-done', onTransitionEntranceDone);
    setupHeroEntrance();
  };

  bus.on(' hero-transition-start'.trim(), onPlayHero);
  if ((window as any).animationsEnabled) {
    setupHeroEntrance();
  } else {
    bus.on('transition-entrance-done', onTransitionEntranceDone);
  }

  return () => {
    bus.off(' hero-transition-start'.trim(), onPlayHero);
    bus.off('transition-entrance-done', onTransitionEntranceDone);
    mmRoll.revert();
  };
}

function initServiceBlocks() {
  // AutoplayVideo play/pause on viewport enter/leave (Bm2y9FGs.js).
  // The original defers setup until the page-level transition completes, so a block video
  // sitting in the first viewport stays paused until the loader/entrance has finished.
  let mm: gsap.MatchMedia | null = null;
  const wire = () => {
    const videoWrappers = document.querySelectorAll<HTMLElement>('.parts-autoplayVideo');
    mm = gsap.matchMedia();
    mm.add(
      { isDesktop: `(min-width: ${bp.lg}px)`, isMobile: `(max-width: ${bp.lg - 1}px)` },
      () => {
        const triggers: ScrollTrigger[] = [];
        videoWrappers.forEach((wrapper) => {
          const video = wrapper.querySelector<HTMLVideoElement>('video');
          if (!video) return;

          const playVideo = () => {
            if (prefersReducedMotion()) return;
            if (!video.src && video.dataset.src) {
              video.src = video.dataset.src;
              video.load();
            }
            video.play().catch(() => {});
          };
          const pauseVideo = () => {
            video.pause();
          };

          triggers.push(
            ScrollTrigger.create({
              trigger: wrapper,
              start: 'top bottom',
              end: 'bottom top',
              onEnter: playVideo,
              onEnterBack: playVideo,
              onLeave: pauseVideo,
              onLeaveBack: pauseVideo,
            })
          );
        });
        return () => triggers.forEach((t) => t.kill());
      }
    );
  };

  // Defer until the loader/transition has finished:
  const once = () => {
    bus.off('page-transition-complete', once);
    wire();
  };
  const loader = document.querySelector<HTMLElement>('.structure-loader');
  if (!loader || loader.style.display === 'none') {
    wire();
  } else {
    bus.on('page-transition-complete', once);
  }

  return () => {
    bus.off('page-transition-complete', once);
    mm?.revert();
  };
}

function initServicesSidebarNav() {
  const navEl = document.querySelector<HTMLElement>('.sections-servicesSidebarNav');
  const listSection = document.querySelector<HTMLElement>('.sections-servicesList');
  if (!navEl || !listSection) return;

  const itemLinks = Array.from(navEl.querySelectorAll<HTMLAnchorElement>('.sections-servicesSidebarNavItem'));
  const heroJumpLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.parts-serviceNavLink'));

  type ItemRefs = {
    id: string;
    link: HTMLAnchorElement;
    row: HTMLElement | null;
    bullet: HTMLElement | null;
    index: HTMLElement | null;
    labelWrap: HTMLElement | null;
    labelInner: HTMLElement | null;
    labelText: HTMLElement | null;
    metrics: { f: number; cMinusSLeft: number; u: number; p: number };
    tl: gsap.core.Timeline | null;
  };

  const items: ItemRefs[] = itemLinks.map((link) => {
    const href = link.getAttribute('href') || '';
    const id = href.replace(/^#/, '');
    const labelWrap = link.querySelector<HTMLElement>('.sections-servicesSidebarNavItem__label');
    return {
      id,
      link,
      row: link.querySelector<HTMLElement>(':scope > div'),
      bullet: link.querySelector<HTMLElement>('.sections-servicesSidebarNavItem__bullet'),
      index: link.querySelector<HTMLElement>('.sections-servicesSidebarNavItem__index'),
      labelWrap,
      labelInner: labelWrap?.querySelector<HTMLElement>(':scope > span') ?? null,
      labelText: link.querySelector<HTMLElement>('.sections-servicesSidebarNavItem__text'),
      metrics: { f: 0, cMinusSLeft: 0, u: 0, p: 0 },
      tl: null,
    };
  });

  let activeId: string | null = null;
  let held = false;

  const animateItem = (item: ItemRefs, isActive: boolean, reduced: boolean) => {
    item.tl?.kill();
    const { bullet, index, labelWrap, labelText, metrics } = item;
    if (!bullet || !index || !labelWrap || !labelText) return;

    const tl = gsap.timeline();
    item.tl = tl;

    if (isActive) {
      tl.to(bullet, { x: metrics.f, duration: 0.8, ease: 'smooth' }, 0)
        .to(index, { rotation: 90, x: metrics.cMinusSLeft, y: metrics.u, duration: 0.8, ease: 'smooth' }, '<')
        .to(labelWrap, { height: metrics.p, duration: 0.8, ease: 'smooth' }, '<+0.13')
        .fromTo(labelText, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: 'slowDown' }, '<+0.3');
    } else {
      tl.to(labelText, { xPercent: -100, duration: 0.5, ease: 'slowDown' }, 0)
        .to(labelWrap, { height: 0, duration: 0.8, ease: 'smooth' }, '<+0.2')
        .to(bullet, { x: 0, duration: 0.8, ease: 'smooth' }, '<-0.17')
        .to(index, { rotation: 0, x: 0, y: 0, duration: 0.8, ease: 'smooth' }, '<');
    }
    if (reduced) tl.progress(1);
  };

  const setActive = (nextId: string | null) => {
    if (activeId === nextId) return;
    activeId = nextId;
    const reduced = prefersReducedMotion();

    items.forEach((item) => {
      const isCurrent = item.id === activeId;
      item.link.setAttribute('aria-current', isCurrent ? 'true' : 'false');
      animateItem(item, isCurrent, reduced);
    });
    // Hero "Jump to" links track their own activeHash (independent useServicesNav instance
    // in the original) — they are NOT held-gated and are wired in initServicesHero.
  };

  // Original hold semantics (D5w6q2GP.js + tKtS4PHT.js): held stays true from click until
  // the Lenis scroll completes; wheel/touch/key input during the glide keeps it held;
  // on completion the active item re-syncs to whatever the section triggers report.
  let itemTriggers: ScrollTrigger[] = [];

  const syncActiveToScroll = () => {
    const current = itemTriggers.find((t) => t.isActive);
    setActive(current ? items[itemTriggers.indexOf(current)].id : null);
  };

  const headerOffset = () => {
    const header = document.querySelector<HTMLElement>('.structure-menu');
    return header ? -header.offsetHeight : 0;
  };

  const holdListeners: Array<[string, EventListener]> = [
    ['wheel', () => (held = true)],
    ['touchstart', () => (held = true)],
    ['keydown', () => (held = true)],
  ];
  const addHoldListeners = () =>
    holdListeners.forEach(([n, fn]) => window.addEventListener(n, fn, { passive: true }));
  const removeHoldListeners = () =>
    holdListeners.forEach(([n, fn]) => window.removeEventListener(n, fn));

  const scrollToSection = (id: string, onComplete: () => void) => {
    const sectionEl = document.getElementById(id);
    if (!sectionEl) {
      onComplete();
      return;
    }
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(sectionEl, { offset: headerOffset(), onComplete });
    } else {
      sectionEl.scrollIntoView({ behavior: 'auto' });
      onComplete();
    }
  };

  // Sidebar item click (tKtS4PHT.js select): prevent default, smooth-scroll via Lenis,
  // hold until the scroll completes, then re-sync the active item to the live position.
  items.forEach((item) => {
    item.link.addEventListener('click', (e) => {
      e.preventDefault();
      held = true;
      addHoldListeners();
      setActive(item.id);
      scrollToSection(item.id, () => {
        removeHoldListeners();
        held = false;
        syncActiveToScroll();
      });
    });
  });

  // Hero "Jump to" click (ZYPH-moW.js select → useServicesNav.scrollToSection):
  // smooth-scroll only; the hero highlight follows its own section triggers.
  heroJumpLinks.forEach((jumpLink) => {
    jumpLink.addEventListener('click', (e) => {
      const id = (jumpLink.getAttribute('href') || '').replace(/^#/, '');
      if (!id) return;
      e.preventDefault();
      scrollToSection(id, () => {});
    });
  });

  const mm = gsap.matchMedia();
  mm.add(
    {
      isDesktop: `(min-width: ${bp.lg}px)`,
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions as {
        isDesktop: boolean;
        reduceMotion: boolean;
      };
      if (!isDesktop) return;

      // Measure and initialize items in collapsed state (exact tKtS4PHT.js formula)
      items.forEach((item) => {
        const { link, row, bullet, index, labelWrap, labelInner, labelText } = item;
        if (!row || !bullet || !index || !labelWrap || !labelInner || !labelText) return;
        const i = link.getBoundingClientRect();
        const a = row.getBoundingClientRect();
        const o = bullet.getBoundingClientRect();
        const s = index.getBoundingClientRect();
        const c = i.left + i.width / 2;
        const l = s.left - o.right;
        const u = o.height / 2 + l;
        const d = s.top + s.height / 2 + u + s.width - a.bottom;
        gsap.set(labelInner, { marginTop: d });
        const f = c - (o.left + o.width / 2);
        const p = labelInner.offsetHeight + d;
        item.metrics = { f, cMinusSLeft: c - s.left, u, p };
        gsap.set(labelText, { xPercent: 100 });
        gsap.set(index, { transformOrigin: 'left center' });
        gsap.set(labelWrap, { height: 0 });
      });

      const labelsHeight = Array.from(
        navEl.querySelectorAll<HTMLElement>('.sections-servicesSidebarNavItem__label')
      ).reduce((sum, el) => sum + el.offsetHeight, 0);
      gsap.set(navEl, { xPercent: 100, y: -(navEl.offsetHeight - labelsHeight) / 2 });
      navEl.setAttribute('inert', '');

      const navItems = deriveNavItems(itemLinks);
      const lastServiceId = navItems[navItems.length - 1].id;
      const lastSectionEl = document.getElementById(lastServiceId);

      // One show/hide timeline (D5w6q2GP.js): fromTo xPercent 100 → 0 with
      // toggleActions 'play reverse play reverse'; inert follows the trigger state.
      const showHideTl = gsap.timeline({
        scrollTrigger: {
          trigger: listSection,
          start: 'top top',
          endTrigger: lastSectionEl || listSection,
          end: 'bottom center',
          toggleActions: 'play reverse play reverse',
          onToggle: (self) => {
            if (self.isActive) navEl.removeAttribute('inert');
            else navEl.setAttribute('inert', '');
          },
        },
      });
      showHideTl.fromTo(
        navEl,
        { xPercent: 100 },
        { xPercent: 0, duration: reduceMotion ? 0 : 0.6, ease: 'power3.out' }
      );

      itemTriggers = [];

      navItems.forEach((navItem, idx) => {
        const service = { id: navItem.id };
        const sectionEl = document.getElementById(service.id);
        if (!sectionEl) return;
        const nextService = navItems[idx + 1];
        const nextSectionEl = nextService ? document.getElementById(nextService.id) : null;
        const isFirst = idx === 0;
        const isLast = idx === navItems.length - 1;

        const st = ScrollTrigger.create({
          trigger: sectionEl,
          start: 'top center',
          endTrigger: nextSectionEl || sectionEl,
          end: nextSectionEl ? 'top center' : 'bottom center',
          onEnter: () => {
            if (!held) setActive(service.id);
          },
          onEnterBack: () => {
            if (!held) setActive(service.id);
          },
          onLeave: () => {
            if (!held && isLast && activeId === service.id) setActive(null);
          },
          onLeaveBack: () => {
            if (!held && isFirst && activeId === service.id) setActive(null);
          },
        });
        itemTriggers.push(st);
      });

      return () => {
        showHideTl.scrollTrigger?.kill();
        showHideTl.kill();
        itemTriggers.forEach((t) => t.kill());
        itemTriggers = [];
      };
    }
  );

  return () => {
    mm.revert();
  };
}

function initServicesClients() {
  const section = document.querySelector<HTMLElement>('.sections-servicesClients');
  if (!section) return;

  const slots = Array.from(section.querySelectorAll<HTMLLIElement>('li[data-slot]'));
  if (slots.length === 0 || CLIENT_LOGOS.length <= slots.length) return;

  // Original (IETaHSxK.js): first 12 logos fill the grid; a FIFO queue holds the rest.
  // Every 2500 ms a random slot takes the queue head and the displaced logo re-joins
  // the queue tail — the rotation never stops (ping-pong through the whole pool).
  const displayed: ClientLogo[] = CLIENT_LOGOS.slice(0, slots.length);
  const queue: ClientLogo[] = CLIENT_LOGOS.slice(slots.length);
  let intervalId: number | null = null;

  const swapRandomLogo = () => {
    if (prefersReducedMotion() || queue.length === 0) return;

    const slotIdx = Math.floor(Math.random() * slots.length);
    const head = queue.shift()!;
    const displaced = displayed[slotIdx];
    displayed[slotIdx] = head;
    queue.push(displaced);

    const li = slots[slotIdx];
    const oldWrap = li.querySelector<HTMLElement>(':scope > div:last-child');

    const newWrap = document.createElement('div');
    newWrap.className = 'col-start-1 row-start-1 size-full opacity-0 transition-opacity duration-700 ease-in-out';
    newWrap.innerHTML = `<picture class="parts-webPicture"><img alt="${head.alt}" src="${head.src}" width="${head.width}" height="${head.height}" class="block size-full object-contain" sizes="215px" loading="lazy" draggable="false" /></picture>`;
    li.appendChild(newWrap);

    // Crossfade on next frame (Vue Transition enter/leave equivalent)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (oldWrap) oldWrap.classList.add('opacity-0');
        newWrap.classList.remove('opacity-0');
      });
    });

    window.setTimeout(() => {
      if (oldWrap && oldWrap.parentNode === li) {
        oldWrap.remove();
      }
    }, 750);
  };

  const startRotation = () => {
    if (intervalId !== null || prefersReducedMotion()) return;
    intervalId = window.setInterval(swapRandomLogo, 2500);
  };

  const stopRotation = () => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) startRotation();
        else stopRotation();
      });
    },
    { threshold: 0.1 }
  );

  io.observe(section);

  return () => {
    stopRotation();
    io.disconnect();
  };
}

export function initServicesPage() {
  const heroEl = document.querySelector<HTMLElement>('.sections-servicesHero');
  if (!heroEl) return;

  document.body.classList.add('bg-darkPurple');
  document.body.classList.remove('bg-white');

  const teardowns = [
    initServicesHero(heroEl),
    initServiceBlocks(),
    initServicesSidebarNav(),
    initServicesClients(),
  ];
  return () => teardowns.forEach((t) => t?.());
}
