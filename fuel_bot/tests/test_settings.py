from app.handlers import SETTINGS_RADIUS_OPTIONS, settings_keyboard, settings_text
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
