const { chromium } = require('/home/ankit/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,args:['--no-sandbox','--allow-file-access-from-files'],executablePath:'/usr/bin/google-chrome'});
for(const c of ['a','b','c'])for(const [w,h,n] of [[375,812,'375'],[1440,900,'1440']]){
 const p=await b.newPage({viewport:{width:w,height:h}});await p.goto('http://127.0.0.1:8099/docs/plans/proto/footer-'+c+'/index.html');await p.waitForTimeout(500);
 await p.evaluate(()=>window.scrollTo(0,1e6));await p.waitForTimeout(500);await p.mouse.move(w*0.6,h*0.5);await p.waitForTimeout(2200);
 await p.locator('footer').screenshot({path:`/home/ankit/GitHub/decbricks/docs/qa/shots/footer-proto-${c}-${n}.png`});await p.close()}
await b.close();console.log('shots ok')})().catch(e=>{console.error(e);process.exit(1)});
