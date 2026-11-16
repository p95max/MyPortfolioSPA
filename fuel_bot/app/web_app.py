"""Authenticated HTTP bridge for the Telegram location Mini App."""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import math
import secrets
import time
from collections.abc import Mapping
from urllib.parse import parse_qsl

from aiohttp import web
from telegram import InlineQueryResultLocation
from telegram.error import TelegramError
from telegram.ext import Application


LOGGER = logging.getLogger(__name__)
APPLICATION_KEY: web.AppKey[Application] = web.AppKey("telegram_application")
BOT_TOKEN_KEY: web.AppKey[str] = web.AppKey("bot_token")
MAX_INIT_DATA_AGE_SECONDS = 600


class InvalidInitData(ValueError):
    """Telegram Mini App init data is missing, stale, or has an invalid signature."""


def validate_init_data(
    raw: str,
    bot_token: str,
    *,
    now: int | None = None,
    max_age: int = MAX_INIT_DATA_AGE_SECONDS,
) -> dict[str, str]:
    """Validate Telegram.WebApp.initData according to the official HMAC scheme."""
    if not raw or len(raw) > 8192:
        raise InvalidInitData("invalid init data")

    try:
        values = dict(parse_qsl(raw, keep_blank_values=True, strict_parsing=True))
    except ValueError as exc:
        raise InvalidInitData("invalid init data") from exc
    received_hash = values.pop("hash", "")
    if not received_hash:
        raise InvalidInitData("missing hash")

    data_check_string = "\n".join(
        f"{key}={value}" for key, value in sorted(values.items())
    )
    secret_key = hmac.new(
        b"WebAppData", bot_token.encode(), hashlib.sha256
    ).digest()
    expected_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(received_hash, expected_hash):
        raise InvalidInitData("invalid signature")

    try:
        auth_date = int(values["auth_date"])
    except (KeyError, TypeError, ValueError) as exc:
        raise InvalidInitData("invalid auth date") from exc
    current_time = int(time.time()) if now is None else now
    if auth_date > current_time + 30 or current_time - auth_date > max_age:
        raise InvalidInitData("expired init data")

    if not values.get("query_id"):
        raise InvalidInitData("missing query id")
    try:
        user = json.loads(values["user"])
        user_id = int(user["id"])
    except (KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        raise InvalidInitData("invalid user") from exc
    if user_id <= 0:
        raise InvalidInitData("invalid user")
    return values


def _coordinate(payload: Mapping[str, object], name: str, minimum: float, maximum: float) -> float:
    try:
        value = float(payload[name])
    except (KeyError, TypeError, ValueError) as exc:
        raise ValueError(f"invalid {name}") from exc
    if not math.isfinite(value) or not minimum <= value <= maximum:
        raise ValueError(f"invalid {name}")
    return value


async def health(_: web.Request) -> web.Response:
    return web.json_response({"ok": True})


async def submit_location(request: web.Request) -> web.Response:
    if request.content_length is not None and request.content_length > 16384:
        raise web.HTTPRequestEntityTooLarge(max_size=16384, actual_size=request.content_length)
    try:
        payload = await request.json()
        if not isinstance(payload, dict):
            raise ValueError("invalid payload")
        application = request.app[APPLICATION_KEY]
        values = validate_init_data(
            str(payload.get("init_data", "")), request.app[BOT_TOKEN_KEY]
        )
        latitude = _coordinate(payload, "latitude", -90, 90)
        longitude = _coordinate(payload, "longitude", -180, 180)
        user = json.loads(values["user"])
        user_id = int(user["id"])
    except (InvalidInitData, ValueError, TypeError, json.JSONDecodeError):
        return web.json_response(
            {"ok": False, "error": "Invalid or expired Telegram session."},
            status=401,
        )

    cache = application.bot_data["cache"]
    replay_key = f"fuel:webapp:{user_id}:{values['query_id']}"
    if not await cache.acquire(replay_key, MAX_INIT_DATA_AGE_SECONDS):
        return web.json_response(
            {"ok": False, "error": "This location request was already used."},
            status=409,
        )

    try:
        await application.bot.answer_web_app_query(
            web_app_query_id=values["query_id"],
            result=InlineQueryResultLocation(
                id=secrets.token_urlsafe(12),
                latitude=latitude,
                longitude=longitude,
                title="Shared location",
            ),
        )
    except TelegramError as exc:
        LOGGER.warning("Telegram rejected Mini App location: %s", type(exc).__name__)
        return web.json_response(
            {"ok": False, "error": "Telegram could not accept the location."},
            status=502,
        )

    return web.json_response({"ok": True})


def create_web_app(application: Application, bot_token: str) -> web.Application:
    app = web.Application(client_max_size=16384)
    app[APPLICATION_KEY] = application
    app[BOT_TOKEN_KEY] = bot_token
    app.add_routes(
        [
            web.get("/health", health),
            web.post("/location", submit_location),
        ]
    )
    return app


async def start_web_app_server(
    application: Application, *, bot_token: str, port: int
) -> web.AppRunner:
    runner = web.AppRunner(
        create_web_app(application, bot_token),
        access_log=None,
    )
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", port)
    await site.start()
    LOGGER.info("Telegram Mini App bridge listening on port %d", port)
    return runner
