"""Telegram-safe fuel-price report formatting."""

from __future__ import annotations

from html import escape

from .models import PriceAnalysis, Station


FUEL_LABELS = {"diesel": "Diesel", "e5": "Super E5", "e10": "Super E10"}


def format_price_report(
    stations: list[Station], *, fuel_type: str, radius_km: int, title: str
) -> str:
    open_stations = [station for station in stations if station.is_open]
    available = open_stations or stations
    if not available:
        return (
            f"⛽ <b>{escape(title)}</b>\n\n"
            "No stations with an available price were found within this radius.\n\n"
            "Data: <a href=\"https://www.tankerkoenig.de\">Tankerkönig</a> / MTS-K, CC BY 4.0"
        )

    analysis = PriceAnalysis.from_stations(available)
    shown = available[:5]
    lines = [
        f"⛽ <b>{escape(FUEL_LABELS[fuel_type])} · {escape(title)}</b>",
        f"Radius: {radius_km} km · Stations with prices: {len(available)}",
        "",
    ]
    for index, station in enumerate(shown, start=1):
        state = "" if station.is_open else " · possibly closed"
        lines.extend(
            [
                f"<b>{index}. {escape(station.display_name)}</b>",
                f"{station.price:.3f} €/L · {station.distance_km:.1f} km{state}",
                escape(station.address),
                "",
            ]
        )

    lines.extend(
        [
            "📊 <b>Quick analysis</b>",
            f"Median: {analysis.median:.3f} €/L",
            f"Price spread: {analysis.spread:.3f} €/L",
            f"Potential saving between the lowest and highest price for 50 L: {analysis.saving_for_50l:.2f} €",
            "",
            "Showing the 5 cheapest options matching your request.",
            "Data: <a href=\"https://www.tankerkoenig.de\">Tankerkönig</a> / MTS-K, CC BY 4.0",
        ]
    )
    return "\n".join(lines)
