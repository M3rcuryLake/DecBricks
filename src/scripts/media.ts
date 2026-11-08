import { bp } from './core/gsap';

/**
 * The original renders the preview <source> client-side, only for the video whose
 * variant matches the viewport (desktop vs mobile). Same behaviour here.
 */
export function initPreviewVideos() {
  const sync = () => {
    const desktop = window.innerWidth >= bp.lg;
    document.querySelectorAll<HTMLVideoElement>('video[data-preview-mp4]').forEach((v) => {
      const isMobileVariant = v.classList.contains('sections-hero__videoPreviewMobile');
      const active = isMobileVariant ? !desktop : desktop;
      const has = v.querySelector('source');
      if (active && !has) {
        const s = document.createElement('source');
        s.src = v.dataset.previewMp4!;
        s.type = 'video/mp4';
        v.appendChild(s);
        v.load();
        v.play().catch(() => {});
      } else if (!active && has) {
        has.remove();
        v.load();
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
    window.removeEventListener('resize', onResize);
    window.clearTimeout(t);
  };
}
