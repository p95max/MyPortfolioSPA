"""Telegram-safe fuel-price report formatting."""

from __future__ import annotations

from html import escape

from .models import PriceAnalysis, Station


FUEL_LABELS = {"diesel": "Дизель", "e5": "Super E5", "e10": "Super E10"}


def format_price_report(
    stations: list[Station], *, fuel_type: str, radius_km: int, title: str
) -> str:
    open_stations = [station for station in stations if station.is_open]
    available = open_stations or stations
    if not available:
        return (
            f"⛽ <b>{escape(title)}</b>\n\n"
            "В выбранном радиусе нет АЗС с доступной ценой.\n\n"
            "Данные: <a href=\"https://www.tankerkoenig.de\">Tankerkönig</a> / MTS-K, CC BY 4.0"
        )

    analysis = PriceAnalysis.from_stations(available)
    shown = available[:5]
    lines = [
        f"⛽ <b>{escape(FUEL_LABELS[fuel_type])} · {escape(title)}</b>",
        f"Радиус: {radius_km} км · АЗС с ценой: {len(available)}",
        "",
    ]
    for index, station in enumerate(shown, start=1):
        state = "" if station.is_open else " · возможно закрыта"
        lines.extend(
            [
                f"<b>{index}. {escape(station.display_name)}</b>",
                f"{station.price:.3f} €/л · {station.distance_km:.1f} км{state}",
                escape(station.address),
                "",
            ]
        )

    lines.extend(
        [
            "📊 <b>Короткий анализ</b>",
            f"Медиана: {analysis.median:.3f} €/л",
            f"Разброс: {analysis.spread:.3f} €/л",
            f"Экономия между минимумом и максимумом на 50 л: {analysis.saving_for_50l:.2f} €",
            "",
            "Показаны 5 самых дешёвых вариантов по вашему запросу.",
            "Данные: <a href=\"https://www.tankerkoenig.de\">Tankerkönig</a> / MTS-K, CC BY 4.0",
        ]
    )
    return "\n".join(lines)
