"""HTTP acceptance check against an already running Core API on localhost:8000."""

import json
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen


BASE = "http://127.0.0.1:8000"
SUMMARY = "/api/public/projects/chennai-organics/summary"
ORIGIN = "http://localhost:5174"


def request(path, method="GET", headers=None):
    req = Request(BASE + path, method=method, headers=headers or {})
    try:
        response = urlopen(req, timeout=5)
    except HTTPError as error:
        response = error
    with response:
        return response.status, response.headers, response.read()


def main():
    fixture = Path(__file__).resolve().parents[2] / "shared/contracts/project_summary.before.json"
    status, _, body = request("/api/health")
    assert status == 200 and json.loads(body) == {"ok": True}
    print("PASS: health")

    status, headers, body = request(SUMMARY, headers={"Origin": ORIGIN})
    assert status == 200 and json.loads(body) == json.loads(fixture.read_text(encoding="utf-8"))
    assert headers["Access-Control-Allow-Origin"] == ORIGIN
    assert headers["Cache-Control"] == "no-store"
    assert headers["X-CryptIQ-Data-Source"] == "stub"
    print("PASS: exact fixture JSON, Hub GET CORS and stub headers")

    status, headers, _ = request(SUMMARY, "OPTIONS", {
        "Origin": ORIGIN, "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "content-type",
    })
    assert status == 200 and headers["Access-Control-Allow-Origin"] == ORIGIN
    assert "GET" in headers["Access-Control-Allow-Methods"]
    print("PASS: Hub preflight")

    status, headers, _ = request(SUMMARY, headers={"Origin": "http://untrusted.example"})
    assert status == 200 and headers.get("Access-Control-Allow-Origin") is None
    print("PASS: unrelated origin is not granted browser access")

    status, headers, body = request("/api/public/projects/unknown/summary", headers={"Origin": ORIGIN})
    assert status == 404 and json.loads(body)["detail"] == "Project not found"
    assert headers["Access-Control-Allow-Origin"] == ORIGIN
    print("PASS: unknown slug 404 with Hub CORS")


if __name__ == "__main__":
    main()
