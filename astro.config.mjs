import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://1minus1.com',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  devToolbar: { enabled: false },
});
