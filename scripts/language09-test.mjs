import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const report=read('content/language-0.9.json');
const entries=read('content/lexicon.json');
const dictionary=new Map(entries.map(x=>[x.w,x.status]));
const newForms=new Set(report.morphemes.map(x=>x.form));
const alphabet=/^[abdehiklmnopstuwy]+$/;
assert.equal(report.version,'0.9-draft');
assert.equal(report.external_validation,false);
assert.equal(report.independent_reviewers,0);
assert.equal(report.lexicon_published_count_unchanged,true);
assert.equal(report.rules.length,20);
assert.equal(report.morphemes.length,5);
assert.equal(report.valencies.length,12);
assert.equal(report.contrasts.length,20);
assert.equal(report.blocked.length,12);
assert.equal(report.invalid.length,16);
assert.deepEqual(report.metrics,{rules:20,morphemes:5,valencies:12,contrast_pairs:20,blocked:12,invalid:16});
const cited=new Set();
for(const morpheme of report.morphemes) {
 assert(alphabet.test(morpheme.form),'Unpronounceable morpheme '+morpheme.form);
 assert(!dictionary.has(morpheme.form),'New morpheme collides '+morpheme.form);
 assert.equal(morpheme.status,'experimental');
 assert.equal(morpheme.lexicon_released,false);
 assert.equal(morpheme.validated_on_speakers,false);
 assert(morpheme.meaning.length>15&&morpheme.restriction.length>25);
 assert(!cited.has(morpheme.form));cited.add(morpheme.form);
}
for(const rule of report.rules){
 assert(/^09-\d{2}$/.test(rule.id));
 assert(rule.pattern&&rule.meaning&&rule.restriction.length>25);
 assert.equal(rule.status,'experimental');
 for(const word of rule.example.toLowerCase().match(/[a-z]+/g)||[])assert(dictionary.has(word)||newForms.has(word),'Unknown in grammar '+rule.id+': '+word);
}
for(const frame of report.valencies){
 assert(dictionary.has(frame.word),'Untracked verb '+frame.word);
 assert.equal(dictionary.get(frame.word),frame.lexicon_status);
 assert(frame.roles.length>15&&frame.note.length>20);
}
const modalities=new Set(['mosa','kama','musa']);
const activity=new Set(['pina','kula','lita','toka']);
const bounded=new Set(['pina','kula','lita']);
const subjects=new Set(['mi','yu','ta','mi li','yu li','ta li','su','kaso']);
const complements={pina:new Set(['su','kawa']),kula:new Set(['pana']),lita:new Set(['kaso']),
 toka:new Set([]),si:new Set(['mi','yu','ta','ami']),ama:new Set(['mi','yu','ta','ami']),
 bi:new Set(['malo','bona','nawa','daba'])};
function parseClause(s){
 const words=s.toLowerCase().trim().split(/\s+/).filter(Boolean);
 let subject=words.shift();
 if(['mi','yu','ta'].includes(subject)&&words[0]==='li')subject+=' '+words.shift();
 if(!subjects.has(subject))return null;
 const tense=['pa','la'].includes(words[0])?words.shift():'unmarked';
 const outerNo=words[0]==='no'?!!words.shift():false;
 const modal=modalities.has(words[0])?words.shift():null;
 const innerNo=modal&&words[0]==='no'?!!words.shift():false;
 if(outerNo&&innerNo)return null; // intentionally restricted pilot, not a global linguistic ban
 const aspect=['hu','te'].includes(words[0])?words.shift():null;
 const verb=words.shift();
 if(!Object.hasOwn(complements,verb))return null;
 if(aspect==='hu'&&!activity.has(verb))return null;
 if(aspect==='te'&&!bounded.has(verb))return null;
 const choices=complements[verb];
 if(verb==='toka'){if(words.length!==0)return null;}
 else if(words.length!==1||!choices.has(words[0]))return null;
 if(modal&&!['mi','yu','ta','mi li','yu li','ta li'].includes(subject))return null;
 return {kind:'clause',subject,tense,outerNo,modal,innerNo:Boolean(innerNo),aspect,verb,object:words[0]??null};
}
function parse(text){
 if(!/^[^.?!]+[.?!]$/.test(text))return null;
 const question=text.endsWith('?');let s=text.slice(0,-1).trim();
 const hasKa=s.endsWith(' ka');if(question!==hasKa)return null;
 if(hasKa)s=s.slice(0,-3);
 if(s.includes(',')){
  const match=s.match(/^(.+), (kisa|saka) (.+)$/i);
  if(!match)return null;
  const lhs=parseClause(match[1]),rhs=parseClause(match[3]);
  if(!lhs||!rhs)return null;
  return {kind:'causal',connector:match[2].toLowerCase(),lhs,rhs,question};
 }
 const clause=parseClause(s);
 return clause?{...clause,question}:null;
}
const allPairs=new Set();
for(const pair of report.contrasts){
 assert(/^C\d{2}$/.test(pair.id)); assert(!allPairs.has(pair.id)); allPairs.add(pair.id);
 assert.equal(pair.status,'experimental');assert.equal(pair.independently_checked,false);
 const a=parse(pair.left.sama),b=parse(pair.right.sama);
 assert(a,'Invalid example '+pair.id+' left: '+pair.left.sama);
 assert(b,'Invalid example '+pair.id+' right: '+pair.right.sama);
 assert.notDeepEqual(a,b,'Contrast has identical semantic frame '+pair.id);
 assert(pair.distinction.length>20);
 for(const side of [pair.left,pair.right]){
  assert(side.ru.length>=10);
  for(const word of side.sama.toLowerCase().match(/[a-z]+/g)||[])
   assert(dictionary.has(word)||newForms.has(word),'Unknown form '+word+' in '+pair.id);
 }
}
for(const blocked of report.blocked){
 assert.equal(blocked.status,'blocked');assert.equal(blocked.sama,null);
 assert(blocked.reason.length>30);assert(blocked.needed.includes('not invent'));
}
for(const neg of report.invalid){
 assert.equal(neg.expected,'reject');assert.equal(parse(neg.sama),null,'Accepted invalid form '+neg.id+' '+neg.sama);
}
const absence=report.contrasts.find(p=>p.left.sama==='Mi no musa pina su.');
assert(absence&&absence.right.sama==='Mi musa no pina su.','Missing deontic polarity test');
assert(parse(absence.left.sama).outerNo===true&&parse(absence.right.sama).innerNo===true);
const reason=report.contrasts.find(p=>p.left.sama==='Mi no pina su, kisa su bi malo.');
assert(reason&&parse(reason.left.sama).connector==='kisa'&&parse(reason.right.sama).connector==='saka');
const web=read('dist/assets/language-0.9.json');
assert.equal(web.version,'0.9-draft','Production bundle missing new laboratory');
console.log('✓ SAMA 0.9: 20 contrast pairs parsed, 16 invalid forms rejected');
console.log('✓ SAMA 0.9: five quarantined morphemes, 12 valency descriptions, 12 blocked prompts');
console.log('✓ Scope for negation and causation differentiated; no false independent-review claims');
