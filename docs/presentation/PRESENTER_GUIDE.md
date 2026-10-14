# CryptIQ — Tech Squad presenter guide

12-slide Prosculpt format. Slide notes contain the same detailed guidance below. Pitch timing totals about five minutes; allow a separate 3–5 minutes for the live Business demonstration.

## Slide 1

CryptIQ
Security risks a business owner can understand.
Repairs with evidence that the application still works.
Tech Squad

Opening, 15 seconds. We are Tech Squad. Our product is CryptIQ. A small business should be able to see a concrete data-protection problem, review a repair, and see evidence that the repair worked. The demonstration uses only synthetic customers. Team member names were not supplied. Do not invent them. Source: core/demo-shop/seed.py and docs/PUBLIC_DEMO.md.

## Slide 2

A shop can look normal while its stored data is exposed.
Our demo stores weak password hashes and readable contacts.
Owners need a clear answer: what is at risk, and what changed?

20 seconds. Chennai Organics is a deliberately vulnerable fictional shop. This is an example of a risk, not a claim that every small shop has these defects. Its before configuration uses MD5, readable contact fields, a hardcoded fake payment secret and deliberately small RSA for fake IDs. The browser appearance does not establish secure storage. Sources: core/demo-shop/src_before and core/api/engine/simple_rules.py. Do not claim a breach of a real business.

## Slide 3

Primary user: an owner who relies on a small development team.
Developer: reviews evidence and applies supported repairs.
Partner: follows client findings through a read-only portfolio.

20 seconds. Separate engineering validation from market validation. The repository records a public HTTPS browser journey that checked signup notification, selected-account password recovery, repair, reattack, four verification checks and PDF download. No customer interviews, paying customers or measured retention were supplied. Proposed discovery: interview 10 owners and 3 IT/audit partners, then recruit 5 consenting pilot businesses. These are targets, not completed interviews. Sources: docs/STATUS.md, core/web/tests/public-demo.spec.ts, core/web/src/pages/PartnerConsole.tsx or current partner component.

## Slide 4

1  Understand: scan source and explain the findings.
2  Repair: review the four supported changes as one bundle.
3  Prove: rerun checks before publishing the improved score.

20 seconds. The owner view gives plain-language findings. The developer view exposes file locations and algorithm details. Hacker opens a separate tab and receives shop events. The partner console is a separate read-only experience. Individual fix cards select changes for review, but the backend currently applies four dependent repairs atomically. It does not independently apply one of four. The candidate score comes from rules. Publication waits for all verification gates. Sources: core/web/src/pages/FixWorkflow.tsx, core/api/engine/score.py, docs/PUBLIC_DEMO.md.

## Slide 5

Business demo: choose the plan, load the shop and scan.
Register a test user. Open the Hacker alert and recover the password.
Apply repairs. Repeat the attack, verify and export the report.

Allow 45 seconds in the pitch to explain the sequence. Run a separate 3–5 minute live demonstration if permitted. PREPARATION: keep the presenter PC awake, backend and Cloudflare tunnel running. Share the complete private access link from core/.runtime/public-demo-link.txt. Reviewers share one database. Reset only when no job is running. MAIN TAB: home, show Free/Starter/Business prices, select Business, select Chennai Organics, consent and save project, then scan. Show score 38 and readable findings. HACKER TAB: open using the navigation link, keep it open. SHOP: register a fictional name, unused phone number and prosculpt123. Never enter a real reused password. HACKER: click the top-right signup alert to select that account and run the recommended password attempt. Explain that this is a real bounded dictionary test with 25 candidates. FIXES: show 0/4, review the bundle and apply all. One progress bar follows migrated rows. Wait for successful commit and 4/4. HACKER: retry the same account, which no longer yields the password under the database-only model. Optionally register again with a new phone and the same test password, then test that account. VERIFICATION: after the final shop action, run all four checks: rescan, reattack, browser login/cart/checkout, new-account storage. Show 91 and download PDF. Any subsequent signup/order changes the evidence and requires verification again. PARTNER: show Northstar Security Advisory, the live Chennai score and the clearly labelled sample portfolio. Explain read-only access and separate partner subscription. Source: docs/PUBLIC_DEMO.md and core/web/tests/public-demo.spec.ts. Transaction attacks are scripted demonstrations, not evidence of a payment exploit. Do not present preview tools as implemented.

## Slide 6

React screens call the FastAPI workflow service.
Python AST rules inspect source. SQLite adds storage evidence.
Flask shop events reach Hacker through polling.
Verification checks publish the report and public summary.

35 seconds. System flow: React dashboard sends scan/fix/verify requests to FastAPI. FastAPI invokes engine/pipeline.py and simple_rules.py, reads the demo SQLite sample, and stores revision-bound results. Flask serves the shop and writes signup/login/order events. Hacker polls activity, selects an account and asks the API to attempt the controlled dictionary test. The public gateway serves React at /, shop at /shop/ and API at /api/. Four browser experiences do not imply four production deployments. Eight rules: weak password hashing, plaintext contact storage, hardcoded payment secret, insecure cookie flag, RSA storage, disabled access logging, absent retention document and absent security contact. Source rules use Python AST and a small set of known patterns. They do not offer whole-program data-flow analysis, dependency CVE coverage or comprehensive penetration testing. Storage checks sample the first 100 rows and separately count customers. ZIP limits: 20 MB archive, 100 MB expanded, 2,000 files. Website-only input is preview, not an implemented deep URL scan. Score = max(0, 100 - 15*critical - 7*high - 3*medium - low). Before: 3 critical, 2 high, 3 low = 38. Remaining manual findings leave 91 after repairs. Sources: core/api/engine/pipeline.py, simple_rules.py, score.py, project upload handlers and docs/PUBLIC_DEMO.md.

## Slide 7

Original integration: findings, migration, event flow and verification.
Open source: React, FastAPI, Flask and cryptographic libraries.
Data: 3,000 synthetic customers and 25 local password candidates.
Hash Patch: earlier project, integration still deferred.

30 seconds. Evidence baseline is commit e56d9eb, which records connected public-demo repairs and PDF export. Original here means repository-specific integration, not invention of Argon2id, AES, ML-KEM or static analysis. Hash Patch is the team's earlier project referenced by the original plan. PRE_EXISTING.md remains a pending reuse disclosure, the vendor integration is absent, and T02/T09 remain deferred. Do not claim Hash Patch code powers the live scanner. Dependencies pinned locally: React 18.3.1, FastAPI 0.127.0, Flask 3.0.3, argon2-cffi 25.1.0, cryptography 50.0.2 and kyber-py 1.2.0. Playwright/Chromium drives browser verification and PDF rendering. Standard library AST, SQLite, hashlib and hmac support scanning and storage. CycloneDX 1.6 is the inventory format, not a vulnerability database. Synthetic data is generated locally, not a sourced real-customer dataset. The 25 candidates are an embedded demonstration list, not RockYou or a comprehensive password corpus. Sources: core/web/package.json, core/api/requirements.txt, core/demo-shop/requirements.txt, core/demo-shop/seed.py, core/api/attacks/dictionary.py, PRE_EXISTING.md. Standard reference: https://cyclonedx.org/capabilities/cbom/. Educational library source: https://github.com/GiacomoPope/kyber-py .

## Slide 8

Passwords: server-held pepper followed by Argon2id.
Contact data: AES-256-GCM with an ML-KEM-768 protected key.
Repairs use transactions. Evidence expires when data changes.
Production work remains: isolation, key management and scale tests.

30 seconds. Before, unsalted MD5 permits matching one of 25 dictionary guesses. After, HMAC-SHA256 with a random 32-byte server-held pepper precedes Argon2id. Existing accounts wrap their legacy MD5 value without learning the plaintext. New accounts process their password directly. Argon2id uses time cost 2, memory 19,456 KiB and parallelism 1. The attacker receives the database, not the server secret. This does not demonstrate resistance to host compromise or online guessing. Fields use authenticated AES-GCM encryption with key protection involving ML-KEM-768. kyber-py explicitly identifies itself as educational and unsuitable for cryptographic production applications, so production replacement is necessary. The RSA demonstration factors a deliberately tiny 64-bit textbook key using classical Pollard-rho. Shor simulation language must not imply a quantum computer or broken production RSA. Transaction attack effects are scripted. Migration uses SQLite rollback and maintenance state, with bounded workers. Verification binds results to source/revision/database state. Accessibility: owner language and visible progress exist, but formal keyboard and screen-reader audit remains future work. Scale evidence covers the 3,000-row demonstration, not multi-tenant production load. Sources: core/demo-shop/src_after/auth.py, crypto_utils.py, migrate_to_after.py, core/api/verify/checks.py, core/api/attacks and https://github.com/GiacomoPope/kyber-py .

## Slide 9

Initial segment: small online shops with a developer or IT partner.
Alternatives: Semgrep for code analysis, ZAP for web testing.
Our focus: an owner-readable repair and verification workflow.
Pilot goal: 5 businesses and 2 advisory partners.

20 seconds. Semgrep documents static analysis, software composition analysis and secrets scanning. ZAP is an open-source web app scanner. They have broader established capabilities than this prototype in their domains. We are testing a workflow distinction: owner-facing explanations, bounded attack evidence, supported repair and proof within one demonstration. Do not claim competitors cannot repair or verify. Pilot targets are proposed recruitment goals, not signed clients. Sources checked 15 October 2026: https://docs.semgrep.dev/ and https://www.zaproxy.org/ . No independent market-size research or paid traction is available in the repository. Proposed channel: local IT service firms and small-business referrals. Validate repair demand, onboarding time and support effort before extrapolating revenue.

## Slide 10

Free ₹0: discovery. Starter ₹999/month: repair and verify.
Business ₹2,999/month: fuller evidence and export workflow.
Partner ₹1,199/month: 3 active client workspaces.
Additional active workspace: ₹500/month.

25 seconds. These are the current displayed pilot prices, not validated market prices or enabled billing. All three company plans show one project. Monthly scan limits are Free 1, Starter 4, Business 12. Free locks remediation. Starter supports ZIP inspection and the bundled repair/verification workflow. Business is the recommended full presentation path including evidence. The present gates are demo/UI behavior, not secure subscription entitlements. Partner payment is separate: 1,199 includes 3 active workspaces and 500 for each additional workspace. Define active for the proposal as a client workspace enabled for tracking in that billing period. Example: 5 active workspaces cost 2,199 per month. Partner reads client health and findings, the company/developer operates repairs under its own appropriate plan. Other portfolio companies are fixtures, Chennai is live. No payment gateway, production tenant isolation or enforceable billing metering is claimed. Source: core/web/src/pages/DemoEntrance.tsx, demoSession.ts, partner view and docs/FRONTEND_PRODUCT_BRIEF.md. Proposed acquisition test: 20 qualified owner conversations, 5 pilots, track activation and paid conversion.

## Slide 11

90-day pilot budget assumption: ₹90,000.
Illustrative month: 10 Starter + 5 Business = ₹24,985 revenue.
At ₹200 variable cost/account, contribution = ₹21,985.
At ₹20,000 fixed cost/month, operating surplus = ₹1,985.

25 seconds. All numbers are planning assumptions, not actual spend, quotes, revenue or audited unit economics. Three founder responsibilities: product/frontend, API/crypto integration, QA/partner onboarding. Assume 80 hours each over 90 days at 250 rupees/hour, giving 60,000 of founder-time opportunity cost. Add 15,000 for hosting/tools, 10,000 for security review and 5,000 for outreach: total 90,000 including imputed time, with 30,000 cash outlay if founders take no salary. These estimates require supplier validation. Recurring example: 10*999 + 5*2999 = 24,985 per month. 15*200 = 3,000 variable costs. Contribution = 21,985, or 87.99% of revenue. Subtract 20,000 assumed fixed monthly cash costs = 1,985 operating surplus before founder salaries, tax, financing and amortization. Average contribution = 1,465.67/account. ceil(20,000/1,465.67) = 14 accounts at the assumed blended mix. This is recurring operating break-even, not recovery of the 90-day budget. Illustrative paid acquisition cohort: 5,000 outreach spend / 5 new paying customers = 1,000 CAC. Do not confuse this cohort with the 15-account steady-state example. No LTV can be defended without churn/retention measurements. Partner revenue excluded to avoid assuming unmeasured usage costs or double-counting customers.

## Slide 12

30 days: validate 5 pilots and make hosting persistent.
60 days: strengthen isolation, access control and repair coverage.
90 days: evaluate audited crypto, CI integration and paid pilots.
Ask: pilot introductions and an independent security review.

15 seconds. Targets are proposals, dependent on pilot feedback and engineering capacity. Thirty days: persistent deployment, formal consent/onboarding, baseline performance and usability measurements. Sixty days: server-enforced plan limits, tenant isolation, authenticated roles, secret management, backup/restore and expanded scanner coverage. Ninety days: replace educational cryptographic implementation with an appropriate audited dependency, evaluate CI integration, prove safe repairs beyond our fixture and validate a paid offering. Hash Patch reuse still needs explicit authorization and provenance review. Main risks: narrow scan coverage, false confidence from a bounded test, safe migration of unfamiliar schemas, real-world support cost and education-library limits. Repo: https://github.com/shriram-s7/cryptiq . Temporary demo origin: https://usual-orbit-national-mazda.trycloudflare.com/ . Reviewers need the full access link supplied privately. The laptop, backend and tunnel must remain running. Do not publish its bearer access key in this deck or GitHub. Close by inviting the jury to inspect the live before/after workflow and the source.
