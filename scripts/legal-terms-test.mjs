/**
 * R08-07: constitutional language register pre-adoption checks.
 * A successful test DOES NOT approve legal terms or grammar.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const lex=read('content/lexicon-v1.json');
const lexByForm=new Set(lex.entries.map(x=>x.form));
const coverage=read('content/terminology/constitution-coverage.json');
const law=read('content/terminology/law.json');
const valid=/^(?:[bdhklmnpstwy]?[aeiou])+$/;
const forms=new Set();
for(const e of law.entries){
 assert.equal(e.status,'candidate');
 assert(valid.test(e.form),'Illegal SAMA word form: '+e.form);
 assert(!lexByForm.has(e.form),'Duplicate of accepted word: '+e.form);
 assert(!forms.has(e.form),'Duplicate legal word: '+e.form);
 forms.add(e.form);
 assert(e.definition.ru.length>=30 && e.definition.en.length>=30);
 assert(e.gloss.ru.length && e.gloss.en.length);
 const syllables=e.form.match(/[bdhklmnpstwy]?[aeiou]/g);
 const expected='/'+syllables.map((s,i)=>(syllables.length>1&&i===syllables.length-2?'ˈ':'')+s.replaceAll('y','j')).join('.')+'/';
 assert.equal(e.ipa,expected,'IPA mismatch: '+e.form);
 assert.equal(e.human_validation,'not conducted');
}
assert.equal(coverage.chapters.length,14);
let mapped=0,unmapped=0,core=0,items=0;
for(const ch of coverage.chapters){
 assert(ch.id && ch.title && ch.concepts.length);
 for(const entry of ch.concepts){
  items++;
  assert(entry.id && entry.ru && entry.en);
  assert.equal(entry.chapter,ch.id);
  if(entry.sama){assert(lexByForm.has(entry.sama));core++;}
  if(entry.candidate_form){assert(forms.has(entry.candidate_form));mapped++;}
  if(!entry.sama&&!entry.candidate_form)unmapped++;
 }
}
assert.equal(items,coverage.summary.chapter_concepts);
assert.equal(core,coverage.summary.strict_matches);
assert.equal(mapped,coverage.summary.candidate_links);
assert.equal(unmapped,coverage.summary.still_unassigned);
assert.equal(law.entries.length,law.counts.proposed);
assert(law.counts.proposed>=80);
console.log('✓ R08-07: '+items+' constitutional concept occurrences in '+coverage.chapters.length+' chapters; '+core+' exact core matches, '+mapped+' candidate links, '+unmapped+' unmapped.');
console.log('✓ '+forms.size+' unique law candidates; spelling, IPA, bilingual definitions, known-form collisions checked.');
console.log('NOTE: no new accepted words, no legal-semantic validation, no independent study.');

const contrasts=read('tests/constitution-legal-contrasts.json');
assert.equal(contrasts.entries.length,contrasts.count);
const pairIds=new Set();
for(const pair of contrasts.entries){
 assert(!pairIds.has(pair.id));pairIds.add(pair.id);
 assert.equal(pair.status,'editorial_probes_unvalidated');
 assert(pair.distinction.ru.length>30 && pair.distinction.en.length>30);
 for(const side of [pair.left,pair.right]){
  assert(forms.has(side.form)||lexByForm.has(side.form),'Unknown contrast form: '+side.form);
  assert(side.example.sama && side.example.ru);
  assert(side.example.sama.toLowerCase().includes(side.form));
  assert(side.example.sama.endsWith('.'));
 }
 assert.notEqual(pair.left.form,pair.right.form);
}
console.log('✓ '+contrasts.count+' editorial legal semantic contrast pairs linked; human / legal review still required.');
