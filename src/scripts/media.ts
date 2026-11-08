import { bp } from './core/gsap';

/**
 * The original renders the preview <source> client-side, only for the video whose
 * variant matches the viewport (desktop vs mobile). Same behaviour here.
 */
export function initPreviewVideos() {
  let io: IntersectionObserver | null = null;
  const sync = () => {
    const desktop = window.innerWidth >= bp.lg;
    document.querySelectorAll<HTMLVideoElement>('video[data-preview-mp4]').forEach((v) => {
      const isMobileVariant = v.classList.contains('sections-hero__videoPreviewMobile');
      const active = isMobileVariant ? !desktop : desktop;
      const has = v.querySelector('source');
      if (active && !has) {
        if (!io) {
          io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              const video = entry.target as HTMLVideoElement;
              if (entry.isIntersecting) {
                if (!video.querySelector('source')) {
                  const s = document.createElement('source');
                  s.src = video.dataset.previewMp4!;
                  s.type = 'video/mp4';
                  video.appendChild(s);
                  video.load();
                }
                video.play().catch(() => {});
              } else {
                video.pause();
              }
            });
          }, { rootMargin: '100px' });
        }
        io.observe(v);
      } else if (!active && has) {
        has.remove();
        v.load();
        io?.unobserve(v);
      }
    });
  };
  sync();
  let t: number;
  const onResize = () => {
    clearTimeout(t);
    t = window.setTimeout(sync, 200);
  };
  window.addEventListener('resize', onResize);

  return () => {
    io?.disconnect();
    window.removeEventListener('resize', onResize);
    window.clearTimeout(t);
  };
}
