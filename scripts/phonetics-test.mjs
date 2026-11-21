import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const site=readFileSync('dist/assets/site.js','utf8');
const start=site.indexOf('const IPA_PHONEMES');
const end=site.indexOf('/* Ванильный TypeScript',start);
assert(start!==-1&&end>start,'phonetics module absent from browser bundle');
const phonetics=site.slice(start,end);
const source=phonetics+'\nthis.__testSama=(input)=>transcribeSama(input);';
const ctx=vm.createContext({});
vm.runInContext(source,ctx,{timeout:10000});
const t=ctx.__testSama;
const expected=[
 ['sama','/ˈsa.ma/'],['sala','/ˈsa.la/'],['doma','/ˈdo.ma/'],
 ['mi si yu','/mi si ju/'],['su','/su/'],['hama','/ˈha.ma/'],
 ['ami','/ˈa.mi/'],['mi-balo','/mi‿ˈba.lo/'],['dua','/ˈdu.a/']
];
for(const [word,phonemic] of expected)assert.equal(t(word).phonemic,phonemic,`IPA ${word}`);
assert.equal(t('rain').valid,false,'invalid alphabet must be rejected');
assert.equal(t('sama ♥').valid,false,'special symbol must be rejected');
const bank=JSON.parse(readFileSync('content/wordbank-5000.json','utf8'));
for(const w of bank){const result=t(w.form);assert.equal(result.valid,true,`Invalid corpus form: ${w.form}`);assert(result.phonemic.startsWith('/')&&result.phonemic.endsWith('/'),`Malformed IPA ${w.form}`);}
console.log(`✓ Phonetics: ${expected.length} contrast cases, rejected invalid input, ${bank.length} well-formed phonemic transcriptions`);
