import { copyFileSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const read=(path)=>JSON.parse(readFileSync(path,'utf8'));
const dir='content/';
const ARTICLE_SECTIONS=read(dir+'sections.json');
const ARTICLES=readdirSync(dir+'articles').filter(x=>x.endsWith('.json')).sort().map(x=>read(join(dir,'articles',x)));
const datasets={
 CURRENT_LEXICON:read(dir+'lexicon-v1.json'),CURRENT_RULES:read(dir+'rules/core.json'),CURRENT_PHONOLOGY:read(dir+'phonology-v1.json'),CURRENT_RELEASE:read(dir+'standard-release.json'),CURRENT_LESSONS:read(dir+'learning/lessons-v1.json'),CURRENT_READER:read(dir+'learning/reader-v1.json'),
 LETTERS:read(dir+'letters.json'),COUNTS:read(dir+'numbers.json'),
 LEXICON:read(dir+'lexicon.json'),PHRASES:read(dir+'phrases.json'),
 LESSONS:read(dir+'lessons.json'),ARTICLE_SECTIONS,ARTICLES,
 QUIZ:read(dir+'quiz.json'),HANDBOOK:read(dir+'specification.json'),AUDIT:read(dir+'audit.json'),GRAMMAR_ATLAS:read(dir+'grammar-atlas.json')
};
mkdirSync('dist/assets',{recursive:true});
const serial=Object.entries(datasets).map(([k,v])=>`const ${k} = ${JSON.stringify(v)};`).join('\n');
const js=['phonetics.js','linguistics/phonology.js','linguistics/parser.js','standard.js','app.js'].map(p=>readFileSync('.sama-build/'+p,'utf8')).join('\n');
writeFileSync('dist/assets/site.js', `${serial}\nconst VOWELS=new Set(['a','e','i','o','u']);\n;\n${js}\n`,'utf8');
copyFileSync('content/language-0.9.json','dist/assets/language-0.9.json');copyFileSync('content/grammar-0.8.json','dist/assets/grammar-0.8.json');copyFileSync('content/translation-corpus-0.8.json','dist/assets/translation-corpus-0.8.json');copyFileSync('content/language-0.7.json','dist/assets/language-0.7.json');copyFileSync('content/benchmark-0.7.json','dist/assets/benchmark-0.7.json');copyFileSync('content/wordbank-5000.json','dist/assets/wordbank-5000.json');copyFileSync('content/wordbank-report.json','dist/assets/wordbank-report.json');writeFileSync('dist/index.html',readFileSync('index.html','utf8').replaceAll('__SAMA_VERSION__',datasets.CURRENT_RELEASE.version));writeFileSync('dist/assets/style.css',readFileSync('src/style.css','utf8')+'\n'+readFileSync('src/archive.css','utf8'));copyFileSync('src/favicon.svg','dist/favicon.svg');
rmSync('.sama-build',{recursive:true,force:true});
// Independent server-readable, crawlable HTML pages. The interactive site keeps hash navigation
// for compatibility with GitHub Pages; these permanent static files expose real content without JS.
const escape=(v)=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const shell=(title,body,description='Энциклопедия языка SAMA 0.3')=>`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escape(description)}"><title>${escape(title)} | SAMA Encyclopedia</title><link rel="stylesheet" href="../../assets/style.css"><style>body{background:#f7fafb}.static-shell{max-width:950px;margin:0 auto;background:white;min-height:100vh;padding:clamp(18px,4vw,55px);border-left:1px solid #dae4ea;border-right:1px solid #dae4ea}.static-shell main{max-width:75ch}.static-shell header{border-bottom:2px solid #1a4362;margin-bottom:24px;padding-bottom:13px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}.static-shell header a{color:#173f5c}.static-shell h1{font-family:Georgia,serif;font-size:clamp(30px,4vw,45px);color:#173f5c;line-height:1.15}.static-shell p{line-height:1.75}.static-shell footer{border-top:1px solid #dce3e8;margin-top:55px;padding-top:15px;font-size:13px;color:#60717a}.status{border:1px solid #cad5dc;border-radius:4px;padding:3px 8px;font-size:12px}.summary{font-size:19px;color:#425c70}.info{padding:15px;background:#f3f7f9;border-left:3px solid #d4a048;margin:24px 0}.sama{font-family:Georgia,serif;color:#173e5a;font-size:20px}</style></head><body><div class="static-shell"><header><a href="../../index.html#/" style="font-size:24px;font-family:Georgia,serif;font-weight:bold">◎ SAMA</a><a href="../../index.html#/standard">Стандарт 0.3</a><a href="../../index.html#/dictionary">Словарь</a><a href="../../static-index.html">Указатель статей</a></header><main>${body}</main><footer>Архив SAMA 0.3. Эта страница сохраняет историческую редакцию; действующие материалы доступны в основных разделах.</footer></div></body></html>`;
let written=0;
for(const a of ARTICLES){
 mkdirSync('dist/pages/articles',{recursive:true});
 const body=`<div class="eyebrow">${escape(a.edition||'архивная редакция')}</div><h1>${escape(a.title)}</h1><p class="summary">${escape(a.desc)}</p>${a.status==='reference'?'<div class="info">Архивная учебная статья 0.1. Некоторые положения могут быть устаревшими; используйте стандарт 0.3 для актуальных норм.</div>':''}${a.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}${a.examples?.length?`<h2>Примеры</h2>${a.examples.map(([s,ru])=>`<p><span class="sama" lang="und">${escape(s)}</span><br>${escape(ru)}</p>`).join('')}`:''}<h2>См. также</h2><p>${(a.related||[]).filter(id=>ARTICLES.some(x=>x.id===id)).map(id=>`<a href="${encodeURIComponent(id)}.html">${escape(ARTICLES.find(x=>x.id===id).title)}</a>`).join(' · ')}</p><a href="../../index.html#/article/${encodeURIComponent(a.id)}">Открыть интерактивную версию ↗</a>`;
 writeFileSync(`dist/pages/articles/${a.id}.html`,shell(a.title,body,a.desc),'utf8');written++;
}
for(const w of datasets.LEXICON){
 mkdirSync('dist/pages/words',{recursive:true});
 const body=`<div class="eyebrow">СЛОВАРЬ SAMA · ${w.status==='core'?'РАБОЧЕЕ ЯДРО':'КАНДИДАТ'}</div><h1 lang="und">${escape(w.w)}</h1><p class="summary">${escape(w.ru)}</p><p>Тема: ${escape(w.tag)}. Статус: <span class="status">${w.status==='core'?'рабочее ядро 0.3':'кандидат'}</span></p>${w.note?`<div class="info">${escape(w.note)}</div>`:''}<a href="../../index.html#/word/${encodeURIComponent(w.w)}">Открыть интерактивную карточку ↗</a>`;
 writeFileSync(`dist/pages/words/${w.w}.html`,shell(w.w,body,w.ru),'utf8');written++;
}
const listing=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Все статьи и слова · SAMA 0.3</title><style>body{font:16px/1.55 system-ui,sans-serif;max-width:1100px;margin:30px auto;padding:0 20px;color:#173e5a}a{color:#145e95}ul{columns:3;column-gap:30px}li{break-inside:avoid}@media(max-width:700px){ul{columns:1}}</style></head><body><a href="./index.html#/">← Энциклопедия SAMA</a><h1>Указатель статических HTML-страниц</h1><p>Документы доступны без JavaScript. Статусы черновые, не подтверждены международными исследованиями.</p><h2>Статьи (${ARTICLES.length})</h2><ul>${ARTICLES.map(x=>`<li><a href="pages/articles/${x.id}.html">${escape(x.title)}</a></li>`).join('')}</ul><h2>Слова (${datasets.LEXICON.length})</h2><ul>${datasets.LEXICON.map(x=>`<li><a href="pages/words/${x.w}.html">${escape(x.w)} — ${escape(x.ru)}</a></li>`).join('')}</ul></body></html>`;
writeFileSync('dist/static-index.html',listing,'utf8');
console.log(`✓ SAMA 0.3: ${Object.keys(datasets).length} наборов данных, ${written} отдельных HTML-страниц + указатель`);
console.log('✓ Сборка: dist/index.html / dist/assets/site.js');

for(const [source,target] of [['content/lexicon-v1.json','lexicon-v1.json'],['content/rules/core.json','core.json'],['content/phonology-v1.json','phonology-v1.json'],['content/standard-release.json','standard-release.json']])copyFileSync(source,'dist/assets/'+target);
const csvQuote=s=>'"'+String(s).replaceAll('"','""')+'"';
writeFileSync('dist/assets/lexicon-v1.csv','\uFEFF'+[['id','form','ipa','sense_id','part_of_speech','ru','en','definition_ru','definition_en'],...datasets.CURRENT_LEXICON.entries.flatMap(e=>e.senses.map(s=>[e.id,e.form,e.ipa,s.id,s.part_of_speech,s.gloss.ru,s.gloss.en,s.definition.ru,s.definition.en]))].map(row=>row.map(csvQuote).join(',')).join('\r\n'));
console.log('✓ Published adopted SAMA '+datasets.CURRENT_RELEASE.version+': '+datasets.CURRENT_LEXICON.entries.length+' lexemes, '+datasets.CURRENT_RULES.rules.length+' rules');
// Current server-readable documents use the same accepted data as interactive routes.
const currentShell=(title,body)=>`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} | SAMA</title><style>body{font:18px/1.7 Georgia,serif;color:#173f5c;background:#f8f7f2;margin:0}main{max-width:900px;margin:auto;padding:35px}a{color:#164d70}h1,h2{line-height:1.2}section{border-top:1px solid #ccd2d4;margin-top:30px;padding-top:20px}code{font-size:14px}nav{border-bottom:1px solid #ccd2d4;padding-bottom:16px}</style></head><body><main><nav><a href="${title==='Словарь SAMA'||title==='Грамматика SAMA'?'./':'../../'}index.html#/">SAMA</a> · Редакция ${escape(datasets.CURRENT_RELEASE.version)}</nav>${body}</main></body></html>`;
for(const entry of datasets.CURRENT_LEXICON.entries){
 const body=`<h1>${escape(entry.form)}</h1><p>${escape(entry.ipa)}</p>`+entry.senses.map(s=>`<section><code>${escape(s.id)}</code><h2>${escape(s.gloss.ru)}</h2><p>${escape(s.definition.ru)}</p><p lang="en">${escape(s.gloss.en)} — ${escape(s.definition.en)}</p>${s.examples.map(x=>`<p lang="und"><b>${escape(x.sama)}</b></p><p>${escape(x.ru)}</p>`).join('')}</section>`).join('');
 writeFileSync('dist/pages/words/'+entry.form+'.html',currentShell(entry.form,body));
}
writeFileSync('dist/standard.html',currentShell('Грамматика SAMA','<h1>Грамматика SAMA</h1>'+datasets.CURRENT_RULES.rules.map(r=>`<section><code>${escape(r.id)}</code><h2>${escape(r.title)}</h2><p>${escape(r.text)}</p>${r.examples.map(x=>`<p><b>${escape(x.sama)}</b> — ${escape(x.ru)}</p>`).join('')}</section>`).join('')));
writeFileSync('dist/dictionary.html',currentShell('Словарь SAMA',`<h1>Словарь SAMA</h1><p>${datasets.CURRENT_LEXICON.entries.length} принятых слов.</p><ul>${datasets.CURRENT_LEXICON.entries.map(e=>`<li><a href="pages/words/${escape(e.form)}.html">${escape(e.form)}</a> — ${escape(e.senses[0].gloss.ru)}</li>`).join('')}</ul>`));
writeFileSync('dist/archive-index.html',listing.replace('<h1>Указатель статических HTML-страниц</h1>','<h1>Архив статических страниц</h1><p>Текущие материалы: <a href="dictionary.html">словарь</a>, <a href="standard.html">грамматика</a>. Исторические статьи сохраняют прежние формулировки.</p>'));
writeFileSync('dist/static-index.html','<!doctype html><html lang="ru"><meta charset="utf-8"><title>SAMA — справочники</title><h1>Справочники SAMA</h1><ul><li><a href="standard.html">Действующая грамматика</a></li><li><a href="dictionary.html">Принятый словарь</a></li><li><a href="archive-index.html">Архив статей и старых редакций</a></li></ul></html>');

mkdirSync('dist/assets/standards/0.11.0',{recursive:true});
for(const file of readdirSync('content/standards/0.11.0'))copyFileSync('content/standards/0.11.0/'+file,'dist/assets/standards/0.11.0/'+file);
