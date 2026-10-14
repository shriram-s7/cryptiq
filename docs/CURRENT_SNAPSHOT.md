# Current published Core snapshot — 2026-10-15

This snapshot includes the current locally developed Core UI and backend together: dashboard,
setup, findings, fixes, verification, reporting, Hacker notifications, partner demo, settings,
confetti and public badge view. Prior commits are retained. Hub is unchanged.

## Run

From D:\cryptiq, run `core/.venv/Scripts/python.exe core/scripts/dev.py` after installing the
existing Python and web requirements. Services: dashboard localhost:5173, API localhost:8000,
shop localhost:5050. Do not start a second launcher while these ports are occupied.

## Validation for this snapshot

- Production TypeScript/Vite build passed.
- Nine current routes rendered without browser errors; default shell test updated to current routes.
- Dictionary exact-account checks: all 25 candidates; strong negative; weak Argon2 positive.
- Real tiny RSA factoring, migrated storage, timeout and key-size checks passed.
- Public summary contract, verification consistency, Hub CORS and unknown-project behavior passed.
- Notification popup navigation/dismissal and targeted live attack browser test passed.

## Scope and limitations

This is a prototype snapshot, not certification that every feature is complete. Older specialized
browser suites still contain historical selectors and are not claimed to pass. C19-C29 acceptance
remains unfinished; engine reuse T02/T09 remains deferred. Website scan/payment/transaction simulation
limitations documented in STATUS and the product handoff still apply. Dictionary recovery uses a
known 25-word list; arbitrary passwords may not recover and weak passwords may recover after fixes.
RSA results must validate active inventory and stored ciphertext before reporting not-applicable.

The 12-slide presentation at the repository root and its PowerPoint lock file remain local and
are not part of the code snapshot. Runtime data, dependencies and local secrets are not published.
