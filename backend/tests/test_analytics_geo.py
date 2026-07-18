from types import SimpleNamespace
from unittest.mock import Mock, patch

import pytest
import requests
from django.test import override_settings

from api.analytics_geo import lookup_analytics_country


def make_request(*, cloudflare_client_ip="", forwarded_for="", remote_addr=""):
    return SimpleNamespace(
        META={
            "HTTP_CF_CONNECTING_IP": cloudflare_client_ip,
            "HTTP_X_FORWARDED_FOR": forwarded_for,
            "REMOTE_ADDR": remote_addr,
        }
    )


@override_settings(
    ANALYTICS_GEOIP_LOOKUP_ENABLED=True,
    ANALYTICS_GEOIP_LOOKUP_URL="https://api.country.is/{ip}",
    ANALYTICS_GEOIP_TIMEOUT_SECONDS=1.5,
)
def test_country_lookup_uses_last_public_forwarded_address():
    response = Mock()
    response.raise_for_status.return_value = None
    response.json.return_value = {"country": "de"}

    with patch("api.analytics_geo.requests.get", return_value=response) as get_mock:
        country = lookup_analytics_country(
            make_request(
                forwarded_for="198.51.100.10, 8.8.8.8",
                remote_addr="10.0.0.5",
            )
        )

    assert country == "DE"
    get_mock.assert_called_once_with(
        "https://api.country.is/8.8.8.8",
        headers={
            "Accept": "application/json",
            "User-Agent": "PortfolioAnalytics/1.0",
        },
        timeout=1.5,
    )


@override_settings(
    ANALYTICS_GEOIP_LOOKUP_ENABLED=True,
    ANALYTICS_GEOIP_LOOKUP_URL="https://api.country.is/{ip}",
)
def test_country_lookup_prefers_cloudflare_connecting_ip():
    response = Mock()
    response.raise_for_status.return_value = None
    response.json.return_value = {"country": "de"}

    with patch("api.analytics_geo.requests.get", return_value=response) as get_mock:
        country = lookup_analytics_country(
            make_request(
                cloudflare_client_ip="8.8.8.8",
                forwarded_for="1.1.1.1, 9.9.9.9",
            )
        )

    assert country == "DE"
    assert get_mock.call_args.args[0] == "https://api.country.is/8.8.8.8"


@override_settings(ANALYTICS_GEOIP_LOOKUP_ENABLED=False)
def test_country_lookup_is_disabled_by_default():
    with patch("api.analytics_geo.requests.get") as get_mock:
        assert lookup_analytics_country(make_request(remote_addr="8.8.8.8")) == ""

    get_mock.assert_not_called()


@override_settings(ANALYTICS_GEOIP_LOOKUP_ENABLED=True)
@pytest.mark.parametrize(
    "side_effect",
    [requests.Timeout("timeout"), ValueError("invalid json")],
)
def test_country_lookup_fails_without_breaking_analytics(side_effect):
    with patch("api.analytics_geo.requests.get", side_effect=side_effect):
        assert lookup_analytics_country(make_request(remote_addr="8.8.8.8")) == ""
