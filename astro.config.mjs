import { defineConfig } from 'astro/config';

export default defineConfig({
  // Decbricks production origin; overridable via PUBLIC_SITE_URL (open-items A1).
  site: process.env.PUBLIC_SITE_URL || 'https://decbricks.com',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  // c7: always 'directory' URLs (`/about`), canonicals must match this policy.
  trailingSlash: 'never',
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  devToolbar: { enabled: false },
});
