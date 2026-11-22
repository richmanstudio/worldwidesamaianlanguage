// Route-level checks with a strict, lightweight DOM model. This is not a visual browser test.
// Scientific terms like 'эксперимент' and 'гипотеза' are valid accepted vocabulary, not draft status signals.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=readFileSync('dist/assets/site.js','utf8');
const dom=new Map();
function element(id){
 if(!dom.has(id))dom.set(id,{
   id,innerHTML:'',textContent:'',value:'',dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},
   addEventListener(){},querySelectorAll(){return []},querySelector(sel){
     if(sel==='h1'){const html=this.innerHTML.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1];return html?{textContent:html.replace(/<[^>]+>/g,'')}:null;}
     return null;
   },insertAdjacentHTML(position,html){this.innerHTML=position==='afterbegin'?html+this.innerHTML:this.innerHTML+html;},
   setAttribute(){},removeAttribute(){},getAttribute(){return ''},focus(){},scrollIntoView(){}
 });
 return dom.get(id);
}
const location={hash:'#/'};
const document={title:'',getElementById:element,querySelectorAll(){return []},querySelector(){return null},body:{classList:{add(){},remove(){},toggle(){},contains(){return false}}}};
const window={addEventListener(){},scrollTo(){},setTimeout,clearTimeout};
const context=vm.createContext({document,window,location,localStorage:{getItem(){return null},setItem(){}},
 URLSearchParams,Date,Math,Set,Array,String,Number,console});
vm.runInContext(source,context,{timeout:12000});
const evalIn=(s)=>vm.runInContext(s,context,{timeout:12000});

function currentRoute(path,title){location.hash='#/'+path;evalIn('render()');const html=element('app').innerHTML;assert(html.includes(title),path+' / '+title);assert(!html.includes('undefined'),path);return html;}
const paths=[['','SAMA — язык для общения'],['start','С чего начать'],['alphabet','Азбука'],['sounds','Произношение'],['grammar','Грамматика'],['dictionary','Словарь'],['lessons','Курс'],['phrases','Разговорник'],['library','Тексты'],['trainer','Практика'],['about','О языке'],['numbers','Целые числа'],['word/su','вода'],['lesson/1','Буквы'],['favorites','Избранные']];
for(const [path,title] of paths){const html=currentRoute(path,title);assert(!/OPEN PROJECT|Архивная редакция|Лаборатория 5000|статус: candidate|неутвержд[её]н/i.test(html),'Unadopted content in main route '+path);assert(!html.includes('Архивная редакция'),path);}
for(let i=1;i<=35;i++)currentRoute('lesson/'+i,'Урок '+i);
const archived=currentRoute('archive/grammar','Грамматика');assert(archived.includes('Архивная редакция'));
currentRoute('trainer','Практика');element('standardSentence').value='Mi si yu.';evalIn('checkCurrentSentence()');assert(element('standardParseResult').innerHTML.includes('соответствует'));
element('standardSentence').value='Mi si.';evalIn('checkCurrentSentence()');assert(element('standardParseResult').innerHTML.includes('обязательный'));
const water=evalIn('currentDictionaryMarkup("water")');assert(water.includes('#/word/su'));assert(!water.includes('#/word/kaso'));
const unmatched=evalIn('currentDictionaryMarkup("zzzzzz")');assert(unmatched.includes('0 из 750'));
assert(!evalIn('currentDictionaryMarkup("<img src=x onerror=alert(1)>")').includes('<img'));
const header=readFileSync('dist/index.html','utf8');assert(!/OPEN PROJECT|Лаборатория|Словарь — 5000|DIGITAL EDITION 2006|экспериментального/i.test(header));
assert(header.includes('#/archive'));assert(!/<nav class="primary-nav"[^>]*>[\s\S]*?#\/language09[\s\S]*?<\/nav>/.test(header));
const newLex=JSON.parse(readFileSync('dist/assets/lexicon-v1.json','utf8'));assert.equal(newLex.entries.length,750);
assert(readFileSync('dist/assets/lexicon-v1.csv','utf8').includes('SAMA-SENSE/su/1'));
console.log('✓ Current routes: 15 main views, all 35 lessons, archive boundary, search escaping and live grammar feedback');

const archivedLex=JSON.parse(readFileSync('dist/assets/standards/0.11.0/lexicon.json','utf8'));assert.equal(archivedLex.entries.length,94);assert.equal(archivedLex.version,'0.11.0');
assert(header.includes('Нормативная редакция 0.14.0'));
assert(!header.includes('__SAMA_VERSION__'));
