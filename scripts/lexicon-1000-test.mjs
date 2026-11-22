/** R07-11: test 250 authored entries, 500 grammar examples and release integrity. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const lex=read('content/lexicon-v1.json'),release=read('content/standard-release.json');
assert.equal(lex.version,'0.16.0');assert.equal(release.accepted_lexemes,1004);assert.equal(lex.entries.length,1004);
const forms=new Set(lex.entries.map(x=>x.form));assert.equal(forms.size,1004);
const ctx=vm.createContext({});
for(const path of ['src/linguistics/phonology.ts','src/linguistics/parser.ts'])
 vm.runInContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText,ctx);
const parse=text=>ctx.parseSamaFoundation(text,lex.entries);
const rows=[];
for(let part=1;part<=10;part++){
 const src='content/editorial/lexicon-1000-part'+String(part).padStart(2,'0')+'.tsv';
 const batch=readFileSync(src,'utf8').trim().split('\n').map(line=>line.split('|'));
 assert.equal(batch.length,25,src);
 for(const row of batch)rows.push({part,row});
}
assert.equal(rows.length,250);
let verbs=0,adjectives=0,examples=0;
const known=new Set(),newSenseIds=new Set();
for(const {part,row} of rows){
 const typed=part<=4;
 assert.equal(row.length,typed?9:7);
 const [form,pos,ru,en,dru,den,frameSpec,a,b]=typed?row:[row[0],'noun',row[1],row[2],row[3],row[4],'',row[5],row[6]];
 assert(!known.has(form),'Repeated new form '+form);known.add(form);
 const entry=lex.entries.find(x=>x.form===form);
 assert(entry,'Missing '+form);assert.equal(entry.decision,'ADR-0008');assert.equal(entry.accepted_in,'0.15.0');
 assert.equal(entry.ipa,ctx.samaWordIPA(form),'Wrong phonemic transcription '+form);
 const sense=entry.senses[0];assert(!newSenseIds.has(sense.id));newSenseIds.add(sense.id);
 assert.equal(sense.part_of_speech,pos);assert.deepEqual(sense.gloss,{ru,en});
 assert.deepEqual(sense.definition,{ru:dru,en:den});assert(dru.length>=20&&den.length>=20);
 assert.deepEqual(sense.examples,[a,b].map(x=>{const [sama,ru]=x.split('~');return {sama,ru};}));
 assert.notEqual(sense.examples[0].sama,sense.examples[1].sama);
 if(pos==='verb'){verbs++;assert(sense.frame);assert.equal(sense.frame.minimum_objects,frameSpec.startsWith('transitive:')?1:0);}
 if(pos==='adjective'){adjectives++;assert(!sense.frame);}
 for(const ex of sense.examples){const result=parse(ex.sama);assert(result.ok,form+': '+ex.sama+' '+JSON.stringify(result));examples++;}
}
assert.equal(known.size,250);assert.equal(verbs,50);assert.equal(adjectives,50);assert.equal(examples,500);
assert.equal(lex.entries.filter(e=>e.accepted_in==='0.15.0').length,250);
assert.equal(lex.entries.filter(e=>e.accepted_in!=='0.15.0').length,754);
const frames=read('content/verb-frames.json');assert.equal(frames.verbs.length,112);
for(const {part,row} of rows.filter(x=>x.part<=2))assert(frames.verbs.some(x=>x.form===row[0]));
const usage=read('content/usage-examples.json');
assert.equal(usage.version,'0.16.0');assert.equal(usage.examples.length,2008);
const prov=read('reports/lexicon-1000-provenance.json');
assert.equal(prov.review.length,250);assert(prov.review.every(x=>x.decision==='adopt'&&!x.independent_review));
const lessons=read('content/learning/lessons-v1.json'),reader=read('content/learning/reader-v1.json');
assert.equal(lessons.lessons.length,49);assert.equal(reader.texts.length,36);
for(const [text,code] of [
 ['Mi wemasa.','MISSING_OBJECT'],['Mi te hemina kaso.','ASPECT_COMPATIBILITY'],
 ['Mi lotema busa.','UNEXPECTED_OBJECT'],['Mi si helewa.','MISSING_OBJECT'],
 ['Mi hu towina kaso.','ASPECT_COMPATIBILITY']
]){const result=parse(text);assert(!result.ok,text);assert.equal(result.error.code,code,text);}
for(const text of ['Mi wemasa pila.','Mi hu hemina kaso.','Mi te towina kaso.','Mi pawasa na busa.','Kopa bi pohela.'])assert(parse(text).ok,text);
console.log('✓ R07-11: 250 editorial decisions, 500 grammar examples, 50 new verbs and 50 new qualities');
console.log('✓ SAMA 0.15.0 cohort: 250 entries preserved in 0.16.0; global 1004 lexemes, 2008 indexed examples, 112 frames');

const contrasts=[["huwisa","suwana","Влажность предмета против отсутствия заметной влаги"],["helewa","tapa","Горячий против тёплого, относительная температура"],["palina","pohela","Полная ёмкость против пустой ёмкости"],["balina","munala","Острый инструмент против тупого"],["kawela","lasi","Тяжёлый и лёгкий по массе"],["sulena","kasala","Гладкая поверхность против шероховатой"],["katela","huwila","Твёрдость против мягкости при нажиме"],["olena","payala","Прозрачный материал против непрозрачного"],["bunala","hilasa","Безопасный в условиях против опасного"],["temina","telawa","Точное значение против приблизительного"],["sapela","paselana","Осторожный против неосторожного"],["awatena","awatelina","Проверка личности и разрешение доступа"],["tesinata","tesawena","Диагностическая процедура и её результат"],["pitanala","kasupela","Таблетка и капсула как разные формы лекарства"],["pasala","tatela","Счёт к оплате и документ о получении денег"],["inewasa","pohita","Поступления и положительная разница после затрат"],["sawelina","inewasa","Отложенные средства и поступающий доход"],["dakisena","apela","Первоначальное исковое заявление и жалоба на пересмотр"],["nakena","wenina","Платная аренда и временное пользование взятой вещью"],["satena","nayina","Передача файла на сервер и сохранение данных"],["lato","luminata","Общий светильник и настольная разновидность"],["bina","bakina","Спина как область тела и лопатка как конкретная кость"],["napisa","pilasa","Ноготь на пальце и металлический гвоздь"],["tulena","paletina","Публичное назначение и частная форма принадлежности"]];
assert.equal(contrasts.length,24);
for(const [a,b] of contrasts){
 const A=lex.entries.find(e=>e.form===a),B=lex.entries.find(e=>e.form===b);
 assert(A&&B&&a!==b,'Missing semantic contrast '+a+'/'+b);
 assert.notDeepEqual(A.senses[0].definition,B.senses[0].definition,'Same definitions '+a+'/'+b);
 const aa=parse(A.senses[0].examples[0].sama),bb=parse(B.senses[0].examples[0].sama);
 assert(aa.ok&&bb.ok,'Unparseable contrast '+a+'/'+b);
 assert.notEqual(JSON.stringify(aa.ast),JSON.stringify(bb.ast),'Identical AST '+a+'/'+b);
}
const near=read('reports/lexeme-confusables-015.json');
assert.equal(near.version,'0.15.0');assert.equal(near.entries_new,250);
assert.equal(near.items.length,near.near_pairs);assert(near.near_pairs>0);
assert.equal(near.human_listening_reviews,0);
console.log('✓ R07-08/11: 24 documented semantic contrasts; near-form risks explicitly flagged, not treated as human study');

for(const lang of ['ru','en']){
 const seen=new Map();
 for(const entry of lex.entries){
  const gloss=entry.senses[0].gloss[lang].trim().toLowerCase();
  assert(!seen.has(gloss),'Unresolved identical '+lang+' gloss: '+entry.form+' / '+seen.get(gloss));
  seen.set(gloss,entry.form);
 }
}
console.log('✓ R07-08: no identical primary RU/EN glosses across 1004 adopted headwords');
