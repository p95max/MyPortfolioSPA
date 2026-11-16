"""Fuel station and analysis domain models."""

from __future__ import annotations

from dataclasses import dataclass
from statistics import median


@dataclass(frozen=True, slots=True)
class Station:
    station_id: str
    name: str
    brand: str
    street: str
    house_number: str
    postal_code: str
    place: str
    distance_km: float
    price: float
    is_open: bool

    @property
    def display_name(self) -> str:
        return self.brand or self.name or "Unnamed station"

    @property
    def address(self) -> str:
        street = " ".join(part for part in (self.street, self.house_number) if part)
        city = " ".join(part for part in (self.postal_code, self.place) if part)
        return ", ".join(part for part in (street, city) if part)


@dataclass(frozen=True, slots=True)
class PriceAnalysis:
    minimum: float
    median: float
    maximum: float
    spread: float
    saving_for_50l: float

    @classmethod
    def from_stations(cls, stations: list[Station]) -> "PriceAnalysis":
        if not stations:
            raise ValueError("at least one station is required")
        prices = [station.price for station in stations]
        minimum = min(prices)
        maximum = max(prices)
        spread = maximum - minimum
        return cls(
            minimum=minimum,
            median=float(median(prices)),
            maximum=maximum,
            spread=spread,
            saving_for_50l=spread * 50,
        )


@dataclass(frozen=True, slots=True)
class UserPreferences:
    fuel_type: str
    radius_km: int
