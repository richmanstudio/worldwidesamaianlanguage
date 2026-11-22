/** Idempotent application of individually authored source rows, ADR-0006. */
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const file='content/lexicon-v1.json',lex=read(file),relfile='content/standard-release.json',release=read(relfile);
const rows=readFileSync('content/editorial/lexicon-350.tsv','utf8').trim().split("\n").map(x=>x.split('|'));
const letters={a:'a',b:'b',d:'d',e:'e',h:'h',i:'i',k:'k',l:'l',m:'m',n:'n',o:'o',p:'p',s:'s',t:'t',u:'u',w:'w',y:'j'};
function ipa(f){assert(/^(?:[bdhklmnpstwy]?[aeiou])+$/.test(f));const parts=f.match(/[bdhklmnpstwy]?[aeiou]/g);
return '/'+parts.map((s,i)=>(parts.length>1&&i===parts.length-2?'ˈ':'')+[...s].map(x=>letters[x]).join('')).join('.')+'/';}
assert.equal(rows.length,50);assert(['0.12.0','0.13.0'].includes(lex.version));
for(const row of rows){
 assert.equal(row.length,9);const [form,ru,en,dru,den,a,aru,b,bru]=row;
 const entry={id:'SAMA-LEX/'+form,form,ipa:ipa(form),status:'core',accepted_in:'0.13.0',decision:'ADR-0006',senses:[{id:'SAMA-SENSE/'+form+'/1',part_of_speech:'noun',gloss:{ru,en},definition:{ru:dru,en},examples:[{sama:a,ru:aru},{sama:b,ru:bru}]}]};
 const found=lex.entries.find(x=>x.form===form);
 if(found)assert.deepEqual(found,entry,'Mismatch in '+form);else lex.entries.push(entry);
}
assert.equal(lex.entries.length,350);
lex.version='0.13.0';lex.authority='ADR-0003 / ADR-0004 / ADR-0005 / ADR-0006';
release.version=lex.version;release.accepted_lexemes=350;release.authority=lex.authority;
writeFileSync(file,JSON.stringify(lex,null,2)+'\\n');
writeFileSync(relfile,JSON.stringify(release,null,2)+'\\n');
console.log('✓ R07-10: 50 entries match ADR-0006; adoption is idempotent');
