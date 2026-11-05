const dialog=document.querySelector('#consultation');document.querySelectorAll('.open-dialog').forEach(button=>button.addEventListener('click',()=>dialog.showModal()));document.getElementById('close').addEventListener('click',()=>dialog.close());document.getElementById('dismiss').addEventListener('click',()=>dialog.close());document.getElementById('menu').addEventListener('click',()=>{const nav=document.getElementById('nav');const open=nav.classList.toggle('show');document.getElementById('menu').setAttribute('aria-expanded',String(open))});document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>document.getElementById('nav').classList.remove('show')));

// Review manager is a browser-only demo. No actual authentication or publishing server exists.
(()=>{const qs=id=>document.getElementById(id);const base=window.StudioDemo.sampleReviews;const key='nss-demo-reviews-v2';let entries;try{entries=JSON.parse(localStorage.getItem(key));if(!Array.isArray(entries))entries=base}catch(e){entries=base}const save=()=>{try{localStorage.setItem(key,JSON.stringify(entries))}catch(e){}};const safeUrl=u=>{try{const x=new URL(u);return ['https:','http:'].includes(x.protocol)?x.href:''}catch(e){return ''}};function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n}function render(){let list=qs('review-list');list.replaceChildren();if(!entries.length)list.append(el('div','review-empty','Selected customer reviews will appear here.'));entries.forEach(r=>{let c=el('article','review-card');c.append(el('div','review-stars','★'.repeat(r.stars)+'☆'.repeat(5-r.stars)));c.append(el('p','review-quote','“'+r.text+'”'));c.append(el('div','review-who',r.name));let origin=el('div','review-label',r.demo?'ILLUSTRATIVE EXAMPLE — NOT A REAL REVIEW':'Customer-submitted entry · independently verify source');c.append(origin);let href=safeUrl(r.url||'');if(href){let a=el('a','review-label','VIEW ORIGINAL ↗');a.href=href;a.target='_blank';a.rel='noopener noreferrer';c.append(a)}list.append(c)});let ad=qs('admin-entry-list');ad.replaceChildren();entries.forEach(r=>{let row=el('div','admin-entry'),t=el('span','',r.name+' — '+r.text.slice(0,55)),b=el('button','','Remove');b.type='button';b.addEventListener('click',()=>{entries=entries.filter(x=>x.id!==r.id);save();render()});row.append(t,b);ad.append(row)})}render();qs('google-review-btn').addEventListener('click',()=>qs('review-demo-dialog').showModal());qs('whatsapp-btn').addEventListener('click',()=>qs('wa-demo-dialog').showModal());qs('open-admin').addEventListener('click',()=>qs('admin-dialog').showModal());document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>qs(b.dataset.closeDialog).close()));qs('pin-form').addEventListener('submit',e=>{e.preventDefault();if(qs('pin').value==='628419'){qs('pin-panel').hidden=true;qs('review-editor').hidden=false;qs('pin-error').textContent=''}else qs('pin-error').textContent='Incorrect demo PIN'});qs('add-review-form').addEventListener('submit',e=>{e.preventDefault();const name=qs('r-name').value.trim(),msg=qs('r-text').value.trim();if(!name||!msg)return;entries.unshift({id:'added-'+Date.now(),name,stars:Number(qs('r-stars').value),text:msg,url:safeUrl(qs('r-url').value),demo:false});save();render();e.target.reset();qs('admin-dialog').close();qs('reviews').scrollIntoView({behavior:'smooth'})});qs('reset-reviews').addEventListener('click',()=>{entries=base;save();render()})})();


/* Reveal editorial sections only on devices that allow motion. */
(function(){
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var elements=document.querySelectorAll('.about, .section-heading, .treatment-card, .reviews-section, .closing, .section-kicker');
  if(!elements.length)return;
  elements.forEach(function(el){el.classList.add('reveal-on-scroll')});
  document.documentElement.classList.add('motion-ready');
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
    });
  },{threshold:0.08,rootMargin:'0px 0px -35px 0px'});
  elements.forEach(function(el){observer.observe(el)});
})();


/* Gentle photo parallax. Passive scroll, one animation frame, reduced-motion safe. */
(function(){
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop=window.matchMedia('(min-width: 751px)');
  const panels=[...document.querySelectorAll('.card-photo, .feature-image')];
  if(!panels.length)return;
  let scheduled=false;
  function update(){
    scheduled=false;
    if(motion.matches||!desktop.matches){
      panels.forEach(p=>p.style.removeProperty('--parallax-offset'));
      return;
    }
    const viewport=window.innerHeight;
    panels.forEach(p=>{
      const rect=p.getBoundingClientRect();
      if(rect.bottom<0||rect.top>viewport)return;
      const progress=(viewport/2-(rect.top+rect.height/2))/(viewport+rect.height);
      const pixels=Math.max(-28,Math.min(28,progress*80));
      p.style.setProperty('--parallax-offset',pixels.toFixed(1)+'px');
    });
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  motion.addEventListener('change',schedule);
  desktop.addEventListener('change',schedule);
  schedule();
})();
