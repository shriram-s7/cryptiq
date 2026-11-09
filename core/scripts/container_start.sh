#!/usr/bin/env bash
# Start the fake shop (127.0.0.1:5050) and the gateway/API on $PORT. Fresh shop snapshot on every boot.
set -e
mkdir -p /app/core/.runtime
(cd /app/core/demo-shop && python reset.py && python app.py) &
for _ in $(seq 1 30); do curl -sf http://127.0.0.1:5050/ >/dev/null && break; sleep 1; done
exec python -m uvicorn main:app --app-dir /app/core/api --host 0.0.0.0 --port "${PORT:-8000}"
