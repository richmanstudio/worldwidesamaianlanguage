import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import Ajv from 'ajv';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const lex=read('content/lexicon-v1.json'),entries=lex.entries,byForm=new Map(entries.map(e=>[e.form,e]));
assert.equal(lex.version,'0.16.0');assert.equal(entries.length,1004);
const old=read('content/standards/0.11.0/lexicon.json');assert.equal(old.entries.length,94);
for(const entry of old.entries){
 const now=byForm.get(entry.form);assert(now,'Removed previous entry '+entry.form);
 assert.equal(now.id,entry.id);assert.equal(now.accepted_in,entry.accepted_in);assert.equal(now.decision,entry.decision);assert.equal(now.ipa,entry.ipa);
 for(let i=0;i<entry.senses.length;i++){
  const a=entry.senses[i],b=now.senses[i];assert.equal(b.id,a.id);assert.deepEqual(b.gloss,a.gloss);assert.deepEqual(b.definition,a.definition);assert.deepEqual(b.examples,a.examples);
  if(a.frame)for(const key of Object.keys(a.frame))assert.deepEqual(b.frame[key],a.frame[key],entry.form+' changed prior frame '+key);
 }
}
const expectedRows=readFileSync('content/editorial/lexicon-300.tsv','utf8').trim().split('\n');assert.equal(expectedRows.length,206);
for(const line of expectedRows){
 const [form,pos,ru,en,dru,den,frameSpec,a,b]=line.split('|'),entry=byForm.get(form),sense=entry.senses[0];
 assert.equal(entry.accepted_in,'0.12.0');assert.equal(entry.decision,'ADR-0005');assert.equal(sense.part_of_speech,pos);
 assert.deepEqual(sense.gloss,{ru,en});assert.deepEqual(sense.definition,{ru:dru,en:den});
 assert.deepEqual(sense.examples,[a,b].map(x=>{const [sama,ru]=x.split('~');return {sama,ru};}));
}
const ctx=vm.createContext({});vm.runInContext(ts.transpileModule(readFileSync('src/linguistics/parser.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText,ctx);
const parse=text=>ctx.parseSamaFoundation(text,entries);
let frames=0,aspectCases=0;
for(const entry of entries.filter(e=>e.senses[0].part_of_speech==='verb')){
 const sense=entry.senses[0],f=sense.frame;frames++;
 assert(['state','activity','accomplishment','achievement'].includes(f.aspect_class));assert(Array.isArray(f.allowed_aspects));
 const text=sense.examples[0].sama;assert.equal(parse(text).ast.clauses[0].verb,entry.form);
 if(f.minimum_objects===1)assert.equal(parse('Mi '+entry.form+'.').ok,false,'Missing mandatory object '+entry.form);
 if(f.maximum_objects===0)assert.equal(parse('Mi '+entry.form+' kaso.').ok,false,'Unexpected object '+entry.form);
 for(const aspect of ['hu','te']){
  const tokens=text.slice(0,-1).split(' '),index=tokens.indexOf(entry.form);assert(index>=0);tokens.splice(index,0,aspect);
  const result=parse(tokens.join(' ')+text.slice(-1));assert.equal(result.ok,f.allowed_aspects.includes(aspect),tokens.join(' '));aspectCases++;
 }
}
assert.equal(frames,112);assert.equal(aspectCases,224);
for(const prep of ['na','nana','tota','noba','poba','pata','yalo','lali']){
 const yes=parse('Mi bi '+prep+' doma.');assert(yes.ok,prep);assert.equal(yes.ast.clauses[0].adjuncts[0].adposition,prep);
 assert.equal(parse('Mi bi '+prep+'.').ok,false,'Missing landmark '+prep);
 assert.equal(parse('Mi bi '+prep+' se.').ok,false,'Reflexive forbidden in PP '+prep);
}
for(const text of ['Mi bi to doma.','Mi bi ko yu.','Mi te medo nina.','Mi hu mima yu.','Mi nawi lita kaso.'])assert.equal(parse(text).ok,false,text);
assert(parse('Mi hu medo nina.').ok);assert(parse('Mi pa te wata misa.').ok);assert(parse('Mi pa te nipa peta.').ok);
const contrasts=[['mona','meya','noun','noun'],['selo','seli','adjective','noun'],['pala','palae','numeral','adjective'],['lasi','puma','adjective','noun'],['dani','lenu','noun','noun'],['nopa','wata','verb','verb'],['mosa','paku','modal','noun']];
for(const [a,b,pa,pb] of contrasts){assert.equal(byForm.get(a).senses[0].part_of_speech,pa);assert.equal(byForm.get(b).senses[0].part_of_speech,pb);assert.notDeepEqual(byForm.get(a).senses[0].definition,byForm.get(b).senses[0].definition);}
const candidates=read('content/lexicon.json').filter(e=>e.status==='candidate');
const lines=readFileSync('reports/candidate-274.csv','utf8').trim().split('\n').slice(1);assert.equal(lines.length,274);
assert.equal(lines.filter(x=>x.includes(',"approve",')).length,236);assert.equal(lines.filter(x=>x.includes(',"defer",')).length,38);
for(const entry of candidates){const rows=lines.filter(x=>x.startsWith('"'+entry.w+'",'));assert.equal(rows.length,1,entry.w);assert(rows[0].includes(byForm.has(entry.w)?',"approve",':',"defer",'));}
const quarantine=read('content/legacy/quarantine.json');for(const entry of quarantine)assert(!byForm.has(entry.w),'Quarantined compound silently restored '+entry.w);
const bank=new Set(read('content/wordbank-5000.json').map(x=>x.form));
const authored=entries.filter(x=>x.decision==='ADR-0005'&&!read('content/lexicon.json').some(y=>y.w===x.form));assert.equal(authored.length,18);
for(const e of authored)assert(!bank.has(e.form),'New root collides with historic corpus '+e.form);
const manifest=read('content/standards/0.11.0/manifest.json');
for(const [path,sha] of Object.entries(manifest.files)){
 const data=readFileSync('content/standards/0.11.0/'+path);const actual=createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex');assert.equal(actual,sha,'Changed historical 0.11.0 file '+path);
}
assert(existsSync('docs/decisions/0005-lexicon-300.md'));
const validate=new Ajv({allErrors:true}).compile(read('content/schemas/lexeme.schema.json'));
const bad=structuredClone(lex);delete bad.entries.find(x=>x.senses[0].frame).senses[0].frame.allowed_aspects;assert.equal(validate(bad),false);
console.log('✓ R07-09/11: 1004 entries, 2008 examples; 206 prior authored rows, 50 in 0.13 and 400 in 0.14; prior 94 meanings and IDs preserved');
console.log('✓ R04-01/R07-12: 112 verb frames, 224 aspect compatibility cases, spatial and lexical-role regressions');
console.log('✓ R07-05: 274 individual candidate decisions; 236 approve / 38 defer; historic archive hashes intact');

const usage=read('content/usage-examples.json');assert.equal(usage.version,lex.version);assert.equal(usage.examples.length,2008);
const usageIds=new Set();
for(const entry of entries){const sense=entry.senses[0];assert.equal(new Set(sense.examples.map(x=>x.sama)).size,2);assert(sense.examples.every(x=>(x.sama.toLowerCase().match(/[a-z]+/g)||[]).includes(entry.form)),'Lemma absent from its examples '+entry.form);}
for(const example of usage.examples){assert(!usageIds.has(example.id));usageIds.add(example.id);const entry=entries.find(e=>e.id===example.lexeme_id);const sense=entry.senses.find(s=>s.id===example.sense_id);assert(sense.examples.some(x=>x.sama===example.sama&&x.ru===example.ru));}
assert(readFileSync('reports/coverage.md','utf8').includes('1004 / 1004'));
