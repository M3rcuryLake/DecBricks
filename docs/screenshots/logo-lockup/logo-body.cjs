const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'], executablePath: '/usr/bin/google-chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800, deviceScaleFactor: 2 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 100)));

  // About paragraph with brand mention on light surface
  await page.goto('http://127.0.0.1:4321/about', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const el = page.locator('.font-brand').filter({ hasText: 'Decbricks' }).nth(2);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: '/tmp/opencode/logo-verify/about-paragraph.png' });

  // Contact smiley (SplitText over .font-brand span)
  await page.goto('http://127.0.0.1:4321/contact', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const smiley = page.locator('.parts-smileyText');
  await smiley.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000);
  // count pseudo-element logo instances in the smiley
  const cnt = await page.evaluate(() => {
    const inner = document.querySelector('.parts-smileyText [role="presentation"]');
    const brands = inner ? inner.querySelectorAll('.font-brand').length : 0;
    const withBefore = [...(inner ? inner.querySelectorAll('.font-brand') : [])].filter(el => getComputedStyle(el, '::before').content !== 'none').length;
    return { brands, withBefore, text: inner?.textContent?.trim().slice(0, 60) };
  });
  console.log('smiley:', JSON.stringify(cnt));
  await page.screenshot({ path: '/tmp/opencode/logo-verify/contact-smiley.png' });

  // Footer lockup (darkPurple text on light surface)
  await page.goto('http://127.0.0.1:4321/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.evaluate(() => { document.querySelector('footer')?.scrollIntoView(); window.scrollBy(0, -100); });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: '/tmp/opencode/logo-verify/footer.png' });

  console.log('errors:', JSON.stringify(errors.slice(0, 5)));
  await browser.close();
})();
