const { chromium } = require('/home/ankit/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const fs = require('fs');
const OUT = '/home/ankit/GitHub/decbricks/docs/plans/audit/footer-audit.json';
const SHOTS = '/home/ankit/GitHub/decbricks/docs/qa/shots/';
const routes = ['/', '/services', '/about', '/contact', '/404'];
const widths = [320, 375, 768, 1024, 1280, 1920, 2560];
const lum = (c) => { const f = v => { v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4)}; return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]); };
const ratio = (a,b)=>{const x=lum(a),y=lum(b);return +(((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05))).toFixed(2)};
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader'], executablePath: '/usr/bin/google-chrome' });
  const results = [];
  for (const w of widths) {
    const h = w < 768 ? 800 : w >= 1920 ? 1080 : 800;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 768 });
    const page = await ctx.newPage();
    const errs = [], reqs = [];
    page.on('pageerror', e => errs.push(String(e).slice(0,120)));
    page.on('console', m => { if (m.type()==='error'||m.type()==='warning') errs.push(m.type()+': '+m.text().slice(0,120)); });
    page.on('requestfinished', r => { const u=r.url(); if (/footer|brand|logo/i.test(u)) reqs.push(u.replace('http://localhost:4321','')); });
    for (const route of routes) {
      await page.goto('http://localhost:4321'+route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4500);
      // scroll in steps
      await page.evaluate(async () => { const max = document.documentElement.scrollHeight; for (let y=0;y<=max;y+=600){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,60)); } window.scrollTo(0, document.documentElement.scrollHeight); });
      await page.waitForTimeout(1200);
      const data = await page.evaluate(() => {
        const footer = document.querySelector('.structure-footer');
        if (!footer) return { noFooter: true };
        const fr = footer.getBoundingClientRect();
        const bgEl = footer.querySelector('.webgl-background');
        const bgc = bgEl ? getComputedStyle(bgEl).backgroundColor : null;
        const parse = s => (s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
        const texts = [];
        const walker = document.createTreeWalker(footer, NodeFilter.SHOW_TEXT);
        let n; while ((n = walker.nextNode())) {
          const t = n.textContent.trim(); if (!t) continue;
          const el = n.parentElement; const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
          if (r.width===0) continue;
          texts.push({ t: t.slice(0,40), color: cs.color, fs: cs.fontSize, fw: cs.fontWeight, fam: cs.fontFamily.split(',')[0], op: cs.opacity, hidden: !!el.closest('[aria-hidden=true]') });
        }
        const inter = [...footer.querySelectorAll('a,button,[tabindex]')].map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName, label: (el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,30), href: el.getAttribute('href'), w: Math.round(r.width), h: Math.round(r.height) }; });
        const canv = [...document.querySelectorAll('canvas.webgl')].map(c => { const r=c.getBoundingClientRect(); const cs=getComputedStyle(c); return { w: c.width, h: c.height, cw: Math.round(r.width), ch: Math.round(r.height), display: cs.display, inFooterParent: !!c.closest('.page'), z: cs.zIndex }; });
        const mq = footer.querySelector('.structure-footer__marquee');
        const mqr = mq ? mq.getBoundingClientRect() : null;
        const inner = footer.querySelector('.structure-footer__inner');
        const ir = inner ? inner.getBoundingClientRect() : null;
        return { footerH: Math.round(fr.height), footerTop: Math.round(fr.top), vh: innerHeight, docOverflowX: document.documentElement.scrollWidth - innerWidth, bgc, texts, inter, canv, mqW: mqr && Math.round(mqr.width), innerH: ir && Math.round(ir.height), innerTop: ir && Math.round(ir.top), fontBrandCount: footer.querySelectorAll('.font-brand').length };
      });
      if (!data.noFooter) {
        const bg = parse = (s)=> (s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
        const bgv = bg(data.bgc);
        data.contrast = data.texts.filter(x=>!x.hidden || true).map(x => ({ t: x.t, fs: x.fs, fam: x.fam, hidden: x.hidden, ratio: ratio(bg(x.color), bgv) }));
        data.tapFails = data.inter.filter(i => i.w < 44 || i.h < 44);
      }
      results.push({ w, route, errs: errs.splice(0), ...data });
      if ((w===375||w===1280||w===1920) && route==='/') await page.screenshot({ path: SHOTS+`footer-base-${route==='/'?'home':route.slice(1)}-${w}.png` });
      if ((w===375||w===1280) && route!=='/') await page.screenshot({ path: SHOTS+`footer-base-${route.slice(1)}-${w}.png` });
    }
    results.push({ w, reqs: [...new Set(reqs)] });
    await ctx.close();
  }
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  await browser.close();
  console.log('done', results.length);
})().catch(e => { console.error(e); process.exit(1); });
