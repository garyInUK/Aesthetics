(()=>{'use strict';const $=id=>document.getElementById(id);let pending=[];
function google(s){try{const u=new URL(s),h=u.hostname.toLowerCase();return u.protocol==='https:'&&(h==='google.com'||h.endsWith('.google.com')||h==='google.co.uk'||h.endsWith('.google.co.uk')||h==='g.page'||h==='maps.app.goo.gl');}catch(e){return false;}}
function parse(s){const out=[];let row=[],field='',quoted=false;
for(let i=0;i<s.length;i++){const c=s[i];if(c==='"'){if(quoted&&s[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}
else if(c===','&&!quoted){row.push(field);field='';}
else if((c==='\r'||c==='\n')&&!quoted){if(c==='\r'&&s[i+1]==='\n')i++;row.push(field);field='';if(row.some(x=>x.trim()))out.push(row);row=[];}
else field+=c;}if(quoted)throw Error('Unclosed quote');row.push(field);if(row.some(x=>x.trim()))out.push(row);return out;}
$('owner-review-csv')?.addEventListener('change',async e=>{
pending=[];$('owner-import-csv').disabled=true;const file=e.target.files?.[0];if(!file)return;
try{if(file.size>1024*1024)throw Error('Maximum CSV size is 1 MB');
const rows=parse((await file.text()).replace(/^\uFEFF/,''));const h=rows.shift().map(x=>x.trim().toLowerCase());
const cols=['reviewer','stars','review_text','source_url'];if(cols.some(x=>!h.includes(x)))throw Error('Columns required: '+cols.join(', '));
const invalid=[],seen=new Set();for(const [n,row] of rows.entries()){
const item=Object.fromEntries(cols.map(k=>[k,(row[h.indexOf(k)]||'').trim()]));item.stars=Number(item.stars);
if(!item.reviewer||item.reviewer.length>100||!item.review_text||!Number.isInteger(item.stars)||item.stars<1||item.stars>5||!google(item.source_url)){invalid.push(n+2);continue;}
if(seen.has(item.source_url)){invalid.push(n+2);continue;}seen.add(item.source_url);pending.push(item);}
$('owner-csv-preview').textContent=pending.length+' valid reviews. '+(invalid.length?'Invalid or repeated rows: '+invalid.slice(0,15).join(', '):'Ready for owner approval.')+'. These must be genuine published Google reviews.';
$('owner-import-csv').disabled=!pending.length;
}catch(err){$('owner-csv-preview').textContent='Cannot import: '+err.message;}
});
$('owner-import-csv')?.addEventListener('click',async()=>{
if(!pending.length||!confirm('Publish '+pending.length+' real Google reviews to the website?'))return;
$('owner-import-csv').disabled=true;let imported=0;let error='';
try{const response=await fetch('https://api.prioryhouse.com/api.php?resource=session',{credentials:'include',mode:'cors'});const session=await response.json();if(!session.authenticated||!session.csrf)throw Error('Sign in first');
for(const review of pending){const res=await fetch('https://api.prioryhouse.com/api.php?resource=reviews',{method:'POST',credentials:'include',mode:'cors',headers:{'Content-Type':'application/json','X-CSRF-Token':session.csrf},body:JSON.stringify(review)});if(!res.ok){error='HTTP '+res.status;break;}imported++;}
}catch(err){error=err.message;}
$('owner-csv-preview').textContent=imported+' imported. '+(error?'Stopped: '+error:'Import complete.')+' Reload the owner page to review entries.';
pending=[];$('owner-review-csv').value='';
});
})();