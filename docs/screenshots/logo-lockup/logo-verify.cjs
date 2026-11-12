/* Logo lockup verification: 5 routes x widths, pseudo-element checks, wrap/CLS, screenshots */
const { chromium } = require('playwright');
const fs = require('fs');
const ROUTES = ['/', '/services', '/about', '/contact', '/404'];
const WIDTHS = [[375, 812], [768, 900], [1280, 800], [1920, 1080]];
fs.mkdirSync('/tmp/opencode/logo-verify', { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: '/usr/bin/google-chrome' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(`[console] ${m.text().slice(0, 100)}`); });
  page.on('pageerror', e => errors.push(`[pageerror] ${String(e).slice(0, 100)}`));
  const out = {};

  for (const route of ROUTES) {
    out[route] = {};
    for (const [w, h] of WIDTHS) {
      await page.setViewportSize({ width: w, height: h, deviceScaleFactor: w === 1280 ? 2 : 1 });
      await page.goto('http://127.0.0.1:4321' + route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5500);
      const data = await page.evaluate(() => {
        const els = [...document.querySelectorAll('.font-brand')];
        const res = { count: els.length, locks: [] };
        for (const el of els.slice(0, 4)) {
          const cs = getComputedStyle(el, '::before');
          const r = el.getBoundingClientRect();
          const fs = parseFloat(getComputedStyle(el).fontSize);
          res.locks.push({
            text: (el.textContent || '').trim().slice(0, 30),
            bg: cs.backgroundImage.includes('logo.webp') ? 'logo.webp' : cs.backgroundImage.slice(0, 40),
            w: Math.round(r.width), h: Math.round(r.height), fs: Math.round(fs),
            wrapped: r.height > fs * 1.6,
            overflowR: r.right > innerWidth,
          });
        }
        // CLS proxy: ::before box is fixed (1.15em/1.1em) — layout independent of image load
        const header = document.querySelector('.structure-menu .font-brand');
        res.headerLockup = header ? { h: Math.round(header.getBoundingClientRect().height) } : null;
        return res;
      });
      out[route][w] = data;
      if (w === 1920 || (route === '/' && w === 375)) {
        await page.screenshot({ path: `/tmp/opencode/logo-verify/${route.replace(/\//g, '_') || '_'}-${w}.png` });
      }
      if (w === 1280) { // 2x DPR crispness check on the header logo
        await page.screenshot({ path: `/tmp/opencode/logo-verify/dpr2-${route.replace(/\//g, '_') || '_'}-header.png`, clip: { x: 0, y: 0, width: 400, height: 120 } });
      }
    }
  }
  out.errors = errors.slice(0, 8);
  console.log(JSON.stringify(out));
  await browser.close();
  process.exit(0);
})().catch(e => { console.error('FAILED', e); process.exit(1); });
