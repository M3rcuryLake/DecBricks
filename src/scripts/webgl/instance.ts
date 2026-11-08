import type { WebGLExperienceAPI } from './experience';

export function getWebGLExperience(): WebGLExperienceAPI | null {
  return typeof window !== 'undefined' ? ((window as any).__webglExp ?? null) : null;
}
