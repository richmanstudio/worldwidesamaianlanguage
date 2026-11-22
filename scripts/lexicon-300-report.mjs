import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const lex=read('content/lexicon-v1.json'),old=read('content/lexicon.json'),byForm=new Map(lex.entries.map(x=>[x.form,x]));
const deferred={
 'bama-soma':'Роль работника требует отделения от любого исполнителя дела; продуктивная модель профессии ещё не принята.',
 'bano-mato':'Порядок оснований читается как городское дерево, а не парк; смысл парка требует новой статьи.',
 'doma-kato':'Разновидность кота определяется местом содержания, но модель такого композита ещё не принята.',
 'doma-koma':'По направлению главной основы это сообщество, а не общественное здание; требуется переопределение.',
 'doma-siba':'Разновидность собаки по месту содержания требует принятой модели сложения.',
 'kaso-lena':'Последняя основа lena — глагол; значение учебника не выводится из действующей модели именной группы.',
 'ke':'Не приняты окончательные границы и вложенность содержательной клаузы; отдельная задача R05-03.',
 'koma-toka':'toka — глагол; название дискуссии требует отдельного именного значения и структуры.',
 'kula-doma':'Не различены столовая, ресторан и место еды; самостоятельную точную статью ещё нужно написать.',
 'lawi-doma':'Суд, учреждение и здание суда не тождественны; узкое значение ещё не определено.',
 'lawi-soma':'Роль юриста, квалификация и практика должны быть отделены от любого человека, связанного с законом.',
 'lena-doma':'Школа как организация и учебное здание требуют разных смысловых границ.',
 'lena-soma':'Не различены учитель и учащийся; текущие однозначные слова lenu и dani уже приняты.',
 'lita-doma':'Библиотека и произвольное место чтения не тождественны; требуется отдельная дефиниция.',
 'mato-pano':'Направление главной основы даёт поверхность, а не обязательно аллею; смысл не принят.',
 'meka-doma':'Нельзя считать любое врачебное помещение больницей; конкретный тип учреждения ещё не выбран.',
 'nami-bano':'Главная основа bano означает город; название города уже выражается nami de bano.',
 'nami-koma':'Главная основа koma означает сообщество; название сообщества выражается nami de koma.',
 'nawa-soma':'Качество и имя пишутся отдельно; значение новичка требует отдельного статуса роли.',
 'nawa-suna':'Новое солнце не равнозначно рассвету; требуется временное понятие рассвета.',
 'pana-doma':'Производство и продажа хлеба не тождественны; точное значение пекарни не принято.',
 'pano-bano':'Городской пол и улица не тождественны; требуется самостоятельная статья улицы.',
 'poko':'Количество и область действия квантора ещё не формализованы; R03-09.',
 'sama-soma':'Равенство требует явного критерия; составление не выражает автоматически равноправие.',
 'sela-lata':'Автомобиль моря не задаёт однозначно тип судна; нужна самостоятельная судовая лексика.',
 'sima-sami':'Холодное небо не равно снегу; погодная единица требует собственной дефиниции.',
 'sima-su':'Холодная вода не обязательно лёд; фазовое состояние должно определяться отдельно.',
 'su-sami':'Вода и небо не определяют направление осадков; дождь требует отдельной статьи.',
 'talo-basa':'Не различены переводчик-человек, программа и устройство; значение не принято.',
 'talo-lato':'По главной основе получается лампа инструмента; точный переносной источник света ещё не определён.',
 'talo-lena':'Не всякий инструмент обучения является программой; цифровое значение не следует из основ.',
 'talo-si':'si — глагол видеть; экран не определяется этим составлением без отдельного решения.',
 'talo-toka':'Телефон принят однозначным словом tele; старое составление ещё не является утверждённым синонимом.',
 'talo-wima':'Не различены ручка, клавиатура и система письма; требуется точная статья.',
 'tima-lata':'Время автомобиля не тождественно расписанию; структура расписания требует определения.',
 'wada-lata':'Автомобиль реки не задаёт лодку; водный транспорт требует отдельных статей.',
 'wato-doma':'Наличие электричества в здании не делает его электростанцией; функция производства не закреплена.',
 'wima-doma':'Письменное здание не задаёт архив как учреждение или хранилище; точное значение не принято.'
};
const quote=s=>'"'+String(s).replaceAll('"','""')+'"';
const csv=rows=>rows.map(r=>r.map(quote).join(',')).join('\n')+'\n';
const candidates=old.filter(x=>x.status==='candidate');assert.equal(candidates.length,274);
const rows=[['form','legacy_gloss','decision','reason','sense_id','authority']];
let approved=0,postponed=0;
for(const entry of candidates){
 const current=byForm.get(entry.w);
 if(current){approved++;const sense=current.senses[0];rows.push([entry.w,entry.ru,'approve',sense.definition.ru,sense.id,current.decision]);}
 else{assert(deferred[entry.w],'Missing individual decision '+entry.w);postponed++;rows.push([entry.w,entry.ru,'defer',deferred[entry.w],'','ADR-0005']);}
}
assert.equal(approved,236);assert.equal(postponed,38);assert.equal(Object.keys(deferred).length,38);
mkdirSync('reports',{recursive:true});writeFileSync('reports/candidate-274.csv',csv(rows));
const added=lex.entries.filter(x=>x.decision==='ADR-0005');assert.equal(added.length,206);
writeFileSync('reports/lexicon-300-review.csv',csv([['form','origin','previous_gloss','part_of_speech','definition_ru','definition_en','first_example','second_example','decision'],...added.map(e=>{const s=e.senses[0],prior=old.find(x=>x.w===e.form);return [e.form,prior?'edited historical root':'new authored root',prior?.ru||'',s.part_of_speech,s.definition.ru,s.definition.en,s.examples[0].sama,s.examples[1].sama,e.decision];})]));
console.log('Candidate audit: '+approved+' approve, '+postponed+' individual defer; '+added.length+' additions documented');
