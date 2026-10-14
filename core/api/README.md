# Core API: public summary stub

From D:\cryptiq in PowerShell:

```powershell
python -m venv core/api/.venv
core/api/.venv/Scripts/python.exe -m pip install -r core/api/requirements.txt
core/api/.venv/Scripts/python.exe -m uvicorn main:app --app-dir core/api --host 127.0.0.1 --port 8000
```

Stop with Ctrl+C. If the pinned dependencies are already installed in your Python environment,
`python -m uvicorn main:app --app-dir core/api --host 127.0.0.1 --port 8000` also works.

In another terminal, run the HTTP acceptance checks:

```powershell
python core/api/check_public_stub.py
```

Endpoints:
- GET /api/health returns {"ok": true}.
- GET /api/public/projects/chennai-organics/summary returns the exact parsed contents of
  shared/contracts/project_summary.before.json. The slug represents p_demo; persistence is not built yet.
- Other public project slugs return 404.

CORS allows http://localhost:5173 and http://localhost:5174 for GET requests and browser preflight.
This is a public summary API; CORS is not authentication. The API binds locally in the commands above.

## Stub limitations

No scanner, live project state, verification or report endpoint exists yet. The response carries
X-CryptIQ-Data-Source: stub and Cache-Control: no-store; the JSON is unchanged for Hub compatibility.
The existing before fixture is inconsistent: score 38 and verified=false accompany post-fix counts,
four passed checks and protected data flags. Its timestamp is illustrative. These are fixture values,
not evidence. Do not display them as a verified scan. Correction is tracked in docs/CORE_BUILD_PLAN.md.
