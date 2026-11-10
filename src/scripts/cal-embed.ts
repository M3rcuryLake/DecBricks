/**
 * cal-embed.ts — Cal.com inline embed lifecycle (map 5A).
 *
 * - Lazy: IntersectionObserver (rootMargin 400px) — nothing loads until the
 *   block nears the viewport, so it never hurts LCP/INP on other pages.
 * - Privacy: Cal.com embeds set third-party cookies, so `embed.js` is only
 *   loaded after the CookieBanner has stored consent (see cookies.ts, which
 *   emits 'cookies-decided'). Without consent we show the fallback card.
 * - Official vanilla loader (queue + `Cal(...)` namespacing); embed.js is
 *   injected exactly once per page load even across client-side swaps.
 *   `Cal('inline')` is re-run only when a NEW mount element appears (new page
 *   visit); WeakSet guard prevents double init on the same node.
 * - Failure paths: script error / on('linkFailed') / sanity timeout (10 s)
 *   all swap in the server-rendered fallback card (Cal deep link, email,
 *   phones) with a `role="status"` announcement, never a blank box.
 * - `bookingSuccessful` → confirmation announcement, focus moved to it.
 *
 * initCalEmbed() returns a teardown; registered in main.ts boot + onAfterSwap.
 */
import { bus } from './core/gsap';
import { CAL, EMAIL, PHONES } from '../data/contact';

const CONSENT_COOKIE = 'essential-consent';
const SCRIPT_TIMEOUT_MS = 10_000;

interface CalQueueObject {
  (...args: unknown[]): void;
  loaded?: boolean;
  ns?: Record<string, unknown>;
  q?: unknown[];
  scriptFailed?: boolean;
}

declare global {
  interface Window {
    Cal?: CalQueueObject;
  }
}

const hasConsent = () => document.cookie.split('; ').some((c) => c.startsWith(CONSENT_COOKIE + '='));
const hasFallbackContent = () => !!CAL.bookingUrl || !!EMAIL || PHONES.length > 0;

/** Official inline-embed loader shape: a queue consumed by embed.js. Loads once. */
function ensureCal(origin: string): CalQueueObject {
  if (window.Cal) return window.Cal;
  const cal = ((...args: unknown[]) => {
    (cal.q = cal.q ?? []).push(args);
  }) as CalQueueObject;
  cal.loaded = false;
  cal.ns = {};
  cal.scriptFailed = false;
  window.Cal = cal;
  const script = document.createElement('script');
  script.src = `${origin}/embed/embed.js`;
  script.async = true;
  script.onload = () => {
    cal.loaded = true;
  };
  script.onerror = () => {
    cal.scriptFailed = true;
  };
  document.head.appendChild(script);
  return cal;
}

/** Mounts initialised this page-load; new nodes (post-swap) are re-initialised. */
const initedMounts = new WeakSet<HTMLElement>();

export function initCalEmbed() {
  const root = document.querySelector<HTMLElement>('.cal-embed-widget');
  if (!root) return;

  const mount = root.querySelector<HTMLElement>('.cal-embed');
  const fallback = root.querySelector<HTMLElement>('.cal-fallback');
  const status = root.querySelector<HTMLElement>('.cal-status');

  // No Cal link configured: fallback card is already visible server-side.
  // (DEV warning lives in CalEmbed.astro.) Also skip in prod if there is
  // literally nothing to fall back to — then show nothing at all.
  if (!mount || (!CAL.link && !hasFallbackContent())) return;

  const say = (message: string) => {
    if (status) {
      status.textContent = message;
      status.focus({ preventScroll: true });
    }
  };

  const showFallback = (announce?: string) => {
    if (mount) {
      mount.style.display = 'none';
      mount.setAttribute('aria-hidden', 'true');
    }
    if (fallback) {
      fallback.classList.remove('is-hidden');
      // Voice the reason, then park focus on the first usable contact link.
      if (announce) say(announce);
      fallback.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
    }
  };

  const revealEmbed = () => {
    mount!.style.display = '';
    mount!.setAttribute('aria-busy', 'false');
    mount!.setAttribute('aria-hidden', 'false');
    fallback?.classList.add('is-hidden');
  };

  let sanity: ReturnType<typeof setTimeout> | undefined;

  const initInline = (): boolean => {
    if (initedMounts.has(mount)) return false;
    initedMounts.add(mount);
    const cal = ensureCal(CAL.origin);
    try {
      cal('inline', {
        elementOrSelector: mount,
        calLink: CAL.link,
        layout: 'month_view',
      });
      cal('ui', {
        theme: 'light',
        cssVarsPerTheme: { light: { 'cal-brand': '#800020' } },
        hideEventTypeDetails: false,
      });
      cal('on', {
        action: 'bookingSuccessful',
        callback: () => say('Your meeting is booked — a confirmation is on its way. Talk soon!'),
      });
      cal('on', {
        action: 'linkFailed',
        callback: () =>
          showFallback(
            'The booking calendar link did not open. Use the contact options above, or send the form below.'
          ),
      });
    } catch {
      showFallback('The booking calendar could not load. Use the contact options above, or send the form below.');
      return true; // gave up; do not retry within this page life
    }
    // Sanity check: if embed.js never materialises (script error, blocked
    // network), swap to the fallback instead of showing a perpetual skeleton.
    sanity = setTimeout(() => {
      const calReady = window.Cal?.loaded && !window.Cal?.scriptFailed;
      if (calReady && mount.querySelector('iframe')) {
        revealEmbed();
      } else {
        showFallback('The booking calendar is taking longer than usual. Use the contact options above, or send the form below.');
      }
    }, SCRIPT_TIMEOUT_MS);
    return false;
  };

  let loadStarted = false;
  let observed = false;

  /** Begin the (consented) load: queue the inline embed, reveal the skeleton. */
  const start = () => {
    if (initInline()) return; // init failed; fallback already shown
    revealEmbed();
  };

  const onCookiesDecided = () => {
    if (hasConsent() && !loadStarted) {
      loadStarted = true;
      // If the user reaches consent right after the section appeared, swap
      // the fallback card back for the (loading) embed.
      if (observed) start();
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      observed = true;
      if (loadStarted) {
        start();
      } else {
        // Waiting for cookie consent: keep the fallback card visible.
        showFallback();
      }
    },
    { rootMargin: '400px 0px' }
  );

  observer.observe(mount);

  bus.on('cookies-decided', onCookiesDecided);

  return () => {
    observer.disconnect();
    if (sanity) clearTimeout(sanity);
    bus.off('cookies-decided', onCookiesDecided);
  };
}
