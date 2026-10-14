# Core agent handoff

Read CORE_CONTEXT.md, CRYPTIQ_PLAN.md, SHARED_THEME_AND_CONTRACT.md, STATUS.md and progress.json.
Latest accepted: C11 inventory and C12 leak preview. Resume C13_T14.md (dictionary attack).
C19/C20/C21/C23 partially implemented; C18 accepted. Prior batch pushed as88889c3.
User explicitly prioritized a usable frontend and larger batches; this authorizes bringing UI forward.
Keep all functionality. Skip T02/T09 reuse until user releases it. Never modify hub/ or access outside
D:/cryptiq. Stage only core/shared/docs, core: commits, push completed work to origin/main.

Services running using core/.venv/Scripts/python.exe core/scripts/dev.py. Stop the launcher before
restarting. Main shop remains before mode, 3000 fake rows. Python and node dependencies installed.
Live UI scan/overview/findings in core/web/src/pages/LiveWorkspace.tsx. Mocks remain opt-in.
API scan_jobs.py uses core/.runtime/api/jobs.db; project latest scan persists; background stages,
interruption recovery, project revision and shop mtime guards reject obsolete results. Reset API
must invalidate jobs explicitly when implemented; file-change gate is current fallback.
ZIP POST uses raw application/zip, not multipart. Project GET embeds latest scan. No code executed.

Acceptance: build passed; 5 browser tests, check_scan_jobs.py, check_scan_persistence.py and public
stub check passed. Screenshot core/.runtime/overview-live.png inspected at1280x800. Tests require
before-mode DB. For Playwright set PLAYWRIGHT_BROWSERS_PATH=D:/cryptiq/core/.runtime/playwright.
No attack endpoints, browser merge, four-check verification or PDF yet. Next C11 inventory export,
then leak/attacks. Preserve honest candidate/verified distinction. Public fixture remains unchanged
and inconsistent by original contract. Protected migration exists offline; kyber-py is educational.

C11/C12 code: core/api/evidence.py, core/web/src/pages/LeakPreview.tsx. GET /api/scans/{id}/cbom
returns attachment CycloneDX1.6 from persisted assets; GET /api/projects/p_demo/leak-preview?limit=8
reads a consistent SQLite snapshot of allowlisted fake records, newest id first (1-20 rows). No keys
or decryption. API no-store. Frontend refresh clears old data; drawer masks when masked view selected.
API validation dependency: requirements-dev.txt. Official schema in api/schemas, no vendor engine.
ML-KEM768 is parameter-set identifier, not key bits; discovery keySize now null for that asset.
check_evidence.py --live and Playwright evidence.spec.ts passed. Services remain running. Before DB
unchanged; migration test used isolated temporary DB. Next connect dictionary attack to this visible
Attack Lab. Never use seed truth to produce attack results. User wants working visual product ASAP.

## C13 accepted - 2026-10-14
Real persistent local-only dictionary jobs and browser terminal. No seed-truth reads. check_dictionary.py passed actual signup, migrated recovery and timeout (118ms/3 evaluations); attacks.spec.ts passed1350/3000 recovery and API validation. Build passed. Services running; next C14. C11/C12 pushed6326026.

C14 accepted2026-10-14: bounded classical Pollard-rho simulation factors only <=64-bit public demo key, never reads private-key file. Recovered3000 IDs in201ms; protected actual inventory returns not_applicable. Timeout/unsupported checks and live browser RSA test passed. Next C15 review/merge. C13 pushed e4fb68a.

## Latest checkpoint: user explicitly requested stop
C15 accepted (isolated check_reviews.py and full merge.spec.ts passed); C16 in progress.
Main shop AFTER mode,3000 fake rows migrated. Latest launcher session95583, last known running.
Verification code core/api/verify/checks.py and core/web/scripts/verify-shop.cjs; UI
VerificationPanel.tsx. Build passed; live test command blocked by approval-review usage limit.
core/web/tests/verify.spec.ts was NOT created because the entire attempted command was rejected.
Resume by creating/running live verification acceptance, inspect failures, test injected failure,
retry and stale-state publication. Do not claim C16 complete from a successful build.
Review worker cleanup/fingerprint and publication race handling before final acceptance.
C17 PDF/live summary/reset not implemented. Do not reset main shop without accounting for
current after-mode evidence. Preserve all work. Last completed pushed commit before checkpoint:e45d492.
