# Core agent handoff

Read CORE_CONTEXT.md first, then CRYPTIQ_PLAN.md, SHARED_THEME_AND_CONTRACT.md, CORE_BUILD_PLAN.md,
STATUS.md, progress.json and latest PROMPT_COMPLETIONS.md.

C01-C09 accepted. Next prompt C10_T11.md: persistent scan jobs and polling.
Use core/.venv/Scripts/python.exe; current dependencies include real Argon2, cryptography and kyber-py.
Node packages are in core/web. Services stopped. Main shop has 3000 before-mode customers; tests use
isolated databases. API still serves the original inconsistent public stub; live API integration awaits C10+.

User explicitly requests larger implementation batches, fewer redundant tests/checkpoints, all features
retained. Use one meaningful acceptance pass per task, commit completed units and push; no extra
publication-only commits. Record prior commit hashes in the next task entry.
Only core/shared/docs staging, core: commits; never modify hub/ or read outside D:/cryptiq.
T02/T09 engine reuse remains deferred. No vendor engine copied.

C09 engine.pipeline.scan(root,database,report) provides candidate score, findings/assets/map/warnings.
Database inconsistencies override protected-looking source; MD5 compatibility verification is recognized.
Scans must not publish verified score until later four-check gate.
Shop migration requires offline run; SQLite metadata mode is atomic, state.json is informational.
Protected cookie needs localhost-supporting browser or HTTPS; acceptance used HTTPS.
Do not weaken crypto to meet timing: measured full migration 24.7-40 seconds. kyber-py is educational.
Keys/truth/runtime DB are ignored. Shared before fixture remains inconsistent and must not be silently
changed. No actual attacks, scan-job API, patch API, verification API or PDF exist yet.
