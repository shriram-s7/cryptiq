"""Local Core API and evidence-backed public integration."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
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
def public_summary(slug: str) -> JSONResponse:
    """Keep frozen public fields; values now come from actual scan/verification evidence."""
    if slug != "chennai-organics":
        raise HTTPException(status_code=404, detail="Project not found")
    payload = results.summary()
    return JSONResponse(
        payload,
        headers={"Cache-Control": "no-store", "X-CryptIQ-Data-Source": "live"},
    )
