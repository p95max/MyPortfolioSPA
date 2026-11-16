import hashlib
import hmac
import json
import time
from types import SimpleNamespace
from unittest.mock import AsyncMock
from urllib.parse import urlencode

import pytest
from aiohttp.test_utils import TestClient, TestServer

from app.cache import MemoryCache
from app.web_app import InvalidInitData, create_web_app, validate_init_data


BOT_TOKEN = "123456:test-token"


def _signed_init_data(*, auth_date: int = 1_700_000_000) -> str:
    values = {
        "auth_date": str(auth_date),
        "query_id": "query-123",
        "user": json.dumps({"id": 123, "first_name": "Test"}, separators=(",", ":")),
    }
    data_check_string = "\n".join(
        f"{key}={value}" for key, value in sorted(values.items())
    )
    secret = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
    values["hash"] = hmac.new(
        secret, data_check_string.encode(), hashlib.sha256
    ).hexdigest()
    return urlencode(values)


def test_validate_init_data_accepts_recent_signed_payload() -> None:
    values = validate_init_data(
        _signed_init_data(), BOT_TOKEN, now=1_700_000_100
    )

    assert values["query_id"] == "query-123"
    assert json.loads(values["user"])["id"] == 123


def test_validate_init_data_rejects_tampering() -> None:
    tampered = _signed_init_data().replace("query-123", "query-999")

    with pytest.raises(InvalidInitData, match="invalid signature"):
        validate_init_data(tampered, BOT_TOKEN, now=1_700_000_100)


def test_validate_init_data_rejects_expired_payload() -> None:
    with pytest.raises(InvalidInitData, match="expired"):
        validate_init_data(
            _signed_init_data(), BOT_TOKEN, now=1_700_001_000
        )


@pytest.mark.asyncio
async def test_location_endpoint_returns_location_through_telegram() -> None:
    application = SimpleNamespace(
        bot=SimpleNamespace(answer_web_app_query=AsyncMock()),
        bot_data={"cache": MemoryCache()},
    )
    client = TestClient(TestServer(create_web_app(application, BOT_TOKEN)))
    await client.start_server()
    try:
        response = await client.post(
            "/location",
            json={
                "init_data": _signed_init_data(auth_date=int(time.time())),
                "latitude": 50.8278,
                "longitude": 12.9214,
            },
        )
        assert response.status == 200
        assert await response.json() == {"ok": True}
        call = application.bot.answer_web_app_query.await_args
        assert call.kwargs["web_app_query_id"] == "query-123"
        assert call.kwargs["result"].latitude == 50.8278
        assert call.kwargs["result"].longitude == 12.9214

        replay = await client.post(
            "/location",
            json={
                "init_data": _signed_init_data(auth_date=int(time.time())),
                "latitude": 50.8278,
                "longitude": 12.9214,
            },
        )
        assert replay.status == 409
    finally:
        await client.close()
