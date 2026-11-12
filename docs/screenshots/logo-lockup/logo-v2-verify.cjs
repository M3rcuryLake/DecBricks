const { chromium } = require('playwright');
const fs = require('fs');
fs.mkdirSync('/tmp/opencode/logo-v2', { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: '/usr/bin/google-chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800, deviceScaleFactor: 2 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 100)));
  page.on('console', m => { if (m.type() === 'error') errors.push('[c] ' + m.text().slice(0, 80)); });
  const out = {};

  // header (cream expected) + all routes
  for (const route of ['/', '/services', '/about', '/contact']) {
    await page.goto('http://127.0.0.1:4321' + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    const hdr = await page.evaluate(() => {
      const el = document.querySelector('.structure-menu .font-brand');
      if (!el) return null;
      const cs = getComputedStyle(el, '::before');
      const r = el.getBoundingClientRect();
      return { img: cs.backgroundImage.includes('logo-cream') ? 'CREAM' : cs.backgroundImage.includes('logo.webp') ? 'colour' : cs.backgroundImage.slice(0, 50),
               wrapped: r.height > parseFloat(getComputedStyle(el).fontSize) * 1.6,
               overflow: r.right > innerWidth };
    });
    out[route] = { header: hdr };
    if (route === '/') await page.screenshot({ path: '/tmp/opencode/logo-v2/home-header.png', clip: { x: 0, y: 0, width: 400, height: 130 } });
    if (route === '/services') {
      // ServicesHero smiley lockup (cream expected on burgundy)
      const sh = await page.evaluate(() => {
        const el = document.querySelector('.sections-servicesHero .font-brand');
        if (!el) return 'no-font-brand-in-servicesHero';
        const cs = getComputedStyle(el, '::before');
        return cs.backgroundImage.includes('logo-cream') ? 'CREAM' : cs.backgroundImage.includes('logo.webp') ? 'colour' : 'none';
      });
      out[route].servicesHero = sh;
      await page.screenshot({ path: '/tmp/opencode/logo-v2/services-hero.png', clip: { x: 0, y: 0, width: 1280, height: 700 } });
    }
    if (route === '/about') {
      // About white-card paragraph (colour expected)
      const el = page.locator('.font-brand').filter({ hasText: 'Decbricks' }).nth(2);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(2500);
      const ab = await page.evaluate(() => {
        const els = [...document.querySelectorAll('.font-brand')];
        const hits = els.filter(el => {
          const cs = getComputedStyle(el, '::before');
          const img = cs.backgroundImage;
          const bgEl = el.closest('.bg-white');
          return { img: img.includes('logo-cream') ? 'CREAM' : img.includes('logo.webp') ? 'colour' : 'none', onWhite: !!bgEl };
        }).map(x => `${x.img}@${x.onWhite ? 'whiteCard' : 'other'}`);
        return hits;
      });
      out[route].aboutCards = ab;
      await page.screenshot({ path: '/tmp/opencode/logo-v2/about-card.png' });
    }
    if (route === '/contact') {
      const smiley = page.locator('.parts-smileyText');
      await smiley.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(3000);
      const sm = await page.evaluate(() => {
        const inner = document.querySelector('.parts-smileyText [role="presentation"]');
        const brands = inner ? [...inner.querySelectorAll('.font-brand')] : [];
        return { brands: brands.length,
                 img: brands.map(el => { const cs = getComputedStyle(el, '::before');
                   return cs.backgroundImage.includes('logo-cream') ? 'CREAM' : cs.backgroundImage.includes('logo.webp') ? 'colour' : 'none'; }) };
      });
      out[route].smiley = sm;
      await page.screenshot({ path: '/tmp/opencode/logo-v2/contact-smiley.png' });
    }
  }

  // footer (colour expected on light surface)
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.evaluate(() => { document.querySelector('footer')?.scrollIntoView(); window.scrollBy(0, -100); });
  await page.waitForTimeout(2500);
  const ft = await page.evaluate(() => {
    const el = document.querySelector('footer .font-brand');
    const cs = getComputedStyle(el, '::before');
    return cs.backgroundImage.includes('logo-cream') ? 'CREAM' : cs.backgroundImage.includes('logo.webp') ? 'colour' : 'none';
  });
  out.footer = ft;
  await page.screenshot({ path: '/tmp/opencode/logo-v2/footer.png' });

  console.log(JSON.stringify(out, null, 1));
  console.log('errors:', JSON.stringify(errors.slice(0, 6)));
  await browser.close();
})();
