import pytest

from app.config import Config


def test_config_accepts_missing_tankerkoenig_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "telegram-token")
    monkeypatch.delenv("TANKERKOENIG_API_KEY", raising=False)

    config = Config.from_env()

    assert config.tankerkoenig_api_key is None
    assert config.default_fuel_type == "diesel"
    assert config.default_radius_km == 8


def test_config_rejects_radius_over_api_limit(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TELEGRAM_BOT_TOKEN", "telegram-token")
    monkeypatch.setenv("DEFAULT_RADIUS_KM", "26")

    with pytest.raises(ValueError, match="must not exceed 25"):
        Config.from_env()
