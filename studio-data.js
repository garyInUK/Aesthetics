/* Browser-only demonstration storage. Not a secure or shared backend. */
(function(){
'use strict';
const priceKey='nss-demo-prices-v1',reviewKey='nss-demo-reviews-v2';
const samplePrices=[
{id:'p1',category:'Consultations',name:'Skin consultation',description:'Individual skin assessment and treatment discussion',price:45},
{id:'p2',category:'Facials & Skin',name:'Signature facial',description:'Tailored cleansing, nourishment and hydration',price:75},
{id:'p3',category:'Facials & Skin',name:'Advanced skin rejuvenation facial',description:'Individualised facial treatment',price:110},
{id:'p4',category:'Facials & Skin',name:'LED light therapy',description:'Non-invasive skin-care session',price:55},
{id:'p5',category:'Skin Treatments',name:'Microneedling consultation & treatment',description:'Subject to professional suitability assessment',price:160},
{id:'p6',category:'Skin Treatments',name:'Superficial chemical peel',description:'Price depends on the recommended treatment',price:90},
{id:'p7',category:'Skin Treatments',name:'Skin booster consultation & treatment',description:'Subject to individual assessment',price:220}
];
const sampleReviews=[
{id:'example-1',name:'Illustrative guest A',stars:5,text:'A beautifully calm setting, with every detail considered. The consultation felt entirely personal.',url:'',demo:true},
{id:'example-2',name:'Illustrative guest B',stars:5,text:'Unhurried, discreet and wonderfully attentive. I felt listened to from the moment I arrived.',url:'',demo:true},
{id:'example-3',name:'Illustrative guest C',stars:5,text:'A thoughtful conversation, clear explanations and an atmosphere of quiet luxury.',url:'',demo:true},
{id:'example-4',name:'Illustrative guest D',stars:5,text:'The space feels serene and welcoming. Every question was handled with care and patience.',url:'',demo:true},
{id:'example-5',name:'Illustrative guest E',stars:4,text:'Elegant surroundings and a reassuringly individual approach. A lovely experience from start to finish.',url:'',demo:true}
];
function load(key,fallback){try{const s=JSON.parse(localStorage.getItem(key));if(Array.isArray(s))return s}catch(e){}return fallback.map(x=>({...x}))}
function save(key,data){localStorage.setItem(key,JSON.stringify(data))}
function cleanUrl(value){if(!value)return '';try{const u=new URL(value);return u.protocol==='https:'?u.href:''}catch(e){return ''}}
function text(tag,value,cls){const n=document.createElement(tag);if(cls)n.className=cls;n.textContent=value;return n}
function renderPrices(mount){if(!mount)return;mount.replaceChildren();const rows=load(priceKey,samplePrices);const categories=[...new Set(rows.map(r=>r.category))];categories.forEach(category=>{const sec=text('section','','price-group');sec.append(text('h2',category));const table=text('div','','price-table');rows.filter(p=>p.category===category).forEach(p=>{const row=text('article','','price-item'),left=text('div',''),right=text('strong','£'+Number(p.price).toFixed(0),'price-amount');left.append(text('h3',p.name),text('p',p.description));row.append(left,right);table.append(row)});sec.append(table);mount.append(sec)})}
window.StudioDemo={priceKey,reviewKey,samplePrices,sampleReviews,load,save,cleanUrl,text,renderPrices};
})();
