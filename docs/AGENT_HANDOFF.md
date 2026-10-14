# Core handoff - latest state

Read CORE_CONTEXT.md, CRYPTIQ_PLAN.md, SHARED_THEME_AND_CONTRACT.md, STATUS.md, progress.json.
Accepted C01-C18. Next C19; C19-C23 partially built, C27 partial regression. T02/T09 deferred.
Only D:/cryptiq access, never edit hub/. Stage only core/shared/docs; core: commits; push completed work.

Core loop works end-to-end: scan, findings, actual attacks, review/merge, four live checks, PDF, reset.
Last connected8-browser-test pass succeeded in1.2min. Full migration37.3s; PDF visually inspected3pages.
Main demo reset BEFORE,3000 rows; services running in launcher session37286. Python core/.venv.
Use PLAYWRIGHT_BROWSERS_PATH=D:/cryptiq/core/.runtime/playwright for browser checks.

API workflow.py provides frontend read model; report/results.py supplies current public summary,
gated Chromium-generated PDF and reset with active-job rejection. JSON schema for inventory in
api/schemas. Verification and PDF require Node+Playwright from core/web. PyMuPDF is dev-only.
Frontend handoff docs/FRONTEND_INTEGRATION.md contains exact routes, job states and limitations.

Public stub replaced by LIVE consistent counts/map; original inconsistent fixture remains unchanged.
No shared contract rename, no Hub edits. Summary no-scan state hasScan=false,lastScanAt=null.
Do not treat score91 candidate as verified; use project.verified / verification.published.

Runtime report snapshot core/.runtime/evidence-accepted.pdf is historical after reset; public PDF404
until reverified. Main DB reset removes fake signups/orders and job evidence; ZIP projects retained.
Subscriptions/auth/billing/GitHub are not implemented. Avoid claiming commercial multi-tenant readiness.

C16 pushed a05233d. Current C17 batch includes reports/reset/workflow models/integration docs;
find exact commit in Git history. Remaining acceptance should prioritize UI failure/stale/refresh states,
proper before/after attacks, active scan refresh, copyable report commands, then final polish/content.
Keep dictionary outcomes honest; no scripted zero after. Tests use real source/storage/browser operations.

Frontend product specification: docs/FRONTEND_PRODUCT_BRIEF.md. It defines five separate experiences,
plan scopes, business scan-to-fix-to-verify flow, a separate Hacker demo, Chennai Organics shop, and
Hub-owned read-only Partner Console. Proposed Partner price is ₹1,199/month including 3 active
client workspaces, then ₹500/month per additional active workspace. Billing, partner authorization/
tenancy, plan enforcement, and public URL scanning remain unimplemented. No C prompt acceptance
changed; next sequential prompt remains C19.
