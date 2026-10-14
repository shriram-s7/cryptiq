# Frontend integration handoff

This is a LOCAL WORKING PROTOTYPE, not a hosted multi-tenant product. Authentication, billing,
subscription quotas, scheduled scans and GitHub OAuth are not implemented. Do not expose this
local API publicly. Four subscription concepts remain presentation/planning only.

## Services and ownership
Core UI http://localhost:5173; Core API http://localhost:8000; fake shop http://localhost:5050.
Hub http://localhost:5174 owns landing/pricing/partner/public badge. Do not edit hub/.
Keep Core paths /scan, /p/:id, /p/:id/findings, /attack, /fix, /report. Change styling freely
inside Core; coordinate shared theme tokens with Hub. All frontend mocks are explicitly opt-in.
Use VITE_CORE_API_URL and VITE_HUB_WEB_URL; current allowed CORS origins are localhost5173/5174
and127.0.0.1:5173. API documentation is available at http://localhost:8000/docs.

## First request for a project screen
GET /api/projects/{id}/workflow returns project, scan, attacks (dictionary/shor_sim), review,
verification, verified, busy, nextAction, capabilities and subscription availability. Nullable
records are genuinely absent; do not substitute sample success. nextAction is guidance, not
an authorization guarantee. capabilities describe implemented scope; combine with busy/job state.
Read this after refresh to recover persistent job IDs. Poll relevant active job every300-500ms;
stop polling on component unmount. Stopping polling does not cancel a backend operation.

## Screen and operation contracts
| View / operation | Request | Result / next step |
|---|---|---|
| Demo scan | POST /api/projects/p_demo/scans JSON {"source":"demo"} |202 {scanId}; poll GET /api/scans/{id}|
| ZIP project | POST /api/projects JSON {"name":"example.zip"} |{id,name}|
| ZIP scan | POST /api/projects/{id}/scans raw ZIP bytes, Content-Type application/zip |202 {scanId}; same polling|
| Overview / findings | GET /api/projects/{id} |Embedded latest scan and verified boolean|
| Inventory | GET /api/scans/{id}/cbom |Download application/json;409 unless completed|
| Stored preview | GET /api/projects/p_demo/leak-preview?limit=8 |Actual fake stored rows, newest first;limit1-20|
| Dictionary | POST /api/projects/p_demo/attacks JSON {"kind":"dictionary","budgetSeconds":5} |202 {attackId}; GET /api/attacks/{id}|
| RSA simulation | Same endpoint with kind shor_sim |Same job; verdict cracked/timeout/not_applicable|
| Review | POST /api/projects/p_demo/reviews JSON {} |201 full review including actual file diffs|
| Merge | POST /api/reviews/{id}/merge |Review status; GET /api/reviews/{id} until merged/error|
| Verify | POST /api/projects/p_demo/verifications |202 {verificationId}; GET /api/verifications/{id}|
| Current publication | GET /api/projects/p_demo/verification |{verification,published}; use published for success|
| Report | GET /api/projects/p_demo/report.pdf |PDF only for current passed verification;404 otherwise|
| Hub summary | GET /api/public/projects/chennai-organics/summary |Frozen fields plus revision/evidenceState/hasScan|
| Hub PDF | GET /api/public/projects/chennai-organics/report.pdf |Same gated PDF|
| Reset | POST /api/demo/reset JSON {"confirm":true} |Restores original fake3000 customers; invalidates evidence|

ZIP limits20MB compressed,100MB expanded,2000 entries,20MB per file. Python-pattern coverage only.
ZIP projects have no connected database, attack/migration/verification/PDF capability. Do not offer
production credentials or arbitrary database targets. Local demo migration is one atomic four-fix
bundle; partial selection rejects422. It is NOT a GitHub PR; no remote repository is mutated.

## State meanings
Scan running/done/error. Attack running/done/error, measured tried/cracked/total/durationMs,
revealed entries {customerId,field,value}. field can be password or id_number; never label ID
recoveries as password recoveries. Masking applies to stored AND recovered values.
Review open/merging/merged/error, completed/total actual migrated counts. Repeated same merge is
idempotent. Verification running/passed/failed, checks[].status pending/running/pass/fail.
A passed historical record is not necessarily current: honor published/verified, not status alone.
Source or database changes, new scans and reset can invalidate publication. Clear old success when
starting a new run. Score91 from scan alone is only a candidate. Never hard-code38->91.

## Sequence
Choose input -> real progress -> overview -> findings -> attacks -> local review -> merge -> four
checks -> report. Navigation itself must not run a scan/attack/merge. No mutation on page load.
Use separate buttons for each operation; one primary action in the active stage. Preserve five
sidebar entries. No forced branding change needed for this backend integration.

## Errors / recovery
Read JSON detail when a string;422 can contain structured validation detail.404 missing resource,
409 conflicting/stale/ineligible operation,413 oversized upload. Display useful recovery and retain
inputs. No fallback to mock data. When reset invalidates a review ID, clear its local saved ID.
Reset requires explicit user confirmation because it removes fake signups/orders and old evidence.
Downloads are historical snapshots; public download access is checked against current evidence.

## Truthful product claims
Dictionary is20 curated candidates, default5-second budget, maximum60. MD5 shares work across equal
hashes; Argon2 requires expensive per-hash verification. Zero recovered within budget is NOT proof
that every password is safe; known weak passwords can recover after migration. RSA is classical
Pollard-rho against <=64-bit PUBLIC demo key, not quantum hardware or RSA2048. ML-KEM implementation
is educational. Security-safeguard evidence is not legal certification.

## What changed for Hub
The old exact BEFORE fixture was inconsistent: after-state counts accompanied score38. It is now
historical only. Live summary computes actual counts/map; before is3 critical,2 high,0 medium,3 low,
score38 and checks0/4. After verified is0 critical,1 high,0 medium,2 low,score91/checks4/4. Field
names remain stable; no shared fixture was silently changed. No-scan state is hasScan=false,
score0,lastScanAt=null: UI must say Not scanned, not display0 as an assessed score.

## Acceptance and running
Start core/.venv/Scripts/python.exe core/scripts/dev.py. Node dependencies under core/web.
PLAYWRIGHT_BROWSERS_PATH=D:/cryptiq/core/.runtime/playwright. Browser merge may take about a minute.
Main demo was reset to before by report acceptance so a fresh demonstration can start at38.
Latest checks: verify.spec.ts and report.spec.ts, isolated check_verification_gates.py; three-page
PDF rendered and visually inspected. Prior merge, attacks, scan and inventory checks also passed.
See docs/STATUS.md and docs/progress.json for accepted versus partial prompt work.
