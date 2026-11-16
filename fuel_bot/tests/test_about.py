from app.handlers import ABOUT, PRICE_SOURCE_UNAVAILABLE


def test_about_explains_personal_data_in_german() -> None:
    assert len(ABOUT) < 4096
    assert "Telegram-ID" in ABOUT
    assert "360 Sekunden" in ABOUT
    assert "5 Minuten" in ABOUT
    assert "gerundete Koordinaten" in ABOUT
    assert "Mini App" in ABOUT
    assert "Telegram Desktop" in ABOUT
    assert "native Telegram-Standortbutton" in ABOUT
    assert "nicht an Tankerkönig übermittelt" in ABOUT
    assert "/delete_me" in ABOUT
    assert "👨‍💻 Entwickler: @p95max" in ABOUT
    for section_emoji in ("📥", "💾", "🚫", "🔄", "🗑️", "⛽"):
        assert section_emoji in ABOUT


def test_unavailable_message_does_not_expose_implementation_details() -> None:
    assert "temporarily unavailable" in PRICE_SOURCE_UNAVAILABLE
    assert "API" not in PRICE_SOURCE_UNAVAILABLE
    assert "key" not in PRICE_SOURCE_UNAVAILABLE.lower()
    assert "administrator" not in PRICE_SOURCE_UNAVAILABLE.lower()
