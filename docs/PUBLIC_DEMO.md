# Public demonstration — 15 October 2026

Current origin: https://usual-orbit-national-mazda.trycloudflare.com/
New reviewers require the complete private access link.

Presentation: [Tech Squad deck](presentation/CryptIQ_Tech_Squad_Visual_Deck.pptx).
Detailed notes: [Presenter guide](presentation/PRESENTER_GUIDE.md).

The prototype has a free temporary Cloudflare Tunnel link. This is a live link to the presenter PC,
not permanent cloud hosting: keep the PC awake, connected and the services running. Restarting the
tunnel produces a different address. The complete reviewer link is stored locally in
`core/.runtime/public-demo-link.txt`; do not commit it or the access key.

## Start

Build: `npm --prefix core/web run build`.
Use the existing Python environment and browser installation in core/.runtime/playwright.
Install the official cloudflared binary in core/.runtime/bin/cloudflared.exe if missing:
https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe

From D:\cryptiq run `core/.venv/Scripts/python.exe core/scripts/public_demo.py`.
If existing services lack the public gateway, stop the owning launcher first, then start it with
`$env:CRYPTIQ_PUBLIC_DEMO='1'; core/.venv/Scripts/python.exe core/scripts/dev.py`.
Do not stop/restart the API during a migration or verification.

Gateway serves the compiled frontend at /, Flask shop at /shop/, and API at /api/.
Only the access-link holder may enter from a public hostname. The HttpOnly Secure access cookie
covers all views; the access query is removed after admission. Unauthenticated API and database
previews are blocked. Source uploads are restricted to local use for this presentation. Data and
reset state are shared between reviewers. Use fake data only and conduct one demonstration at a time.

## Presentation

1. Open the complete access link. Home shows plans; choose Business for the complete export flow.
   Free provides discovery, not repair/verification; Starter supports repair/verification.
2. Choose Chennai Organics, give consent, save project and scan. Start from the BEFORE demo.
3. Open Hacker using the navigation link. It opens a separate named tab; other views stay in the main tab.
4. Open Chennai Organics, register a fake name/phone with prosculpt123 (or another of 25 dictionary words).
   Click the signup notification in Hacker, then Run attempt. Show the actual recovered password.
5. Return to Fixes: 0/4 Applied. Cards can be selected for review. These four dependent repairs are
   currently one atomic backend operation: Apply all four/Fix It Now. Individual selection is NOT an
   applied fix. One progress bar shows real migrated-record counts; 4/4 only after successful commit.
6. Return to Hacker and retry the SAME account. It cannot recover the password from the database-only
   snapshot. Registering again with that same password also uses protected storage; normal login works.
7. Return to verification and run all four checks AFTER any new shop activity. Then open Report and
   Export PDF Report. Further database changes invalidate publication and require verification again.
8. Open Partner console: Northstar Security Advisory. Explain the read-only client portfolio and
   displayed pilot pricing (₹1,199 includes 3 active clients; ₹500 per additional active client).
9. To repeat, use the reset control, confirming removal of fake registrations/orders and old evidence.

## What changed in password protection

Repaired passwords use HMAC-SHA256 with a random server-held pepper before Argon2id. Existing MD5
hashes are wrapped without recovering plaintext. The secret is stored outside SQLite, ignored by Git,
and is never passed to the dictionary attacker. Unlike plain Argon2id, this makes the same weak test
password unrecoverable in the demonstrated database-only attack. This does NOT establish resistance
to server compromise or online guessing. Legacy non-peppered schemes remain readable for compatibility.
The pepper file must be retained alongside the protected key store for normal login to work.

## Checks

Run `core/.venv/Scripts/python.exe core/api/check_dictionary.py` and
`core/.venv/Scripts/python.exe core/demo-shop/check_migration.py` for isolated backend checks.
Set PLAYWRIGHT_BROWSERS_PATH to D:\cryptiq\core\.runtime\playwright and CRYPTIQ_DEMO_URL to the
current public origin, then run public-demo.spec.ts. That connected test resets the fake shop and
leaves it AFTER with verified evidence; it checks the same password before/after and downloads a real PDF.

Cloudflare Tunnel documentation: https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/
