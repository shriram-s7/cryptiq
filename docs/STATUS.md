# CryptIQ Core status

Updated: 14 October 2026, IST.

## Current checkpoint

C02/T01 is implemented and accepted. Core API, minimal web page and Flask shop entry point can run
through one launcher. C01's exact-fixture summary and CORS still pass their checks.
C02 commit cabd1d5 was successfully pushed to origin/main.
Latest regression: all existing checks passed; see TEST_RESULTS.md. All three scaffold services
are currently running for inspection. Full product flow is not implemented.

## Completed

- Detailed Core plan, 29 exportable task prompts, completion log, progress database and handoff.
- C01: health and public summary stub, Core/Hub CORS and repeatable HTTP acceptance checker.
- C02: minimal web/shop services; combined launcher; separate logs; occupied-port refusal;
  cleanup on failed child, startup timeout, normal check completion and Ctrl+C; setup/run documentation.

## How to run

From D:\cryptiq, first install if needed:

```powershell
python -m venv core/.venv
core/.venv/Scripts/python.exe -m pip install --cache-dir core/.runtime/pip-cache -r core/requirements.txt
core/.venv/Scripts/python.exe core/scripts/dev.py
```

If the pinned dependencies are already installed: `python core/scripts/dev.py`.
Node 20+ is needed; no npm installation is required for this temporary scaffold.
Open web at http://localhost:5173, API health at http://localhost:8000/api/health and shop at
http://localhost:5050. Ctrl+C stops all three launcher-owned services. Logs: core/.runtime/logs/.
See core/README.md for complete instructions.

Checks with services stopped: `python core/scripts/check_launcher.py`.
While running: `python core/api/check_public_stub.py`.

## Known issues

- Web is a minimal Node-served scaffold; React/Vite, routes and theme are C03.
- Shop is a Flask scaffold; no database, signup, login or checkout yet (C05 onward).
- Summary remains the exact requested stub: score 38/unverified but contradictory post-fix counts
  and passed checks. Its timestamp is an example. No scanner, live verification or report endpoint yet.
- T02/T09 engine reuse remains deferred. Hub and shared files are unchanged.
- Python packages were already installed for acceptance; fresh-environment installation was documented
  but not performed. No external assets are needed by the scaffold pages.
- Hard-killing a launcher bypasses cleanup; use Ctrl+C and the documented recovery instructions.

## Next task

[C03/T03](prompts/C03_T03.md): React/Vite shell, six Core routes, shared theme and five sidebar entries.
Replace the temporary Node web entry point and update the launcher's web command in that task.

## Portable records

- [Detailed plan](CORE_BUILD_PLAN.md)
- [Sequential prompts](CORE_PROMPTS.md)
- [Progress database](progress.json)
- [Actual completion log](PROMPT_COMPLETIONS.md)
- [Agent handoff](AGENT_HANDOFF.md)
