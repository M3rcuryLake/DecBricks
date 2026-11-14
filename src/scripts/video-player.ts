import { gsap, bp, ScrollTrigger } from './core/gsap';
import { getLenis } from './smooth-scroll';

const SHOWREEL_MP4 = '/videos/3a265a95e25bd70a0242eb3a163a177b.mp4';

function formatTimestamp(sec: number): string {
  if (!isFinite(sec) || sec < 0) return '00.00';
  const mins = Math.floor(sec / 60);
  const rem = Math.floor(sec % 60);
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export function initVideoPlayer() {
  const player = document.querySelector<HTMLElement>('.parts-webglVideoPlayer');
  if (!player) return;

  const video = player.querySelector<HTMLVideoElement>('video.webgl-video');
  const playBtn = player.querySelector<HTMLButtonElement>('.play-button');
  const controls = player.querySelector<HTMLElement>('.parts-videoPlayerControls');
  const overlay = player.querySelector<HTMLElement>('.overlay');
  const clickOverlay = player.querySelector<HTMLElement>('.z-5');
  const pauseBtn = controls?.querySelector<HTMLButtonElement>('.pause-button');
  const progressInner = controls?.querySelector<HTMLElement>('.parts-progressBar__inner');
  const progressInput = controls?.querySelector<HTMLInputElement>('.parts-progressBar input[type="range"]');
  const timestampEl = controls?.querySelector<HTMLElement>('.timestamp');
  const muteBtn = controls?.querySelector<HTMLButtonElement>('.mute-button');
  const volumeBars = controls?.querySelectorAll<HTMLElement>('.parts-volumeControl span');
  const volumeInput = controls?.querySelector<HTMLInputElement>('.parts-volumeControl input[type="range"]');

  const ac = new AbortController();
  let isPlaying = false;
  let isMuted = false;
  let currentTime = 0;
  let duration = 0;
  let volume = 1;
  let hasPlayed = false;
  let announceTimer: number | undefined;

  const updateProgressUI = () => {
    const dur = duration || video?.duration || 0;
    const t = video ? video.currentTime : currentTime;
    const pct = dur > 0 ? (t / dur) * 100 : 0;
    if (progressInner) progressInner.style.width = `${pct}%`;
    if (progressInput) progressInput.value = String(dur > 0 ? t / dur : 0);
    if (timestampEl) timestampEl.textContent = formatTimestamp(t);
  };

  video?.addEventListener(
    'timeupdate',
    () => {
      currentTime = video.currentTime;
      duration = video.duration || duration;
      updateProgressUI();
    },
    { signal: ac.signal }
  );

  // ── 1. Play button inner reveal (B6TU9kmS.js) ─────────────────────────────
  const mm = gsap.matchMedia();
  let playBtnTl: gsap.core.Timeline | null = null;
  mm.add(
    { isDesktop: `(min-width: ${bp.lg}px)`, reduceMotion: '(prefers-reduced-motion: reduce)' },
    (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions as {
        isDesktop: boolean;
        reduceMotion: boolean;
      };
      const inner = playBtn?.querySelector<HTMLElement>('.part-btnVideoPlayer__inner');
      const label = inner?.children[0] as HTMLElement | undefined;
      const t1 = playBtn?.querySelector<HTMLElement>('.parts-btnVideoPlayer__textOne');
      const t2 = playBtn?.querySelector<HTMLElement>('.parts-btnVideoPlayer__textTwo');
      if (!isDesktop || reduceMotion || !inner || !label || !t1 || !t2) return;
      playBtnTl = gsap.timeline({ paused: true });
      playBtnTl
        .from(label, { width: 0, marginRight: 0, duration: 0.7, ease: 'power2.inOut' })
        .from(t1, { yPercent: -100, duration: 0.5, ease: 'power2.inOut' }, '<+0.2')
        .from(t2, { yPercent: 100, duration: 0.5, ease: 'power2.inOut' }, '<');
      return () => {
        playBtnTl?.kill();
        playBtnTl = null;
      };
    }
  );

  const setShowButton = (val: boolean) => {
    if (!playBtn) return;
    // Spec (Cy6uk_lV.js render): root visibility is an instant class binding on showButton.
    playBtn.classList.toggle('opacity-0', !val);
    playBtn.classList.toggle('pointer-events-none', !val);
    playBtn.toggleAttribute('inert', !val);
    playBtn.setAttribute('tabindex', val ? '0' : '-1');
    // Spec (Cy6uk_lV.js watch showButton): play/reverse the inner reveal + decorations.
    if (revealTl) (val ? revealTl.play() : revealTl.reverse());
    if (playBtnTl) (val ? playBtnTl.play() : playBtnTl.reverse());
  };

  // ── 2. ScrollTrigger on the play-button (Cy6uk_lV.js) ─────────────────────
  let revealTl: gsap.core.Timeline | null = null;
  const decorations: HTMLElement[] = Array.from(player.querySelectorAll<HTMLElement>('.decorations'));

  mm.add(
    { isDesktop: `(min-width: ${bp.lg}px)`, reduceMotion: '(prefers-reduced-motion: reduce)' },
    (ctx) => {
      const { isDesktop, reduceMotion } = ctx.conditions as {
        isDesktop: boolean;
        reduceMotion: boolean;
      };
      if (reduceMotion || !isDesktop) return;
      revealTl = gsap.timeline({ paused: true });
      decorations.forEach((d) => {
        revealTl!.from(d.querySelectorAll('rect'), {
          opacity: 0,
          stagger: { each: 0.03, from: 'random' },
          duration: 0.2,
        }, '<');
      });
      if (playBtnTl) {
        revealTl.add(() => playBtnTl?.play(), '<');
      }
      return () => {
        revealTl?.kill();
        revealTl = null;
      };
    }
  );

  const setInView = (val: boolean) => {
    document.dispatchEvent(new CustomEvent('toggleheader', { detail: { show: val } }));
  };

  let headerST: ScrollTrigger | undefined;
  if (playBtn) {
    headerST = ScrollTrigger.create({
      trigger: playBtn,
      id: 'video-player',
      start: 'bottom 70%',
      onEnter: () => {
        setInView(!isPlaying);
        setShowButton(!isPlaying && !hasPlayed);
      },
      onEnterBack: () => {
        setInView(!isPlaying);
        setShowButton(!isPlaying && !hasPlayed);
      },
      onLeave: () => {
        setInView(true);
        setShowButton(false);
        if (isPlaying && video) video.pause();
      },
      onLeaveBack: () => {
        setInView(true);
        setShowButton(false);
        hasPlayed = false;
      },
      onRefresh: (st) => {
        if (st.isActive) {
          setInView(!isPlaying);
          setShowButton(!isPlaying && !hasPlayed);
        }
      },
    });
  }

  // ── 3. Show / hide helpers (Cy6uk_lV.js showControls / hideVideo / showPlayButton) ──
  const showControls = () => {
    if (!controls || !video) return;
    const tl = gsap.timeline();
    tl.to(controls, { autoAlpha: 1, pointerEvents: 'auto', duration: 0.3 }).to(
      overlay,
      { autoAlpha: 0, pointerEvents: 'none', duration: 0.3 },
      0
    );
    tl.to(video, { opacity: 1, duration: 0.3 }, 0);
  };

  const hideVideo = () => {
    if (!controls || !video) return;
    const tl = gsap.timeline();
    tl.to(controls, { autoAlpha: 0, pointerEvents: 'none', duration: 0.3 })
      .to([playBtn, ...decorations], { clearProps: true, duration: 0.3 }, 0)
      .to(overlay, { autoAlpha: 1, pointerEvents: 'auto', duration: 0.3 }, 0)
      .to(video, { opacity: 0, duration: 0.3 }, 0)
      .call(() => {
        video.pause();
      });
  };

  const showPlayButton = () => {
    if (!video) return;
    const tl = gsap.timeline();
    tl.to(controls, { autoAlpha: 0, pointerEvents: 'none', duration: 0.3 }).to(
      playBtn,
      { autoAlpha: 1, pointerEvents: 'auto', duration: 0.3 },
      0
    );
    tl.to(video, { opacity: 0, duration: 0.3 }, 0);
  };

  // ── 4. Player events ────────────────────────────────────────────────────────
  player.addEventListener(
    'videoplay',
    () => {
      const start = document.querySelector<HTMLElement>('.sections-hero .start');
      const startMobile = document.querySelector<HTMLElement>('.sections-hero .start-mobile');
      if (start) gsap.to(start, { opacity: 0, duration: 0.3 });
      if (startMobile) gsap.to(startMobile, { opacity: 0, duration: 0.3 });
    },
    { signal: ac.signal }
  );

  // ── 5. Interactions ────────────────────────────────────────────────────────
  const announceAction = (message: string) => {
    let t = document.getElementById('video-player-announcements');
    if (!t) {
      t = document.createElement('div');
      t.id = 'video-player-announcements';
      t.setAttribute('aria-live', 'polite');
      t.setAttribute('aria-atomic', 'true');
      t.className = 'sr-only';
      document.body.appendChild(t);
    }
    t.textContent = message;
    window.clearTimeout(announceTimer);
    announceTimer = window.setTimeout(() => {
      if (t && t.textContent === message) t.textContent = '';
    }, 1000);
  };

  const scrollToPlayer = () => {
    if (!player) return;
    getLenis()?.scrollTo(player, {
      offset: -(window.innerHeight - player.offsetHeight) / 2,
    });
  };

  const startPlayback = () => {
    if (!video) return;
    if (!video.getAttribute('data-loaded')) {
      video.src = SHOWREEL_MP4;
      video.load();
      video.setAttribute('data-loaded', '1');
    }
    showControls();
    video
      .play()
      .then(() => {
        isPlaying = true;
        hasPlayed = true;
        setShowButton(false);
        player.dispatchEvent(new CustomEvent('videoplay'));
        document.dispatchEvent(new CustomEvent('toggleheader', { detail: { show: false } }));
      })
      .catch(() => showPlayButton());
    scrollToPlayer();
  };

  const togglePlayPause = () => {
    if (!video) return;
    if (isPlaying) {
      video.pause();
      isPlaying = false;
      if (pauseBtn) pauseBtn.setAttribute('aria-pressed', 'true');
    } else {
      if (video.paused) startPlayback();
      else {
        video.play();
        isPlaying = true;
      }
    }
  };

  const toggleMute = () => {
    if (!video) return;
    if (isMuted) {
      video.volume = volume || 1;
      video.muted = false;
      isMuted = false;
    } else {
      volume = video.volume || volume || 1;
      video.muted = true;
      isMuted = true;
    }
    updateVolumeUI();
  };

  const updateVolumeUI = () => {
    const effective = isMuted ? 0 : video?.volume ?? volume;
    volumeBars?.forEach((bar, idx) => {
      const active = effective > idx * 0.25;
      bar.classList.toggle('bg-neonGreen', active);
      bar.classList.toggle('bg-white/30', !active);
    });
    if (volumeInput) volumeInput.value = String(effective);
    if (muteBtn) muteBtn.setAttribute('aria-pressed', String(isMuted));
  };

  const seekTo = (t: number) => {
    if (!video) return;
    video.currentTime = t;
    currentTime = t;
    updateProgressUI();
  };

  const setVolume = (v: number) => {
    if (!video) return;
    const clamped = Math.max(0, Math.min(1, v));
    video.volume = clamped;
    video.muted = clamped === 0;
    volume = clamped;
    isMuted = clamped === 0;
    updateVolumeUI();
  };

  // iOS fullscreen
  video?.addEventListener('play', () => {
    if ((video as any).webkitEnterFullscreen) {
      video.controls = false;
      (video as any).webkitEnterFullscreen();
    }
  });
  video?.addEventListener('webkitendfullscreen', () => {
    if (video) video.controls = false;
    if (isPlaying) video.pause();
  });

  const handleKeydown = (e: KeyboardEvent) => {
    if (!video) return;
    if (document.activeElement !== video && !isPlaying) return;
    const t = video ? video.currentTime : currentTime;
    const d = video ? video.duration : duration;
    const v = isMuted ? 0 : video ? video.volume : volume;
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlayPause();
        announceAction(isPlaying ? 'Paused' : 'Playing');
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        announceAction(isMuted ? 'Muted' : 'Unmuted');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        seekTo(Math.max(0, t - 10));
        announceAction(`Rewound to ${formatTimestamp(Math.max(0, t - 10))}`);
        break;
      case 'ArrowRight':
        e.preventDefault();
        seekTo(Math.min(d, t + 10));
        announceAction(`Fast-forwarded to ${formatTimestamp(Math.min(d, t + 10))}`);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setVolume(Math.min(1, v + 0.1));
        announceAction(`Volume ${Math.round(Math.min(1, v + 0.1) * 100)}%`);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setVolume(Math.max(0, v - 0.1));
        announceAction(`Volume ${Math.round(Math.max(0, v - 0.1) * 100)}%`);
        break;
      case 'j':
        e.preventDefault();
        seekTo(Math.max(0, t - 10));
        announceAction(`Rewound to ${formatTimestamp(Math.max(0, t - 10))}`);
        break;
      case 'l':
        e.preventDefault();
        seekTo(Math.min(d, t + 10));
        announceAction(`Fast-forwarded to ${formatTimestamp(Math.min(d, t + 10))}`);
        break;
      case '0':
      case 'Home':
        e.preventDefault();
        seekTo(0);
        announceAction('Returned to beginning');
        break;
      case 'End':
        e.preventDefault();
        seekTo(d);
        announceAction('Jumped to end');
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        e.preventDefault();
        {
          const u = parseInt(e.key) / 10;
          seekTo(d * u);
          announceAction(`Jumped to ${Math.round(u * 100)}%`);
        }
        break;
    }
  };
  video?.setAttribute('tabindex', '0');
  video?.addEventListener('keydown', handleKeydown, { signal: ac.signal });

  playBtn?.addEventListener('click', startPlayback, { signal: ac.signal });
  pauseBtn?.addEventListener('click', togglePlayPause, { signal: ac.signal });
  clickOverlay?.addEventListener(
    'click',
    () => {
      if (hasPlayed) togglePlayPause();
    },
    { signal: ac.signal }
  );

  progressInput?.addEventListener(
    'input',
    () => {
      if (!video || !video.duration) return;
      seekTo(parseFloat(progressInput.value) * video.duration);
    },
    { signal: ac.signal }
  );

  muteBtn?.addEventListener('click', toggleMute, { signal: ac.signal });
  volumeInput?.addEventListener(
    'input',
    () => {
      setVolume(parseFloat(volumeInput.value) || 0);
    },
    { signal: ac.signal }
  );

  video?.addEventListener(
    'ended',
    () => {
      isPlaying = false;
      setShowButton(true);
      showPlayButton();
    },
    { signal: ac.signal }
  );

  player.addEventListener(
    'hide',
    () => {
      hideVideo();
      const start = document.querySelector<HTMLElement>('.sections-hero .start');
      const startMobile = document.querySelector<HTMLElement>('.sections-hero .start-mobile');
      if (start) gsap.to(start, { opacity: 1, duration: 0.3 });
      if (startMobile) gsap.to(startMobile, { opacity: 1, duration: 0.3 });
    },
    { signal: ac.signal }
  );

  return () => {
    window.clearTimeout(announceTimer);
    ac.abort();
    headerST?.kill();
    revealTl?.kill();
    playBtnTl?.kill();
    mm.revert();
  };
}
