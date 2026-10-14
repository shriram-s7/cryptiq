# Core handoff - latest state

Presentation update — 15 October 2026: prepared the 12-slide Tech Squad / CryptIQ deck in docs/presentation, with detailed speaker notes and Business demo script. Updated root README and temporary live-origin instructions. Hash Patch remains deferred, pricing and financial assumptions are distinguished from validated results. No application state changed. Run: open the PPTX; hosting instructions in PUBLIC_DEMO.md. Next: C19 remains pending, plus production hosting and pilot validation.

Latest handoff: read docs/PUBLIC_DEMO.md and top of STATUS.md. A free Cloudflare tunnel is running;
complete reviewer link is local ignored core/.runtime/public-demo-link.txt. Do not publish access key.
Compiled frontend and shop share API port8000 via CRYPTIQ_PUBLIC_DEMO=1. Local ports5173/5050 remain.
Current state BEFORE score38/0 applied. Public full flow/PDF passed. Do not restart API during jobs.
Peppered Argon2id now ensures this database-only known-password reattack actually fails after repair,
while app login works. Preserve data/password_pepper.key and protected_keys.json (both ignored).
Individual cards only select for review: repairs remain one atomic bundle; do not claim 1/4 applied.
Public upload disabled; shared fake database; PC must stay on. Remaining C prompts not accepted here.


Latest publication: all current Core UI/backend changes consolidated. See CURRENT_SNAPSHOT.md
for routes, validation and remaining limitations. Hub and root presentation remain unchanged.
Restored RSA storage/inventory consistency guard. Default shell test uses current product routes.

Latest: added prosculpt@123 and prosculpt123; dictionary now has 25 candidates.

Latest update: dictionary now includes smit123, founder123 and shriram123 (23 candidates).
Removed the signup demo-password autofill button. Enter the desired test password manually.

Latest: Top-right transient toasts replace the banner. Hacker sends customerId for targeted dictionary
attempts; verification still tests whole database. Signup offers known chennai123 demo fill. No guarantee
for arbitrary passwords; weak passwords also recover after fixes. Latest tests: toast-notifications.spec.ts
and check_targeted_dictionary.py passed. Live demo observed BEFORE; no reset by this task.

2026-10-15: Signup now asks only name/phone/password. Phone login selects newest registration for
a repeated phone. Live Hacker notifications open the exact account/module; never substitute another
recovered credential. See STATUS.md and notifications.spec.ts. Current demo AFTER, verification passed.
Other pre-existing UI edits remain uncommitted; preserve them.

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


Latest user-requested UI batch: see docs/UI_SHOWCASE.md. Entry /, guided /scan, standalone /hacker,
read-only /partner-demo, separate /p/:id/verify. /attack redirects to /hacker. Shop redesigned with
SVG produce, search/category filtering and fake checkout. Event feed /api/demo/activity contains no
credentials; shop writes bounded local runtime JSON. Build and connected browser checks passed.
No Hub edits; new Core demo entry/partner preview authorized by latest user scope. Local plan locks
are not server enforcement. URL scan unavailable; transaction scenario labeled scripted; individual
repairs still bundled. Main demo is reset BEFORE after acceptance for presentation. Launcher session
35412 owns the running Core services. C19-C29 counts unchanged; engine reuse remains deferred.
