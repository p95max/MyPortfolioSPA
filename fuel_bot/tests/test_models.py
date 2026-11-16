import pytest

from app.models import PriceAnalysis, Station


def station(price: float) -> Station:
    return Station(
        station_id="id",
        name="Station",
        brand="Brand",
        street="Street",
        house_number="1",
        postal_code="09111",
        place="Chemnitz",
        distance_km=1.0,
        price=price,
        is_open=True,
    )


def test_price_analysis() -> None:
    analysis = PriceAnalysis.from_stations(
        [station(1.519), station(1.529), station(1.579)]
    )

    assert analysis.minimum == pytest.approx(1.519)
    assert analysis.median == pytest.approx(1.529)
    assert analysis.spread == pytest.approx(0.060)
    assert analysis.saving_for_50l == pytest.approx(3.0)
