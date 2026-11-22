# SAMA World Language Archive — Digital Edition 2006 (Interface 0.6)

The visual interface now uses archival navigation, document-focused reference pages, individual dictionary headwords and a phonetic laboratory. Core language content is unchanged: 43 working forms, 274 candidates and 4,683 algorithmic compound proposals. Styling is isolated in `src/archive.css` and appended by `scripts/build.mjs` after the original stylesheet. The 5,000 entries are a research corpus, **not 5,000 independently validated words**. Audio remains a browser approximation, not native reference recordings.

# SAMA Encyclopedia 0.5 — language research and learning

[Открыть сайт](https://richmanstudio.github.io/worldwidesamaianlanguage/) · [GitHub Pages Actions](https://github.com/richmanstudio/worldwidesamaianlanguage/actions)

**Открытая энциклопедия экспериментального языка SAMA.** Интерфейс — полноширинный адаптивный учебный справочник, без обязательных сторонних сервисов или трекеров.

## Редакция 0.5

- Новый академический дизайн, мобильная версия, переключаемая светлая/тёмная тема.
- **Единый каталог 5000 записей** по адресу `#/dictionary`: формы, значения, статусы, тематические фильтры, поиск и CSV.
- В корпусе **43 формы внутреннего ядра, 274 прежних кандидата и 4683 автоматически образованных неутверждённых композита**. Это **не** 5000 независимо валидированных слов. См. `content/wordbank-report.json` и `content/legacy/quarantine.json`.
- Фонетическая лаборатория `#/sounds`: 17 фонем с проектной МФА-транскрипцией, деление на слоги и постановка ударения; браузерная озвучка — приблизительная, не эталонная.
- Грамматический атлас `#/grammar`: **45 глав и 180 правил** с примерами, типичными ошибками и исследовательскими вопросами; разные статусы проектной/внутренней нормы.
- Продолжена поддержка 82 статей, 24 уроков, тренажёра, 24 глав базовой спецификации.

## Запуск

```bash
npm install
npm run dev
```

В браузере — `http://localhost:8080`. Для уже собранного сайта можно использовать `npm run start`. Для проверки `npm test` (Node.js 22, TypeScript 5.8.3). Для статического хостинга разворачивается папка `dist/`.

## Границы качества

SAMA 0.5 **не является международно признанным языком**. Нет эталонных записей носителей, независимого тестирования фонологической доступности и лингвистического одобрения 4683 составных форм. МФА отражает программно заданную фонемную модель, а не реальные акустические измерения. Имеющиеся формы с сомнительной семантикой удерживаются с честным статусом `proposal` и не преподаются как установленная норма.

Перед переводом кандидата в рабочее ядро требуются редакторское решение, согласованная дефиниция, ограничения сочетаемости, проверка значения и произношения с носителями нескольких языковых семей и документированный выпуск версии.

## Архитектура

- `src/app.ts` — взаимодействия и навигация.
- `src/phonetics.ts` — алгоритм фонемной МФА, слогов и ударения (работа по модели, не аудиокорпус).
- `src/style.css` — новый интерфейс поверх стабильной структуры.
- `content/grammar-atlas.json` — 45 грамматических глав; `content/specification.json` — прежние 24 нормативных главы.
- `content/wordbank-5000.json` — полный словарный корпус.
- `scripts/validate.mjs`, `scripts/phonetics-test.mjs`, `scripts/smoke-test.mjs`, `scripts/route-test.mjs` — автоматические проверки.

### GitHub Pages

Workflow `.github/workflows/pages.yml` запускает `npm test`, собирает `dist` и публикует его через GitHub Actions после пуша в `main`.

**License:** MIT (см. LICENSE); научное содержание требует отдельной редакционной проверки.
