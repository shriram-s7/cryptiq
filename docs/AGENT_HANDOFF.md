# Core handoff

Read CORE_CONTEXT.md, CRYPTIQ_PLAN.md, SHARED_THEME_AND_CONTRACT.md and CORE_BUILD_PLAN.md.
Then read STATUS.md, progress.json and latest PROMPT_COMPLETIONS.md.
C01-C08 accepted. Next C09 rules/scoring then C10 scan jobs. User requests batching and minimal meaningful tests,
not fewer features. Keep separate task acceptance and commit completed tasks without redundant
publication-only commits. Never modify hub/; stage only core/shared/docs; core: commits and push.
T02/T09 reuse deferred. Services stopped. Main shop remains before with 3000 fake customers; migration acceptance used isolated DBs.
Use core/.venv/Scripts/python.exe (new crypto dependencies installed there). SQLite metadata mode is authoritative.
Migration is offline until merge API coordination. Next scanner must distinguish MD5 compatibility verification
from newly stored MD5: src_after/auth.py keeps an MD5 prehash only inside verify_password.
Setup/run: core/README.md. React tests: core/web/README.md.
C03 tests passed after explicit Tailwind config path fix; default shared fixture is still inconsistent.
