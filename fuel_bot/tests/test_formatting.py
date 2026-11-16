from app.formatting import format_price_report
from app.models import Station


def test_price_report_uses_english_interface() -> None:
    station = Station(
        station_id="station-id",
        name="Example Station",
        brand="Example",
        street="Main Street",
        house_number="1",
        postal_code="09111",
        place="Chemnitz",
        distance_km=1.2,
        price=1.599,
        is_open=True,
    )

    report = format_price_report(
        [station], fuel_type="diesel", radius_km=8, title="Chemnitz"
    )

    assert "Diesel · Chemnitz" in report
    assert "Radius: 8 km" in report
    assert "Quick analysis" in report
    assert "Data:" in report
