# CryptIQ

CryptIQ shows a small business **what a hacker could steal from it**, fixes the problems, and **proves**
the fix — before India's DPDP security rules apply (13 May 2027) and before "harvest now, decrypt later"
quantum attacks matter.

## The loop: Scan → Attack → Fix → Prove

| Step | What happens |
|---|---|
| **Scan** | Finds weak crypto and unprotected personal data in the business's own code and database; 0–100 score; plain-English findings; CycloneDX CBOM. |
| **Attack** | Attack Lab: a real dictionary attack cracks weak password hashes; a *simulated* Shor's algorithm factors a small demo RSA key and decrypts customer data. |
| **Fix** | Fixes arrive as a pull request the developer reviews. |
| **Prove** | The score changes only after 4 live checks pass (re-scan, re-attack, app still works, new data encrypted). Owner gets an evidence report and a public trust badge. |

## Repo map (who owns what)

| Path | Owner | Notes |
|---|---|---|
| `core/api/` | Core team | FastAPI: engine adapter, scoring, Attack Lab, fixes, verify checks, public summary endpoints |
| `core/web/` | Core team | React app: Scan, Overview, Findings, Attack Lab, Fix & Verify, Report |
| `core/demo-shop/` | Core team | Chennai Organics demo shop (Flask), before/after modes |
| `hub/` | Hub developer | Landing, pricing, sign-up/checkout, partner console, public badge |
| `shared/` | Core team | Theme (`shared/theme/`) and contracts (`shared/contracts/`). **Read-only for Hub** |
| `docs/` | Core team | All plans. **Read-only for Hub** |

Hub needs a change in `shared/` or `docs/`? Add a line to `hub/REQUESTS.md`.

## Ports

| App | Dev URL | Env var used by the other app |
|---|---|---|
| Core web | http://localhost:5173 | `VITE_CORE_WEB_URL` |
| Core API | http://localhost:8000 | `VITE_CORE_API_URL` |
| Demo shop | http://localhost:5050 | — |
| Hub web | http://localhost:5174 | `VITE_HUB_WEB_URL` |

## How to run

### Core API (`core/api`)
_TODO: setup and run commands._

### Core web (`core/web`)
_TODO: setup and run commands._

### Demo shop (`core/demo-shop`)
_TODO: setup and run commands._

### Hub web (`hub`)
_TODO: setup and run commands._

## Git rules

Everyone works on the same branch: `main`.

### Core team
- Stage only `core/`, `shared/`, `docs/` or root files you intend to change.
- Never edit `hub/`. If Hub breaks the build, tell them; don't fix their files.
- Commit prefixes: `core:`, `shared:`, `docs:`.
- Changing `shared/` after 18:30 requires telling the Hub developer first.

### Hub developer
1. Before starting each session: `git pull --rebase origin main`.
2. Stage **only your folder**: `git add hub/` — never `git add .` or `git add -A`.
3. Commit messages start with `hub:` e.g. `hub: partner console table`.
4. Before every push: `git pull --rebase origin main`, then `git push origin main`.
5. **Never** `git push --force`, `git reset --hard` on shared history, rebase others' commits, or
   delete branches.
6. If a rebase conflict touches a file outside `hub/`, stop — do not resolve it; tell the Core team.
7. Never commit: `.env`, keys, `node_modules/`, `dist/`, real personal data.
8. Commit small and often (every 30–60 min).

## Docs
- `docs/SHARED_THEME_AND_CONTRACT.md` — theme + frozen integration contract (both teams)
- `docs/CORE_CONTEXT.md`, `docs/CRYPTIQ_PLAN.md` — Core team
- `docs/HUB_PLAN.md` — Hub developer
- `PRE_EXISTING.md` — disclosure of pre-existing work
