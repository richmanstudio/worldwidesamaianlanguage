/** ADR-0008 / R07-11. Deterministic, idempotent adoption of 250 individually authored rows. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const write=(p,obj)=>writeFileSync(p,JSON.stringify(obj,null,2)+'\n');
const version='0.15.0',decision='ADR-0008';
const lex=read('content/lexicon-v1.json'),frames=read('content/verb-frames.json');
const release=read('content/standard-release.json'),schema=read('content/schemas/lexeme.schema.json');
assert(['0.14.0',version].includes(lex.version),'Incorrect starting release');
assert([750,1000].includes(lex.entries.length));
const letters={a:'a',b:'b',d:'d',e:'e',h:'h',i:'i',k:'k',l:'l',m:'m',n:'n',o:'o',p:'p',s:'s',t:'t',u:'u',w:'w',y:'j'};
function ipa(form){
 assert(/^(?:[bdhklmnpstwy]?[aeiou])+$/.test(form),'Invalid phonotactic form '+form);
 const syllables=form.match(/[bdhklmnpstwy]?[aeiou]/g);
 return '/'+syllables.map((s,i)=>(syllables.length>1&&i===syllables.length-2?'ˈ':'')+[...s].map(c=>letters[c]).join('')).join('.')+'/';
}
const adopted=[],review=[];
for(let part=1;part<=10;part++){
 const path='content/editorial/lexicon-1000-part'+String(part).padStart(2,'0')+'.tsv';
 const rows=readFileSync(path,'utf8').trim().split('\n');
 assert.equal(rows.length,25,'Expected 25 individually authored rows in '+path);
 for(const [j,line] of rows.entries()){
  const c=line.split('|'),typed=part<=4;
  assert.equal(c.length,typed?9:7,'Invalid row width '+path+':'+(j+1));
  const [form,pos,ru,en,dru,den,frameSpec,ex1,ex2]=typed?c:[c[0],'noun',c[1],c[2],c[3],c[4],'',c[5],c[6]];
  assert(dru.length>=20&&den.length>=20,'Incomplete definition '+form);
  const examples=[ex1,ex2].map(s=>{const pair=s.split('~');assert.equal(pair.length,2,'Example separator '+form);
    const [sama,ru]=pair;assert(sama&&ru,'Missing example translation '+form);
    assert(sama.toLowerCase().match(/[a-z]+/g).includes(form),'Example lacks headword '+form);
    return {sama,ru};});
  assert.notEqual(examples[0].sama,examples[1].sama,'Duplicate example '+form);
  const sense={id:'SAMA-SENSE/'+form+'/1',part_of_speech:pos,gloss:{ru,en},definition:{ru:dru,en:den},examples};
  if(pos==='verb'){
    const [mode,aspect_class,aspects]=frameSpec.split(':');
    assert(['transitive','intransitive'].includes(mode),'Bad valency '+form);
    assert(['state','activity','achievement','accomplishment'].includes(aspect_class),'Bad aspect '+form);
    sense.frame={
      minimum_objects:mode==='transitive'?1:0,maximum_objects:mode==='transitive'?1:0,
      roles:mode==='transitive'?['agent_or_experiencer','theme']:['agent_or_experiencer'],
      required_adpositions:[],aspect_class,allowed_aspects:aspects?aspects.split(','):[]
    };
    const row={form,sense_id:sense.id,...sense.frame};
    const old=frames.verbs.find(x=>x.form===form);
    if(old)assert.deepEqual(old,row,'Verb frame changed '+form);else frames.verbs.push(row);
  }else assert(['noun','adjective'].includes(pos),'Unsupported class '+form);
  const entry={id:'SAMA-LEX/'+form,form,ipa:ipa(form),status:'core',accepted_in:version,decision,senses:[sense]};
  const prior=lex.entries.find(x=>x.form===form);
  if(prior)assert.deepEqual(prior,entry,'Collision or revised earlier meaning '+form);
  else lex.entries.push(entry);
  review.push({form,part,row:j+1,part_of_speech:pos,decision:'adopt',status:'accepted-internal',
    evidence:path+':'+(j+1),independent_review:false});
  adopted.push(form);
 }
}
assert.equal(adopted.length,250);assert.equal(new Set(adopted).size,250);
assert.equal(lex.entries.length,1000);assert.equal(frames.verbs.length,112);
assert.equal(lex.entries.filter(x=>x.accepted_in!=='0.15.0').length,750);
lex.version=version;
lex.authority='ADR-0003 / ADR-0004 / ADR-0005 / ADR-0006 / ADR-0007 / ADR-0008';
frames.version=version;release.version=version;release.accepted_lexemes=1000;release.authority=lex.authority;
release.open_work[1]='1000 редакционно принятых статей; 500 до рубежа 1500 и 4000 до целевого минимума 5000.';
schema.properties.version.const=version;
for(const [field,value] of [['accepted_in',version],['decision',decision]]){
  const arr=schema.properties.entries.items.properties[field].enum;
  if(!arr.includes(value))arr.push(value);
}
const examples=lex.entries.flatMap(e=>e.senses.flatMap(s=>s.examples.map((x,i)=>({
 id:s.id+'/example/'+(i+1),lexeme_id:e.id,sense_id:s.id,...x
}))));
assert.equal(examples.length,2000);
write('content/lexicon-v1.json',lex);
write('content/verb-frames.json',frames);
write('content/standard-release.json',release);
write('content/schemas/lexeme.schema.json',schema);
write('content/usage-examples.json',{version,source:'content/lexicon-v1.json',examples});
write('reports/lexicon-1000-provenance.json',{version,authority:decision,accepted_lexemes:250,review});
console.log('✓ R07-11: 250 authored senses adopted, 1000 total, 112 verb frames, 2000 example references');
