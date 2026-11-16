from app.tankerkoenig import TankerkoenigClient


def test_parse_stations_filters_missing_prices_and_sorts() -> None:
    stations = TankerkoenigClient._parse_stations(
        [
            {"id": "closed", "name": "B", "price": 1.65, "dist": 2, "isOpen": False},
            {"id": "missing", "name": "C", "price": False, "dist": 1, "isOpen": True},
            {"id": "cheap", "name": "A", "price": 1.55, "dist": 3, "isOpen": True},
        ]
    )

    assert [item.station_id for item in stations] == ["cheap", "closed"]
