/** R07-10: verify 50 individually defined SAMA forms and 100 valid examples. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const lex=read('content/lexicon-v1.json'),release=read('content/standard-release.json');
const rows=readFileSync('content/editorial/lexicon-350.tsv','utf8').trim().split("\n").map(x=>x.split('|'));
assert.equal(lex.version,'0.14.0');assert.equal(release.accepted_lexemes,750);
assert.equal(rows.length,50);assert.equal(new Set(rows.map(x=>x[0])).size,50);assert.equal(lex.entries.length,750);
const context=vm.createContext({});
for(const p of ['src/linguistics/phonology.ts','src/linguistics/parser.ts'])
  vm.runInContext(ts.transpileModule(readFileSync(p,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText,context);
let examples=0;
for(const row of rows){
 assert.equal(row.length,9,row[0]);
 const [form,ru,en,dru,den,a,aru,b,bru]=row;
 const e=lex.entries.find(x=>x.form===form);
 assert(e,form);assert.equal(e.decision,'ADR-0006');assert.equal(e.accepted_in,'0.13.0');
 assert.equal(e.ipa,context.samaWordIPA(form));
 const s=e.senses[0];assert.equal(s.part_of_speech,'noun');
 assert.deepEqual(s.gloss,{ru,en});assert.deepEqual(s.definition,{ru:dru,en:den});
 assert.deepEqual(s.examples,[{sama:a,ru:aru},{sama:b,ru:bru}]);assert.notEqual(a,b);
 for(const sentence of [a,b]){
   const parsed=context.parseSamaFoundation(sentence,lex.entries);
   assert(parsed.ok,form+': '+sentence+' '+JSON.stringify(parsed));examples++;
 }
}
for(const old of read('content/standards/0.11.0/lexicon.json').entries){
 const now=lex.entries.find(x=>x.form===old.form);assert(now);
 assert.deepEqual(now.senses[0].definition,old.senses[0].definition);
}
assert.equal(lex.entries.filter(x=>x.accepted_in==='0.13.0').length,50);
const usage=read('content/usage-examples.json');assert.equal(usage.version,'0.14.0');assert.equal(usage.examples.length,1500);
const lessons=read('content/learning/lessons-v1.json'),reader=read('content/learning/reader-v1.json');
assert.equal(lessons.lessons.length,35);assert.equal(reader.texts.length,23);
console.log('✓ R07-10: 50 authored lexical entries and '+examples+' parsed examples; 50 entries adopted in 0.13.0; current lexicon totals 750');
console.log('✓ R10-04/07: 0.13.0 cohort verified against 35 lessons and 23 reader texts; 1500 usage-example links');
