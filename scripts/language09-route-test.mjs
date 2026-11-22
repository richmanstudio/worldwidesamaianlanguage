import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('dist/assets/site.js','utf8');
const data=JSON.parse(readFileSync('dist/assets/language-0.9.json','utf8'));
const dom=new Map();
function element(id){
 if(!dom.has(id))dom.set(id,{id,innerHTML:'',textContent:'',value:'',dataset:{},style:{},
 classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},
 setAttribute(){},removeAttribute(){},getAttribute(){return ''},querySelectorAll(){return []},
 querySelector(){return null},focus(){},scrollIntoView(){},
 insertAdjacentHTML(position,v){this.innerHTML=position==='afterbegin'?v+this.innerHTML:this.innerHTML+v;}});
 return dom.get(id);
}
const location={hash:'#/language09'};
const document={title:'',getElementById:element,querySelectorAll(){return []},querySelector(){return null},
 body:{classList:{add(){},remove(){},toggle(){},contains(){return false}}}};
const fetch=async path=>({ok:path.endsWith('language-0.9.json'),json:async()=>data});
const window={addEventListener(){},scrollTo(){},setTimeout,clearTimeout};
const context=vm.createContext({document,window,location,localStorage:{getItem(){return null},setItem(){}},
 URLSearchParams,Date,Math,Set,Array,String,Number,console,fetch});
vm.runInContext(source,context,{timeout:15000});
await new Promise(resolve=>setTimeout(resolve,60));
const html=element('app').innerHTML;
for(const fragment of ['SAMA 0.9','09-01','09-20','C01','C20','B01','B12','hu','musa','saka','НЕ проверенный'])assert(html.includes(fragment),'Missing 0.9 page content: '+fragment);
assert(!html.includes('undefined')&&!html.includes('Не удалось загрузить'),'Render failed');
console.log('✓ SAMA 0.9: new route loads 20 rules, 20 semantic contrasts and 12 blocked cases');
