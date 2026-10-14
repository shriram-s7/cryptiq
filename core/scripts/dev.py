"""Start only Core services; Ctrl+C shuts down all children owned by this launcher."""

import argparse
from contextlib import ExitStack
from dataclasses import dataclass
import os
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import sys
import time
from urllib.error import URLError
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[2]
LOGS = ROOT / "core/.runtime/logs"


@dataclass(frozen=True)
class Service:
    name: str
    command: list[str]
    port: int
    path: str
    expected: bytes


def services():
    node = shutil.which("node")
    if not node:
        raise RuntimeError("Node.js is missing. Install Node 20+ before starting Core.")
    return [
        Service("api", [sys.executable, "-m", "uvicorn", "main:app", "--app-dir",
                        str(ROOT / "core/api"), "--host", "127.0.0.1", "--port", "8000"],
                8000, "/api/health", b'"ok":true'),
        Service("web", [node, str(ROOT / "core/web/dev-server.mjs")],
                5173, "/", b"CryptIQ Core"),
        Service("shop", [sys.executable, str(ROOT / "core/demo-shop/app.py")],
                5050, "/", b"Chennai Organics"),
    ]


def check_ports(specs):
    # Reserve all sockets together during preflight; never stop an existing listener.
    with ExitStack() as stack:
        for service in specs:
            sock = stack.enter_context(socket.socket())
            if os.name == "nt":
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
            try:
                sock.bind(("127.0.0.1", service.port))
            except OSError as error:
                raise RuntimeError(
                    f"Cannot use {service.name} port {service.port}. Stop its existing server "
                    f"or check local socket permissions. No services started. ({error})"
                ) from error


def stop_children(children):
    for _, child in reversed(children):
        if child.poll() is None:
            child.terminate()
    for _, child in reversed(children):
        try:
            child.wait(timeout=5)
        except subprocess.TimeoutExpired:
            child.kill()
            child.wait(timeout=5)


def check_alive(children):
    for service, child in children:
        if child.poll() is not None:
            raise RuntimeError(
                f"{service.name} exited with code {child.returncode}. "
                f"See {LOGS / (service.name + '.log')}"
            )


def run(specs, check_only=False, timeout=30):
    check_ports(specs)
    LOGS.mkdir(parents=True, exist_ok=True)
    children = []
    with ExitStack() as stack:
        try:
            for service in specs:
                log = stack.enter_context((LOGS / f"{service.name}.log").open("w", encoding="utf-8"))
                kwargs = {"creationflags": subprocess.CREATE_NO_WINDOW} if os.name == "nt" else {}
                child = subprocess.Popen(
                    service.command, cwd=ROOT, stdout=log, stderr=subprocess.STDOUT,
                    stdin=subprocess.DEVNULL, env={**os.environ, "PYTHONUNBUFFERED": "1"}, **kwargs,
                )
                children.append((service, child))
                print(f"Starting {service.name} (PID {child.pid}); log: {LOGS / (service.name + '.log')}", flush=True)
            pending = list(specs)
            deadline = time.monotonic() + timeout
            while pending:
                check_alive(children)
                if time.monotonic() >= deadline:
                    raise RuntimeError("Startup timed out waiting for: " + ", ".join(s.name for s in pending))
                for service in pending[:]:
                    try:
                        with urlopen(f"http://127.0.0.1:{service.port}{service.path}", timeout=0.5) as response:
                            body = response.read()
                            if response.status == 200 and service.expected in body:
                                pending.remove(service)
                                print(f"Ready: {service.name} at http://localhost:{service.port}", flush=True)
                    except (URLError, TimeoutError, OSError):
                        pass
                time.sleep(0.1)
            check_alive(children)
            if check_only:
                print("PASS: all three Core services responded; shutting down.", flush=True)
                return
            print("Core ready. Press Ctrl+C to stop all three services. Hub is not managed.", flush=True)
            while True:
                check_alive(children)
                time.sleep(0.5)
        finally:
            stop_children(children)
            print("Stopped all services started by this launcher.", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Start, check HTTP readiness, then stop")
    parser.add_argument("--startup-timeout", type=float, default=30)
    args = parser.parse_args()
    if args.startup_timeout <= 0:
        parser.error("--startup-timeout must be positive")
    # A soft termination follows the same cleanup path as Ctrl+C on supported platforms.
    def interrupt(*_):
        raise KeyboardInterrupt

    signal.signal(signal.SIGTERM, interrupt)
    try:
        run(services(), args.check, args.startup_timeout)
    except KeyboardInterrupt:
        return 0
    except (RuntimeError, OSError) as error:
        print(f"Core startup/runtime error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
