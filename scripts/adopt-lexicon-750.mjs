/** R07-10 / ADR-0007 — deterministic adoption of 400 individually written source rows. */
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const write=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const version='0.14.0',decision='ADR-0007';
const lex=read('content/lexicon-v1.json');
const frames=read('content/verb-frames.json'),schema=read('content/schemas/lexeme.schema.json');
const release=read('content/standard-release.json');
assert(['0.13.0',version].includes(lex.version),'Unexpected source lexicon version');
const letters={a:'a',b:'b',d:'d',e:'e',h:'h',i:'i',k:'k',l:'l',m:'m',n:'n',o:'o',p:'p',s:'s',t:'t',u:'u',w:'w',y:'j'};
function ipa(form) {
 assert(/^(?:[bdhklmnpstwy]?[aeiou])+$/.test(form),'Invalid phonotactics '+form);
 const syllables=form.match(/[bdhklmnpstwy]?[aeiou]/g);
 return '/'+syllables.map((s,i)=>(syllables.length>1&&i===syllables.length-2?'ˈ':'')+[...s].map(c=>letters[c]).join('')).join('.')+'/';
}
const adopted=[],review=[];
for(let part=1;part<=10;part++){
 const path='content/editorial/lexicon-750-part'+String(part).padStart(2,'0')+'.tsv';
 const rows=readFileSync(path,'utf8').trim().split('\n');
 assert.equal(rows.length,40,'Expected 40 authored rows in '+path);
 for(const [index,line] of rows.entries()){
  const r=line.split('|'),special=part===10;
  assert.equal(r.length,special?9:7,'Invalid columns: '+path+':'+(index+1));
  const [form,part_of_speech,ru,en,dru,den,frameSpec,ex1,ex2]=special?r:[r[0],'noun',r[1],r[2],r[3],r[4],'',r[5],r[6]];
  assert(dru.length>=20&&den.length>=20,'Short definition '+form);
  const examples=[ex1,ex2].map(x=>{const parts=x.split('~');assert.equal(parts.length,2,'Example separator '+form);const [sama,ru]=parts;assert(sama&&ru&&sama.toLowerCase().match(/[a-z]+/g).includes(form),'Bad example '+form);return {sama,ru};});
  assert.notEqual(examples[0].sama,examples[1].sama);
  const sense={id:'SAMA-SENSE/'+form+'/1',part_of_speech,gloss:{ru,en},definition:{ru:dru,en:den},examples};
  if(part_of_speech==='verb'){
   const [kind,aspectClass,aspects]=frameSpec.split(':');
   assert(['transitive','intransitive'].includes(kind),'Verb frame kind '+form);
   assert(['state','activity','achievement','accomplishment'].includes(aspectClass),'Aspect class '+form);
   sense.frame={
    minimum_objects:kind==='transitive'?1:0,maximum_objects:kind==='transitive'?1:0,
    roles:kind==='transitive'?['agent_or_experiencer','theme']:['agent_or_experiencer'],
    required_adpositions:[],aspect_class:aspectClass,allowed_aspects:aspects?aspects.split(','):[]
   };
   const verbRow={form,sense_id:sense.id,...sense.frame};
   const old=frames.verbs.find(x=>x.form===form);
   if(old)assert.deepEqual(old,verbRow,'Changed verb frame '+form);else frames.verbs.push(verbRow);
  }else assert(['noun','adjective'].includes(part_of_speech),'Unexpected word class '+form);
  const entry={id:'SAMA-LEX/'+form,form,ipa:ipa(form),status:'core',accepted_in:version,decision,senses:[sense]};
  const current=lex.entries.find(x=>x.form===form);
  if(current)assert.deepEqual(current,entry,'Incompatible existing lexical entry '+form);else lex.entries.push(entry);
  adopted.push(form);
  review.push({form,part,row:index+1,part_of_speech,decision:'adopt',status:'accepted-internal',evidence:path+':'+(index+1),independent_review:false});
 }
}
assert.equal(adopted.length,400);assert.equal(new Set(adopted).size,400);
assert.equal(lex.entries.length,750,'Norm must contain 750 entries');
assert.equal(frames.verbs.length,62,'Expected 62 accepted verb frames');
const originals=lex.entries.filter(x=>x.accepted_in!==version);
assert.equal(originals.length,350,'Prior edition has 350 lexemes');
lex.version=version;lex.authority='ADR-0003 / ADR-0004 / ADR-0005 / ADR-0006 / ADR-0007';
frames.version=version;
release.version=version;release.accepted_lexemes=750;release.authority=lex.authority;
release.open_work[1]='Принято 750 полноценных статей; необходимо ещё 4250 до минимальной цели 5000. Следующий рубеж — 1500.';
schema.properties.version.const=version;
if(!schema.properties.entries.items.properties.accepted_in.enum.includes(version))
 schema.properties.entries.items.properties.accepted_in.enum.push(version);
if(!schema.properties.entries.items.properties.decision.enum.includes(decision))
 schema.properties.entries.items.properties.decision.enum.push(decision);
const examples=lex.entries.flatMap(e=>e.senses.flatMap(s=>s.examples.map((x,i)=>({id:s.id+'/example/'+(i+1),lexeme_id:e.id,sense_id:s.id,...x}))));
assert.equal(examples.length,1500);
write('content/lexicon-v1.json',lex);
write('content/verb-frames.json',frames);
write('content/standard-release.json',release);
write('content/schemas/lexeme.schema.json',schema);
write('content/usage-examples.json',{version,source:'content/lexicon-v1.json',examples});
write('reports/lexicon-750-provenance.json',{version,authority:decision,accepted_lexemes:400,review});
console.log('✓ R07-10: 750 adopted lexemes, 400 authored rows, 1500 examples and 62 verb frames');
