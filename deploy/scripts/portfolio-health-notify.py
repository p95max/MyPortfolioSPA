#!/usr/bin/env python3
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path


ENV_FILE = Path(os.environ.get("PORTFOLIO_ENV_FILE", "/etc/portfolio/portfolio.env"))
STATE_FILE = Path(os.environ.get("PORTFOLIO_HEALTH_STATE", "/var/lib/portfolio-ops/health.json"))
TELEGRAM_BIN = "/usr/local/bin/portfolio-telegram.py"


def load_env() -> dict[str, str]:
    values: dict[str, str] = {}
    if ENV_FILE.exists():
        for raw in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = raw.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def active(unit: str) -> bool:
    return subprocess.run(["/usr/bin/systemctl", "is-active", "--quiet", unit], check=False).returncode == 0


def api_is_healthy() -> bool:
    try:
        with urllib.request.urlopen("http://127.0.0.1:8000/api/health/", timeout=8) as response:
            return response.status == 200 and json.loads(response.read()).get("status") == "ok"
    except (OSError, ValueError, urllib.error.URLError):
        return False


def notify(text: str) -> None:
    subprocess.run([TELEGRAM_BIN, "send", "--message", text], check=False, timeout=15)


def main() -> int:
    env = load_env()
    problems: list[str] = []
    for unit in ("docker.service", "portfolio-telegram-bot.service"):
        if not active(unit):
            problems.append(f"service inactive: {unit}")
    if not api_is_healthy():
        problems.append("API health endpoint failed")
    disk = round(shutil.disk_usage("/").used / shutil.disk_usage("/").total * 100, 1)
    if disk >= 90:
        problems.append(f"disk usage high: {disk}%")

    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    try:
        previous = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        previous = {}

    details = "; ".join(problems)
    fingerprint = hashlib.sha256(details.encode()).hexdigest() if details else ""
    label = env.get("PORTFOLIO_ENV_LABEL", "PROD")
    if problems and (previous.get("status") != "fail" or previous.get("fingerprint") != fingerprint):
        notify(f"[{label}] ALERT: {details}")
    elif not problems and previous.get("status") == "fail":
        notify(f"[{label}] RECOVERED: health checks are OK")

    STATE_FILE.write_text(json.dumps({"status": "fail" if problems else "ok", "fingerprint": fingerprint, "updated_at": int(time.time())}))
    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())
