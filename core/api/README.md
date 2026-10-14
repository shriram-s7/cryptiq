# Core API - working local prototype

Use the shared Core environment and launcher from D:/cryptiq:

    core/.venv/Scripts/python.exe core/scripts/dev.py

Initial setup: install BOTH core/api/requirements.txt and core/demo-shop/requirements.txt into
core/.venv, npm ci in core/web, and install Playwright Chromium under core/.runtime/playwright.
Verification and PDF rendering require Node/Playwright; these dependencies are already installed
on the current demo machine. Do not run this demo API publicly: it has no authentication/tenancy.

Interactive API docs: http://localhost:8000/docs.
Complete screen/request/state mapping: docs/FRONTEND_INTEGRATION.md.
GET /api/projects/{id}/workflow is the frontend read model for persistent operations and capabilities.

Implemented: persistent scans, safe ZIP input, findings/score/data map, CycloneDX inventory,
fake-data preview, real bounded dictionary attack, classical tiny-RSA simulation, local source
reviews, atomic protected migration, four live verification checks, gated evidence PDF, live
Hub summary and reset. User actions are explicit POST operations, never side effects of page reads.

No GitHub OAuth/PR publication, subscription enforcement, billing, hosted tenancy or arbitrary-target
attacks are implemented. ZIP supports source-pattern scans/inventory; demo-only operations reject it.

Public summary retains frozen field names. X-CryptIQ-Data-Source is now live, not stub. The old BEFORE
fixture is historical and internally inconsistent; it is not used by the live service. Actual before
counts3/2/0/3 score38 checks0/4; actual verified after0/1/0/2 score91 checks4/4. Unknown projects404.
No-scan state hasScan=false and lastScanAt=null. Public PDF requires current accepted verification.

Run core/api/check_public_stub.py to check the LIVE public contract (legacy filename retained).
Other acceptance scripts and browser tests are documented in docs/STATUS.md. Some tests require
before mode and others intentionally migrate/reset the fake data; follow the stated sequence.
Report acceptance finishes with the demo restored to before mode.
