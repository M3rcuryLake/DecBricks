import { defineConfig } from 'astro/config';

export default defineConfig({
  // Decbricks production origin; overridable via PUBLIC_SITE_URL (open-items A1).
  site: process.env.PUBLIC_SITE_URL || 'https://decbricks.com',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  // BUG-012: the WebGL experience (three.js + site impl) is one
  // dynamically-imported vendor chunk (~557 kB min / ~140 kB gzip); splitting
  // it further would only add requests. 600 kB documents that choice.
  vite: {
    build: {
      chunkSizeWarningLimit: 600,
    },
  },
  // c7: always 'directory' URLs (`/about`), canonicals must match this policy.
  trailingSlash: 'never',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  devToolbar: { enabled: false },
});
