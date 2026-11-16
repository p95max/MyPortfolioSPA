import pytest

from app.config import Config


def test_config_accepts_missing_tankerkoenig_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "telegram-token")
    monkeypatch.delenv("TANKERKOENIG_API_KEY", raising=False)
    monkeypatch.delenv("USER_RATE_WINDOW_SECONDS", raising=False)

    config = Config.from_env()

    assert config.tankerkoenig_api_key is None
    assert config.default_fuel_type == "diesel"
    assert config.default_radius_km == 5
    assert config.user_rate_window_seconds == 360
    assert config.web_app_url == "https://p95max.dev/fuel-location/"
    assert config.web_app_port == 8081


def test_config_rejects_radius_over_api_limit(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "telegram-token")
    monkeypatch.setenv("DEFAULT_RADIUS_KM", "26")

    with pytest.raises(ValueError, match="must not exceed 25"):
        Config.from_env()


def test_config_requires_https_web_app_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "telegram-token")
    monkeypatch.setenv("LOCATION_WEB_APP_URL", "http://example.test/location")

    with pytest.raises(ValueError, match="must use HTTPS"):
        Config.from_env()
