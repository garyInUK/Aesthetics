/* Public website settings: read-only; no credentials stored in static site. */
(()=>{'use strict';
const API='https://api.prioryhouse.com/api.php?resource=settings';
let number='';
function contact(event){
  event.preventDefault();
  const note='Hello, I would like to enquire about a consultation at Norwich Skin Studio.';
  if(number) window.open('https://wa.me/'+number+'?text='+encodeURIComponent(note),'_blank','noopener,noreferrer');
  else document.getElementById('wa-demo-dialog')?.showModal();
}
document.querySelectorAll('.contact-whatsapp').forEach(link=>link.addEventListener('click',contact));
fetch(API,{mode:'cors',credentials:'omit',cache:'no-store'})
  .then(response=>{if(!response.ok)throw Error('Settings API not installed');return response.json()})
  .then(settings=>{
    if(!settings||typeof settings!=='object'||Array.isArray(settings))return;
    const digits=String(settings.whatsapp_number||'').replace(/\D/g,'');
    if(digits.length>=8&&digits.length<=15)number=digits;
    document.querySelectorAll('[data-site-text]').forEach(node=>{
      const key=node.getAttribute('data-site-text');
      if(typeof settings[key]==='string'&&settings[key].trim()) node.textContent=settings[key].trim();
    });
  }).catch(()=>{/* Until settings API exists, keep demo copy and demo WhatsApp modal. */});
})();