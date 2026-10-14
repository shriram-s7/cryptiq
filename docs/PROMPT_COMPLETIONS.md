# Prompt completion and checkpoint log

This file is separate from task prompts. Append actual execution evidence here after each task or
interrupted checkpoint. Do not replace history with the original plan. All timestamps use IST.

## Entry template

```text
Date/time:
Prompt/task ID:
State: done | in_progress | blocked | deferred
What changed:
Files changed:
Acceptance commands and actual results:
How to run:
Known issues / deviations:
Commit: hash, or "this entry is in the task commit; resolve with git log"
GitHub publication: confirmed commit / pending / failed with reason
Active services and local uncommitted work:
Next prompt and exact next action:
```

## 2026-10-14 — PLAN: Core planning and portable execution workflow

State: done (planning only).

What changed: created a detailed Core-only build plan, 29 sequential exportable prompts, a JSON progress
database, human-readable status and this separate completion log. Recorded deferred reuse, excluded Hub
tasks, actual acceptance criteria and independent Core integration boundaries.

Files changed: docs/CORE_BUILD_PLAN.md, docs/CORE_PROMPTS.md, docs/prompts/*.md, docs/progress.json,
docs/STATUS.md, docs/PROMPT_COMPLETIONS.md, docs/AGENT_HANDOFF.md,
core/scripts/generate_task_prompts.py.

Acceptance: validate JSON, all 29 unique prompt paths, dependency ordering, deferred and excluded task
mapping, and inspect Git diff for allowed paths. Results recorded in the publication checkpoint below.

How to run: no application yet. The helper generated the initial prompts once and refuses to overwrite
existing prompts or progress; do not rerun it to update task state. Edit task progress records directly.

Known issues: before-summary fixture inconsistency; real migration latency and after-attack results
must be measured. See the build plan for detailed decisions. No implementation task is marked complete.

Commit: this entry is carried in the planning commit; resolve with git log.
GitHub publication: pending verification. Initial restricted network probe failed.
Active services: none started by this task.
Next: docs/prompts/C01_PUBLIC-STUB.md. Read fixture, build minimal FastAPI app and run its HTTP checks.

## 2026-10-14 — PLAN publication checkpoint

State: done.
Acceptance results: Python validation passed for JSON parsing, 29 unique existing prompts, the entire
dependency chain, all T01–T33 mappings and the absence of false implementation completion states.
`git diff --cached --check` passed before the planning commit. Staged paths were restricted to core/
and docs/; hub/ and shared/ were unchanged.

Planning commit: 3ee40f8 (`core: plan sequential build prompts and portable progress tracking`).
GitHub publication: confirmed by successful `git push origin main`, updating d788a67 to 3ee40f8.
The restricted initial network/Git-metadata attempts failed; allowed retries succeeded. Git printed a
credential-helper warning, but the push itself completed successfully.

This follow-up checkpoint updates publication state only. No implementation task was started.
Next action remains C01_PUBLIC-STUB.md. No services are running from this task.


## 2026-10-14 - C01: public summary stub

State: done; publication pending the task commit.
What changed: FastAPI health and public summary routes, Core/Hub localhost CORS, explicit stub/no-store
headers, unknown-slug 404, pinned direct dependencies, setup instructions and HTTP acceptance checker.
Files changed: core/api/main.py, requirements.txt, README.md, check_public_stub.py; progress records.
Shared fixture and Hub files are unchanged.

Acceptance commands:
`python -m uvicorn main:app --app-dir core/api --host 127.0.0.1 --port 8000`
`python core/api/check_public_stub.py`

Actual results: PASS health; PASS exact fixture JSON + Hub GET CORS + stub headers; PASS Hub preflight;
PASS unrelated origin receives no allow-origin; PASS unknown slug 404 with Hub CORS. Checker exited 0.
Initial sandbox socket attempt failed with WinError 10013; the allowed local-network retry passed.

How to run: core/api/README.md includes virtual environment setup and both commands above.
Known issues: fixture intentionally unchanged and internally inconsistent; not live scan results.
Core web/shop and report endpoint are not implemented. Engine reuse remains deferred.
Commit: this entry is included in the C01 task commit; publication checkpoint follows.
Active services: uvicorn on 127.0.0.1:8000, process 4868 during this session; left running for local use.
Next prompt: C02_T01.md. Scaffold Core entry points and launcher, preserve this stub.


## 2026-10-14 - C01 publication checkpoint

Commit 512f23f: core: serve public summary stub with verified Hub CORS.
Successful git push origin main advanced GitHub from b6180e2 to 512f23f.
All C01 acceptance checks passed before commit. No Hub/shared edits. Next task: C02/T01.


## 2026-10-14 - C02/T01: Core service scaffolding

State: done; publication pending task commit.
What changed: minimal Node web page on 5173; Flask shop page and health on 5050; shared Core Python
requirements; launcher for API/web/shop with separate ignored logs, readiness checks, port-conflict
refusal and owned-child cleanup. Added setup/run/stop guides and a repeatable failure-path checker.
The API implementation and shared fixture are unchanged. Hub was not inspected or modified.

Files: core/README.md, core/.gitignore, core/requirements.txt; core/web/{package.json,dev-server.mjs,
index.html,README.md}; core/demo-shop/{app.py,requirements.txt,templates/index.html,README.md};
core/scripts/{dev.py,check_launcher.py}; docs progress/status/completion/handoff records.

Acceptance commands and actual outcomes:
- python core/scripts/dev.py --check initially rejected occupied API port 8000 without starting children.
  Stopped the known C01 server via its original session, not by terminating an arbitrary port owner.
- python core/scripts/check_launcher.py passed real three-service HTTP startup and cleanup; occupied
  listener refusal; injected child exit 7 with sibling cleanup; non-listening child startup timeout.
- python core/scripts/dev.py reached all three Ready states in an interactive terminal.
- python core/api/check_public_stub.py passed all five HTTP check groups against that combined run.
- GET /health on port 5050 matched {ok:true,service:demo-shop,stage:scaffold}.
- Ctrl+C printed owned-service cleanup. A following python core/scripts/dev.py --check passed and
  stopped again, confirming all required ports were released. No services are left running.
- node --check core/web/dev-server.mjs; Python compilation; git diff --check passed.

How to run: follow core/README.md; python core/scripts/dev.py when dependencies are installed.
Known limitations: these are scaffold pages, not finished UI/shop. Python dependencies existed already;
clean-environment install not performed. C03 replaces the Node bootstrap with Vite/React and updates
only the launcher web command as necessary. Engine reuse is still deferred.
Commit: this entry is included in the task commit; publication checkpoint follows.
Next: C03_T03.md. Read handoff; implement React shell and preserve the C01 endpoint.


## 2026-10-14 - C02 publication checkpoint

Commit cabd1d5: core: scaffold services with checked startup and shutdown.
Successful git push origin main advanced GitHub from 62cbd57 to cabd1d5.
C02 acceptance passed before commit. Hub/shared unchanged. All Core services are stopped.
Next task: C03/T03 React shell.


## 2026-10-14T16:18:29+05:30 - Requested scaffold regression

All existing C01/C02 HTTP and launcher failure-path checks passed. See TEST_RESULTS.md for
commands, limitations and live service details. No C03+ task is marked complete.
Services left running for user inspection. Next implementation prompt is C03_T03.md.
This checkpoint is carried in the regression-report commit; inspect Git history for its hash.
