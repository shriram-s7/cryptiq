# CryptIQ — Shared Theme & Contract (both teams)

> Owned by the Core team. The Hub team reads this and never edits it. If Hub needs a change, add a
> line to `hub/REQUESTS.md`.

## 1. What CryptIQ promises (the pitch, in one place)

CryptIQ shows a small business **what a hacker could steal from it**, fixes the problems, and **proves**
the fix — before India's DPDP security rules apply (13 May 2027) and before "harvest now, decrypt later"
quantum attacks matter.

Loop: **Scan → Attack → Fix → Prove.**

- **Scan:** finds weak crypto and unprotected personal data in the business's own code and database;
  0–100 score; plain-English findings; CycloneDX CBOM.
- **Attack Lab:** real dictionary attack cracks weak password hashes; simulated Shor's algorithm factors a
  small demo RSA key and decrypts customer data (always labelled as a simulation).
- **Fix:** fixes arrive as a pull request the developer reviews.
- **Prove:** score changes only after 4 live checks pass — re-scan, re-attack, app still works, new data
  encrypted. Owner gets an evidence report and a public **trust badge**.

Business model (estimates, to be validated with pilots):

| Tier | Price | For |
|---|---|---|
| Free | ₹0 | Score + top 3 risks + one Attack Lab run |
| Starter | ₹999 / month | One small website or app |
| Business | ₹2,999 / month | Multiple projects, CI guard, evidence report, trust badge |
| Partner | ₹500 / client / month | CA / IT / audit firms; multi-client console; white-label; they resell at a margin |

Go-to-market: free scans via incubators and college E-cells → **CA and IT-service firms as the channel**
→ DPDP-deadline campaigns.

Language rules for every screen:

- Say "security scan" and "security-safeguard evidence". Never "DPDP certified" or "compliant".
- Quantum attack is always "simulated".
- All data shown is fake demo data; label it "Demo data" where a real business name would appear.

## 2. Theme — "Quiet vault"

Simple, elegant, crypto-relevant: calm light product surfaces, a deep ink colour for headers and
security moments, emerald for "protected", red only for "exposed". One motif: a faint **lattice dot
grid** (nod to lattice-based post-quantum crypto) used only in hero areas.

### 2.1 Colour tokens
| Token | Hex | Use |
|---|---|---|
| `--ink-900` | `#0B2530` | headings, hero backgrounds, logo |
| `--ink-700` | `#16404F` | secondary dark surfaces |
| `--emerald-600` | `#059669` | primary buttons, "protected", links |
| `--emerald-50` | `#E7F7F0` | tinted cards, success backgrounds |
| `--red-600` | `#DC2626` | "exposed", critical, cracked values |
| `--amber-600` | `#D97706` | warning, high, "quantum-vulnerable" |
| `--slate-900` | `#0F172A` | body text |
| `--slate-500` | `#64748B` | secondary text |
| `--slate-200` | `#E2E8F0` | borders |
| `--slate-50` | `#F8FAFC` | page background |
| `--terminal-bg` | `#0B1220` | Attack Lab terminal only |
| `--terminal-fg` | `#D1FAE5` | terminal text |

Score colours: < 50 red-600 · 50–79 amber-600 · ≥ 80 emerald-600.

### 2.2 Type
- **Inter** (400/500/600) for UI. Headings 600, never 700+.
- **JetBrains Mono** (400/500) for hashes, keys, code, scores in dials, terminal.
- Sizes: H1 36/44, H2 24/32, H3 18/26, body 15/24, small 13/20.

### 2.3 Components & layout
- Tailwind + **shadcn/ui** (Button, Card, Badge, Table, Tabs, Sheet, Dialog, Tooltip, Toast).
- Icons: **lucide-react** only. Core set: `ShieldCheck` (protected), `ShieldAlert` (exposed),
  `Lock`, `KeyRound`, `ScanLine`, `Fingerprint`, `FileCheck2`, `Building2` (partner), `BadgeCheck` (badge).
- Radius: 12px cards, 10px buttons, 999px pills. Borders 1px `--slate-200`. Shadows: none or `shadow-sm`.
- 8px spacing grid. Max content width 1200px. Generous white space.
- **One primary (emerald, filled) button per screen.** Secondary = outline. Tertiary = text link.
- Motion: 150–300 ms ease-out fades/slides; score dial sweep 1.2 s. No bouncing, no confetti.
- Copy: sentence case, short, no exclamation marks, numbers with units (₹, days, %).

### 2.4 Logo & wordmark
- Wordmark "CryptIQ" in Inter 600, `--ink-900`; the "IQ" in `--emerald-600`.
- Mark: `ShieldCheck` icon inside a 28px rounded square, ink background, emerald icon.
- File: `shared/theme/logo.svg` (Core creates it in the first commit).

### 2.5 Files (created by Core in the first commit)
- `shared/theme/tokens.css` — CSS variables above.
- `shared/theme/tailwind.preset.cjs` — Tailwind preset mapping tokens to `colors`, fonts, radius.
- `shared/theme/logo.svg`, `shared/theme/lattice.svg` (dot-grid background).
Both apps import the preset: `presets: [require('../shared/theme/tailwind.preset.cjs')]`.

## 3. Integration contract (frozen — Core guarantees it)

### 3.1 Ports and URLs
| App | Dev URL | Env var used by the other app |
|---|---|---|
| Core web | `http://localhost:5173` | `VITE_CORE_WEB_URL` |
| Core API | `http://localhost:8000` | `VITE_CORE_API_URL` |
| Demo shop | `http://localhost:5050` | — |
| **Hub web** | `http://localhost:5174` | `VITE_HUB_WEB_URL` |

### 3.2 Endpoints Core provides to Hub
| Method | Path | Returns |
|---|---|---|
| GET | `/api/health` | `{ "ok": true }` |
| GET | `/api/public/projects/{slug}/summary` | `ProjectSummary` (below) |
| GET | `/api/public/projects/{slug}/report.pdf` | evidence report PDF (404 if not verified yet) |

### 3.3 `ProjectSummary` (JSON)
```json
{
  "slug": "chennai-organics",
  "name": "Chennai Organics",
  "industry": "E-commerce",
  "score": 91,
  "scoreBefore": 38,
  "counts": { "critical": 0, "high": 1, "medium": 0, "low": 2 },
  "checks": { "passed": 4, "total": 4 },
  "verified": true,
  "lastScanAt": "2026-10-15T08:42:00+05:30",
  "dataProtection": [
    { "dataType": "phone", "status": "ok" },
    { "dataType": "email", "status": "ok" },
    { "dataType": "password", "status": "ok" },
    { "dataType": "id_number", "status": "ok" }
  ],
  "quantumReady": true,
  "coreProjectUrl": "http://localhost:5173/p/p_demo"
}
```
Rules: fields are never removed or renamed; Core may add fields. `status` ∈ `ok|warning|risk`.
Before the fix, the same endpoint returns `score: 38`, `verified: false`, `quantumReady: false`.

### 3.4 Cross-links
- Hub "Start free scan" / "Try the demo" → `{CORE_WEB}/scan`
- Hub partner console row (Chennai Organics) → `{CORE_WEB}/p/p_demo`
- Core Report page "View public badge" → `{HUB_WEB}/badge/chennai-organics`
- Core header logo → `{HUB_WEB}/`
