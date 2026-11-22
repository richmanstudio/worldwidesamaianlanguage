import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseRelative} from './relative-parser.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const data=read('tests/relative-clauses.json'),profile=read('content/rules/relative-pilot.json');
assert.equal(data.pairs.length,120);
assert.equal(data.role_contrasts.length,60);
assert.equal(data.human_participants,0);
assert.equal(profile.human_validation,false);
const cases=new Map(),strings=new Set();
for(const pair of data.pairs){
 assert(!cases.has(pair.id));cases.set(pair.id,pair);
 assert(!strings.has(pair.valid));strings.add(pair.valid);
 const ast=parseRelative(pair.valid),e=pair.expected;
 assert.equal(ast.head.form,e.head);
 assert.equal(ast.relative.subject.ref?'ta':ast.relative.subject.form,e.subject);
 assert.equal(ast.relative.object.ref?'ta':ast.relative.object.form,e.object);
 for(const key of ['verb','tense','negative','boundRole'])assert.equal(ast.relative[key],e[key],pair.id+' '+key);
 assert.equal(ast.relative.start,1);
 assert.equal(ast.relative.end,pair.valid.toLowerCase().split(' ').indexOf('ya'));
 assert.equal(ast.relative[e.boundRole].ref,ast.head.id);
 assert.equal(ast.matrix.subject.ref,ast.head.id);
 assert.throws(()=>parseRelative(pair.invalid),e=>e.message===pair.error,pair.id);
}
for(const pair of data.role_contrasts){
 const s=parseRelative(cases.get(pair.subject_case).valid),o=parseRelative(cases.get(pair.object_case).valid);
 assert.equal(s.relative.subject.ref,'head-1');assert.equal(o.relative.object.ref,'head-1');
 assert.equal(s.relative.object.form,o.relative.subject.form);
 for(const key of ['verb','tense','negative'])assert.equal(s.relative[key],o.relative[key]);
}
for(const item of data.negative_cases)assert.throws(()=>parseRelative(item.text),e=>e.message===item.error,item.text);
assert.deepEqual(parseRelative('  AMI ye TA si mi ya bi na doma.  '),parseRelative('Ami ye ta si mi ya bi na doma.'));
const lex=read('content/lexicon.json');
for(const [w,status] of Object.entries(data.lexical_status))assert.equal(lex.find(x=>x.w===w)?.status,status);
assert.equal(lex.filter(x=>x.status==='core').length,43);
assert(!lex.some(x=>x.w==='e'));
assert.equal(data.lexical_status.ye,'candidate');assert.equal(data.lexical_status.ya,'candidate');
const reg=read('content/rule-registry.json'),ids=new Set();
for(const topic of reg.topics){
 assert(!ids.has(topic.id),'Duplicate canonical rule ID');ids.add(topic.id);
 const active=topic.revisions.filter(x=>x.active);
 assert(active.length<=1,'Competing active revisions: '+topic.id);
 assert.equal(topic.active_revision,active[0]?.id??null);
 assert.equal(new Set(topic.revisions.map(x=>x.id)).size,topic.revisions.length);
 for(const rev of topic.revisions){
  assert(rev.id.startsWith(topic.id+'@'));assert(['core','experimental','unresolved','deprecated'].includes(rev.status));
  const file=read(rev.path),source=rev.selector?file.rules.find(x=>x.id===rev.selector):file;assert.equal(source.revision||source.id,rev.id);assert.equal(source.status,rev.status);
 }
}
assert.equal(reg.topics.find(x=>x.topic==='relatives').active_revision,'SAMA-RULE/relatives@'+read('content/rules/core.json').version);
const spec=read('content/specification.json').find(x=>x.id==='relative-core');
const atlas=read('content/grammar-atlas.json').chapters.find(x=>x.id==='relative');
const article=read('content/articles/standard-relative-core.json');
assert.deepEqual(spec.rules,atlas.rules);assert.deepEqual(spec.examples,article.examples.map(([sama,ru])=>({sama,ru})));
for(const sample of [...spec.examples,...atlas.examples])parseRelative(sample.sama);
const archive=read('content/legacy/pre-cf001/grammar-0.8.json');
const live=read('content/grammar-0.8.json');
for(const id of ['08-12','08-13']){
 const old=archive.rules.find(x=>x.id===id),current=live.rules.find(x=>x.id===id);
 assert.equal(old.example,current.example);assert(current.restriction.includes('АРХИВ CF-001'));
}
const source=readFileSync('src/app.ts','utf8');
assert(source.includes('Архивная e-модель 0.8'));
assert(!source.includes("'Система, а не набор случайных правил: ${"),'Unexpanded grammar template');
console.log('✓ CF-001: 120 valid/invalid pairs, 60 role contrasts, '+data.negative_cases.length+' boundary/scope/coreference rejections; no lexical promotion');
console.log('✓ R00-04: unique rule IDs, at most one active revision; current explanations aligned; history preserved');
