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
are explicitly fake. No external customer data is used. IDs are plaintext at this stage; C07 adds the
small-key RSA planted issue. Protected-mode migration comes in C08.

The seed refuses to overwrite existing customer data unless --force is explicitly supplied.
data/shop_before.db is the fake reset snapshot allowed in Git. data/shop.db, session.key, seed truth
and state.json are ignored. Session secret is generated locally, never committed. Reset restores the
snapshot and before mode; restart and log in again. Mode is read per request, and unimplemented modes
fail rather than silently writing insecure data.

One acceptance run: `python core/demo-shop/check_shop.py`. It uses a temporary database under
core/.runtime, verifies signup/login/checkout and pricing, then seed determinism, counts and snapshot.
