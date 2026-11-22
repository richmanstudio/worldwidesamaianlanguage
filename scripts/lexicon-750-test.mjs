/** R07-10: verify 400 authored lexemes, phonology, contrastive frames, and release integrity. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const lex=read('content/lexicon-v1.json'),release=read('content/standard-release.json');
assert.equal(lex.version,'0.16.0');assert.equal(release.accepted_lexemes,1004);
assert.equal(lex.entries.length,1004);
const ctx=vm.createContext({});
for(const path of ['src/linguistics/phonology.ts','src/linguistics/parser.ts'])
 vm.runInContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText,ctx);
const parse=s=>ctx.parseSamaFoundation(s,lex.entries);
const source=[];
for(let i=1;i<=10;i++){
 const path='content/editorial/lexicon-750-part'+String(i).padStart(2,'0')+'.tsv';
 const rows=readFileSync(path,'utf8').trim().split('\n').map(s=>s.split('|'));
 assert.equal(rows.length,40,path);
 for(const row of rows)source.push({part:i,row});
}
assert.equal(source.length,400);
let verbs=0,adjectives=0,examples=0;
const forms=new Set(lex.entries.map(x=>x.form));
assert.equal(forms.size,1004);
for(const {part,row} of source){
 assert.equal(row.length,part===10?9:7);
 const [form,pos,ru,en,dru,den,frame,ex1,ex2]=part===10?row:[row[0],'noun',row[1],row[2],row[3],row[4],'',row[5],row[6]];
 const entry=lex.entries.find(x=>x.form===form);
 assert(entry,'Missing '+form);assert.equal(entry.decision,'ADR-0007');assert.equal(entry.accepted_in,'0.14.0');
 assert.equal(entry.ipa,ctx.samaWordIPA(form));
 const sense=entry.senses[0];assert.equal(sense.part_of_speech,pos);
 assert.deepEqual(sense.gloss,{ru,en});assert.deepEqual(sense.definition,{ru:dru,en:den});
 assert.deepEqual(sense.examples,[ex1,ex2].map(x=>{const [sama,ru]=x.split('~');return {sama,ru};}));
 if(pos==='verb'){verbs++;assert(sense.frame);assert.equal(sense.frame.minimum_objects,frame.startsWith('transitive:')?1:0);}
 if(pos==='adjective'){adjectives++;assert(!sense.frame);}
 assert.notEqual(sense.examples[0].sama,sense.examples[1].sama);
 for(const e of sense.examples){const result=parse(e.sama);assert(result.ok,form+': '+e.sama+' '+JSON.stringify(result));examples++;}
}
assert.equal(verbs,25);assert.equal(adjectives,15);assert.equal(examples,800);
assert.equal(lex.entries.filter(x=>x.accepted_in==='0.14.0').length,400);
const frames=read('content/verb-frames.json');assert.equal(frames.verbs.length,112);
for(const form of source.filter(x=>x.row[1]==='verb').map(x=>x.row[0]))assert(frames.verbs.some(x=>x.form===form));
for(const [text,code] of [
 ['Mi helisa yu.','UNEXPECTED_OBJECT'],
 ['Mi seliwa.','MISSING_OBJECT'],
 ['Mi te ponila yu.','ASPECT_COMPATIBILITY'],
 ['Mi hu dawila soma.','ASPECT_COMPATIBILITY'],
 ['Mi si mulata soma.','MISSING_OBJECT']
]){const result=parse(text);assert(!result.ok,text);assert.equal(result.error.code,code,text);}
for(const sentence of ['Mi hu helisa.','Mi te dawila soma.','Soma bi kamaliya.','Mi si soma mulata.'])assert(parse(sentence).ok,sentence);
const examplesIndex=read('content/usage-examples.json');assert.equal(examplesIndex.version,'0.16.0');assert.equal(examplesIndex.examples.length,2008);
const prov=read('reports/lexicon-750-provenance.json');assert.equal(prov.review.length,400);assert(prov.review.every(x=>x.decision==='adopt'&&x.independent_review===false));
console.log('✓ R07-10: 400 authored lexical decisions, 800 parsed example sentences, 25 new verb frames and 15 qualities');
console.log('✓ R07-17/G7 partial: 1004 adopted lexemes, 112 total verbs and 2008 indexed examples; no human-study claim');

const contrasts=[["halima","tano","холм / гора","Mi si halima.","Mi si tano.","Невысокая возвышенность не равна горе"],["kilima","wetala","климат / погода","Mi tami kilima.","Mi tami wetala.","Долгосрочный режим не равен состоянию атмосферы сейчас"],["semila","lamota","семя / корень","Mi si semila.","Mi si lamota.","Зародыш с запасом питания не равен вегетативному органу"],["labita","hokisa","кролик / лиса","Mi si labita.","Mi si hokisa.","Разные биологические животные"],["kesina","ewana","сыр / яйцо","Mi kula kesina.","Mi kula ewana.","Два самостоятельных вида пищи"],["paneka","paniya","кастрюля / сковорода","Mi si paneka.","Mi si paniya.","Глубокая варочная ёмкость не равна неглубокой жарочной"],["salona","kamena","гостиная / ванная","Mi bi na salona.","Mi bi na kamena.","Различные помещения по назначению"],["silita","tisaleta","рубашка / футболка","Mi si silita.","Mi si tisaleta.","Отличие формы и типа верхней одежды"],["libala","museo","библиотека / музей","Mi bi na libala.","Mi bi na museo.","Доступ к книжным фондам и экспонирование коллекций"],["busa","telena","автобус / поезд","Mi si busa.","Mi si telena.","Автодорожный и рельсовый транспорт"],["silabusa","timetala","план курса / расписание","Mi lita silabusa.","Mi lita timetala.","Содержание курса не является распределением занятий по времени"],["pasala","lepota","счёт / отчёт","Mi tami pasala.","Mi tami lepota.","Платёжное требование не равно описанию результатов"],["imeila","letela","электронное / бумажное письмо","Mi lita imeila.","Mi lita letela.","Канал доставки и форма сообщения"],["pinetela","hotona","картина / фотография","Mi si pinetela.","Mi si hotona.","Живописная техника и регистрация света"],["simota","diyano","симптом / диагноз","Meka tami simota.","Meka tami diyano.","Проявление болезни не тождественно заключению"],["senatena","apela","судебное решение / апелляция","Mi lita senatena.","Mi lita apela.","Акт разрешения дела не равен обращению на пересмотр"],["webasita","webapana","сайт / страница","Mi tami webasita.","Mi tami webapana.","Собрание страниц не равно одному документу"],["hipotesa","teyolia","гипотеза / теория","Mi tami hipotesa.","Mi tami teyolia.","Проверяемое предположение не равно развитой объяснительной системе"],["seliwa","kisena","обнимать / целовать","Mi seliwa yu.","Mi kisena yu.","Различные жесты внимания"],["ponila","tihena","доверять / бояться","Mi ponila yu.","Mi tihena yu.","Положительная оценка надёжности не равна страху"]];
assert.equal(contrasts.length,20);
for(const [a,b,_topic,left,right] of contrasts){
 const la=lex.entries.find(e=>e.form===a),lb=lex.entries.find(e=>e.form===b);
 assert(la&&lb&&a!==b,'Missing contrast form '+a+'/'+b);
 assert.notDeepEqual(la.senses[0].definition,lb.senses[0].definition,'Collapsed meanings '+a+'/'+b);
 const x=parse(left),y=parse(right);
 assert(x.ok&&y.ok,'Unparseable semantic pair '+left+' / '+right);
 assert.notEqual(JSON.stringify(x.ast),JSON.stringify(y.ast),'Identical AST for lexical contrast');
}
console.log('✓ R07-10: 20 documented lexical-semantic contrasts are structurally distinct');
