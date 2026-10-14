# Connected experience redesign — 14 October 2026

Start at **http://localhost:5173/**. Four distinct visual experiences share the local demo:

| Experience | URL | Purpose |
|---|---|---|
| Demo entry and pricing | http://localhost:5173/ | Choose a business plan or perspective; no real login/payment |
| Guided business assessment | http://localhost:5173/scan | Source choice, easy setup, save-project consent, scan and findings |
| Hacker observatory | http://localhost:5173/hacker | Live signup/login/order feed; selected-account password results; separate modules |
| Chennai Organics | http://localhost:5050/ | Illustrated storefront, search/categories, real local basket and fake checkout |
| Partner portfolio demo | http://localhost:5173/partner-demo | Distinct read-only portfolio, live Chennai Organics status, sample other companies |

The three CryptIQ experiences use separate full-page layouts on port 5173. The shop is its own app
on port 5050; API is on 8000. Extra ports are not necessary for separate interfaces. No Hub files or
shared theme files were edited. The latest user request authorizes a self-contained Core demo entry
and partner preview; these are not changes to the Hub team's production landing or partner app.

## Presentation sequence

1. Open the home page, show pricing, and choose Explore Business. Free/Starter can be selected for
   contrasting scope. This is a demo identity selector, not commercial authentication.
2. Choose Chennai Organics, continue, confirm project saving. Check the explicit fresh-demo option
   when you want to restore the original vulnerable dataset. It removes fake signups/orders/history.
3. Start the scan. Observe measured stages, candidate score 38, severity counts and findings.
4. Open the shop in another tab. Log in with Priya (`priya@example.test`, test password `priya@123`),
   add produce to the basket and place a demo order. The checkout takes no real payment information.
5. Open the Hacker observatory. Select the sign-in event, then the recommended dictionary attempt.
   The actual dataset job runs; the visible result is matched to the selected customer ID.
6. Transaction integrity is a separate, explicitly **scripted scenario**. It animates a before/after
   tampering story without altering a real order or claiming a successful payment attack.
7. Return to company Findings, then Fixes. Inspect the four recommendation details and source diffs.
   Apply the supported atomic bundle. Individual repair application is not implemented.
8. Continue to the separate Verification screen. It runs re-scan, re-attack, app/login/checkout,
   and fresh storage checks. Success publishes 91 and a restrained confetti animation.
9. Partner portfolio automatically reflects the live summary; Refresh also works. Other company
   rows are clearly marked sample. Portfolio, Client activity and Subscription views are available.
10. Register another fake shop account with a strong unique test password. Its event appears in the
    Hacker observatory; select it and run the actual bounded dictionary test again.

Weak passwords can still be guessed after hashing improves. Do not promise that reusing a common
test password must fail after migration. New data also makes old verification stale: rerun
verification before claiming the report covers newly changed storage. Five seconds without recovery
is bounded evidence, not a guarantee. Tiny RSA uses classical factoring, not quantum Shor execution.

## What changed

- Full-screen entry, pricing, four perspective links, orbit animation and responsive plan cards.
- Guided assessment with source scope, basic context, save confirmation, project shortcuts and
  explicitly confirmed fresh-demo reset. Stored browser projects and demo monthly scan meters.
- Refined business workspace, separate Fixes/Verification routes, recommendation disclosures,
  animated check states, verified celebration and Free repair/report/verification locks.
- Separate dark Hacker observatory: actual shop events every two seconds, record selection,
  actual selected-account recovery display, measured hash work, terminal styling, radar animation,
  labeled transaction sandbox and clearly marked future-tool previews. Old attack URL redirects.
- Shop illustrations generated as local SVG, fuller merchandising, real category/search filters,
  improved account/checkout surfaces and fake payment choices. Existing cart and server pricing remain.
- Separate partner layout with company context, five-second live summary refresh, manual Refresh,
  client activity and proposed billing: ₹1,199 includes 3 active clients, ₹500 per extra client/month.
- Shop events contain only event/customer/order IDs, kind and timestamp, never passwords/contact
  fields. Reset clears the event history. All data remains the explicitly fake local demo dataset.

## Boundaries

Website URL scanning is an honest unavailable-service screen; no fabricated website findings.
Source input accepts ZIP (up to 20 MB), not native folder ingestion. Repair execution remains an
atomic four-fix bundle; each recommendation can be inspected individually. Transaction tampering
is scripted and labeled, not a new real exploit or new verified transaction protection mechanism.
Network/session modules are previews. Partner sample clients have no backend tenants. Billing,
identity, authorization and production quota enforcement are not implemented. Local browser meters
and plan locks demonstrate the intended UI but are not secure server entitlements. Current demo
project limit is one uploaded project plus the reusable seeded demo; project settings/history and
scheduled monitoring need further backend work. Existing saved projects can be reopened.

## Verification evidence

TypeScript/Vite production build passed. Connected experience browser checks passed: plan entry,
Free locks, honest URL scope, responsive four-experience layouts, store filtering/cart/checkout,
credential-free events, actual pre-fix recovery, real migration and four checks publishing 91,
partner live score, fresh protected signup and bounded no-recovery result. Screenshots in ignored
`core/.runtime/redesign-*.png`; home, Hacker, shop and partner images visually inspected.

Run from D:/cryptiq: `core/.venv/Scripts/python.exe core/scripts/dev.py`.
Focused browser checks: set PLAYWRIGHT_BROWSERS_PATH to D:/cryptiq/core/.runtime/playwright and run
`node core/web/node_modules/playwright/cli.js test --config core/web/playwright.config.ts experience.spec.ts`.
The connected test resets fake demo data and then migrates it; choose a fresh demo afterward when
presenting the before-to-after story again. Historic shell/merge/verify tests may contain labels/routes
from the previous interface and need updating before the full legacy suite is used as a release gate.

The original C19–C29 acceptance count was not changed by this separate requested UI batch. Remaining
backend capabilities and the original submission tasks are not represented as completed here.
