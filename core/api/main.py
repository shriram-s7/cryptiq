"""Core public integration stub. Values are fixtures, not scan evidence."""

import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from scan_jobs import router, initialize, POOL


SUMMARY_FIXTURE = (
    Path(__file__).resolve().parents[2]
    / "shared/contracts/project_summary.before.json"
)

@asynccontextmanager
async def lifespan(app):
    initialize()
    yield
    POOL.shutdown(wait=True)


app = FastAPI(title="CryptIQ Core API", version="0.2.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Accept", "Content-Type"],
)
app.include_router(router)


@app.get("/api/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.get("/api/public/projects/{slug}/summary")
def public_summary(slug: str) -> JSONResponse:
    """Return the frozen before fixture for the p_demo public slug."""
    if slug != "chennai-organics":
        raise HTTPException(status_code=404, detail="Project not found")
    payload = json.loads(SUMMARY_FIXTURE.read_text(encoding="utf-8"))
    return JSONResponse(
        payload,
        headers={"Cache-Control": "no-store", "X-CryptIQ-Data-Source": "stub"},
    )
