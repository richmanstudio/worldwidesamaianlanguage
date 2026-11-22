# WORKLOG — SAMA research and engineering

> Append-only working record, not a replacement for the Git history. Each entry must identify task IDs and evidence.

## 2026-11-22 · ROADMAP baseline

**R-ID:** R00-09 (infrastructure policy setup); planning artifacts for R00 and R01. **Action:** anchored comprehensive ROADMAP in root README, added AGENTS instructions and roadmap/PR consistency checks. **Evidence:** git commit introducing `ROADMAP.md`, `AGENTS.md`, `docs/ROADMAP-STATUS.md`.

**Verified:** references and document structure can be automatically tested. **Not performed:** linguistic audit R00-01/R00-02, approvals of candidate vocabulary, independent translation or international trials. **Next:** R00-01 → R00-02 → R00-04 / R01-03.

## 2026-11-22 · R00-09 проверен, master-issue открыт

**Done:** R00-09. CI успешно прошёл [GitHub Actions run 44988897537](https://github.com/richmanstudio/worldwidesamaianlanguage/actions/runs/44988897537); ROADMAP, README, AGENTS, PR template и status структурно проверяются. Для будущей навигации создан [Master Roadmap issue #1](https://github.com/richmanstudio/worldwidesamaianlanguage/issues/1).

**Не проверялось:** независимая лингвистическая экспертиза, человеческие исследования или утверждение новой лексики. **Next:** R00-01, R00-02, R00-04 / R01-03.

## 2026-11-22 · Первый исследовательский цикл ROADMAP

**Завершены:** R00-01 (инвентаризация), R00-02 (замороженный baseline), R00-03 (модель статусов), R01-03 (сопоставление 59 пунктов). **В работе:** R00-04, R00-07. Источники: `docs/source-register.md`, `docs/baseline-0.9.json`, `docs/status-model.md`, `content/rule-registry.json`, `docs/rule-crosswalk.md`, `docs/conflicts.md`. Коммиты: `2ccc742`, `3dbc56e`; GitHub Actions: [44989466448](https://github.com/richmanstudio/worldwidesamaianlanguage/actions/runs/44989466448), [44989557553](https://github.com/richmanstudio/worldwidesamaianlanguage/actions/runs/44989557553). Найдено 12 открытых расхождений, норму не изменяли.

**Нерешено:** предметная дедупликация 46 тем; конфликт относительных конструкций `ta`/`e`, валентность `kama`, единый статус союза `aka`. **Next:** CF-001 → R00-04/R00-07; human validation не проводилась.

## 2026-11-22 · CF-001: согласование относительного пилота

**R-ID:** R00-04/R00-05/R00-07; подготовка R05-04. **Изменено:** ADR-0001 выбирает один ta в ограниченном эксперименте; e и нулевая анафора явно архивные. Обновлены спецификация, атлас, статья, архивные пометки лаборатории и переводов 0.8. Введены active_revision/revisions и проверка единственности. Исправлен видимый на сайте невычисленный шаблон описания грамматики. Исторические источники сохранены; baseline не переписан, новые blob SHA записаны в baseline-drift.

**Доказательства:** `tests/relative-clauses.json`, `scripts/relative-parser.mjs`, `scripts/relative-test.mjs`, `docs/migration-log.md`: 120 валидных/невалидных пар, 60 ролевых контрастов, 19 дополнительных отказов. Это синтетическая матрица, не человеческие результаты. **Проверено:** отдельный тест CF-001 и полный `npm test` (включая сборку, 469 маршрутов, лаборатории 0.7–0.9) успешно прошли. **Не проверялось:** независимая лингвистическая понятность и международное освоение. R00-04 и R05-04 не объявлены завершёнными. **Next:** проверить Actions этого этапа → CF-002 / R01-13; затем продолжать консолидацию остальных 45 тем.

## 2026-11-22 · Подтверждение CF-001 и следующий конфликт CF-002

**Первый этап:** [c86fb807](https://github.com/richmanstudio/worldwidesamaianlanguage/commit/c86fb807d97b0a60d05f1c594584d9fa98752b0d), [Actions 44990662391](https://github.com/richmanstudio/worldwidesamaianlanguage/actions/runs/44990662391) completed/success, включая тесты и Pages. Issue #2 закрыт с явной границей пилота; не закрыты G0/R00-04/R05-04.

**R-ID второго этапа:** R01-13/R00-07/R00-04, частично R10-02. **Изменено:** ADR-0002; kama + NP историческое, kama + VP экспериментальное. Все обнаруженные номинальные примеры в разговорнике, уроке «В магазине» и двух статьях сохранены с прежним смыслом и предупреждениями. Добавлены TypeScript-поля редакционных пометок, вывод рядом с фразой/уроком и регрессии. Добавлена JSON Schema 2020-12 для CF-001 (проверена jsonschema локально); уточнены спецификация, атлас и пилоты 0.8/0.9; baseline SHA новых редакций записаны отдельно. Подготовлен аудит живого сайта с конкретными примерами сырости.

**Проверено:** `npm test` целиком прошёл, включая сохранение переводов, отказы номинальной рамки, разные области no, вывод исторического статуса в собранном сайте и неизменность 43 core. CI второго коммита проверяется после публикации. **Не проверялось:** независимое понимание, фонетические и международные испытания; глобальный редизайн и полный аудит всех лексем уроков. **Next:** Actions второго этапа → CF-003/R01-05 и дальнейшая консолидация 45 групп R00-04; CF-012 остаётся открыт.

## 2026-11-22 · Проверки второго этапа завершены

**R-ID:** R01-13/R00-07/R00-04. **Доказательства:** [4318c769](https://github.com/richmanstudio/worldwidesamaianlanguage/commit/4318c769c3d43bacbf2544781005ef1115cbdce8), [Actions 44991109945](https://github.com/richmanstudio/worldwidesamaianlanguage/actions/runs/44991109945) completed/success, тесты и Deploy site успешны. Первый этап подтверждён Actions 44990662391. Никаких независимых человеческих результатов не добавлено; 43 core и 274 candidate неизменны. **Осталось:** 10 открытых конфликтов, 45 тем без консолидированной редакции; G0 в работе, остальные gates без повышения. **Next:** CF-003/R01-05, продолжение R00-04, затем CF-012/R10-02.
