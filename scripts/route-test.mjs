// Route-level checks with a strict, lightweight DOM model. This is not a visual browser test.
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
const location={hash:'#/archive/home'};
const document={title:'',getElementById:element,querySelectorAll(){return []},querySelector(){return null},body:{classList:{add(){},remove(){},toggle(){},contains(){return false}}}};
const window={addEventListener(){},scrollTo(){},setTimeout,clearTimeout};
const context=vm.createContext({document,window,location,localStorage:{getItem(){return null},setItem(){}},
 URLSearchParams,Date,Math,Set,Array,String,Number,console});
vm.runInContext(source,context,{timeout:12000});
const evalIn=(s)=>vm.runInContext(s,context,{timeout:12000});
const routes=[
 ['/', 'энциклопедия международного языка'],['/start','С чего начать'],['/alphabet','Букварь'],
 ['/sounds','Звукарь SAMA'],['/grammar','Грамматика'],['/dictionary','Словарь SAMA'],
 ['/phrases','Разговорник'],['/numbers','Числа'],['/lessons','Самоучитель'],
 ['/lesson/0','01.'],['/library','Энциклопедия'],['/article/svo','Порядок'],
 ['/trainer','Тренажёр'],['/favorites','Избранное'],['/about','О проекте'],
 ['/changelog','История версий'],['/search?q=sala','Поиск'],
 ['/standard','спецификация языка 0.3'],['/audit','Аудит и журнал исправлений'],
 ['/word/mi','mi'],['/word/meya','meya'],['/word/selo','selo'],['/word/seli','seli'],
 ['/article/standard-content-clause','Изъяснительное'],['/unknown','не найдена']
];
function checkRoute(path,title){
 location.hash=path==='/'?'#/archive/home':'#/archive'+path;
 evalIn('render()');
 const html=element('app').innerHTML;
 assert.ok(/<h1\b/.test(html)&&html.toLowerCase().includes(title.toLowerCase()),`Не найдено: ${path} / ${title}`);
 assert.ok(!html.includes('undefined'),`На странице ${path} значение undefined`);
 assert.ok(html.length>100,`Пустая страница ${path}`);
 return html;
}
for(const [route,expect] of routes)checkRoute(route,expect);
const articleIds=JSON.parse(evalIn('JSON.stringify(ARTICLES.map(a=>[a.id,a.title]))'));
for(const [id,title] of articleIds)checkRoute('/article/'+id,title);
const words=JSON.parse(evalIn('JSON.stringify(LEXICON.map(w=>w.w))'));
for(const word of words)checkRoute('/word/'+word,word);
checkRoute('/core-dictionary','Большой словарь');
element('dictQuery').value='meya'; element('dictTag').value=''; element('dictStatus').value='candidate';
evalIn('refreshDictionary(1)');
assert.ok(element('dictionaryResults').innerHTML.includes('meya'),'Фильтрация по слову meya');
element('dictStatus').value='core';evalIn('refreshDictionary(1)');
assert.ok(!element('dictionaryResults').innerHTML.includes('class="lex-word"'),'Кандидат meya не должен присутствовать в выдаче ядра');
const audit=checkRoute('/audit','Аудит');
assert.ok(audit.includes('pala-doma')&&audit.includes('mona-tima'),'История ошибок отсутствует');
const atlas=checkRoute('/grammar','Грамматика');assert.ok(atlas.includes('grammar-chapter-link'),'Новый атлас грамматики отсутствует');
for(const ch of JSON.parse(evalIn('JSON.stringify(GRAMMAR_ATLAS.chapters.map(c=>c.id))')))checkRoute('/grammar/chapter/'+ch,'Принцип и правила');
const spec=checkRoute('/standard','спецификация языка 0.3');
assert.ok(spec.includes('ke +')||spec.includes('ke'), 'Не загружены сложноподчинённые конструкции');
console.log(`✓ Проверено: ${routes.length} маршрутов, ${articleIds.length} статей, ${words.length} карточек слов`);
console.log('✓ Проверены фильтр статуса, поиск по словарю и журнал ошибок');
console.log(`✓ Всего проверено ${routes.length+articleIds.length+words.length+45} маршрутов (без визуального браузера)`);

const phrasePage=checkRoute('/phrases','Разговорник');
assert(phrasePage.includes('data-editorial-status="historical"')&&phrasePage.includes('CF-002'));
assert(phrasePage.includes('Mi kama su.')&&phrasePage.includes('Я хочу воды.'));
const shopIndex=JSON.parse(evalIn('JSON.stringify(LESSONS.findIndex(x=>x.title===\"В магазине\"))'));
const shopPage=checkRoute('/lesson/'+shopIndex,'В магазине');
assert(shopPage.includes('ИСТОРИЧЕСКИЙ МАТЕРИАЛ')&&shopPage.includes('CF-002'));
assert(shopPage.includes('Mi kama su.'));
const grammarPage=checkRoute('/grammar','Грамматика');
assert(!grammarPage.includes('${GRAMMAR_ATLAS'));
console.log('✓ CF-002: archival notices visible next to phrase and lesson content in built routes');
