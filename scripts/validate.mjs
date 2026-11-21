import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const read=(p)=>JSON.parse(readFileSync(p,'utf8'));
const C='content/';
const lex=read(C+'lexicon.json'),letters=read(C+'letters.json'),spec=read(C+'specification.json');
const sections=read(C+'sections.json'),lessons=read(C+'lessons.json'),phrases=read(C+'phrases.json'),quiz=read(C+'quiz.json');
const quarantine=read(C+'legacy/quarantine.json'),audit=read(C+'audit.json');
const articles=readdirSync(C+'articles').filter(n=>n.endsWith('.json')).map(n=>read(join(C,'articles',n)));
let checks=0;
function ok(condition,message){assert.ok(condition,message);checks++;}
const alphabet=new Set(letters.map(l=>l.char.toLowerCase()));
ok(letters.length===17 && alphabet.size===17,'Алфавит: 17 уникальных букв');
ok('aeiou'.split('').every(c=>alphabet.has(c)),'Пять гласных');
const written=/^[a-z]+(?:-[a-z]+)*$/;
const seen=new Set();
for(const word of lex){
 ok(written.test(word.w),'Неоднозначная графика '+word.w);
 ok([...word.w.replace(/-/g,'')].every(c=>alphabet.has(c)),'Внеалфавитный знак '+word.w);
 ok(!seen.has(word.w),'Дублированная форма '+word.w);seen.add(word.w);
 ok(['core','candidate'].includes(word.status),'Недопустимый статус '+word.w);
 ok(word.proposed===(word.status==='candidate'),'Несогласованный статус '+word.w);
 ok(word.ru&&word.tag,'Нет определения '+word.w);
 if(word.w.includes('-')){
  ok(word.status==='candidate','Сложный корень без экспертизы '+word.w);
  for(const part of word.w.split('-'))ok(lex.some(x=>x.w===part),'В сложном слове отсутствует основа '+part);
 }
}
for(const q of quarantine)ok(!seen.has(q.w),'Архивное ошибочное слово просочилось в основной словарь: '+q.w);
const ids=new Set(); const areaIds=new Set(sections.map(s=>s.id));
for(const a of articles){
 ok(/^[a-z0-9-]+$/.test(a.id)&&!ids.has(a.id),'Дублированный / некорректный ID статьи: '+a.id);ids.add(a.id);
 ok(areaIds.has(a.area),'Неизвестный раздел для статьи '+a.id);
 ok(Array.isArray(a.paragraphs)&&a.paragraphs.length>0,'Пустая статья '+a.id);
}
for(const a of articles)for(const id of (a.related||[]))ok(ids.has(id),'Ссылка на несуществующую статью '+a.id+' -> '+id);
const specIds=new Set();
for(const s of spec){
 ok(!specIds.has(s.id)&&['core','candidate'].includes(s.level),'Некорректная глава '+s.id);specIds.add(s.id);
 ok(s.rules.length>=3 && s.notes.length>=1,'Неполная нормативная глава '+s.id);
 ok(ids.has('standard-'+s.id),'Глава стандарта без энциклопедической статьи '+s.id);
 // Spec examples must use known forms, except author names/language names.
 for(const ex of s.examples){
  const tokens=(ex.sama.toLowerCase().match(/[a-z]+(?:-[a-z]+)*/g)||[]);
  for(const t of tokens)ok(seen.has(t)||['sama','danila'].includes(t),`Неизвестная форма '${t}' в главе ${s.id}: ${ex.sama}`);
 }
}
for(const l of lessons){
 ok(l.title&&l.rules.length>=1&&l.examples.length>=1&&l.task&&l.answer,'Неполный урок '+l.title);
}
for(const p of phrases)ok(p.sama && p.ru && p.topic,'Пустая реплика');
for(const q of quiz)ok(q.options.length===4&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4&&q.explain,'Повреждён вопрос');
ok(audit.quarantine.length===quarantine.length,'Несовпадение журнала аудита');
ok(audit.visible===lex.length,'Неверный счётчик аудита');
ok(audit.legacyTotal===486&&audit.legacyUnique===430,'Неожиданно изменена исходная архивная выборка');
console.log(`✓ Лексика: ${lex.length} записей, ${lex.filter(x=>x.status==='core').length} ядро, ${lex.filter(x=>x.status==='candidate').length} кандидатов`);
console.log(`✓ Редакционный архив: ${audit.conflicts.length} конфликтов, ${quarantine.length} исключённых составных форм`);
console.log(`✓ Энциклопедия: ${articles.length} статей; справочник: ${spec.length} глав; уроки: ${lessons.length}`);
console.log(`✓ Проверок выполнено: ${checks}. Ошибок: 0.`);

// The workbench is NOT a 5000-word approved dictionary. Check data integrity only.
const bank=read(C+'wordbank-5000.json');
const report=read(C+'wordbank-report.json');
ok(bank.length===5000&&report.target===5000,'Неполный рабочий корпус 5000');
const bankSeen=new Set();
for(const w of bank){
 ok(!bankSeen.has(w.form),'Дубликат корпуса '+w.form);bankSeen.add(w.form);
 ok(w.form.split('').every(c=>alphabet.has(c)||c==='-'),'Незаконная буква '+w.form);
 ok(w.sense_ru&&w.definition_ru&&w.ipa_draft&&w.status&&Array.isArray(w.parts),'Неполная карточка '+w.form);
 if(w.status==='proposal'){
  ok(w.class==='compound'&&w.parts.length===2,'Нарушена структура проекта слова '+w.form);
  ok(w.form===w.parts.join('-'),'Неверно собранное слово '+w.form);
  ok(seen.has(w.parts[0])&&seen.has(w.parts[1]),'Неизвестная морфема '+w.form);
  ok(w.examples.length===1&&w.examples[0].sama.includes(w.form),'Нет иллюстрации '+w.form);
 }else ok(seen.has(w.form),'Старое слово не найдено '+w.form);
}
ok(bank.filter(w=>w.status==='proposal').length===4683,'Неверный счётчик новых предложений');
console.log('✓ Лаборатория 5000: 317 существующих, 4683 составных кандидата; 0 утверждённых новых форм');
