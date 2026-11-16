"""Environment-based application configuration."""

from __future__ import annotations

import os
from dataclasses import dataclass


FUEL_TYPES = ("diesel", "e5", "e10")


def _int_env(name: str, default: int, minimum: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer") from exc
    if value < minimum:
        raise ValueError(f"{name} must be at least {minimum}")
    return value


def _float_env(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return float(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be a number") from exc


@dataclass(frozen=True, slots=True)
class Config:
    telegram_bot_token: str
    tankerkoenig_api_key: str | None
    redis_url: str
    chemnitz_lat: float
    chemnitz_lng: float
    default_radius_km: int
    default_fuel_type: str
    cache_ttl_seconds: int
    upstream_interval_seconds: int
    user_rate_limit: int
    user_rate_window_seconds: int
    web_app_url: str
    web_app_port: int
    log_level: str
    api_url: str = "https://creativecommons.tankerkoenig.de/json/list.php"

    @classmethod
    def from_env(cls) -> "Config":
        token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
        if not token:
            raise ValueError("TELEGRAM_BOT_TOKEN is required")

        api_key = os.getenv("TANKERKOENIG_API_KEY", "").strip() or None
        fuel_type = os.getenv("DEFAULT_FUEL_TYPE", "diesel").strip().lower()
        if fuel_type not in FUEL_TYPES:
            raise ValueError("DEFAULT_FUEL_TYPE must be diesel, e5, or e10")

        radius = _int_env("DEFAULT_RADIUS_KM", 5, 1)
        if radius > 25:
            raise ValueError("DEFAULT_RADIUS_KM must not exceed 25")

        web_app_url = os.getenv(
            "LOCATION_WEB_APP_URL",
            "https://p95max.dev/fuel-location/",
        ).strip()
        if not web_app_url.startswith("https://"):
            raise ValueError("LOCATION_WEB_APP_URL must use HTTPS")

        return cls(
            telegram_bot_token=token,
            tankerkoenig_api_key=api_key,
            redis_url=os.getenv("REDIS_URL", "redis://redis:6379/1").strip(),
            chemnitz_lat=_float_env("CHEMNITZ_LAT", 50.8278),
            chemnitz_lng=_float_env("CHEMNITZ_LNG", 12.9214),
            default_radius_km=radius,
            default_fuel_type=fuel_type,
            cache_ttl_seconds=_int_env("CACHE_TTL_SECONDS", 300, 60),
            upstream_interval_seconds=_int_env(
                "UPSTREAM_INTERVAL_SECONDS", 61, 60
            ),
            user_rate_limit=_int_env("USER_RATE_LIMIT", 10, 1),
            user_rate_window_seconds=_int_env(
                "USER_RATE_WINDOW_SECONDS", 360, 1
            ),
            web_app_url=web_app_url,
            web_app_port=_int_env("WEB_APP_PORT", 8081, 1),
            log_level=os.getenv("LOG_LEVEL", "INFO").strip().upper(),
        )
