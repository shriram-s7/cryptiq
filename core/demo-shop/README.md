# Chennai Organics before-mode demo shop

Use the shared Core environment from core/README.md, then from D:\cryptiq:

```powershell
core/.venv/Scripts/python.exe core/demo-shop/app.py
```

If Flask is already installed, `python core/demo-shop/app.py` also works.
Open http://localhost:5050. Ctrl+C stops the server. Debug and reloader are disabled; port 5050 is fixed.
The shop provides six products, a session basket, signup, login, checkout and persisted fake orders.
Only local demo use is intended: passwords deliberately use MD5, contact data is plaintext and the
Secure cookie flag is absent. Form CSRF, validation, parameterized SQL and server-side pricing are
included. Never enter real customer details or passwords. No payment gateway or delivery exists.

## Seed and reset (stop the shop first)

```powershell
python core/demo-shop/seed.py
python core/demo-shop/reset.py
```

Seed creates exactly 3,000 repeatable fake customers, including priya@example.test / priya@123.
Exactly 1,350 passwords (45%) belong to the curated demo common-password list. A deterministic
local name list is used instead of adding Faker; all email addresses use example.test and ID numbers
are explicitly fake. No external customer data is used. IDs use tiny 64-bit textbook RSA from active src_before code (simulation only).
Protected-mode migration is implemented in C08.

The seed refuses to overwrite existing customer data unless --force is explicitly supplied.
data/shop_before.db is the fake reset snapshot allowed in Git. data/shop.db, session.key, seed truth
and state.json are ignored. Session secret is generated locally, never committed. Reset restores the
snapshot and before mode; restart and log in again. Mode is read per request, and unimplemented modes
fail rather than silently writing insecure data.

One acceptance run: `python core/demo-shop/check_shop.py`. It uses a temporary database under
core/.runtime, verifies signup/login/checkout and pricing, then seed determinism, counts and snapshot.

## Protected mode (stop the shop first)

Install current core/requirements.txt into core/.venv, then:

```powershell
core/.venv/Scripts/python.exe core/demo-shop/migrate_to_after.py
core/.venv/Scripts/python.exe core/demo-shop/app.py
```

The migration uses a single SQLite transaction for ciphertext, password-scheme metadata, email lookup
indexes and mode. Existing users get Argon2id-wrapped MD5; new users get ordinary Argon2id. Email
lookup is keyed HMAC, so login/duplicate detection still work with randomized encrypted email fields.
Phone/email/address/ID use AES-256-GCM with unique random nonces. A real ML-KEM-768 encapsulation
protects the data key. The kyber-py implementation is educational, not production-hardened; private
keys are local ignored files. This demonstrates database-leak protection, not protection against
compromise of the host and key store. Names remain visible as designed in the demo schema.

Secure session cookies are enabled after migration; use localhost in a supporting browser or HTTPS.
The acceptance client uses HTTPS explicitly. Do not weaken Secure to make a remote HTTP demo work.
Migration must currently run offline with the shop stopped. The maintenance marker rejects new
requests; full cross-process job coordination belongs to the later API merge task.

Repeat migration is a no-op. An exception rolls back all customer changes and mode together.
SQLite metadata is authoritative; state.json is an informational mirror. Keep the ignored protected
key file while using encrypted data; deleting it makes the old ciphertext unrecoverable.
After an abruptly killed migration, verify no migration process remains before removing the ignored
data/.migration.lock marker. SQLite itself rolls back an uncommitted transaction on restart.

Integrated acceptance (hashes all 3,000 rows; allow time):
`core/.venv/Scripts/python.exe core/demo-shop/check_migration.py`.
It checks failure rollback, repeat migration, ciphertext integrity, old/new login, signup, checkout and reset.
