const { chromium } = require('/home/ankit/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const fs = require('fs');
const SHOTS = '/home/ankit/GitHub/decbricks/docs/qa/shots/';
const out = {};
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'], executablePath: '/usr/bin/google-chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errs = []; const reqs = [];
  page.on('pageerror', e => errs.push('pageerror '+String(e).slice(0,140)));
  page.on('console', m => { if (m.type()==='error'||m.type()==='warning') errs.push(m.type()+': '+m.text().slice(0,160)); });
  page.on('request', r => reqs.push(r.url().replace('http://localhost:4321','')));
  await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const toBottom = async () => { await page.evaluate(async () => { const max = document.documentElement.scrollHeight; for (let y=0;y<=max;y+=700){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,50)); } window.scrollTo(0, 1e6); }); await page.waitForTimeout(1500); };
  const snap = async (tag) => page.evaluate((tag) => {
    const cs = [...document.querySelectorAll('canvas.webgl')];
    const f = document.querySelectorAll('.structure-footer');
    const fr = f[0] && f[0].getBoundingClientRect();
    return { tag, path: location.pathname, canvases: cs.map(c => ({ connected: c.isConnected, cw: c.clientWidth, ch: c.clientHeight, w: c.width, h: c.height })), footers: f.length, footerH: fr && Math.round(fr.height), scrollMax: document.documentElement.scrollHeight - innerHeight, triggers: window.ScrollTrigger ? window.ScrollTrigger.getAll().length : 'n/a', hasWebGL: window.hasWebGL };
  }, tag);
  // A: JS cost while scrolling through the footer
  await toBottom();
  out.initial = await snap('initial bottom');
  await page.screenshot({ path: SHOTS+'footer-p0-home-1280-settled.png' });
  // B: swap gauntlet
  const seq = ['/services','/about','/contact','/','/services','/about'];
  out.swaps = [];
  for (const href of seq) {
    await page.evaluate((href) => { window.scrollTo(0,0); const a = [...document.querySelectorAll(`a[href="${href}"]`)].find(x => !x.closest('.structure-footer')); a && a.click(); }, href);
    await page.waitForTimeout(3500);
    await toBottom();
    out.swaps.push(await snap('after '+href));
  }
  await page.mouse.move(200, 650); await page.mouse.move(700, 700, {steps: 25}); await page.mouse.move(1000, 600, {steps: 25});
  await page.waitForTimeout(300);
  await page.screenshot({ path: SHOTS+'footer-p0-after-swaps-trail-1280.png' });
  // C: tab order inside footer
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); const f = document.querySelector('.structure-footer button, .structure-footer a'); f && f.focus(); });
  out.focus = [];
  for (let i=0;i<5;i++) {
    out.focus.push(await page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); const inF = !!e.closest('.structure-footer'); return { inFooter: inF, tag: e.tagName, label: (e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,30), outline: cs.outlineStyle+' '+cs.outlineWidth+' '+cs.outlineColor, boxShadow: cs.boxShadow.slice(0,50) }; }));
    await page.keyboard.press('Tab');
  }
  // D: hover on scrollTop
  const hv = await page.evaluate(() => { const b = document.querySelector('.parts-btnScrollTop'); const r = b.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2, w: r.width, h: r.height }; });
  out.scrollTopRect = hv;
  // E: footer scroll cost
  const cdp = await ctx.newCDPSession(page); await cdp.send('Performance.enable');
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1200);
  const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  await page.evaluate(() => { window.__lt = []; new PerformanceObserver(l => l.getEntries().forEach(e => window.__lt.push(Math.round(e.duration)))).observe({ entryTypes: ['longtask'] }); });
  await page.evaluate(async () => { const max = document.documentElement.scrollHeight; const t0 = performance.now(); for (let y=max-2200; y<=max; y+=40){ window.scrollTo(0,y); await new Promise(r=>requestAnimationFrame(r)); } });
  await page.waitForTimeout(800);
  const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  out.cost = { scriptMs: Math.round((m1.ScriptDuration-m0.ScriptDuration)*1000), taskMs: Math.round((m1.TaskDuration-m0.TaskDuration)*1000), layoutMs: Math.round((m1.LayoutDuration-m0.LayoutDuration)*1000), longtasks: await page.evaluate(() => window.__lt) };
  out.errs = [...new Set(errs)];
  out.footerReqs = [...new Set(reqs.filter(u => /footer|webgl|three|logo-cream|fk-raster|departure/i.test(u)))];
  fs.writeFileSync('/home/ankit/GitHub/decbricks/docs/qa/footer-gauntlet-baseline.json', JSON.stringify(out, null, 1));
  await browser.close(); console.log('ok');
})().catch(e => { console.error(e); process.exit(1); });
