import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const files=['ROADMAP.md','AGENTS.md','README.md','docs/ROADMAP-STATUS.md','docs/WORKLOG.md','.github/pull_request_template.md'];
for(const f of files){assert(existsSync(f),'Roadmap governance file missing: '+f);assert(readFileSync(f,'utf8').trim().length>80,'Governance file is empty: '+f);}
const rm=readFileSync('ROADMAP.md','utf8');
const readme=readFileSync('README.md','utf8');
const agents=readFileSync('AGENTS.md','utf8');
const status=readFileSync('docs/ROADMAP-STATUS.md','utf8');
const ids=[...rm.matchAll(/\*\*(R\d{2}-\d{2})\*\*/g)].map(m=>m[1]);
assert(ids.length>=140,'Roadmap lost detailed tasks; found '+ids.length);
assert.equal(new Set(ids).size,ids.length,'Duplicate roadmap task IDs');
for(let i=0;i<14;i++){let phase='R'+String(i).padStart(2,'0');assert(rm.includes('### '+phase+' —'),'Roadmap phase missing '+phase);assert(status.includes('| G'+i+' |'),'Status gate missing G'+i);}
for(const f of ['README.md','AGENTS.md','docs/ROADMAP-STATUS.md'])assert(readFileSync(f,'utf8').includes('ROADMAP.md'),'Roadmap not anchored in '+f);
assert(readme.includes('[ОФИЦИАЛЬНЫЙ ROADMAP'),'README missing canonical roadmap link');
assert(agents.includes('Before any SAMA task'),'Agents must read roadmap before edits');
assert(status.includes('R00-01')&&status.includes('R00-02'),'No next milestones selected');
assert(rm.includes('43 формы')&&rm.includes('4 683'),'Current historical baseline missing from roadmap');
console.log('✓ ROADMAP governance:',ids.length,'unique task IDs in 14 phases; README/AGENTS/status/PR template present');
