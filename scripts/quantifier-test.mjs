/** R03-09 / R06-03 — executable grammar, logical scope and negative tests. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const lex=read('content/lexicon-v1.json'),rules=read('content/rules/core.json');
const ctx=vm.createContext({});
for(const path of ['src/linguistics/parser.ts','src/linguistics/quantification.ts']){
 const compiled=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInContext(compiled,ctx);
}
const parse=s=>ctx.parseSamaFoundation(s,lex.entries);
const interpret=(sentence,domain,exceptionId=null)=>{
 const p=parse(sentence);assert(p.ok,sentence+' '+JSON.stringify(p));
 return ctx.samaEvaluateQuantifiedClause(p.ast.clauses[0],domain,exceptionId);
};
const fixtures=read('tests/quantifier-scopes.json');assert.equal(fixtures.length,40);
const kinds=new Map();
for(const f of fixtures){
 const left=interpret(f.left,f.domain),right=interpret(f.right,f.domain);
 assert.equal(left.status,'defined',f.id);assert.equal(right.status,'defined',f.id);
 assert.equal(left.truth,f.expected_left,'Left meaning '+f.id);assert.equal(right.truth,f.expected_right,'Right meaning '+f.id);
 assert.notEqual(left.truth,right.truth,'The chosen domain must separate both interpretations: '+f.id);
 const a=parse(f.left).ast.clauses[0],b=parse(f.right).ast.clauses[0];
 assert.notEqual(JSON.stringify(a),JSON.stringify(b),f.id);
 kinds.set(f.scope,(kinds.get(f.scope)||0)+1);
}
assert.equal(kinds.size,4);for(const n of kinds.values())assert.equal(n,10);
for(const text of [
 'Tawa ami li wako.','No tawa ami li wako.','Tawa ami li no wako.',
 'Somi ami li wako.','No somi ami li wako.','Somi ami li no wako.',
 'Mowa ami li wako.','No mowa ami li wako.','Mowa ami li no wako.',
 'Tawa ami li sule ta wako.','Tawa ami li sule ena ami wako.',
 'Tawa ami li bona wako.','Tawa ami li de mi wako.','Tawa ami li pa wako.',
 'Tawa ami li la wako.','Tawa ami li si yu.','No somi ami li si yu.'
])assert(parse(text).ok,'Grammar acceptance: '+text+' '+JSON.stringify(parse(text)));
for(const [input,error] of [
 ['Tawa ami wako.','QUANTIFIER_PLURAL'],
 ['Somi ta li wako.','QUANTIFIER_HEAD'],
 ['Mowa ena ami li wako.','QUANTIFIER_ORDER'],
 ['Tawa dua ami li wako.','QUANTIFIER_ORDER'],
 ['Mi si tawa ami li.','QUANTIFIER_SCOPE'],
 ['Mi si no somi ami li.','QUANTIFIER_SCOPE'],
 ['Somi ami li sule ta wako.','QUANTIFIER_EXCEPTION'],
 ['No tawa ami li sule ta wako.','QUANTIFIER_EXCEPTION'],
 ['Tawa ami li sule mama wako.','QUANTIFIER_EXCEPTION'],
 ['Tawa ami li sule ta li wako.','QUANTIFIER_EXCEPTION'],
 ['Tawa ami li wa mama wako.','QUANTIFIER_COORDINATION'],
 ['No somi ami li no wako.','DOUBLE_NEGATION_SCOPE'],
 ['Tawa mi li wako.','QUANTIFIER_HEAD'],
 ['Tawa ami li sule ta wa yu wako.','TRAILING'],
 ['Sule ta wako.','EXPECTED_NP']
]){
 const p=parse(input);assert(!p.ok,input);assert.equal(p.error.code,error,input+' '+JSON.stringify(p));
}
const oneFalse=[{id:'ta',predicate:false},{id:'other',predicate:true},{id:'third',predicate:true}];
const whole=interpret('Tawa ami li wako.',oneFalse);
const except=interpret('Tawa ami li sule ta wako.',oneFalse,'ta');
assert.equal(whole.truth,false);assert.equal(except.truth,true);assert.equal(except.domainSize,2);
const counter=interpret('No tawa ami li wako.',oneFalse);assert.equal(counter.truth,true);
const emptyAll=interpret('Tawa ami li wako.',[]);
assert.equal(emptyAll.status,'undefined');assert.equal(emptyAll.reason,'NONEMPTY_DOMAIN_REQUIRED');
assert.equal(interpret('Mowa ami li wako.',[]).status,'undefined');
assert.equal(interpret('Somi ami li wako.',[]).truth,false);
assert.equal(interpret('No somi ami li wako.',[]).truth,true);
assert.equal(interpret('Mowa ami li wako.',[{id:'a',predicate:true},{id:'b',predicate:true},{id:'c',predicate:false},{id:'d',predicate:false}]).truth,false);
assert.equal(interpret('Mowa ami li wako.',[{id:'a',predicate:true},{id:'b',predicate:true},{id:'c',predicate:true},{id:'d',predicate:false}]).truth,true);
for(const [s,domain,id] of [
 ['Tawa ami li sule ta wako.',oneFalse,null],
 ['Tawa ami li sule ta wako.',oneFalse,'outsider'],
 ['Tawa ami li wako.',oneFalse,'ta']
])assert.throws(()=>interpret(s,domain,id));
const q=lex.entries.filter(x=>x.accepted_in==='0.16.0');
assert.equal(q.length,4);assert.equal(q.filter(e=>e.senses[0].part_of_speech==='quantifier').length,3);
assert.equal(q.filter(e=>e.senses[0].part_of_speech==='exclusion').length,1);
assert(rules.rules.some(x=>x.id==='SAMA-RULE/quantifiers'));
assert.equal(read('content/usage-examples.json').examples.length,2008);
console.log('✓ R03-09/R06-03: 40 discriminating truth-table pairs across four scope contrasts');
console.log('✓ 17 accepted + 15 rejected grammar examples; empty/nonempty domains, >half threshold and one exception checked');
console.log('✓ This tests defined formal meaning; no human comprehension or hearing study was conducted');
