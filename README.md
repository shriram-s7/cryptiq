# CryptIQ — Tech Squad

CryptIQ demonstrates a security workflow for a small business: inspect supported source and storage patterns, review repairs, and verify the result before publishing evidence.

## Live demonstration

[Current demo origin](https://usual-orbit-national-mazda.trycloudflare.com/)

New reviewers need the **complete access link supplied privately by the presenter**. The clean URL above does not grant access. The complete link and access key stay out of Git. This free temporary Cloudflare Tunnel depends on the presenter PC remaining awake, online, and running the services. Restarting the tunnel can change its address. All reviewers share one synthetic demonstration database.

[Presentation (12 slides)](docs/presentation/CryptIQ_Tech_Squad_12_Slides.pptx) · [Speaker notes and Business demo script](docs/presentation/PRESENTER_GUIDE.md) · [Hosting and walkthrough](docs/PUBLIC_DEMO.md)

## What works today

- Four connected views: CryptIQ dashboard, Chennai Organics shop, a separate Hacker tab, and a read-only Partner console.
- Local Python AST rules identify eight supported risk families. The bundled shop scan also samples the first 100 customer rows and counts the full dataset.
- A real bounded dictionary attack uses 25 candidates against synthetic accounts. The RSA example uses classical factoring of a deliberately tiny key. Transaction attack effects are scripted.
- Four dependent demo repairs apply as one atomic migration, with actual row progress. Individual cards select changes for review, not independent application.
- Four verification checks cover rescan, reattack, working login/cart/checkout, and fresh account storage. Fresh passing evidence permits PDF and CycloneDX inventory exports.
- Seeded example score: 38 before repair, 91 after verification. Remaining manual findings prevent a perfect score.

## Scope and disclosures

The current engine uses `core/api/engine/simple_rules.py`, not the earlier Hash Patch engine. Hash Patch reuse remains deferred (T02/T09). Source ZIP inspection is available locally; public uploads are disabled and URL scanning remains a preview. No external breach dataset or trained AI model powers this scanner.

The prototype uses React, FastAPI, Flask, SQLite, argon2-cffi, cryptography, kyber-py and Playwright. See the pinned dependency files. `kyber-py` is educational and requires replacement before production cryptographic use. Password protection uses a server-held HMAC pepper before Argon2id. The attack models database exposure, not compromise of the server and its keys. Reports provide bounded security-safeguard evidence, not legal certification.

Billing, server-enforced subscriptions, production tenant isolation, broad automatic repairs and permanent hosting remain future work. Partner portfolio entries other than the connected demo are sample data. The review flow does not create a real customer GitHub pull request.

## Displayed pilot pricing

| Plan | Monthly price | Demo scope |
|---|---:|---|
| Free | ₹0 | 1 project, 1 scan, discovery; repairs locked |
| Starter | ₹999 | 1 project, 4 scans, supported repairs and verification |
| Business | ₹2,999 | 1 project, 12 scans, full evidence demonstration |
| Partner | ₹1,199 | Read-only portfolio, 3 active client workspaces included |
| Extra partner workspace | ₹500 | Each additional active workspace per month |

These are proposed prices and UI limits. Payments are not connected. Partner subscriptions do not grant write access to client repairs.

## Run locally (Windows PowerShell)

Use Python 3.11+ and Node 20.19+ from the repository root:

```powershell
python -m venv core/.venv
core/.venv/Scripts/python.exe -m pip install -r core/api/requirements.txt -r core/demo-shop/requirements.txt
npm --prefix core/web ci
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD/core/.runtime/playwright"
Push-Location core/web
npx playwright install chromium
Pop-Location
core/.venv/Scripts/python.exe core/demo-shop/seed.py
core/.venv/Scripts/python.exe core/scripts/dev.py
```

Do not force reseed an existing demo unless you intend to remove its fake registrations and orders. The launcher checks occupied ports and stops its own children on Ctrl+C. Open the dashboard on http://localhost:5173, the shop on http://localhost:5050, and the API on http://localhost:8000. See [public demo instructions](docs/PUBLIC_DEMO.md) for the compiled single-origin gateway and tunnel.

## Repository and progress

| Directory | Purpose |
|---|---|
| core/api | Local scanner, attack demonstration, repair, verification and evidence |
| core/web | Current connected demo frontend |
| core/demo-shop | Synthetic Chennai Organics storefront and storage |
| hub | Separate collaborator-owned work; left unchanged |
| shared | Shared theme and integration contracts |
| docs | Plans, portable prompts, progress and presentation |

Current implementation notes take precedence over unimplemented aspirations in older plans. [STATUS](docs/STATUS.md), [progress database](docs/progress.json), and [handoff](docs/AGENT_HANDOFF.md) record completed and remaining work. C19 onward is not automatically accepted by this presentation update.

Stage explicit paths only, preserve collaborator work, and never commit keys, real customer data or runtime databases.
