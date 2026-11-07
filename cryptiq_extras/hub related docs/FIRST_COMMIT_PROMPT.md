# Prompt for Claude Code — create the CryptIQ repo and first commit

Before pasting: create an empty folder (e.g. `D:\cryptiq`, NOT inside the SIH folder), copy the five docs
(`CRYPTIQ_PLAN.md`, `CORE_CONTEXT.md`, `HUB_PLAN.md`, `SHARED_THEME_AND_CONTRACT.md`,
`CLAUDE_CODE_REUSE_PROMPT.md`) into `D:\cryptiq\docs\`, open Claude Code in `D:\cryptiq`, then paste:

---

Set up the CryptIQ monorepo in the current folder and push the first commit to GitHub.

Context: read `docs/SHARED_THEME_AND_CONTRACT.md` and `docs/CORE_CONTEXT.md` first. Do not read or touch
any folder outside the current directory.

1. Create this structure (empty folders get a `.gitkeep`):
   ```
   README.md  PRE_EXISTING.md  .gitignore  .gitattributes
   docs/      (already contains the plans)
   shared/theme/  shared/contracts/
   core/api/  core/web/  core/demo-shop/
   hub/README.md  hub/REQUESTS.md
   ```
2. `.gitignore`: node_modules, dist, build, .venv, __pycache__, *.pyc, .env, .env.*, !.env.example,
   *.db (but allow `core/demo-shop/data/shop_before.db` via `!` rule), .DS_Store, .idea, .vscode,
   coverage, *.log, `.reuse/`.
   `.gitattributes`: `* text=auto eol=lf`.
3. `shared/theme/tokens.css`: CSS variables exactly as in SHARED_THEME_AND_CONTRACT.md §2.1, plus
   `--font-sans: 'Inter', system-ui, sans-serif; --font-mono: 'JetBrains Mono', ui-monospace, monospace;`
   and radius tokens (12px card, 10px button).
4. `shared/theme/tailwind.preset.cjs`: a Tailwind preset exporting `theme.extend` with colors
   `ink {700,900}`, `emerald {50,600}`, `danger {600}`, `warn {600}`, `terminal {bg, fg}` mapped to the hex
   values, `fontFamily.sans` = Inter, `fontFamily.mono` = JetBrains Mono, `borderRadius.card` = 12px,
   `borderRadius.btn` = 10px.
5. `shared/theme/logo.svg`: 28×28 rounded square (#0B2530) with a simple shield-check outline in #059669,
   followed by wordmark "Crypt" (#0B2530) + "IQ" (#059669), Inter 600. Keep it a clean, valid SVG.
   `shared/theme/lattice.svg`: 40×40 repeating pattern of 1.5px dots, colour #FFFFFF at 8% opacity
   (for use on dark hero backgrounds).
6. `shared/contracts/project_summary.example.json` (verified, score 91) and
   `project_summary.before.json` (score 38, verified false, quantumReady false), exactly matching §3.3.
7. `README.md`: product one-liner, the Scan → Attack → Fix → Prove loop, repo map (who owns what:
   core/ = Core team, hub/ = Hub developer, shared/ + docs/ = Core team, read-only for Hub), ports table,
   "How to run" placeholders for each app, and the git rules for both teams (from CORE_CONTEXT.md §5 and
   HUB_PLAN.md §2.2).
8. `PRE_EXISTING.md`: heading "Pre-existing work" and the sentence "To be completed after the reuse step:
   the crypto-discovery engine adapted from our team's earlier research project will be listed here.
   All other code is written during Founder's Code 2026."
9. `hub/README.md`: "Owned by the Hub developer. Read docs/HUB_PLAN.md." `hub/REQUESTS.md`: heading only.
10. Initialise git on branch `main`, commit with message:
    `chore: initial CryptIQ monorepo structure, shared theme and contracts`.
11. Create a **private** GitHub repo named `cryptiq` with the GitHub CLI and push:
    `gh repo create cryptiq --private --source=. --remote=origin --push`.
    If `gh` is not logged in, stop and tell me to run `gh auth login`.
12. Print: the repo URL, the tree of the repo (2 levels), and the commands my teammate should run to clone:
    `git clone <url>` then `cd cryptiq/hub`.

Do not create any application code yet (no React/FastAPI scaffolding). Do not run the reuse prompt.
