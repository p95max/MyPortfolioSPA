#!/usr/bin/env python3
"""Minimal allowlisted Telegram operations bot for the Portfolio VPS.

It intentionally exposes only fixed commands; no user input reaches a shell.
"""

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path


ENV_FILE = Path(os.environ.get("PORTFOLIO_ENV_FILE", "/etc/portfolio/portfolio.env"))
SYSTEMCTL = "/usr/bin/systemctl"
SUDO = "/usr/bin/sudo"
STATUS_SCRIPT = "/usr/local/bin/portfolio-status.sh"


def load_env() -> dict[str, str]:
    values: dict[str, str] = {}
    if not ENV_FILE.exists():
        return values
    for raw_line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def csv(value: str) -> set[str]:
    return {item.strip() for item in value.split(",") if item.strip()}


def api_request(token: str, method: str, payload: dict) -> dict:
    request = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/{method}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=40) as response:
        data = json.loads(response.read().decode("utf-8"))
    if not data.get("ok"):
        raise RuntimeError(f"Telegram API rejected {method}")
    return data


def send(env: dict[str, str], text: str, chat_id: str | None = None) -> bool:
    token = env.get("TELEGRAM_BOT_TOKEN", "")
    destination = chat_id or env.get("TELEGRAM_DEFAULT_CHAT_ID", "")
    if not token or not destination:
        return False
    try:
        api_request(token, "sendMessage", {
            "chat_id": destination,
            "text": text[:4000],
            "disable_web_page_preview": True,
        })
    except (OSError, ValueError, RuntimeError, urllib.error.URLError) as exc:
        print(f"Telegram send failed: {exc}", file=sys.stderr)
        return False
    return True


def allowed(env: dict[str, str], chat_id: str, user_id: str) -> bool:
    allowed_chats = csv(env.get("TELEGRAM_ALLOWED_CHAT_IDS", ""))
    default_chat = env.get("TELEGRAM_DEFAULT_CHAT_ID", "").strip()
    if default_chat:
        allowed_chats.add(default_chat)
    if not allowed_chats or chat_id not in allowed_chats:
        return False
    allowed_users = csv(env.get("TELEGRAM_ALLOWED_USER_IDS", ""))
    return not allowed_users or user_id in allowed_users


def service_output() -> str:
    try:
        result = subprocess.run(
            [STATUS_SCRIPT], text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            timeout=20, check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return f"Status check failed: {exc.__class__.__name__}"
    return (result.stdout or "No status output.").strip()[:3500]


def start_deploy() -> str:
    try:
        result = subprocess.run(
            [SUDO, "-n", SYSTEMCTL, "--no-block", "start", "portfolio-auto-deploy.service"],
            text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            timeout=10, check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return f"Deploy queue failed: {exc.__class__.__name__}"
    if result.returncode:
        return "Deploy was not queued. Check the sudoers policy and service logs."
    return "Deploy queued. A completion notification will follow."


def handle_message(env: dict[str, str], message: dict) -> None:
    chat_id = str(message.get("chat", {}).get("id", ""))
    user_id = str(message.get("from", {}).get("id", ""))
    text = str(message.get("text", "")).strip()
    if not text or not allowed(env, chat_id, user_id):
        return

    command = text.split(maxsplit=1)[0].split("@", 1)[0].lower()
    if command == "/deploy":
        reply = start_deploy()
    elif command in {"/status", "/health"}:
        reply = service_output()
    elif command == "/help":
        reply = "Available commands: /deploy, /status, /health"
    else:
        return
    send(env, reply, chat_id)


def run_bot() -> int:
    offset: int | None = None
    while True:
        env = load_env()
        token = env.get("TELEGRAM_BOT_TOKEN", "")
        if not token:
            print("TELEGRAM_BOT_TOKEN is not configured.", file=sys.stderr)
            time.sleep(30)
            continue
        try:
            result = api_request(token, "getUpdates", {
                "offset": offset,
                "timeout": 30,
                "allowed_updates": ["message"],
            })
            for update in result.get("result", []):
                offset = int(update["update_id"]) + 1
                message = update.get("message")
                if isinstance(message, dict):
                    handle_message(env, message)
        except (OSError, ValueError, RuntimeError, urllib.error.URLError) as exc:
            print(f"Telegram polling failed: {exc}", file=sys.stderr)
            time.sleep(10)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=("bot", "send"))
    parser.add_argument("--message")
    args = parser.parse_args()
    if args.action == "bot":
        return run_bot()
    if not args.message:
        parser.error("--message is required for send")
    return 0 if send(load_env(), args.message) else 1


if __name__ == "__main__":
    raise SystemExit(main())
