# Core checkpoint - 2026-10-14

Stopped at the user's request. 16/29 prompts accepted: C01-C15 and C18.
13 prompts remain unfinished, plus deferred engine reuse T02/T09.
C16 verification is implemented but NOT accepted. C19-C23 have partial UI work.

Working: live scan and ZIP upload, score/data map/findings, inventory download, real dictionary
attack and tiny-public-key RSA simulation, source diff review and browser merge/migration.
Dictionary recovered1350/3000 before passwords; RSA simulation decrypted3000 fake IDs.
Full browser merge test passed in51 seconds. Main shop is now AFTER mode with3000 encrypted
fake customer records. Do not expect38 on a fresh scan of this migrated database.
Existing logins are preserved; candidate protected score91 is not a verified claim.

Verification backend and four-check UI are implemented; build passed. Live verification acceptance
was NOT run because automatic approval review failed due usage limit. No all-pass result claimed.
Next: finish C16 real verification, failure gate, retry and stale-state acceptance, then C17 reports,
public summary and reset. PDF and live Hub public results remain unfinished; summary is still stub.

Run: core/.venv/Scripts/python.exe core/scripts/dev.py from D:/cryptiq.
Last known services running: localhost:5173, API:8000, shop:5050. Avoid duplicate launcher.
Open http://localhost:5173/p/p_demo/fix for review/verification UI or /attack for real attacks.
Main data was intentionally migrated by the acceptance test; it has not been reset.

Known limits: bounded dictionary outcomes are not exhaustive security proof; migrated weak
passwords can still recover (isolated test recovered2/2). ML-KEM library is educational.
No Hub changes. Reuse stays deferred. See progress.json and AGENT_HANDOFF.md.
