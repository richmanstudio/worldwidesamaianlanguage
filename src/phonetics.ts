/** SAMA phonological REFERENCE MODEL (provisional, NOT a native-speaker recording).
 * Alphabet: 17 ASCII letters. 5 vowels. 12 consonants. CV is preferred;
 * adjacent vowels are separate syllable nuclei. Compound members are separate
 * prosodic domains, with one primary stress each (draft convention).
 */
const IPA_PHONEMES: Record<string,string> = {
 a:'a',e:'e',i:'i',o:'o',u:'u',b:'b',d:'d',h:'h',k:'k',l:'l',
 m:'m',n:'n',p:'p',s:'s',t:'t',w:'w',y:'j'
};
const PHONETIC_VOWELS = new Set(['a','e','i','o','u']);
const PHONETIC_CONSONANTS = new Set(Object.keys(IPA_PHONEMES).filter(c=>!PHONETIC_VOWELS.has(c)));
interface IPAResult {input:string;valid:boolean;phonemic:string;syllables:string[];stress:string;notes:string[];segments:string[];}
function splitSamaSyllables(component:string):string[] {
 const word=component.toLowerCase();
 if(!word||![...word].every(ch=>ch in IPA_PHONEMES))return [];
 const nuclei:number[]=[];
 for(let i=0;i<word.length;i++)if(PHONETIC_VOWELS.has(word[i]))nuclei.push(i);
 if(nuclei.length===0)return [word];
 const syllables:string[]=[];let start=0;
 for(let i=0;i<nuclei.length;i++){
  const nucleus=nuclei[i];
  const next=nuclei[i+1];
  if(next===undefined){syllables.push(word.slice(start));break;}
  // Maximize a one-consonant onset (CV), never invent a digraph.
  const between=next-nucleus-1;
  const boundary=between===0?nucleus+1:Math.max(nucleus+1,next-1);
  syllables.push(word.slice(start,boundary));start=boundary;
 }
 return syllables;
}
function transcribeSama(input:string):IPAResult {
 const clean=input.trim().toLowerCase();
 const chunks=clean.split(/([\s.,!?;:()—–]+)/).filter(Boolean);
 const segments:string[]=[];const notes:string[]=[];const syllables:string[]=[];
 let valid=true;
 for(const chunk of chunks){
  if(/^[\s.,!?;:()—–]+$/.test(chunk)){segments.push(chunk);continue;}
  const parts=chunk.split('-');const transParts:string[]=[];
  for(const part of parts){
   if(!part||![...part].every(c=>c in IPA_PHONEMES)){
    valid=false;notes.push(`Фрагмент «${part||chunk}» содержит знак вне алфавита SAMA.`);
    transParts.push(part);continue;
   }
   const split=splitSamaSyllables(part);
   syllables.push(...split);
   const stressAt=split.length>1?split.length-2:-1;
   transParts.push(split.map((s,index)=>(index===stressAt?'ˈ':'')+[...s].map(c=>IPA_PHONEMES[c]).join('')).join('.'));
   if(split.every(s=>![...s].some(c=>PHONETIC_VOWELS.has(c))))notes.push(`В «${part}» отсутствуют гласные: произношение пока не нормировано.`);
   if(/[^aeiou][^aeiou]/.test(part))notes.push(`«${part}»: скопление согласных, желательно проверить допустимость слога.`);
  }
  segments.push(transParts.join('‿'));
 }
 if(!clean)valid=false;
 const result=segments.join('');
 return {input,valid,phonemic:valid?`/${result}/`:'—',syllables,
  stress:syllables.length>1?'Предпоследний слог каждого компонента (рабочая гипотеза)':'Односложная форма',
  notes:[...new Set(notes)],segments};
}
