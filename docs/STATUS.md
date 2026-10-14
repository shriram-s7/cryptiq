# CryptIQ Core status

Updated: 14 October 2026, IST.

## Current checkpoint

C01 is implemented and all five live HTTP acceptance check groups passed.
The API is running locally on port 8000. Core web and demo shop are not implemented.
C01 commit 512f23f was successfully pushed to origin/main.

## Completed

- Detailed Core plan and 29 portable sequential prompts.
- Separate completion log, JSON progress database and agent handoff.
- C01: health endpoint, exact-fixture public summary, Core/Hub CORS and repeatable HTTP checks.

## How to run

From D:\cryptiq with dependencies installed:

```powershell
python -m uvicorn main:app --app-dir core/api --host 127.0.0.1 --port 8000
```

In a second terminal:

```powershell
python core/api/check_public_stub.py
```

See core/api/README.md for virtual-environment installation. The public summary is at
/api/public/projects/chennai-organics/summary. Stop the server with Ctrl+C.

## Known issues

- Summary is a stub, not scan evidence. The unchanged before fixture mixes score 38/unverified with
  post-fix counts and passed checks. Its example timestamp is not a real scan timestamp.
- No scanning, live verification or PDF endpoint yet.
- T02/T09 remain deferred until the user confirms engine reuse is done.
- Hub remains untouched and will be integrated separately if desired.
- Initial sandbox socket checks failed; allowed retries passed all acceptance checks.

## Next task

[C02/T01](prompts/C02_T01.md): scaffold Core's three services and launcher, preserve the working stub.

## Portable records

- [Detailed plan](CORE_BUILD_PLAN.md)
- [Sequential prompts](CORE_PROMPTS.md)
- [Progress database](progress.json)
- [Actual completion log](PROMPT_COMPLETIONS.md)
- [Agent handoff](AGENT_HANDOFF.md)
