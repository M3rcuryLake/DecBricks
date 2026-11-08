import {
  gsap,
  Draggable,
  bp,
  prefersReducedMotion,
  resizeManager,
  initSvgRectReveal,
} from './core/gsap';

function seededPRNG(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

interface PlacedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function placeCards(
  sizes: { width: number; height: number }[],
  opts: {
    canvasSize?: number;
    minGap?: number;
    centerWidthRatio?: number;
    centerHeightRatio?: number;
    seed?: number;
    angleSeed?: number;
    radiusSeed?: number;
  } = {}
): PlacedRect[] {
  const count = sizes.length;
  const maxDim = Math.max(...sizes.map((s) => Math.max(s.width, s.height)));
  const {
    canvasSize = Math.ceil(Math.sqrt(count)) * (maxDim + 80),
    minGap = 40,
    centerWidthRatio = 1,
    centerHeightRatio = 1,
    seed = 1337,
    angleSeed = seed + 1,
    radiusSeed = seed + 2,
  } = opts;

  const rngMain = seededPRNG(seed);
  const rngAngle = seededPRNG(angleSeed);
  const rngRadius = seededPRNG(radiusSeed);
  const placed: PlacedRect[] = [];
  const half = canvasSize / 2;

  for (let i = 0; i < count; i++) {
    const { width, height } = sizes[i];
    if (i === 0) {
      placed.push({ x: half - width / 2, y: half - height / 2, width, height });
      continue;
    }
    let found = false;
    let candidate: PlacedRect = { x: half - width / 2, y: half - height / 2, width, height };
    let tries = 0;
    while (!found && tries < 2000) {
      tries++;
      const angle = rngAngle() * Math.PI * 2;
      const r = Math.sqrt(rngRadius()) * (canvasSize / 2 - Math.max(width, height) - minGap);
      const x = half + Math.cos(angle) * r * centerWidthRatio - width / 2;
      const y = half + Math.sin(angle) * r * centerHeightRatio - height / 2;
      candidate = { x, y, width, height };
      if (
        x < minGap ||
        y < minGap ||
        x + width > canvasSize - minGap ||
        y + height > canvasSize - minGap
      ) {
        continue;
      }
      found = placed.every((p) => {
        const expanded = {
          x: p.x - minGap,
          y: p.y - minGap,
          width: p.width + minGap * 2,
          height: p.height + minGap * 2,
        };
        return !rectsOverlap(candidate, expanded);
      });
    }
    if (!found) {
      candidate = {
        x: rngMain() * (canvasSize - width),
        y: rngMain() * (canvasSize - height),
        width,
        height,
      };
    }
    placed.push(candidate);
  }
  return placed;
}

function placeStickers(
  cards: PlacedRect[],
  stickerSizes: { width: number; height: number }[],
  opts: {
    canvasWidth: number;
    canvasHeight: number;
    margin?: number;
    seed?: number;
    cardBuffer?: number;
    stickerBuffer?: number;
  }
) {
  const {
    canvasWidth,
    canvasHeight,
    margin = 40,
    seed = 9999,
    cardBuffer = 40,
    stickerBuffer = 20,
  } = opts;
  const rng = seededPRNG(seed);
  const placed: (PlacedRect & { rotation: number })[] = [];
  const count = stickerSizes.length;
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const cellW = (canvasWidth - margin * 2) / cols;
  const cellH = (canvasHeight - margin * 2) / rows;
  const cells: { col: number; row: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ col: c, row: r });
    }
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  for (let i = 0; i < count; i++) {
    const { width, height } = stickerSizes[i];
    const cell = cells[i % cells.length];
    const minX = margin + cell.col * cellW;
    const maxX = minX + cellW - width;
    const minY = margin + cell.row * cellH;
    const maxY = minY + cellH - height;
    let found = false;
    let tries = 0;
    let candidate = { x: minX, y: minY, width, height, rotation: 0 };

    while (!found && tries < 300) {
      tries++;
      const x = maxX > minX ? minX + rng() * (maxX - minX) : minX;
      const y = maxY > minY ? minY + rng() * (maxY - minY) : minY;
      const rotation = (rng() - 0.5) * 30;
      candidate = { x, y, width, height, rotation };

      const clearOfCards = cards.every((c) => {
        const exp = {
          x: c.x - cardBuffer,
          y: c.y - cardBuffer,
          width: c.width + cardBuffer * 2,
          height: c.height + cardBuffer * 2,
        };
        return !rectsOverlap(candidate, exp);
      });
      if (!clearOfCards) continue;

      const clearOfStickers = placed.every((p) => {
        const exp = {
          x: p.x - stickerBuffer,
          y: p.y - stickerBuffer,
          width: p.width + stickerBuffer * 2,
          height: p.height + stickerBuffer * 2,
        };
        return !rectsOverlap(candidate, exp);
      });
      if (clearOfStickers) found = true;
    }

    if (!found) {
      candidate = {
        x: margin + rng() * Math.max(10, canvasWidth - width - margin * 2),
        y: margin + rng() * Math.max(10, canvasHeight - height - margin * 2),
        width,
        height,
        rotation: (rng() - 0.5) * 30,
      };
    }
    placed.push(candidate);
  }
  return placed;
}

function initMarqueeCursor(section: HTMLElement) {
  const cursor = section.querySelector<HTMLElement>('.parts-marqueeCursor');
  const card = cursor?.querySelector<HTMLElement>('.parts-marqueeCursor__card');
  const firstText = cursor?.querySelector<HTMLElement>('.parts-marqueeCursor__text');
  const target = section.querySelector<HTMLElement>('[data-cursor-target]');
  if (!cursor || !card || !firstText || !target) return;

  const setCardWidth = () => {
    card.style.width = `${firstText.offsetWidth}px`;
  };
  setCardWidth();
  resizeManager.add(setCardWidth);

  const mm = gsap.matchMedia();
  mm.add(
    {
      isDesktop: `(min-width: ${bp.lg}px)`,
      isMobile: `(max-width: ${bp.lg - 1}px)`,
      reduceMotion: '(prefers-reduced-motion: reduce)',
    },
    (ctx) => {
      const { isDesktop, isMobile } = ctx.conditions as { isDesktop: boolean; isMobile: boolean };
      if (isMobile) {
        gsap.set(card, { clearProps: 'scale,opacity' });
        gsap.set(cursor, { clearProps: 'x,y' });
        return;
      }
      if (!isDesktop) return;

      gsap.set(card, { scale: 0.5, opacity: 0 });
      gsap.set(cursor, { opacity: 1 });
      const qx = gsap.quickTo(cursor, 'x', { duration: 0.4, ease: 'power3' });
      const qy = gsap.quickTo(cursor, 'y', { duration: 0.4, ease: 'power3' });

      let visible = false;
      const show = () => {
        if (visible) return;
        visible = true;
        gsap.to(card, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' });
      };
      const hide = () => {
        if (!visible) return;
        visible = false;
        gsap.to(card, { scale: 0.5, opacity: 0, duration: 0.25, ease: 'power2.out' });
      };

      const onMove = (e: MouseEvent) => {
        qx(e.clientX + 20);
        qy(e.clientY);
        const prevented = (e.target as HTMLElement | null)?.closest('[data-cursor-prevent]');
        if (prevented) hide();
        else show();
      };

      target.addEventListener('mouseenter', (e) => {
        gsap.set(cursor, { x: e.clientX + 20, y: e.clientY });
        show();
      });
      target.addEventListener('mousemove', onMove);
      target.addEventListener('mouseleave', hide);
    }
  );

  return () => {
    resizeManager.remove(setCardWidth);
    mm.revert();
  };
}

export function initTestimonials() {
  const section = document.querySelector<HTMLElement>('.sections-testimonials');
  if (!section) return;

  initSvgRectReveal(section);
  const destroyMarqueeCursor = initMarqueeCursor(section);

  const inner = section.querySelector<HTMLElement>('.sections-testimonials__inner');
  const slider = section.querySelector<HTMLElement>('.sections-testimonials__slider');
  const overlay = section.querySelector<HTMLElement>('.sections-testimonials__overlay');
  const border = section.querySelector<HTMLElement>('.sections-testimonials__border');
  const cards = Array.from(section.querySelectorAll<HTMLElement>('.sections-testimonials__card'));
  const stickers = Array.from(section.querySelectorAll<HTMLElement>('.sections-testimonials__sticker'));
  const miniMap = section.querySelector<HTMLElement>('.parts-testimonialMiniMap__inner');
  const miniMapCross = section.querySelector<HTMLElement>('.parts-testimonialMiniMap__cross');

  if (!inner || !slider || !overlay || !cards.length) return;

  const config = {
    canvasSize: 3200,
    minGap: 180,
    centerWidthRatio: 1,
    centerHeightRatio: 0.7,
    seed: 10,
    angleSeed: 2,
    radiusSeed: 4,
    followStrength: 0.1,
    stagger: 0.025,
    scaleMinimum: 0.96,
    rotationSensitivity: 0.08,
    maxRotation: 6,
  };

  let mainDraggable: Draggable | null = null;
  let miniDraggable: Draggable | null = null;
  const targetOffset = { x: 0, y: 0 };
  const currentOffset = { x: 0, y: 0 };
  let isDragging = false;
  let didDrag = false;

  // Never let a drag release count as a click on links inside the cards.
  slider.style.userSelect = 'none';
  slider.style.touchAction = 'none';
  slider.addEventListener(
    'click',
    (e) => {
      if (didDrag) {
        e.preventDefault();
        e.stopPropagation();
        didDrag = false;
      }
    },
    true
  );
  let placedCards: PlacedRect[] = [];

  const cardData = cards.map((el, i) => ({
    element: el,
    baseX: 0,
    baseY: 0,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    scale: 1,
    strength: Math.max(0.02, config.followStrength - i * config.stagger),
  }));

  const layout = () => {
    const innerRect = inner.getBoundingClientRect();
    const cardSizes = cards.map((c) => {
      const r = c.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });

    placedCards = placeCards(cardSizes, config);
    const first = placedCards[0];
    const centerX = first.x + first.width / 2;
    const centerY = first.y + first.height / 2;
    const shiftX = innerRect.width / 2 - centerX;
    const shiftY = innerRect.height / 2 - centerY;
    placedCards = placedCards.map((p) => ({ ...p, x: p.x + shiftX, y: p.y + shiftY }));

    cards.forEach((el, idx) => {
      const p = placedCards[idx];
      gsap.set(el, { x: p.x, y: p.y });
      cardData[idx].baseX = p.x;
      cardData[idx].baseY = p.y;
      cardData[idx].offsetX = 0;
      cardData[idx].offsetY = 0;
    });

    const minX = Math.min(...placedCards.map((c) => c.x));
    const maxX = Math.max(...placedCards.map((c) => c.x + c.width));
    const minY = Math.min(...placedCards.map((c) => c.y));
    const maxY = Math.max(...placedCards.map((c) => c.y + c.height));
    const spanW = maxX - minX;
    const spanH = maxY - minY;

    const stickerSizes = stickers.map((s) => {
      const r = s.getBoundingClientRect();
      return { width: r.width || 200, height: r.height || 200 };
    });

    const placedStickers = placeStickers(
      placedCards.map((c) => ({ x: c.x - minX, y: c.y - minY, width: c.width, height: c.height })),
      stickerSizes,
      { canvasWidth: spanW, canvasHeight: spanH, margin: 40, seed: config.seed + 999 }
    );

    stickers.forEach((el, idx) => {
      const s = placedStickers[idx];
      gsap.set(el, { x: s.x + minX, y: s.y + minY, rotate: s.rotation });
    });

    const padX = window.innerWidth < bp.lg ? 30 : 120;
    const padY = window.innerWidth < bp.lg ? 30 : 80;

    if (border) {
      gsap.set(border, { width: spanW + padX * 1.4, height: spanH + padY * 1.4 });
    }

    const bounds = {
      minX: -(maxX - innerRect.width + padX),
      maxX: -(minX - padX),
      minY: -(maxY - innerRect.height + padY),
      maxY: -(minY - padY),
    };

    mainDraggable?.kill();
    gsap.set(overlay, { x: 0, y: 0 });
    gsap.set(slider, { x: 0, y: 0 });
    targetOffset.x = 0;
    targetOffset.y = 0;
    currentOffset.x = 0;
    currentOffset.y = 0;

    const updateFromMain = function (this: Draggable) {
      gsap.set(slider, { x: this.x, y: this.y });
      targetOffset.x = this.x;
      targetOffset.y = this.y;
      if (miniDraggable && miniMap && miniMapCross) {
        const mRect = miniMap.getBoundingClientRect();
        const cRect = miniMapCross.getBoundingClientRect();
        const mBounds = {
          minX: -(mRect.width / 2 - cRect.width / 2),
          maxX: mRect.width / 2 - cRect.width / 2,
          minY: -(mRect.height / 2 - cRect.height / 2),
          maxY: mRect.height / 2 - cRect.height / 2,
        };
        const mx = gsap.utils.mapRange(bounds.maxX, bounds.minX, mBounds.minX, mBounds.maxX, this.x);
        const my = gsap.utils.mapRange(bounds.maxY, bounds.minY, mBounds.minY, mBounds.maxY, this.y);
        gsap.set(miniMapCross, { x: mx, y: my });
        miniDraggable.update();
      }
    };

    // The overlay is pointer-events-none (as on the original), so the slider is the drag trigger.
    mainDraggable = Draggable.create(overlay, {
      type: 'x,y',
      trigger: slider,
      bounds,
      inertia: true,
      throwResistance: 2000,
      maxDuration: 1,
      allowContextMenu: true,
      onPress: () => {
        isDragging = true;
      },
      onDragStart: () => {
        didDrag = true;
      },
      onRelease: () => {
        isDragging = false;
        window.setTimeout(() => (didDrag = false), 50);
      },
      onDrag: updateFromMain,
      onThrowUpdate: updateFromMain,
    })[0];

    if (miniMap && miniMapCross && window.innerWidth >= bp.lg) {
      miniDraggable?.kill();
      gsap.set(miniMapCross, { x: 0, y: 0 });
      const mRect = miniMap.getBoundingClientRect();
      const cRect = miniMapCross.getBoundingClientRect();
      const mBounds = {
        minX: -(mRect.width / 2 - cRect.width / 2),
        maxX: mRect.width / 2 - cRect.width / 2,
        minY: -(mRect.height / 2 - cRect.height / 2),
        maxY: mRect.height / 2 - cRect.height / 2,
      };

      const updateFromMini = function (this: Draggable) {
        const sx = gsap.utils.mapRange(mBounds.minX, mBounds.maxX, bounds.maxX, bounds.minX, this.x);
        const sy = gsap.utils.mapRange(mBounds.minY, mBounds.maxY, bounds.maxY, bounds.minY, this.y);
        gsap.set([slider, overlay], { x: sx, y: sy });
        mainDraggable?.update();
        targetOffset.x = sx;
        targetOffset.y = sy;
      };

      miniDraggable = Draggable.create(miniMapCross, {
        bounds: mBounds,
        inertia: true,
        onDrag: updateFromMini,
        onThrowUpdate: updateFromMini,
      })[0];
    }
  };

  layout();
  resizeManager.add(layout);

  // Ticker for staggered card lag/rotation/scale while dragging
  const tickerFn = () => {
    const reduced = prefersReducedMotion();
    const dxGlobal = targetOffset.x - currentOffset.x;
    const dyGlobal = targetOffset.y - currentOffset.y;
    currentOffset.x += dxGlobal * 0.15;
    currentOffset.y += dyGlobal * 0.15;

    cardData.forEach((c) => {
      const tx = targetOffset.x - currentOffset.x;
      const ty = targetOffset.y - currentOffset.y;
      c.offsetX += (tx - c.offsetX) * c.strength;
      c.offsetY += (ty - c.offsetY) * c.strength;

      const vx = tx - c.offsetX;
      const vy = ty - c.offsetY;
      const speed = Math.hypot(vx, vy);
      const targetRot = reduced
        ? 0
        : gsap.utils.clamp(-config.maxRotation, config.maxRotation, vx * config.rotationSensitivity);
      c.rotation += (targetRot - c.rotation) * 0.12;

      const targetScale = reduced
        ? 1
        : isDragging
          ? config.scaleMinimum
          : gsap.utils.clamp(config.scaleMinimum, 1, 1 - speed * 0.0015);
      c.scale += (targetScale - c.scale) * 0.15;

      gsap.set(c.element, {
        x: c.baseX + (reduced ? 0 : c.offsetX),
        y: c.baseY + (reduced ? 0 : c.offsetY),
        rotation: c.rotation,
        scale: c.scale,
      });
    });
  };
  gsap.ticker.add(tickerFn);

  const teardown = () => {
    destroyMarqueeCursor?.();
    resizeManager.remove(layout);
    gsap.ticker.remove(tickerFn);
    mainDraggable?.kill();
    miniDraggable?.kill();
  };
  return teardown;
}
