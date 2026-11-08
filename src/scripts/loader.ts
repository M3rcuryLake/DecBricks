import { gsap, SplitText, bus, bp, prefersReducedMotion } from './core/gsap';

const DURATION = 0.8;
const EASE = 'smooth-2';
const READOUT_DELAY = 0.2;
const STAGE_OVERLAP = -0.2;
const RESIZE_THRESHOLD = 140;

type Stage = { width: number; height: number };
type Config = {
  designWidth: number;
  minScale: number;
  maxScale: number;
  viewportFit: number;
  readoutOffset: number;
  readoutPlacement: 'below' | 'side';
  stages: Stage[];
};

const mobile: Config = {
  designWidth: 390,
  minScale: 0.6,
  maxScale: 1.25,
  viewportFit: 0.92,
  readoutOffset: 0,
  readoutPlacement: 'below',
  stages: [
    { width: 260, height: 260 },
    { width: 300, height: 480 },
    { width: 340, height: 700 },
  ],
};
const overrides: Record<number, Partial<Config>> = {
  [bp.md]: {
    designWidth: 768,
    minScale: 0.7,
    maxScale: 1.15,
    viewportFit: 0.88,
    stages: [
      { width: 380, height: 380 },
      { width: 500, height: 620 },
      { width: 640, height: 800 },
    ],
  },
  [bp.lg]: {
    designWidth: 1920,
    minScale: 0.8,
    maxScale: 1.1,
    viewportFit: 0.85,
    readoutOffset: 200,
    readoutPlacement: 'side',
    stages: [
      { width: 420, height: 420 },
      { width: 800, height: 420 },
      { width: 1200, height: 600 },
    ],
  },
  [bp['2xl']]: { minScale: 0.4 },
};

const configFor = (w: number): Config => {
  let c = mobile;
  for (const k of Object.keys(overrides)
    .map(Number)
    .sort((a, b) => a - b)) {
    if (w >= k) c = { ...c, ...overrides[k] } as Config;
  }
  return c;
};

let activeLoaderCtx: gsap.Context | null = null;
let hasRunInitialLoader = false;

/** Per-heading intro/outro timeline (char slide in, then out, matching CKIv4oMg.js). */
function headingTimeline(el: HTMLElement, reduced: boolean) {
  const tl = gsap.timeline();
  const heading = el.querySelector<HTMLElement>('.parts-loaderHeading__heading')!;
  const counter = el.querySelector<HTMLElement>('.parts-loaderHeading__counter')!;
  const a = SplitText.create(heading, { type: 'lines,chars', linesClass: 'line' });
  const b = SplitText.create(counter, { type: 'lines,chars', linesClass: 'line' });
  // GSAP runtime supports function-based values; its type defs don't, so cast.
  const y = ((i: number) => (reduced ? 0 : i % 2 === 0 ? '-100%' : '100%')) as unknown as gsap.TweenValue;
  const o = +!reduced;

  // Explicitly place chars in their pre-entrance offscreen state before removing .unsplit
  // so Stage 1 never flashes or overlaps while Stage 0 is playing.
  gsap.set(a.chars, { y, opacity: o });
  gsap.set(b.chars, { y, opacity: o });
  el.classList.remove('unsplit');

  tl.to(a.chars, {
    y: 0,
    opacity: 1,
    duration: 0.3,
    ease: 'slowDown',
    stagger: { each: 0.02, from: 'random' },
  })
    .to(
      b.chars,
      {
        y: 0,
        opacity: 1,
        duration: 0.35,
        ease: 'slowDown',
        stagger: { each: 0.02, from: 'random' },
      },
      '<+=0.1'
    )
    .to(a.chars, {
      y,
      opacity: o,
      duration: 0.3,
      ease: 'accelerate',
      stagger: { each: 0.025, from: 'random' },
    })
    .to(
      b.chars,
      {
        y,
        opacity: o,
        duration: 0.35,
        ease: 'accelerate',
        stagger: { each: 0.025, from: 'random' },
      },
      '<+=0.1'
    );

  return tl;
}

export function initLoader() {
  const root = document.querySelector<HTMLElement>('.structure-loader');
  // Run once per initial page load only, never on route changes or duplicate calls
  if (!root || hasRunInitialLoader) {
    if (root) root.style.display = 'none';
    (window as any).animationsEnabled = true;
    bus.emit('transition-entrance-done');
    bus.emit('hero-transition-start');
    bus.emit('page-transition-complete');
    bus.emit('animationsEnabled');
    return;
  }

  hasRunInitialLoader = true;
  if (activeLoaderCtx) {
    activeLoaderCtx.revert();
    activeLoaderCtx = null;
  }

  const headings = [...root.querySelectorAll<HTMLElement>('.parts-loaderHeading')];
  const box = root.querySelector<HTMLElement>(':scope > div.border')!;
  const spans = box.querySelectorAll<HTMLElement>('span.font-offBit');
  const heightEl = spans[0];
  const widthEl = spans[1]; // readout: height (with arrow icon) then width
  const readout = box.querySelector<HTMLElement>(':scope > div:last-child')!;

  // Counters: first heading ("Hold Tight") shows a zero-padded random 001-049, second ("Almost Ready") shows 100.
  const start = Math.ceil(Math.random() * 49);
  headings.forEach((h, i) => {
    const n = i === 0 ? start : 100;
    const counterEl = h.querySelector<HTMLElement>('.parts-loaderHeading__counter');
    if (counterEl) {
      counterEl.textContent = n < 10 ? `00${n}` : n < 100 ? `0${n}` : String(n);
    }
  });

  const reduced = prefersReducedMotion();
  let cfg = configFor(window.innerWidth);
  let scale = 1;
  const size = { width: 0, height: 0 };
  let lastW = window.innerWidth;
  let lastH = window.innerHeight;
  let heroReady = false;
  let tl!: gsap.core.Timeline;

  const maxStage = () =>
    cfg.stages.reduce(
      (m, s) => ({ width: Math.max(m.width, s.width), height: Math.max(m.height, s.height) }),
      { width: 0, height: 0 }
    );
  const computeScale = () => {
    const m = maxStage();
    const byWidth = gsap.utils.clamp(cfg.minScale, cfg.maxScale, window.innerWidth / cfg.designWidth);
    return Math.min(
      byWidth,
      (window.innerWidth * cfg.viewportFit) / m.width,
      (window.innerHeight * cfg.viewportFit) / m.height
    );
  };
  const stageSize = (i: number) => ({
    width: Math.round(cfg.stages[i].width * scale),
    height: Math.round(cfg.stages[i].height * scale),
  });
  const applyConfig = () => {
    cfg = configFor(window.innerWidth);
    scale = computeScale();
    root.style.setProperty('--loader-scale', String(scale));
    root.style.setProperty('--readout-offset', `${cfg.readoutOffset}px`);
    readout.classList.toggle('top-full', cfg.readoutPlacement === 'side');
    readout.classList.toggle('top-[calc(100%+10px)]', cfg.readoutPlacement !== 'side');
    readout.classList.toggle('right-0', cfg.readoutPlacement !== 'side');
    readout.style.left =
      cfg.readoutPlacement === 'side' ? 'calc(100% + var(--readout-offset) * var(--loader-scale))' : '';
  };
  const setBoxStart = () => {
    const s = stageSize(0);
    gsap.set(box, { width: s.width, height: s.height, scale: 0 });
  };
  const updateReadout = () => {
    widthEl.textContent = String(Math.floor(size.width * scale));
    heightEl.textContent = String(Math.floor(size.height * scale));
  };

  applyConfig();
  setBoxStart();

  const addStage = (i: number, position: string, instant: boolean) => {
    const sub = headings[i] ? headingTimeline(headings[i], reduced) : null;
    const last = i === cfg.stages.length - 1;
    const d = instant ? 0 : DURATION;
    tl.to(
      box,
      {
        width: () => stageSize(i).width,
        height: () => stageSize(i).height,
        ...(last && !instant ? { autoAlpha: 0 } : {}),
        duration: d,
        ease: EASE,
      },
      position
    );
    tl.to(
      size,
      {
        width: () => cfg.stages[i].width,
        height: () => cfg.stages[i].height,
        duration: d,
        ease: EASE,
        onUpdate: updateReadout,
      },
      '<'
    );
    if (last && instant) tl.to(box, { autoAlpha: 0, duration: DURATION, ease: 'none' }, '<');
    if (sub) tl.add(sub, last ? '<' : `<+=${READOUT_DELAY}`);
  };

  const ctx = gsap.context(() => {
    tl = gsap.timeline({
      onStart: () => bus.emit('transition-entrance-done'),
      onComplete: () => {
        setTimeout(() => {
          bus.emit('page-transition-complete');
        }, 0);
      },
    });
    tl.to(box, { scale: 1, duration: reduced ? 0 : DURATION, ease: EASE });
    cfg.stages.forEach((_, i) => addStage(i, i === 0 ? '<' : `>${STAGE_OVERLAP}`, reduced));
    // Hold at the end until the hero is ready.
    tl.addPause('<', () => {
      if (heroReady) tl.play();
    });
    tl.call(() => bus.emit('hero-transition-start'), undefined, '<+0.3');
    tl.to(root, { autoAlpha: 0, duration: 0.5 }, '<');
    tl.call(
      () => {
        (window as any).animationsEnabled = true;
        bus.emit('animationsEnabled');
        root.style.display = 'none';
      },
      undefined,
      '<'
    );
  }, root);

  activeLoaderCtx = ctx;
  (window as any).animationsEnabled = false;

  const onHeroReady = () => {
    heroReady = true;
    bus.off('hero-ready', onHeroReady);
    if (tl.paused()) tl.play();
  };
  bus.on('hero-ready', onHeroReady);

  let rt: number;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = window.setTimeout(() => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const ignore = w === lastW && Math.abs(h - lastH) < RESIZE_THRESHOLD;
      lastW = w;
      lastH = h;
      if (ignore) return;
      applyConfig();
      if (tl.progress() === 0) setBoxStart();
      else tl.invalidate();
      updateReadout();
    }, 200);
  });
  return ctx;
}
