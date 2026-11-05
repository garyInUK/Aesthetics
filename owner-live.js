/* Owner editor: staged client. Requires verified server-side auth, CSRF and write routes.
   Never stores PIN or owner credentials in localStorage or source code. */
(() => {
'use strict';
const API='https://api.prioryhouse.com/api.php';
const $=id=>document.getElementById(id);
let csrf='',prices=[],reviews=[],signedIn=false;
function status(message,isError=false){const el=$('owner-live-message');el.textContent=message;el.classList.toggle('is-error',isError);}
function text(tag,value,cls){const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=value;return el;}
function googleUrl(value){
  try{const u=new URL(value);const h=u.hostname.toLowerCase();
    if(u.protocol==='https:' && (h==='google.com'||h.endsWith('.google.com')||h==='google.co.uk'||h.endsWith('.google.co.uk')||h==='maps.app.goo.gl'||h==='g.page'))return u.href;
  }catch(_){}return '';
}
async function request(resource,method='GET',payload=null,params=''){
  const headers={Accept:'application/json'};
  if(payload!==null)headers['Content-Type']='application/json';
  if(method!=='GET'&&csrf)headers['X-CSRF-Token']=csrf;
  const response=await fetch(API+'?resource='+encodeURIComponent(resource)+params,{
    method,credentials:'include',mode:'cors',cache:'no-store',headers,
    ...(payload!==null?{body:JSON.stringify(payload)}:{})
  });
  let data;try{data=await response.json();}catch(_){throw Error('The server returned an invalid response.');}
  if(!response.ok)throw Error(data?.error||'Server returned HTTP '+response.status);
  if(data&&typeof data==='object')csrf=data.csrf_token||data.csrf||csrf;
  return data;
}
function sessionOn(){signedIn=true;$('owner-live-login').hidden=true;$('owner-live-controls').hidden=false;status('Connected to the owner database.');}
function sessionOff(message='Enter your owner PIN.'){signedIn=false;csrf='';$('owner-live-controls').hidden=true;$('owner-live-login').hidden=false;status(message);}
function renderPrices(){
  const mount=$('owner-live-price-list');mount.replaceChildren();
  if(!prices.length)mount.append(text('p','No treatments in the database.','tiny-note'));
  for(const item of prices){
    const row=text('div','','owner-entry');
    const label=text('span',item.name+' — £'+Number(item.price).toFixed(2));
    const edit=text('button','EDIT');edit.type='button';edit.addEventListener('click',()=>{
      $('owner-live-price-id').value=item.id;
      $('owner-live-category').value=item.category;
      $('owner-live-name').value=item.name;
      $('owner-live-description').value=item.description;
      $('owner-live-price').value=item.price;
      $('owner-live-price-form').scrollIntoView({behavior:'smooth',block:'center'});
    });
    const remove=text('button','REMOVE');remove.type='button';remove.addEventListener('click',async()=>{
      if(!confirm('Remove this treatment from the website?'))return;
      try{await request('treatments','DELETE',null,'&id='+encodeURIComponent(item.id));await refresh();status('Treatment removed.');}
      catch(err){status('Could not remove treatment: '+err.message,true);}
    });
    row.append(label,edit,remove);mount.append(row);
  }
}
function renderReviews(){
  const mount=$('owner-live-review-list');mount.replaceChildren();
  if(!reviews.length)mount.append(text('p','No reviews have been added.','tiny-note'));
  for(const item of reviews){
    const row=text('div','','owner-entry');
    const label=text('span',item.reviewer+' · '+item.stars+'★'+(Number(item.published)?' · Published':' · Draft'));
    const edit=text('button','EDIT');edit.type='button';edit.addEventListener('click',()=>{
      $('owner-live-review-id').value=item.id;
      $('owner-live-reviewer').value=item.reviewer;
      $('owner-live-stars').value=item.stars;
      $('owner-live-review-text').value=item.review_text;
      $('owner-live-review-url').value=item.source_url;
      $('owner-live-published').checked=!!Number(item.published);
      $('owner-live-review-form').scrollIntoView({behavior:'smooth',block:'center'});
    });
    const remove=text('button','REMOVE');remove.type='button';remove.addEventListener('click',async()=>{
      if(!confirm('Permanently remove this review from the website?'))return;
      try{await request('reviews','DELETE',null,'&id='+encodeURIComponent(item.id));await refresh();status('Review removed.');}
      catch(err){status('Could not remove review: '+err.message,true);}
    });
    row.append(label,edit,remove);mount.append(row);
  }
}
async function refresh(){
  if(!signedIn)return;
  const [p,r]=await Promise.all([request('treatments'),request('reviews','GET',null,'&include_unpublished=1')]);
  if(!Array.isArray(p)||!Array.isArray(r))throw Error('Unexpected list response from the API.');
  prices=p;reviews=r;renderPrices();renderReviews();
}
$('owner-live-pin-form').addEventListener('submit',async e=>{
  e.preventDefault();const pin=$('owner-live-pin').value;
  if(!/^\d{6}$/.test(pin)){status('Enter exactly six digits.',true);return;}
  status('Signing in…');
  try{
    const data=await request('login','POST',{pin});
    if(!data||data.authenticated===false||data.ok===false)throw Error('Login was not accepted.');
    $('owner-live-pin').value='';sessionOn();await refresh();
  }catch(err){sessionOff('Login failed: '+err.message);}
});
$('owner-live-price-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const id=$('owner-live-price-id').value;
  const payload={category:$('owner-live-category').value.trim(),name:$('owner-live-name').value.trim(),
    description:$('owner-live-description').value.trim(),price:Number($('owner-live-price').value)};
  if(!payload.category||!payload.name||!payload.description||!Number.isFinite(payload.price)||payload.price<0){status('Complete the treatment fields.',true);return;}
  try{await request('treatments',id?'PUT':'POST',payload,id?'&id='+encodeURIComponent(id):'');
    e.target.reset();$('owner-live-price-id').value='';await refresh();status('Treatment saved to database.');
  }catch(err){status('Could not save treatment: '+err.message,true);}
});
$('owner-live-review-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const id=$('owner-live-review-id').value;
  const source_url=googleUrl($('owner-live-review-url').value);
  if(!source_url){status('Provide an HTTPS link to the original Google review.',true);return;}
  const payload={reviewer:$('owner-live-reviewer').value.trim(),stars:Number($('owner-live-stars').value),
    review_text:$('owner-live-review-text').value.trim(),source_url,
    published:$('owner-live-published').checked?1:0};
  if(!payload.reviewer||!payload.review_text){status('Name and review text are required.',true);return;}
  try{await request('reviews',id?'PUT':'POST',payload,id?'&id='+encodeURIComponent(id):'');
    e.target.reset();$('owner-live-review-id').value='';await refresh();status('Review saved to database.');
  }catch(err){status('Could not save review: '+err.message,true);}
});
$('owner-live-price-form').addEventListener('reset',()=>{$('owner-live-price-id').value='';});
$('owner-live-review-form').addEventListener('reset',()=>{$('owner-live-review-id').value='';});
$('owner-live-refresh').addEventListener('click',()=>refresh().then(()=>status('Data refreshed.')).catch(e=>status(e.message,true)));
$('owner-live-logout').addEventListener('click',async()=>{
  try{await request('logout','POST',{});}catch(e){status('Logout server error: '+e.message,true);return;}
  sessionOff('Signed out.');
});
(async()=>{
  try{const s=await request('session');if(s&&s.authenticated){sessionOn();await refresh();}
    else sessionOff();
  }catch(err){sessionOff('Owner session could not be verified: '+err.message);}
})();
})();