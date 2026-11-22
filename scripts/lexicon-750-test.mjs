/** R07-10: verify 400 authored lexemes, phonology, contrastive frames, and release integrity. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const lex=read('content/lexicon-v1.json'),release=read('content/standard-release.json');
assert.equal(lex.version,'0.14.0');assert.equal(release.accepted_lexemes,750);
assert.equal(lex.entries.length,750);
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
assert.equal(forms.size,750);
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
const frames=read('content/verb-frames.json');assert.equal(frames.verbs.length,62);
for(const form of source.filter(x=>x.row[1]==='verb').map(x=>x.row[0]))assert(frames.verbs.some(x=>x.form===form));
for(const [text,code] of [
 ['Mi helisa yu.','UNEXPECTED_OBJECT'],
 ['Mi seliwa.','MISSING_OBJECT'],
 ['Mi te ponila yu.','ASPECT_COMPATIBILITY'],
 ['Mi hu dawila soma.','ASPECT_COMPATIBILITY'],
 ['Mi si mulata soma.','MISSING_OBJECT']
]){const result=parse(text);assert(!result.ok,text);assert.equal(result.error.code,code,text);}
for(const sentence of ['Mi hu helisa.','Mi te dawila soma.','Soma bi kamaliya.','Mi si soma mulata.'])assert(parse(sentence).ok,sentence);
const examplesIndex=read('content/usage-examples.json');assert.equal(examplesIndex.version,'0.14.0');assert.equal(examplesIndex.examples.length,1500);
const prov=read('reports/lexicon-750-provenance.json');assert.equal(prov.review.length,400);assert(prov.review.every(x=>x.decision==='adopt'&&x.independent_review===false));
console.log('✓ R07-10: 400 authored lexical decisions, 800 parsed example sentences, 25 new verb frames and 15 qualities');
console.log('✓ R07-17/G7 partial: 750 adopted lexemes, 62 total verbs and 1500 indexed examples; no human-study claim');
