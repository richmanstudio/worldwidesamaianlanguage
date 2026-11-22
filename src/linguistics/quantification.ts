/**
 * SAMA 0.16: finite-domain semantic model of subject quantification.
 * Each supplied predicate truth value covers the whole lexical VP for one
 * discourse individual. This model does not infer real-world facts.
 */
type SamaQuantifiedWitness={id:string;predicate:boolean};
type SamaQuantifierVerdict=
 | {status:'defined';truth:boolean;quantifier:string;quantifierNegated:boolean;predicateNegated:boolean;domainSize:number;matches:number}
 | {status:'undefined';reason:'NONEMPTY_DOMAIN_REQUIRED';domainSize:number};
function samaEvaluateQuantifiedClause(clause:SamaTree,domain:SamaQuantifiedWitness[],exceptionId:string|null=null):SamaQuantifierVerdict{
 const subject=clause.subject as SamaTree|undefined;
 const q=subject?.quantifier;
 if(!subject||subject.kind!=='np'||!['tawa','somi','mowa'].includes(String(q)))
  throw new Error('QUANTIFIER_SUBJECT_REQUIRED');
 if(new Set(domain.map(x=>x.id)).size!==domain.length||domain.some(x=>!x.id||typeof x.predicate!=='boolean'))
  throw new Error('INVALID_DOMAIN');
 if(subject.exception){
  if(!exceptionId||!domain.some(x=>x.id===exceptionId))throw new Error('EXCEPTION_REFERENT_REQUIRED');
 }else if(exceptionId!==null)throw new Error('UNEXPECTED_EXCEPTION');
 const members=subject.exception?domain.filter(x=>x.id!==exceptionId):domain;
 if((q==='tawa'||q==='mowa')&&members.length===0)
  return {status:'undefined',reason:'NONEMPTY_DOMAIN_REQUIRED',domainSize:0};
 const matches=members.filter(x=>clause.outerNegation?!x.predicate:x.predicate).length;
 let positive=false;
 if(q==='tawa')positive=matches===members.length;
 else if(q==='somi')positive=matches>=1;
 else positive=matches>members.length/2;
 return {status:'defined',truth:subject.quantifierNegated?!positive:positive,
  quantifier:String(q),quantifierNegated:Boolean(subject.quantifierNegated),
  predicateNegated:Boolean(clause.outerNegation),domainSize:members.length,matches};
}
