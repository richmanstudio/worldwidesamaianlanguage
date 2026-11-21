#!/usr/bin/env python3
"""SAMA 0.4 draft: deterministic 5000-entry editorial workbench.
NOTE: Generated compounds are provisional compositional candidates, NOT approved words.
No etymologies/phonetics were externally validated.
"""
import json,re,collections,os
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
LEX=json.loads((ROOT/'content/lexicon.json').read_text(encoding='utf-8'))
BY={x['w']:x for x in LEX}
EXCLUDE_CATS={'Основы языка','Действия','Чувства и качества','Цвета, числа и формы','Пространство и связь'}
EXCLUDE_WORDS=set('bisi kula lako mali pali palo pasi pina sima sino suno tami tapa wasa medo bulu nemi mawa naki saki'.split())
# All modifiers are nominal roots already present in the draft, not invented strings.
MODS=[x for x in LEX if x['tag'] not in EXCLUDE_CATS and '-' not in x['w'] and x['w'] not in EXCLUDE_WORDS]
# Each compositional relation states the precise sense of the head. Any new sense needs editorial review.
HEADS=[
 ('kaso','книга или издание по теме «{x}»','Mi lita {w}.','Я читаю книгу по теме «{x}».','Образование'),
 ('koma','сообщество, объединённое темой «{x}»','Ta bi na {w}.','Он/она состоит в сообществе по теме «{x}».','Общество'),
 ('wema','культурная практика, связанная с темой «{x}»','Ta li toka {w}.','Они обсуждают культурную практику по теме «{x}».','Культура'),
 ('kala','место, связанное с темой «{x}»','Mi bi na {w}.','Я нахожусь в месте, связанном с темой «{x}».','Места'),
 ('bama','работа, связанная с объектом или темой «{x}»','Ta naka {w}.','Он/она выполняет работу, связанную с «{x}».','Работа'),
 ('talo','инструмент, используемый при работе с «{x}»','Mi tako {w}.','Я беру инструмент для работы с «{x}».','Технологии'),
 ('doma','здание, предназначенное для деятельности вокруг «{x}»','Mi si {w}.','Я вижу здание, связанное с «{x}».','Места'),
 ('luma','комната для деятельности вокруг «{x}»','Ta bi na {w}.','Он/она находится в комнате для «{x}».','Быт'),
 ('nami','название, относящееся к «{x}»','Mi wima {w}.','Я записываю название, связанное с «{x}».','Язык'),
 ('soma','человек, занимающийся «{x}»','Mi si {w}.','Я вижу человека, который занимается «{x}».','Люди'),
 ('lawi','правовая норма, регулирующая «{x}»','Mi lita {w}.','Я читаю правовую норму о «{x}».','Право'),
 ('lata','транспортное средство, перевозящее «{x}»','Mi si {w}.','Я вижу транспорт, перевозящий «{x}».','Транспорт'),
 ('dina','день, посвящённый «{x}»','{w} bi nawa.','День, посвящённый «{x}», новый.','Время'),
 ('tima','период времени, связанный с «{x}»','{w} bi moko.','Период, связанный с «{x}», короткий.','Время'),
 ('wika','неделя, посвящённая «{x}»','{w} bi bona.','Неделя, посвящённая «{x}», хорошая.','Время'),
 ('yala','год, посвящённый «{x}»','{w} bi nawa.','Год, связанный с «{x}», новый.','Время'),
 ('balo','сумка, предназначенная для хранения «{x}»','Mi tako {w}.','Я беру сумку для «{x}».','Предметы'),
 ('peta','дверь, ведущая в место, связанное с «{x}»','Mi nipa {w}.','Я открываю дверь в место, связанное с «{x}».','Предметы'),
 ('lato','лампа, предназначенная для работы с «{x}»','Mi si {w}.','Я вижу лампу, связанную с «{x}».','Предметы'),
 ('mado','руководитель деятельности, связанной с «{x}»','Ta bi {w}.','Он/она руководит деятельностью по теме «{x}».','Люди'),
 ('dani','ученик, изучающий «{x}»','Mi bi {w}.','Я ученик, изучающий «{x}».','Образование'),
 ('lena-doma','учебное здание, предназначенное для изучения «{x}»','Mi wako to {w}.','Я иду в учебное здание по теме «{x}».','Образование'),
 ('lita-doma','читальный зал или библиотека по теме «{x}»','Mi bi na {w}.','Я нахожусь в библиотеке по теме «{x}».','Образование'),
 ('wima-doma','архив письменных материалов о «{x}»','Mi nopa {w}.','Я ищу архив материалов о «{x}».','Информация'),
 ('kopa','чашка или сосуд для хранения «{x}»','Mi tako {w}.','Я беру сосуд для «{x}».','Предметы'),
 ('pila','тарелка или поднос для «{x}»','Mi si {w}.','Я вижу поднос для «{x}».','Предметы'),
 ('pano','поверхность или пол для работы с «{x}»','Mi si {w}.','Я вижу поверхность для «{x}».','Предметы'),
 ('seda','сиденье, используемое при деятельности с «{x}»','Ta bi na {w}.','Он/она находится на сиденье, связанном с «{x}».','Предметы'),
 ('mesa','стол, используемый при деятельности с «{x}»','Mi si {w}.','Я вижу стол для занятий темой «{x}».','Предметы'),
 ('wina','окно в помещении, предназначенном для «{x}»','Mi si {w}.','Я вижу окно помещения для «{x}».','Предметы'),
 ('sawa','крыша здания, предназначенного для «{x}»','Mi si {w}.','Я вижу крышу здания, связанного с «{x}».','Предметы'),
 ('misa','ключ от помещения, используемого для «{x}»','Mi tako {w}.','Я беру ключ от помещения для «{x}».','Предметы'),
 ('wato','электроснабжение оборудования для «{x}»','Mi nopa {w}.','Я ищу электроснабжение оборудования для «{x}».','Технологии'),
 ('pilo','самолёт для перевозки «{x}»','Mi si {w}.','Я вижу самолёт для перевозки «{x}».','Транспорт'),
 ('lami','семья, связанная с деятельностью вокруг «{x}»','Mi si {w}.','Я вижу семью, связанную с «{x}».','Люди'),
 ('nato','группа людей, объединённая темой «{x}»','Mi si {w}.','Я вижу группу людей, связанную с «{x}».','Люди'),
 ('bano','город, известный деятельностью вокруг «{x}»','Mi si {w}.','Я вижу город, связанный с «{x}».','Места'),
 ('mami','родитель человека, связанного с «{x}»','Mi si {w}.','Я вижу родителя человека, связанного с «{x}».','Люди'),
 ('nasa','родина или регион происхождения «{x}»','Mi bi na {w}.','Я нахожусь на территории происхождения «{x}».','Места'),
 ('dasa','станция, обслуживающая перевозку «{x}»','Mi si {w}.','Я вижу транспортную станцию, связанную с «{x}».','Транспорт'),
 ('nina','ребёнок, связанный с «{x}»','Mi si {w}.','Я вижу ребёнка, связанного с «{x}».','Люди'),
 ('meka','врач, работающий с последствиями «{x}»','Mi si {w}.','Я вижу врача по вопросам «{x}».','Здоровье'),
 ('meda','лекарство, относящееся к лечению состояния «{x}»','Mi tako {w}.','Я беру лекарство для состояния «{x}».','Здоровье')
]
# Compatibility scoring prefers productive relationships with reproducible interpretation.
GENERAL=set('kaso koma wema kala bama talo doma luma nami soma lawi lata dina tima wika yala balo peta lato mado dani lena-doma lita-doma wima-doma'.split())
SEMI=set('kopa pila pano seda mesa wina sawa misa wato pilo bano dasa meka meda'.split())
SPECIAL=set('lami nato mami nasa nina'.split())
FOOD={'Еда и напитки'}
HEALTH={'Тело и здоровье','Люди и отношения'}
PEOPLE={'Люди и отношения','Общество и культура','Образование и наука'}
EDUC={'Общество и культура','Образование и наука','Технологии и связь','Люди и отношения'}
COLORS='Цвета, числа и формы'
existing=set(BY)
def rough_gloss(w):
 return w['ru'].split(' (')[0].split(';')[0].split(' / ')[0].strip()

def score(mod,head):
 m=mod['tag']; h=head[0]
 s=100 if h in GENERAL else 40
 if h in {'kopa','pila'}: s+=80 if m in FOOD else -50
 if h in {'meka','meda'}: s+=85 if m in HEALTH else -80
 if h in {'nato','mami','lami','nina'}: s+=80 if m in PEOPLE else -45
 if h in {'lena-doma','lita-doma','wima-doma','kaso','dani'}: s+=25 if m in EDUC else 0
 if h in {'lata','pilo','dasa','balo'}: s+=30 if m in FOOD or m in {'Дом и быт','Природа и погода','Город и транспорт'} else 0
 if h in {'sawa','wina','peta','seda','mesa','pano'}: s+=22 if m in {'Дом и быт','Город и транспорт','Общество и культура'} else 0
 if h in {'nasa','bano'}: s+=20 if m in {'Природа и погода','Город и транспорт'} else 0
 if h in {'dina','wika','yala'} and m=='Время':s-=15
 if h==mod['w']:s-=140
 if head[0].startswith(mod['w']+'-'):s-=90
 return s
pairs=[]
for mod in MODS:
 for head in HEADS:
  w=mod['w']+'-'+head[0]
  if w in existing or head[0]==mod['w']: continue
  pairs.append((score(mod,head),w,mod,head))
pairs.sort(key=lambda t:(-t[0],t[1]))
TARGET=5000
NEEDED=TARGET-len(LEX)
if len(pairs)<NEEDED:raise RuntimeError(f'Not enough forms {len(pairs)} < {NEEDED}')
# One head relation is sufficient for a reproducible definition; no fake uniqueness claims.
selected=sorted(pairs[:NEEDED],key=lambda t:t[1])
assert len(set(p[1] for p in selected))==NEEDED
ALLOWED=set('aeioubdhklmnpstwy-')

def phonemes(word):
 a={'a':'a','e':'e','i':'i','o':'o','u':'u','b':'b','d':'d','h':'h','k':'k','l':'l','m':'m','n':'n','p':'p','s':'s','t':'t','w':'w','y':'j','-':'·'}
 return ''.join(a[c] for c in word)

bank=[]
for x in LEX:
 bank.append({'form':x['w'],'sense_ru':x['ru'],'definition_ru':'Базовая запись редакции 0.3; значение предварительное и требует языковой проверки.',
 'class':'existing','theme':x['tag'],'part_of_speech':'уточняется','status':x['status'],'revision':'0.3',
 'origin': 'SAMA 0.3 existing lexicon (not independently validated)',
 'ipa_draft':f"/{phonemes(x['w'])}/",'parts': [x['w']],
 'examples':[],'needs_review':['часть речи','семантические границы','межъязыковая проверка','этимология','эталонное произношение']})
for rank,word,mod,head in selected:
 h,definition,example_sama,example_ru,theme=head
 g=rough_gloss(mod)
 details=definition.format(x=g)
 bank.append({'form':word,'sense_ru':details,'definition_ru':details+'. Значение построено композиционно; самостоятельная лексикализация не доказана.',
 'class':'compound','theme':theme,'part_of_speech':'существительное (проект)',
 'status':'proposal','revision':'0.4-draft','origin': 'productive noun-noun compounding from SAMA 0.3',
 'ipa_draft':f"/{phonemes(word)}/",'parts':[mod['w'],h],
 'morpheme_glosses':[mod['ru'], BY[h]['ru'] if h in BY else 'составной компонент'],
 'source_reliability':'provisional' if mod['status']=='core' else 'experimental',
 'examples':[{'sama':example_sama.format(w=word),'ru':example_ru.format(x=g)}],
 'needs_review':['естественность сочетания','точное значение','отличие от свободного словосочетания','межъязыковая проверка','произношение'],
 'editorial_score':rank})
assert len(bank)==TARGET, len(bank)
forms=[r['form'] for r in bank]
assert len(forms)==len(set(forms))
assert all(set(w)<=ALLOWED for w in forms)
for b in bank:
 if b['class']=='compound':
  assert b['parts'][0] in BY and b['parts'][1] in BY or b['parts'][1] in {'lena-doma','lita-doma','wima-doma'}
  assert b['form']=='-'.join(b['parts'])
out=ROOT/'content/wordbank-5000.json'
out.write_text(json.dumps(bank,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
report={'target':TARGET,'published_existing':len(LEX),'existing_core':sum(x['status']=='core' for x in LEX),
        'existing_candidates':sum(x['status']!='core' for x in LEX),
        'compositional_proposals':NEEDED,'approval_notice':'NOT 5000 independently reviewed words; proposal corpus',
        'alphabet_valid':True,'unique_forms':True,'scope':'draft nouns, conservative A-B compounds',
        'policy':'Quality-first: only 317 prior entries appear in the public canonical dictionary; 4683 compounds are searchable draft workbench entries.'}
(ROOT/'content/wordbank-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
