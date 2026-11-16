from app.handlers import ABOUT


def test_about_explains_personal_data_in_german() -> None:
    assert len(ABOUT) < 4096
    assert "Telegram-ID" in ABOUT
    assert "360 Sekunden" in ABOUT
    assert "5 Minuten" in ABOUT
    assert "gerundete Koordinaten" in ABOUT
    assert "nicht an Tankerkönig übermittelt" in ABOUT
    assert "/delete_me" in ABOUT
