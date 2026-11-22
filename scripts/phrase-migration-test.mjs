import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const phrases=read('content/phrases.json'),lessons=read('content/lessons.json');
const oldPhrase=phrases.find(x=>x.sama==='Mi kama su.');
assert(oldPhrase);assert.equal(oldPhrase.ru,'Я хочу воды.');
assert.equal(oldPhrase.editorial_status,'historical');assert(oldPhrase.editorial_note.includes('CF-002'));
const shop=lessons.find(x=>x.title==='В магазине');
assert.equal(shop.editorial_status,'historical');
assert.equal(shop.answer,'Mi kama su.');assert.equal(shop.examples[0][1],'Я хочу воды, пожалуйста.');
assert(shop.editorial_note.includes('не равно'));
const nominal=/\bkama\s+su\b/i;
function check(item){
 if(nominal.test(JSON.stringify(item))){
  assert.equal(item.editorial_status,'historical','Unlabelled nominal kama');
  assert(item.editorial_note?.includes('CF-002'),'Nominal frame lacks decision reference');
 }
}
for(const item of [...phrases,...lessons])check(item);
assert.throws(()=>check({sama:'Mi kama su.',ru:'Я хочу воды.'}));
assert.throws(()=>check({sama:'Mi kama su.',editorial_status:'experimental',editorial_note:'CF-002'}));
for(const phrase of phrases.filter(x=>/\bkama\b/i.test(x.sama))){
 assert(['experimental','historical'].includes(phrase.editorial_status));assert(phrase.editorial_note);
}
let nominalArticles=0;
for(const name of readdirSync('content/articles').filter(x=>x.endsWith('.json'))){
 const article=read('content/articles/'+name);
 if((article.examples||[]).some(([s])=>nominal.test(s))){
  nominalArticles++;assert(article.paragraphs.some(x=>x.includes('CF-002')&&x.includes('Историческая')));
 }
}
assert.equal(nominalArticles,2);
const quiz=read('content/quiz.json');assert(!quiz.some(x=>nominal.test(JSON.stringify(x))),'Unreviewed nominal kama quiz');
const spec=read('content/specification.json');
assert(spec.find(x=>x.id==='modals-core').notes.some(x=>x.includes('ADR-0002')));
assert.equal(read('content/lexicon.json').find(x=>x.w==='kama').status,'candidate');
const conflicts=read('content/rule-registry.json');
assert.equal(conflicts.conflicts.find(x=>x.id==='CF-002').status,'resolved-by-archival-scope');
assert.equal(conflicts.counts.open_conflicts,conflicts.conflicts.filter(x=>!x.status||x.status==='open').length);
console.log('✓ R01-13/CF-002: nominal meanings preserved and historical in phrase/lesson/two articles; VP examples remain experimental');
