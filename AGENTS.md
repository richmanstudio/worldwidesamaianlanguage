# Instructions for all AI coding assistants and collaborators working on SAMA

**MANDATORY: Before any SAMA task, first read `ROADMAP.md`, `docs/ROADMAP-STATUS.md` and the currently relevant language source files in `content/` and `docs/`.** This applies to GitHub Copilot, Codex, ChatGPT, contributors, reviews, refactors and releases. If conversation context differs from repository `main`, trust the fresh repository source.

## Work protocol

1. Assign one or more stable **Rxx-yy** IDs from the roadmap to every nontrivial task. If a requested change is absent, propose a roadmap amendment before/alongside changing content.
2. If a source frozen in `docs/baseline-0.9.json` changes, document the current Git blob SHA, R-ID, reason and new version in `docs/baseline-drift.json`; never overwrite historical baseline. Check phase dependencies and precise exit criteria. Do not implement ahead of prerequisites without explicit experimental labels.
3. Maintain data provenance and statuses: `core` is only internal working norm; `candidate`/`proposal`/`experimental` are **not** independently validated. The 5,000-row corpus includes 4,683 algorithmic compounds. Do not invent human results or unearned completeness percentages.
4. For lexicon and grammar edits, update examples, schema, tests, changelog and migration notes; include contrasting and negative tests. Preserve quarantine history and old documents.
5. For human validation, require authentic participant data, consent, methods, limitations. CI tests, mock DOM and synthetic examples are **not** native-speaker validation.
6. Run `npm test` when possible; investigate failures and do not claim successful deployment until GitHub Actions confirms success.
7. In the same change as substantive progress, update `docs/ROADMAP-STATUS.md` and append an entry to `docs/WORKLOG.md` including date, tasks, evidence links, unresolved items, next action. Mark a roadmap checkbox only if its full acceptance criterion is satisfied.
8. Summaries of SAMA work must mention R-ID, what changed, what was verified, what was **not** verified, and the next prioritized task. Do not assume future unattended or background work.

## Architecture and sources

- Primary roadmap: `ROADMAP.md`; operational status: `docs/ROADMAP-STATUS.md`.
- Current draft spec history: `content/specification.json`, `content/grammar-atlas.json`, `content/language-0.7.json`, `content/grammar-0.8.json`, `content/language-0.9.json`.
- Lexical baseline: `content/lexicon.json`, `content/wordbank-5000.json`, `content/wordbank-report.json`.
- Known historic conflicts: `docs/AUDIT-DECISIONS.md`; international experimental plan: `docs/INTERNATIONAL-TEST-PROTOCOL.md`.
- Tests: `npm test`; changes to orthography/lexicon/norms require focused validations beyond static site render tests.

**A user instruction can change priorities, but never silently promote unreviewed data or claim a human study occurred.**
