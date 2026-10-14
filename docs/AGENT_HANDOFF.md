# Core agent handoff

## Read order

1. CORE_CONTEXT.md
2. CRYPTIQ_PLAN.md and SHARED_THEME_AND_CONTRACT.md
3. CORE_BUILD_PLAN.md
4. STATUS.md, progress.json and the latest PROMPT_COMPLETIONS.md entry
5. The next prompt listed in progress.json

## Resume point

Planning is complete; no application code has been implemented.
Next prompt: [C01 public summary stub](prompts/C01_PUBLIC-STUB.md).
First inspect Git status and latest history, then implement that prompt only through its acceptance gate.
If this checkout already has later completion entries, follow those instead of this baseline paragraph.

## User requirements that survive a handoff

- Everything stays inside D:\cryptiq; never inspect the original engine outside the repository.
- Core owns core/, shared/ and docs/. Never modify hub/ or stage root files.
- Commit each finished task with core: and push to GitHub so teammates can follow progress.
- No git add . or git add -A; no force-push or destructive reset.
- T02/T09 stay deferred until the user explicitly releases the reuse gate.
- Each task has its own portable prompt; actual completion is recorded separately, not by rewriting
  the task request. Update STATUS.md and progress.json after each task or partial checkpoint.
- Hub is built independently by the friend. Integration is a later decision; preserve the contract.

## Repository and execution context

Repository: https://github.com/shriram-s7/cryptiq, branch main.
Local shell: PowerShell. Python was available as `python` (3.14.0 during planning).
No Core servers were started. No dependency installation was attempted.
No local code behavior or application acceptance check has passed because implementation has not begun.

The initial restricted GitHub probe failed with a name-resolution/thread error. See the newest
publication checkpoint for whether an allowed network retry subsequently succeeded.

## Known first-task trap

shared/contracts/project_summary.before.json has contradictory fields (score 38/unverified alongside
post-fix counts and four passed checks). C01 was explicitly requested to return that exact fixture.
Do not silently alter the shared contract while implementing the stub; disclose the limitation.

## Exporting work to another agent

Give the agent its numbered prompt plus this repository at the latest published commit. The prompt
references all required documents. If transferring files rather than Git, include the context documents,
build plan, state JSON, completion log, handoff and relevant source files. The progress JSON holds no
secrets and is designed to travel with the repository.
