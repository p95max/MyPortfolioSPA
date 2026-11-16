from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.handlers import nearby


@pytest.mark.asyncio
async def test_nearby_requests_location_in_private_chat() -> None:
    message = SimpleNamespace(reply_text=AsyncMock())
    update = SimpleNamespace(
        effective_message=message,
        effective_chat=SimpleNamespace(type="private"),
    )
    context = SimpleNamespace(
        bot=SimpleNamespace(username="chemnitz_fuel_bot"),
        application=SimpleNamespace(
            bot_data={
                "config": SimpleNamespace(
                    web_app_url="https://p95max.dev/fuel-location/"
                )
            }
        ),
    )

    await nearby(update, context)

    message.reply_text.assert_awaited_once()
    keyboard = message.reply_text.await_args.kwargs["reply_markup"]
    button = keyboard.inline_keyboard[0][0]
    assert button.web_app.url == "https://p95max.dev/fuel-location/"
    assert button.text == "🖥 Share location on Desktop"
    assert "Telegram Desktop" in message.reply_text.await_args.args[0]


@pytest.mark.asyncio
async def test_nearby_explains_private_chat_requirement_in_group() -> None:
    message = SimpleNamespace(reply_text=AsyncMock())
    update = SimpleNamespace(
        effective_message=message,
        effective_chat=SimpleNamespace(type="group"),
    )
    context = SimpleNamespace(bot=SimpleNamespace(username="chemnitz_fuel_bot"))

    await nearby(update, context)

    message.reply_text.assert_awaited_once()
    text = message.reply_text.await_args.args[0]
    assert "only in private chats" in text
    assert "@chemnitz_fuel_bot" in text
    assert "reply_markup" not in message.reply_text.await_args.kwargs
