# One container: built React app + FastAPI gateway (serves /, /api, /shop) + Flask shop on 5050 (used by verification).
FROM python:3.12-slim
ENV DEBIAN_FRONTEND=noninteractive PYTHONUNBUFFERED=1 \
    PLAYWRIGHT_BROWSERS_PATH=/app/core/.runtime/playwright
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY core/requirements.txt core/requirements.txt
COPY core/api/requirements.txt core/api/requirements.txt
COPY core/demo-shop/requirements.txt core/demo-shop/requirements.txt
RUN pip install --no-cache-dir -r core/requirements.txt
COPY core/web/package.json core/web/package-lock.json core/web/
RUN npm --prefix core/web ci && npx --prefix core/web playwright install --with-deps chromium
COPY . .
RUN npm --prefix core/web run build
ENV CRYPTIQ_PUBLIC_DEMO=1 CRYPTIQ_OPEN_DEMO=1
EXPOSE 8000
CMD ["bash", "core/scripts/container_start.sh"]
