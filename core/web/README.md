# Core React shell (C03)

React 18, TypeScript, Vite, Tailwind, locally owned shadcn-style Button/Card primitives and Lucide icons.
Imports the shared theme/preset/logo. Inter and JetBrains Mono are bundled; no font CDN needed.

## Setup and run

From D:\cryptiq, with Node 20.19+ installed:

```powershell
npm --prefix core/web ci --cache D:/cryptiq/core/.runtime/npm-cache
npm --prefix core/web run dev
```

Open http://localhost:5173. Port conflicts fail rather than changing the port.
For API + web + shop together, follow core/README.md and run `python core/scripts/dev.py`.
Stop the standalone server or combined launcher with Ctrl+C.

## Routes and configuration

- / redirects to /scan.
- /scan: demo workspace entry, explicitly no live scan yet.
- /p/:id: Overview; /findings, /attack, /fix and /report under the same project path.
- Unknown routes display a recovery link back to /scan.

Project navigation has exactly five items. Start a scan is a separate workspace link.
The logo links to Hub; the Report placeholder has a public-badge link. Hub need not be running for
Core navigation. No Hub screens are implemented here.

Copy .env.example to .env.local to override VITE_CORE_API_URL and VITE_HUB_WEB_URL, then restart Vite.
Defaults are localhost:8000 and localhost:5174. URL configuration lives in src/lib/config.ts.
The API client and actual data come in later tasks. No fake scores or scan results are shown.

## Checks

```powershell
npm --prefix core/web run build
```

Browser checks with the app running (PowerShell from core/web):

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH='D:\cryptiq\core\.runtime\playwright'
node node_modules/playwright/cli.js install chromium
npm run test:e2e
```

Checks cover all six routes, missing routes, project-preserving navigation, keyboard skip/focus,
Hub links, local fonts and desktop/mobile dimensions. Screenshots and results stay under ignored
core/.runtime/. Production hosting must rewrite application routes to index.html for direct navigation.
