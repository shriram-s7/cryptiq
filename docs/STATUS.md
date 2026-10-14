# Core status

11/29 prompts accepted: C01-C10 and C18. C19/C20 have working UI but remain partial.
18 prompts remain unfinished, plus deferred engine reuse T02/T09.

Working browser flow: Start scan -> live source/database scan -> score 38 and six-field data map ->
eight findings -> owner/developer views, filters, evidence drawer and guidance. Real bounded ZIP
scans also work. Results persist in SQLite. Failed requests show retry guidance; no mock fallback.
Overview fits 1280x800; mobile has no horizontal overflow. Workflow navigation states what is ready.

Run from D:/cryptiq: core/.venv/Scripts/python.exe core/scripts/dev.py
Services running: http://localhost:5173/scan, API :8000, demo shop :5050.
Click Start security scan, then Review 8 findings. Shop has 3000 fake before-mode customers.

Next C11 cryptographic inventory export, then C12 leak preview, C13/C14 attacks, C15/C16 review,
merge and verification, C17 reports/public summary. Full scan-to-report product is NOT complete.
Attack Lab, Fix & Verify and Report currently explain their unavailable actions honestly.
C19/C20 still need attack outcomes and patch previews. Candidate scores are NOT verified results.
The public Hub summary remains its original stub. Hub unchanged; reuse remains deferred.

Checks passed: production build; 5 focused browser tests; live scan/ZIP API checks; persistence and
stale-storage checks; public stub regression. Two layout failures were fixed before acceptance.
ZIP accepts raw application/zip; source inspection is Python-pattern best effort, never execution.
Uploads/results remain in ignored core/.runtime; no retention cleanup UI yet. Offline migration
remains a script; educational ML-KEM limitation and 24.7-40 second migration timing still apply.
See progress.json and PROMPT_COMPLETIONS.md for portable task handoff.
