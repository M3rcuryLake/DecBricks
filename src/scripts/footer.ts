import { gsap, bp, bus, resizeManager, initSvgRectReveal } from './core/gsap';
import { getLenis } from './smooth-scroll';

/**
 * Original `useRandomLayout` (`N` in `B5DZxY3U.js`) for `.structure-footer__social` pills:
 * overflow: { default: { top: -20, right: -20, bottom: -20, left: -20 }, '2xl': { top: -50, right: -50, bottom: -100, left: -50 } }
 * gap: { default: 32, '2xl': 64 }, maxAttempts: 150
 */
function initSocialPillsRandomLayout(footer: HTMLElement) {
  const socials = Array.from(footer.querySelectorAll<HTMLElement>('.structure-footer__social'));
  const container = socials[0]?.parentElement;
  if (!container || !socials.length) return;

  const maxAttempts = 150;
  let lastWidth = 0;
  let lastBpKey = '';
  let normalizedCoords: { nx: number; ny: number }[] = [];

  const getBpKey = () => (window.innerWidth >= bp['2xl'] ? '2xl' : 'default');

  const getOverflow = () =>
    window.innerWidth >= bp['2xl']
      ? { top: -50, right: -50, bottom: -100, left: -50 }
      : { top: -20, right: -20, bottom: -20, left: -20 };

  const getGap = () => (window.innerWidth >= bp['2xl'] ? 64 : 32);

  const getBounds = (rect: DOMRect) => {
    const ov = getOverflow();
    const minX = Math.max(-ov.left, -rect.left);
    const maxX = Math.min(rect.width + ov.right, window.innerWidth - rect.left);
    const minY = -ov.top;
    const maxY = rect.height + ov.bottom;
    return { minX, maxX, minY, maxY };
  };

  const overlaps = (
    cx: number,
    cy: number,
    hw: number,
    hh: number,
    ocx: number,
    ocy: number,
    ohw: number,
    ohh: number
  ) => Math.abs(cx - ocx) < hw + ohw && Math.abs(cy - ocy) < hh + ohh;

  const recalculate = () => {
    const rect = container.getBoundingClientRect();
    lastWidth = rect.width;
    lastBpKey = getBpKey();

    const { minX, maxX, minY, maxY } = getBounds(rect);
    const gap = getGap();
    const sizes = socials.map((el) => {
      const r = el.getBoundingClientRect();
      return { width: r.width || 140, height: r.height || 44 };
    });

    const sorted = sizes.map((s, originalIndex) => ({ ...s, originalIndex }));
    sorted.sort((a, b) => b.width * b.height - a.width * a.height);

    const placed: { cx: number; cy: number; hw: number; hh: number }[] = [];
    const norm: { nx: number; ny: number }[] = new Array(sizes.length);

    for (const item of sorted) {
      const w = item.width;
      const h = item.height;
      const hw = (w + gap) / 2;
      const hh = (h + gap) / 2;
      const loX = minX + w / 2;
      const hiX = Math.max(loX, maxX - w / 2);
      const loY = minY + h / 2;
      const hiY = Math.max(loY, maxY - h / 2);

      let cx = loX;
      let cy = loY;
      let found = false;

      for (let i = 0; i < maxAttempts; i++) {
        const tx = loX + Math.random() * (hiX - loX);
        const ty = loY + Math.random() * (hiY - loY);
        if (!placed.some((p) => overlaps(tx, ty, hw, hh, p.cx, p.cy, p.hw, p.hh))) {
          cx = tx;
          cy = ty;
          found = true;
          break;
        }
      }

      if (!found) {
        const tightHw = w / 2 + 4;
        const tightHh = h / 2 + 4;
        for (let i = 0; i < maxAttempts; i++) {
          const tx = loX + Math.random() * (hiX - loX);
          const ty = loY + Math.random() * (hiY - loY);
          if (!placed.some((p) => overlaps(tx, ty, tightHw, tightHh, p.cx, p.cy, p.hw, p.hh))) {
            cx = tx;
            cy = ty;
            found = true;
            break;
          }
        }
      }

      if (!found) {
        cx = loX + Math.random() * (hiX - loX);
        cy = loY + Math.random() * (hiY - loY);
      }

      placed.push({ cx, cy, hw, hh });
      const spanX = maxX - minX;
      const spanY = maxY - minY;
      norm[item.originalIndex] = {
        nx: spanX > 0 ? (cx - minX) / spanX : 0.5,
        ny: spanY > 0 ? (cy - minY) / spanY : 0.5,
      };
      const el = socials[item.originalIndex];
      el.style.left = `${Math.round(cx - w / 2)}px`;
      el.style.top = `${Math.round(cy - h / 2)}px`;
    }

    normalizedCoords = norm;
  };

  const onResize = () => {
    const rect = container.getBoundingClientRect();
    if (getBpKey() !== lastBpKey) {
      recalculate();
      return;
    }
    if (Math.abs(rect.width - lastWidth) < 1) return;
    lastWidth = rect.width;
    const { minX, maxX, minY, maxY } = getBounds(rect);
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    socials.forEach((el, idx) => {
      const r = el.getBoundingClientRect();
      const w = r.width || 140;
      const h = r.height || 44;
      const n = normalizedCoords[idx] || { nx: 0.5, ny: 0.5 };
      let cx = minX + n.nx * spanX;
      let cy = minY + n.ny * spanY;
      cx = Math.max(minX + w / 2, Math.min(maxX - w / 2, cx));
      cy = Math.max(minY + h / 2, Math.min(maxY - h / 2, cy));
      el.style.left = `${Math.round(cx - w / 2)}px`;
      el.style.top = `${Math.round(cy - h / 2)}px`;
    });
  };

  recalculate();
  resizeManager.add(onResize);

  return () => {
    resizeManager.remove(onResize);
  };
}

export function initFooter() {
  const footer = document.querySelector<HTMLElement>('.structure-footer');
  if (!footer) return;

  initSvgRectReveal(footer);

  const inner = footer.querySelector<HTMLElement>('.structure-footer__inner');
  const marquee = footer.querySelector<HTMLElement>('.structure-footer__marquee');
  const scrollTopBtn = footer.querySelector<HTMLButtonElement>('.parts-btnScrollTop');
  const manageCookiesBtn = footer.querySelector<HTMLButtonElement>('button[aria-label="Manage Cookies"]');

  scrollTopBtn?.addEventListener('click', () => {
    getLenis()?.scrollTo(0);
  });

  manageCookiesBtn?.addEventListener('click', () => {
    bus.emit('manage-cookies');
  });

  const destroySocialPills = initSocialPillsRandomLayout(footer);

  const mm = gsap.matchMedia();
  mm.add(
    {
      isDesktop: `(min-width: ${bp.lg}px)`,
      isMobile: `(max-width: ${bp.lg - 1}px)`,
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { reduceMotion } = ctx.conditions as { reduceMotion: boolean; isDesktop: boolean };
      if (reduceMotion) return;

      let revealTl: gsap.core.Timeline | null = null;
      let marqueeTween: gsap.core.Tween | null = null;

      if (inner) {
        revealTl = gsap.timeline({
          scrollTrigger: {
            trigger: footer,
            start: 'top bottom',
            end: () => `+=${footer.offsetHeight}px`,
            scrub: true,
          },
        });
        revealTl.from(inner, { yPercent: -100, ease: 'none' });
      }

      if (marquee) {
        // Original: slide by half the (duplicated) track + half the gap, 45s linear, only while on screen.
        marqueeTween = gsap.to(marquee, {
          x: () => (marquee.offsetWidth + 100) * -0.5,
          duration: 45,
          repeat: -1,
          ease: 'none',
          scrollTrigger: {
            trigger: footer,
            start: 'top bottom',
            end: 'bottom top',
            toggleActions: 'play pause play pause',
            invalidateOnRefresh: true,
          },
        });
      }

      return () => {
        revealTl?.kill();
        marqueeTween?.kill();
      };
    }
  );

  return () => {
    destroySocialPills?.();
    mm.revert();
  };
}
