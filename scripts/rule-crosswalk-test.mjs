import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8')),r=read('content/rule-registry.json');
const sources={spec03:read('content/specification.json'),atlas05:read('content/grammar-atlas.json').chapters,lab07:read('content/language-0.7.json').rules,lab08:read('content/grammar-0.8.json').rules,lab09:read('content/language-0.9.json').rules};
assert.equal(r.positions.length,128);
assert.equal(r.counts.laboratory,59);
assert.equal(r.conflicts.length,12);
assert.equal(r.topics.length,r.counts.topics);
const refs=new Set();
for(const row of r.positions){
 assert(!refs.has(row.ref),'Duplicate crosswalk ref '+row.ref);refs.add(row.ref);
 const prefix=row.ref.split(':')[0],source=sources[prefix];
 assert(source,'Unrecognized source '+prefix);
 const orig=source.find(x=>x.id===row.source_id);
 assert(orig,'Source rule missing '+row.ref);
 assert.equal(orig.title,row.title,'Title modified in source '+row.ref);
 assert.equal(orig.status||orig.level,row.source_status);
 assert(r.topics.some(x=>x.topic===row.topic));
 assert.equal(row.normative_promoted,false);
}
for(const [prefix,expected] of Object.entries({spec03:24,atlas05:45,lab07:15,lab08:24,lab09:20})){
 assert.equal(r.positions.filter(x=>x.ref.startsWith(prefix+':')).length,expected,'Incomplete crosswalk '+prefix);
}
for(const topic of r.topics){
 assert(/^SAMA-RULE\//.test(topic.id));
 assert(topic.sources.every(x=>refs.has(x)));
 if(topic.primary_internal_03){
  const p=r.positions.find(x=>x.ref===topic.primary_internal_03);
  assert(p&&p.ref.startsWith('spec03:')&&p.source_status==='core');
 }
}
for(const conflict of r.conflicts){
 assert(conflict.sources.length>=2);
 assert(conflict.sources.every(x=>refs.has(x)),'Invalid conflict reference '+conflict.id);
 assert(conflict.decision.length>35&&conflict.evidence.length>50);
}
const report=readFileSync('docs/rule-crosswalk.md','utf8');
for(const row of r.positions)assert(report.includes(row.ref),'Crosswalk missing ref '+row.ref);
console.log('✓ R01-03/R00-04: 128 linked historic positions (59 laboratory), '+r.topics.length+' provisional topics, '+r.conflicts.filter(x=>!x.status||x.status==='open').length+' open discrepancies');
