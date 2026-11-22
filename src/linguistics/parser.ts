/** SAMA 0.16: executable grammar of the adopted foundation, not a universal translator. */
interface SamaLexicalSense{part_of_speech:string;frame?:{minimum_objects:number;maximum_objects:number;required_adpositions:string[];aspect_class?:string;allowed_aspects?:string[]};}
interface SamaLexicalEntry{form:string;senses:SamaLexicalSense[];}
interface SamaDiagnostic{code:string;token:number;message:string;}
type SamaTree={kind:string;[key:string]:unknown};
type SamaParseResult={ok:true;ast:SamaTree}|{ok:false;error:SamaDiagnostic};
const SAMA_DIGITS=['nula','una','dua','tia','pala','pema','sika','seta','oto','naya'];
function samaSpellInteger(n:number):string[]{
 if(!Number.isInteger(n)||n<0||n>999999)throw new Error('NUMERAL_RANGE');
 if(n<10)return [SAMA_DIGITS[n]];
 for(const [scale,word] of [[1000,'mila'],[100,'sena'],[10,'tena']] as const){
  if(n>=scale){const q=Math.floor(n/scale),r=n%scale;return [...(q===1?[]:samaSpellInteger(q)),word,...(r?samaSpellInteger(r):[])];}
 }
 throw new Error('NUMERAL_RANGE');
}
function samaReadInteger(words:string[]):number{
 if(words.length===1&&/^(0|[1-9][0-9]*)$/.test(words[0])){const n=Number(words[0]);samaSpellInteger(n);return n;}
 let total=0,block=0,digit=0;
 for(const word of words){
  const d=SAMA_DIGITS.indexOf(word);
  if(d>=0){digit=d;continue;}
  if(word==='tena'||word==='sena'){block+=(digit||1)*(word==='tena'?10:100);digit=0;continue;}
  if(word==='mila'){total+=(block+digit||1)*1000;block=0;digit=0;continue;}
  throw new Error('NUMERAL_FORM');
 }
 const value=total+block+digit;
 if(samaSpellInteger(value).join(' ')!==words.join(' '))throw new Error('NUMERAL_FORM');
 return value;
}
function parseSamaFoundation(text:string,entries:SamaLexicalEntry[]):SamaParseResult{
 const dict=new Map(entries.map(e=>[e.form,e.senses[0]]));
 let tokens:string[]=[],i=0;
 const fail=(code:string,message:string):never=>{throw {code,token:i,message};};
 const pos=(w:string|undefined)=>w?dict.get(w)?.part_of_speech:undefined;
 const peek=()=>tokens[i];
 const take=()=>tokens[i++];
 const expect=(word:string)=>{if(take()!==word)fail('EXPECTED_'+word.toUpperCase(),'Ожидается '+word);};
 const numberStart=(w:string)=>pos(w)==='numeral'||/^\d+$/.test(w||'');
 const quantifierStart=(w:string|undefined)=>pos(w)==='quantifier';
 const nounStart=(w:string)=>['noun','pronoun','demonstrative','reflexive'].includes(pos(w)||'')||w==='ki'||w==='ku'||numberStart(w);
 const locatives=new Set(['na','nana','tota','noba','poba','pata','yalo','lali']);
 const prepositions=new Set([...dict.entries()].filter(([w,s])=>s.part_of_speech==='adposition'&&w!=='de').map(([w])=>w));
 const isArgumentQuestion=(w:string)=>w==='ki'||w==='ku';
 function atom(allowPossession=true,allowRelative=true,allowQuantifier=false):SamaTree{
  let quantifier:string|null=null,quantifierNegated=false;
  if(peek()==='no'&&quantifierStart(tokens[i+1])){
   if(!allowQuantifier)fail('QUANTIFIER_SCOPE','no перед квантором допускается только в начале клаузы');
   take();quantifierNegated=true;
  }
  if(quantifierStart(peek())){
   if(!allowQuantifier)fail('QUANTIFIER_SCOPE','Кванторы действуют только на подлежащее в редакции 0.16');
   quantifier=take();
  }
  const start=i;let demonstrative:string|null=null,numeral:number|null=null;
  if(pos(peek())==='demonstrative')demonstrative=take();
  if(numberStart(peek())){
   const words:string[]=[];while(numberStart(peek()))words.push(take());
   try{numeral=samaReadInteger(words);}catch{fail('NUMERAL_FORM','Неправильное десятичное число');}
  }
  const word=peek(),category=pos(word);
  if(quantifier&&(demonstrative||numeral!==null))fail('QUANTIFIER_ORDER','Квантор не сочетается с указателем или числительным перед одним именем');
  if(numeral!==null&&!['noun','pronoun'].includes(category||''))return {kind:'number',value:numeral};
  if(!['noun','pronoun','reflexive'].includes(category||'')&&!isArgumentQuestion(word))fail('EXPECTED_NP','Ожидается имя или местоимение');
  take();if(category!=='noun'&&(demonstrative||numeral!==null))fail('NP_HEAD','Определитель требует существительного');
  if(quantifier&&category!=='noun')fail('QUANTIFIER_HEAD','Квантор требует существительное в множественном числе');
  if(word==='se'&&!allowPossession)fail('REFLEXIVE_ROLE','se допускается только как прямой объект');
  if(word==='se'&&start===0)fail('REFLEXIVE_SUBJECT','se не является самостоятельным субъектом');
  const plural=peek()==='li';if(plural){take();if(numeral!==null)fail('NUMBER_AND_LI','Числительное и li не совмещаются');if(category==='reflexive')fail('REFLEXIVE_PLURAL','se получает число от субъекта');}
  if(quantifier&&!plural)fail('QUANTIFIER_PLURAL','tawa, somi и mowa требуют имя с li');
  const qualities:string[]=[];while(pos(peek())==='adjective')qualities.push(take());
  if(qualities.length&&category!=='noun')fail('PRONOUN_QUALITY','Качество в этой позиции требует существительного');
  let possessor:SamaTree|null=null;
  if(peek()==='de'){
   if(!allowPossession)fail('POSSESSION_CHAIN','Негруппированная цепочка de исключена');
   take();possessor=atom(false,false);
  }
  let relative:SamaTree|null=null;
  if(peek()==='ye'){
   if(!allowRelative||category!=='noun')fail('RELATIVE_NESTING','В основе допускается одно невложенное именное определение');
   take();relative=clause(true);expect('ya');
   const rel=relative as {subject?:SamaTree;object?:SamaTree;adjuncts?:Array<{object:SamaTree}>};
   const taCount=(n:unknown):number=>!n||typeof n!=='object'?0:Array.isArray(n)?n.reduce((a:number,x)=>a+taCount(x),0):Object.entries(n).reduce((a,[k,v])=>a+(k==='head'&&v==='ta'?1:taCount(v)),0);
   const count=taCount(relative);
   const subjectBound=rel.subject?.head==='ta',objectBound=rel.object?.head==='ta';
   if(count!==1||(!subjectBound&&!objectBound))fail('RELATIVE_BINDING','Ровно один ta должен быть субъектом или прямым объектом');
   relative.boundRole=subjectBound?'subject':'object';relative.headReference='relative-head';
  }
  let exception:SamaTree|null=null;
  if(peek()==='sule'){
   if(quantifier!=='tawa'||quantifierNegated||!allowQuantifier)fail('QUANTIFIER_EXCEPTION','sule допускается после положительного tawa');
   take();exception=atom(false,false,false);
   if(exception.kind!=='np'||(exception.head!==word&&exception.head!=='ta')||exception.plural||exception.possessor||exception.relative||exception.numeral!==null)
    fail('QUANTIFIER_EXCEPTION','Исключение должно указывать на одного участника того же класса или ta');
  }
  return {kind:'np',head:word,demonstrative,numeral,plural,qualities,possessor,relative,quantifier,quantifierNegated,exception};
 }
 function np(allowRelative=true,allowQuantifier=false):SamaTree{
  const members=[atom(true,allowRelative,allowQuantifier)];let coordinator:string|null=null;
  while(peek()==='wa'||peek()==='o'){
   if(members[0].quantifier)fail('QUANTIFIER_COORDINATION','Квантор в редакции 0.16 не распространяется на координацию именных групп');
   const next=take();if(coordinator&&coordinator!==next)fail('MIXED_COORDINATION','Смешанная негруппированная цепочка исключена');coordinator=next;members.push(atom(true,allowRelative,false));
  }
  return members.length===1?members[0]:{kind:'np-coordination',coordinator,members};
 }
 function clause(inRelative=false):SamaTree{
  const subject=np(!inRelative,!inRelative);if(subject.head==='se'||(subject.kind==='np-coordination'&&(subject.members as SamaTree[]).some(x=>x.head==='se')))fail('REFLEXIVE_SUBJECT','se относится к субъекту и не заменяет его');
  const tense=peek()==='pa'||peek()==='la'?take():null;
  const outerNegation=peek()==='no';if(outerNegation)take();
  const modal=pos(peek())==='modal'?take():null;
  const innerNegation=Boolean(modal&&peek()==='no');if(innerNegation)take();
  if(outerNegation&&innerNegation)fail('DOUBLE_NEGATION','Двойное no исключено в этой редакции');
  const aspect=pos(peek())==='aspect'?take():null;
  const verb=take(),entry=dict.get(verb);
  if(!entry||!['verb','copula'].includes(entry.part_of_speech))fail('EXPECTED_VERB','Ожидается глагол или bi');
  let object:SamaTree|null=null,complement:unknown=null;
  if(verb==='bi'){
   if(aspect)fail('COPULA_OPERATOR','bi не принимает видовой оператор');
   if(pos(peek())==='adjective'){const values:string[]=[];while(pos(peek())==='adjective')values.push(take());complement={kind:'qualities',values};}
   else if(peek()==='kalo'){take();complement={kind:'location-question'};}
   else if(!locatives.has(peek()))complement=np(!inRelative);
  }else{
   const frame=entry!.frame!;
   if(quantifierStart(peek())||(peek()==='no'&&quantifierStart(tokens[i+1])))fail('QUANTIFIER_SCOPE','Квантор прямого объекта пока не нормирован');
   if(nounStart(peek())){if(frame.maximum_objects===0)fail('UNEXPECTED_OBJECT','Глагол не допускает прямого объекта');object=np(!inRelative);}
   if(frame.minimum_objects&&!object)fail('MISSING_OBJECT','Отсутствует обязательный прямой объект');
  }
  if(aspect&&!entry!.frame?.allowed_aspects?.includes(aspect))fail('ASPECT_COMPATIBILITY','Видовой оператор не допускается словарной рамкой');
  const adjuncts:Array<{adposition:string;object:SamaTree}>=[];
  while(prepositions.has(peek())){const adposition=take(),referent=np(!inRelative);if(referent.head==='se'||(referent.kind==='np-coordination'&&(referent.members as SamaTree[]).some(x=>x.head==='se')))fail('REFLEXIVE_ROLE','se допускается только как прямой объект');adjuncts.push({adposition,object:referent});}
  if(verb==='bi'&&!complement&&!adjuncts.some(x=>locatives.has(x.adposition)))fail('MISSING_COMPLEMENT','bi требует дополнения');
  for(const prep of entry!.frame?.required_adpositions||[])if(adjuncts.filter(x=>x.adposition===prep).length!==1)fail('RECIPIENT','Требуется ровно один получатель '+prep);
  const question=['kate','kasa','kamo'].includes(peek())?take():null;
  if(inRelative&&question)fail('RELATIVE_QUESTION','Относительная клауза не является специальным вопросом');
  return {kind:'clause',subject,tense,outerNegation,modal,innerNegation,aspect,verb,object,complement,adjuncts,question};
 }
 try{
  const match=text.trim().match(/^(.+?)([.!?])$/s);if(!match)fail('PUNCTUATION','Предложение требует конечного знака');
  const ending=match![2],body=match![1].toLowerCase();
  if(!/^[a-z0-9\s,]+$/.test(body))fail('ORTHOGRAPHY','Недопустимый знак в этом профиле');
  tokens=body.match(/[a-z]+|[0-9]+|,/g)||[];
  for(const w of tokens)if(w!==','&&!/^\d+$/.test(w)&&!dict.has(w))fail('UNKNOWN_WORD','Нет принятой словарной статьи: '+w);
  if(!tokens.length)fail('EMPTY','Пустое предложение');
  let response:string|null=null,politeness=false;
  if(['response','interjection'].includes(pos(peek())||'')){
   response=take();if(i===tokens.length)return {ok:true,ast:{kind:'utterance',expression:response,ending}};
   expect(',');
   if(pos(response)==='interjection'){const addressee=np();if(i!==tokens.length)fail('TRAILING','Лишние элементы обращения');return {ok:true,ast:{kind:'address',expression:response,addressee,ending}};}
  }
  if(peek()==='palao'){take();expect(',');politeness=true;}
  let conditional:SamaTree|null=null;const clauses:SamaTree[]=[];let coordinator:string|null=null;
  if(peek()==='ani'){take();conditional=clause();expect(',');}
  clauses.push(clause());
  while(peek()===','&&['wa','aka','o'].includes(tokens[i+1])){
   take();const next=take();if(coordinator&&coordinator!==next)fail('MIXED_COORDINATION','Разные союзы требуют явной группировки');coordinator=next;clauses.push(clause());
  }
  if(peek()===','&&tokens[i+1]==='palao'){i+=2;politeness=true;}
  const polar=peek()==='ka';if(polar)take();
  if(i!==tokens.length)fail('TRAILING','Неожиданные элементы после клаузы');
  const wh=tokens.some(x=>['ki','ku','kalo','kate','kasa','kamo'].includes(x));
  if(polar&&wh)fail('QUESTION_MARKERS','Специальный вопрос не принимает ka');
  if((polar||wh)!==(ending==='?'))fail('QUESTION_PUNCTUATION','Тип вопроса и конечный знак не совпадают');
  return {ok:true,ast:{kind:'sentence',clauses,conditional,coordinator,polar,wh,response,politeness,ending}};
 }catch(e){
  if(e&&typeof e==='object'&&'code'in e)return {ok:false,error:e as SamaDiagnostic};
  return {ok:false,error:{code:'INVALID_FORM',token:i,message:'Не удалось разобрать форму'}};
 }
}
