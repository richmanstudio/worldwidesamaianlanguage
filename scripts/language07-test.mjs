import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(p)=>JSON.parse(readFileSync(p,'utf8'));
const lab=read('content/language-0.7.json');
const bank=read('content/benchmark-0.7.json');
const lex=read('content/lexicon.json');
const core=new Set(lex.filter(x=>x.status==='core').map(x=>x.w));
assert.equal(bank.items.length,1000,'1000 synthetic semantic frames are required');
assert.equal(bank.reviewed_count,0,'Do not silently reclassify synthetic items as independently reviewed');
assert.equal(lab.metrics.curated,lab.curated.length);
assert.equal(lab.metrics.contrasts,lab.contrasts.length);
assert.equal(lab.metrics.negative,lab.invalid.length);
assert.equal(lab.metrics.rules,lab.rules.length);
const allowedSubjects=new Set(['mi','yu','ta','mi li','yu li','ta li','doma','pana','su','kawa','duniya','basa']);
const objects=new Set(['ami','mama','baba','doma','pana','kawa']);
const qualities=new Set(['bona','malo','mini','daba','nawa']);
const identities=new Set(['ami','mama','baba']);
function parse(s){
 let text=s.trim().toLowerCase();
 const punctuation=text.endsWith('?')?'?':text.endsWith('.')?'.':null;
 if(!punctuation)return null;
 let words=text.slice(0,-1).split(' ');
 const interrogative=punctuation==='?';
 const isKa=words.at(-1)==='ka';
 if(interrogative!==isKa)return null;
 if(isKa)words.pop();
 let subject=words.shift();
 if(['mi','yu','ta'].includes(subject)&&words[0]==='li'){subject+=' li';words.shift();}
 if(!allowedSubjects.has(subject))return null;
 const tense=(words[0]==='pa'||words[0]==='la')?words.shift():'neutral';
 const negated=words[0]==='no';if(negated)words.shift();
 const predicate=words.shift();
 let construction;
 if(predicate==='si'||predicate==='ama'){
  construction='svo';if(!objects.has(words[0])||words.length!==1)return null;
 } else if(predicate==='pina'||predicate==='kula'){
  construction='consumption';const good=predicate==='pina'?['su','kawa']:['pana'];
  if(!good.includes(words[0])||words.length!==1)return null;
 } else if(predicate==='bi'){
  if(words[0]==='na'){
   words.shift();construction='location';if(words.length!==1||words[0]!=='doma')return null;
  }else if(qualities.has(words[0])){
   construction='quality';if(words.length!==1||['mi','yu','ta','mi li','yu li','ta li'].includes(subject))return null;
  }else if(identities.has(words[0])){
   construction='identity';if(words.length!==1||!['mi','yu','ta','mi li','yu li','ta li'].includes(subject))return null;
  }else return null;
 }else return null;
 return {construction,subject,tense,negated,predicate,complement:words[0],interrogative};
}
const seen=new Set();const counted={};
for(const item of bank.items){
 assert(!seen.has(item.sama),'Duplicate generated sentence '+item.sama);seen.add(item.sama);
 assert(item.sama.endsWith(item.frame.interrogative?'?':'.'),'Punctuation mismatch');
 const parsed=parse(item.sama);
 assert.deepEqual(parsed,item.frame,'Round-trip grammar frame failed '+item.sama);
 counted[item.frame.construction]=(counted[item.frame.construction]||0)+1;
 assert(item.independently_translated===false,'Synthetic examples must be labelled honestly');
 for(const token of item.sama.toLowerCase().match(/[a-z]+/g)||[]) assert(core.has(token),'Unknown/non-core token '+token);
}
assert.deepEqual(counted,bank.groups,'Generated structure quotas changed');
for(const item of lab.curated){for(const token of item.sama.toLowerCase().match(/[a-z]+/g)||[])assert(core.has(token),'Unknown curated word '+token+' in '+item.id);}
for(const ex of lab.invalid)assert.equal(parse(ex.sama),null,'Expected rejection '+ex.sama);
for(const pair of lab.contrasts){assert.notEqual(pair.a,pair.b,'Minimal contrast duplicates itself');}
console.log('✓ SAMA 0.7: 1000 generated structural frames; 1000 independent round-trip checks');
console.log('✓ SAMA 0.7: '+lab.curated.length+' editor-drafted translations; '+lab.invalid.length+' negative cases; '+lab.contrasts.length+' contrast pairs');
console.log('✓ Core vocabulary only, no proposal promoted, no synthetic claim of natural-language validation');

