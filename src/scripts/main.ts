import './core/gsap';
import { ScrollTrigger, bus } from './core/gsap';
import { initSmoothScroll } from './smooth-scroll';
import { initLoader } from './loader';
import { Hero } from './hero';
import { initPreviewVideos } from './media';
import { initCookies } from './cookies';
import { destroySmileyTexts, initSmileyTexts } from './smiley-text';
import { initButtons } from './buttons';
import {
  closeMobileMenuIfOpen,
  getHeaderOffset,
  initMenu,
  refreshHeaderForRoute,
  scrollToAnchor,
  setActiveAnchor,
} from './menu';
import { initPageTransition } from './page-transition';
import { initVideoPlayer } from './video-player';
import { initServices } from './services';
import { initServicesPage } from './services-page';
import { initKeywords } from './keywords';
import { initCaseStudies } from './case-studies';
import { initTestimonials } from './testimonials';
import { initContact } from './contact';
import { initFooter } from './footer';
import { bp } from './core/gsap';
import { getWebGLExperience } from './webgl/instance';

let webglModule: typeof import('./webgl/experience') | null = null;
function loadWebGL() {
  if (typeof window === 'undefined' || window.innerWidth < bp.lg) return;
  if (!webglModule) {
    import('./webgl/experience').then((mod) => {
      webglModule = mod;
      mod.initWebGL();
    });
  } else {
    webglModule.initWebGL();
  }
}

let hero: Hero | undefined;
let heroPlayHandler: (() => void) | null = null;

// Per-route module teardowns collected from every init*() that returns one.
// Runs on onBeforeSwap so timed intervals, ticker callbacks, resize handlers,
// gsap.matchMedia contexts and Draggables never accumulate across route swaps.
let pageTearDowns: Array<() => void> = [];
function teardown(fn: unknown) {
  if (typeof fn === 'function') pageTearDowns.push(fn as () => void);
}

function mountHeroForCurrentPage() {
  if (heroPlayHandler) {
    bus.off('hero-transition-start', heroPlayHandler);
    heroPlayHandler = null;
  }
  const heroEl = document.querySelector<HTMLElement>('.sections-hero');
  const servicesHeroEl = document.querySelector<HTMLElement>('.sections-servicesHero');
  if (!heroEl) {
    if (!servicesHeroEl) {
      bus.emit('hero-ready');
    }
    return;
  }
  heroPlayHandler = () => {
    if (heroPlayHandler) {
      bus.off('hero-transition-start', heroPlayHandler);
      heroPlayHandler = null;
    }
    hero?.playEntrance();
  };
  bus.on('hero-transition-start', heroPlayHandler);
  hero = new Hero(heroEl);
}

function playInlineVideos() {
  document.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
    if (v.closest('.parts-autoplayVideo')) return;
    if (v.src || v.querySelector('source')) v.play().catch(() => {});
  });
}

// Initial boot
initSmoothScroll();
teardown(initPreviewVideos());
loadWebGL();
window.addEventListener('resize', () => {
  if (window.innerWidth >= bp.lg) loadWebGL();
}, { passive: true });
initSmileyTexts();
teardown(initButtons());
initMenu();
teardown(initVideoPlayer());
teardown(initServices());
teardown(initServicesPage());
teardown(initKeywords());
teardown(initCaseStudies());
teardown(initTestimonials());
teardown(initContact());
teardown(initFooter());
initCookies();

initPageTransition({
  onBeforeSwap: () => {
    if (heroPlayHandler) {
      bus.off('hero-transition-start', heroPlayHandler);
      heroPlayHandler = null;
    }
    hero?.destroy();
    hero = undefined;
    pageTearDowns.forEach((t) => t());
    pageTearDowns = [];
    destroySmileyTexts();
    ScrollTrigger.getAll().forEach((st) => st.kill());
  },
  onAfterSwap: (newPath: string) => {
    teardown(initPreviewVideos());
    getWebGLExperience()?.rebuildPageTargets();
    initSmileyTexts();
    teardown(initButtons());
    teardown(initVideoPlayer());
    teardown(initServices());
    teardown(initServicesPage());
    teardown(initKeywords());
    teardown(initCaseStudies());
    teardown(initTestimonials());
    teardown(initContact());
    teardown(initFooter());
    refreshHeaderForRoute(newPath);
    mountHeroForCurrentPage();
    playInlineVideos();
  },
  getHeaderOffset,
  closeMobileMenuIfOpen,
  setActiveAnchor,
  scrollToAnchor,
});

const onInitialTransitionEntranceDone = () => {
  bus.off('transition-entrance-done', onInitialTransitionEntranceDone);
  mountHeroForCurrentPage();
};
bus.on('transition-entrance-done', onInitialTransitionEntranceDone);

const boot = () => {
  initLoader();
  playInlineVideos();
};
if (document.readyState === 'complete') boot();
else window.addEventListener('load', boot, { once: true });
