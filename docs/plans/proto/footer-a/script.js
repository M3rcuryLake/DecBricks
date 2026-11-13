const f=document.querySelector('.f');
f.addEventListener('pointermove',e=>{const r=f.getBoundingClientRect();f.querySelector('.f__glow').style.setProperty('--mx',(e.clientX-r.left)+'px');f.querySelector('.f__glow').style.setProperty('--my',(e.clientY-r.top)+'px')});
const wall=document.getElementById('wall');
new IntersectionObserver(([e],o)=>{if(e.isIntersecting){wall.classList.add('built');o.disconnect()}},{threshold:.2}).observe(wall);
const t=document.getElementById('t');const tick=()=>{t.textContent=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'}).format(new Date())};tick();setInterval(tick,30000);
