# Core web scaffold

From D:\cryptiq: `node core/web/dev-server.mjs`, then open http://localhost:5173.
Alternatively run `npm run dev` inside core/web. Node 20+ is required; no npm packages are needed yet.
Ctrl+C stops the server. The port is fixed; an occupied port produces an error, not a silent port change.

This is the C02 service entry point only. C03 replaces it with the React/Vite shell, shared theme and
six Core routes. No landing/pricing/partner/badge pages are implemented here.
For the combined launcher, see core/README.md.
