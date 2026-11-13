import { gsap, ScrollTrigger, bp, bus, prefersReducedMotion, resizeManager } from './core/gsap';
import { getLenis } from './smooth-scroll';

const TRANSITION_CONFIG = {
  DESKTOP_COLS: 12,
  MOBILE_COLS: 6,
  // Phase 2 polish (§4.5): cover/reveal aligned to the brand motion token
  // --dur-reveal (500ms) — snappier page swaps, same architecture. Stagger
  // and easing are the template's original values (untouched, BUG-015 rule:
  // swap lifecycle and canvas reattachment live elsewhere and stay as-is).
  DURATION: 0.5,
  COL_STAGGER: 0.025,
  ITEM_STAGGER: 0.005,
  EASE: 'power2.inOut',
  HERO_START_OFFSET: '>-0.5',
  LEAVE_TIMEOUT_MS: 3000,
  ENTER_TIMEOUT_MS: 6000,
};

const PENDING_ANCHOR_KEY = 'pending-anchor';

function setPendingAnchor(anchor: string) {
  if (anchor) localStorage.setItem(PENDING_ANCHOR_KEY, anchor);
}

export function getPendingAnchor(): string {
  return localStorage.getItem(PENDING_ANCHOR_KEY) ?? '';
}

export function clearPendingAnchor() {
  localStorage.removeItem(PENDING_ANCHOR_KEY);
}

export function normalizePath(path: string): string {
  return path.replace(/\/+$/, '') || '/';
}

type PageTransitionCallbacks = {
  onBeforeSwap: () => void;
  onAfterSwap: (newPath: string, pendingAnchor: string) => void;
  getHeaderOffset: () => number;
  closeMobileMenuIfOpen: (resumeLenis?: boolean) => void;
  setActiveAnchor: (anchor: string | null) => void;
  scrollToAnchor: (hash: string) => void;
};

let transitionStarted = false;
// Tracked current route: authoritative source for popstate handling (the DOM may
// temporarily hold another route's markup while a transition is in flight).
let trackedCurrentPath = normalizePath(window.location.pathname);

const ROUTE_WARM_TARGETS = ['/about', '/services'] as const;
const routeHtmlCache = new Map<string, Promise<string | null>>();
const warmedRoutes = new Set<string>();
const retainedWarmImages: HTMLImageElement[] = [];

const isSaveDataEnabled = (): boolean =>
  Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

let avifSupportPromise: Promise<boolean> | null = null;
const supportsAvif = (): Promise<boolean> => {
  if (!avifSupportPromise) {
    avifSupportPromise = new Promise((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(probe.width > 0);
      probe.onerror = () => resolve(false);
      probe.src =
        'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  }
  return avifSupportPromise;
};

function fetchRouteHtml(targetPath: string): Promise<string | null> {
  const key = normalizePath(targetPath);
  const existing = routeHtmlCache.get(key);
  if (existing) return existing;
  const req = fetch(key, { credentials: 'same-origin' })
    .then((res) => (res.ok ? res.text() : null))
    .catch(() => {
      routeHtmlCache.delete(key);
      return null;
    });
  routeHtmlCache.set(key, req);
  return req;
}

async function warmRouteAssets(targetPath: string): Promise<void> {
  const key = normalizePath(targetPath);
  if (warmedRoutes.has(key) || isSaveDataEnabled()) return;
  warmedRoutes.add(key);

  const html = await fetchRouteHtml(key);
  if (!html) return;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const canAvif = await supportsAvif();
  const preloadLinks = Array.from(
    doc.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]')
  );

  for (const link of preloadLinks) {
    if (link.type === 'image/avif' && !canAvif) continue;
    const srcset = link.getAttribute('imagesrcset');
    const sizes = link.getAttribute('imagesizes');
    const href = link.getAttribute('href');
    if (!srcset && !href) continue;

    const img = new Image();
    if (sizes) img.sizes = sizes;
    if (srcset) img.srcset = srcset;
    else if (href) img.src = href;
    retainedWarmImages.push(img);
  }
}

async function waitForEagerImages(container: Element, timeoutMs = 1200): Promise<void> {
  const eager = Array.from(container.querySelectorAll<HTMLImageElement>('img')).filter(
    (img) => img.loading !== 'lazy'
  );
  if (eager.length === 0) return;

  const ready = Promise.allSettled(
    eager.map((img) => {
      if (img.complete) return img.decode?.().catch(() => {}) ?? Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => {
          img.removeEventListener('load', done);
          img.removeEventListener('error', done);
          resolve();
        };
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    })
  );

  await Promise.race([ready, new Promise<void>((r) => window.setTimeout(r, timeoutMs))]);
}

export function initPageTransition(callbacks: PageTransitionCallbacks) {
  const overlayEl = document.querySelector<HTMLElement>('.structure-transitionOverlay');
  if (!overlayEl) return;

  const allColumns = Array.from(
    overlayEl.querySelectorAll<HTMLElement>('.structure-transitionOverlay__column')
  );
  let rowCount = 0;
  let activeCols = TRANSITION_CONFIG.DESKTOP_COLS;
  let activeTl: gsap.core.Timeline | null = null;
  let shuffledCols: HTMLElement[] | null = null;

  const getVisibleColumns = () => allColumns.slice(0, activeCols);
  const getVisibleItems = () =>
    getVisibleColumns().flatMap((col) =>
      Array.from(col.querySelectorAll<HTMLElement>('.structure-transitionOverlay__item'))
    );

  // Exact grid calculation from PageTransitionOverlay (b7KCVPpf.js N())
  const layoutGrid = () => {
    activeCols =
      window.innerWidth < bp.lg ? TRANSITION_CONFIG.MOBILE_COLS : TRANSITION_CONFIG.DESKTOP_COLS;
    gsap.set(overlayEl, {
      gridTemplateColumns: `repeat(${activeCols}, minmax(0, 1fr))`,
    });
    const cellSize = window.innerWidth / activeCols;
    rowCount = Math.max(1, Math.ceil(window.innerHeight / cellSize));

    allColumns.forEach((col, colIdx) => {
      if (colIdx >= activeCols) {
        col.style.display = 'none';
        col.innerHTML = '';
        return;
      }
      col.style.display = '';
      const currentItems = col.querySelectorAll('.structure-transitionOverlay__item').length;
      if (currentItems !== rowCount) {
        const frag = document.createDocumentFragment();
        for (let r = 1; r <= rowCount; r++) {
          const item = document.createElement('div');
          item.dataset.row = String(r);
          item.className =
            'structure-transitionOverlay__item aspect-square w-full bg-neonGreen motion-safe:scale-[1.01]';
          frag.appendChild(item);
        }
        col.innerHTML = '';
        col.appendChild(frag);
      }
    });
  };

  // Exact reset helper from b7KCVPpf.js P({ snapToVisible })
  const resetOverlay = ({ snapToVisible = false }: { snapToVisible?: boolean } = {}) => {
    if (activeTl) {
      activeTl.kill();
      activeTl = null;
    }
    shuffledCols = null;
    if (snapToVisible) {
      const cols = getVisibleColumns();
      const items = getVisibleItems();
      gsap.set(cols, { scaleY: 1, opacity: 1, clearProps: 'transformOrigin' });
      gsap.set(items, { autoAlpha: 1 });
    }
  };

  // Exact Cover / Entrance animation from b7KCVPpf.js F()
  const playEntrance = () => {
    layoutGrid();
    resetOverlay({ snapToVisible: true });

    const cols = getVisibleColumns();
    const items = getVisibleItems();
    const topEdgeItems = items.filter((el) => parseInt(el.dataset.row || '0', 10) <= 2);
    const reduced = prefersReducedMotion();

    shuffledCols = gsap.utils.shuffle([...cols]);
    overlayEl.style.display = 'grid';

    activeTl = gsap
      .timeline({
        onComplete: () => {
          activeTl = null;
          bus.emit('transition-entrance-done');
        },
      })
      .set(cols, { transformOrigin: 'center bottom' })
      .from(shuffledCols, {
        scaleY: reduced ? 1 : 0,
        opacity: reduced ? 0 : 1,
        duration: TRANSITION_CONFIG.DURATION,
        stagger: reduced ? 0 : TRANSITION_CONFIG.COL_STAGGER,
        ease: TRANSITION_CONFIG.EASE,
      })
      .from(
        gsap.utils.shuffle([...topEdgeItems]),
        {
          autoAlpha: 0,
          stagger:
            reduced ? 0 : (TRANSITION_CONFIG.ITEM_STAGGER / TRANSITION_CONFIG.DESKTOP_COLS) * 12,
          duration: TRANSITION_CONFIG.DURATION,
        },
        '<'
      );

    return activeTl;
  };

  // Exact Reveal / Exit animation from b7KCVPpf.js I()
  const playExit = () => {
    const savedOrder = shuffledCols;
    resetOverlay({ snapToVisible: false });

    const cols = getVisibleColumns();
    const items = getVisibleItems();
    const bottomEdgeItems = items.filter(
      (el) => parseInt(el.dataset.row || '0', 10) > rowCount - 2
    );
    const colsOrder = savedOrder ?? gsap.utils.shuffle([...cols]);
    const reduced = prefersReducedMotion();

    activeTl = gsap
      .timeline({
        onComplete: () => {
          activeTl = null;
          bus.emit('transition-exit-done');
          overlayEl.style.display = 'none';
          shuffledCols = null;
          gsap.set([items, cols], { clearProps: 'all' });
        },
      })
      .set(cols, { transformOrigin: 'center top' })
      .to(
        colsOrder,
        {
          scaleY: reduced ? 1 : 0,
          opacity: reduced ? 0 : 1,
          duration: TRANSITION_CONFIG.DURATION,
          stagger: reduced ? 0 : TRANSITION_CONFIG.COL_STAGGER,
          ease: TRANSITION_CONFIG.EASE,
        },
        0
      )
      .to(
        gsap.utils.shuffle([...bottomEdgeItems]),
        {
          autoAlpha: 0,
          stagger:
            reduced ? 0 : (TRANSITION_CONFIG.ITEM_STAGGER / TRANSITION_CONFIG.DESKTOP_COLS) * 12,
          duration: TRANSITION_CONFIG.DURATION,
          ease: TRANSITION_CONFIG.EASE,
        },
        '<'
      )
      .call(
        () => {
          bus.emit('hero-transition-start');
        },
        undefined,
        TRANSITION_CONFIG.HERO_START_OFFSET
      );

    return activeTl;
  };

  layoutGrid();
  resizeManager.add(() => {
    if (!transitionStarted) layoutGrid();
  });

  bus.on('transition-entrance-start', playEntrance);
  bus.on('transition-exit-start', playExit);

  // Scroll & touch lock helpers from yeE2xDWO.js
  const lockTouchScroll = () => {
    const { style } = document.documentElement;
    style.touchAction = 'none';
    style.overscrollBehavior = 'none';
  };

  const unlockTouchScroll = () => {
    const { style } = document.documentElement;
    style.touchAction = '';
    style.overscrollBehavior = '';
  };

  const setScrollImmediate = (y = 0) => {
    const lenis = getLenis();
    window.scrollTo(0, y);
    document.documentElement.scrollTop = y;
    document.body.scrollTop = y;
    lenis?.scrollTo(y, { immediate: true, force: true });
  };

  const waitForEvents = (
    events: string[],
    requireMode: 'any' | 'all',
    timeoutMs: number
  ): Promise<void> =>
    new Promise((resolve) => {
      const remaining = new Set(events);
      const handlers = new Map<string, () => void>();
      let done = false;
      let timer: number | undefined;

      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        handlers.forEach((fn, evt) => bus.off(evt, fn));
        handlers.clear();
        resolve();
      };

      events.forEach((evt) => {
        const fn = () => {
          remaining.delete(evt);
          if (requireMode === 'any' || remaining.size === 0) finish();
        };
        handlers.set(evt, fn);
        bus.on(evt, fn);
      });

      if (timeoutMs > 0) {
        timer = window.setTimeout(finish, timeoutMs);
      }
    });

  // Execute cross-route transition matching yeE2xDWO.js
  const runRouteTransition = async (
    targetPath: string,
    anchor: string,
    pushHistory = true
  ) => {
    if (transitionStarted) return;
    transitionStarted = true;

    if (anchor) {
      setPendingAnchor(anchor);
      callbacks.setActiveAnchor(anchor);
    } else {
      clearPendingAnchor();
      callbacks.setActiveAnchor(null);
    }

    callbacks.closeMobileMenuIfOpen(false);

    const lenis = getLenis();
    lenis?.stop();
    lockTouchScroll();

    let resolvePageSettled: (() => void) | null = null;
    (window as any).pageSettled = new Promise<void>((res) => {
      resolvePageSettled = res;
    });

    const settlePage = () => {
      resolvePageSettled?.();
      resolvePageSettled = null;
      (window as any).pageSettled = null;
    };

    // Start cover animation and fetch new route HTML in parallel
    const entranceDonePromise = waitForEvents(
      ['transition-entrance-done'],
      'all',
      TRANSITION_CONFIG.LEAVE_TIMEOUT_MS
    );
    bus.emit('transition-entrance-start');

    let fetchedDoc: Document | null = null;
    try {
      const html = await fetchRouteHtml(targetPath);
      if (html) fetchedDoc = new DOMParser().parseFromString(html, 'text/html');
    } catch (err) {
      console.error('[PageTransition] Failed to fetch route:', err);
    }

    await entranceDonePromise;

    if (!fetchedDoc) {
      unlockTouchScroll();
      lenis?.start();
      settlePage();
      transitionStarted = false;
      window.location.href = anchor ? `${targetPath}${anchor}` : targetPath;
      return;
    }

    // Update URL history during the solid green hold
    if (pushHistory) {
      const historyUrl =
        anchor && anchor !== '#work' && anchor !== '#contact'
          ? `${targetPath}${anchor}`
          : targetPath;
      history.pushState({}, '', historyUrl);
      trackedCurrentPath = targetPath;
    }

    // Swap DOM content while screen is 100% covered by bg-neonGreen
    callbacks.onBeforeSwap();

    document.title = fetchedDoc.title || document.title;
    document.body.className = fetchedDoc.body.className;

    const currentPageEl = document.querySelector<HTMLElement>('.page');
    const fetchedPageEl = fetchedDoc.querySelector<HTMLElement>('.page');

    if (currentPageEl && fetchedPageEl) {
      currentPageEl.className = fetchedPageEl.className;
      // Preserve the persistent <header class="structure-menu"> so it stays mounted above the green layer
      const existingHeader = currentPageEl.querySelector<HTMLElement>('.structure-menu');
      Array.from(currentPageEl.children).forEach((child) => {
        if (child !== existingHeader) child.remove();
      });
      Array.from(fetchedPageEl.children).forEach((child) => {
        if (!child.classList.contains('structure-menu')) {
          currentPageEl.appendChild(document.adoptNode(child));
        }
      });
    }

    // Reset scroll to 0 before mounting new page scripts
    setScrollImmediate(0);

    // Mount new page scripts and wait for hero-ready (with safety timeout)
    const heroReadyPromise = waitForEvents(
      ['hero-ready'],
      'all',
      TRANSITION_CONFIG.LEAVE_TIMEOUT_MS
    );
    callbacks.onAfterSwap(targetPath, anchor);
    await heroReadyPromise;
    if (currentPageEl) await waitForEagerImages(currentPageEl, 1200);

    // Exact settle & pending-anchor resolution from yeE2xDWO.js h()
    await new Promise<void>((resolve) => {
      setScrollImmediate(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lenis?.resize();
          ScrollTrigger.clearScrollMemory();
          const pending = getPendingAnchor();
          let targetScrollY = 0;
          if (pending) {
            clearPendingAnchor();
            const targetEl = document.querySelector<HTMLElement>(pending);
            if (targetEl) {
              callbacks.setActiveAnchor(pending);
              targetScrollY = Math.max(
                0,
                targetEl.getBoundingClientRect().top + window.scrollY - callbacks.getHeaderOffset()
              );
            }
          }
          setScrollImmediate(targetScrollY);
          requestAnimationFrame(() => {
            setScrollImmediate(targetScrollY);
            lenis?.raf(performance.now());
            ScrollTrigger.refresh();
            ScrollTrigger.update();
            settlePage();
            resolve();
          });
        });
      });
    });

    // Wait for reveal exit (and hero entrance if on home page and not scrolled past hero)
    const exitEvents = ['transition-exit-done'];
    if (document.querySelector('.sections-hero') && window.scrollY === 0) {
      exitEvents.push('hero-entrance-complete');
    }
    const exitDonePromise = waitForEvents(
      exitEvents,
      'all',
      TRANSITION_CONFIG.ENTER_TIMEOUT_MS
    );

    bus.emit('transition-exit-start');
    await exitDonePromise;

    unlockTouchScroll();
    lenis?.start();
    transitionStarted = false;
    bus.emit('page-transition-complete');
  };

  // Execute same-route inpage transition matching B8xyUFFL.js LinkPart
  const runInpageTransition = async (targetPath: string, anchor: string) => {
    if (transitionStarted) return;
    transitionStarted = true;

    callbacks.closeMobileMenuIfOpen(false);

    const lenis = getLenis();
    lenis?.stop();
    lockTouchScroll();

    let resolvePageSettled: (() => void) | null = null;
    (window as any).pageSettled = new Promise<void>((res) => {
      resolvePageSettled = res;
    });

    const settlePage = () => {
      resolvePageSettled?.();
      resolvePageSettled = null;
      (window as any).pageSettled = null;
    };

    // 1. Start cover animation
    const entranceDonePromise = waitForEvents(
      ['transition-entrance-done'],
      'all',
      TRANSITION_CONFIG.LEAVE_TIMEOUT_MS
    );
    bus.emit('transition-entrance-start');
    await entranceDonePromise;

    // 2. Under solid neon-green cover: update active nav anchor, URL, and scroll immediately
    if (anchor) {
      callbacks.setActiveAnchor(anchor);
      const nextUrl =
        anchor === '#work' || anchor === '#contact' ? targetPath : `${targetPath}${anchor}`;
      history.pushState({}, '', nextUrl);
    } else {
      callbacks.setActiveAnchor(null);
      history.pushState({}, '', targetPath);
    }
    trackedCurrentPath = targetPath;

    let targetScrollY = 0;
    if (anchor) {
      const targetEl = document.querySelector<HTMLElement>(anchor);
      if (targetEl) {
        targetScrollY = Math.max(
          0,
          targetEl.getBoundingClientRect().top + window.scrollY - callbacks.getHeaderOffset()
        );
      }
    }

    // Exact settle & scroll jump under solid cover (matching yeE2xDWO.js h())
    await new Promise<void>((resolve) => {
      setScrollImmediate(targetScrollY);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lenis?.resize();
          ScrollTrigger.clearScrollMemory();
          setScrollImmediate(targetScrollY);
          requestAnimationFrame(() => {
            setScrollImmediate(targetScrollY);
            lenis?.raf(performance.now());
            ScrollTrigger.refresh();
            ScrollTrigger.update();
            settlePage();
            resolve();
          });
        });
      });
    });

    // 3. Start exit animation
    const exitDonePromise = waitForEvents(
      ['transition-exit-done'],
      'all',
      TRANSITION_CONFIG.ENTER_TIMEOUT_MS
    );
    bus.emit('transition-exit-start');
    await exitDonePromise;

    unlockTouchScroll();
    lenis?.start();
    transitionStarted = false;
    bus.emit('page-transition-complete');
  };

  // Delegated click listener for all internal links
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!link) return;

    const rawHref = link.getAttribute('href') || '';
    const dataAnchor = link.getAttribute('data-anchor') || '';

    // 1. Pure in-page hash link (#work, #contact, etc.)
    if (rawHref.startsWith('#') && rawHref.length > 1) {
      if (rawHref === '#work' || rawHref === '#contact') {
        e.preventDefault();
        if (transitionStarted) return;
        runInpageTransition(normalizePath(window.location.pathname), rawHref);
        return;
      }
      // Handled by ServicesHero / ServicesSidebarNav or smooth scroll
      return;
    }

    // 2. Internal route link (/ or /services or /services#strategy or /#work or /#contact)
    if (!rawHref.startsWith('/')) return;

    e.preventDefault();
    if (transitionStarted) return;

    const [pathPart, hashPart] = rawHref.split('#');
    const targetPath = normalizePath(pathPart || '/');
    const currentPath = normalizePath(window.location.pathname);
    const anchor = dataAnchor || (hashPart ? `#${hashPart}` : '');

    // Same-route navigation: run the neon-green pixelated skyline transition
    if (targetPath === currentPath) {
      runInpageTransition(targetPath, anchor);
      return;
    }

    // Cross-route navigation: run the neon-green pixelated skyline transition
    runRouteTransition(targetPath, anchor, true);
  });

  // Warm secondary routes' HTML + responsive image preloads once initial load/loader finishes.
  const scheduleIdleWarm = () => {
    const run = () => {
      for (const route of ROUTE_WARM_TARGETS) {
        if (normalizePath(route) !== normalizePath(window.location.pathname)) {
          void warmRouteAssets(route);
        }
      }
    };
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback;
    if (ric) ric(run, { timeout: 600 });
    else window.setTimeout(run, 300);
  };
  if ((window as Window & { animationsEnabled?: boolean }).animationsEnabled) {
    scheduleIdleWarm();
  } else {
    const onInitialReady = () => {
      bus.off('animationsEnabled', onInitialReady);
      scheduleIdleWarm();
    };
    bus.on('animationsEnabled', onInitialReady);
  }

  // Also warm internal route assets on hover/focus intent before click.
  const onLinkIntent = (e: Event) => {
    const link =
      e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href^="/"]') : null;
    if (!link) return;
    const rawHref = link.getAttribute('href') || '';
    const [pathPart] = rawHref.split('#');
    const targetPath = normalizePath(pathPart || '/');
    if (targetPath !== normalizePath(window.location.pathname)) {
      void warmRouteAssets(targetPath);
    }
  };
  document.addEventListener('pointerenter', onLinkIntent, { capture: true, passive: true });
  document.addEventListener('focusin', onLinkIntent, { passive: true });

  // Browser back/forward navigation
  window.addEventListener('popstate', () => {
    const targetPath = normalizePath(window.location.pathname);
    const currentPath = trackedCurrentPath;
    const hash = window.location.hash || '';

    if (targetPath !== currentPath) {
      trackedCurrentPath = targetPath;
      runRouteTransition(targetPath, hash, false);
    } else if (hash) {
      callbacks.scrollToAnchor(hash);
    } else {
      getLenis()?.scrollTo(0);
    }
  });
}
