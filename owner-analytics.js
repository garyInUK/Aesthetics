(()=>{'use strict';const $=id=>document.getElementById(id);
const data=Array.from({length:90},(_,i)=>{const visits=Math.max(1,Math.round(20+i*.2+7*Math.sin(i/4)));return {visits,whatsapp:Math.round(visits*.12)};});
function bars(values,labels,orientation){
 const max=Math.max(1,...values),horizontal=orientation==='horizontal',w=820,h=horizontal?Math.max(280,values.length*27+45):300;
 const colors='#709b7c';let marks='';
 if(horizontal){
  const step=(h-35)/values.length;
  marks=values.map((v,i)=>{const y=15+i*step,bar=(v/max)*635;return '<text x="10" y="'+(y+12)+'" font-size="11" fill="#536a5d">'+labels[i]+'</text><rect x="100" y="'+y+'" width="'+bar+'" height="'+Math.max(5,step-5)+'" fill="'+colors+'"/><text x="'+(108+bar)+'" y="'+(y+12)+'" font-size="10" fill="#536a5d">'+v+'</text>';}).join('');
 } else {
  const step=745/values.length;
  marks=values.map((v,i)=>{const x=45+i*step,y=245-(v/max)*190;const show=values.length<=14||i%(values.length>45?14:7)===0;
   return '<rect x="'+x+'" y="'+y+'" width="'+Math.max(2,step-3)+'" height="'+(245-y)+'" fill="'+colors+'"/>'+(show?'<text x="'+x+'" y="264" font-size="10" fill="#536a5d">'+labels[i]+'</text>':'');}).join('');
  marks='<line x1="40" y1="245" x2="800" y2="245" stroke="#c5c8bc"/>'+marks;
 }
 return '<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Fictional bar chart">'+marks+'</svg>';
}
function render(){
 const n=Number($('owner-analytics-range').value),key=$('owner-analytics-metric').value,orientation=$('owner-analytics-type').value,d=data.slice(-n);
 const visits=d.reduce((a,x)=>a+x.visits,0),clicks=d.reduce((a,x)=>a+x.whatsapp,0);
 $('demo-total-visits').textContent=visits.toLocaleString('en-GB');$('demo-total-whatsapp').textContent=clicks.toLocaleString('en-GB');$('demo-ctr').textContent=(clicks/visits*100).toFixed(1)+'%';
 $('owner-analytics-chart').innerHTML=bars(d.map(x=>x[key]),d.map((_,i)=>'D'+(i+1)),orientation);
 const weekly=$('owner-weekly-section');weekly.hidden=n<30;
 if(n>=30){const groups=[];for(let i=0;i<d.length;i+=7)groups.push(d.slice(i,i+7).reduce((sum,x)=>sum+x[key],0));
  $('owner-weekly-chart').innerHTML=bars(groups,groups.map((_,i)=>'W'+(i+1)),orientation);}
 const tb=$('owner-visitor-locations');tb.replaceChildren();let left=visits;
 [['London',.38],['Manchester',.18],['Birmingham',.11],['Other UK',.25],['International',.08]].forEach(([name,p],i,arr)=>{const count=i===arr.length-1?left:Math.round(visits*p);left-=count;const row=document.createElement('tr');
 for(const label of [name,String(count)]){const cell=document.createElement('td');cell.textContent=label;row.append(cell);}tb.append(row);});
}
['owner-analytics-range','owner-analytics-metric','owner-analytics-type'].forEach(id=>$(id).addEventListener('change',render));render();
})();