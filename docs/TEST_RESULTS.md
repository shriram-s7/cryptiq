# Core regression checkpoint

Tested: 2026-10-14T16:18:29+05:30
Baseline: C01 and C02, commit 8804369. No additional features were implemented during this test.

## Passed

- All three services start together and return HTTP 200 with their expected content.
- API health and exact before-summary fixture equality.
- Hub GET and preflight CORS, unknown-slug 404 and unrelated-origin CORS rejection.
- Demo shop health JSON.
- Occupied-port refusal without replacing the existing listener.
- Failed-child detection and cleanup of siblings.
- Startup timeout cleanup and release of owned ports after check mode.

Commands: `python core/scripts/check_launcher.py`; `python core/scripts/dev.py`;
`python core/api/check_public_stub.py`; HTTP GET checks for web, shop and shop health.
All completed checks exited successfully. The live launcher remains running for inspection.

## Not available to test

React routes, customer signup/database, scanning, crypto inventory, dictionary attack, factoring
simulation, fixes/migration, verification gating, PDF and end-to-end demo. C03 onward is unfinished.
This is a passing scaffold regression, not a completed product or successful security demo.
The existing public summary is still an inconsistent fixture, not actual scan evidence.

## Current services

Web: http://localhost:5173
API: http://localhost:8000/api/health
Shop: http://localhost:5050

Launcher session 79448 in the current agent environment; Ctrl+C stops its owned children.
Observed child PIDs: API 8964, web 6876, shop 3964. Verify current process state before acting on IDs.
These may not survive the session. Logs are in core/.runtime/logs/.

Next implementation task remains C03/T03. T02/T09 remain deferred; Hub remains untouched.
