/* Ванильный TypeScript: нет фреймворков, трекеров, внешних зависимостей. */
const app = document.getElementById('app') as HTMLElement;
const rail = document.getElementById('rightRail') as HTMLElement;
const crumb = document.getElementById('crumb') as HTMLElement;
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const siteSearch = document.getElementById('siteSearch') as HTMLFormElement;
const toastEl = document.getElementById('toast') as HTMLElement;
let toastTimer: number | undefined;
let currentDictionaryPage = 1;
const DICT_PAGE_SIZE = 55;
const STORAGE_DONE = 'sama:lessons:v1';
const STORAGE_FAV = 'sama:favorites:v1';
const STORAGE_BEST = 'sama:quizbest:v1';
let chosenVoice = '';
let audioSpeed = 0.85;
const A = (s:string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const href = (id:string)=>`#/article/${encodeURIComponent(id)}`;
const articleLink = (id:string) => { const a = ARTICLES.find(x=>x.id===id); return a ? `<a href="${href(id)}">${A(a.title)}</a>` : ''; };
const rawStored = (key:string) => { try { return localStorage.getItem(key) || '[]'; } catch { return '[]'; } };
const storedArray = (key:string): string[] => {try { const v=JSON.parse(rawStored(key));return Array.isArray(v)?v.filter(x=>typeof x==='string'):[]; } catch {return [];} };
const storeArray=(key:string,items:string[])=> { try{localStorage.setItem(key,JSON.stringify(items));}catch{notify('Настройки браузера запрещают локальное сохранение.')} };
const favorites = new Set<string>(storedArray(STORAGE_FAV));
const completed = new Set<string>(storedArray(STORAGE_DONE));
const topicName=(id:string) => ARTICLE_SECTIONS.find(s=>s.id===id)?.name || id;
const urlify = (path:string) => `#/${path}`;
const countTagged = (tag:string) => LEXICON.filter(w=>w.tag===tag).length;
const uniqueTags = [...new Set(LEXICON.map(w=>w.tag))];

function notify(message:string){toastEl.textContent=message;toastEl.classList.add('visible');window.clearTimeout(toastTimer);toastTimer=window.setTimeout(()=>toastEl.classList.remove('visible'),3000);}
function pageTitle(title:string,desc?:string, eyebrow?:string){ return `${eyebrow?`<div class="eyebrow">${A(eyebrow)}</div>`:''}<h1>${A(title)}</h1>${desc?`<p class="lead">${A(desc)}</p>`:''}`; }
function table(headers:string[],rows:string[][],extra=''){return `<table class="retro-table ${extra}"><thead><tr>${headers.map(h=>`<th scope="col">${A(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function speakButton(text:string,caption='▶'){return `<button class="listen-button" data-action="speak" data-text="${A(text)}" aria-label="Прослушать: ${A(text)}" title="Воспроизвести браузерным голосом">${caption}</button>`;}
function examples(rows:[string,string][]) {return `<div class="examplebox">${rows.map(([s,r])=>`<div class="example-row"><strong lang="und">${A(s)}</strong><span>${A(r)}</span>${speakButton(s)}</div>`).join('')}</div>`;}
function setCrumb(links:{title:string,path?:string}[]){crumb.innerHTML=`<a href="#/">SAMA</a>`+links.map(l=>` » ${l.path?`<a href="#/${A(l.path)}">${A(l.title)}</a>`:A(l.title)}`).join('');}
function setRail(html:string){rail.innerHTML=html;}
function setApp(html:string){
  app.innerHTML=html;
  // Automatic section navigation on long reference pages.
  const headings=Array.from(app.querySelectorAll<HTMLElement>('h2'));
  if(headings.length>=2){
    const used=new Set<string>();
    const links=headings.slice(0,12).map((h,index)=>{
      let id=h.id||'section-'+String(index+1);
      while(used.has(id)||Boolean(document.getElementById(id)&&document.getElementById(id)!==h))id+='-section';
      used.add(id);h.id=id;
      return `<a href="#${A(id)}" data-anchor="${A(id)}">${A(h.textContent||'Раздел')}</a>`;
    });
    rail.insertAdjacentHTML('afterbegin',`<nav class="rail-group rail-toc" aria-label="Содержание текущей страницы"><div class="rail-title">На этой странице</div>${links.join('')}</nav>`);
  }
}
function mainRail(){return `<div class="rail-group"><div class="rail-title">Кратко о языке</div><div class="rail-number">17</div><div class="small muted">букв алфавита</div><div class="rail-number">5</div><div class="small muted">основных гласных</div><div class="rail-number">${LEXICON.length}</div><div class="small muted">словарных записей</div></div><div class="rail-group"><div class="rail-title">Быстрые ссылки</div><a href="#/start">Как начать</a><a href="#/alphabet">Алфавит</a><a href="#/dictionary">Русско-SAMA словарь</a><a href="#/trainer">Проверить знания</a></div><div class="rail-note"><b>Важно.</b> SAMA 0.3 — экспериментальный язык. Расширенная лексика и некоторые конструкции требуют проверки.</div>`;}
function buildSidebar(){const target=document.getElementById('sideTopics');if(target)target.innerHTML=ARTICLE_SECTIONS.map(x=>`<a href="#/topic/${A(x.id)}">${A(x.name)}</a>`).join('');}
function accent(text:string):string{return A(text).replace(/\b(mi|yu|ta|pa|la|no|bi|ka|li)\b/gi, '<strong>$1</strong>');}

function renderHome(){
 const i=Math.floor(Date.now()/86400000)%LEXICON.length,word=LEXICON[i];
 setCrumb([{title:'Главная'}]);setRail(mainRail());
 setApp(`${pageTitle('Добро пожаловать в SAMA','Энциклопедия экспериментального международного языка. Читайте, слушайте, ищите слова и учитесь — всё в одном месте.','Знакомство с языком · SAMA 0.3')}
 <div class="hero-intro"><div class="hero-copy"><div class="hero-kicker"><span class="hero-kicker-dot"></span> ЯЗЫК ДЛЯ ВСЕХ · ОТКРЫТЫЙ ПРОЕКТ</div><div class="hero-language" lang="und">Sala! Mi bi SAMA.</div><p><b>Привет! Это SAMA.</b> Мы проектируем второй общий язык для людей с разными родными языками — с небольшим алфавитом, предсказуемой грамматикой и открытым словарём.</p><p class="small muted">Рабочая редакция языка 0.3 · Не окончательный лингвистический стандарт.</p><div class="hero-links"><a class="hero-primary" href="#/start">Начать изучение <span aria-hidden="true">↗</span></a><a href="#/dictionary">Открыть словарь <span aria-hidden="true">→</span></a><a href="#/sounds">Слушать звуки <span aria-hidden="true">→</span></a></div></div><div class="hero-art" aria-hidden="true"><span class="hero-art-ring ring-one"></span><span class="hero-art-ring ring-two"></span><span class="hero-art-center">S</span><span class="hero-art-caption">ONE LANGUAGE<br> MANY VOICES</span></div></div>
 <div class="stats"><div class="stat"><strong>${ARTICLES.length}</strong><span>статей энциклопедии</span></div><div class="stat"><strong>${LEXICON.length}</strong><span>словарных записей</span></div><div class="stat"><strong>${LESSONS.length}</strong><span>пошаговых урока</span></div><div class="stat"><strong>${QUIZ.length}</strong><span>заданий в тренажёре</span></div></div>
 <div class="toolrow"><a class="hero-primary" href="#/standard">Стандарт языка 0.3 ↗</a><a href="#/audit">Протокол аудита лексики</a></div><div class="section-banner">ОСНОВНЫЕ РАЗДЕЛЫ</div>
 <div class="pagegrid">
 <div class="portal-panel"><div class="panel-heading"><span class="panel-icon">01.</span> Букварь и звукарь</div><div class="panel-body"><p>Все 17 букв, подсказки по произношению, слоги, ударение и кнопки прослушивания.</p><a href="#/alphabet">Открыть букварь</a> · <a href="#/sounds">Открыть звукарь</a></div></div>
 <div class="portal-panel"><div class="panel-heading"><span class="panel-icon">02.</span> Грамматика</div><div class="panel-body"><p>Местоимения, времена, вопросы, отрицание, порядок слов и важные частицы.</p><a href="#/grammar">Полный грамматический справочник</a></div></div>
 <div class="portal-panel"><div class="panel-heading"><span class="panel-icon">03.</span> Большой словарь</div><div class="panel-body"><p>${LEXICON.length} записей по темам: дом, природа, люди, учёба, путешествия, технологии.</p><a href="#/dictionary">Найти слово или перевод</a></div></div>
 <div class="portal-panel"><div class="panel-heading"><span class="panel-icon">04.</span> Самоучитель</div><div class="panel-body"><p>${LESSONS.length} последовательных урока, десятки примеров и тренажёр с проверкой ответов.</p><a href="#/lessons">Все уроки</a> · <a href="#/trainer">Тренажёр</a></div></div>
 </div>
 <h2>Слово дня</h2><div class="daily-word"><div class="word">${A(word.w)}</div><div class="meaning">${A(word.ru)}</div><div class="toolrow">${speakButton(word.w,'▶ Прослушать')}<a href="#/dictionary?q=${encodeURIComponent(word.w)}">Найти в словаре</a>${word.proposed?'<span class="badge-draft">проект</span>':'<span class="badge-core">базовое</span>'}</div></div>
 <h2>Популярные справочные статьи</h2><div class="article-index">${['mission','alphabet-policy','vowels','consonants','svo','pronouns','past','future','negation','questions','plural','compounds','lexical-quality','technology'].map(id=>articleLink(id)).join('')}</div>
 <h2>Первый разговор</h2>${examples([['Sala!','Привет!'],['Mi bi Danila.','Я Данила.'],['Yu bi ki?','Кто ты?'],['Mi lena basa SAMA.','Я изучаю язык SAMA.']])}
 <div class="paper-note"><strong>Примечание редакции.</strong> Этот сайт содержит реальный работающий учебный прототип. Для полноценного международного применения язык должен пройти фонологическую и лексическую экспертизу с носителями разных языков.</div>`);
}
function renderStart(){setCrumb([{title:'С чего начать'}]);setRail(mainRail());setApp(`${pageTitle('С чего начать?','Маршрут для человека, который впервые открывает язык SAMA.','Вводная глава')}
 <div class="paper-note"><b>Короткий путь:</b> звуки → 20 главных слов → пять схем предложений → практика.</div>
 ${[['1','Узнайте буквы','В SAMA всего 17 букв. Познакомьтесь с их чтением и простыми слогами.','alphabet'],['2','Прослушайте звуки','Кликните на букву или пример; браузер произнесёт его приблизительно.','sounds'],['3','Разберите грамматику','Выучите mi, yu, ta, bi, pa, la, no и ka.','grammar'],['4','Откройте самоучитель','Проходите темы по очереди, отмечая изученные уроки.','lessons'],['5','Проверьте понимание','Короткий тренажёр выявит слабые места.','trainer'],['6','Читайте энциклопедию','Подробные статьи объясняют нормы, неопределённости и развитие проекта.','library']].map(([n,t,d,p])=>`<div class="lesson-item"><span class="lesson-index">${n}</span><b>${A(t)}</b><p>${A(d)}</p><a href="#/${p}">Перейти »</a></div>`).join('')}
 <h2>Запомните первые слова</h2>${table(['Слово','Русский перевод'],[['mi','я'],['yu','ты / вы'],['ta','он / она / оно'],['bi','быть'],['si','видеть'],['no','не'],['pa','прошедшее'],['la','будущее'],['ka','вопрос']].map(([w,r])=>[`<b>${w}</b>`,r]))}
 <h2>Соберите предложение</h2>${examples([['Mi si yu.','Я вижу тебя.'],['Mi no si yu.','Я не вижу тебя.'],['Mi pa si yu.','Я видел тебя.'],['Mi la si yu.','Я увижу тебя.'],['Yu si mi ka?','Ты видишь меня?']])}`);}
function letterDetails(ch:string){const l=LETTERS.find(x=>x.char===ch)||LETTERS[0];return `<div class="phoneme-detail"><h2 style="margin:0 0 8px;border:0">${l.char.toUpperCase()} <span class="muted">${A(l.ipa)}</span></h2><p>${A(l.how)}</p><p><b>Для ориентира:</b> ${A(l.hint)}</p><p>Пример: <b class="sama-text">${A(l.example)}</b> ${speakButton(l.example,'▶ Слушать слово')}</p></div>`;}
function renderAlphabet(){setCrumb([{title:'Букварь'}]);setRail(`<div class="rail-group"><div class="rail-title">Содержание</div><a href="#/article/alphabet-policy">Правила алфавита</a><a href="#/article/syllables">Слоги</a><a href="#/article/stress">Ударение</a><a href="#/article/transliteration">Кириллица и перевод записи</a></div>${mainRail()}`);setApp(`${pageTitle('Букварь SAMA','17 букв. Пять гласных. Двенадцать согласных. Никаких обязательных акцентов над буквами.','Шаг 1 · Учимся читать')}
 <div class="section-banner">АЛФАВИТ · НАЖМИТЕ НА БУКВУ</div><div class="alpha-grid">${LETTERS.map(l=>`<button class="letter-cell${l.char==='A'?' selected':''}" type="button" data-action="letter" data-letter="${l.char}" aria-label="Буква ${l.char}">${l.char}<small>${A(l.ipa)}</small></button>`).join('')}</div><div id="letterPanel">${letterDetails('A')}</div>
 <h2>Все буквы в одной таблице</h2>${table(['Буква','Произношение','Пример','Слушать'],LETTERS.map(l=>[l.char,A(l.ipa),`<b>${A(l.example)}</b>`,speakButton(l.example)]))}
 <h2>Как строятся слоги</h2><p>Предпочтительные слоги состоят из согласного и гласного: <b>ma, pa, ki, su, to</b>. Одиночная гласная тоже возможна. Разделяйте слова на читаемые части.</p>${examples([['ma-ma','ма-ма'],['sa-ma','са-ма'],['do-ma','до-ма'],['le-na','ле-на'],['su','су']])}
 <div class="paper-note"><b>Орфографическая заметка:</b> слово SAMA обычно произносится <b>СА-ма</b>. Ударение помогает ритму речи, но не различает слова.</div><p><a href="#/sounds">Перейти в звукарь »</a></p>`);}
function renderSounds(){setCrumb([{title:'Звукарь'}]);setRail(`<div class="rail-group"><div class="rail-title">Фонетика</div>${['vowels','consonants','stress','pronunciation-variants'].map(articleLink).join('')}</div><div class="rail-note">Прослушивание создаётся голосами, установленными в вашем браузере. Это только приблизительное чтение, не запись носителя SAMA.</div>`);setApp(`${pageTitle('Звукарь SAMA','Нажимайте «▶», чтобы слушать примеры. Можно выбрать системный голос и скорость чтения.','Фонетическая лаборатория')}
 <div class="paper-note"><b>Важно:</b> звукарь использует встроенный синтез речи браузера (Web Speech API). Произношение может отличаться от будущей нормативной записи. Если звук недоступен, читайте фонетическую подсказку.</div>
 <div class="sound-controls"><label for="voiceSelect">Голос:</label><select id="voiceSelect"><option value="">Автоматически</option></select><label for="rateRange">Скорость:</label><input type="range" id="rateRange" min="0.6" max="1.3" step="0.05" value="${audioSpeed}"><output id="rateOut">${audioSpeed.toFixed(2)}×</output><button class="plainbtn" data-action="speak" data-text="Sala! Mi bi SAMA.">▶ Пример речи</button><button class="plainbtn" data-action="stop-audio">■ Стоп</button></div>
 <h2>Гласные</h2><div class="sound-grid">${LETTERS.filter(l=>VOWELS.has(l.char.toLowerCase())).map(soundCard).join('')}</div>
 <h2>Согласные</h2><div class="sound-grid">${LETTERS.filter(l=>!VOWELS.has(l.char.toLowerCase())).map(soundCard).join('')}</div>
 <h2>Слоги для тренировки</h2><p>Короткие, отчётливые слоги — основа чтения. Попробуйте повторить их за синтезатором.</p><div class="toolrow">${['ma','me','mi','mo','mu','pa','pe','pi','po','pu','ka','ki','ko','sa','si','su','wa','wi','ya','yu'].map(s=>speakButton(s,`▶ ${s}`)).join('')}</div>
 <h2>Фразы для слуха</h2>${examples([['Sala!','Привет!'],['Mi si yu.','Я вижу тебя.'],['Mi pa si yu.','Я видел тебя.'],['Mi la si yu.','Я увижу тебя.'],['Yu toka basa SAMA ka?','Ты говоришь на SAMA?']])}`);populateVoices();}
function soundCard(l:Letter){return `<div class="sound-card"><div><span class="sound-letter">${l.char}</span> <span class="ipa">${A(l.ipa)}</span></div><p>${A(l.how)}</p><p class="mono">${A(l.example)}</p>${speakButton(l.example,'▶ Слушать')}</div>`;}
function renderGrammar(){setCrumb([{title:'Грамматика'}]);setRail(`<div class="rail-group"><div class="rail-title">Разделы грамматики</div>${ARTICLES.filter(x=>x.area==='grammar').map(x=>articleLink(x.id)).join('')}</div>`);const articles=ARTICLES.filter(a=>a.area==='grammar');setApp(`${pageTitle('Грамматика SAMA','Без грамматического рода, склонений существительных и неправильных глагольных форм.','Полный справочник')}
 <div class="section-banner">СЕМЬ ПРАВИЛ, КОТОРЫЕ НУЖНО ЗНАТЬ</div><ol><li>Порядок слов обычно <b>кто — действие — объект</b>.</li><li><b>mi / yu / ta</b> — я / ты / он, она, оно.</li><li><b>pa</b> — прошлое, <b>la</b> — будущее.</li><li><b>no</b> перед глаголом означает отрицание.</li><li><b>ka</b> в конце делает общий вопрос.</li><li><b>li</b> после имени или местоимения означает множество.</li><li><b>de</b> связывает предмет с его владельцем.</li></ol>
 <h2>Краткая справка</h2>${table(['Тема','Формула','Пример'],[['Простое утверждение','S + V + O','Mi si yu.'],['Прошлое','S + pa + V + O','Mi pa si yu.'],['Будущее','S + la + V + O','Mi la si yu.'],['Отрицание','S + no + V + O','Mi no si yu.'],['Вопрос','S + V + O + ka?','Yu si mi ka?'],['Множественность','имя + li','ami li'],['Притяжательность','предмет + de + владелец','doma de mi']])}
 <div class="toolrow"><a class="hero-primary" href="#/standard">Читать полный стандарт 0.3 ↗</a><a href="#/audit">Аудит словаря</a></div><div class="section-banner">ПОДРОБНЫЕ ГЛАВЫ</div><div class="article-index">${articles.map(a=>`<a href="${href(a.id)}">${A(a.title)}</a>`).join('')}</div>
 <h2>Читаем предложения</h2>${examples([['Mi ama yu.','Я люблю тебя.'],['Mi pa no si yu.','Я не видел тебя.'],['Ta li bi ami de mi.','Они мои друзья.'],['Yu bi kalo?','Где ты?']])}
 <div class="paper-note"><strong>Ограничения:</strong> придаточные и модальность описаны в <a href="#/standard">проекте стандарта 0.3</a>; пассив, аспект и точные календарные значения пока не утверждены. Это открытые части спецификации, а не скрытые исключения.</div>`);}
function wordStatus(w:Lexeme){return w.proposed?'<span class="badge-draft">проект</span>':'<span class="badge-core">базовое</span>';}
function favButton(w:string){return `<button class="favbtn ${favorites.has(w)?'favorited':''}" data-action="favorite" data-word="${A(w)}" title="${favorites.has(w)?'Убрать из избранного':'В избранное'}" aria-label="${favorites.has(w)?'Убрать':'Добавить'} ${A(w)} ${favorites.has(w)?'из':'в'} избранное">${favorites.has(w)?'★':'☆'}</button>`;}
function getDictionaryRows(query:string,tag:string,status=''){const q=query.toLowerCase().trim().replace(/ё/g,'е');return LEXICON.filter(w=>(!tag||tag===w.tag)&&(!status||w.status===status)&&(!q||(`${w.w} ${w.ru}`.replace(/ё/g,'е').toLowerCase().includes(q))));}
function dictionaryMarkup(rows:Lexeme[],page:number){const max=Math.max(1,Math.ceil(rows.length/DICT_PAGE_SIZE));const p=Math.min(max,Math.max(page,1));currentDictionaryPage=p;const show=rows.slice((p-1)*DICT_PAGE_SIZE,p*DICT_PAGE_SIZE);return `<div class="small muted">Найдено: <strong>${rows.length}</strong> · Показаны ${rows.length===0?'0':(p-1)*DICT_PAGE_SIZE+1}–${Math.min(p*DICT_PAGE_SIZE,rows.length)} · Алфавитный порядок</div>${rows.length?table(['Слово SAMA','Перевод','Тема','★'],show.map(w=>[`<a class="lex-word" href="#/word/${encodeURIComponent(w.w)}">${A(w.w)}</a> ${speakButton(w.w)}`,`${A(w.ru)} <span style="margin-left:4px">${wordStatus(w)}</span>`,A(w.tag),favButton(w.w)]),'lex-table'):'<div class="empty">Нет совпадений. Попробуйте другой перевод или снимите тематический фильтр.</div>'}${max>1?`<div class="pagination"><button data-action="dict-page" data-page="${p-1}" ${p===1?'disabled':''}>« Назад</button> Страница <b>${p}</b> из <b>${max}</b> <button data-action="dict-page" data-page="${p+1}" ${p===max?'disabled':''}>Вперёд »</button></div>`:''}`;}
function renderDictionary(initialQuery=''){setCrumb([{title:'Большой словарь'}]);setRail(`<div class="rail-group"><div class="rail-title">Справка</div><a href="#/article/dictionary-help">Как работать со словарём</a><a href="#/article/lexical-quality">Как создаются слова</a><a href="#/article/compounds">Составные слова</a></div><div class="rail-note">Словарь SAMA 0.3 разделяет рабочее ядро и кандидатов. 118 старых сочетаний вынесены в архив после проверки правил.</div>`);setApp(`${pageTitle('Большой словарь SAMA',`${LEXICON.length} записей: ${LEXICON.filter(w=>w.status==='core').length} в рабочем ядре, ${LEXICON.filter(w=>w.status==='candidate').length} кандидатов; фильтры и закладки.`,'Лексикон · редакция 0.3')}
 <div class="lex-controls"><input id="dictQuery" aria-label="Поиск слов в словаре" type="search" placeholder="Например: su, дом, учиться..." value="${A(initialQuery)}"><select id="dictTag" aria-label="Фильтр по теме"><option value="">Все темы</option>${uniqueTags.map(t=>`<option value="${A(t)}">${A(t)} (${countTagged(t)})</option>`).join('')}</select><select id="dictStatus" aria-label="Статус слова"><option value="">Все статусы</option><option value="core">Ядро 0.3</option><option value="candidate">Кандидаты</option></select><button class="plainbtn" data-action="export-csv" type="button">↓ Скачать CSV</button></div>
 <p class="small muted">Публикуются только формы с разъяснённым статусом. Отклонённые и спорные составные формы доступны в <a href="#/audit">журнале аудита</a>. Ни одно слово ещё не подтверждено международными тестами.</p>
 <div id="dictionaryResults">${dictionaryMarkup(getDictionaryRows(initialQuery,''),1)}</div>`);}
function refreshDictionary(newPage=1){const field=document.getElementById('dictQuery') as HTMLInputElement|null;const select=document.getElementById('dictTag') as HTMLSelectElement|null;const results=document.getElementById('dictionaryResults');if(field&&select&&results)results.innerHTML=dictionaryMarkup(getDictionaryRows(field.value,select.value,(document.getElementById('dictStatus') as HTMLSelectElement|null)?.value||''),newPage);}
function renderPhrases(){setCrumb([{title:'Разговорник'}]);setRail(`<div class="rail-group"><div class="rail-title">Полезные ссылки</div><a href="#/sounds">Звукарь</a><a href="#/lessons">Самоучитель</a><a href="#/article/dialogue">Правила диалога</a></div>`);let groups=[...new Set(PHRASES.map(p=>p.topic))];setApp(`${pageTitle('Разговорник SAMA',`${PHRASES.length} готовых фраз на каждый день. Нажмите ▶, чтобы услышать пример.`,'Практическая речь')}
 <div class="lex-controls"><input id="phraseFilter" type="search" placeholder="Поиск фразы или перевода..." aria-label="Поиск фраз"><span class="small muted">Фразы базовой учебной версии</span></div><div id="phrasesResults">${phraseMarkup(PHRASES,groups)}</div>`);}
function phraseMarkup(items:Phrase[],groups:string[]){return items.length?groups.map(t=>{const list=items.filter(p=>p.topic===t);return list.length?`<div class="phrase-group"><h3>${A(t)} (${list.length})</h3>${examples(list.map(p=>[p.sama,p.ru]))}</div>`:''}).join(''):'<div class="empty">Фразы не найдены.</div>';}
function renderNumbers(){setCrumb([{title:'Числа и даты'}]);setRail(`<div class="rail-group"><div class="rail-title">Читайте подробнее</div>${articleLink('number-formation')}${articleLink('numbers-syntax')}</div>`);setApp(`${pageTitle('Числа и счёт','В SAMA числа не изменяются по роду или падежу.','Справочник')}
 ${table(['Число','Слово SAMA','Слушать'],COUNTS.map(([w,n])=>[A(n),`<span class="sama-text">${A(w)}</span>`,speakButton(w)]))}
 <h2>Составные числа</h2>${examples([['tena una','11'],['dua tena','20'],['dua tena una','21'],['pema tena','50'],['sena dua tena tia','123'],['dua sena tia tena pala','234']])}
 <div class="paper-note"><b>Формула:</b> крупный разряд + меньший разряд, без изменения слов. <b>dua tena una</b> = 2×10 + 1. Даты, календарь и дробные числа пока ожидают отдельного стандарта.</div>`);}
function renderLessons(){setCrumb([{title:'Самоучитель'}]);setRail(`<div class="rail-group"><div class="rail-title">Практика</div><a href="#/start">Как начать</a><a href="#/trainer">Тренажёр</a><a href="#/phrases">Разговорник</a></div>`);const done=LESSONS.filter((_,i)=>completed.has(String(i))).length;setApp(`${pageTitle('Самоучитель SAMA',`${LESSONS.length} коротких урока от первых звуков до разговоров и словообразования.`,'Курс для начинающих')}
 <p><b>Пройдено уроков:</b> ${done} из ${LESSONS.length}</p><div class="progressbar" aria-label="Прогресс курса"><div class="progressfill" style="width:${100*done/LESSONS.length}%"></div></div>
 ${LESSONS.map((l,i)=>`<div class="lesson-item"><span class="lesson-index">${String(i+1).padStart(2,'0')}</span><a href="#/lesson/${i}"><b>${A(l.title)}</b></a><span class="lesson-level">${A(l.level)}</span>${completed.has(String(i))?'<span class="lesson-done">✓ ПРОЙДЕНО</span>':''}<p>${A(l.intro)}</p></div>`).join('')}
 <div class="paper-note"><b>Локальный прогресс:</b> отметки о прохождении хранятся только в вашем браузере. Регистрация не требуется.</div>`);}
function renderLesson(index:number){const l=LESSONS[index];if(!l)return renderNotFound();setCrumb([{title:'Самоучитель',path:'lessons'},{title:`Урок ${index+1}`}]);setRail(`<div class="rail-group"><div class="rail-title">Курс</div><p class="small">Урок ${index+1} / ${LESSONS.length}</p><a href="#/lessons">Все уроки</a>${index>0?`<a href="#/lesson/${index-1}">← Предыдущий</a>`:''}${index<LESSONS.length-1?`<a href="#/lesson/${index+1}">Следующий →</a>`:''}</div>`);setApp(`${pageTitle(`${String(index+1).padStart(2,'0')}. ${l.title}`,l.intro,`Самоучитель · ${l.level}`)}
 <div class="section-banner">ГЛАВНОЕ</div><ul>${l.rules.map(r=>`<li>${A(r)}</li>`).join('')}</ul><h2>Примеры</h2>${examples(l.examples)}<h2>Попробуйте сами</h2><div class="featurebox"><b>${A(l.task)}</b><details class="answer-reveal"><summary>Показать ответ и проверить себя</summary><p><b>${A(l.answer)}</b></p></details></div>
 <div class="toolrow"><button class="plainbtn" data-action="complete" data-lesson="${index}">${completed.has(String(index))?'✓ Пройдено · отменить отметку':'✓ Отметить урок пройденным'}</button><a href="#/trainer">Практика в тренажёре</a></div><hr style="border:0;border-top:1px dotted #c1cccf;margin:25px 0 13px"><div class="toolrow">${index>0?`<a href="#/lesson/${index-1}">« Предыдущий урок</a>`:''}<a href="#/lessons">Все уроки</a>${index<LESSONS.length-1?`<a href="#/lesson/${index+1}">Следующий урок »</a>`:''}</div>`);}
function renderLibrary(){setCrumb([{title:'Энциклопедия'}]);setRail(mainRail());setApp(`${pageTitle('Энциклопедия SAMA',`${ARTICLES.length} статей и глав (старые статьи помечены как архивные), объединённых в ${ARTICLE_SECTIONS.length} тематических разделов.`,'Указатель статей')}
 <div class="article-toc"><b>Разделы:</b>${ARTICLE_SECTIONS.map(s=>`<a href="#/library" data-anchor="topic-${A(s.id)}">${A(s.name)} (${ARTICLES.filter(a=>a.area===s.id).length})</a>`).join('')}</div>
 ${ARTICLE_SECTIONS.map(s=>`<section id="topic-${s.id}"><h2>${A(s.name)}</h2>${ARTICLES.filter(a=>a.area===s.id).map(a=>`<div class="article-card"><a href="${href(a.id)}">${A(a.title)}</a><p>${A(a.desc)}</p></div>`).join('')}<p class="small"><a href="#/topic/${s.id}">Страница раздела »</a></p></section>`).join('')}`);}
function renderTopic(id:string){const section=ARTICLE_SECTIONS.find(s=>s.id===id);if(!section)return renderNotFound();const articles=ARTICLES.filter(a=>a.area===id);setCrumb([{title:'Энциклопедия',path:'library'},{title:section.name}]);setRail(`<div class="rail-group"><div class="rail-title">Соседние разделы</div>${ARTICLE_SECTIONS.filter(s=>s.id!==id).map(s=>`<a href="#/topic/${s.id}">${A(s.name)}</a>`).join('')}</div>`);setApp(`${pageTitle(section.name,`${articles.length} статей в разделе.`, 'Энциклопедия · Раздел')}${articles.map(a=>`<div class="article-card"><a href="${href(a.id)}">${A(a.title)}</a><p>${A(a.desc)}</p></div>`).join('')}`);}
function renderArticle(id:string){const a=ARTICLES.find(a=>a.id===id);if(!a)return renderNotFound();const linked=(a.related||[]).filter(id=>ARTICLES.some(x=>x.id===id));setCrumb([{title:'Энциклопедия',path:'library'},{title:topicName(a.area),path:`topic/${a.area}`},{title:a.title}]);setRail(`<div class="rail-group"><div class="rail-title">См. также</div>${linked.map(articleLink).join('')||'<span class="small muted">Ссылки появятся позднее</span>'}</div><div class="rail-group"><div class="rail-title">Тема</div><a href="#/topic/${A(a.area)}">${A(topicName(a.area))}</a><a href="#/library">Все статьи</a></div><div class="rail-note">Языковое ядро 0.3 — рабочий проект, не международно утверждённый стандарт.</div>`);setApp(`${pageTitle(a.title,a.desc,`Энциклопедия SAMA → ${topicName(a.area)}`)}
 <div class="tagline">Редакция: ${A(a.edition||'0.1')} · Статус: ${A(a.status||'архив')} · <button type="button" class="textbutton" style="display:inline" data-action="print">Печать страницы</button></div>
 ${a.status==='reference'?'<div class="paper-note"><b>Архивный учебный материал 0.1.</b> Текст сохранён для истории и может не совпадать с проектом стандарта <a href="#/standard">0.3</a>. Для изучения правил используйте актуальные главы.</div>':''}<div class="article-body">${a.paragraphs.map(p=>`<p>${A(p)}</p>`).join('')}${a.examples?`<h2>Примеры</h2>${examples(a.examples)}`:''}</div>
 ${linked.length?`<h2>См. также</h2><div class="related-links">${linked.map(articleLink).join('')}</div>`:''}
 <p style="margin-top:25px"><a href="#/library">« К указателю энциклопедии</a></p>`);}
interface QuizState {order:number[];index:number;answered:boolean;selected:number|null;points:number;}
let quizState:QuizState|null=null;
function createQuiz(){const order=QUIZ.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}quizState={order:order.slice(0,10),index:0,answered:false,selected:null,points:0};}
function renderTrainer(){setCrumb([{title:'Тренажёр'}]);setRail(`<div class="rail-group"><div class="rail-title">Система проверки</div><p class="small">10 случайных вопросов из ${QUIZ.length}. Один правильный ответ на вопрос.</p></div><div class="rail-note">Лучший результат сохраняется на этом устройстве без отправки на сервер.</div>`);if(!quizState)createQuiz();renderQuizIntoApp();}
function renderQuizIntoApp(){const st=quizState;if(!st)return;const best=(()=>{try{return Number(localStorage.getItem(STORAGE_BEST)||0);}catch{return 0;}})();if(st.index>=st.order.length){if(st.points>best){try{localStorage.setItem(STORAGE_BEST,String(st.points));}catch{}}setApp(`${pageTitle('Тренажёр · результат','Первый этап выполнен. Сверьте ошибки с грамматикой и начните новую попытку.','Практика')}
 <div class="quiz-card"><div class="rail-number">${st.points} / ${st.order.length}</div><h3>${st.points===st.order.length?'Отлично!':st.points>=7?'Хороший результат.':'Стоит повторить темы курса.'}</h3><p>Лучший результат: ${Math.max(st.points,best)} / 10.</p><div class="toolrow"><button class="plainbtn" data-action="restart-quiz">↻ Новый тест</button><a href="#/lessons">Перейти к урокам</a></div></div>`);return;}
 const item=QUIZ[st.order[st.index]];
 setApp(`${pageTitle('Тренажёр SAMA','10 случайных вопросов по словам, грамматике и чтению.','Самопроверка')}
 <div class="quiz-meta"><span>Вопрос ${st.index+1} из ${st.order.length}</span><span>Правильных ответов: ${st.points}</span></div><div class="progressbar"><div class="progressfill" style="width:${100*(st.index+(st.answered?1:0))/st.order.length}%"></div></div>
 <div class="quiz-card"><h3>${A(item.q)}</h3>${item.options.map((option,i)=>`<button class="quiz-choice ${st.answered?(i===item.correct?'correct':st.selected===i?'wrong':''):''}" type="button" data-action="quiz-answer" data-choice="${i}" ${st.answered?'disabled':''}>${String.fromCharCode(65+i)}. ${A(option)}</button>`).join('')}
 ${st.answered?`<div class="quiz-feedback"><b>${st.selected===item.correct?'Правильно!':'Правильный вариант: '+A(item.options[item.correct])}</b><br>${A(item.explain)}</div><button type="button" class="plainbtn" data-action="quiz-next">${st.index===st.order.length-1?'Показать итог »':'Следующий вопрос »'}</button>`:''}</div><p class="small muted">Тест составлен по базовым правилам SAMA; новые конструкции пока проверяются отдельно.</p>`);}
function renderFavorites(){setCrumb([{title:'Избранное'}]);setRail(mainRail());const words=LEXICON.filter(w=>favorites.has(w.w));setApp(`${pageTitle('Избранные слова',`${words.length} сохранённых записей. Избранное доступно только в этом браузере.`,'Личный словарь')}
 ${words.length?table(['Слово','Значение','★'],words.map(w=>[`<a class="lex-word" href="#/word/${encodeURIComponent(w.w)}">${A(w.w)}</a> ${speakButton(w.w)}`,A(w.ru),favButton(w.w)])):'<div class="empty">Пока ничего не добавлено. Откройте <a href="#/dictionary">словарь</a> и нажмите звёздочку рядом со словом.</div>'}<div class="toolrow"><a href="#/dictionary">Открыть полный словарь »</a></div>`);}
function renderAbout(){setCrumb([{title:'О проекте'}]);setRail(mainRail());setApp(`${pageTitle('О проекте SAMA','Нейтральный вспомогательный международный язык и его открытая энциклопедия.','Редакция 0.3')}
 <p>SAMA — разрабатываемый искусственный язык, ориентированный на людей с разными родными языками. В редакции 0.3 опубликовано рабочее ядро грамматики и прозрачный журнал словарных исправлений; весь язык по-прежнему экспериментальный.</p>
 <h2>Принципы</h2><ul><li>Звуки должны быть понятны и не требовать редких артикуляций.</li><li>Грамматика должна быть последовательной и минимально исключительной.</li><li>Словарь следует тестировать на носителях разных языков мира.</li><li>Материалы должны оставаться доступны без регистрации и платного доступа.</li><li>Родные языки не заменяются: SAMA — исключительно дополнительный инструмент.</li></ul>
 <h2>Что работает сейчас</h2>${table(['Функция','Состояние'],[['Букварь, звукарь','17 букв; произносительные примеры через системный голос'],['Энциклопедия',`${ARTICLES.length} справочных статей и глав`],['Словарь',`${LEXICON.length} записей и тематический фильтр`],['Самоучитель',`${LESSONS.length} урока с локальным прогрессом`],['Разговорник',`${PHRASES.length} фраз`],['Тренажёр',`${QUIZ.length} задания, случайная подборка`],['Публикация','Статический сайт; хостинг и база данных не нужны']])}
 <h2>Актуальный стандарт и редакторский аудит</h2><p><a href="#/standard">Спецификация 0.3</a> систематизирует правила и отмечает гипотезы. <a href="#/audit">Журнал аудита</a> документирует пересмотр сомнительных слов и исторических значений.</p><h2>Что пока не готово</h2><p>Официальная фонетическая запись, полный словарь без омонимии, детальные правила сложных предложений, одобренные языковым сообществом и проверенные международными испытаниями нормы, а также записанный носителем аудиокорпус.</p><div class="paper-note"><b>Лицензия кода:</b> MIT. Рекомендуется сохранять пометку об экспериментальном статусе материалов при публикации модификаций.</div>`);}
function renderChangelog(){setCrumb([{title:'История версий'}]);setRail(mainRail());setApp(`${pageTitle('История версий','Развитие SAMA фиксируется по редакциям: без скрытого изменения норм.','Архив проекта')}
 <h2>Редакция 0.3 — ноябрь 2026</h2><p>Новая версия: подробный проект грамматики, разделение основ и кандидатов, нормализованный словарь, страницы слов, архив конфликтов и автоматические проверки данных.</p><h2>Редакция 0.1 — ноябрь 2026</h2><ul><li>Предложен алфавит из 17 букв и пять основных гласных.</li><li>Описаны SVO, местоимения, простые маркеры времени и отрицания.</li><li>Создан расширенный учебный словарь и первые разговорные фразы.</li><li>Опубликованы 58 учебных статей, 24 урока, 36 заданий.</li><li>Добавлена браузерная озвучка, закладки, поиск и отслеживание прохождения уроков.</li></ul>
 <h2>Следующие задачи</h2><ul><li>Проверить оставшиеся многозначности и кандидаты составных слов на независимых примерах.</li><li>Утвердить допустимые формы слога.</li><li>Провести экспериментальную проверку новых конструкций ke, ye…ya и модальных выражений.</li><li>Записать эталонные звуки с участием носителей.</li><li>Провести международные тесты изучаемости.</li></ul>`);}
function renderSearch(query:string){const q=query.toLowerCase().trim();setCrumb([{title:'Поиск'}]);setRail(mainRail());if(!q){setApp(`${pageTitle('Поиск по энциклопедии','Введите слово SAMA, перевод на русский или название темы.')}`);return;}const matches=LEXICON.filter(x=>`${x.w} ${x.ru} ${x.tag}`.toLowerCase().includes(q)).slice(0,45);const arts=ARTICLES.filter(x=>`${x.title} ${x.desc} ${x.paragraphs.join(' ')}`.toLowerCase().includes(q)).slice(0,30);const lessons=LESSONS.map((l,i)=>({...l,i})).filter(x=>`${x.title} ${x.intro} ${x.rules.join(' ')}`.toLowerCase().includes(q)).slice(0,20);const phrases=PHRASES.filter(p=>`${p.sama} ${p.ru}`.toLowerCase().includes(q)).slice(0,18);setApp(`${pageTitle(`Поиск: «${query}»`,`${matches.length} словарных записей, ${arts.length} статей, ${lessons.length} уроков, ${phrases.length} фраз (показаны первые совпадения).`,'Результаты поиска')}
 ${!matches.length&&!arts.length&&!lessons.length&&!phrases.length?'<div class="empty">Совпадений нет. Попробуйте короткое слово или другую форму русского перевода.</div>':''}
 ${matches.length?`<h2>Словарь</h2>${table(['Слово','Значение'],matches.map(w=>[`<a href="#/word/${encodeURIComponent(w.w)}">${A(w.w)}</a>`,A(w.ru)]))}`:''}
 ${arts.length?`<h2>Статьи энциклопедии</h2>${arts.map(a=>`<div class="article-card"><a href="${href(a.id)}">${A(a.title)}</a><p>${A(a.desc)}</p></div>`).join('')}`:''}
 ${lessons.length?`<h2>Уроки</h2>${lessons.map(l=>`<p><a href="#/lesson/${l.i}">${A(l.title)}</a> — ${A(l.intro)}</p>`).join('')}`:''}
 ${phrases.length?`<h2>Фразы</h2>${examples(phrases.map(p=>[p.sama,p.ru]))}`:''}`);}
function renderNotFound(){setCrumb([{title:'Страница не найдена'}]);setRail(mainRail());setApp(`${pageTitle('Страница не найдена','Проверьте адрес или перейдите в общий указатель энциклопедии.')}${['/','/library','/dictionary','/lessons'].map((r,i)=>`<p><a href="#${r}">${['Главная страница','Энциклопедия','Большой словарь','Самоучитель'][i]} »</a></p>`).join('')}`);}

function renderStandard(){
 setCrumb([{title:'Стандарт 0.3'}]);
 setRail(`<div class="rail-group"><div class="rail-title">В документе</div>${HANDBOOK.map(c=>`<a href="#/standard" data-anchor="std-${A(c.id)}">${A(c.title)}</a>`).join('')}</div><div class="rail-note">Нормы ядра — внутренние рабочие правила. Внешняя языковая экспертиза пока не проводилась.</div>`);
 setApp(`${pageTitle('SAMA · спецификация языка 0.3','Связная модель фонетики, грамматики и словообразования. Правила отделены от экспериментальных гипотез.','Ядро языка · версия 0.3')}
 <div class="standard-alert"><b>Документ для разработки, а не завершённый международный стандарт.</b> Ни одна грамматическая конструкция не прошла полноценные межъязыковые испытания. <a href="#/audit">Открыть журнал лексических исправлений</a>.</div>
 <div class="article-toc">${HANDBOOK.map((c,i)=>`<a href="#/standard" data-anchor="std-${A(c.id)}">${String(i+1).padStart(2,'0')}. ${A(c.title)}</a>`).join('')}</div>
 ${HANDBOOK.map((c,i)=>`<section class="standard-chapter" id="std-${A(c.id)}"><div class="eyebrow">ГЛАВА ${String(i+1).padStart(2,'0')} · ${c.level==='core'?'РАБОЧЕЕ ЯДРО':'ЭКСПЕРИМЕНТ'}</div><h2>${A(c.title)}</h2><p>${A(c.summary)}</p><ol>${c.rules.map(r=>`<li>${A(r)}</li>`).join('')}</ol>${c.examples.length?examples(c.examples.map(x=>[x.sama,x.ru])):''}<div class="standard-notes">${c.notes.map(n=>`<p>${A(n)}</p>`).join('')}</div><a href="${href('standard-'+c.id)}">Энциклопедическая статья →</a></section>`).join('')}`);
}
function renderAudit(){
 setCrumb([{title:'Аудит словаря'}]);setRail(`<div class="rail-group"><div class="rail-title">Что проверялось</div><a href="#/standard">Спецификация 0.3</a><a href="#/article/standard-lexicon-core">Правила лексикографии</a><a href="#/dictionary">Актуальный словарь</a></div>`);
 setApp(`${pageTitle('Аудит и журнал исправлений','Видимые решения по конфликтным значениям и неподтверждённым составным формам. Ничего не стирается без следа.','Редакторский контроль · 0.3')}
 <div class="stats"><div class="stat"><strong>${AUDIT.legacyTotal}</strong><span>исходных строк</span></div><div class="stat"><strong>${AUDIT.legacyUnique}</strong><span>уникальных форм 0.2</span></div><div class="stat"><strong>${AUDIT.quarantine.length}</strong><span>архивных составных форм</span></div><div class="stat"><strong>${AUDIT.visible}</strong><span>опубликованных форм 0.3</span></div></div>
 <div class="paper-note">Архивная форма не обязательно «неправильная навсегда»: она исключена из основного словаря до проверки значения и морфологии. Исправление не означает, что новая форма уже утверждена носителями.</div>
 <h2>Противоречащие значения (${AUDIT.conflicts.length})</h2>${table(['Слово','Как было','Редакторское решение'],AUDIT.conflicts.map(x=>[`<a href="#/word/${encodeURIComponent(x.w)}">${A(x.w)}</a>`,A(x.oldMeanings.join(' / ')),A(x.decision)]))}
 <h2>Перенесённые в архив сочетания (${AUDIT.quarantine.length})</h2><p>Их определения сохранены здесь и в <code>content/legacy/quarantine.json</code>. В учебном словаре они больше не отображаются как готовая лексика.</p>${table(['Старое сочетание','Старое значение','Причина / замена'],AUDIT.quarantine.map(x=>[`<code>${A(x.w)}</code>`,A(x.oldMeaning),A(x.reason)]))}
 <h2>Как проверять новые слова</h2><p>Все записи находятся в <code>content/lexicon.json</code>. Команда <code>npm run validate</code> проверяет дубли, недопустимые символы, схему данных, связанные статьи и учебные предложения. Автоматическая проверка не заменяет семантической экспертизы.</p>`);
}
function renderWord(word:string){
 const entry=LEXICON.find(x=>x.w===word.toLowerCase());if(!entry)return renderNotFound();
 const related=LEXICON.filter(x=>x.w!==entry.w&&(x.tag===entry.tag||x.w.includes(entry.w))).slice(0,10);
 const phrases=PHRASES.filter(x=>x.sama.toLowerCase().split(/[^a-z-]+/).includes(entry.w)).slice(0,8);
 setCrumb([{title:'Словарь',path:'dictionary'},{title:entry.w}]);
 setRail(`<div class="rail-group"><div class="rail-title">Карточка слова</div><span class="small muted">${A(entry.tag)}</span><a href="./pages/words/${encodeURIComponent(entry.w)}.html">Постоянная HTML-страница</a><a href="#/dictionary?q=${encodeURIComponent(entry.w)}">В словаре</a></div><div class="rail-note">Браузерная озвучка приблизительна: эталонная запись ещё не опубликована.</div>`);
 setApp(`${pageTitle(entry.w,entry.ru,'Словарная карточка · SAMA 0.3')}
 <div class="word-hero"><div class="word-large" lang="und">${A(entry.w)}</div>${speakButton(entry.w,'▶ Прослушать (приблизительно)')}${wordStatus(entry)}${favButton(entry.w)}</div>
 <h2>Значение</h2><p class="lead">${A(entry.ru)}</p>${entry.note?`<div class="paper-note"><b>Примечание редактора:</b> ${A(entry.note)}</div>`:''}
 <h2>Статус</h2><p>${entry.status==='core'?'Внутреннее ядро редакции 0.3; внешняя международная проверка ещё предстоит.':'Кандидат, требующий семантической, фонетической и межъязыковой проверки.'}</p>
 ${phrases.length?`<h2>В примерах</h2>${examples(phrases.map(x=>[x.sama,x.ru]))}`:''}
 <h2>Связанные слова</h2><div class="article-index">${related.map(x=>`<a href="#/word/${encodeURIComponent(x.w)}">${A(x.w)} — ${A(x.ru)}</a>`).join('')}</div>
 <div class="toolrow"><a href="#/dictionary">← Словарь</a><a href="#/audit">История редакции</a></div>`);
}


// On-demand dictionary workbench: forms are hypotheses, not officially accepted vocabulary.
interface BankEntry {form:string;sense_ru:string;definition_ru:string;class:string;theme:string;part_of_speech:string;status:'core'|'candidate'|'proposal';revision:string;origin:string;ipa_draft:string;parts:string[];morpheme_glosses?:string[];source_reliability?:string;examples:{sama:string;ru:string}[];needs_review:string[];editorial_score?:number;}
let wordbankData:BankEntry[]|null=null;
let wordbankPage=1;
async function loadWordbank():Promise<BankEntry[]>{
 if(wordbankData)return wordbankData;
 const response=await fetch('./assets/wordbank-5000.json');
 if(!response.ok)throw new Error('Не загружен рабочий корпус: HTTP '+response.status);
 const data:BankEntry[]=await response.json();
 if(data.length!==5000)throw new Error('Корпус неполон — '+data.length+' записей вместо 5000');
 return wordbankData=data;
}
function updateWordbankTable(){
 const output=document.getElementById('wordbankResults');if(!output||!wordbankData)return;
 const input=document.getElementById('wordbankQuery') as HTMLInputElement|null;
 const status=document.getElementById('wordbankStatus') as HTMLSelectElement|null;
 const query=(input?.value||'').trim().toLocaleLowerCase('ru-RU');
 const subset=wordbankData.filter(w=>{const matched=!query||`${w.form} ${w.sense_ru} ${w.definition_ru} ${w.theme}`.toLocaleLowerCase('ru-RU').includes(query);return matched&&(!status?.value||w.status===status.value);});
 const limit=35,max=Math.max(1,Math.ceil(subset.length/limit));wordbankPage=Math.max(1,Math.min(wordbankPage,max));
 const begin=(wordbankPage-1)*limit;const page=subset.slice(begin,begin+limit);
 output.innerHTML=`<div class="lex-counter">Найдено ${subset.length} из 5000. Страница ${wordbankPage} из ${max}. Новые формы — предложения, а не проверенный язык.</div>`+
  table(['Форма SAMA','Предварительное значение','Статус'],page.map(w=>[
    `<a class="lex-word" href="#/proposal/${encodeURIComponent(w.form)}">${A(w.form)}</a>`,A(w.sense_ru),w.status==='core'?'ядро 0.3':w.status==='candidate'?'кандидат 0.3':'предложение 0.4']))+
  `<div class="pagination"><button type="button" data-action="wordbank-page" data-page="${wordbankPage-1}" ${wordbankPage===1?'disabled':''}>« Назад</button> ${wordbankPage} / ${max} <button type="button" data-action="wordbank-page" data-page="${wordbankPage+1}" ${wordbankPage===max?'disabled':''}>Вперёд »</button></div>`;
}
async function renderWordbank(){
 setCrumb([{title:'Лаборатория 5000'}]);
 setRail('<div class="rail-group"><div class="rail-title">Статусы</div><a href="#/dictionary">Действующий рабочий словарь</a><a href="#/standard">Правила сложения основ</a><a href="#/audit">История аудита</a></div><div class="rail-note">4683 автоматически составленных кандидата не проходили независимой лингвистической экспертизы.</div>');
 setApp(`${pageTitle('Лексическая лаборатория: 5000 записей','Редакционный корпус для изучения и отбора новых слов. Не заменяет основной словарь SAMA.','Исследование · редакция 0.4')}
 <div class="lex-warning"><b>Важное ограничение.</b> Это <b>не 5000 утверждённых слов</b>. В корпусе 43 формы рабочего ядра, 274 прежних кандидата и 4683 автоматически предложенных сочетания. Они семантически размечены и проверены программно, но не подтверждены носителями языков и лингвистами. Простое словосочетание не следует автоматически признавать отдельным словом.</div>
 <div class="lex-statrow"><div class="lex-stat"><b>5000</b> учётных записей</div><div class="lex-stat"><b>43</b> рабочее ядро</div><div class="lex-stat"><b>274</b> прежние кандидаты</div><div class="lex-stat"><b>4683</b> составные предложения</div></div>
 <div class="lex-field"><input type="search" id="wordbankQuery" placeholder="Поиск формы или русского значения…" aria-label="Поиск по лаборатории"><select id="wordbankStatus" aria-label="Фильтр статуса"><option value="">Все статусы</option><option value="core">Ядро 0.3</option><option value="candidate">Кандидаты 0.3</option><option value="proposal">Предложения 0.4</option></select></div>
 <div id="wordbankResults"><p>Загружаю словарный корпус…</p></div>`);
 try{await loadWordbank();if(parseRoute().path==='wordbank')updateWordbankTable();}
 catch(e){if(parseRoute().path==='wordbank'){const out=document.getElementById('wordbankResults');if(out)out.innerHTML=`<div class="lex-warning">Ошибка загрузки: ${A(String(e))}. Откройте сайт через HTTP-сервер, а не двойным щелчком на HTML-файле.</div>`;}}
}
async function renderProposal(form:string){
 setCrumb([{title:'Лаборатория 5000',path:'wordbank'},{title:form}]);
 setRail('<div class="rail-group"><div class="rail-title">Контроль качества</div><a href="#/wordbank">← Все 5000 записей</a><a href="#/standard">Правила SAMA</a><a href="#/dictionary">Проверенный словарь</a></div>');
 setApp('<p>Загрузка карточки…</p>');
 try{const bank=await loadWordbank();if(parseRoute().path!==`proposal/${form}`)return;const w=bank.find(x=>x.form===form);if(!w){renderNotFound();return;}
 setApp(`${pageTitle(w.form,w.sense_ru,'Лексикографическая карточка · '+w.revision)}
 <div class="lex-warning"><b>${w.status==='proposal'?'Предложение, не утверждено':w.status==='candidate'?'Кандидат старого словаря':'Рабочее ядро'}.</b> Фонетика, семантическая прозрачность и употребление нуждаются в проверке. Не следует ссылаться на карточку как на установленную норму языка.</div>
 <div class="lex-detail"><b>Предварительное определение</b><p>${A(w.definition_ru)}</p><b>Произношение (проект)</b><p>${A(w.ipa_draft)} ${speakButton(w.form,'▶ Озвучить приблизительно')}</p><b>Часть речи</b><p>${A(w.part_of_speech)}</p><b>Элементы слова</b><p>${A(w.parts.join(' + '))}${w.morpheme_glosses?' — '+A(w.morpheme_glosses.join(' / ')):''}</p><b>Источник формы</b><p>${A(w.origin)}</p></div>
 ${w.examples?.length?`<h2>Иллюстрация, не пример реального употребления</h2>${examples(w.examples.map(x=>[x.sama,x.ru]))}`:''}
 <h2>Что ещё проверить</h2><ul>${w.needs_review.map(x=>`<li>${A(x)}</li>`).join('')}</ul><p><a href="#/wordbank">« К лаборатории</a></p>`);}
 catch(e){setApp(`<p class="lex-warning">Не удалось открыть карточку: ${A(String(e))}</p>`)}
}

function parseRoute(){const value=location.hash.slice(1)||'/';const at=value.indexOf('?');return{path:(at<0?value:value.slice(0,at)).replace(/^\/+|\/+$/g,''),query:new URLSearchParams(at<0?'':value.slice(at+1))};}
function render(){const {path,query}=parseRoute();document.querySelectorAll('.primary-nav a').forEach(el=>el.classList.toggle('active',(el as HTMLAnchorElement).dataset.nav===(path.split('/')[0]||'home')));
 document.querySelectorAll('.sidebar a').forEach(el=>{
   const link=(el as HTMLAnchorElement).getAttribute('href')?.replace(/^#\//,'').split('?')[0];
   const active=link===path;
   el.classList.toggle('active',active);
   if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
 });if(path==='')renderHome();else if(path==='start')renderStart();else if(path==='alphabet')renderAlphabet();else if(path==='sounds')renderSounds();else if(path==='grammar')renderGrammar();else if(path==='dictionary')renderDictionary(query.get('q')||'');else if(path==='wordbank')void renderWordbank();else if(path.startsWith('proposal/'))void renderProposal(decodeURIComponent(path.slice(9)));else if(path.startsWith('word/'))renderWord(decodeURIComponent(path.slice(5)));else if(path==='standard')renderStandard();else if(path==='audit')renderAudit();else if(path==='phrases')renderPhrases();else if(path==='numbers')renderNumbers();else if(path==='lessons')renderLessons();else if(path.startsWith('lesson/'))renderLesson(Number(path.split('/')[1]));else if(path==='library')renderLibrary();else if(path.startsWith('topic/'))renderTopic(decodeURIComponent(path.slice(6)));else if(path.startsWith('article/'))renderArticle(decodeURIComponent(path.slice(8)));else if(path==='trainer')renderTrainer();else if(path==='favorites')renderFavorites();else if(path==='about')renderAbout();else if(path==='changelog')renderChangelog();else if(path==='search')renderSearch(query.get('q')||'');else renderNotFound();const h=app.querySelector('h1');document.title=(h?.textContent||'SAMA')+' | Энциклопедия SAMA';}
function populateVoices(){const v=document.getElementById('voiceSelect') as HTMLSelectElement|null;if(!v||!('speechSynthesis' in window))return;const voices=window.speechSynthesis.getVoices();const opts=voices.map(voice=>({value:`${voice.voiceURI}`,text:`${voice.name} (${voice.lang})`}));v.innerHTML='<option value="">Автоматически</option>'+opts.map(o=>`<option value="${A(o.value)}" ${chosenVoice===o.value?'selected':''}>${A(o.text)}</option>`).join('');}
function speak(value:string){if(!('speechSynthesis' in window)){notify('Синтез речи не поддерживается этим браузером.');return;}const utter=new SpeechSynthesisUtterance(value.replace(/-/g,' '));const voices=window.speechSynthesis.getVoices();const picked=voices.find(v=>v.voiceURI===chosenVoice)||voices.find(v=>/^it(-|$)/i.test(v.lang))||voices.find(v=>/^es(-|$)/i.test(v.lang))||voices.find(v=>/^ru(-|$)/i.test(v.lang))||voices[0];if(picked){utter.voice=picked;utter.lang=picked.lang;}else utter.lang='it-IT';utter.rate=audioSpeed;utter.pitch=1;window.speechSynthesis.cancel();window.speechSynthesis.speak(utter);}
function exportCSV(){const csv='\uFEFF'+['SAMA;Перевод;Тема;Статус;Примечание',...LEXICON.map(w=>[w.w,w.ru,w.tag,w.status==='candidate'?'Кандидат':'Ядро 0.3',w.note||''].map(c=>`"${c.replace(/"/g,'""')}"`).join(';'))].join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='sama-dictionary-v0.3.csv';document.body.append(a);a.click();a.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1200);notify('CSV-файл подготовлен.');}
function onAction(e:MouseEvent){const target=(e.target as Element).closest<HTMLElement>('[data-action]');if(!target)return;const action=target.dataset.action||'';
 switch(action){
 case 'speak':speak(target.dataset.text||'');break;
 case 'stop-audio':if('speechSynthesis' in window)window.speechSynthesis.cancel();break;
 case 'letter':{const letter=target.dataset.letter||'A';document.querySelectorAll('.letter-cell').forEach(el=>el.classList.toggle('selected',(el as HTMLElement).dataset.letter===letter));const panel=document.getElementById('letterPanel');if(panel)panel.innerHTML=letterDetails(letter);break;}
 case 'dict-page':refreshDictionary(Number(target.dataset.page)||1);document.getElementById('dictionaryResults')?.scrollIntoView({block:'start'});break;
 case 'wordbank-page':wordbankPage=Number(target.dataset.page)||1;updateWordbankTable();document.getElementById('wordbankResults')?.scrollIntoView({block:'start'});break;
 case 'export-csv':exportCSV();break;
 case 'favorite':{const w=target.dataset.word||'';if(favorites.has(w))favorites.delete(w);else favorites.add(w);storeArray(STORAGE_FAV,[...favorites]);if(parseRoute().path==='favorites')renderFavorites();else {document.querySelectorAll<HTMLElement>('[data-action="favorite"]').forEach(el=>{if(el.dataset.word===w){el.classList.toggle('favorited',favorites.has(w));el.textContent=favorites.has(w)?'★':'☆';el.title=favorites.has(w)?'Убрать из избранного':'В избранное';}});}notify(favorites.has(w)?'Слово сохранено в избранном.':'Слово удалено из избранного.');break;}
 case 'complete':{const i=String(target.dataset.lesson||'0');if(completed.has(i))completed.delete(i);else completed.add(i);storeArray(STORAGE_DONE,[...completed]);renderLesson(Number(i));notify(completed.has(i)?'Урок отмечен как пройденный.':'Отметка снята.');break;}
 case 'quiz-answer':{const st=quizState;if(!st||st.answered)return;st.answered=true;st.selected=Number(target.dataset.choice);if(st.selected===QUIZ[st.order[st.index]].correct)st.points++;renderQuizIntoApp();break;}
 case 'quiz-next':if(quizState){quizState.index++;quizState.answered=false;quizState.selected=null;renderQuizIntoApp();}break;
 case 'restart-quiz':createQuiz();renderQuizIntoApp();break;
 case 'print':window.print();break;
 }
}
app.addEventListener('click',onAction);
siteSearch.addEventListener('submit',e=>{e.preventDefault();location.hash='#/search?q='+encodeURIComponent(searchInput.value.trim());});
app.addEventListener('input',(e:Event)=>{const t=e.target as HTMLInputElement;if(t.id==='dictQuery')refreshDictionary(1);else if(t.id==='wordbankQuery'){wordbankPage=1;updateWordbankTable();}else if(t.id==='phraseFilter'){const q=t.value.trim().toLowerCase();const list=PHRASES.filter(p=>`${p.sama} ${p.ru} ${p.topic}`.toLowerCase().includes(q));const out=document.getElementById('phrasesResults');if(out)out.innerHTML=phraseMarkup(list,[...new Set(list.map(x=>x.topic))]);}else if(t.id==='rateRange'){audioSpeed=Number(t.value);const o=document.getElementById('rateOut');if(o)o.textContent=audioSpeed.toFixed(2)+'×';}});
app.addEventListener('change',(e:Event)=>{const t=e.target as HTMLInputElement;if(t.id==='dictTag'||t.id==='dictStatus')refreshDictionary(1);if(t.id==='wordbankStatus'){wordbankPage=1;updateWordbankTable();}if(t.id==='voiceSelect')chosenVoice=t.value;});
document.getElementById('randomArticle')?.addEventListener('click',()=>{location.hash=href(ARTICLES[Math.floor(Math.random()*ARTICLES.length)].id);});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});
if('speechSynthesis' in window)window.speechSynthesis.addEventListener('voiceschanged',populateVoices);
buildSidebar();render();

// Responsive navigation + keyboard navigation. All controls work without frameworks.
const mobileToggle = document.getElementById('mobileToggle') as HTMLButtonElement | null;
const mobileScrim = document.getElementById('mobileScrim') as HTMLElement | null;
const sidebarClose = document.getElementById('sidebarClose') as HTMLButtonElement | null;
function setMenu(open:boolean){
  document.body.classList.toggle('menu-open',open);
  mobileToggle?.setAttribute('aria-expanded',String(open));
  mobileToggle?.setAttribute('aria-label',open?'Закрыть меню разделов':'Открыть меню разделов');
  if(open)sidebarClose?.focus();
}
mobileToggle?.addEventListener('click',()=>setMenu(!document.body.classList.contains('menu-open')));
sidebarClose?.addEventListener('click',()=>setMenu(false));
mobileScrim?.addEventListener('click',()=>setMenu(false));
document.getElementById('sidebar')?.addEventListener('click',e=>{
  if((e.target as Element).closest('a'))setMenu(false);
});
window.addEventListener('hashchange',()=>setMenu(false));
window.addEventListener('keydown',e=>{
  const isTyping = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLElement && e.target.isContentEditable);
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
    e.preventDefault();setMenu(false);searchInput.focus();searchInput.select();
  }else if(e.key==='/'&&!isTyping&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
    e.preventDefault();searchInput.focus();
  }else if(e.key==='Escape'){
    if(document.body.classList.contains('menu-open')){setMenu(false);mobileToggle?.focus();}
    else if(document.activeElement===searchInput){searchInput.blur();}
  }
});
app.addEventListener('click',e=>{
  const anchor=(e.target as Element).closest<HTMLAnchorElement>('a[data-anchor]');
  if(!anchor)return;
  const target=document.getElementById(anchor.dataset.anchor||'');
  if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}
});
rail.addEventListener('click',e=>{
  const anchor=(e.target as Element).closest<HTMLAnchorElement>('a[data-anchor]');
  if(!anchor)return;
  const target=document.getElementById(anchor.dataset.anchor||'');
  if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}
});

// Hash routes and ordinary in-page anchors must not interfere with each other.
document.querySelector('.skip-link')?.addEventListener('click', e=>{
  e.preventDefault();
  app.focus({preventScroll:true});
  app.scrollIntoView({behavior:'smooth',block:'start'});
});
