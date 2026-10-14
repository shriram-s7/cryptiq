# Core status - 2026-10-15

Release update — 15 October 2026: v0.1.0-demo publishes the working full sharing link at the owner’s explicit request, with visual PPT and presenter guide. Temporary PC-backed hosting, shared synthetic state. Link and authenticated API returned HTTP 200. No source changes or live-state reset. Root deck copies match committed versions. Release: https://github.com/shriram-s7/cryptiq/releases/tag/v0.1.0-demo

Visual presentation revision: use docs/presentation/CryptIQ_Tech_Squad_Visual_Deck.pptx. Replaces the text-heavy deck with four current product screenshots, editable workflow/architecture and five tables. Keeps the 12-section sequence and detailed notes. Demo and GitHub hyperlinks on closing slide. No live app state reset or repair performed.

Presentation update — 15 October 2026: prepared the 12-slide Tech Squad / CryptIQ deck in docs/presentation, with detailed speaker notes and Business demo script. Updated root README and temporary live-origin instructions. Hash Patch remains deferred, pricing and financial assumptions are distinguished from validated results. No application state changed. Run: open the PPTX; hosting instructions in PUBLIC_DEMO.md. Next: C19 remains pending, plus production hosting and pilot validation.

LATEST — 2026-10-15: Public demo live through a free temporary Cloudflare Tunnel; reviewer link in
core/.runtime/public-demo-link.txt (ignored). This depends on the presenter PC being awake/online,
not permanent hosting. Instructions: docs/PUBLIC_DEMO.md. Current demo reset to BEFORE, score38,
0/4 applied; backup of prior database retained in core/.runtime/pre-public-demo.db.

Completed: same-origin built dashboard + /shop + API, access-link cookie gate, named Hacker tab,
same-tab navigation for other views, Northstar Security Advisory rename, report contrast and real PDF
blob download with error handling. Repair UI now uses server state, discards stale browser fixed flags,
and has ONE actual migrated-record bar. Four dependent repairs remain an atomic bundle; individual
cards select for review, not fake independent success. True independent 1/4 application is not implemented.

Passwords: repaired records now use a server-held HMAC pepper before Argon2id. Actual database-only
attack recovered prosculpt123 before, failed on SAME account after, failed on fresh same-password signup;
normal phone login still passed. This supersedes earlier notes about plain Argon2id after-mode behavior.
Legacy non-peppered hashes remain supported. Host-secret compromise and online guessing are outside scope.

Validation: isolated dictionary + 3000-row migration/rollback/login checks passed; production build passed;
public HTTPS browser journey passed in 1.2min including plans, notifications, counts, one progress bar,
same-account reattack, four live verification checks, PDF download and partner rename. Final public report
contrast and reset-to-before state checked. PDF at core/.runtime/public-evidence.pdf is a historical sample.
One interrupted migration lock from a concurrent open tab was cleared only after checking all jobs idle,
SQLite integrity and full rollback to MD5. Avoid changing shared demo state from multiple tabs during tests.
Next: C19+ remaining prototype acceptance; independent fix execution if requested; persistent cloud hosting
requires a hosting account. Engine reuse T02/T09 remains deferred. Accepted C01-C18 count unchanged.

--- Prior checkpoints (historical) ---

Latest publication: all current Core UI/backend changes consolidated. See CURRENT_SNAPSHOT.md
for routes, validation and remaining limitations. Hub and root presentation remain unchanged.
Restored RSA storage/inventory consistency guard. Default shell test uses current product routes.

Latest: added prosculpt@123 and prosculpt123; dictionary now has 25 candidates.

Latest update: dictionary now includes smit123, founder123 and shriram123 (23 candidates).
Removed the signup demo-password autofill button. Enter the desired test password manually.

LATEST: Notifications are now top-right email-style pop-ups (15s auto-dismiss, explicit close, click to
open the matching workbench). Existing activity feed retains history; initial load does not replay it.
Password attempts from Hacker now target only the selected customer; verification retains dataset-wide
checks. Signup has a Use crackable demo password button filling chennai123. Any fake name/valid phone
works with that known example. Arbitrary passwords are not guaranteed crackable, even before fixes;
known weak passwords remain guessable after fixes. No fake success or saved plaintext is used.
Checks: production build, all 20 exact-target dictionary fixtures, strong negative, weak Argon2 recovery,
missing target, dataset-wide compatibility, and toast browser test with real targeted API call passed.
Run: core/.venv/Scripts/python.exe core/api/check_targeted_dictionary.py; Playwright toast-notifications.spec.ts.
Services restarted with these changes. No reset performed by this task; observed demo currently BEFORE.
Next: remaining C19 acceptance against current UI. Other uncommitted UI work preserved.

PREVIOUS TASK: Three-field shop registration (name/phone/password), phone login, animated signup/login/checkout
notifications opening the matching Hacker module and exact account. Recovered values are account-scoped;
removed fabricated password/ID fallbacks. Current demo is AFTER fixes, verified 91; no demo reset performed.
Validation: production build, shop acceptance, 58-second connected browser journey through real migration
and all four verification checks passed. Protected phone login also passed. Notifications omit deleted
verification customer/order fixtures. Run services with core/.venv/Scripts/python.exe core/scripts/dev.py.
Focused browser test: PLAYWRIGHT_BROWSERS_PATH=core/.runtime/playwright, notifications.spec.ts; requires
an initialized BEFORE demo and leaves it AFTER. Old experience tests contain other stale UI selectors.
Historical limit (now fixed for Hacker): dictionary was dataset-wide; weak passwords can still crack after repair. Transaction
module is a labeled simulation. Existing unrelated UI changes remain in the working tree. Next: C19
acceptance against the latest UI; engine reuse remains deferred. Prompt acceptance counts unchanged.

PREVIOUS LATEST: connected UI redesign delivered. Start http://localhost:5173/ for demo plans and four
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
