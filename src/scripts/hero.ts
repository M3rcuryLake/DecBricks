import { gsap, ScrollTrigger, SplitText, bus, bp } from './core/gsap';
import { getLenis } from './smooth-scroll';
import { getWebGLExperience, type WebGLImage } from './webgl/experience';

type Conds = { isDesktop: boolean; isMobile: boolean; reduceMotion: boolean };
const MQ = {
  isDesktop: `(min-width: ${bp.lg}px)`,
  isMobile: `(max-width: ${bp.lg - 1}px)`,
  reduceMotion: '(prefers-reduced-motion: reduce)',
};

const px = (v: string) => parseFloat(v) || 0;

/** Bounding box of an element with its transform/rotate temporarily removed. */
function boxOf(el: HTMLElement) {
  const t = el.style.transform;
  const rot = el.style.rotate;
  el.style.setProperty('transform', 'none', 'important');
  el.style.setProperty('rotate', 'none', 'important');
  void el.offsetHeight;
  const r = el.getBoundingClientRect();
  if (t) el.style.transform = t;
  else el.style.removeProperty('transform');
  if (rot) el.style.rotate = rot;
  else el.style.removeProperty('rotate');
  return { width: r.width, height: r.height, x: r.x, y: r.y };
}

export class Hero {
  private mm = gsap.matchMedia();
  private entrance?: gsap.core.Timeline;
  private scrollTl?: gsap.core.Timeline;
  private pin?: ScrollTrigger;
  private playerScrollTrigger?: ScrollTrigger;
  private webGLImage?: WebGLImage | null;
  private playQueued = false;
  private entranceFinished = false;
  private direction: number | -1 | 1 | null = null;
  private pinBaseY?: number;
  private dom: ReturnType<Hero['getDom']>;
  private ac = new AbortController();
  /** Initial tilt (deg) captured from the standalone CSS `rotate` property (Tailwind v4 `rotate-14`). */
  private tilt = 0;
  private tiltCaptured = false;

  private onRefreshInit = () => {
    if (this.dom.player) gsap.set(this.dom.player, { clearProps: 'y' });
  };

  private normalizeTilt(el: HTMLElement | undefined) {
    if (!el) return;
    if (!this.tiltCaptured) {
      const cs = getComputedStyle(el);
      const propRot = parseFloat(cs.rotate) || 0;
      const m = /matrix\(([-\d.]+),\s*([-\d.]+),/.exec(cs.transform);
      let matrixDeg = 0;
      if (m) {
        const deg = (Math.atan2(parseFloat(m[2]), parseFloat(m[1])) * 180) / Math.PI;
        if (Math.abs(deg) > 0.5) matrixDeg = Math.round(deg);
      }
      this.tilt = propRot || matrixDeg || 0;
      this.tiltCaptured = true;
    }
    if (this.tilt) {
      el.style.setProperty('rotate', '0deg');
      gsap.set(el, { rotation: this.tilt });
    }
  }

  constructor(private el: HTMLElement) {
    this.dom = this.getDom(el);
    this.init();
  }

  private getDom(e: HTMLElement) {
    return {
      top: e.querySelector<HTMLElement>('.hero-top')!,
      start: e.querySelector<HTMLElement>('.start')!,
      startMobile: e.querySelector<HTMLElement>('.start-mobile'),
      startMobileInner: e.querySelector<HTMLElement>('.start-mobile-inner'),
      end: e.querySelector<HTMLElement>('.end'),
      player: e.querySelector<HTMLElement>('.parts-webglVideoPlayer'),
      text: [...e.querySelectorAll<HTMLElement>('.sections-hero__heading')],
      textInner: [...e.querySelectorAll<HTMLElement>('.sections-hero__headingInner')],
    };
  }

  private async init() {
    this.normalizeTilt(this.dom.start);
    this.normalizeTilt(this.dom.startMobile ?? undefined);

    if (window.innerWidth >= bp.lg && (window as any).hasWebGL && this.dom.start) {
      const exp = getWebGLExperience();
      if (exp) {
        this.webGLImage = exp.createImage(this.dom.start as HTMLVideoElement, { type: 'video' });
        this.webGLImage.ready.then(() => {
          this.webGLImage?.resize();
          this.syncWebGLImageToStart();
        });
      }
    } else {
      this.dom.start?.classList.remove('lg:invisible');
    }

    this.initVideoPlayerListeners();
    this.initEntrance();
    bus.emit('hero-ready');
    await ((window as any).pageSettled ?? Promise.resolve());
    this.skipEntranceIfScrolled();
    this.initImageAndText();
    this.initPlayerTimeline();
    ScrollTrigger.addEventListener('refreshInit', this.onRefreshInit);
    const refresh = () => this.refreshTakeover();
    document.fonts?.ready?.then(refresh);
    document
      .querySelectorAll<HTMLVideoElement>('video')
      .forEach((v) => v.addEventListener('canplay', refresh, { once: true, signal: this.ac.signal }));
    ScrollTrigger.refresh();
    this.syncWebGLImageToStart();
    let rt: number;
    window.addEventListener(
      'resize',
      () => {
        clearTimeout(rt);
        rt = window.setTimeout(() => this.resize(), 200);
      },
      { signal: this.ac.signal }
    );
    if (!this.entrance) this.finishEntrance();
  }

  private initVideoPlayerListeners() {
    const player = this.dom.player;
    if (!player) return;
    player.addEventListener('videoplay', () => this.hideWebGLVideo(), { signal: this.ac.signal });
    player.addEventListener('hide', () => this.showWebGLVideo(), { signal: this.ac.signal });
  }

  private initPlayerTimeline() {
    const player = this.dom.player;
    if (!player) return;
    const vpTrigger = ScrollTrigger.getById('video-player');
    this.playerScrollTrigger = ScrollTrigger.create({
      trigger: player,
      start: (vpTrigger?.vars?.start as string) || 'bottom bottom+=20%',
      onLeaveBack: () => {
        player.dispatchEvent(new CustomEvent('hide'));
        this.showWebGLVideo();
      },
    });
  }

  private hideWebGLVideo() {
    if (window.innerWidth >= bp.lg) {
      if (!(window as any).hasWebGL && this.dom.start) {
        gsap.to(this.dom.start, { opacity: 0 });
      } else if (this.webGLImage?.material?.uniforms?.uOpacity) {
        gsap.to(this.webGLImage.material.uniforms.uOpacity, { value: 0 });
      }
    }
    if (this.dom.startMobile) gsap.to(this.dom.startMobile, { opacity: 0 });
  }

  private showWebGLVideo() {
    if (window.innerWidth >= bp.lg) {
      if (!(window as any).hasWebGL && this.dom.start) {
        gsap.to(this.dom.start, { opacity: 1 });
      } else if (this.webGLImage?.material?.uniforms?.uOpacity) {
        gsap.to(this.webGLImage.material.uniforms.uOpacity, { value: 1 });
      }
    }
    if (this.dom.startMobile) gsap.to(this.dom.startMobile, { opacity: 1 });
  }

  private syncWebGLImageToStart() {
    if (!this.webGLImage || !this.dom?.start || window.innerWidth < bp.lg) return;
    const g = (this.dom.start as any)._gsap;
    if (!g) return;
    const pinProgress = this.pin?.progress || 0;
    const pinShift = this.pin ? (this.pin.end - this.pin.start) * pinProgress : 0;
    this.webGLImage.updatePosition({
      x: parseFloat(g.x) || 0,
      y: (parseFloat(g.y) || 0) + pinShift,
      scaleX: g.scaleX ?? 1,
      scaleY: g.scaleY ?? 1,
      rotation: parseFloat(g.rotation) || 0,
      opacity: Number(gsap.getProperty(this.dom.start, 'opacity') ?? 1),
    });
  }

  /** Called by the loader or transition overlay at the end of its timeline. */
  playEntrance() {
    if (this.entranceFinished) return;
    if (this.entrance) this.entrance.play(0);
    else this.playQueued = true;
  }

  private setOrigin(el: HTMLElement) {
    const r = el.getBoundingClientRect();
    gsap.set(el, { transformOrigin: `${window.innerWidth / 2 - r.left}px ${window.innerHeight / 2 - r.top}px` });
  }

  private initEntrance() {
    const { text, start } = this.dom;
    this.mm.add(MQ, (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions as unknown as Conds;
      if (reduceMotion || text.length < 2) return;
      const tl = (this.entrance = gsap.timeline({
        paused: !this.playQueued,
        onComplete: () => this.finishEntrance(),
        onUpdate: () => {
          if (!isDesktop || !this.webGLImage || !start) return;
          const g = (start as any)._gsap;
          if (!g) return;
          const opacity = Number(gsap.getProperty(start, 'opacity') ?? 1);
          this.webGLImage.updatePosition({
            x: parseFloat(g.x) || 0,
            y: parseFloat(g.y) || 0,
            scaleX: g.scaleX ?? 1,
            scaleY: g.scaleY ?? 1,
            rotation: parseFloat(g.rotation) || 0,
            opacity,
          });
        },
      }));
      this.setOrigin(text[0]);
      this.setOrigin(text[1]);
      const s1 = SplitText.create(text[0], { type: 'lines,chars', linesClass: 'line w-max', charsClass: 'char' });
      const s2 = SplitText.create(text[1], { type: 'lines,chars', linesClass: 'line w-max' });
      if (isDesktop) {
        s2.chars.forEach((c) => {
          const t = (c as HTMLElement).innerText;
          if (t === 'W') gsap.set(c, { marginRight: -70, marginLeft: -90 });
          if (t === 'Y') gsap.set(c, { marginRight: -20, marginLeft: -80 });
        });
      }
      gsap.set(text, { transformOrigin: '50% 50%' });
      const y = (i: number) => (i % 2 === 0 ? '-100%' : '100%');
      tl.from(text[0], { scale: 0.1, duration: 1, ease: 'smooth' })
        .from(s1.chars, { y, duration: 0.7, ease: 'slowDown', stagger: { each: 0.03, from: 'random' } }, '<')
        .from(text[1], { scale: 0.1, duration: 1, ease: 'smooth' }, '<')
        .from(s2.chars, { y, duration: 0.7, ease: 'slowDown', stagger: { each: 0.03, from: 'random' } }, '<');
      if (start) {
        tl.from(start, { x: 600, y: 150, duration: 1.5, ease: 'elastic.out(1, 1)' }, '>-0.5')
          .from(start, { opacity: 0, duration: 1 }, '<+0.1')
          .call(() => bus.emit('playTimeline-hero-smileyText'), undefined, isDesktop ? '<' : '>-0.5');
      }
      if (this.playQueued) tl.play();
    });
  }

  private finishEntrance() {
    if (this.entranceFinished) return;
    this.entranceFinished = true;
    this.syncWebGLImageToStart();
    bus.emit('hero-entrance-complete');
    getLenis()?.start();
    this.initTextParallax();
  }

  private skipEntranceIfScrolled() {
    if (!this.entrance) return;
    const evaluate = () => {
      if (!this.entrance || this.entranceFinished) return;
      const bottom = this.dom.top.getBoundingClientRect().bottom;
      if ((window.scrollY || 0) > 0 && bottom < window.innerHeight * 1.1) {
        this.entrance.progress(1, false);
        this.entrance.pause();
        this.syncWebGLImageToStart();
        this.finishEntrance();
      }
    };
    evaluate();
    requestAnimationFrame(evaluate);
    ScrollTrigger.addEventListener('refresh', evaluate);
  }

  private initTextParallax() {
    this.mm.add(MQ, (ctx) => {
      const { isMobile, reduceMotion } = ctx.conditions as unknown as Conds;
      const [a, b] = this.dom.textInner;
      if (isMobile || reduceMotion || !a || !b) return;
      const qa = gsap.quickTo(a, 'x', { duration: 1, ease: 'power2.out' });
      const qb = gsap.quickTo(b, 'x', { duration: 1, ease: 'power2.out' });
      const ma = gsap.utils.mapRange(0, window.innerWidth, 6, -14);
      const mb = gsap.utils.mapRange(0, window.innerWidth, -6, 14);
      this.el.addEventListener(
        'mousemove',
        (e) => {
          qa(ma(e.clientX));
          qb(mb(e.clientX));
        },
        { signal: this.ac.signal }
      );
    });
  }

  private handleImageTimelineUpdate(
    isDesktop: boolean,
    startRadius: { tl: number; tr: number; bl: number; br: number },
    endRadiusVal: number,
    progress: number
  ) {
    if (!isDesktop || !this.webGLImage || !this.dom.start) return;
    const g = (this.dom.start as any)._gsap;
    if (!g) return;
    const borderRadius = {
      topLeft: startRadius.tl + (endRadiusVal - startRadius.tl) * progress,
      topRight: startRadius.tr + (endRadiusVal - startRadius.tr) * progress,
      bottomLeft: startRadius.bl + (endRadiusVal - startRadius.bl) * progress,
      bottomRight: startRadius.br + (endRadiusVal - startRadius.br) * progress,
    };
    const pinProgress = this.pin?.progress || 0;
    const pinShift = this.pin ? (this.pin.end - this.pin.start) * pinProgress : 0;
    this.webGLImage.updatePosition({
      x: parseFloat(g.x) || 0,
      y: (parseFloat(g.y) || 0) + pinShift,
      scaleX: g.scaleX ?? 1,
      scaleY: g.scaleY ?? 1,
      rotation: parseFloat(g.rotation) || 0,
      borderRadius,
    });
  }

  /** Scroll-scrubbed move of the preview from the hero to the "end" slot; headings slide apart. */
  private initImageAndText() {
    const d = this.dom;
    this.mm.add(MQ, (ctx) => {
      const { isDesktop, isMobile, reduceMotion } = ctx.conditions as unknown as Conds;
      const a = isDesktop ? d.start : d.startMobile;
      if (!a || !d.end || !d.text.length) return;
      const s = boxOf(a);
      const c = boxOf(d.end);
      this.normalizeTilt(a);
      this.normalizeTilt(d.startMobile ?? undefined);
      const cs = getComputedStyle(a);
      const sx = c.width / s.width;
      const sy = c.height / s.height;
      const tl = (this.scrollTl = gsap.timeline({
        paused: reduceMotion,
        defaults: { ease: 'linear', duration: 0.5 },
        scrollTrigger: reduceMotion
          ? undefined
          : {
              trigger: isDesktop ? d.end : d.top,
              start: 'clamp(top 110%)',
              end: isDesktop ? 'clamp(top 20%)' : 'bottom 30%',
              scrub: 0.5,
              id: 'hero',
              onUpdate: (st) => {
                const thresh = isMobile ? 0.75 : 0.33;
                if (st.progress > thresh && this.direction !== st.direction) this.direction = st.direction;
              },
            },
      }));
      const r = {
        tl: px(cs.borderTopLeftRadius),
        tr: px(cs.borderTopRightRadius),
        bl: px(cs.borderBottomLeftRadius),
        br: px(cs.borderBottomRightRadius),
      };
      tl.fromTo(
        a,
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotate: this.tilt,
          borderTopLeftRadius: r.tl,
          borderTopRightRadius: r.tr,
          borderBottomLeftRadius: r.bl,
          borderBottomRightRadius: r.br,
          immediateRender: false,
        },
        {
          x: c.x - s.x + (c.width - s.width) / 2,
          y: c.y - s.y + (c.height - s.height) / 2,
          scaleX: sx,
          scaleY: sy,
          rotate: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          onComplete: () => this.handleImageTimelineUpdate(isDesktop, r, 0, 1),
          onUpdate: () => {
            if (this.scrollTl) {
              this.handleImageTimelineUpdate(isDesktop, r, 0, this.scrollTl.progress());
            }
          },
        }
      );
      this.pinBaseY = c.y - s.y + (c.height - s.height) / 2;
      if (isMobile && d.startMobileInner) tl.to(d.startMobileInner, { scaleX: sy, scaleY: sx }, 0);
      if (d.text[0] && d.text[1]) {
        const k = reduceMotion ? 0 : isDesktop ? 0.75 : 0.5;
        tl.to(d.text[0], { x: () => (reduceMotion ? 0 : -d.text[0].offsetWidth * k) }, 0);
        tl.to(d.text[1], { x: () => (reduceMotion ? 0 : d.text[1].offsetWidth * k) }, 0);
      }
      if (reduceMotion) tl.progress(1);
      this.initServicesPin(isDesktop);
    });
  }

  private initServicesPin(isDesktop: boolean) {
    const p = this.dom.player;
    if (!p) return;
    const trig = isDesktop ? this.el.querySelector<HTMLElement>('.pin-trigger') : this.dom.end;
    if (!trig) return;
    const applyPin = (st: ScrollTrigger) => {
      const s = (st.end - st.start) * st.progress;
      gsap.set(p, { y: s });
      const el = isDesktop ? this.dom.start : this.dom.startMobile;
      if (!el) return;
      const baseY = this.pinBaseY ?? 0;
      if (isDesktop && (window as any).hasWebGL && this.webGLImage && this.dom.start) {
        const g = (this.dom.start as any)._gsap;
        if (g) {
          this.webGLImage.updatePosition({
            x: parseFloat(g.x) || 0,
            y: parseFloat(g.y) + s,
            scaleX: g.scaleX ?? 1,
            scaleY: g.scaleY ?? 1,
            rotation: parseFloat(g.rotation) || 0,
          });
        }
      } else {
        gsap.set(el, { y: baseY + s });
      }
    };
    this.pin = ScrollTrigger.create({
      trigger: trig,
      start: isDesktop ? 'top bottom' : 'top top',
      end: isDesktop ? 'bottom bottom' : 'bottom top',
      scrub: true,
      onUpdate: applyPin,
      onRefresh: applyPin,
    });
  }

  private resize() {
    this.scrollTl?.kill();
    this.pin?.kill();
    this.pinBaseY = undefined;
    const { start, startMobile, startMobileInner, player, text } = this.dom;
    gsap.set([start, startMobile].filter(Boolean), { clearProps: 'x,y,scaleX,scaleY,rotate,borderRadius' });
    if (startMobileInner) gsap.set(startMobileInner, { clearProps: 'scaleX,scaleY' });
    if (player) gsap.set(player, { clearProps: 'y' });
    text.forEach((t) => gsap.set(t, { clearProps: 'x' }));
    this.initImageAndText();
    this.webGLImage?.resize();
    ScrollTrigger.refresh();
  }

  private refreshTimeout?: number;
  private refreshTakeover() {
    window.clearTimeout(this.refreshTimeout);
    this.refreshTimeout = window.setTimeout(() => this.resize(), 200);
  }

  destroy() {
    ScrollTrigger.removeEventListener('refreshInit', this.onRefreshInit);
    this.ac.abort();
    this.mm.revert();
    this.scrollTl?.kill();
    this.pin?.kill();
    this.playerScrollTrigger?.kill();
    this.entrance?.kill();
    this.webGLImage?.destroy();
  }
}
