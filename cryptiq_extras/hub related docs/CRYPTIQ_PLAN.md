# CryptIQ — Technical Documentation & Implementation Plan

> Founder's Code 2026 · Domain: Cybersecurity & Digital Safety · Team of 3 · Build window: Day 1 14:30 → Day 2 09:00
>
> **Read Sections 0–3 before writing any code.** This file is the single source of truth. Any developer
> or AI coding agent can pick up any task in Section 18 and continue. Update task status as you go.

---

## 0. TL;DR

- **Product:** CryptIQ scans a small business's code, database and server settings, shows what a hacker
  could steal (Attack Lab), fixes the problems as a reviewed pull request, and **proves** the fix with
  four live checks before the score changes. Built for India's DPDP security rules (from 13 May 2027)
  and "harvest now, decrypt later" quantum risk.
- **Demo target:** "Chennai Organics", a small online shop we ship ourselves with 3,000 fake customers.
  Score **38 → 91**, both attacks succeed before and fail after; a judge can sign up and watch their own
  test password get cracked, then protected.
- **Systems:** (1) CryptIQ web app, (2) CryptIQ API + engine, (3) Demo shop, (4) public badge page,
  (5) partner console. One repo, three processes.
- **Reuse:** the crypto-discovery / CBOM engine is **copied** (never edited in place) from the team's
  earlier Hash Patch project into `api/engine/vendor_hashpatch/`, wrapped by an adapter. Disclosed in
  `PRE_EXISTING.md`. See Section 7 and `CLAUDE_CODE_REUSE_PROMPT.md`.
- **Rule for placeholders:** anything the jury *sees happen* must really happen (scan, score, attacks,
  verify checks, PDF). Anything behind a button the jury only *sees exists* may be a placeholder
  (GitHub connect, billing, email, alerts). Section 23 lists exactly which.
- **UI rule:** one primary action per screen, at most five nav items, no button that does nothing
  without a "Coming soon" label.

---

## 1. Product in one story

**Priya** runs *Chennai Organics*, an online grocery shop with 3,000 customers. A freelancer built
the site. She has never looked at how customer data is stored.

1. She runs a **free scan** → score **38/100**, three critical problems in plain English.
2. She opens **Attack Lab** and sees her customers' names, phones and emails in a "leaked" table.
   - **Crack passwords** → a real dictionary attack reveals `priya@123` and hundreds more.
   - **Quantum attack (Shor, simulated)** → the RSA key protecting customers' ID numbers is factored
     live and the data decrypted.
3. She clicks **Fix all** → 4 fixes arrive as a pull request → **Merge**.
4. **Verify** runs four live checks: re-scan, re-attack, app still works, new data encrypted.
   Only then does the dial move **38 → 91**.
5. Both attacks are re-run and **fail**. She downloads the **evidence report**, the **CBOM**, and puts
   the **trust badge** on her site.
6. Her **CA firm** sees all 25 of its clients' scores in the **partner console**.

**Pitch closer:** *"Don't trust our score. Watch the attack fail."*

---

## 2. Disclosure & integrity rules

- `PRE_EXISTING.md` lists every file copied from the Hash Patch project, with source path and commit.
- Reused code lives only in `api/engine/vendor_hashpatch/`. Everything else is written during the event.
- Never edit, format, commit to, or run write commands in the original SIH folder.
- Demo data is fake. Never use real customer data, real keys or real passwords.
- The quantum attack is always labelled on screen: *"Simulation. No quantum computer can break
  RSA-2048 today. We factor a deliberately small demo key to show what Shor's algorithm would do."*
- Never claim "DPDP certified/compliant". Say "security-safeguard evidence".

---

## 3. Systems and views (what gets built)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 1. CryptIQ WEB APP  (React, port 5173)                                        │
│    /              Landing + pricing                                           │
│    /scan          Start a scan                                                │
│    /p/:id         Overview   ─┐                                               │
│    /p/:id/findings Findings   │  Project area (left sidebar, 5 items)         │
│    /p/:id/attack  Attack Lab  │                                               │
│    /p/:id/fix     Fix & Verify│                                               │
│    /p/:id/report  Report     ─┘                                               │
│    /partner       Partner console (CA / IT firm)                              │
│    /badge/:slug   Public trust badge page                                     │
└───────────────┬──────────────────────────────────────────────────────────────┘
                │ REST/JSON (+ polling for scan progress)
┌───────────────▼──────────────────────────────────────────────────────────────┐
│ 2. CryptIQ API + ENGINE  (FastAPI, port 8000)                                 │
│    engine/vendor_hashpatch  ← copied CBOM discovery (adapter-wrapped)          │
│    engine/rules             DPDP rules, plain-English text, severity           │
│    engine/score             score formula                                      │
│    attacks/dictionary       real dictionary attack on the shop DB              │
│    attacks/shor_sim         Pollard-rho factoring of the demo RSA key          │
│    fixes/                   patch sets, PR records, merge                      │
│    verify/                  4 live checks                                      │
│    report/                  PDF report, CycloneDX CBOM export, badge           │
└───────────────┬──────────────────────────────────────────────────────────────┘
                │ reads source files + shop.db; calls shop HTTP for tests
┌───────────────▼──────────────────────────────────────────────────────────────┐
│ 3. DEMO SHOP "Chennai Organics"  (Flask, port 5050)                           │
│    /  /signup  /login  /checkout      mode = before | after                    │
│    data/shop.db  (3,000 fake customers)                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

| User | Where they go | What they need to see |
|---|---|---|
| Business owner | Overview, Attack Lab, Report | Score, plain-English risks, proof, badge |
| Developer | Findings (Developer view), Fix & Verify | File, line, diff, merge |
| Partner (CA/IT firm) | /partner | All clients, who needs attention, bulk reports |
| "Hacker" (demo role) | Attack Lab | What leaks, what cracks |
| Public / shop customer | /badge/:slug | Last scan date, score, critical = 0 |
| Judge (live) | Demo shop /signup | Their test password cracked, then protected |

No separate logins per role. Top-right avatar menu has **View as: Owner · Developer · Partner**
(demo convenience). Owner/Developer only changes how findings are worded.

---

## 4. UI principles (non-negotiable)

1. **One primary button per screen** (filled emerald). Everything else is secondary or a link.
2. **Sidebar has exactly five items:** Overview · Findings · Attack Lab · Fix & Verify · Report.
3. **Plain English first.** Technical detail only in Developer view or behind "Show details".
4. **Every number is explained** on hover or with a one-line caption (score, counts, timings).
5. **Light, calm product UI**; only the Attack Lab terminal panel is dark.
6. **No dead buttons.** Placeholder features show a small "Pilot" or "Coming soon" tag and a toast.
7. **Every long operation shows real progress** from the backend (stages, counts, ms), never a fake spinner
   longer than the real work.
8. **Works at 1280×800 on the projector** without scrolling on Overview and Attack Lab.

---

## 5. Screen specifications

### L0 Landing `/`
- Header: CryptIQ logo · Pricing · Sign in (placeholder) · **Free scan** (primary).
- Hero: *"See how hackers would break your customers' data — then lock it for good."*
- Sub: *"Built for India's DPDP security rules. Your code never leaves your machine."*
- Countdown chip: *"DPDP security rules apply in N days"* (to 13 May 2027, computed).
- Three steps row: **Scan → Attack → Fix → Prove** (4 icons, one line each).
- Pricing: 4 cards (Free ₹0 · Starter ₹999/mo · Business ₹2,999/mo · Partner ₹500/client/mo). Business card highlighted.
- Footer note: *"Security scan and evidence — not a legal certification."*

### S1 Start a scan `/scan`
- Three tiles; **Scan the demo shop** is primary and pre-selected.
  - *Scan demo shop (Chennai Organics)* — real.
  - *Upload a ZIP* — real for small zips (≤ 20 MB) using the same engine; results may be partial.
  - *Connect GitHub* — "Pilot" tag, placeholder.
- On start: progress card with **real stages from the API**:
  `Reading files (214) → Finding crypto (CBOM) → Finding personal data → Checking settings → Scoring`.
  Each stage ticks green with its count. Then auto-navigate to Overview.

### O1 Overview `/p/:id`
- Left: **Score dial** (0–100, red <50, amber 50–79, green ≥80), animated on load. Caption:
  *"100 − 15×critical − 7×high − 3×medium − 1×low"* with "How is this calculated?" popover.
- Right: four severity chips (Critical 3 · High 2 · Medium 0 · Low 3).
- **Data map** (cards): Phone numbers · Emails · Passwords · Addresses · ID numbers · Payment key.
  Each card: where stored (`customers.phone`), protection (`Plain text` red / `Weak hash` red /
  `RSA – quantum-vulnerable` amber / `Encrypted (AES-256 + ML-KEM)` green).
- Banner (owner language): *"A data leak today would expose 3,000 customers' phone numbers and
  ~X% of their passwords."* (X from last dictionary attack run, or "unknown — run Attack Lab").
- Primary button: **See how a hacker would attack this →** (goes to Attack Lab).

### F1 Findings `/p/:id/findings`
- Toggle (top right): **Owner view | Developer view**.
- List of cards sorted by severity. Owner card: title, one-sentence "why it matters", DPDP tag,
  status pill (Open / Fixed / Needs manual step).
- Developer card adds: `file:line`, code snippet (3 lines), rule ID, CBOM asset link, confidence.
- Click → right drawer: details, "How to fix", fix preview diff (if auto-fixable), link to Fix & Verify.
- Filter chips: All · Critical · High · Auto-fixable. No other filters.

### A1 Attack Lab `/p/:id/attack` (the "hacker view")
Layout: two columns.

- **Left: "Leaked database"** — table of 8 rows sampled from `shop.db` (name, phone, email,
  password hash, ID number field). Above it: *"This is what an attacker gets if your database leaks."*
  Toggle *Show masked* (owner-safe) / *Show raw* (default raw for demo, all data fake).
  The newest sign-up (e.g. the judge's) is pinned to the top and highlighted.
- **Right: dark terminal panel** with two big buttons:
  - **Crack passwords** (dictionary attack — real)
  - **Quantum attack · Shor's algorithm (simulated)**
- Terminal streams real progress lines (polled every 300 ms), e.g.
  `> loaded 3,000 hashes (MD5)` · `> trying 10,000 common passwords…` · `> cracked 1,412 / 3,000 in 2.4 s`
  then rows in the left table flip to show revealed passwords in red.
  Shor: `> found RSA public key (demo key, 64-bit — stands in for RSA-2048)` ·
  `> Shor's algorithm (simulated with Pollard-rho)…` · `> factored n = p × q in 0.8 s` ·
  `> private key rebuilt · decrypting ID numbers…` → ID column decrypts in red.
- After fix, the same buttons produce: `> 0 / 3,000 cracked within 60 s budget (Argon2id, ~50 ms per guess)`
  and `> no RSA/ECC key found · data protected by ML-KEM-768 + AES-256-GCM · Shor not applicable`.
- Fixed footer: simulation disclaimer (Section 2). Small link: *"Invite someone to sign up on the
  demo shop"* → shows QR + URL of demo shop `/signup`.
- Primary button (after attacks shown): **Fix these problems →**

### X1 Fix & Verify `/p/:id/fix`
Three stacked steps on one page (stepper at top: Review → Merge → Verify).

1. **Review:** *"4 automatic fixes ready · 6 files changed"* + list of fixes with checkboxes (all ticked).
   GitHub-style diff viewer (file tabs, red/green lines). Note: *"3 issues need a manual step"* (listed).
2. **Merge:** primary button **Merge fixes** → API applies patch set to the demo shop (switches to
   `after` mode and runs data migration). Shows commit-style summary.
3. **Verify:** four rows animate in sequence, each with real result text:
   | Check | Pass text |
   |---|---|
   | Re-scan | "Critical issues 3 → 0 · High 2 → 1" |
   | Re-attack | "0 / 3,000 passwords cracked · Shor not applicable" |
   | App still works | "Login ✓ · Checkout ✓ (automated test)" |
   | New data protected | "New sign-up stored encrypted ✓" |
   When all four pass → dial animates **38 → 91** and confetti-free success card:
   *"Verified. 4 of 4 checks passed."* Primary button: **Re-run the attacks** (→ Attack Lab).
   If any check fails → red row with reason, score does not change, "Retry" button.

### R1 Report `/p/:id/report`
- Report preview card (first page thumbnail).
- Buttons: **Download evidence report (PDF)** (primary) · Download CBOM (CycloneDX JSON) · Copy badge code.
- "Verify it yourself" box: three copyable commands with expected output
  (`sqlite3 shop.db "select phone from customers limit 3"` → ciphertext; `grep -rn md5 src/` → nothing;
  `python verify_login.py` → OK).
- Badge preview + QR to public page.

### B1 Public badge `/badge/:slug`
- Shop name, "Data security scan by CryptIQ", last scanned date/time, score, critical issues 0,
  checks passed 4/4, disclaimer *"Security scan, not a legal certification."* No login.

### P1 Partner console `/partner`
- Header: *"Iyer & Associates, Chartered Accountants · 25 clients"* (seeded, fake).
- KPI row: Average score · Clients ready (≥80) · At risk (<50) · Not scanned in 30 days.
- Table: Client · Industry · Score (mini dial) · Change · Last scan · Status. Chennai Organics row is
  live (reflects the real demo project).
- Right panel *"Needs attention"* (top 5).
- Buttons: **Download all reports** (primary, zips seeded PDFs) · Send scan link (placeholder) ·
  White-label logo upload (placeholder).

### D Demo shop (separate app, port 5050)
- Minimal green grocery storefront: header "Chennai Organics", 6 product cards, cart.
- `/signup` (name, phone, email, password, optional ID number) → stores using current mode.
- `/login` → checks password using current mode.
- `/checkout` → fake order success page.
- Top strip: *"Demo store · all data is fake"*.

---

## 6. Demo shop specification

### 6.1 Data
- `data/shop.db` (SQLite) table `customers(id, name, phone, email, password_hash, id_number, address, created_at)`.
- 3,000 rows generated with Indian-style fake names (Faker `en_IN`), phones `9xxxxxxxxx`, emails.
- Passwords drawn so ~45% come from a common-password list (e.g. `name@123`, `chennai123`, `password1`)
  so the dictionary attack has a believable hit rate. Store **only hashes**; keep the plaintext list
  in `data/_seed_truth.json` (git-ignored, for tests only).
- Seed customer **Priya S** with password `priya@123`.

### 6.2 Planted issues (BEFORE mode) and expected engine output

| # | Problem (owner wording) | Where | Severity | Auto-fix | After |
|---|---|---|---|---|---|
| 1 | Passwords use a lock anyone can open (MD5) | `auth.py` hash function | Critical | Yes → Argon2id wrap | Fixed |
| 2 | Phone, email and address stored as plain text | `models.py`, `customers` table | Critical | Yes → AES-256-GCM field encryption, key wrapped by ML-KEM-768 | Fixed |
| 3 | Payment API key written into the code | `config.py` `PAYMENT_KEY="rzp_live_demo…"` | Critical | Yes → environment variable / secrets file | Fixed |
| 4 | Customer ID numbers protected by RSA (breakable by future quantum computers) | `crypto_utils.py`, `id_number` column | High | Yes → ML-KEM-768 + AES-256-GCM | Fixed |
| 5 | Access to personal data is not logged | app-wide | High | No (hosting step) | Remains |
| 6 | Session cookie missing Secure flag | `app.py` config | Low | Yes | Fixed |
| 7 | No data-retention policy documented | repo | Low | No (manual) | Remains |
| 8 | No security contact (`security.txt`) | static | Low | No (manual) | Remains |

**Score check** (formula Section 10): before = 100 − (3×15 + 2×7 + 3×1) = **38**;
after = 100 − (0 + 1×7 + 2×1) = **91**. ✔

### 6.3 Modes
- `MODE` stored in `demo-shop/state.json` (`"before"` | `"after"`). Read on every request.
- `before`: MD5 hashes, plaintext PII, RSA (demo 64-bit modulus, labelled) for `id_number`.
- `after`: `argon2id(md5(pw))` for existing users (hash-wrapping, a real migration technique), plain
  `argon2id(pw)` for new users; PII via AES-256-GCM with a data key encapsulated by ML-KEM-768;
  `id_number` re-encrypted the same way.
- `migrate_to_after.py`: decrypts RSA fields with the old key, re-encrypts everything, wraps MD5 hashes.
  Runs in < 10 s for 3,000 rows (Argon2 params tuned: `time_cost=2, memory_cost=19456 KiB` ≈ 20–50 ms).
- `reset.py`: restores `before` DB from `data/shop_before.db` snapshot and sets mode `before`.
- Source files for scanning: `demo-shop/src_before/` and `demo-shop/src_after/`; the engine scans the
  folder for the current mode. Merge = mode switch + migration (the diff shown is the real diff
  between the two folders).

---

## 7. Backend design & reuse of Hash Patch

### 7.1 Modules
```
api/
  main.py              FastAPI app, CORS, routers
  config.py            paths, ports, demo flags
  store.py             SQLite (cryptiq.db): projects, scans, attacks, prs, verifications, partners
  engine/
    vendor_hashpatch/  COPIED code (read-only in spirit; adapt only via adapter)
    adapter.py         run_discovery(path) -> List[Asset], List[RawFinding]
    pii.py             personal-data detector (column names, regex on schema/models)
    settings.py        config checks (cookie flags, debug, TLS config, secrets in code)
    rules.yaml         rule_id -> severity, owner_text, dev_text, dpdp_safeguard, fix_id
    score.py           score + counts
    cbom.py            CycloneDX 1.6 CBOM export (reuse vendor output if it already emits it)
  attacks/
    dictionary.py      real attack, streams progress
    shor_sim.py        Pollard-rho factoring + RSA decrypt, streams progress
  fixes/
    patchsets/         one folder per fix_id: description + files (from src_after)
    pr.py              build PR record (unified diff between src_before and src_after per fix)
    merge.py           call demo-shop migrate + set mode
  verify/
    checks.py          rescan, reattack, app_works (HTTP), new_data_protected
  report/
    pdf.py             ReportLab evidence report
    badge.py           badge SVG + public data
  seed/
    partner_clients.json  25 fake clients
```

### 7.2 Adapter contract (the only bridge to reused code)
```python
def run_discovery(root: Path) -> tuple[list[Asset], list[RawFinding]]:
    """Call vendor_hashpatch to walk `root` and return crypto assets (CBOM components)
    and raw crypto findings. Translate vendor types into CryptIQ types here; nothing else
    in CryptIQ imports vendor_hashpatch directly."""
```
- If the vendor engine already detects MD5/SHA1, RSA/ECC key sizes, weak TLS, hard-coded keys and
  emits CycloneDX — use it as-is via the adapter.
- Gaps to add in CryptIQ (new code): `pii.py`, `settings.py` (cookie/debug), DPDP mapping in
  `rules.yaml`, owner-language text, score.
- If the vendor engine is too heavy/slow or fails on the demo shop, fall back to `engine/simple_rules.py`
  (regex rules for the 8 planted issues). The demo must not depend on one code path.

---

## 8. Data contracts (frontend builds against these from hour 1 using mock JSON)

```jsonc
// Asset (CBOM component)
{ "id":"a1", "type":"algorithm|key|certificate|library|protocol", "name":"MD5",
  "details":{"keySize":null,"mode":null}, "quantumVulnerable":false,
  "locations":[{"file":"src/auth.py","line":12}] }

// Finding
{ "id":"f1", "ruleId":"WEAK_PASSWORD_HASH", "severity":"critical|high|medium|low",
  "titleOwner":"Passwords use a lock anyone can open",
  "whyOwner":"If your database leaks, common passwords can be looked up instantly.",
  "titleDev":"MD5 used for password hashing", "file":"src/auth.py", "line":12,
  "snippet":"return hashlib.md5(pw.encode()).hexdigest()", "dpdpSafeguard":"Encryption / hashing",
  "fixId":"fix_argon2", "autoFixable":true, "status":"open|fixed|manual", "confidence":0.95,
  "assetIds":["a1"] }

// DataMapItem
{ "dataType":"phone|email|password|address|id_number|payment_key", "store":"customers.phone",
  "protection":"plaintext|weak_hash|strong_hash|rsa_quantum_vulnerable|pqc_encrypted|secret_in_code|env_secret",
  "status":"risk|warning|ok" }

// Scan
{ "id":"s1", "projectId":"p1", "mode":"before|after", "status":"running|done|error",
  "stages":[{"key":"files","label":"Reading files","done":true,"count":214}],
  "score":38, "counts":{"critical":3,"high":2,"medium":0,"low":3},
  "findings":[/*Finding*/], "assets":[/*Asset*/], "dataMap":[/*DataMapItem*/], "finishedAt":"..." }

// AttackRun (polled)
{ "id":"r1", "kind":"dictionary|shor_sim", "status":"running|done",
  "lines":["> loaded 3,000 hashes (MD5)", "..."], "tried":10000, "cracked":1412, "total":3000,
  "revealed":[{"customerId":1,"field":"password","value":"priya@123"}],
  "verdict":"cracked|protected|not_applicable", "durationMs":2400 }

// PullRequest
{ "id":"pr1", "title":"CryptIQ: 4 security fixes", "fixes":["fix_argon2","fix_field_enc","fix_secret_env","fix_cookie"],
  "files":[{"path":"src/auth.py","diff":"@@ -10,3 +10,6 @@ ..."}], "manual":["WEAK_ACCESS_LOGGING","NO_RETENTION_POLICY","NO_SECURITY_TXT"],
  "status":"open|merged" }

// Verification
{ "id":"v1", "status":"running|passed|failed",
  "checks":[{"key":"rescan","label":"Re-scan","status":"pass|fail|running","detail":"Critical 3 → 0"}],
  "scoreBefore":38, "scoreAfter":91 }
```

---

## 9. API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | ok, versions, shop mode |
| POST | `/api/projects` | create (demo project auto-created on startup: `p_demo`) |
| GET | `/api/projects/{id}` | project + latest scan summary |
| POST | `/api/projects/{id}/scans` | body `{source:"demo"|"zip"}` (+ multipart zip) → `{scanId}` |
| GET | `/api/scans/{id}` | Scan (poll every 400 ms while running) |
| GET | `/api/scans/{id}/cbom` | CycloneDX JSON download |
| GET | `/api/projects/{id}/leak-preview?limit=8` | rows for Attack Lab table (newest first) |
| POST | `/api/projects/{id}/attacks` | body `{kind:"dictionary"|"shor_sim"}` → `{runId}` |
| GET | `/api/attacks/{runId}` | AttackRun (poll 300 ms) |
| POST | `/api/projects/{id}/pull-requests` | create PR from all auto-fixable findings |
| GET | `/api/pull-requests/{id}` | PR with diffs |
| POST | `/api/pull-requests/{id}/merge` | migrate shop, set mode after → `{verificationId}` |
| GET | `/api/verifications/{id}` | Verification (poll) |
| GET | `/api/projects/{id}/report.pdf` | evidence report |
| GET | `/api/badge/{slug}` | public badge data |
| GET | `/api/partner` | partner + 25 clients (Chennai Organics live) |
| POST | `/api/demo/reset` | reset shop to before, clear runs/scans, re-create `p_demo` |

Background work (scan, attack, verify) runs in a thread; status written to `cryptiq.db`; frontend polls.

---

## 10. Scoring

```
score = max(0, 100 − (15 × critical + 7 × high + 3 × medium + 1 × low))
```
Only `status == open` and `manual` findings count. Shown on screen with its formula.
(Proposal shows the formula without the low term; low issues are weight 1 — mention if asked.)

---

## 11. Attack Lab logic

### 11.1 Dictionary attack (real)
- Wordlist: `attacks/wordlists/common_10k.txt` (top common passwords + Indian patterns like
  `name@123`, `<city>123`, `<name><year>`). Generated/curated by us; no leaked datasets.
- BEFORE: for each candidate compute MD5 once → set lookup against all 3,000 hashes (fast, < 3 s).
- AFTER: hashes are Argon2id; attack tries candidates for each user under a **60 s budget**;
  ~20–50 ms per guess → reports `0 cracked` and the projected time for the full list
  (`3,000 users × 10,000 guesses × 30 ms ≈ 10 days`). This is real, not a scripted message.
- Judge's new sign-up appears in the table; if their password is in the list it is revealed.
  Tell judges to use a simple **test** password like `chennai123`.

### 11.2 Shor's algorithm (simulated, honest)
- BEFORE: `id_number` encrypted with RSA using a **demo 64-bit modulus** (key file in demo shop).
- Engine finds the RSA public key via CBOM (asset type `key`, algorithm RSA, size 64, quantumVulnerable).
- `shor_sim.py`: Pollard-rho factors `n` (< 1 s), rebuilds `d`, decrypts the ID numbers in the
  preview rows; terminal lines explain each step and that Shor would do this for RSA-2048 on a
  large fault-tolerant quantum computer.
- AFTER: no RSA/ECC key in CBOM for stored data → `verdict:"not_applicable"`:
  *"Data is protected by ML-KEM-768 (lattice-based, NIST FIPS 203) + AES-256-GCM. Shor's algorithm
  attacks factoring and discrete logs; it does not apply here."*
- Library: try `kyber-py` / `pqcrypto` / `liboqs-python` (whichever installs cleanly) for ML-KEM.
  **Placeholder allowed:** if none installs in 30 min, use X25519 + AES-GCM for encryption and label
  ML-KEM as "planned"; the Shor verdict text still holds for the CBOM (no RSA). Prefer the real lib.

---

## 12. Fix → Pull request → Verify

- **Fix catalogue** (`fixes/patchsets/`): `fix_argon2`, `fix_field_enc` (covers #2 and #4),
  `fix_secret_env`, `fix_cookie`. Each = description + list of files.
- **PR creation:** unified diffs computed live between `src_before/` and `src_after/` for the files in
  the selected fixes (Python `difflib`). Real diffs, prepared target code.
- **Merge:** run `demo-shop/migrate_to_after.py`, set mode `after`, start verification.
- **Verify checks** (`verify/checks.py`), run in order, each real:
  1. `rescan` — run full scan on `src_after/` + live DB → expect critical 0.
  2. `reattack` — run both attacks (dictionary with 15 s budget for verify) → expect 0 cracked + not_applicable.
  3. `app_works` — HTTP: login as Priya with `priya@123` → 200; checkout → 200.
  4. `new_data_protected` — create user `verify_<ts>` via `/signup`, read DB row, assert phone/email
     not plaintext and hash starts with `$argon2id$`.
- Score updates only when all four pass.
- **Wording for accuracy:** *"Fixes arrive as a pull request your developer reviews. A fix is marked done
  only after re-scan, re-attack and app tests pass."* Never promise 100%.

---

## 13. Report, CBOM, badge

- **Evidence report PDF (2–3 pages):** cover (shop, date, score before/after, 4/4 checks), data map
  table, findings with status and DPDP safeguard, fixes applied (commit summary), attack results
  before/after, manual steps remaining, CBOM summary (algorithms, keys, quantum-vulnerable count),
  disclaimer. Font with ₹ glyph.
- **CBOM:** CycloneDX 1.6 JSON (`bomFormat`, `specVersion`, `components` with `cryptoProperties`).
  Reuse vendor output if it already produces it.
- **Badge:** SVG "CryptIQ · Scanned 14 Oct 2026 · 91/100" + link/QR to `/badge/chennai-organics`.

---

## 14. Design system

- **Colours:** ink `#0B2530`, emerald `#059669` (primary), emerald-50 `#E7F7F0`, danger `#B42318`,
  amber `#B54708`, ok `#067647`, slate neutrals. Attack terminal bg `#0B1220`, text `#D1FAE5`,
  red reveals `#F87171`.
- **Type:** Inter (UI), JetBrains Mono (code, terminal, hashes).
- **Components:** shadcn/ui (Button, Card, Badge, Tabs, Sheet/Drawer, Table, Tooltip, Toast, Progress),
  lucide-react icons, Framer Motion (dial, row flips, check rows), react-diff-viewer (or a simple custom
  diff renderer) for PR view.
- **Spacing:** 8px grid; cards radius 12; page max width 1200; sidebar 220px.
- **Motion:** dial sweep 1.2 s ease-out; terminal lines 60–120 ms apart (paced to real progress);
  table row flip 250 ms; success card fade 300 ms. Respect reduced-motion.
- **Tone:** sentence case, short, no exclamation marks, numbers with units.

---

## 15. Repository layout

```
cryptiq/                         ← NEW folder & repo (never inside the SIH folder)
├── CRYPTIQ_PLAN.md              this file
├── PRE_EXISTING.md              list of reused files (generated by reuse step)
├── REUSE_REPORT.md              inventory of the Hash Patch project (generated)
├── README.md                    run steps, demo steps
├── api/                         FastAPI + engine (Section 7)
├── web/                         React + Vite + TS + Tailwind + shadcn
│   └── src/{pages,components,lib,mocks}
├── demo-shop/
│   ├── app.py  state.json  migrate_to_after.py  reset.py  seed.py
│   ├── src_before/  src_after/
│   └── data/{shop.db, shop_before.db, demo_rsa_key.json}
├── pitch/{deck_outline.md, demo_script.md, qna.md}
└── scripts/{dev.sh, reset_demo.sh}
```
`scripts/dev.sh` starts all three processes. `scripts/reset_demo.sh` → `POST /api/demo/reset`.

---

## 16. Team split (3 people)

Work is split by **system**, joined by the **contracts in Section 8**. Frontend never waits for backend:
it uses `web/src/mocks/*.json` until the real endpoint is ready, behind one flag `VITE_USE_MOCKS`.

| | **Member A — Engine & API lead** (Shriram) | **Member B — Product UI** | **Member C — Demo shop, content & pitch** |
|---|---|---|---|
| Owns | `api/` (engine adapter, rules, score, attacks, fixes, verify, report) | `web/` (all screens, design system, animations) | `demo-shop/`, rule wording, seed data, partner clients, deck, demo script, Q&A, testing |
| First 2 hours | Run reuse prompt → adapter → scan of demo shop returns findings JSON | Scaffold, design system, layout + sidebar, Landing, Overview on mocks | Demo shop app (before mode) + seed 3,000 customers + planted issues |
| Next | Attacks (dictionary → Shor sim), PR diff, merge, verify | Attack Lab terminal, Findings, Fix & Verify stepper | `src_after`, migration script, owner-language text for all rules |
| Night | PDF report, CBOM export, badge, partner API, hardening | Report page, badge page, partner console, polish | Deck, demo script, rehearsal, backup video, end-to-end tests |
| Hand-offs | Publishes each endpoint + sample response in `api/README.md` | Switches each screen from mock to live | Gives A the planted-issue table (6.2) and B the copy text |

If Member C is not comfortable with code: B builds the shop's 4 HTML pages; C owns data generation
(Faker script is short), copy, partner seed, pitch and testing. A owns `migrate_to_after.py`.

**Integration points (fixed times):** 18:30 (scan live in UI), 23:30 (attacks + fix live), 05:30
(everything live, feature freeze 08:00).

---

## 17. Timeline (from Day 1, 14:30)

| Time | A — Engine/API | B — UI | C — Shop/content/pitch | Checkpoint |
|---|---|---|---|---|
| 14:30–16:30 | Reuse prompt, copy engine, adapter, `/scans` on demo shop | Scaffold, theme, layout, Landing, mocks | Shop before mode, seed DB, planted issues | — |
| 16:30–18:30 | Rules.yaml, PII + settings checks, score, CBOM export | Scan progress, Overview (dial, data map) | Owner/dev wording for 8 rules, partner seed | **18:30 integrate: real scan in UI** |
| 18:30–19:00 | Buffer | Buffer | Prep for challenge | — |
| **19:00** | | | | **Challenge 1** |
| 19:00–23:30 | Dictionary attack, Shor sim, leak preview, polling | Attack Lab, Findings + drawer | `src_after`, migration, `reset.py`, test passwords | **23:30 integrate: attacks live** |
| **00:00** | | | | **Challenge 2** |
| 00:00–03:30 | PR diffs, merge, 4 verify checks | Fix & Verify stepper, dial 38→91 | Deck draft, demo script | — |
| 03:30–05:30 | PDF report, badge, partner API, reset endpoint | Report, badge, partner console | End-to-end test runs, bug list | **05:30 all live** |
| **06:00** | | | | **Challenge 3** |
| 06:00–08:00 | Fixes only | Polish, 1280×800 check | Rehearse, record backup video | **08:00 feature freeze** |
| 08:00–09:00 | Demo machine prep | Demo machine prep | Final rehearsal ×3 | **09:00 final evaluation** |
| 10:00–11:00 | Submission | | | Submit repo, deck, video |

Sleep: rotate 2-hour blocks between 00:00–06:00 so one person is always awake on integration.

---

## 18. Task board

Status: ☐ todo · ◐ doing · ☑ done. Owner in brackets. AC = acceptance criteria.

**Setup**

- ☐ T01 [A] Create `cryptiq/` repo, layout (Section 15), `.gitignore`, `dev.sh`. AC: three processes start.
- ☐ T02 [A] Run `CLAUDE_CODE_REUSE_PROMPT.md`; `REUSE_REPORT.md` + `PRE_EXISTING.md` committed; source folder unchanged (checksums match).
- ☐ T03 [B] Web scaffold: Vite+React+TS+Tailwind+shadcn, fonts, colours, layout with sidebar. AC: all routes render.
- ☐ T04 [B] Mock JSON for Scan, AttackRun, PR, Verification, Partner (Section 8). AC: every screen renders on mocks.

**Demo shop**

- ☐ T05 [C] Flask shop: `/`, `/signup`, `/login`, `/checkout`, demo strip. AC: sign-up + login work in before mode.
- ☐ T06 [C] `seed.py`: 3,000 customers, ~45% common passwords, Priya `priya@123`; snapshot `shop_before.db`.
- ☐ T07 [C] Plant issues 1–8 in `src_before/` (Section 6.2). AC: engine (or simple_rules) finds all 8.
- ☐ T08 [C/A] `src_after/` + `migrate_to_after.py` + `reset.py`. AC: after migration, Priya still logs in; phones are ciphertext.

**Engine & API**

- ☐ T09 [A] `adapter.py` over vendor engine; fallback `simple_rules.py`. AC: demo shop scan returns assets + raw findings.
- ☐ T10 [A] `pii.py`, `settings.py`, `rules.yaml`, `score.py`. AC: before = 38, after = 91.
- ☐ T11 [A] Scan endpoints with stages + polling. AC: UI shows real stage counts.
- ☐ T12 [A] CycloneDX CBOM export. AC: valid JSON with crypto components.
- ☐ T13 [A] Leak preview endpoint. AC: newest sign-up first.
- ☐ T14 [A] Dictionary attack (before + after behaviour). AC: Priya cracked before; 0 cracked after within budget.
- ☐ T15 [A] Shor sim (Pollard-rho on demo key) + not-applicable path. AC: ID numbers decrypted before; verdict not_applicable after.
- ☐ T16 [A] PR creation (difflib) + merge (migration + mode). AC: diff matches folders.
- ☐ T17 [A] Verify checks 1–4. AC: all pass after merge; any failure blocks score change.
- ☐ T18 [A] Evidence PDF + badge endpoint + partner endpoint + demo reset.

**Web app**

- ☐ T19 [B] Landing + pricing + countdown.
- ☐ T20 [B] Start scan + live stage progress.
- ☐ T21 [B] Overview: dial, severity chips, data map, banner, primary CTA.
- ☐ T22 [B] Findings list, Owner/Developer toggle, drawer.
- ☐ T23 [B] Attack Lab: leaked table, terminal stream, row flip reveals, QR to shop signup, disclaimer.
- ☐ T24 [B] Fix & Verify: fixes list, diff viewer, merge, 4 animated checks, dial 38→91.
- ☐ T25 [B] Report page, badge page, verify-it-yourself box.
- ☐ T26 [B] Partner console.
- ☐ T27 [B] "View as" menu, toasts for placeholders, 1280×800 polish.

**Content, pitch, QA**

- ☐ T28 [C] Owner + developer wording for all rules (into `rules.yaml`).
- ☐ T29 [C] 25 partner clients seed (fake names, industries, scores).
- ☐ T30 [C] Deck (Section 20) + Q&A sheet.
- ☐ T31 [C] Run Section 21 checklist twice; log bugs.
- ☐ T32 [C] Backup demo video (90 s).
- ☐ T33 [All] Submission: repo, deck, video, proposal.

---

## 19. Surprise-challenge playbook

| Likely challenge | Fast answer (≤ 2 h) | Owner |
|---|---|---|
| Regional language | Tamil toggle for Overview, Findings (owner text) and badge | B + C |
| Privacy / data minimisation | "Findings only" toggle: show the scan uploads no code; masked leak view default | A + B |
| Explainability for non-tech | "Explain like I'm a shop owner" tooltip on each finding; owner view default | C |
| Scale / many clients | Partner console bulk scan simulation + CSV export | B |
| Offline | Scan + report fully offline; show with Wi-Fi off | A |
| Different stack (Node/Java) | Add 3 regex rules for Node/Java MD5 & hard-coded keys; scan a tiny sample | A |
| Business twist (pricing, competitor) | C updates deck; B adds pricing/compare row | C |
| Security of CryptIQ itself | Rate-limit attacks, attacks only on own project, audit log of attack runs | A |

---

## 20. Pitch (3 minutes) and deck

| Time | Who | Say | Show |
|---|---|---|---|
| 0:00–0:25 | C | "Priya runs an online shop with 3,000 customers. Ask her how their data is stored — she has no idea. By May 2027 the DPDP rules require it to be protected." | Slide 1 |
| 0:25–0:50 | C | "81% of organisations aren't ready. Manual audits cost ₹1–10 lakh. And data encrypted today can be stolen now and decrypted by quantum computers later." | Slide 2 |
| 0:50–2:10 | A | Live: scan → 38 → Attack Lab (judge's password cracked, Shor sim) → Fix all → merge → 4 checks → 91 → attacks fail | App |
| 2:10–2:40 | C | "Free scan, ₹999 and ₹2,999 plans, ₹500 per client for CA firms who resell us. CAs are our channel to lakhs of MSMEs." | Slides 5–6 + partner console |
| 2:40–3:00 | A | "Don't trust our score. Watch the attack fail." | Closing slide |

Deck (7 slides): Hook · Problem numbers · Solution loop (Scan → Attack → Fix → Prove) · Live demo ·
Business model · Go-to-market + competition (consent tools vs CryptIQ) · Close + roadmap.

**Q&A prep**

| Q | A |
|---|---|
| Is the quantum attack real? | Simulated on a deliberately small key and labelled. Shor would need a large fault-tolerant quantum computer for RSA-2048. The risk today is "harvest now, decrypt later". |
| Are fixes always correct? | They arrive as a reviewed PR and are marked done only after re-scan, re-attack and app tests pass. |
| Why not just use existing DPDP tools? | They handle consent and notices. We check whether the code actually protects the data and prove it. |
| Does our code leave our machine? | The scanner can run offline; only findings are uploaded. |
| Did you build this here? | Web app, demo shop, rules, attacks, verify and reports were built here; the crypto-discovery engine was adapted from our earlier research and is disclosed in PRE_EXISTING.md. |
| Isn't an attack tool dangerous? | It only runs on the user's own scanned project or our demo data; no external targets. |

---

## 21. Pre-demo checklist (run at 05:30 and 08:30)

- ☐ `scripts/reset_demo.sh` → shop mode before, score 38 on fresh scan.
- ☐ Scan shows real stage counts; 8 findings; data map red for phone/email/password.
- ☐ Sign up a test user `judge` / `chennai123` → appears top of leaked table.
- ☐ Crack passwords → Priya and judge revealed; count ~1,300–1,500 / 3,000; < 5 s.
- ☐ Shor sim → ID numbers decrypted; disclaimer visible.
- ☐ Fix & Verify → diff shows 6 files; merge < 15 s; 4 checks pass; dial 38 → 91.
- ☐ Re-run both attacks → 0 cracked; not applicable.
- ☐ New sign-up after fix → stored encrypted (check DB).
- ☐ PDF downloads, ₹ renders; CBOM JSON downloads; badge page loads; partner console shows Chennai Organics at 91.
- ☐ Wi-Fi off → whole flow still works (everything local).
- ☐ Projector 1280×800: no scroll on Overview and Attack Lab.
- ☐ Backup video plays.

---

## 22. Risks

| Risk | Mitigation |
|---|---|
| Vendor engine doesn't run on the demo shop | `simple_rules.py` fallback covering the 8 planted issues |
| ML-KEM library won't install | Try 3 libs; else label "planned", keep CBOM verdict honest |
| Argon2 migration slow | Tune params; pre-run migration timing; cap at 10 s |
| Attack run blocks API | Run in thread; poll status |
| Demo state drift | One-click reset; reset before every jury visit |
| Judge uses a real password | Ask for a test password; show "use a test password" hint on signup |
| Over-claiming | Disclaimers in UI and pitch; "estimates" on pricing; "evidence not certification" |
| Reuse disclosure questioned | PRE_EXISTING.md + REUSE_REPORT.md in repo; say it upfront |

---

## 23. Placeholder policy

| Feature | Real or placeholder |
|---|---|
| Scan of demo shop, score, findings, data map, CBOM | **Real** |
| ZIP upload scan | Real (best effort) |
| Dictionary attack, Shor sim, leak preview | **Real** |
| PR diff, merge, migration, 4 verify checks | **Real** |
| Evidence PDF, badge page | **Real** |
| Partner console | Real UI on seeded data; Chennai Organics row live |
| GitHub connect, sign-in, billing, email scan link, white-label upload, CI guard, weekly alerts | Placeholder with "Pilot" tag + toast |

If a judge asks about a placeholder, say so plainly: *"That's on our pilot roadmap; this screen shows
the intended flow."*

---

## 24. Conventions for AI agents

- Read Sections 0–3, then pick the lowest unfinished task for your owner letter in Section 18.
- Never import `vendor_hashpatch` outside `engine/adapter.py`.
- Never modify anything outside the `cryptiq/` folder.
- Keep contracts (Section 8) stable; if you must change one, update mocks and this file in the same commit.
- Every long job: thread + status record + polling endpoint.
- After a task: run its AC, tick it here, commit (`feat(attack): dictionary attack with progress`).
