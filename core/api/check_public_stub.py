"""Public contract acceptance (historical filename retained); now validates live evidence."""

import json
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
    status, _, body = request("/api/health")
    assert status == 200 and json.loads(body) == {"ok": True}
    print("PASS: health")

    status, headers, body = request(SUMMARY, headers={"Origin": ORIGIN})
    value = json.loads(body)
    assert status == 200 and value["slug"] == "chennai-organics"
    assert {"score","scoreBefore","counts","checks","verified","lastScanAt","dataProtection","quantumReady","coreProjectUrl"} <= value.keys()
    assert value["checks"]["passed"] == (4 if value["verified"] else 0)
    assert value["counts"]["critical"] == 0 if value["verified"] else True
    assert headers["Access-Control-Allow-Origin"] == ORIGIN
    assert headers["Cache-Control"] == "no-store"
    assert headers["X-CryptIQ-Data-Source"] == "live"
    print("PASS: live summary fields, verification consistency and Hub CORS")

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
