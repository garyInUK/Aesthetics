(()=>{'use strict';const $=id=>document.getElementById(id);
const data=Array.from({length:90},(_,i)=>{const visits=Math.max(1,Math.round(20+i*.2+7*Math.sin(i/4)));return {visits,whatsapp:Math.round(visits*.12)};});
function show(){const n=+$('owner-analytics-range').value,d=data.slice(-n),key=$('owner-analytics-metric').value,type=$('owner-analytics-type').value;
const sum=k=>d.reduce((s,x)=>s+x[k],0),visits=sum('visits'),clicks=sum('whatsapp');
$('demo-total-visits').textContent=visits;$('demo-total-whatsapp').textContent=clicks;$('demo-ctr').textContent=(clicks/visits*100).toFixed(1)+'%';
const v=d.map(x=>x[key]),max=Math.max(...v,1),step=740/v.length;
const y=x=>240-190*x/max;
const shapes=type==='bar'?v.map((x,i)=>'<rect x="'+(40+i*step)+'" y="'+y(x)+'" width="'+Math.max(1,step-3)+'" height="'+(240-y(x))+'" fill="#709b7c"/>').join(''):'<polyline points="'+v.map((x,i)=>(40+i*step)+','+y(x)).join(' ')+'" fill="none" stroke="#2d6851" stroke-width="3"/>';
$('owner-analytics-chart').innerHTML='<svg viewBox="0 0 800 280" role="img" aria-label="Demo '+key+' data"><line x1="40" y1="240" x2="780" y2="240" stroke="#ccc"/>'+shapes+'</svg>';
const tb=$('owner-visitor-locations');tb.replaceChildren();let rem=visits;
[['London',.38],['Manchester',.18],['Birmingham',.11],['Other UK',.25],['International',.08]].forEach(([name,p],i,a)=>{const count=i===a.length-1?rem:Math.round(visits*p);rem-=count;const tr=document.createElement('tr');for(const txt of [name,String(count)]){const td=document.createElement('td');td.textContent=txt;tr.append(td);}tb.append(tr);});
}
['owner-analytics-range','owner-analytics-metric','owner-analytics-type'].forEach(id=>$(id).addEventListener('change',show));show();
})();