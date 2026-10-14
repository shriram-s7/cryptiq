# Run CryptIQ Core locally

Core web is the C03 React navigation shell; the shop is still a scaffold. Scanning and shop accounts
are not implemented yet. The API retains the C01 fixture summary. Hub is never launched here.

## First setup (PowerShell, from D:\cryptiq)

Use Python 3.11+ and Node.js 20.19+ (or a supported newer LTS). Python 3.14.0 / Node 20.20.2 were tested.

```powershell
python -m venv core/.venv
core/.venv/Scripts/python.exe -m pip install --cache-dir core/.runtime/pip-cache -r core/requirements.txt
npm --prefix core/web ci --cache D:/cryptiq/core/.runtime/npm-cache
```

The web shell uses React/Vite, Tailwind and shared theme files. Fonts are bundled locally.
Runtime logs and cache stay under ignored core/.runtime/. Dependencies stay in core/.venv/ and
core/web/node_modules/. Vite's helper processes are stopped with its owned process tree.

## Start and stop

```powershell
core/.venv/Scripts/python.exe core/scripts/dev.py
```

If the pinned Python dependencies are already installed, `python core/scripts/dev.py` also works.
Use the same Python environment for both API and shop. Wait for all three Ready messages:

| Service | URL | Log |
|---|---|---|
| Core web | http://localhost:5173 | core/.runtime/logs/web.log |
| Core API | http://localhost:8000/api/health | core/.runtime/logs/api.log |
| Demo shop | http://localhost:5050 | core/.runtime/logs/shop.log |

Keep this terminal open. Press **Ctrl+C** in it to stop all three owned child processes.
Do not forcibly close or kill the launcher: a hard kill cannot run cleanup. If that happens, identify
the printed child PIDs and stop only those owned services before retrying. Normal stop, failed startup,
readiness timeout and unexpected child exit all clean up the children that this invocation started.

The launcher refuses occupied ports before starting anything. Stop standalone services in their
original terminals first (including the C01 API). It never kills an existing process or chooses a
different port. No Hub process is inspected, started or stopped. Logs are replaced on each launch.

## Acceptance and diagnostics

```powershell
python core/scripts/dev.py --check
```

This starts all services, checks real HTTP responses and stops them. It exits nonzero if a required
port is unavailable, a dependency/process fails, or a response never becomes ready (30-second timeout).

With all Core services stopped, `python core/scripts/check_launcher.py` also checks port-conflict
refusal, failed-child cleanup and startup timeout using real short-lived subprocesses. It replaces
the launcher logs with each scenario; finish by starting normally for usable service logs.

While the combined launcher is running, check the live public contract with:

```powershell
python core/api/check_public_stub.py
```

For standalone runs, see each service's README. If localhost sockets are blocked by an execution
sandbox, run these commands in an allowed local terminal; do not treat a blocked check as a pass.

## Current product workflow
See docs/FRONTEND_INTEGRATION.md for the frontend integration contract and docs/STATUS.md for acceptance.
The main loop now supports Scan -> Findings -> Attacks -> Review -> Merge -> Verify -> PDF -> Reset.
Subscriptions are conceptual; no billing or entitlement enforcement exists. All attacks/fixes target
only the fake local Chennai Organics shop. ZIP projects support source scans and inventory.
