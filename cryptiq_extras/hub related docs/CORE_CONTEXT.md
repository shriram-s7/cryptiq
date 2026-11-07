# CryptIQ Core — Context for the Core team (flexible)

> This is our working brief. Unlike `HUB_PLAN.md`, we may change anything here as we improve the product.
> The only things we must keep stable are in `SHARED_THEME_AND_CONTRACT.md` (theme + `ProjectSummary`
> endpoint + ports + cross-links). Detailed design for Core lives in `CRYPTIQ_PLAN.md`.

## 1. What Core owns
- `core/api` — FastAPI: engine adapter over the copied Hash Patch discovery code
  (`vendor_hashpatch/`, disclosed in `PRE_EXISTING.md`), PII + settings checks, DPDP rules, score, CBOM
  export, Attack Lab (dictionary attack, Shor simulation), fixes/PR/merge, 4 verify checks, evidence PDF,
  **public summary endpoints for Hub**.
- `core/web` — React app: Scan, Overview, Findings, Attack Lab, Fix & Verify, Report.
- `core/demo-shop` — Chennai Organics (Flask), before/after modes, 3,000 fake customers.
- `shared/` — theme files and contract (we create; Hub only reads).
- `docs/` — all plans.

## 2. Moved to Hub (do not build in Core)
Landing page, pricing, sign-up/checkout, partner console, public badge page, verify-a-badge.
`CRYPTIQ_PLAN.md` screens L0, P1 and B1 are now Hub's; Core keeps S1, O1, F1, A1, X1, R1.

## 3. What we owe Hub (must ship early)
- `GET /api/public/projects/{slug}/summary` returning the frozen `ProjectSummary` (shared doc §3.3),
  slug `chennai-organics` mapped to project `p_demo`. Ship a stub returning the "before" JSON **by 18:30**,
  real values by 23:30.
- `GET /api/public/projects/{slug}/report.pdf` once verified.
- CORS allowing `http://localhost:5174`.
- Links: Report page → `{HUB_WEB}/badge/chennai-organics`; header logo → `{HUB_WEB}/`.

## 4. Repo layout
```
cryptiq/
├── README.md                 how to run all apps
├── PRE_EXISTING.md           disclosure of reused code
├── .gitignore
├── docs/                     CRYPTIQ_PLAN.md, CORE_CONTEXT.md, HUB_PLAN.md, SHARED_THEME_AND_CONTRACT.md,
│                             CLAUDE_CODE_REUSE_PROMPT.md, proposal PDF
├── shared/
│   ├── theme/  tokens.css  tailwind.preset.cjs  logo.svg  lattice.svg
│   └── contracts/  project_summary.example.json  project_summary.before.json
├── core/
│   ├── api/   web/   demo-shop/
└── hub/                      ← Hub developer only
```

## 5. Git rules for Core
- Same branch `main`. Stage only `core/`, `shared/`, `docs/` or root files you intend to change.
- Never edit `hub/`. If Hub breaks the build, tell them; don't fix their files.
- Commit prefixes: `core:`, `shared:`, `docs:`.
- Changing `shared/` after 18:30 requires telling the Hub developer first.

## 6. Demo flow (Core part, ~2 min)
Scan (38) → Attack Lab (judge's password cracked; Shor sim decrypts ID numbers) → Fix all → merge →
4 checks pass → 91 → attacks fail → Report → hand over to Hub pages (badge, partner console, pricing).
