import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import Ajv from 'ajv';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const lex=read('content/lexicon-v1.json'),rules=read('content/rules/core.json'),release=read('content/standard-release.json');
const ajv=new Ajv({allErrors:true});
for(const [path,value] of [['content/schemas/lexeme.schema.json',lex],['content/schemas/rules.schema.json',rules]]){
 const validate=ajv.compile(read(path));assert(validate(value),JSON.stringify(validate.errors));
}
const context=vm.createContext({});
for(const path of ['src/linguistics/phonology.ts','src/linguistics/parser.ts'])vm.runInContext(ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText,context);
const parse=text=>context.parseSamaFoundation(text,lex.entries);
const forms=new Set(),ids=new Set(),senseIds=new Set();
let examples=0;
for(const entry of lex.entries){
 assert(!forms.has(entry.form));forms.add(entry.form);assert(!ids.has(entry.id));ids.add(entry.id);
 assert.equal(context.samaWordIPA(entry.form),entry.ipa);
 for(const sense of entry.senses){
  assert(!senseIds.has(sense.id));senseIds.add(sense.id);
  for(const example of sense.examples){const result=parse(example.sama);assert(result.ok,entry.form+': '+example.sama+' '+JSON.stringify(result));examples++;}
 }
}
for(const rule of rules.rules){
 assert(!ids.has(rule.id));ids.add(rule.id);
 assert.equal(rule.revision,rule.id+'@'+rules.version);
 if(['alphabet','syllables','orthography'].includes(rule.id.split('/')[1]))continue;
 for(const example of rule.examples){const result=parse(example.sama);assert(result.ok,rule.id+': '+JSON.stringify(result));}
}
assert.equal(release.rules,rules.rules.length);assert.equal(release.accepted_lexemes,lex.entries.length);
assert.equal(release.target_lexemes,5000);assert.equal(release.complete_1_0,false);
assert.equal(release.independent_human_studies,0);
for(const entry of read('content/lexicon.json').filter(x=>x.status==='core'))assert(forms.has(entry.w),'Missing historical core review '+entry.w);
const negatives=[
 ['Mi si.','MISSING_OBJECT'],['Mi wako yu.','UNEXPECTED_OBJECT'],['Mi pako kaso.','RECIPIENT'],
 ['Mi pako kaso to yu to mama.','RECIPIENT'],['Mi pa la si yu.','EXPECTED_VERB'],
 ['Mi no kama no wako.','DOUBLE_NEGATION'],['Mi kama su.','EXPECTED_VERB'],
 ['Mi hu ama yu.','ASPECT_COMPATIBILITY'],['Mi te si yu.','ASPECT_COMPATIBILITY'],
 ['Mi si dua kaso li.','NUMBER_AND_LI'],['Mi bi bona ka.','QUESTION_PUNCTUATION'],
 ['Yu si ki ka?','QUESTION_MARKERS'],['Yu si ki.','QUESTION_PUNCTUATION'],
 ['Mi si ami ye mi si ya.','MISSING_OBJECT'],['Ami ye ta si ta ya bi bona.','RELATIVE_BINDING'],
 ['Ami ye mi si yu ya bi bona.','RELATIVE_BINDING'],['Mi si ami de mama de yu.','POSSESSION_CHAIN'],
 ['Mi bona si yu.','PRONOUN_QUALITY'],['Mi si ami wa yu o mama.','MIXED_COORDINATION'],
 ['Mi si unknown.','UNKNOWN_WORD'],['Mi si yu','PUNCTUATION']
];
for(const [text,code] of negatives){const result=parse(text);assert.equal(result.ok,false,text);assert.equal(result.error.code,code,text+': '+JSON.stringify(result));}
// Exhaustive integer spelling, sampled across larger decimal boundaries.
for(let n=0;n<=1000;n++)assert.equal(context.samaReadInteger(context.samaSpellInteger(n)),n);
for(const n of [1001,1010,2345,10000,99999,100000,999999])assert.equal(context.samaReadInteger(context.samaSpellInteger(n)),n);
for(const text of ['una una','nula sena','tena sena','dua tena tena','mila mila'])assert.throws(()=>context.samaReadInteger(text.split(' ')));
// 120 positive and 120 negative NP contexts with role-preserving AST checks.
let npCases=0;
for(const demonstrative of ['','ena ','ona '])for(const count of ['','dua '])for(const noun of ['ami','soma','kaso','doma','kopa'])for(const quality of ['',' bona'])for(const possessor of ['',' de mi']){
 const text=`Mi si ${demonstrative}${count}${noun}${quality}${possessor}.`,result=parse(text);
 assert(result.ok,text+JSON.stringify(result));assert.equal(result.ast.clauses[0].object.head,noun);
 const bad=text.replace('si ','si li ');assert.equal(parse(bad).ok,false,bad);npCases++;
}
const a=parse('Mi no musa wako.').ast.clauses[0],b=parse('Mi musa no wako.').ast.clauses[0];
assert(a.outerNegation&&!a.innerNegation);assert(!b.outerNegation&&b.innerNegation);
const s=parse('Ami ye ta si mi ya bi bona.').ast.clauses[0].subject.relative;
const o=parse('Ami ye mi si ta ya bi bona.').ast.clauses[0].subject.relative;
assert.equal(s.boundRole,'subject');assert.equal(o.boundRole,'object');
for(const invalid of ['b','strama','sam','samma','sama-','rain'])assert.throws(()=>context.samaWordIPA(invalid));
assert.equal(context.samaWordIPA('sama'),'/ˈsa.ma/');assert.equal(context.samaWordIPA('dua'),'/ˈdu.a/');
assert.equal(context.samaWordIPA('sama-doma'),'/ˌsa.ma‿ˈdo.ma/');
// Schemas reject unadopted rows and missing verb frames.
const validateLex=ajv.getSchema('content/schemas/lexeme.schema.json')||ajv.compile(read('content/schemas/lexeme.schema.json'));
const wrong=structuredClone(lex);wrong.entries[0].status='candidate';assert.equal(validateLex(wrong),false);
const missing=structuredClone(lex);delete missing.entries.find(x=>x.senses[0].part_of_speech==='verb').senses[0].frame;assert.equal(validateLex(missing),false);
console.log(`✓ Adopted standard: ${rules.rules.length} rules, ${lex.entries.length} individually defined lexemes, ${examples} parsed lexical examples`);
console.log(`✓ ${npCases} positive/negative NP pairs, ${negatives.length} semantic/structural rejection cases, 1008 integer round-trips`);
console.log('✓ Pronunciation, lexical frames, schema rejection and scope/relative-role contrasts checked; no human-study claim');

const lessons=read('content/learning/lessons-v1.json'),reader=read('content/learning/reader-v1.json');
const taught=new Set();let learningSamples=0;
for(const lesson of lessons.lessons){
 for(const id of lesson.rules){assert(rules.rules.some(x=>x.id===id));taught.add(id);}
 for(const sample of [...lesson.examples,{sama:lesson.exercise.answer}]){assert(parse(sample.sama).ok,lesson.title+' '+sample.sama);learningSamples++;}
}
for(const text of reader.texts)for(const sample of text.sentences){assert(parse(sample.sama).ok,sample.sama);learningSamples++;}
assert.equal(taught.size,rules.rules.length);assert.equal(lessons.lessons.length,12);
console.log('✓ Learning: 12 lessons cover all adopted rule IDs; '+learningSamples+' course/reader sentences checked');

// Lexical role restrictions apply to se; a modal may select a copular VP.
for(const text of ['Mi wako ko se.','Mi si ami de se.','Mi wa se si yu.'])assert.equal(parse(text).ok,false,text);
assert(parse('Mi kama bi na doma.').ok);assert(parse('Mi musa bi sili.').ok);
console.log('✓ Copular modal complements accepted; reflexive PP, possessor and subject misuse rejected');
