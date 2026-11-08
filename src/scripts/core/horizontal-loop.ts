import { gsap, Draggable } from './gsap';

export interface HorizontalLoopConfig {
  paused?: boolean;
  repeat?: number;
  speed?: number;
  draggable?: boolean;
  snap?: number | false;
  paddingRight?: number | string;
  resistance?: number;
  minDuration?: number;
  maxDuration?: number;
  velocityScale?: number;
}

export type HorizontalLoop = gsap.core.Timeline & {
  draggable?: Draggable;
  closestIndex: (setCurrent?: boolean) => number;
  times: number[];
};

/**
 * Seamless horizontal loop of a row of items (the same helper the original uses
 * for its sticker slider): each item is animated off the left edge and re-enters
 * from the right, on one timeline that can be paused, played and dragged.
 * Items must be laid out in a single flex row.
 */
export function horizontalLoop(itemsIn: gsap.TweenTarget, config: HorizontalLoopConfig = {}): HorizontalLoop {
  const items = gsap.utils.toArray<HTMLElement>(itemsIn);
  let loop!: HorizontalLoop;

  gsap.context(() => {
    const tl = gsap.timeline({
      repeat: config.repeat,
      paused: config.paused,
      defaults: { ease: 'none' },
      onReverseComplete: () => {
        tl.totalTime(tl.rawTime() + tl.duration() * 100);
      },
    }) as HorizontalLoop;
    loop = tl;

    const length = items.length;
    const startX = items[0].offsetLeft;
    const times: number[] = [];
    const widths: number[] = [];
    const spaceBefore: number[] = [];
    const xPercents: number[] = [];
    let curIndex = 0;
    let indexIsDirty = false;
    const pixelsPerSecond = (config.speed || 1) * 100;
    const snap = config.snap === false ? (v: number) => v : gsap.utils.snap((config.snap as number) || 1);
    let totalWidth = 0;
    let timeWrap: (v: number) => number;

    const getTotalWidth = () =>
      items[length - 1].offsetLeft +
      (xPercents[length - 1] / 100) * widths[length - 1] -
      startX +
      spaceBefore[0] +
      items[length - 1].offsetWidth * (gsap.getProperty(items[length - 1], 'scaleX') as number) +
      (parseFloat(String(config.paddingRight)) || 0);

    const populateWidths = () => {
      let b1 = items[0].parentElement!.getBoundingClientRect();
      items.forEach((el, i) => {
        widths[i] = parseFloat(gsap.getProperty(el, 'width', 'px') as string);
        xPercents[i] = snap(
          (parseFloat(gsap.getProperty(el, 'x', 'px') as string) / widths[i]) * 100 +
            (gsap.getProperty(el, 'xPercent') as number)
        );
        const b2 = el.getBoundingClientRect();
        spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
        b1 = b2;
      });
      gsap.set(items, { xPercent: (i: number) => xPercents[i] });
      totalWidth = getTotalWidth();
    };

    const populateTimeline = () => {
      tl.clear();
      for (let i = 0; i < length; i++) {
        const item = items[i];
        const curX = (xPercents[i] / 100) * widths[i];
        const distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
        const distanceToLoop = distanceToStart + widths[i] * (gsap.getProperty(item, 'scaleX') as number);
        tl.to(
          item,
          { xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100), duration: distanceToLoop / pixelsPerSecond },
          0
        )
          .fromTo(
            item,
            { xPercent: snap(((curX - distanceToLoop + totalWidth) / widths[i]) * 100) },
            {
              xPercent: xPercents[i],
              duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
              immediateRender: false,
            },
            distanceToLoop / pixelsPerSecond
          )
          .add('label' + i, distanceToStart / pixelsPerSecond);
        times[i] = distanceToStart / pixelsPerSecond;
      }
      timeWrap = gsap.utils.wrap(0, tl.duration());
    };

    const closestIndexOf = (arr: number[], value: number, wrap: number) => {
      let i = arr.length;
      let closest = 1e10;
      let index = 0;
      while (i--) {
        let d = Math.abs(arr[i] - value);
        if (d > wrap / 2) d = wrap - d;
        if (d < closest) {
          closest = d;
          index = i;
        }
      }
      return index;
    };

    const refresh = (deep?: boolean) => {
      const progress = tl.progress();
      tl.progress(0, true);
      populateWidths();
      if (deep) populateTimeline();
      if (deep && tl.draggable) tl.time(times[curIndex], true);
      else tl.progress(progress, true);
    };

    gsap.set(items, { x: 0 });
    populateWidths();
    populateTimeline();
    window.addEventListener('resize', () => refresh(true));

    tl.closestIndex = (setCurrent) => {
      const index = closestIndexOf(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.times = times;
    tl.progress(1, true).progress(0, true);

    if (config.draggable) {
      const proxy = document.createElement('div');
      const wrap = gsap.utils.wrap(0, 1);
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      let ratio = 0;
      let startProgress = 0;
      let lastSnap = 0;
      let initChangeX = 0;
      let wasPlaying = false;
      const align = () => tl.progress(wrap(startProgress + (draggable.startX - draggable.x) * ratio));
      const syncIndex = () => tl.closestIndex(true);

      const draggable = Draggable.create(proxy, {
        trigger: items[0].parentElement,
        type: 'x',
        onPressInit() {
          const x = this.x;
          gsap.killTweensOf(tl);
          wasPlaying = !tl.paused();
          tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio = 1 / totalWidth;
          initChangeX = startProgress / -ratio - x;
          gsap.set(proxy, { x: startProgress / -ratio });
        },
        onDrag: align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        inertia: true,
        resistance: config.resistance || (mobile ? 5000 : 3000),
        minDuration: config.minDuration || (mobile ? 0.8 : 0.5),
        maxDuration: config.maxDuration || (mobile ? 3 : 2),
        velocityScale: config.velocityScale || (mobile ? 0.3 : 0.5),
        snap(value: number) {
          if (Math.abs(startProgress / -ratio - this.x) < 10) return lastSnap + initChangeX;
          const time = -(value * ratio) * tl.duration();
          const wrappedTime = timeWrap(time);
          let snapTime = times[closestIndexOf(times, wrappedTime, tl.duration())] - wrappedTime;
          if (Math.abs(snapTime) > tl.duration() / 2) snapTime += snapTime < 0 ? tl.duration() : -tl.duration();
          lastSnap = (time + snapTime) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease() {
          syncIndex();
          if (draggable.isThrowing) indexIsDirty = true;
        },
        onThrowComplete: () => {
          syncIndex();
          if (wasPlaying) tl.play();
        },
      })[0];
      tl.draggable = draggable;
      void indexIsDirty;
    }
    tl.closestIndex(true);
  });

  return loop;
}
