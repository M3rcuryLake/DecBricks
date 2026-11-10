/**
 * experience.ts — thin facade over the three.js WebGL experience (§7 perf).
 *
 * The heavy implementation lives in `impl.ts` (imports `three`) and is loaded
 * with a dynamic `import()` from `initWebGL()`, so three.js is not in the
 * render-blocking main bundle. Consumers (hero, services-page, case-studies)
 * only talk to the facade; the template already null-guards
 * `getWebGLExperience()` and falls back to non-WebGL behaviour until ready.
 */
import { bp } from '../core/gsap';
import type { WebGLExperienceAPI } from './impl';

export type { WebGLImage, WebGLImageOptions, WebGLTrail, WebGLTrailOptions, WebGLExperienceAPI } from './impl';

let experienceInstance: WebGLExperienceAPI | null | undefined = undefined;

export function getWebGLExperience(): WebGLExperienceAPI | null {
  return experienceInstance ?? null;
}

export function initWebGL() {
  if (window.innerWidth < bp.lg) return;
  if (experienceInstance !== undefined) return experienceInstance;
  // Kick the chunk load in parallel with the loader intro (non-blocking).
  import('./impl')
    .then(({ createExperience }) => {
      experienceInstance = createExperience();
      // A page swap may have happened while the chunk loaded — sync targets.
      experienceInstance?.rebuildPageTargets();
    })
    .catch((err) => {
      console.warn('Decbricks: WebGL chunk failed to load (page keeps CSS fallbacks):', err);
    });
}
