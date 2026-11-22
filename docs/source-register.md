# R00-01 — Реестр первоисточников SAMA 0.2–0.9

Дата фиксации: 22.11.2026. Путь и SHA взяты из GitHub main; это воспроизводимый документальный аудит, **не** лингвистическая рецензия.

## Временный порядок проверки до создания единой нормы

1. `content/specification.json` — базовая внутренняя спецификация 0.3. Поля core/candidate — внутренний статус.
2. `content/grammar-atlas.json` — пояснительный атлас 0.5; записи core не меняют базовый стандарт автоматически, proposal остаются гипотезами.
3. `content/language-0.7.json` — унаследованные шаблоны и тесты; 1000 синтетических фраз не являются независимыми переводами.
4. `content/grammar-0.8.json` и `content/language-0.9.json` — последующие лабораторные расширения. experimental/unresolved не равны core.
5. `content/lexicon.json` — источник статуса слов; `content/wordbank-5000.json` — исследовательские записи; разговорник, уроки и статьи не могут повышать статус.
6. `content/audit.json` и каталог legacy — журнал старых ошибок, исключений и принятых решений.

Новизна документа не решает смысловой конфликт автоматически. Противоречия передаются в R00-07 / R01 с примером, контрпримером и решением.

## Индивидуальные файлы исходных данных

| Путь | Версия | Назначение и статус | SHA (12) |
|---|---|---|---|
| `content/audit.json` | 0.3 | редакционный аудит: 18 конфликтов и карантин | `c3c613b75a1d` |
| `content/benchmark-0.7.json` | 0.7 | 1000 синтетических структур, не переводы людей | `84963d883ce7` |
| `content/grammar-0.8.json` | 0.8 | 6 inherited core, 12 experimental, 6 unresolved | `7681f12f9b09` |
| `content/grammar-atlas.json` | 0.5 | пояснения: 19 core и 26 proposal | `9c0381d47341` |
| `content/language-0.7.json` | 0.7 | унаследованные структуры + гипотеза, 15 положений | `b1d75a4e583c` |
| `content/language-0.9.json` | 0.9 | 20 экспериментальных правил и 5 новых морфем | `efbe6f2e8bfe` |
| `content/legacy/legacy-datasets-0.2.json` | 0.2 | архив ранее использованных данных | `2c347d8bde4a` |
| `content/legacy/lexicon-0.2.json` | 0.2 | архив старого словаря | `5a91c2b4ad02` |
| `content/legacy/quarantine.json` | 0.2–0.3 | 118 исторических сомнительных форм | `10ec87ec61ac` |
| `content/legacy/resolved-conflicts.json` | 0.2–0.3 | решения редакционного аудита, не внешняя проверка | `d757282f5b0f` |
| `content/lessons.json` | исторический | 24 урока, не все примеры нормативны | `f8a1e1f677f6` |
| `content/letters.json` | 0.3–0.9 | фонология: 17 букв, проектное МФА | `726229919b76` |
| `content/lexicon.json` | 0.3–0.9 | действующее внутреннее core и 274 кандидата | `aa15dcbc6a37` |
| `content/numbers.json` | веб-данные | вспомогательный контент, не нормативная языковая спецификация | `922f85cac0dd` |
| `content/phrases.json` | исторический | разговорник, требует сверки со статусами слов | `506072b2fe00` |
| `content/quiz.json` | веб-данные | вспомогательный контент, не нормативная языковая спецификация | `9d905c6b625a` |
| `content/sections.json` | веб-данные | вспомогательный контент, не нормативная языковая спецификация | `a48bce465ce4` |
| `content/specification.json` | 0.3 | основная историческая рабочая норма: 20 core, 4 candidate | `9b76055d4d39` |
| `content/translation-corpus-0.8.json` | 0.8 | 100 авторских задач, 10 заблокированных | `5b4125ad7bd9` |
| `content/wordbank-5000.json` | 0.4–0.9 | корпус: 4683 автоматически предложенных композита | `435f87a6472c` |
| `content/wordbank-report.json` | 0.4–0.9 | отчёт о статусах, не самостоятельный словарь | `54a9f220f43c` |

## Все 82 статьи энциклопедии — справочный слой

Статьи standard-*.json — исторические отражения разделов, а не новые нормы. Этот перечень фиксирует все ссылки, семантический постатейный аудит назначен отдельно.

| Путь | SHA (12) |
|---|---|
| `content/articles/accessibility.json` | `975589b54b9c` |
| `content/articles/adjectives.json` | `6d0518964992` |
| `content/articles/alphabet-policy.json` | `86a59a719441` |
| `content/articles/borrowing.json` | `c82b90696a40` |
| `content/articles/case-and-role.json` | `4db85f46191c` |
| `content/articles/color-vocabulary.json` | `d4af1d4b8b7d` |
| `content/articles/community-review.json` | `3fb70a940e75` |
| `content/articles/compounds.json` | `fafd7de9d406` |
| `content/articles/consonants.json` | `ca6e396c6d93` |
| `content/articles/coordination.json` | `80d408e8f9b0` |
| `content/articles/design-metrics.json` | `9ba1c21ad12f` |
| `content/articles/dialogue.json` | `008cd9c8ac5e` |
| `content/articles/dictionary-help.json` | `f6708a107599` |
| `content/articles/ethics.json` | `733deb58b2a9` |
| `content/articles/family.json` | `c12d604ac9ee` |
| `content/articles/food-vocabulary.json` | `fd5d398f329a` |
| `content/articles/future.json` | `5c2f0f403016` |
| `content/articles/governance.json` | `5246e837d1bf` |
| `content/articles/introductions.json` | `92b9b9162839` |
| `content/articles/language-families.json` | `a8833b7555af` |
| `content/articles/learning-strategy.json` | `408685503c3c` |
| `content/articles/lexical-quality.json` | `adb4ad13bb08` |
| `content/articles/license.json` | `6b51a31ce542` |
| `content/articles/minimal-pairs.json` | `097ec983113f` |
| `content/articles/mission.json` | `43af9bee934e` |
| `content/articles/modality.json` | `17b5fd7660d4` |
| `content/articles/names.json` | `0dc11a684df2` |
| `content/articles/negation.json` | `5ea8bb5b54e6` |
| `content/articles/number-formation.json` | `c54331f20dcc` |
| `content/articles/numbers-syntax.json` | `5c7491b0a8f0` |
| `content/articles/online-messages.json` | `0ca5c1368f16` |
| `content/articles/past.json` | `dfe1be5a81ec` |
| `content/articles/phonetic-audio.json` | `84d49b0a0eaf` |
| `content/articles/plural.json` | `71017e48f178` |
| `content/articles/politeness.json` | `35b3aeb4abd3` |
| `content/articles/possession.json` | `5ca59072aa8f` |
| `content/articles/prepositions.json` | `c83dcbb1951b` |
| `content/articles/pronouns.json` | `fd090c9beec7` |
| `content/articles/pronunciation-variants.json` | `2a53abafc4ac` |
| `content/articles/question-words.json` | `59fb933c9d23` |
| `content/articles/questions.json` | `19bdf187e131` |
| `content/articles/spelling.json` | `0c69ee2a511c` |
| `content/articles/standard-adjectives-core.json` | `5f751e44c7dd` |
| `content/articles/standard-alphabet-core.json` | `3a386bba7833` |
| `content/articles/standard-compounding-core.json` | `1504df0bb7af` |
| `content/articles/standard-conditional-core.json` | `5d5a92e2e886` |
| `content/articles/standard-content-clause.json` | `24a6334ab060` |
| `content/articles/standard-coord-core.json` | `96659f9abf62` |
| `content/articles/standard-copula-core.json` | `5bd97ec53a57` |
| `content/articles/standard-lexicon-core.json` | `f577a68404d5` |
| `content/articles/standard-limitations-core.json` | `95e78518aa55` |
| `content/articles/standard-modals-core.json` | `f78a1c51e17b` |
| `content/articles/standard-negation-core.json` | `e39838367f40` |
| `content/articles/standard-numbers-core.json` | `174e0f6aa7d9` |
| `content/articles/standard-plural-core.json` | `9c6bf94774f7` |
| `content/articles/standard-possession-core.json` | `9bada186aa92` |
| `content/articles/standard-pronouns-core.json` | `898a0a78c0c4` |
| `content/articles/standard-questions-core.json` | `1834109deeda` |
| `content/articles/standard-relative-core.json` | `c8ee9a13ca39` |
| `content/articles/standard-release-policy.json` | `39356d775ea4` |
| `content/articles/standard-sentence-core.json` | `07c875f82263` |
| `content/articles/standard-spatial-core.json` | `65e5a7fd3879` |
| `content/articles/standard-status.json` | `36dfbf4eff6f` |
| `content/articles/standard-syllables-core.json` | `29bbf55c49a4` |
| `content/articles/standard-tense-core.json` | `c6c412a14ffd` |
| `content/articles/standard-test-design.json` | `2d79fc6377d5` |
| `content/articles/stress.json` | `357250244cf8` |
| `content/articles/study-plan.json` | `a6a72bb78ae9` |
| `content/articles/svo.json` | `5a3c0fed4386` |
| `content/articles/syllable-drills.json` | `45dba21d9118` |
| `content/articles/syllables.json` | `d29bd21b2bfc` |
| `content/articles/technology.json` | `51ff70510915` |
| `content/articles/testing.json` | `6e0d46f1cb1a` |
| `content/articles/time-and-context.json` | `9d6b858a9731` |
| `content/articles/time-vocabulary.json` | `ee7dd68a70e7` |
| `content/articles/translation-limits.json` | `35d34b75408b` |
| `content/articles/transliteration.json` | `79495ac094f7` |
| `content/articles/travel.json` | `4e4d5abe3f40` |
| `content/articles/universality-limits.json` | `57d24f8a5b7c` |
| `content/articles/verbs.json` | `f179bb770b7b` |
| `content/articles/vowels.json` | `29ea5bee28a0` |
| `content/articles/word-classes.json` | `6dcd2d2c9232` |

## Документация исследований и версий

| Путь | Сила | SHA (12) |
|---|---|---|
| `docs/AUDIT-DECISIONS.md` | исторические решения | `660a0cada2e8` |
| `docs/INTERNATIONAL-TEST-PROTOCOL.md` | план международного испытания; ещё не проведено | `0cfa34f0b390` |
| `docs/RELEASE-0.5.md` | управление и документация | `9c3f1113f91a` |
| `docs/ROADMAP-STATUS.md` | управление и документация | `22097042e4ec` |
| `docs/SAMA-0.7-DECISIONS.md` | редакционное описание соответствующей версии | `7f7febfc4134` |
| `docs/SAMA-0.8-DECISIONS.md` | редакционное описание соответствующей версии | `d4d749046a55` |
| `docs/SAMA-0.9-DECISIONS.md` | редакционное описание соответствующей версии | `9c77d5a7bc9d` |
| `docs/SAMA-Language-Core-0.3.md` | управление и документация | `856ea6bb61df` |
| `docs/WORKLOG.md` | управление и документация | `8081902ba7f2` |

## Первоисточник по типу утверждения

| Тема | Источник | Производные источники |
|---|---|---|
| Алфавит и МФА | letters.json; specification.json#alphabet-core | grammar-atlas.json#ipa; src/phonetics.ts — алгоритм |
| Простая грамматика | specification.json core | grammar-atlas.json, language-0.7.json, grammar-0.8.json |
| Придаточные | specification.json candidate | grammar-0.8.json experimental/unresolved |
| Вид, модальность, причины | **нет утверждённой нормы** | language-0.9.json experimental |
| Словарь | lexicon.json | wordbank-5000.json и учебные примеры |
| Лексические ошибки | audit.json; legacy/quarantine.json | docs/AUDIT-DECISIONS.md |
| Международная понятность | **проверки пока нет** | docs/INTERNATIONAL-TEST-PROTOCOL.md — план |

## Границы аудита

В этом цикле перечислены источники и назначена их временная авторитетность. Полная проверка содержания всех 82 статей, исправление словарных ошибок и конфликтов норм — **не** выполнены и относятся к R00-04, R00-07, R01.
