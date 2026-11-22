# R01-13 — Ревизия kama в учебных материалах

**2026-11-22 · 0.10-pilot.1 · CF-002.** Решение: [ADR-0002](../docs/decisions/0002-kama-complement.md). Это сверка исходников, не исследование людей.

| Место | Сохранённая форма | Действие |
|---|---|---|
| content/phrases.json, тема Еда | `Mi kama su.` — «Я хочу воды» | historical + CF-002; предупреждение рядом с фразой |
| content/lessons.json, «В магазине», пример и ответ | `Mi kama su, palao.` / `Mi kama su.` | Весь урок historical + CF-002; задача больше не представляется действующей нормой |
| content/articles/modality.json | `Mi kama su.` | Исходный перевод сохранён, пояснение исторической NP-рамки |
| content/articles/food-vocabulary.json | `Mi kama su, palao.` | Исходный перевод сохранён, пояснение исторической NP-рамки |
| content/phrases.json, Движение/Обучение | `Mi no kama wako.` / `Mi kama lena.` | experimental, kama — candidate |
| content/lessons.json, «Что ещё не стандартизировано» | `Mi kama lena.` | experimental; не нормативный урок |
| specification:modals-core; atlas:modality; lab08:08-17; lab09:09-07 | `kama + VP` | Явно отделена от архивной NP-рамки |
| specification:negation-core; standard-negation-core | `no kama` / `kama no` | Явно помечены как примеры экспериментального дополнения |

Проверка охватывает phrases, lessons, quiz, specification, все 82 articles, grammar-atlas, grammar08, translation08 и language09. Генерированный wordbank, карантин и legacy не являются учебной нормой; их исторические значения не переписываются.

Номинальные формы не заменены на `Mi kama pina su.`: желание получить воду не предполагает желание её выпить. Различие проверяется отдельно от синтаксиса. Старые исходные файлы воспроизводимы по неизменному baseline и Git-истории.

**Границы:** R01-13 выполнен для обнаруженного конфликта kama (все его текущие учебные вхождения ограничены или исторически помечены). Это не завершение R10-02: остальные лексемы-кандидаты в 24 уроках и разговорнике требуют полной ревизии; CF-012 открыт.
