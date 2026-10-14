"""Create portable task prompts once; never overwrite execution records."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / 'docs'
TASKS = [
('PUBLIC-STUB', 'Public summary stub', 'core/api/', 'Read the existing before fixture without modifying it. Add a minimal FastAPI app, dependency declaration and run instructions. Serve health and the exact fixture for chennai-organics. Allow http://localhost:5174 with CORS. Unknown slugs return 404. Clearly document fixture inconsistencies and stub status.', 'Start the API on 8000; compare parsed HTTP JSON to the fixture; test health, unknown slug, GET with Hub Origin and CORS preflight. Record actual commands and outputs.'),
('T01', 'Core service scaffolding', 'core/api/, core/web/, core/demo-shop/, core/scripts/', 'Preserve the working stub. Add minimal Core web and Flask shop entry points and a Windows-compatible launcher with separate logs and shutdown instructions. Keep dependencies and generated files inside the repository. Do not start Hub.', 'Launch all three Core services together; request API health and both pages on 8000/5173/5050. Check startup failure handling and document clean shutdown.'),
('T03', 'Core React shell', 'core/web/', 'Set up Vite, React, TypeScript, Tailwind and the existing shared theme. Add six Core routes and exactly five project sidebar entries. Use configurable Core API and Hub URLs. Logo links to Hub; no Hub screens.', 'Build successfully; visit all six routes and a missing route. Check sidebar and links, keyboard focus and 1280x800 layout.'),
('T04', 'Core contracts and mocks', 'core/web/', 'Define Section 8 types and a central API client. Add consistent before/after/error mocks for scan, findings, data map, attacks, patch review and verification. Use one explicit mock flag and visible mock status. Add provisional views as needed, not polished final screens.', 'Every Core route renders on mocks with API stopped. Build/type-check; verify mock errors and before/after examples. No partner mocks or Hub implementation.'),
('T05', 'Before-mode shop', 'core/demo-shop/', 'Build the grocery storefront, signup, login and fake checkout. Use a local SQLite schema and mode-specific behavior. Show demo-data and test-password notices. Add input validation and explicit password hashing behavior for the deliberately vulnerable mode.', 'Create a fake customer, log in correctly, reject wrong password and complete checkout. Inspect before-mode storage. Confirm no real payment or external customer data is used.'),
('T06', 'Repeatable customer seed', 'core/demo-shop/', 'Generate 3,000 deterministic fake customers, Priya with priya@123 and roughly 45 percent common passwords. Keep plaintext test truth out of Git using a local ignore rule. Build the allowed before snapshot with fake data only.', 'Verify row count, Priya login, expected common-password proportion, repeatable reset snapshot and no plaintext truth/keys in staged files.'),
('T07', 'Planted issues and independent checker', 'core/demo-shop/, core/api/engine/', 'Create src_before with all eight Section 6.2 issues matching actual runtime behavior. Implement a small new local evidence-based checker needed for this acceptance gate. Do not import, copy or inspect the deferred Hash Patch engine.', 'Run the checker on the before source/schema and obtain exactly the intended eight distinct findings with evidence. Remove or change a planted condition in an isolated fixture and confirm the corresponding result changes.'),
('T08', 'Protected mode and migration', 'core/demo-shop/', 'Implement src_after, authenticated field encryption and real ML-KEM if available, Argon2id migration for existing and new accounts, mode switching and reset. Preserve encrypted-email login lookup. Make partial migration recoverable and repeat calls safe. Measure performance rather than promising impossible timing.', 'Priya logs in after migration; phone/email/address/ID are ciphertext; new signup is protected; wrong password fails; reset restores before state. Exercise failed migration and repeat migration. Record actual algorithm and latency.'),
('T10', 'Rules and score pipeline', 'core/api/engine/', 'Expand the local checker with PII/settings checks, rules.yaml, owner/developer text, fix mappings, data map and scoring. Keep the adapter boundary available for later reuse. Use active source and database evidence, not a mode-based constant score.', 'Before produces C3/H2/M0/L3 and 38; after C0/H1/M0/L2 and 91 candidate score. Test score clamping, deduplication and changed inputs. Identify remaining manual work.'),
('T11', 'Scan jobs and polling API', 'core/api/', 'Implement project records, SQLite job persistence, background scans and real stages/counts. Add safe bounded ZIP scan support with extraction confinement and no execution. Keep candidate scan score distinct from published verification state.', 'Poll a real demo scan through terminal success; test bad project, failing scan, oversized/traversal ZIP and unsupported input. Verify completed results persist across restart and stale jobs cannot publish after reset.'),
('T12', 'CBOM export', 'core/api/', 'Export actual discovered cryptographic assets as CycloneDX 1.6 crypto components. Keep source locations, algorithm/key metadata and quantum-risk descriptions accurate. Avoid importing deferred vendor code.', 'Validate a real export against the applicable schema, download it through the scan endpoint and verify that before/after assets correspond to the source scanned.'),
('T13', 'Leak preview', 'core/api/', 'Serve a bounded preview of actual fake shop rows in newest-first order. Reflect active stored representation and handle project/limit validation. Do not leak encryption keys or seed-truth files.', 'Create a fresh test signup; assert it is first and returned fields match the database. Check before/after representations, empty data and invalid limits/IDs.'),
('T14', 'Dictionary attack', 'core/api/attacks/', 'Create the curated common-password wordlist and background attack jobs. Attack actual MD5/Argon2id representations with measured work, progress and explicit budgets. Do not fabricate zero cracks after migration; report any recovered weak password honestly.', 'Recover Priya and a known test signup before. Run the budgeted after attack and record real outcomes, duration and attempts. Ensure timeout completes, API remains responsive and invalid targets are rejected.'),
('T15', 'RSA factoring simulation', 'core/api/attacks/', 'Factor only the deliberately small demo RSA public key with bounded Pollard-rho, reconstruct its private exponent and decrypt fake ID fields. Label simulation in all output. Use an accurate protected/unsupported verdict for the actual after algorithms.', 'Before result decrypts an expected fake ID from the database. After result reflects real active key inventory. Test timeout/unsupported key and verify that no production-RSA capability is claimed.'),
('T16', 'Patch review and merge', 'core/api/fixes/', 'Generate real unified diffs between src_before and src_after for the four fix groups. Persist local review records and selected fixes. Merge invokes migration, tracks project revision and initiates verification when available. Clearly distinguish local review from GitHub integration.', 'Compare returned diffs to actual source files; apply merge and inspect migrated storage. Test repeated and concurrent merge, invalid selections and migration failure. Published score must not jump yet.'),
('T17', 'Verification publication gate', 'core/api/verify/', 'Run rescan, real budgeted reattack, HTTP login/checkout and new-signup storage checks in order. Persist evidence and protect against stale revision/reset races. Publish the new score only if every check passes. Clean up temporary verification users safely.', 'Pass all four against a valid migrated shop. Deliberately fail one check and prove score/verified status are not upgraded. Test retry and stale results after reset. Record attack limitations instead of scripted pass.'),
('T18', 'Evidence and public results', 'core/api/', 'Generate a 2–3 page evidence PDF from persisted results; implement live public summary, verified public PDF and demo reset. Keep frozen contract fields. Provide underlying Core result data only, not partner APIs or Hub badge pages. Resolve the before-fixture inconsistency explicitly before live data use.', 'Render and inspect PDF, including rupee glyph and disclaimers. Test before/unverified/verified summary, report 404 before verification, actual report after, unknown slug and reset invalidation. Confirm consistent revision across report and summary.'),
('T20', 'Live scan screen', 'core/web/', 'Replace scan mocks with actual API progress for demo and bounded ZIP upload. Label GitHub connection as pilot. Navigate to overview on success and offer safe error recovery. Cancel polling on navigation.', 'Run a real demo scan from browser; observe genuine stages/counts. Exercise invalid ZIP, unavailable API and navigation away. Confirm mock flag does not silently replace failed live results.'),
('T21', 'Overview screen', 'core/web/', 'Show actual published score, candidate verification state when needed, severity counts, score formula, six data-map items and a truthful exposure banner. Link the main action to Attack Lab.', 'Check fresh scan and verified/reset states against API data. Unknown attack percentage stays unknown. Inspect 1280x800 with no required overview scrolling.'),
('T22', 'Findings screen', 'core/web/', 'Implement severity ordering, owner/developer toggle, specified filters and a details drawer with evidence, fix guidance and Fix & Verify link. Handle manual, fixed and open states.', 'Verify filters and toggle on actual findings; confirm file/line/snippet and fix eligibility. Test empty results, keyboard drawer close/focus and API errors.'),
('T23', 'Attack Lab screen', 'core/web/', 'Build newest-first leaked-data table with mask/raw toggle, real attack controls and polled terminal output. Show measured results only, simulation disclosure and signup QR/link. Separate stored ciphertext from attack-revealed values.', 'Sign up a test user, recover it with the before dictionary attack and demonstrate small-key ID decryption. Run after attacks and inspect actual verdicts. Check cancellation, failures and 1280x800 layout.'),
('T24', 'Fix and Verify screen', 'core/web/', 'Implement review/merge/verify stepper, computed diffs, supported selections, manual work and four actual checks. Disable duplicate mutations and show failed checks/retry. Animate score only after published verification succeeds.', 'Complete real browser merge/verification. Trigger one failed check and confirm no success card or score upgrade. Test repeated clicks, refresh during a job and recovery.'),
('T25', 'Core Report screen', 'core/web/', 'Add real evidence preview/download, CBOM download, accurate copyable verification commands and configured Hub badge link. Make unavailable/unverified report state clear. Do not build the public badge page.', 'Download and open actual PDF and JSON from the browser. Check disabled/unavailable states, clipboard feedback and external link configuration with Hub stopped.'),
('T27', 'Core polish', 'core/web/', 'Audit all six Core screens for empty/loading/error states, accessible labels, focus, reduced motion and responsive layout. Owner/developer menu changes wording; any partner destination is only a Hub link. No dead buttons.', 'Build and walk every screen at 1280x800 and narrow width, using keyboard. Confirm Overview and Attack Lab projector usability and all pilot actions give explicit feedback.'),
('T28', 'Finding language audit', 'core/api/engine/, docs/', 'Review every rule with owner risk, developer evidence, fix guidance and remaining manual work. Remove unsupported certification and post-quantum claims. Keep rule identifiers stable.', 'Review before and after API/UI wording for every rule. Ensure each actionable finding explains why it matters and what to do; verify disclaimers reflect real algorithms and budgets.'),
('T30', 'Core demo and Q&A', 'docs/', 'Write a Core demo script, deck outline and Q&A grounded in measured behavior. Cover reuse disclosure status, simulation, local privacy, bounded attacks, local patch review and remaining manual risks. Reference Hub business handoff without implementing it.', 'Rehearse the exact commands/screens and time the demo. Verify every numerical/security claim against actual results; mark unavailable artifacts and remaining gaps explicitly.'),
('T31', 'Full Core regression', 'core/, docs/', 'Run the original Section 21 checklist adapted to Core ownership twice. Include reset, fresh signup, attacks, merge, verification, report, public API and offline runtime. Test Hub contract via HTTP independently of its app.', 'Record two complete runs and their evidence. Confirm failure gating, fresh timestamps, stale-job protection and no mocked live results. Log every outstanding bug; do not mark done with unexplained failed gates.'),
('T32', 'Backup demo recording', 'docs/, core/', 'Capture an actual short Core demonstration with fake data only and prepare a backup playback guide. Use a supported recording mechanism if available. Do not invent a video artifact if recording is unavailable.', 'Open the produced recording and verify legibility, audio if used and sequence. If manual capture is required, record an explicit blocker and exact script rather than marking recording complete.'),
('T33', 'Submission and final handoff', 'docs/', 'Prepare a final artifact inventory linking the repository, actual report/sample evidence, deck materials, recording and proposal where available. Document reproducible setup, run, reset, known limitations and deferred engine/Hub work. Do not claim external submission unless performed and authorized.', 'Follow setup on a clean permitted environment or document limits; verify all artifact links. Ensure progress/completions reflect reality, no secrets are staged, and final completed-task commits are pushed.')
]

def main():
    prompts = DOCS / 'prompts'
    prompts.mkdir(exist_ok=True)
    records = []
    for index, (original, title, scope, work, checks) in enumerate(TASKS, 1):
        task_id = f'C{index:02d}'
        filename = f'{task_id}_{original}.md'
        predecessor = f'C{index-1:02d}' if index > 1 else 'PLAN'
        content = f'''# {task_id}: {title}

Original task: {original}. Prerequisite: {predecessor} accepted, or an explicit recorded dependency exception.

## Start here

You are continuing CryptIQ Core in D:\\cryptiq. Read docs/CORE_CONTEXT.md first, then
docs/CRYPTIQ_PLAN.md, docs/SHARED_THEME_AND_CONTRACT.md, docs/CORE_BUILD_PLAN.md,
docs/STATUS.md, docs/progress.json, docs/PROMPT_COMPLETIONS.md and docs/AGENT_HANDOFF.md.
Inspect Git status before editing. Prior completion evidence overrides assumptions in this prompt.

Never read/write outside D:\\cryptiq. Never modify hub/. Stage only intended core/, shared/ or docs/
files; never git add . or git add -A. Commit prefixes must be core:. Keep T02/T09 deferred until
the user releases the reuse gate. Do not invent results or silently replace failed live work with mocks.

## Scope

Allowed implementation area: {scope} Progress documentation under docs/ is also required.

{work}

## Acceptance gate

{checks}

Run the meaningful checks, record exact commands and actual outcomes. A failing or unavailable required
check is not a pass. Correct failures within scope; document unresolved blockers before moving on.

## Required completion and export record

1. Update this task in docs/progress.json (status, acceptance evidence, blockers and next task).
2. Append a separate entry to docs/PROMPT_COMPLETIONS.md using its template; never erase past evidence.
3. Update docs/STATUS.md: completed work, exact how-to-run, known issues, current task and next prompt.
4. Update docs/AGENT_HANDOFF.md with changed paths, service state and exact resume action.
5. Review the staged diff; commit this finished task with a core: prefix and push to origin/main.
   Synchronize safely if remote main advanced. Never force-push or change Hub to resolve a conflict.
6. Report commit and actual push result. If publication is blocked, record that separately from acceptance.

If interrupted, record partial work and failing commands. Mark in_progress or blocked, never done.
The next agent must be able to continue using only the repository and these records.
'''
        path = prompts / filename
        if path.exists():
            raise SystemExit(f'Refusing to overwrite existing prompt: {path}')
        path.write_text(content, encoding='utf-8')
        records.append({'id': task_id, 'original_task': original, 'title': title,
                        'prompt': f'docs/prompts/{filename}', 'depends_on': [predecessor],
                        'status': 'todo', 'acceptance': {'status': 'not_run', 'evidence': []},
                        'blockers': [], 'commit': None, 'publication': 'not_committed'})
    state = {'schema_version': 1, 'updated_at': '2026-10-14', 'timezone': 'Asia/Calcutta',
             'repository': 'https://github.com/shriram-s7/cryptiq', 'branch': 'main',
             'current_task': 'PLAN', 'next_task': 'C01',
             'workflow': 'Sequential portable prompts with a separate append-only completion log',
             'planning': {'status': 'done', 'acceptance': 'Prompt inventory and JSON validated before commit',
                          'publication': 'pending'},
             'deferred': [{'original_task': 'T02', 'reason': 'Awaiting user confirmation that reuse step is done'},
                          {'original_task': 'T09', 'reason': 'Awaiting user confirmation that reuse step is done'}],
             'excluded': [{'original_task': t, 'reason': 'Hub owned'} for t in ['T19', 'T26', 'T29']],
             'tasks': records}
    path = DOCS / 'progress.json'
    if path.exists():
        raise SystemExit('Refusing to overwrite progress database')
    path.write_text(json.dumps(state, indent=2) + '\n', encoding='utf-8')
    lines = ['# Sequential Core prompt index', '',
             'Run one prompt at a time in this order. Read PROMPT_COMPLETIONS.md before starting.',
             'T02/T09 are deferred; T19/T26/T29 and Hub-owned portions are excluded.', '',
             '| Prompt | Task | Title |', '|---|---|---|']
    lines += [f"| [{r['id']}](prompts/{Path(r['prompt']).name}) | {r['original_task']} | {r['title']} |" for r in records]
    (DOCS / 'CORE_PROMPTS.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'Created {len(records)} task prompts, index and progress database.')

if __name__ == '__main__':
    main()
