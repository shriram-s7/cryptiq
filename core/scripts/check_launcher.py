"""Exercise actual launcher children and verify cleanup on startup failures."""

import socket
import sys

from dev import Service, check_ports, run, services


def main():
    specs = services()
    run(specs, check_only=True)
    check_ports(specs)
    print("PASS: successful startup released all three ports")

    # An occupied listener must survive; this launcher must start no replacement.
    with socket.socket() as occupied:
        occupied.bind(("127.0.0.1", specs[0].port))
        occupied.listen()
        try:
            run(specs, check_only=True)
        except RuntimeError as error:
            assert "No services started" in str(error), str(error)
        else:
            raise AssertionError("Occupied port was not rejected")
        assert occupied.getsockname()[1] == specs[0].port
    check_ports(specs)
    print("PASS: occupied port rejected without replacing existing listener")

    broken = Service("web", [sys.executable, "-c", "raise SystemExit(7)"], 5173, "/", b"never")
    try:
        run([specs[0], broken, specs[2]], check_only=True)
    except RuntimeError as error:
        assert "exited with code 7" in str(error), str(error)
    else:
        raise AssertionError("Failed child was not detected")
    check_ports(specs)
    print("PASS: failing child detected and sibling ports released")

    slow = Service("web", [sys.executable, "-c", "import time; time.sleep(30)"], 5173, "/", b"never")
    try:
        run([slow], check_only=True, timeout=1)
    except RuntimeError as error:
        assert "Startup timed out" in str(error), str(error)
    else:
        raise AssertionError("Non-listening child did not time out")
    check_ports(specs)
    print("PASS: startup timeout stopped the non-listening child")


if __name__ == "__main__":
    main()
