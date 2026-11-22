/** Reproducible application of the individually authored ADR-0005 decisions. No word generation. */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const put=(p,v)=>writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const version='0.12.0',lex=read('content/lexicon-v1.json');
const context=vm.createContext({});vm.runInContext(ts.transpileModule(readFileSync('src/linguistics/phonology.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText,context);
const archive='content/standards/0.11.0';mkdirSync(archive,{recursive:true});
if(lex.version==='0.11.0'){
 for(const [source,target] of [['content/lexicon-v1.json','lexicon.json'],['content/rules/core.json','core.json'],['content/standard-release.json','release.json'],['content/schemas/lexeme.schema.json','lexeme.schema.json'],['content/schemas/rules.schema.json','rules.schema.json']]){
  assert(!existsSync(archive+'/'+target),'Never overwrite archived 0.11.0');writeFileSync(archive+'/'+target,readFileSync(source));
 }
}else assert.equal(lex.version,version);
const frame=(kind,aspect_class,aspects)=>({
 minimum_objects:kind==='transitive'||kind==='ditransitive'?1:0,
 maximum_objects:kind==='intransitive'?0:1,
 roles:kind==='ditransitive'?['agent','theme','recipient']:kind==='intransitive'?['agent_or_experiencer']:['agent_or_experiencer','theme'],
 required_adpositions:kind==='ditransitive'?['to']:[],aspect_class,allowed_aspects:aspects?aspects.split(','):[]
});
const originalAspects={si:['state',''],ama:['state',''],pina:['accomplishment','hu,te'],kula:['accomplishment','hu,te'],lena:['activity','hu'],lita:['accomplishment','hu,te'],wima:['accomplishment','hu,te'],wako:['activity','hu'],lako:['state',''],toka:['activity','hu'],tako:['achievement','te'],pako:['achievement','te'],nima:['state',''],misi:['activity','']};
for(const entry of lex.entries)for(const sense of entry.senses)if(sense.frame&&originalAspects[entry.form]){
 const [aspect_class,aspects]=originalAspects[entry.form];sense.frame.aspect_class=aspect_class;sense.frame.allowed_aspects=aspects?aspects.split(','):[];
}
const additions=[];
for(const [index,line] of readFileSync('content/editorial/lexicon-300.tsv','utf8').trim().split('\n').entries()){
 const cells=line.split('|');assert.equal(cells.length,9,'Bad editorial row '+(index+1));
 const [form,part_of_speech,ru,en,dru,den,frameSpec,a,b]=cells;
 const examples=[a,b].map(x=>{const [sama,ru]=x.split('~');assert(sama&&ru);return {sama,ru};});
 const sense={id:'SAMA-SENSE/'+form+'/1',part_of_speech,gloss:{ru,en},definition:{ru:dru,en:den},examples};
 if(part_of_speech==='verb'){const [kind,aspectClass,aspects]=frameSpec.split(':');assert(['transitive','intransitive','optional_object'].includes(kind));sense.frame=frame(kind,aspectClass,aspects);}
 const entry={id:'SAMA-LEX/'+form,form,ipa:context.samaWordIPA(form),status:'core',accepted_in:version,decision:'ADR-0005',senses:[sense]};
 const existing=lex.entries.find(x=>x.form===form);
 if(existing)assert.deepEqual(existing,entry,'Adoption conflicts with a previous entry: '+form);else lex.entries.push(entry);
 additions.push(entry);
}
assert.equal(additions.length,206);assert.equal(lex.entries.length,300);assert.equal(new Set(lex.entries.map(x=>x.form)).size,300);
lex.version=version;lex.authority='ADR-0003 / ADR-0004 / ADR-0005';put('content/lexicon-v1.json',lex);
const core=read('content/rules/core.json');core.version=version;
for(const rule of core.rules){rule.revision=rule.id+'@'+version;
 if(rule.id==='SAMA-RULE/valency'){rule.decision='ADR-0005';rule.text='Число обязательных и допустимых участников задаёт рамка каждого словарного значения. Переходный глагол требует один прямой объект, непереходный его исключает, optional_object допускает отсутствие. pako требует тему и ровно одного получателя to. aspect_class различает состояние, деятельность, достижение и ограниченный процесс; allowed_aspects задаёт допустимые hu/te для конкретного глагола. Русский перевод не меняет рамку.';}
 if(rule.id==='SAMA-RULE/aspect'){rule.decision='ADR-0005';rule.text='hu означает процесс в точке отсчёта, te достижение конца ограниченного действия. Совместимость задаётся allowed_aspects в словарной рамке глагола: одного класса действия недостаточно. te medo не допускается и из лечения не выводится выздоровление. Порядок: время, внешнее no, модальность, внутреннее no, вид, глагол. Один видовой оператор на группу; bi вид не принимает.';}
 if(rule.id==='SAMA-RULE/spatial'){rule.decision='ADR-0005';rule.text='na задаёт общее местонахождение, nana внутреннюю область, tota внешнюю, noba положение выше, poba ниже, pata переднюю сторону, yalo расположение вокруг, lali близость. Все требуют именной ориентир. bi принимает любую из этих локативных групп. to задаёт цель движения или получателя pako, ko сопровождающего; они не заменяют статическое место после bi. na перед названием периода выражает время. Предложная группа относится к предикату; место объекта уточняют отдельным предложением.';}
}
put('content/rules/core.json',core);
const reg=read('content/rule-registry.json');
for(const topic of reg.topics){const rule=core.rules.find(x=>x.id===topic.id);if(!rule)continue;
 for(const rev of topic.revisions){rev.active=false;if(rev.path==='content/rules/core.json'&&rev.id.endsWith('@0.11.0'))rev.path=archive+'/core.json';}
 if(!topic.revisions.some(x=>x.id===rule.revision))topic.revisions.push({id:rule.revision,status:'core',active:true,path:'content/rules/core.json',selector:rule.id,decision:'docs/decisions/0005-lexicon-300.md'});
 else topic.revisions.find(x=>x.id===rule.revision).active=true;
 topic.active_revision=rule.revision;topic.decision='ADR-0005: current 0.12.0 edition; prior 0.11.0 text archived with stable revision IDs.';
}
for(const row of reg.positions)if(core.rules.some(x=>x.id==='SAMA-RULE/'+row.topic))row.effective_replacement='SAMA-RULE/'+row.topic+'@'+version;
put('content/rule-registry.json',reg);
for(const p of ['content/phonology-v1.json','content/verb-frames.json','content/learning/lessons-v1.json','content/learning/reader-v1.json']){
 const value=read(p);value.version=version;for(const l of value.lessons||[])l.version=version;
 if(p.endsWith('verb-frames.json'))value.verbs=lex.entries.flatMap(e=>e.senses.filter(s=>s.frame).map(s=>({form:e.form,sense_id:s.id,...s.frame})));
 put(p,value);
}
const release=read('content/standard-release.json');release.version=version;release.accepted_lexemes=300;release.authority=lex.authority;put('content/standard-release.json',release);
writeFileSync('docs/core-reference.md','# SAMA '+version+' — нормативная основа\n\nИсточник: content/rules/core.json. ADR-0003/0004/0005.\n\n'+core.rules.map(x=>'## '+x.title+'\n\n`'+x.revision+'`\n\n'+x.text+'\n\n'+x.examples.map(e=>'- '+e.sama+' — '+e.ru+'\n').join('')+'\n').join(''));
console.log('Adopted '+additions.length+' individual editorial rows; current lexicon '+lex.entries.length+'; version '+version);
