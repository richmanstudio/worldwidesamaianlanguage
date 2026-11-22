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
