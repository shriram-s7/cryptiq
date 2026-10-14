# Core agent handoff

Read CORE_CONTEXT.md, CRYPTIQ_PLAN.md, SHARED_THEME_AND_CONTRACT.md, STATUS.md and progress.json.
Latest accepted: C10 scan jobs and C18 live scan screen. C19/C20 partial. Resume C11_T12.md.
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
