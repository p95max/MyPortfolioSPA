"""Rate-limited, cached Tankerkönig API client."""

from __future__ import annotations

import logging
from dataclasses import asdict
from typing import Any

import httpx

from .cache import Cache
from .models import Station


LOGGER = logging.getLogger(__name__)


class TankerkoenigError(RuntimeError):
    """The upstream API failed or returned an invalid response."""


class UpstreamRateLimited(TankerkoenigError):
    """A different uncached request used the shared upstream time slot."""


class TankerkoenigClient:
    def __init__(
        self,
        *,
        api_key: str,
        api_url: str,
        cache: Cache,
        cache_ttl: int,
        upstream_interval: int,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        self._api_key = api_key
        self._api_url = api_url
        self._cache = cache
        self._cache_ttl = cache_ttl
        self._upstream_interval = upstream_interval
        self._http = http_client or httpx.AsyncClient(
            timeout=httpx.Timeout(10.0),
            headers={"User-Agent": "ChemnitzFuelBot/0.1"},
        )
        self._owns_http_client = http_client is None

    @staticmethod
    def _cache_key(lat: float, lng: float, radius_km: int, fuel_type: str) -> str:
        # Roughly 110 m precision avoids storing exact Telegram locations and
        # lets nearby users share a cached response.
        return f"fuel:search:{lat:.3f}:{lng:.3f}:{radius_km}:{fuel_type}"

    async def search(
        self, *, lat: float, lng: float, radius_km: int, fuel_type: str
    ) -> list[Station]:
        cache_key = self._cache_key(lat, lng, radius_km, fuel_type)
        cached = await self._cache.get_json(cache_key)
        if cached is not None:
            return [Station(**item) for item in cached]

        acquired = await self._cache.acquire(
            "fuel:upstream:global", self._upstream_interval
        )
        if not acquired:
            raise UpstreamRateLimited(
                "Tankerkönig request window is currently in use"
            )

        try:
            response = await self._http.get(
                self._api_url,
                params={
                    "lat": lat,
                    "lng": lng,
                    "rad": radius_km,
                    "sort": "price",
                    "type": fuel_type,
                    "apikey": self._api_key,
                },
            )
            response.raise_for_status()
            payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            LOGGER.warning("Tankerkönig request failed: %s", type(exc).__name__)
            raise TankerkoenigError("Tankerkönig is temporarily unavailable") from exc

        if not isinstance(payload, dict) or not payload.get("ok"):
            message = payload.get("message", "unknown API error") if isinstance(payload, dict) else "invalid response"
            LOGGER.warning("Tankerkönig rejected a request: %s", message)
            raise TankerkoenigError(str(message))

        stations = self._parse_stations(payload.get("stations"))
        await self._cache.set_json(
            cache_key,
            [asdict(station) for station in stations],
            self._cache_ttl,
        )
        return stations

    @staticmethod
    def _parse_stations(raw_stations: Any) -> list[Station]:
        if not isinstance(raw_stations, list):
            return []

        stations: list[Station] = []
        for raw in raw_stations:
            if not isinstance(raw, dict):
                continue
            price = raw.get("price")
            distance = raw.get("dist")
            if (
                isinstance(price, bool)
                or not isinstance(price, (int, float))
                or price <= 0
            ):
                continue
            try:
                distance_km = float(distance)
            except (TypeError, ValueError):
                continue

            stations.append(
                Station(
                    station_id=str(raw.get("id") or ""),
                    name=str(raw.get("name") or ""),
                    brand=str(raw.get("brand") or ""),
                    street=str(raw.get("street") or ""),
                    house_number=str(raw.get("houseNumber") or ""),
                    postal_code=str(raw.get("postCode") or ""),
                    place=str(raw.get("place") or ""),
                    distance_km=distance_km,
                    price=float(price),
                    is_open=bool(raw.get("isOpen", False)),
                )
            )
        return sorted(stations, key=lambda station: station.price)

    async def close(self) -> None:
        if self._owns_http_client:
            await self._http.aclose()
