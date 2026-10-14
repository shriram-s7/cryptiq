# Core status

14/29 prompts accepted: C01-C13 and C18. C19/C20/C21/C23 have working portions but remain partial.
15 prompts remain unfinished, plus deferred engine reuse T02/T09.

Working browser flow: Start scan -> live source/database scan -> score 38 and six-field data map ->
eight findings -> owner/developer views, filters, evidence drawer and guidance. Real bounded ZIP
scans also work. Results persist in SQLite. Failed requests show retry guidance; no mock fallback.
Overview fits 1280x800; mobile has no horizontal overflow. Workflow navigation states what is ready.

Run from D:/cryptiq: core/.venv/Scripts/python.exe core/scripts/dev.py
Services running: http://localhost:5173/scan, API :8000, demo shop :5050.
Click Start security scan, then Review 8 findings. Shop has 3000 fake before-mode customers.

Next C14 RSA simulation, then C15/C16 review,
merge and verification, C17 reports/public summary. Full scan-to-report product is NOT complete.
Attack Lab now shows live fake database rows with newest-first, masking and inspection. Report offers a real CycloneDX inventory download. Attack execution, merge/verify and PDF are still unavailable.
C19/C20 still need attack outcomes and patch previews. Candidate scores are NOT verified results.
The public Hub summary remains its original stub. Hub unchanged; reuse remains deferred.

Checks passed: production build; 5 focused browser tests; live scan/ZIP API checks; persistence and
stale-storage checks; public stub regression. Two layout failures were fixed before acceptance.
ZIP accepts raw application/zip; source inspection is Python-pattern best effort, never execution.
Uploads/results remain in ignored core/.runtime; no retention cleanup UI yet. Offline migration
remains a script; educational ML-KEM limitation and 24.7-40 second migration timing still apply.
See progress.json and PROMPT_COMPLETIONS.md for portable task handoff.

C11/C12 batch: official CycloneDX 1.6 schema validation passes for before/after assets and HTTP download.
Fresh signup, empty preview, exact stored fields and migrated ciphertext passed isolated-shop checks.
Browser preview, masking, drawer, refresh, limit/project errors and download passed. No main-shop
customer rows were added by tests. Visit /p/p_demo/attack; open demo signup, return and Refresh.
Schema reference: https://cyclonedx.org/schema/bom-1.6.schema.json (bundled unchanged for checks).

C13 complete: real dictionary attack is live in Attack Lab. 1350/3000 before passwords recovered from20 common guesses. Five-second default budget,max60. Argon2 slows guessing but known weak passwords can still recover: isolated migrated test recovered2/2 in98ms. No scripted zero-crack claim. Next C14, then review/merge.
