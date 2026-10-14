# Core status

C01-C08 accepted. Current batch delivered contracts/mocks, real shop, seed, active planted issues,
local discovery and protected migration. Services stopped; main demo is seeded in before mode.
Run `core/.venv/Scripts/python.exe core/scripts/dev.py`; npm dependencies installed in core/web.
Shop: localhost:5050; Priya: priya@example.test / priya@123. Core UI: localhost:5173/scan.
Migration (stop shop first): core/.venv/Scripts/python.exe core/demo-shop/migrate_to_after.py.
Reset: core/.venv/Scripts/python.exe core/demo-shop/reset.py.
C08 full 3000-row acceptance passed in 24.737 seconds (earlier run ~40s).
Next: C09 rules/scoring and C10 persistent scan jobs. Live attacks/fix API/verification/reports remain.
T02/T09 deferred; Hub untouched. Current summary endpoint still returns original inconsistent stub.
ML-KEM uses educational kyber-py; local key files must stay with encrypted database.
See core/demo-shop/README.md, progress.json and PROMPT_COMPLETIONS.md.
