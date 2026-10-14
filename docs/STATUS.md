# Core status - 2026-10-14

LATEST: connected UI redesign delivered. Start http://localhost:5173/ for demo plans and four
experiences. Read docs/UI_SHOWCASE.md for the current routes, presentation flow and limitations.
Guided setup, separate Hacker/partner layouts, redesigned shop and separate verification now exist.
Build and connected browser journey passed. Original C prompt counts below remain unchanged.
The previous baseline description below is historical; use the latest UI_SHOWCASE handoff.

18/29 prompts accepted: C01-C18. 11 prompts remain unfinished, including partially implemented
C19-C23 frontend acceptance and C27 final regression. Engine reuse T02/T09 remains deferred.

The Core demonstration loop is operational and tested:
Scan38 -> findings -> dictionary/RSA demonstrations -> actual source review -> merge/migration ->
four live verification checks -> verified91 -> three-page PDF -> reset to38.

Last connected batch:8 browser tests passed in1.2minutes (attacks/live/merge/report/workflow).
Full3000-row migration took37.3seconds in that browser test. Verification exercised actual login,
checkout and new signup. Failure/stale publication and active-job reset guards passed separately.
Production build passed. PDF:three pages visually inspected, currency glyph and disclaimers checked.

Main fake shop is NOW BEFORE mode,3000 original fake customers, ready for another demonstration.
Local services running: http://localhost:5173/scan, API:8000, shop:5050.
Launcher: core/.venv/Scripts/python.exe core/scripts/dev.py from D:/cryptiq. Avoid duplicate launcher.

Frontend developer handoff: docs/FRONTEND_INTEGRATION.md. Stable read model:
GET /api/projects/{id}/workflow; interactive API docs at http://localhost:8000/docs.
Typed live workflow/review/attack/verification models in core/web/src/lib/contracts.ts.
Theme redesign is left to frontend collaboration; Hub untouched. Shared fields remain unchanged.

Public summary now uses actual evidence (X-CryptIQ-Data-Source:live), no longer the inconsistent stub.
Current verified PDF is gated; reset/new relevant state removes publication. Old shared before JSON
is historical and unchanged. The legacy check_public_stub.py now validates the live contract.

Still unfinished: final frontend states/UX polish, complete report UI acceptance, owner wording
review, pitch/Q&A, full final regression, video and submission package. Subscription billing,
quotas, authentication, hosted tenancy and GitHub connection are NOT implemented. This is local-only.
ZIP projects support source scan/inventory, not attacks/automatic fixes/verification/PDF.

Limits:20 curated dictionary candidates, default5-second budget; zero recovery is not proof of
strong passwords. Weak migrated passwords can still recover. RSA is classical tiny-key simulation.
ML-KEM library is educational. Key-store/host security and comprehensive audits are outside scope.

Artifacts: core/.runtime/evidence-accepted.pdf (historical verified snapshot), report-page-1/2/3.png,
report-live.png. Runtime evidence is intentionally ignored by Git; source/tests/docs are pushed.
Next portable prompt C19; continue frontend acceptance without pretending billing is implemented.

## Frontend product brief - 2026-10-14

Added `docs/FRONTEND_PRODUCT_BRIEF.md` as a product-level handoff for the frontend designer.
It defines five distinct experiences, the business scan-to-fix-to-verify journey, Free/Starter/Business
scope, a read-only Partner Console, separate Chennai Organics and Hacker demo sites, filler data,
and honest technical limitations. Proposed Partner price is ₹1,199/month including 3 active clients,
then ₹500/month for each additional active client. These proposed tiers are not implemented or validated.
No C19-C29 acceptance status changed. Next sequential Core prompt remains C19; T02/T09 remain deferred.
