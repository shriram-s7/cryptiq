# CryptIQ Hub — Plan for the Hub developer

> **You own `hub/` and nothing else.** Read this file and `docs/SHARED_THEME_AND_CONTRACT.md`
> completely before writing code. This plan is fixed; the Core team will not change your scope.

---

## 1. Context (what we are building and why your part matters)

CryptIQ is a startup product for Indian small businesses: it scans their code and database, shows what
a hacker could steal, fixes it, and proves the fix (see the shared doc, Section 1). The Core team builds
the scanner, Attack Lab and Fix & Verify flow.

**You build the business side — the CryptIQ Hub.** Judges score tech **and** business equally. Your
system is where the business model becomes visible and clickable:

1. **Landing + pricing** — why CryptIQ, the four tiers, a clear "Free scan" entry.
2. **Partner console** — how a CA firm manages 25 client businesses (our main sales channel).
3. **Public trust badge** — what a shop's customers see, and how a badge is verified.
4. **Simulated sign-up and checkout** — showing how a business moves from free to paid.

Your app is a separate React app on port **5174**. It works fully on its own with mock data, and
connects to Core through **one** endpoint (`ProjectSummary`) when Core is running.

---

## 2. Rules (follow exactly — we share one GitHub branch)

### 2.1 Files
1. Work **only inside `hub/`**. Never create, edit, move or delete files outside `hub/`.
2. `shared/` and `docs/` are **read-only** for you. Import from `shared/theme/`; never edit it.
3. Your own `hub/package.json`, `hub/.gitignore`, `hub/README.md`. Do not touch the root
   `.gitignore`, root `README.md`, `core/`, or any lock file outside `hub/`.
4. Need something from Core (a new field, a link, a fix)? Add a line to `hub/REQUESTS.md` and tell us.

### 2.2 Git (same branch: `main`)
1. Before starting each session: `git pull --rebase origin main`.
2. Stage **only your folder**: `git add hub/` — never `git add .` or `git add -A`.
3. Commit messages start with `hub:` e.g. `hub: partner console table`.
4. Before every push: `git pull --rebase origin main`, then `git push origin main`.
5. **Never** `git push --force`, `git reset --hard` on shared history, rebase others' commits, or
   delete branches.
6. If a rebase conflict touches a file outside `hub/`, stop — do not resolve it; tell the Core team.
7. Never commit: `.env`, keys, `node_modules/`, `dist/`, real personal data.
8. Commit small and often (every 30–60 min).

### 2.3 Coding agents
If you use Claude Code / Cursor / Copilot, start every session with:
> "Read docs/HUB_PLAN.md and docs/SHARED_THEME_AND_CONTRACT.md. You may only create or modify files
> inside hub/. Never run git add . or git add -A; stage with git add hub/. Never force-push."

### 2.4 UI consistency
- Use the **Quiet vault** theme exactly (shared doc, Section 2): Tailwind preset from `shared/theme`,
  Inter + JetBrains Mono, shadcn/ui, lucide-react.
- One primary (emerald) button per screen. No decorative gradients, no stock photos, no emojis.
- Missing token? Define it locally as `--hub-…` in `hub/src/styles/local.css`; don't edit shared files.
- All business names, people and numbers are **fake**; show a small "Demo data" tag on the partner console
  and badge pages.

---

## 3. Tech stack & setup

- React 18 + Vite + TypeScript + Tailwind + shadcn/ui + lucide-react + react-router-dom + Framer Motion.
- `qrcode.react` for QR codes. `jszip` (optional) for bulk download.
- No backend needed. Data: `hub/src/data/*.json` (seed) + Core API when available.

`hub/.env.example`
```
VITE_CORE_API_URL=http://localhost:8000
VITE_CORE_WEB_URL=http://localhost:5173
VITE_USE_MOCKS=true
```

`hub/src/lib/core.ts` — the only file that calls Core:
```ts
export async function getSummary(slug: string): Promise<ProjectSummary> {
  const mock = async () =>
    (await import(`../mocks/summary.${slug}.json`)).default;
  if (import.meta.env.VITE_USE_MOCKS === 'true') return mock();
  try {
    const base = import.meta.env.VITE_CORE_API_URL;
    const r = await fetch(`${base}/api/public/projects/${slug}/summary`);
    return r.ok ? r.json() : mock();      // graceful fallback
  } catch { return mock(); }              // Core not running
}
```
Mocks: `summary.chennai-organics.json` (verified, 91) and `summary.chennai-organics.before.json` (38).
A small "Live / Demo data" dot in the footer shows which source is used.

Folder layout:
```
hub/
  package.json  vite.config.ts  tailwind.config.cjs  .env.example  README.md  REQUESTS.md
  src/
    main.tsx  App.tsx  routes.tsx
    lib/core.ts  lib/format.ts
    data/partner.json  data/clients.json  data/pricing.json
    mocks/summary.chennai-organics.json  mocks/summary.chennai-organics.before.json
    components/  (Header, Footer, ScoreDial, StatusPill, PlanCard, ClientRow, BadgeSvg, LatticeHero)
    pages/  Landing.tsx  Pricing.tsx  SignUp.tsx  Checkout.tsx  Partner.tsx  PartnerClient.tsx  Badge.tsx  VerifyBadge.tsx
```

---

## 4. Screens (detailed)

Global header (all pages): logo (→ `/`) · Pricing · For partners · Verify a badge · **Free scan** (primary,
→ `{CORE_WEB}/scan`). Footer: "Security scan and evidence — not a legal certification." · data source dot.

### H1 Landing `/`
1. **Hero** (ink background + faint lattice dot grid):
   - H1: "See how hackers would break your customers' data — then lock it for good."
   - Sub: "CryptIQ scans your code and database, shows what an attacker could steal, fixes it, and proves it."
   - Primary: **Free scan** → Core. Secondary: "See a sample report" → `/badge/chennai-organics`.
   - Countdown chip: "DPDP security rules apply in **N days**" (computed to 13 May 2027 IST).
2. **The loop** — 4 cards: Scan · Attack · Fix · Prove (icon, one line each).
3. **Why now** — 3 stat cards (cite small under each):
   "Up to ₹250 crore penalty for failing security safeguards (DPDP Rules 2025)" ·
   "~81% of organisations had not updated their frameworks (EY via Inc42, Jul 2026)" ·
   "Data encrypted with RSA today can be stolen now and decrypted later (harvest now, decrypt later)".
4. **Live example** — card showing Chennai Organics from `getSummary`: score dial 38 → 91 (animate from
   `scoreBefore` to `score` when visible), "4/4 checks passed", link to badge.
5. **Who it's for** — 3 columns: Shop owners · Developers · CA & IT firms (→ `/partners`).
6. **Pricing teaser** — the four plan cards (same component as `/pricing`).
7. **Privacy line** — "Your code never leaves your machine. We store findings, not your data."

### H2 Pricing `/pricing`
- Four `PlanCard`s from `data/pricing.json`. Business card highlighted ("Most popular").
- Each card: name, price, one-line who-it's-for, 4–5 features, button:
  Free → `{CORE_WEB}/scan` · Starter/Business → `/signup?plan=…` · Partner → `/partners`.
- Below: comparison note "A manual data audit costs ₹1–10 lakh (Inc42). Business plan ≈ ₹36,000/year."
- Small print: "Prices are launch estimates."

### H3 Sign up `/signup?plan=business` (simulated)
- Fields: Business name, Industry (select), Work email, "What customer data do you collect?" (checkboxes:
  phone, email, address, payments, ID numbers, health). Primary **Continue to payment**.
- Validation inline (required fields, email format).

### H4 Checkout `/checkout` (simulated)
- Order summary (plan, ₹ price/month, GST note "taxes as applicable"), "Pay with Razorpay (test mode)"
  button → 1.2 s processing state → success screen: "Your workspace is ready" + primary **Start your first
  scan** → `{CORE_WEB}/scan`. A visible "Test mode — no real payment" tag.

### H5 Partners landing `/partners`
- Hero: "Offer data-security checks to all your clients." 3 benefits: earn margin (₹500/client cost),
  white-label reports, one console. Primary **Open partner console (demo)** → `/partner`.

### H6 Partner console `/partner` ⭐ main screen
- Header: "Iyer & Associates · Chartered Accountants" + "Demo data" tag + "25 clients".
- **KPI row (4):** Average score · Ready (≥ 80) · At risk (< 50) · Not scanned in 30 days.
- **Clients table** (from `data/clients.json`, 24 seeded + Chennai Organics from `getSummary`):
  Client · Industry · Score (mini dial) · Change (▲/▼ since last scan) · Last scan · Status pill
  (Ready / Needs work / At risk / Not scanned) · ⋯ menu.
  Sort by score; search box; filter pills: All · At risk · Not scanned.
- **Needs attention** side panel: top 5 by risk with one-line reason ("Passwords stored with MD5").
- Primary button: **Invite a client** → dialog: client name + email → generates a scan link
  `{CORE_WEB}/scan?ref=iyer&client=<slug>` + QR + "Copy link" (no email sent; toast "Link copied").
- Secondary: **Download all reports** → zip of `report.pdf` for verified clients (Chennai Organics from
  Core if live; others: a placeholder PDF from `public/sample-report.pdf`), or a toast if jszip not added.
- **White-label** button (outline) → dialog to upload a logo; preview shows the logo on a report header
  mock; label "Pilot".
- Row click: Chennai Organics → `{CORE_WEB}/p/p_demo` (new tab); others → `/partner/clients/:slug`.

### H7 Partner client detail `/partner/clients/:slug`
- Read-only summary card: score dial, counts, data protection chips, last scan, status.
- Buttons: **Send reminder** (toast), Open badge page.

### H8 Public badge page `/badge/:slug`
- Clean centred card: shop name, "Data security scan by CryptIQ", **score** (dial), "Critical issues: 0",
  "Checks passed: 4/4", "Quantum-ready: Yes", last scan date/time (IST), verification ID
  (`CIQ-` + first 8 chars of a hash of slug+lastScanAt).
- Data protection chips (phone, email, password, ID numbers) with ✓ / ✕.
- If `verified=false`: amber state "Scan in progress — not yet verified".
- Footer disclaimer + "Verify another badge" link.
- **Embed section** (below the card): badge preview (SVG), copyable HTML snippet, QR code to this page.

### H9 Verify a badge `/verify`
- Single input: "Enter verification ID or shop name" → finds in `clients.json` / Chennai Organics →
  navigates to `/badge/:slug`. Not found → "No verified scan found for that ID."

### Badge SVG (component `BadgeSvg`)
- 220×56 rounded rectangle: ink left block with `ShieldCheck` + "CryptIQ", right block emerald with
  "Scanned · 91/100" and date. Downloadable as SVG.

---

## 5. Seed data (you create)

`data/clients.json` — 24 fake businesses across: e-commerce, clinic, school, salon, restaurant chain,
logistics, coaching centre, travel agency, pharmacy, real estate, CA firm client portal, NGO.
Each: `{slug, name, industry, city, score, prevScore, lastScanAt, status, topIssue}`. Mix: 6 ready,
8 needs work, 6 at risk, 4 not scanned. Indian-sounding fake names; no real companies.

`data/pricing.json` — the four tiers exactly as in the shared doc.

`data/partner.json` — `{ name: "Iyer & Associates", type: "Chartered Accountants", city: "Chennai" }`.

---

## 6. Task list (in order) with acceptance criteria

| # | Task | AC |
|---|---|---|
| H-01 | Scaffold `hub/`, Tailwind with shared preset, fonts, shadcn, router, Header/Footer | `/` renders with theme; header links work |
| H-02 | `lib/core.ts` + mocks + data source dot | Works with `VITE_USE_MOCKS=true` and with Core off |
| H-03 | Landing (all 7 sections), countdown, live example dial animation | Looks finished at 1280×800 and 390px width |
| H-04 | Pricing page + PlanCard | Buttons route correctly |
| H-05 | Sign-up + checkout (simulated) | Validation, processing state, success → Core scan link |
| H-06 | Seed data (clients, pricing, partner) | 25 rows total incl. Chennai Organics |
| H-07 | Partner console: KPIs, table, filters, search, needs-attention | KPIs computed from data |
| H-08 | Invite dialog with link + QR + copy | Link copied toast |
| H-09 | Partner client detail page | Opens from table |
| H-10 | Badge page (verified + unverified states) + embed section + BadgeSvg | Both states render from mocks |
| H-11 | Verify-a-badge page | Finds by ID and name |
| H-12 | Download all reports + white-label dialog (pilot) | No dead buttons |
| H-13 | Switch to live Core (`VITE_USE_MOCKS=false`), test fallback | Chennai Organics shows 38 before, 91 after Core's fix |
| H-14 | Polish: empty/error states, responsive, keyboard focus, `hub/README.md` | Runs with `npm i && npm run dev` |

Suggested timing: H-01–H-05 by 19:00 · H-06–H-10 by 00:00 · H-11–H-14 by 05:30 · freeze 08:00.

---

## 7. Your part in the demo (≈ 30 seconds, near the end)

1. After Core shows the score jump to 91, open **`/badge/chennai-organics`** → "4/4 checks passed · Quantum-ready".
2. Open **`/partner`** → Chennai Organics now shows **91 ▲53, Ready**; "This is how one CA firm sells
   CryptIQ to 25 clients — ₹500 each per month."
3. Open **`/pricing`** briefly for the business slide.

Make these three pages load instantly and look flawless; they are the business proof.
