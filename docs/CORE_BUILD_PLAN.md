# Core implementation plan

Planning baseline: 14 October 2026 (IST). This is a build plan, not a claim that any application works.

## 1. Authority and ownership

Read CORE_CONTEXT.md first, then CRYPTIQ_PLAN.md and SHARED_THEME_AND_CONTRACT.md.
The user's instructions override older plans. CORE_CONTEXT.md overrides CRYPTIQ_PLAN.md.

- Work only within D:\cryptiq. Application code and helper scripts belong under core/.
- Never modify hub/. Stage only explicitly named files in core/, shared/ or docs/.
- All commits start with `core:`. Commit and push each completed task after its acceptance checks.
- Never force-push, discard another person's changes, or stage the entire repository.
- Shared theme and ProjectSummary remain the integration boundary even if Hub is replaced later.
- Do not rebuild L0, P1 or B1, pricing, partner management, business signup/payment, or badge verification.
- T02 and T09 remain deferred until the user explicitly confirms the engine reuse step is done.
- The former A/B/C ownership labels do not split this work: this plan covers the whole Core side.

## 2. Deliverables and local architecture

| Component | Location | Responsibility |
|---|---|---|
| FastAPI service, port 8000 | core/api/ | Discovery, findings, scoring, job state, attacks, patch reviews, migration orchestration, verification, downloads and public summary |
| React application, port 5173 | core/web/ | S1 Scan, O1 Overview, F1 Findings, A1 Attack Lab, X1 Fix & Verify, R1 Report |
| Flask demo shop, port 5050 | core/demo-shop/ | Storefront, signup, login, checkout, fake database, before/after source and migration |
| Local launch/reset helpers | core/scripts/ | Start Core's three services, inspect health, reset controlled demo state |
| Shared assets | shared/ | Existing Quiet vault theme and frozen public summary contract |
| Portable execution records | docs/ | Plan, numbered prompts, task state, completion evidence and handoff |

The scanner runs locally over the selected source and demo database. Do not expose arbitrary host paths
through the API. Runtime databases, generated keys, dependency folders and secret environment files do
not belong in commits. Store generated test secrets only inside ignored Core paths. The progress JSON
is versioned project metadata, separate from the application's SQLite database.

Core must start, demonstrate, verify and produce its report with Hub absent. Hub links use a configurable
URL. Keep the public API stable for later integration; do not make Core depend on Hub's mock state.

## 3. State and truthfulness rules

1. A fresh demo scan computes 38 from 3 critical, 2 high and 3 low findings.
2. Applying patches creates a candidate protected state. It does not publish a verified score.
3. Rescan, reattack, app functionality and new-data protection checks run against the migrated shop.
4. All four must pass for the current project revision before publishing score 91 and verified=true.
5. If a check fails, keep the previously published score, show the failure, and allow a bounded retry.
6. A reset invalidates prior verification, attack runs, reports and published protected state.
7. Results include actual counts, elapsed times and failure reasons. UI animation never invents work.
8. Password attacks are budgeted demonstrations; zero recovered within a budget is not proof that a
   weak password is uncrackable. Do not hard-code a zero result or suppress a recovered password.
9. The RSA demonstration uses a deliberately small key, factored classically with Pollard-rho and
   labelled as a simulation throughout. Never present it as breaking production RSA with quantum hardware.
10. If real ML-KEM cannot be installed, explicitly report the fallback and leave quantumReady=false.
    The older plan's X25519 fallback is not post-quantum protection and must not be described as such.
11. Prepared before/after diffs and local merge records are real demo operations, not GitHub PRs.
    GitHub connection remains a labelled pilot feature.
12. Describe outputs as security-safeguard evidence, never legal certification. Validate date-sensitive
    regulatory claims before publishing them; this implementation plan does not establish those claims.

## 4. Execution and export method

Each numbered file in prompts/ is an independently exportable task prompt. Include its referenced
documents when handing work to an agent without repository access. Read PROMPT_COMPLETIONS.md to find
what actually happened; read progress.json for task statuses and the next prompt. STATUS.md is the
short human-readable entry point for teammates.

Task states: todo, in_progress, blocked, deferred, excluded, done. Only one prompt is active at a time.
Acceptance status and publication status are separate. A finished implementation may be committed
locally but not yet pushed; never report GitHub publication unless a successful push is verified.

For each task:

1. Inspect the working tree and latest completion record; preserve unrelated work.
2. Read the next prompt and its dependencies. Do not skip a failed acceptance check silently.
3. Mark in_progress in progress.json and STATUS.md; implement only this task's scope.
4. Run the prompt's acceptance checks and record commands, outcomes and limitations.
5. Append a dated completion entry to PROMPT_COMPLETIONS.md. Update progress.json, STATUS.md and the
   handoff document. Include actual run instructions and the next prompt.
6. Stage only intended allowed paths, inspect the staged diff, commit with `core:` and push to origin/main.
7. Synchronize safely before pushing. If remote main advanced, fast-forward a clean checkout or rebase
   only this task's unpublished local commits. Stop for conflicts involving Hub; never resolve its files.
8. Record the resulting commit and push outcome in the next checkpoint entry. Avoid self-referential
   commit hashes: the commit carrying an entry is identifiable from Git history; later entries can name it.

If credits or context run low, finish the current safe unit or record a partial checkpoint. Record
edited paths, commands already run, failures, active services, exact next action and uncommitted state.
Do not mark an interrupted task done. Another agent should not need this chat to continue.

## 5. Ordered work and dependencies

The detailed task specifications and acceptance gates are reproduced in the numbered prompts and in
progress.json. Order follows Section 18 with the public stub inserted first and Hub work excluded.

| Order | Original task | Deliverable | Gate |
|---|---|---|---|
| 00 | Planning | Portable prompts, state database, status and handoff | Every task mapped; no false application completion |
| 01 | Public stub | Health + exact before-summary response + Hub CORS | HTTP fixture equality, origin and unknown-slug checks |
| 02 | T01 | Core service scaffold and local launcher | All three Core services start and health/pages respond |
| — | T02 | Engine copying and disclosure | Deferred by user; do not read original project |
| 03 | T03 | React shell, routing and shared theme | Six Core screens render; five project navigation items |
| 04 | T04 | Typed mocks and a single API client | Every Core screen can render independently of backend |
| 05 | T05 | Demo shop before mode | Signup, login, checkout and fake-data warning work |
| 06 | T06 | Repeatable fake seed and reset snapshot | 3,000 customers, Priya fixture, no plaintext passwords committed |
| 07 | T07 | Eight planted issues and a small local rules checker | All eight are found from source/schema evidence |
| 08 | T08 | Protected mode, migration and reset | Login preserved, ciphertext stored, repeat/reset safe |
| — | T09 | Vendor adapter integration | Deferred; T07 checker supports independent work |
| 09 | T10 | Rules, PII/settings checks and score | Evidence-backed 38/91 calculations and owner/dev text |
| 10 | T11 | Persistent scan jobs and polling | Actual stages/counts, invalid input and failure states |
| 11 | T12 | CycloneDX crypto inventory export | Schema validation and download from actual scan |
| 12 | T13 | Leak preview | Newest signup first, bounded results, correct mode |
| 13 | T14 | Budgeted dictionary attack | Real before recovery and honest after measurements |
| 14 | T15 | Small-key factoring simulation | Before decryption and accurate protected verdict |
| 15 | T16 | Patch review and local merge | Real diffs, applied migration, concurrent merge protection |
| 16 | T17 | Four verification checks and publication gate | Successful flow and deliberately failed check tested |
| 17 | T18 | PDF, live public summary and reset | Report gated by current verification; reset revokes it |
| — | T19 | Landing/pricing | Excluded: Hub |
| 18 | T20 | Scan screen | Live stage progress and error recovery |
| 19 | T21 | Overview | Actual counts, score, data map and attack link |
| 20 | T22 | Findings | Owner/dev switch, filtering and evidence drawer |
| 21 | T23 | Attack Lab | Live results, newest row, QR, simulation disclosure |
| 22 | T24 | Fix & Verify screen | Review → merge → four checks, failure blocks success |
| 23 | T25 | Report screen | Actual PDF/CBOM downloads and configurable Hub link |
| — | T26 | Partner console | Excluded: Hub |
| 24 | T27 | Core UI polish | Error/empty states, accessibility and projector size |
| 25 | T28 | Final finding wording audit | Every rule explains risk, fix and remaining work |
| — | T29 | Partner seed data | Excluded: Hub |
| 26 | T30 | Core demo narrative and Q&A | Accurate claims tied to observed results |
| 27 | T31 | Full regression and integration contract checks | Two complete reset-to-report runs |
| 28 | T32 | Backup demo recording | Playable actual flow, or explicit manual-capture blocker |
| 29 | T33 | Submission inventory and handoff | Reproducible run guide; real artifact links and missing items |

T07 needs discovery to satisfy its acceptance gate before deferred T09. Implement only the small local
checker needed for the eight planted issues at T07; do not copy or integrate the old engine. T10 expands
that checker into the working rule pipeline. Reintroduce T02/T09 only after the user's release of the gate.

T04 provides provisional mock views before later screen tasks. T01 provides only minimal service entry
points; it must not prematurely implement the entire shop or UI. T18 owns public result/report endpoints,
not Hub partner APIs or public badge UI. T25 retains the Core Report page only.

## 6. API and persistence design

Use the original Section 8 contracts for Asset, Finding, DataMapItem, Scan, AttackRun, PullRequest and
Verification. Keep the shared ProjectSummary field names and status vocabulary unchanged.

- SQLite stores projects, scans, attacks, local patch reviews and verifications. Track project revision
  and timestamps so an old job cannot publish results after reset or a newer merge.
- Background jobs report running/done/error and incremental progress. Never block the HTTP request
  until an attack budget expires. Give the browser explicit terminal failure states.
- Retain the Section 9 routes for scans, attacks, previews, patch records, verification and reset.
- Public routes: GET /api/health; GET /api/public/projects/{slug}/summary;
  GET /api/public/projects/{slug}/report.pdf. Map chennai-organics to p_demo.
- Unknown IDs return explicit 404 responses. Unverified public reports return 404 per contract.
- Validate ZIP size at 20 MB, extracted-size limits, traversal, symlinks and allowed extraction root.
  Never execute uploaded code. Best-effort results must disclose unsupported inputs.
- CORS allows Core and Hub development origins. Any LAN integration later needs explicit configured
  origins; localhost on a friend's computer is not this computer.
- Bind demo services locally by default. Attacks target only the configured owned demo data.
- Make reset and migration mutually exclusive with conflicting active jobs; reject or safely serialize.

## 7. Detailed implementation boundaries

### Demo shop and protection

Keep source snapshots under src_before/ and src_after/ and ensure the active runtime behavior matches
the source being scanned. Store mode inside the Core demo directory. Use an atomic migration transaction
or recoverable backup strategy, with clear failure behavior. Wrap existing MD5 hashes with Argon2id while
supporting normal Argon2id for new users; record enough metadata to distinguish the two without guessing.
Use authenticated field encryption with unique nonces and authenticated decryption failures. Protect
phone, email, address and ID fields. Derive login lookup behavior that still works once email is encrypted.
Measure migration cost honestly: 3,000 sequential 20–50 ms hash operations cannot finish in 10 seconds.
Do not weaken the protection just to satisfy that contradictory timing target; report actual timing.
Test local HTTP cookie behavior so a Secure flag change does not silently break demo login.

### Scan and rules

Detect the eight planted issues from actual files/schema/settings; do not return eight constants for
every project. Findings retain file/line evidence, severity, confidence and fix identifiers. Distinguish
unsupported evidence from confirmed absence, especially for audit logging and organizational policies.
Use max(0, 100 - 15C - 7H - 3M - L). The three manual findings remaining after fixes are access logging,
retention policy and security contact. Cover invalid projects and findings deduplication.

### Attacks and repairs

Curate the demo wordlist without leaked real datasets. Read the active database and report actual work.
Separate before and after runs, record budgets, and pin the newest signup. Do not cache a scripted reveal.
Use bounded factoring attempts and an honest unsupported/error verdict. Patch review shows computed
unified diffs between source snapshots; validate fix selections and make repeated merges safe.

### Verification and reporting

Test both a successful migration and a forced failing verification. Preserve check evidence, run IDs,
timestamps and revision. PDF and CBOM refer to the same verified revision; do not create stale evidence
after reset. PDF contains before/after scores, findings, manual work, attack budgets, simulation label,
verification results and limitations. Render and inspect the report before declaring it finished.

### Frontend

Use Quiet vault shared assets, Inter/JetBrains Mono, light surfaces and a dark Attack Lab terminal.
Exactly five project navigation items. Six Core routes include the standalone scan screen. Owner text
is default, developer details are available on demand. Respect reduced motion and keyboard focus.
Polling cancels on navigation and stops on terminal job states. Do not retry mutations blindly.
Show honest empty, partial, error and unavailable states. No dead buttons or fake progress.

## 8. Integration and schedule

First priority remains the exact-fixture summary stub due 18:30 IST. The documented target for live
summary values is 23:30 IST; real verified values depend on completing actual verification, not the clock.
The old checkpoints are targets, not guarantees or permission to fabricate results.

Build and verify Core independently first. Later, choose whether to integrate, replace or abandon Hub
with the user. Do not delete Hub or replace it based solely on the possibility that it may be scrapped.
The first later integration test is Hub reading score 38, then the verified 91, and reset back to unverified.

## 9. Known discrepancies and decisions

- Existing before fixture has score 38/verified=false but post-fix counts, checks=4 and protected data
  flags. Initial stub must match it exactly as requested; label it a stub. Correct the fixture in an
  explicit shared-contract task before presenting it as truthful live data. Notify Hub before changing
  shared assets after 18:30. Do not silently combine this correction with initial stub delivery.
- Initial dates in fixtures are examples, not real scan timestamps.
- ML-KEM fallback and Argon2 zero-crack claims in the old plan require the truthfulness rules above.
- Existing-user migration latency conflicts with the original sub-10-second estimate; measure it.
- Core context mentions root disclosure files, but current staging permission excludes root files.
  Reuse remains deferred; record the disclosure-path constraint when that work is resumed.
- There is no previous prompt workflow implementation in this checkout. This new workflow implements
  the user's clarified requirement: exportable prompts plus separate actual-completion records.

## 10. Definition of finished Core

On a fresh local setup: launch three services, reset, seed the shop, scan, observe real findings, sign up
with a test password, demonstrate attacks, inspect diffs, merge, verify, see the published result and
download consistent evidence. Repeat from reset. Core remains usable without Hub or internet after
dependencies are installed. All claims match actual measured behavior, all remaining limitations are
documented, and the completed task commits are visible on GitHub.
