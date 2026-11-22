import {readFileSync} from 'node:fs';

// CF-001: deliberately bounded experimental profile, not a general SAMA parser.
const profile=JSON.parse(readFileSync(new URL('../content/rules/relative-pilot.json',import.meta.url),'utf8'));
const fail=code=>{throw new Error(code);};
export function parseRelative(text){
 if(typeof text!=='string'||!/^\s*[a-zA-Z]+(?:\s+[a-zA-Z]+)*\.\s*$/.test(text))fail('ORTHOGRAPHY');
 const tokens=text.trim().slice(0,-1).toLowerCase().split(/\s+/);
 if(tokens.filter(t=>t==='ye').length!==1||tokens.filter(t=>t==='ya').length!==1)fail('BOUNDARY');
 const open=tokens.indexOf('ye'),close=tokens.indexOf('ya');
 if(open!==1||close<=open||!profile.heads.includes(tokens[0]))fail('HEAD');
 if(tokens.slice(close+1).join(' ')!=='bi na doma')fail('MATRIX');
 const clause=tokens.slice(open+1,close);
 if(clause.includes('e'))fail('ARCHIVED_E');
 if(clause.filter(t=>t==='ta').length!==1)fail('BINDER_COUNT');
 let i=0;
 const subject=clause[i++];
 const tense=profile.tense.includes(clause[i])?clause[i++]:null;
 const negative=clause[i]==='no';if(negative)i++;
 const verb=clause[i++],object=clause[i++];
 if(i!==clause.length)fail('CLAUSE_SHAPE');
 if(!profile.arguments.includes(subject)||!profile.arguments.includes(object))fail('ARGUMENT');
 if(!profile.verbs.includes(verb))fail('VERB');
 const role=subject==='ta'?'subject':'object';
 return {type:'relative-sentence',profile:profile.id,status:profile.status,
  head:{id:'head-1',form:tokens[0]},relative:{start:open,end:close,
   subject:subject==='ta'?{ref:'head-1'}:{form:subject},verb,
   object:object==='ta'?{ref:'head-1'}:{form:object},tense,negative,boundRole:role},
  matrix:{subject:{ref:'head-1'},verb:'bi',location:'doma'}};
}
