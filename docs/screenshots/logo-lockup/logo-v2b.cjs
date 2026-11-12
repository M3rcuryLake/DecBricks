const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: '/usr/bin/google-chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800, deviceScaleFactor: 2 } });
  // /about: every .font-brand, its computed bg + nearest bg ancestor
  await page.goto('http://127.0.0.1:4321/about', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5500);
  const about = await page.evaluate(() => {
    return [...document.querySelectorAll('.font-brand')].map(el => {
      const img = getComputedStyle(el, '::before').backgroundImage;
      let anc = el.parentElement, bg = 'none';
      while (anc && anc !== document.body) {
        const c = getComputedStyle(anc).backgroundColor;
        if (c && c !== 'rgba(0, 0, 0, 0)') { bg = c; break; }
        anc = anc.parentElement;
      }
      return (img.includes('logo-cream') ? 'CREAM' : img.includes('logo.webp') ? 'colour' : 'none') + ' | bg ' + bg;
    });
  });
  console.log('ABOUT:', JSON.stringify(about, null, 1));
  // /services: every .font-brand + section context
  await page.goto('http://127.0.0.1:4321/services', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5500);
  const services = await page.evaluate(() => {
    return [...document.querySelectorAll('.font-brand')].map(el => {
      const img = getComputedStyle(el, '::before').backgroundImage;
      const sec = el.closest('[class*="sections-"], .structure-menu');
      return (img.includes('logo-cream') ? 'CREAM' : img.includes('logo.webp') ? 'colour' : 'none')
        + ' | in ' + (sec ? sec.className.split(' ').filter(c => c.startsWith('sections-') || c === 'structure-menu')[0] : '?')
        + ' | sr: ' + !!el.closest('.sr-only');
    });
  });
  console.log('SERVICES:', JSON.stringify(services, null, 1));
  await page.screenshot({ path: '/tmp/opencode/logo-v2/services-hero.png', clip: { x: 0, y: 0, width: 1280, height: 700 } });
  await browser.close();
})();
