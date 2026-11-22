/** SAMA 0.11: executable grammar of the adopted foundation, not a universal translator. */
interface SamaLexicalSense{part_of_speech:string;frame?:{minimum_objects:number;maximum_objects:number;required_adpositions:string[]};}
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
 const nounStart=(w:string)=>['noun','pronoun','demonstrative','reflexive'].includes(pos(w)||'')||w==='ki'||w==='ku'||numberStart(w);
 const isArgumentQuestion=(w:string)=>w==='ki'||w==='ku';
 function atom(allowPossession=true,allowRelative=true):SamaTree{
  const start=i;let demonstrative:string|null=null,numeral:number|null=null;
  if(pos(peek())==='demonstrative')demonstrative=take();
  if(numberStart(peek())){
   const words:string[]=[];while(numberStart(peek()))words.push(take());
   try{numeral=samaReadInteger(words);}catch{fail('NUMERAL_FORM','Неправильное десятичное число');}
  }
  const word=peek(),category=pos(word);
  if(numeral!==null&&!['noun','pronoun'].includes(category||''))return {kind:'number',value:numeral};
  if(!['noun','pronoun','reflexive'].includes(category||'')&&!isArgumentQuestion(word))fail('EXPECTED_NP','Ожидается имя или местоимение');
  take();if(category!=='noun'&&(demonstrative||numeral!==null))fail('NP_HEAD','Определитель требует существительного');
  if(word==='se'&&start===0)fail('REFLEXIVE_SUBJECT','se не является самостоятельным субъектом');
  const plural=peek()==='li';if(plural){take();if(numeral!==null)fail('NUMBER_AND_LI','Числительное и li не совмещаются');if(category==='reflexive')fail('REFLEXIVE_PLURAL','se получает число от субъекта');}
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
  return {kind:'np',head:word,demonstrative,numeral,plural,qualities,possessor,relative};
 }
 function np(allowRelative=true):SamaTree{
  const members=[atom(true,allowRelative)];let coordinator:string|null=null;
  while(peek()==='wa'||peek()==='o'){
   const next=take();if(coordinator&&coordinator!==next)fail('MIXED_COORDINATION','Смешанная негруппированная цепочка исключена');coordinator=next;members.push(atom(true,allowRelative));
  }
  return members.length===1?members[0]:{kind:'np-coordination',coordinator,members};
 }
 function clause(inRelative=false):SamaTree{
  const subject=np(!inRelative);if(subject.head==='se')fail('REFLEXIVE_SUBJECT','se относится к субъекту и не заменяет его');
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
   if(aspect||modal)fail('COPULA_OPERATOR','В этой основе bi не принимает вид или модальность');
   if(pos(peek())==='adjective'){const values:string[]=[];while(pos(peek())==='adjective')values.push(take());complement={kind:'qualities',values};}
   else if(peek()==='kalo'){take();complement={kind:'location-question'};}
   else if(peek()!=='na')complement=np(!inRelative);
  }else{
   const frame=entry!.frame!;
   if(nounStart(peek())){if(frame.maximum_objects===0)fail('UNEXPECTED_OBJECT','Глагол не допускает прямого объекта');object=np(!inRelative);}
   if(frame.minimum_objects&&!object)fail('MISSING_OBJECT','Отсутствует обязательный прямой объект');
  }
  if(aspect==='hu'&&!['pina','kula','lena','lita','wima','wako','toka'].includes(verb))fail('ASPECT_COMPATIBILITY','hu требует динамического действия');
  if(aspect==='te'&&!['pina','kula','lita','wima','tako','pako'].includes(verb))fail('ASPECT_COMPATIBILITY','te требует ограниченного действия');
  const adjuncts:Array<{adposition:string;object:SamaTree}>=[];
  while(['na','to','ko'].includes(peek())){const adposition=take();adjuncts.push({adposition,object:np(!inRelative)});}
  if(verb==='bi'&&!complement&&!adjuncts.some(x=>x.adposition==='na'))fail('MISSING_COMPLEMENT','bi требует дополнения');
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
