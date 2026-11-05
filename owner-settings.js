(()=>{'use strict';const $=id=>document.getElementById(id);
$('owner-site-settings-form')?.addEventListener('submit',async event=>{
event.preventDefault();
const number=$('settings-whatsapp').value.replace(/\D/g,'');
const feedback=$('owner-live-message');
if(number&&(number.length<8||number.length>15)){feedback.textContent='Use 8–15 international digits.';return;}
const payload={whatsapp_number:number,hero_title:$('settings-hero-title').value.trim(),hero_intro:$('settings-hero-intro').value.trim(),about_intro:$('settings-about-intro').value.trim()};
try{
const session=await fetch('https://api.prioryhouse.com/api.php?resource=session',{mode:'cors',credentials:'include'});
const auth=await session.json();if(!auth.authenticated||!auth.csrf)throw Error('Owner login required');
const res=await fetch('https://api.prioryhouse.com/settings.php',{method:'PUT',mode:'cors',credentials:'include',headers:{'Content-Type':'application/json','X-CSRF-Token':auth.csrf},body:JSON.stringify(payload)});
if(!res.ok)throw Error('Settings endpoint unavailable (HTTP '+res.status+')');
feedback.textContent='Website settings saved.';
}catch(err){feedback.textContent='NOT saved: '+err.message+' — PHP settings endpoint still required.';}
});
})();