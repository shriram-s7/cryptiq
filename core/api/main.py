"""Local Core API and evidence-backed public integration."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from scan_jobs import router, initialize, POOL
from evidence import router as evidence_router
from attacks import dictionary
from fixes import reviews
from verify import checks
from report import results
from workflow import router as workflow_router


@asynccontextmanager
async def lifespan(app):
    initialize()
    dictionary.initialize()
    reviews.initialize()
    checks.initialize()
    yield
    checks.POOL.shutdown(wait=True)
    reviews.POOL.shutdown(wait=True)
    dictionary.POOL.shutdown(wait=True)
    POOL.shutdown(wait=True)


app = FastAPI(title="CryptIQ Core API", version="0.2.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Accept", "Content-Type"],
)
app.include_router(router)
app.include_router(evidence_router)
app.include_router(dictionary.router)
app.include_router(reviews.router)
app.include_router(checks.router)
app.include_router(results.router)
app.include_router(workflow_router)


@app.get("/api/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.get("/api/public/projects/{slug}/summary")
def public_summary(slug: str, request: Request) -> JSONResponse:
    """Keep frozen public fields; values now come from actual scan/verification evidence."""
    if slug != "chennai-organics":
        raise HTTPException(status_code=404, detail="Project not found")
    payload = results.summary()
    if request.url.hostname not in ("localhost", "127.0.0.1"):
        payload["coreProjectUrl"] = str(request.base_url).rstrip("/") + "/p/p_demo"
    return JSONResponse(
        payload,
        headers={"Cache-Control": "no-store", "X-CryptIQ-Data-Source": "live"},
    )


@app.get("/api/public/projects/{slug}/badge.svg")
@app.get("/api/projects/{slug}/badge.svg")
def public_badge_svg(slug: str) -> Response:
    if slug not in ("chennai-organics", "p_demo"):
        raise HTTPException(status_code=404, detail="Project not found")
    summary_data = results.summary()
    verified = bool(summary_data.get("verified", False))
    score = summary_data.get("score", 0)

    status_label = "POST-QUANTUM VERIFIED" if verified else "AUDIT PENDING"
    color_bg = "#059669" if verified else "#d97706"
    color_score = "#34d399" if verified else "#fbbf24"

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="310" height="32" viewBox="0 0 310 32" role="img" aria-label="CryptIQ: {status_label}">
  <linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="a"><rect width="310" height="32" rx="6" fill="#fff"/></clipPath>
  <g clip-path="url(#a)">
    <rect width="90" height="32" fill="#0f172a"/>
    <rect x="90" width="165" height="32" fill="{color_bg}"/>
    <rect x="255" width="55" height="32" fill="#1e293b"/>
    <rect width="310" height="32" fill="url(#b)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Inter,system-ui,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="45" y="20" fill="#f8fafc" font-weight="700" letter-spacing="1">CRYPTIQ</text>
    <text x="172" y="20" fill="#ffffff" font-weight="600">{status_label}</text>
    <text x="282" y="20" fill="{color_score}" font-weight="700">{score}/100</text>
  </g>
</svg>"""
    return Response(content=svg, media_type="image/svg+xml", headers={"Cache-Control": "no-store"})


# Opt-in gateway: built frontend and shop share the API origin for public demos.
import os
if os.environ.get("CRYPTIQ_PUBLIC_DEMO") == "1":
    from public_demo import install
    install(app)
