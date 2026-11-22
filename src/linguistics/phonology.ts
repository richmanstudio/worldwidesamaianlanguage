/** Adopted SAMA 0.11 phonology. This computes phonemic notation, not recorded speech. */
const SAMA_IPA:Record<string,string>={a:'a',b:'b',d:'d',e:'e',h:'h',i:'i',k:'k',l:'l',m:'m',n:'n',o:'o',p:'p',s:'s',t:'t',u:'u',w:'w',y:'j'};
function samaSyllables(word:string):string[]{
 if(!/^(?:[bdhklmnpstwy]?[aeiou])+$/.test(word.toLowerCase()))throw new Error('PHONOTACTICS');
 return word.toLowerCase().match(/[bdhklmnpstwy]?[aeiou]/g)!;
}
function samaWordIPA(word:string):string{
 const parts=word.toLowerCase().split('-');
 return '/'+parts.map((part,j)=>{
  const syllables=samaSyllables(part),at=Math.max(0,syllables.length-2);
  return syllables.map((s,i)=>(syllables.length>1&&i===at?(j===parts.length-1?'ˈ':'ˌ'):'')+[...s].map(c=>SAMA_IPA[c]).join('')).join('.');
 }).join('‿')+'/';
}
