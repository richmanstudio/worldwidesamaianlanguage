import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>JSON.parse(readFileSync(p,'utf8'));
const corpus=read('content/translation-corpus-0.8.json');
const grammar=read('content/grammar-0.8.json');
const lex=read('content/lexicon.json');
const byWord=new Map(lex.map(x=>[x.w,x.status]));
const experimental=new Set(corpus.experimental_tokens);
assert.equal(corpus.items.length,100,'Exactly 100 manually authored translation prompts');
assert.equal(corpus.reviewers,1,'Authorship ≠ independent validation');
assert.equal(corpus.reviewed_by_native_speakers,0,'Must not claim native-speaker validation');
assert.equal(grammar.rules.length,24,'Grammar proposal count changed');
assert.equal(grammar.external_validation,false);
const metrics={core:0,draft:0,blocked:0};
const uniqueRu=new Set(),uniqueSa=new Set(),uniqueId=new Set(),byCategory=new Map();
for(const item of corpus.items){
  assert(/^T\d{3}$/.test(item.id),'Bad item ID');
  assert(!uniqueId.has(item.id));uniqueId.add(item.id);
  assert(!uniqueRu.has(item.ru),'Duplicate Russian prompt: '+item.ru);uniqueRu.add(item.ru);
  assert(item.ru?.trim(),'Missing Russian prompt');
  assert(['core','draft','blocked'].includes(item.status));
  metrics[item.status]++;
  byCategory.set(item.category,(byCategory.get(item.category)||0)+1);
  assert(item.review.includes('not independently validated'),'No false certified translation claims');
  if(item.status==='blocked'){
    assert.equal(item.sama,null,'Untranslatable item must stay untranslated: '+item.id);
    assert(item.note?.length>25,'Explain gap '+item.id);
    continue;
  }
  assert(item.sama?.trim(),'Missing SAMA sample');
  assert(!uniqueSa.has(item.sama),'Repeated SAMA form '+item.sama);uniqueSa.add(item.sama);
  for(const token of item.sama.toLowerCase().match(/[a-z]+/g)||[]){
    assert(byWord.has(token)||experimental.has(token),'Unknown morpheme '+token+' at '+item.id);
    if(item.status==='core')assert.equal(byWord.get(token),'core','Non-core lexeme in internally-core item '+item.id+' '+token);
  }
  if(item.category==='Условные отношения'){
    assert(/^Ani /i.test(item.sama)&&item.sama.includes(','),'Condition needs comma: '+item.id);
    assert.equal((item.sama.match(/,/g)||[]).length,1,'Exactly one conditional boundary for prototype');
  }
  if(item.category==='Изъяснительные придаточные'){
    assert.equal((item.sama.match(/\bke\b/g)||[]).length,1,'Only one ke in bounded pilot: '+item.id);
  }
  if(item.sama.includes(' ye ')){
    assert.equal((item.sama.match(/\bye\b/g)||[]).length,1);
    assert.equal((item.sama.match(/\bya\b/g)||[]).length,1);
    assert.equal((item.sama.match(/\be\b/g)||[]).length,1,'Exactly one relative gap: '+item.id);
    assert(item.sama.indexOf(' ye ')<item.sama.indexOf(' ya '));
  }
}
assert.deepEqual(metrics,{core:30,draft:60,blocked:10});
assert.equal(byCategory.size,10,'10 semantic groups');
for(const [name,count] of byCategory) assert.equal(count,10,'Expected 10 prompts in '+name);
assert.equal(grammar.rules.filter(x=>x.status==='core').length,6);
assert.equal(grammar.rules.filter(x=>x.status==='experimental').length,12);
assert.equal(grammar.rules.filter(x=>x.status==='unresolved').length,6);
const examples=grammar.rules.filter(x=>x.example!=='—');
for(const x of examples){assert(x.restriction?.length>=15);for(const token of x.example.toLowerCase().match(/[a-z]+/g)||[])assert(byWord.has(token)||experimental.has(token),'Untracked grammar token '+token);}
assert(corpus.items.some(x=>x.status==='blocked'&&x.ru.includes('Договор')),'Missing legal semantic gap');
assert(corpus.items.some(x=>x.status==='blocked'&&x.ru.includes('Научная')),'Missing scientific semantic gap');
console.log('✓ SAMA 0.8: 100 authored cases, 30 core-frame / 60 draft / 10 blocked, all unique');
console.log('✓ SAMA 0.8: 24 rules, 10 semantic groups, lexicon and relative/conditional diagnostics checked');
console.log('✓ No claim of independent translation or native-speaker review');
