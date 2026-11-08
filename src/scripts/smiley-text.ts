import { gsap, SplitText, bp, bus, seededRandom } from './core/gsap';

const SMILEY_SVGS: Record<number, { viewBox: string; d: string }> = {
  1: {
    viewBox: '0 0 11 12',
    d: 'M2.516.206h2.075v3.735H2.516zM2.516 11.828V9.752h6.227v2.076zM.438 6.431h2.075v3.32H.438zM6.668.206h2.075v3.735H6.668zM8.742 6.431h2.075v3.32H8.742z',
  },
  2: {
    viewBox: '0 0 11 12',
    d: 'M8.453 11.833H6.378V8.098h2.075zM8.453.209v2.076H2.226V.209zM10.528 5.603H8.453v-3.32h2.075zM4.297 11.833H2.222V8.098h2.075zM2.226 5.603H.151v-3.32h2.075z',
  },
  3: {
    viewBox: '0 0 12 12',
    d: 'M2.949.206h2.075v3.735H2.949zM2.95 11.828V9.752h6.226v2.076zM.867 6.431h2.075v3.32H.867zM7.098 1.551h2.075v1.042H7.098zM9.168 6.431h2.075v3.32H9.168z',
  },
};

const COLOR_MAP: Record<string, string> = {
  purple: 'bg-purple text-white',
  darkPurple: 'bg-darkPurple text-purple',
  green: 'bg-neonGreen text-darkPurple',
};

const CORNERS = [
  { class: 'rounded-tl-none', clipPath: '0 28px 28px 28px' },
  { class: 'rounded-tr-none', clipPath: '28px 0 28px 28px' },
  { class: 'rounded-bl-none', clipPath: '28px 28px 28px 0px' },
  { class: 'rounded-br-none', clipPath: '28px 28px 0px 28px' },
];

const SMILEY_CFG = {
  START: 'top bottom-=100',
  LINE_Y: 70,
  LINE_DURATION: 0.5,
  LINE_STAGGER: 0.1,
  LINE_EASE: 'power2.inOut',
  PILL_FIRST_AT: '>-0.5',
  PILL_NEXT_AT: '<+0.1',
  EXIT_Y: -100,
  EXIT_DURATION: 0.5,
  EXIT_STAGGER: 0.1,
  FAILSAFE_MS: 2500,
};

const PILL_CFG = {
  COLLAPSED_WIDTH_MOBILE: 15,
  COLLAPSED_WIDTH_DESKTOP: 20,
  OPEN_DURATION: 1.45,
  ICON_DURATION: 1,
  ICON_STAGGER: 0.05,
  ICON_X: -10,
  ICON_ROTATE: -50,
  EASE: 'smooth',
};

function pickIconTypes(count: number, rng: () => number = Math.random): number[] {
  if (count <= 0) return [];
  if (count === 1) return [Math.floor(rng() * 3) + 1];
  const out: number[] = [];
  let prev: number | null = null;
  for (let i = 0; i < count; i++) {
    let pick: number;
    let tries = 0;
    do {
      pick = Math.floor(rng() * 3) + 1;
      tries++;
    } while (pick === prev && tries < 10);
    if (pick === prev) {
      const choices = [1, 2, 3].filter((n) => n !== prev);
      pick = choices[Math.floor(rng() * choices.length)];
    }
    out.push(pick);
    prev = pick;
  }
  return out;
}

function buildPillHtml(color: string, count: number, size: 'sm' | 'lg', rng: () => number): string {
  const iconTypes = pickIconTypes(count, rng);
  const cornerIdx = Math.floor(rng() * 4);
  const corner = CORNERS[cornerIdx] ?? CORNERS[0];
  const colorCls = COLOR_MAP[color] || COLOR_MAP.purple;
  const sizeStyles =
    size === 'lg'
      ? {
          wrapper: 'py-4 px-9 lg:py-7 lg:px-14 -translate-y-3 lg:-translate-y-7',
          inner: 'gap-6 lg:gap-12',
          icon: 'w-6 min-w-6 lg:min-w-10 lg:w-10',
        }
      : {
          wrapper: 'py-4 px-9 lg:py-6 lg:px-14 -translate-y-3 lg:-translate-y-6',
          inner: 'gap-6 lg:gap-10',
          icon: 'w-6 min-w-6 lg:min-w-8 lg:w-8',
        };

  const iconsHtml = iconTypes
    .map((type) => {
      const svg = SMILEY_SVGS[type] || SMILEY_SVGS[1];
      return `<span class="parts-smileyPill__icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="${svg.viewBox}" class="${sizeStyles.icon}" aria-hidden="true"><path fill="currentColor" d="${svg.d}"/></svg></span>`;
    })
    .join('');

  return `<span class="parts-smileyPill inline-block"><span class="parts-smileyPill__wrapper inline-flex overflow-hidden rounded-28 ${colorCls} ${sizeStyles.wrapper} ${corner.class}" data-clip-path="${corner.clipPath}"><span class="parts-smileyPill__inner flex items-center overflow-hidden ${sizeStyles.inner}">${iconsHtml}</span></span></span>`;
}

function initPillTimeline(pillEl: HTMLElement): gsap.core.Timeline | null {
  const wrapper = pillEl.querySelector<HTMLElement>('.parts-smileyPill__wrapper');
  const icons = pillEl.querySelectorAll<HTMLElement>('.parts-smileyPill__icon');
  if (!wrapper) return null;
  const w = wrapper.offsetWidth;
  if (!w) return null;
  const collapsedW =
    window.innerWidth < bp.lg ? PILL_CFG.COLLAPSED_WIDTH_MOBILE : PILL_CFG.COLLAPSED_WIDTH_DESKTOP;
  const r = gsap.utils.clamp(0, 100, ((w - collapsedW) / w) * 100);
  const clipPath = wrapper.dataset.clipPath || CORNERS[0].clipPath;
  gsap.set(wrapper, { clipPath: `inset(0 ${r}% 0 0 round ${clipPath})` });
  return gsap
    .timeline()
    .to(wrapper, {
      clipPath: `inset(0 0% 0 0 round ${clipPath})`,
      duration: PILL_CFG.OPEN_DURATION,
      ease: PILL_CFG.EASE,
    })
    .from(
      icons,
      {
        x: (i: number) => (i === 0 ? 0 : PILL_CFG.ICON_X),
        rotate: PILL_CFG.ICON_ROTATE,
        duration: PILL_CFG.ICON_DURATION,
        opacity: 0,
        ease: PILL_CFG.EASE,
        stagger: PILL_CFG.ICON_STAGGER,
      },
      '<'
    );
}

interface SmileyConfig {
  rawContent: string;
  size: 'sm' | 'lg';
  scrollTrigger: boolean;
  hasExit: boolean;
  id: string;
  seed?: string;
}

function hydrateInner(el: HTMLElement, cfg: SmileyConfig): HTMLElement {
  const plainText = cfg.rawContent
    .replace(/\*\*[a-zA-Z]+-\d+\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  let srOnly = el.querySelector<HTMLElement>('.sr-only');
  if (!srOnly) {
    srOnly = document.createElement('span');
    srOnly.className = 'sr-only';
    el.prepend(srOnly);
  }
  srOnly.textContent = plainText;

  let inner = el.querySelector<HTMLElement>('[role="presentation"]');
  if (!inner) {
    inner = document.createElement('span');
    inner.setAttribute('aria-hidden', 'true');
    inner.setAttribute('role', 'presentation');
    inner.style.fontKerning = 'none';
    inner.style.textRendering = 'optimizeSpeed';
    el.appendChild(inner);
  }

  const rng = cfg.seed ? seededRandom(cfg.rawContent + cfg.seed) : Math.random;
  const regex = /\*\*([a-zA-Z]+)-(\d+)\*\*/g;
  const parts: string[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(cfg.rawContent)) !== null) {
    if (match.index > lastIdx) {
      parts.push(cfg.rawContent.slice(lastIdx, match.index));
    }
    const color = match[1];
    const count = parseInt(match[2], 10);
    parts.push(buildPillHtml(color, count, cfg.size, rng));
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < cfg.rawContent.length) {
    parts.push(cfg.rawContent.slice(lastIdx));
  }
  inner.innerHTML = parts.join('');
  return inner;
}

let activeCleanups: Array<() => void> = [];

export function destroySmileyTexts() {
  activeCleanups.forEach((fn) => fn());
  activeCleanups = [];
}

export function initSmileyTexts() {
  destroySmileyTexts();
  const elements = document.querySelectorAll<HTMLElement>('.parts-smileyText');

  elements.forEach((el) => {
    const inHero = !!el.closest('.sections-hero');
    const inCaseStudies = !!el.closest('.sections-caseStudies');
    const inContact = !!el.closest('.sections-contactForm');
    const isHeroMobile = inHero && !el.classList.contains('sections-hero__body');

    const existingSr = el.querySelector('.sr-only')?.textContent?.trim() ?? el.textContent?.trim() ?? '';
    const rawContent = inHero
      ? '**purple-4** Award-winning creative agency for video games. Brand shapers, game marketeers & web engineers.'
      : inContact
        ? `**purple-3** ${existingSr || 'We’re a games industry creative leader that will put your players first. Drop us a message!'}`
        : inCaseStudies && !existingSr.includes('**')
          ? `**purple-3** ${existingSr}`
          : existingSr;

    const cfg: SmileyConfig = {
      rawContent,
      size: inCaseStudies ? 'lg' : 'sm',
      scrollTrigger: !inHero,
      hasExit: isHeroMobile,
      id: inHero ? 'hero-smileyText' : 'smiley-text',
    };

    const innerEl = hydrateInner(el, cfg);

    let mainTl: gsap.core.Timeline | null = null;
    let exitTl: gsap.core.Timeline | null = null;
    let split: SplitText | null = null;
    let mm: gsap.MatchMedia | null = null;
    let completed = false;
    let playRequested = false;
    let pendingExitDir: number | null = null;
    let failsafeTimer: number | undefined;
    let destroyed = false;

    const onComplete = () => {
      completed = true;
      window.clearTimeout(failsafeTimer);
      if (split && !cfg.hasExit) {
        split.revert();
        split = null;
      }
    };

    const scheduleFailsafe = () => {
      if (!cfg.scrollTrigger) return;
      window.clearTimeout(failsafeTimer);
      failsafeTimer = window.setTimeout(() => {
        if (completed || destroyed || !el || !mainTl || !(window as any).animationsEnabled) return;
        const { top, bottom } = el.getBoundingClientRect();
        if (top < window.innerHeight && bottom > 0 && mainTl.progress() === 0 && !mainTl.isActive()) {
          mainTl.scrollTrigger?.kill();
          mainTl.play();
        }
      }, SMILEY_CFG.FAILSAFE_MS);
    };

    const buildMainTimeline = (lines: Element[]) => {
      mainTl?.scrollTrigger?.kill();
      mainTl?.kill();
      const tl = gsap.timeline({
        id: cfg.id,
        paused: !cfg.scrollTrigger,
        scrollTrigger: cfg.scrollTrigger
          ? {
              trigger: el,
              start: SMILEY_CFG.START,
              once: true,
            }
          : undefined,
        onComplete,
      });
      if (lines.length) {
        tl.from(
          lines,
          {
            yPercent: SMILEY_CFG.LINE_Y,
            autoAlpha: 0,
            stagger: SMILEY_CFG.LINE_STAGGER,
            duration: SMILEY_CFG.LINE_DURATION,
            ease: SMILEY_CFG.LINE_EASE,
          },
          0
        );
      }
      const pills = innerEl.querySelectorAll<HTMLElement>('.parts-smileyPill');
      pills.forEach((pill, idx) => {
        const pillTl = initPillTimeline(pill);
        if (pillTl) {
          tl.add(pillTl, idx === 0 ? SMILEY_CFG.PILL_FIRST_AT : SMILEY_CFG.PILL_NEXT_AT);
        }
      });
      if (cfg.scrollTrigger && !(window as any).animationsEnabled) {
        tl.scrollTrigger?.disable(false);
      }
      return tl;
    };

    const buildExitTimeline = (lines: Element[]) => {
      exitTl?.kill();
      const tl = gsap.timeline({ paused: true });
      if (lines.length) {
        tl.to(
          lines,
          {
            yPercent: SMILEY_CFG.EXIT_Y,
            autoAlpha: 0,
            stagger: SMILEY_CFG.EXIT_STAGGER,
            duration: SMILEY_CFG.EXIT_DURATION,
            ease: SMILEY_CFG.LINE_EASE,
          },
          0
        );
      }
      return tl;
    };

    const handleExit = (dir: number) => {
      if (dir === 1) {
        if (!exitTl) {
          pendingExitDir = dir;
          return;
        }
        if (mainTl?.isActive()) mainTl.then(() => exitTl?.play(0));
        else exitTl.play(0);
      } else if (dir === -1) {
        if (!mainTl) {
          pendingExitDir = dir;
          return;
        }
        if (exitTl?.isActive()) exitTl.then(() => mainTl?.play(0));
        else mainTl.play(0);
      }
    };

    const onPlay = () => {
      bus.off(`playTimeline-${cfg.id}`, onPlay);
      playRequested = true;
      if (mainTl) {
        mainTl.play();
      }
    };

    const onAnimationsEnabled = () => {
      const st = mainTl?.scrollTrigger;
      if (st) {
        st.enable();
        st.refresh();
      }
      scheduleFailsafe();
    };

    if (!cfg.scrollTrigger) {
      bus.on(`playTimeline-${cfg.id}`, onPlay);
    }
    if (cfg.hasExit) {
      bus.on(`playExitTimeline-${cfg.id}`, handleExit);
    }
    bus.on('animationsEnabled', onAnimationsEnabled);

    mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      split = SplitText.create(innerEl, {
        type: 'lines',
        deepSlice: true,
        linesClass: 'line',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) => {
          // If this responsive element currently has display: none (0 lines measured),
          // don't trap it in a hidden state. When a breakpoint change makes it visible,
          // autoSplit will re-run with real lines.
          if (!self.lines.length) {
            return;
          }
          if (cfg.hasExit) {
            exitTl = buildExitTimeline(self.lines);
            if (pendingExitDir !== null) {
              const d = pendingExitDir;
              pendingExitDir = null;
              handleExit(d);
            }
          }
          if (!completed) {
            mainTl = buildMainTimeline(self.lines);
            if (playRequested) {
              mainTl.play();
            }
            scheduleFailsafe();
            return mainTl;
          }
        },
      });
    });

    activeCleanups.push(() => {
      destroyed = true;
      window.clearTimeout(failsafeTimer);
      bus.off(`playTimeline-${cfg.id}`, onPlay);
      bus.off(`playExitTimeline-${cfg.id}`, handleExit);
      bus.off('animationsEnabled', onAnimationsEnabled);
      mainTl?.scrollTrigger?.kill();
      mainTl?.kill();
      exitTl?.kill();
      split?.revert();
      mm?.revert();
      mainTl = null;
      exitTl = null;
      split = null;
      mm = null;
    });
  });
}
