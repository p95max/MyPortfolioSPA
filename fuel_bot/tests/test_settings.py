from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.handlers import SETTINGS_RADIUS_OPTIONS, settings_keyboard, settings_text, start
from app.models import UserPreferences


def test_settings_keyboard_contains_fuel_and_radius_choices() -> None:
    preferences = UserPreferences(fuel_type="diesel", radius_km=5)

    keyboard = settings_keyboard(preferences, user_id=123)
    buttons = [button for row in keyboard.inline_keyboard for button in row]
    callback_data = {button.callback_data for button in buttons}

    assert len(buttons) == 9
    assert "settings:123:fuel:diesel" in callback_data
    assert {
        f"settings:123:radius:{radius}" for radius in SETTINGS_RADIUS_OPTIONS
    }.issubset(callback_data)
    assert any(button.text == "✅ Diesel" for button in buttons)
    assert any(button.text == "✅ 5 km" for button in buttons)


def test_settings_text_shows_current_selection() -> None:
    text = settings_text(UserPreferences(fuel_type="e10", radius_km=10))

    assert "Fuel: Super E10" in text
    assert "Radius: 10 km" in text


@pytest.mark.asyncio
async def test_start_immediately_shows_settings_choices() -> None:
    cache = SimpleNamespace(get_json=AsyncMock(return_value=None))
    message = SimpleNamespace(reply_text=AsyncMock())
    update = SimpleNamespace(
        effective_message=message,
        effective_user=SimpleNamespace(id=123),
    )
    context = SimpleNamespace(
        application=SimpleNamespace(
            bot_data={
                "config": SimpleNamespace(
                    default_fuel_type="diesel", default_radius_km=5
                ),
                "cache": cache,
                "tankerkoenig": None,
            }
        )
    )

    await start(update, context)

    message.reply_text.assert_awaited_once()
    text = message.reply_text.await_args.args[0]
    keyboard = message.reply_text.await_args.kwargs["reply_markup"]
    callback_data = {
        button.callback_data
        for row in keyboard.inline_keyboard
        for button in row
    }
    assert "Current settings" in text
    assert "settings:123:fuel:diesel" in callback_data
    assert "settings:123:radius:25" in callback_data
