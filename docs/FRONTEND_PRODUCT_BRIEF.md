# CryptIQ frontend product brief

This brief explains the intended product experience for the frontend team. It describes users, separate sites, views, states, transitions, plan limits, and representative demo content. It intentionally leaves visual theme, component arrangement, and exact button labels to the frontend designer.

## Product in one sentence

CryptIQ helps a business see security issues in its website or application, understand the impact, choose fixes, and verify the result. A partner can oversee several client businesses from a separate read-only portfolio console. A separate Hacker demonstration makes the risk understandable using only clearly labeled demo data.

The product story is: **choose what to assess → watch the assessment → understand the findings → fix issues in the business workspace → verify the changes → demonstrate the outcome**.

## Separate experiences and ownership

Treat these as separate sites or applications with their own identity and navigation. Link them at meaningful workflow handoffs and let shared project data update each experience.

1. **CryptIQ public site and plan selection** explains the product, plans, and how to begin. The Core context assigns landing, pricing, and partner-console screens to Hub. Build those requirements in the owning Hub application; do not put them in `core/web`.
2. **CryptIQ business workspace** is the company’s private place to start a scan, review readable findings, choose fixes, verify, and download evidence. This is the Core dashboard.
3. **Hacker demonstration site** is a separate, immersive demo environment. It receives a demo event when a visitor signs in or creates a demo account in Chennai Organics. It shows a simulated attacker investigation focused on the newest demo account. It must clearly disclose that all records are fake and attacks are bounded demonstrations.
4. **Chennai Organics storefront** is a separate, ordinary small-business shop. It should feel like a normal grocery site. Browsing, signing in, registering a test account, adding products, and completing demo checkout should be straightforward. User actions update the demo database and can notify the Hacker demonstration.
5. **Partner Console** is a separate Hub-owned site for auditors, consultants, or IT service partners to see the health and readable findings of their authorized client businesses. It is portfolio management, not a replacement for each company’s dashboard.

The views connect through project identity and events. For example, a new demo signup creates a new row in Chennai Organics, which becomes the newest account in the Hacker demonstration. A fix applied by the business changes the same project state; verification updates its score and status; the Partner Console reflects the latest status for that client. Cross-site links should preserve which company and which stage the user is viewing.

## Product plans

All figures below are proposed display prices, not implemented billing or validated unit economics. Display GST treatment clearly at checkout. Use plan limits as real product rules when billing exists; until then, label them as a prototype proposal rather than implying enforcement.

| Plan | Proposed price | Intended customer | What the user can do |
|---|---:|---|---|
| **Free** | ₹0 | A business checking its public website | Submit a website address for outside-in web checks only, such as HTTPS/TLS, security headers, cookies, DNS, and basic exposure. Show a useful summary, a small set of prioritized findings, and plain-language guidance. Do not imply the URL scan inspected source code or the customer database. No fix application or verified score. One site and one scan each month. |
| **Starter** | ₹999/month per business | A small business that wants to inspect its own application | One business workspace; website checks plus a source folder/ZIP scan; up to four scans per month; complete readable findings and remediation guidance; apply reviewed demo-supported fixes; one post-fix verification run; a downloadable evidence report; one user. |
| **Business** | ₹2,999/month per business | A business that needs the full recurring workflow | One business workspace; website and source scans; up to twelve scans per month; full findings and technical detail; the complete fix and verification workflow; Hacker demonstration access for demo data; evidence report and scan history; up to five users. |
| **Partner** | ₹1,199/month, including three active client workspaces; ₹500/month for each additional active workspace | An auditor, consultant, or IT provider monitoring a client portfolio | A separate partner portfolio, up to three active client workspaces in the base price, one baseline scan per active client per month, client health and readable findings, scan freshness, remediation/verification status, and client report viewing/sharing. Additional active clients cost ₹500/month each. The partner view is read-only: the client company owns fixes and verification actions in its own business workspace. |

An **active client workspace** is one authorized business project that is currently enabled for ongoing monitoring. It is not a shopper, account, domain visitor, or scan. A partner may keep an unlimited directory of archived or paused clients; those do not count as active and are not scanned. Billing starts only after the client authorizes access and the workspace is activated. Reactivating a paused workspace makes it active again. Initially treat one client as one business and one application; define multi-application pricing before offering it.

For example, a partner with three active businesses pays ₹1,199/month. With eight active businesses, the proposed total is ₹1,199 + five × ₹500 = ₹3,699/month. The console shows all eight clients; paused client records remain visible but do not count toward the bill. A business that needs to apply fixes or run its own verification needs its own Starter or Business access. The partner can see status and evidence but cannot change the client’s system from the Partner Console.

Free and paid scan scope must be explicit. A website address scan checks only what is reachable from the public web. A source upload checks the supplied code package and any supported local artifacts. Do not tell a user that either scan covers the other scope. The current local prototype is not a hosted URL security scanner and has no subscription enforcement, accounts, billing, client authorization, or partner tenancy; these are future product requirements.

## Business workspace: views and user journey

Keep the scanning workspace focused. It should not become a catch-all admin dashboard. The main scan journey is linear and explains the next useful action at each step.

### 1. Public product home and plan discovery

Explain the promise in owner language: see the risk, understand what it means, fix what can be fixed, and verify the outcome. Show the sequence and distinguish a website check from a source inspection. Include plan comparison, demo shop access, and clear disclaimers that a scan is not legal certification. This is a Hub-owned view.

### 2. Sign in or create a business workspace

The business identifies itself, selects a plan or starts Free, and creates a workspace. The prototype may use a clearly marked demo identity. Do not claim that a real organization account, user roles, payment, or billing already works if it is only a visual preview.

### 3. Assessment setup — the first workspace step

Make the assessment input the first meaningful action after workspace creation. Ask whether they want to:

- **Check a website address.** Collect a URL and explain that this performs outside-in web configuration checks only. It does not inspect source code, private routes, or database contents. This is the Free path and can also be an additional scope on paid plans.
- **Upload a source folder or ZIP.** Explain that this checks the files supplied and may not represent deployed production code. Show file/size constraints and supported project information. This is available on Starter and Business.
- **Open the Chennai Organics demo.** Use the seeded demonstration project so a first-time user can experience scan, findings, fixes, verification, shop, and Hacker view without connecting their own system.

Ask for the minimum context needed to identify the project and scope. Keep consent and authorization explicit before any real target assessment. The prototype should not make a real scan of arbitrary websites; the public URL path is a product requirement to implement separately.

### 4. Scan in progress

Use a dedicated progress view, not a small spinner in a side panel. Explain the current stage in human language, show real progress where the service provides it, and make clear what type of evidence is being checked. Example stages: receiving input, checking website configuration or reading supplied files, identifying security and personal-data evidence, organizing findings, calculating a candidate score. Include completion, failure, cancellation, and return-to-project states. Do not invent a precise percentage if the backend cannot measure it; use stage progress instead. The score remains a **candidate scan score** until verification.

### 5. Project overview

Show the project name, scan scope and date, candidate or verified status, score with a short explanation, severity totals, important data types and where they were observed, scan coverage and known limitations. The main next step should be reviewing findings. An unmeasured risk should say “not assessed” or “unknown,” never zero. After successful verification, show the verified score alongside its check date and verification state.

### 6. Findings list and finding detail

Present findings in severity order using owner-friendly titles, one-sentence impact, affected data or application area, evidence confidence, and state: open, fixed, or manual action required. Filtering should remain limited to useful categories. The owner view should not lead with filenames or cryptographic jargon. An optional developer detail can expose file and line, rule, code evidence, and technical explanation. Opening a finding reveals the recommended change, why it matters, whether the demo supports an automatic change, and what a human must do. Findings are not fixes until changes are applied and verified.

### 7. Fix plan

Give each supported finding a clear recommended fix in a deliberate order, prioritizing the largest risk and dependencies. Explain the expected effect and whether the fix is automatic or requires a developer. The company can review and apply one fix at a time or choose **Fix all supported issues**. Keep manual work separate and visible. Before application, show the proposed changes and what files or settings they affect. After application, show a clear “changes applied; verification pending” state. A score animation here is provisional; label it as an estimate and keep the verified score unchanged until checks pass.

The company is the decision maker and owner of changes. The Partner Console can direct the company to this view but cannot apply fixes on its behalf.

### 8. Verification in progress and result

Use a dedicated sequence view that makes the checks understandable and visually legible. Show each check starting, passing, or failing, with a short result. The intended checks are re-scan, re-attack, application still works, and newly stored data is protected. Show the old score and candidate new score, then publish the new verified score only after all required checks pass. If a check fails, preserve the prior verified score, explain the failure, and point to the relevant finding or retry. Do not present a decorative animation as proof of checks that did not run.

### 9. Evidence report

Show the current report state: unavailable before verified evidence exists; available after a current verification passes. Provide readable report preview, download, scope/date, findings and remediation summary, verification results, limitations, and clear certification disclaimer. Do not include secrets, plaintext credentials, private keys, or recovered passwords in a business report. Report state must become stale if the underlying project changes after verification.

## Separate Hacker demonstration site

This is its own immersive site, visually distinct from the calm business workspace. It can look technically dense and active, with simulated asset lists, event stream, request traces, hash/key metadata, scan queue, and an investigation timeline. These supporting panels may be visual filler for atmosphere, but label them as simulated or informational; avoid dead controls that appear to perform real attacks. The real user path remains simple and focused on the latest demo signup.

### Hacker demo sequence

1. A person registers or signs in at the Chennai Organics demo shop. Use conspicuous demo notice and fake personal data. The shop event identifies that new account to the Hacker site without sending the user’s password in an event or URL.
2. The Hacker site shows a new-account event and pins that account above older seed records. The operator opens its stored credential evidence and chooses the password-hash demonstration.
3. Show a brief technical sequence: record observed, hash type identified, bounded common-password guesses attempted, and result. In the vulnerable demo, a weak demo password may be recovered and displayed for that demo record. The result must come from the bounded test; do not force a success for an unrecoverable password.
4. After the business applies fixes, register or select a fresh demo account. The same investigation shows a modern password hash and the bounded guessing attempt fails within its stated budget. Explain that this is not proof that every password is safe.
5. A separate tiny-key RSA illustration can show classical factoring of the deliberately small demo key. Label it as a classical educational simulation; it is not Shor’s algorithm running on a quantum computer. Shor’s algorithm does not recover passwords from SHA hashes. Do not call password-hash guessing “Shor.”

The Hacker site may display a faux shell, endpoint map, credential queue, background telemetry, and threat feed as presentation elements. Any element that does not operate should be visually understood as a demo panel, not an available security feature. Only the latest demo signup is the highlighted path so the audience is not forced through a complex tool.

## Chennai Organics storefront

Keep this a normal small grocery storefront, separate from all CryptIQ consoles. Use believable filler products, prices, categories, stock messages, cart, signup, login, and checkout-success content. Example products: cold-pressed groundnut oil, organic turmeric, millet dosa mix, and farm vegetables. Show a persistent but unobtrusive “Demo store; all data is fake” explanation. Registration and login should update only the demo data. A signup may produce a visible event in the Hacker demonstration. Checkout is a simulated order and should not request real card data or imply a payment was taken.

## Partner Console: separate portfolio site

This is for the partner’s own staff. It answers: **Which client businesses are healthy, which need attention, and what happened in their latest assessment?** It is not the place for source-code remediation.

### Partner views

1. **Partner overview:** partner organization name and client count; portfolio-wide health summary; how many clients are healthy, at risk, unscanned, or waiting on a fix/verification; and a readable attention queue. Avoid leading with aggregate scores that hide urgent critical issues.
2. **Client portfolio:** each business is clearly distinguished by company name, domain/application, sector, owner contact, authorization state, latest scan date, readable risk state, open critical/high issue count, trend, and next action. Include active, invitation-pending, and paused states. Every row belongs to exactly one client workspace.
3. **Client detail:** readable health timeline, scope and scan freshness, top findings in owner language, outstanding manual steps, fix/verification status, and available report. Let the partner open the client’s business workspace for context only when authorization allows. Make the client identity persistent so the partner cannot confuse tenants.
4. **Invite/authorization state:** adding a company records its name, website/application, and contact. The business must authorize access before monitoring starts. Display invitation pending, approved, declined, expired, and revoked states. A typed URL alone is not authorization to scan.
5. **Billing and client activity:** show the base price, three included active workspaces, count of additional active workspaces, paused clients, and next invoice estimate. Explain when activation starts billing and how pausing stops ongoing workspace charges. This is a visual requirement until billing is implemented.

Partner permissions are view and coordination only: portfolio health, readable findings, report access, scan freshness, and follow-up status. The partner cannot change client code, merge fixes, change client settings, or publish a verified score. The client company performs fixes and verification inside its own workspace. An independent auditor can add a professional opinion outside CryptIQ, but the software report itself is not a certification.

Filler partner data should make the distinction obvious. Example portfolio: **Iyer & Associates** manages Chennai Organics (grocery, at risk, critical issue open, verification pending), Green Basket Foods (food delivery, healthy, last scan two days ago), and BlueKite Crafts (retail, invitation pending). Each client has its own status and report preview; selecting one changes the entire detail context.

The portfolio view can feel rich with harmless supporting indicators such as client trend, scan freshness, industry mix, and weekly activity. Keep the business workspace itself focused and do not carry decorative partner-console controls into its scan flow.

## Shared states, writing, and data integrity

- Separate candidate scan score from verified score everywhere.
- Show the assessment scope and timestamp with every result.
- Treat no data as “not assessed,” not “safe.”
- Keep each business’s workspace, reports, activity, and authorization separate.
- Use filler data only when labeled as demo data. Seeded/example partner records must never look like real clients.
- A new demo signup can become the Hacker view’s current target, but the password itself must not travel through cross-site navigation or event metadata.
- Clearly distinguish website checks, source inspection, stored-data evidence, bounded password guessing, and the tiny-key RSA simulation.
- Shor’s algorithm applies to certain public-key cryptography; it does not crack SHA password hashes. The current RSA demonstration is classical factoring of a tiny demo key.
- Clearly state that the product provides security evidence, not DPDP certification or a professional audit opinion.
- Make errors, empty states, stale scans, denied authorization, expired invitations, failed verification, paused clients, and unavailable reports understandable, not blank.

## View inventory for planning

The product has **five separate experiences** and approximately **20 primary page/state designs**, depending on whether progress and result states are separate routes or states within a page:

- Public product and plan selection (Hub): home, pricing, plan/signup, and plan limit/upgrade states.
- Business workspace (Core): assessment setup, scan progress, overview, findings, finding detail, fix plan/review, change applied, verification progress, verification result/failure, and report.
- Hacker demonstration: investigation dashboard, latest signup detail, password-hash attempt in progress/result, tiny-key RSA illustration/result, and protected-after-fix result.
- Chennai Organics: storefront, signup, login, cart/checkout, and success.
- Partner Console (Hub): partner overview, client portfolio, client detail, invite/authorization, and billing/activity states.

The frontend team should treat this as a product map, not a mandate to make every state a separate URL. The important requirement is that users can identify their role, company, assessment scope, current stage, and next action at all times.

## Current prototype boundary

The local Core prototype already supports a real local scan, findings, actual fake-shop inventory, bounded password and tiny-key RSA demonstrations, a local source review/merge migration, four verification checks, a PDF report, and reset. The business dashboard currently contains the attack operation, so the separate Hacker site is a frontend/product redesign request. The repository does not yet implement real URL scanning, account management, billing, plan entitlements, partner authorization, multi-tenant isolation, or production hosting. The frontend may use clearly labeled sample data to explain those future experiences, but must not portray them as connected production services.

## Handoff checklist

- Keep the five experiences separate and connect them with scoped workflow links.
- Put assessment input first, then a dedicated progress state, then results appropriate to the plan.
- Make Free website-only scope unmistakable.
- Keep owner findings readable; reserve code details for optional developer detail.
- Make the Hacker site visually rich but keep its real demonstration centered on the latest demo signup and a bounded, honest outcome.
- Let the company own fixes and verification; keep Partner Console read-only for client security state.
- Use the proposed Partner base price of ₹1,199, including three active clients, plus ₹500 per additional active client.
- Do not add unrelated controls to the business scan dashboard. Decorative filler belongs only in clearly marked demo/partner atmosphere and must not imply real operations.
- Treat billing, real target scanning, secure client authorization, partner data isolation, and plan enforcement as unimplemented until their backend contracts exist.
