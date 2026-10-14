# Core status

9/29 prompts accepted (C01-C09). C01-C08 pushed; C09 in this checkpoint commit.
20 planned prompts remain, plus two deferred engine-reuse tasks T02/T09.

Working: six-route React shell, labelled before/after/error mocks, summary stub, shop signup/login/cart/
checkout, 3000 fake customers (45% common passwords), reset snapshot, eight source findings, real
ML-KEM/AES-GCM protected fields, Argon2id migration and actual source/database score calculation.
Before score 38; protected source + migrated database score 91. These are candidate scan scores,
not verified/published results. Full 3000-row migration acceptance passed in 24.737 seconds.

Next: C10 persistent scan jobs; then CBOM, leak preview, attacks, fixes/merge, verification and reports.
Full scan-to-report demo is NOT complete. Hub unchanged. T02/T09 remain deferred.

Run: core/.venv/Scripts/python.exe core/scripts/dev.py. Services currently stopped.
Shop localhost:5050; Priya login priya@example.test / priya@123. UI localhost:5173/scan.
Main database stays before mode; protected-mode tests use isolated databases.
Migration is offline only until API coordination exists; educational ML-KEM library limitation applies.
See core/README.md, core/demo-shop/README.md, progress.json and PROMPT_COMPLETIONS.md.
