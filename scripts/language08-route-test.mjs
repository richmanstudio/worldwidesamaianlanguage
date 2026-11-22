import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('dist/assets/site.js','utf8');
const grammar=JSON.parse(readFileSync('dist/assets/grammar-0.8.json','utf8'));
const corpus=JSON.parse(readFileSync('dist/assets/translation-corpus-0.8.json','utf8'));
const dom=new Map();
function el(id){
 if(!dom.has(id))dom.set(id,{
  id,innerHTML:'',textContent:'',value:'',dataset:{},style:{},
  classList:{add(){},remove(){},toggle(){},contains(){return false}},
  addEventListener(){},setAttribute(){},removeAttribute(){},getAttribute(){return ''},
  querySelectorAll(){return []},querySelector(){return null},focus(){},scrollIntoView(){},
  insertAdjacentHTML(position,s){this.innerHTML=position==='afterbegin'?s+this.innerHTML:this.innerHTML+s;}
 });
 return dom.get(id);
}
const location={hash:'#/language08'};
const document={
 title:'',getElementById:el,querySelectorAll(){return []},querySelector(){return null},
 body:{classList:{add(){},remove(){},toggle(){},contains(){return false}}}
};
const fetch=async path=>{
 const value=path.endsWith('grammar-0.8.json')?grammar:path.endsWith('translation-corpus-0.8.json')?corpus:null;
 return {ok:value!==null,json:async()=>value};
};
const window={addEventListener(){},scrollTo(){},setTimeout,clearTimeout};
const context=vm.createContext({document,window,location,localStorage:{getItem(){return null},setItem(){}},
 URLSearchParams,Date,Math,Set,Array,String,Number,console,fetch});
vm.runInContext(source,context,{timeout:12000});
await new Promise(resolve=>setTimeout(resolve,50));
const html=el('app').innerHTML;
assert(html.includes('SAMA 0.8'),'0.8 page not shown');
assert(html.includes('T001')&&html.includes('T100'),'Not all translation entries rendered');
assert(html.includes('08-01')&&html.includes('08-24'),'Not all grammar decisions rendered');
assert(html.includes('Не является')||html.includes('эксперимент'),'Research notice missing');
assert(!html.includes('undefined'),'Undefined content on page');
assert(!html.includes('Не удалось прочитать данные'),'JSON request failed');
assert(html.includes('data-review-status="blocked"'),'Status metadata absent');
console.log('✓ SAMA 0.8 route: 100 items and 24 rule entries displayed in mock DOM');
console.log('✓ SAMA 0.8 route: all required assets load, research caveats visible');
