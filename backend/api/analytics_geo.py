import ipaddress
import logging

import requests
from django.conf import settings


logger = logging.getLogger(__name__)


def _valid_country_code(value: object) -> str:
    country = str(value or "").strip().upper()

    if len(country) == 2 and country.isalpha():
        return country

    return ""


def _get_public_client_ip(request) -> str:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    forwarded_candidates = [
        part.strip() for part in forwarded_for.split(",") if part.strip()
    ]
    candidates = list(reversed(forwarded_candidates))

    if request.META.get("REMOTE_ADDR"):
        candidates.append(request.META["REMOTE_ADDR"].strip())

    for candidate in candidates:
        try:
            address = ipaddress.ip_address(candidate)
        except ValueError:
            continue

        if address.is_global:
            return str(address)

    return ""


def lookup_analytics_country(request) -> str:
    if not getattr(settings, "ANALYTICS_GEOIP_LOOKUP_ENABLED", False):
        return ""

    client_ip = _get_public_client_ip(request)
    if not client_ip:
        return ""

    url_template = getattr(
        settings,
        "ANALYTICS_GEOIP_LOOKUP_URL",
        "https://api.country.is/{ip}",
    )

    try:
        response = requests.get(
            url_template.format(ip=client_ip),
            headers={
                "Accept": "application/json",
                "User-Agent": "PortfolioAnalytics/1.0",
            },
            timeout=getattr(settings, "ANALYTICS_GEOIP_TIMEOUT_SECONDS", 1.5),
        )
        response.raise_for_status()
        return _valid_country_code(response.json().get("country"))
    except (requests.RequestException, ValueError, AttributeError, KeyError):
        logger.warning("Analytics country lookup failed", exc_info=True)
        return ""
