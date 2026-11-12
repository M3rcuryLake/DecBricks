const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: '/usr/bin/google-chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  for (const route of ['/about', '/services']) {
    await page.goto('http://127.0.0.1:4321' + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5500);
    const res = await page.evaluate(() => {
      return [...document.querySelectorAll('.font-brand')].map(el => {
        const img = getComputedStyle(el, '::before').backgroundImage;
        const cls = img.includes('logo-cream') ? 'CREAM' : img.includes('logo.webp') ? 'colour' : 'none';
        // walk up: record each ancestor's tag+first meaningful class + bg colour
        let anc = el, chain = [];
        while (anc && anc !== document.body && chain.length < 8) {
          const c = getComputedStyle(anc).backgroundColor;
          const name = anc.tagName.toLowerCase() + '.' + (anc.className && anc.className.baseVal === undefined ? String(anc.className).split(/\s+/).filter(x => /sections-|structure-|parts-|page-|layout/.test(x))[0] || anc.tagName.toLowerCase() : '?');
          chain.push(name + (c && c !== 'rgba(0, 0, 0, 0)' ? ` [bg ${c}]` : ''));
          anc = anc.parentElement;
        }
        return `${cls} :: ${chain.join(' > ')}`;
      });
    });
    console.log(route, JSON.stringify(res, null, 1));
  }
  await browser.close();
})();
