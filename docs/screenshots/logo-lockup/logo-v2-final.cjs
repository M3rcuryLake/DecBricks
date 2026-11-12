const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: '/usr/bin/google-chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800, deviceScaleFactor: 2 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 80)));
  const bad = [];
  for (const route of ['/', '/services', '/about', '/contact', '/404']) {
    await page.goto('http://127.0.0.1:4321' + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5500);
    // scroll through the page so lazy sections + smiley rebuilds settle
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.9) {
        window.scrollTo(0, y); await new Promise(r => setTimeout(r, 250));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1500);
    const rows = await page.evaluate(() => {
      return [...document.querySelectorAll('.font-brand')].map(el => {
        const cs = getComputedStyle(el, '::before');
        const img = cs.backgroundImage.includes('logo-cream') ? 'CREAM' : cs.backgroundImage.includes('logo.webp') ? 'colour' : 'NONE';
        const fs = parseFloat(getComputedStyle(el).fontSize);
        const r = el.getBoundingClientRect();
        const inSect = el.closest('.structure-menu, .sections-servicesHero, .sections-contactForm, .structure-footer');
        return { img, sect: inSect ? inSect.className.split(/\s+/).filter(c => /^(structure|sections)-/.test(c))[0] : 'light-content', wrapped: r.height > fs * 1.6, overflowR: r.right > innerWidth };
      });
    });
    for (const r of rows) {
      if (r.img === 'colour' && r.sect !== 'light-content') bad.push(`${route}: colour in ${r.sect}`);
      if (r.img === 'CREAM' && r.sect === 'light-content') bad.push(`${route}: cream in light content`);
      if (r.wrapped || r.overflowR) bad.push(`${route}: wrap/overflow in ${r.sect}`);
      if (r.img === 'NONE') bad.push(`${route}: no logo in ${r.sect}`);
    }
    console.log(route, rows.map(r => `${r.img}@${r.sect}`).join(' , '));
  }
  console.log(bad.length ? 'VIOLATIONS:\n' + bad.join('\n') : 'ALL CONTEXTS CORRECT');
  console.log('errors:', JSON.stringify(errors.slice(0, 5)));
  await browser.close();
})();
