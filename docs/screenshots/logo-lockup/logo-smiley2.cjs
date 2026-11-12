const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: '/usr/bin/google-chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800, deviceScaleFactor: 2 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 100)));
  page.on('console', m => { if (m.type() === 'error') errors.push('[c] ' + m.text().slice(0, 80)); });
  await page.goto('http://127.0.0.1:4321/contact', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const smiley = page.locator('.parts-smileyText');
  await smiley.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(3500);
  const cnt = await page.evaluate(() => {
    const inner = document.querySelector('.parts-smileyText [role="presentation"]');
    const brands = inner ? [...inner.querySelectorAll('.font-brand')] : [];
    return {
      brands: brands.length,
      oneBefore: brands.filter(el => getComputedStyle(el, '::before').backgroundImage.includes('logo.webp')).length,
      text: inner?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 70),
    };
  });
  console.log(JSON.stringify(cnt), 'errors:', JSON.stringify(errors.slice(0, 5)));
  await page.screenshot({ path: '/tmp/opencode/logo-verify/contact-smiley.png' });
  await browser.close();
})();
