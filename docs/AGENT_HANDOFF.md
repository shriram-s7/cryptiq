# Core agent handoff

## Read order

1. CORE_CONTEXT.md
2. CRYPTIQ_PLAN.md and SHARED_THEME_AND_CONTRACT.md
3. CORE_BUILD_PLAN.md
4. STATUS.md, progress.json and the latest PROMPT_COMPLETIONS.md entry
5. The next prompt listed in progress.json

## Resume point

C02 is implemented and accepted; C01 contract checks still pass.
Next prompt: [C03 Core React shell](prompts/C03_T03.md).
First inspect Git status and latest history, then implement that prompt only through its acceptance gate.
If this checkout already has later completion entries, follow those instead of this baseline paragraph.

## User requirements that survive a handoff

- Everything stays inside D:\cryptiq; never inspect the original engine outside the repository.
- Core owns core/, shared/ and docs/. Never modify hub/ or stage root files.
- Commit each finished task with core: and push to GitHub so teammates can follow progress.
- No git add . or git add -A; no force-push or destructive reset.
- T02/T09 stay deferred until the user explicitly releases the reuse gate.
- Each task has its own portable prompt; actual completion is recorded separately, not by rewriting
  the task request. Update STATUS.md and progress.json after each task or partial checkpoint.
- Hub is built independently by the friend. Integration is a later decision; preserve the contract.

## Repository and execution context

Repository: https://github.com/shriram-s7/cryptiq, branch main.
Local shell: PowerShell. Python was available as `python` (3.14.0 during planning).
Latest requested regression passed; see TEST_RESULTS.md. The combined launcher is now running
(session 79448; API 8964, web 6876, shop 3964 observed). Check ports/processes before assuming state.
Do not launch another copy without stopping this one through its terminal.
Python 3.14.0, Node 20.20.2, FastAPI 0.127.0, uvicorn 0.40.0 and Flask 3.0.3 were available.
No dependency installation was needed; fresh-environment setup is documented but not exercised.

Run: python core/scripts/dev.py (or core/.venv/Scripts/python.exe after setup).
Check with services stopped: python core/scripts/check_launcher.py.
Logs: core/.runtime/logs/ (ignored). All three service responses, failure cleanup, Ctrl+C cleanup
and the existing public-summary HTTP checks passed. See the completion log for exact evidence.

C03 must replace core/web/dev-server.mjs with React/Vite and update the launcher accordingly.
The C03 prompt's web scope is extended only to the launcher's web command for that required adaptation.
Do not keep launching the temporary page after adding the React shell.

## Known first-task trap

shared/contracts/project_summary.before.json has contradictory fields (score 38/unverified alongside
post-fix counts and four passed checks). C01 was explicitly requested to return that exact fixture.
Do not silently alter the shared contract while implementing the stub; disclose the limitation.

## Exporting work to another agent

Give the agent its numbered prompt plus this repository at the latest published commit. The prompt
references all required documents. If transferring files rather than Git, include the context documents,
build plan, state JSON, completion log, handoff and relevant source files. The progress JSON holds no
secrets and is designed to travel with the repository.
