from types import SimpleNamespace
from unittest.mock import Mock, patch

import pytest
import requests
from django.core import mail
from django.core.cache import cache
from django.db import DatabaseError
from django.test import override_settings
from rest_framework.test import APIClient

from api.analytics_notifications import notify_new_analytics_visitor
from api.models import AnalyticsEvent, ContactMessage
from api.throttles import (
    AnalyticsGlobalThrottle,
    ContactEmailThrottle,
    ContactMessageFingerprintThrottle,
    ContactSubnetThrottle,
)
from api.views import _check_turnstile


pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def api_client():
    return APIClient()


def contact_payload(**overrides):
    payload = {
        "name": "John Doe",
        "email": "john@example.com",
        "message": "Hello, I want to contact you about your portfolio project.",
        "cf_turnstile_token": "valid-token",
        "hp": "",
    }
    payload.update(overrides)
    return payload


def make_event(**overrides):
    values = {
        "event_type": AnalyticsEvent.EVENT_PAGE_VIEW,
        "path": "/",
        "source_type": "linkedin",
        "anonymous_id": "visitor-123",
        "session_id": "session-123",
        "country": "DE",
        "device_type": "desktop",
        "browser": "Chrome",
        "os": "Linux",
        "language": "de-DE",
    }
    values.update(overrides)
    return AnalyticsEvent.objects.create(**values)


def test_health_endpoint_reports_database_readiness(api_client):
    response = api_client.get("/api/health/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_endpoint_returns_service_unavailable_when_database_fails(api_client):
    with patch("api.views.connection.cursor", side_effect=DatabaseError("database down")):
        response = api_client.get("/api/health/")

    assert response.status_code == 503
    assert response.json() == {"status": "error"}


# Turnstile verification


@override_settings(TURNSTILE_SECRET="")
def test_turnstile_fails_closed_without_secret():
    with patch("api.views.requests.post") as post_mock:
        assert _check_turnstile("token", "127.0.0.1") is False

    post_mock.assert_not_called()


@override_settings(TURNSTILE_SECRET="secret")
def test_turnstile_fails_closed_without_token():
    with patch("api.views.requests.post") as post_mock:
        assert _check_turnstile(None, "127.0.0.1") is False

    post_mock.assert_not_called()


@override_settings(TURNSTILE_SECRET="secret")
def test_turnstile_returns_cloudflare_success_value():
    response = Mock()
    response.raise_for_status.return_value = None
    response.json.return_value = {"success": True}

    with patch("api.views.requests.post", return_value=response) as post_mock:
        assert _check_turnstile("token", "203.0.113.10") is True

    post_mock.assert_called_once_with(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        data={
            "secret": "secret",
            "response": "token",
            "remoteip": "203.0.113.10",
        },
        timeout=2,
    )


@override_settings(TURNSTILE_SECRET="secret")
def test_turnstile_fails_closed_on_request_error():
    with patch(
        "api.views.requests.post",
        side_effect=requests.Timeout("cloudflare timeout"),
    ):
        assert _check_turnstile("token", "127.0.0.1") is False


@override_settings(TURNSTILE_SECRET="secret")
def test_turnstile_fails_closed_on_invalid_json():
    response = Mock()
    response.raise_for_status.return_value = None
    response.json.side_effect = ValueError("invalid json")

    with patch("api.views.requests.post", return_value=response):
        assert _check_turnstile("token", "127.0.0.1") is False


# Contact failure paths


@override_settings(
    TURNSTILE_SECRET="secret",
    NOTIFY_EMAILS=["owner@example.com"],
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
def test_contact_database_failure_returns_safe_500(api_client):
    with patch("api.views._check_turnstile", return_value=True):
        with patch(
            "api.views.ContactMessageSerializer.save",
            side_effect=DatabaseError("database unavailable"),
        ):
            response = api_client.post(
                "/api/contact/",
                contact_payload(),
                format="json",
            )

    assert response.status_code == 500
    assert response.json() == {"error": "Could not process your message."}
    assert ContactMessage.objects.count() == 0
    assert len(mail.outbox) == 0


@override_settings(
    TURNSTILE_SECRET="secret",
    NOTIFY_EMAILS=[],
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
def test_contact_succeeds_when_notification_recipients_are_missing(api_client):
    with patch("api.views._check_turnstile", return_value=True):
        response = api_client.post(
            "/api/contact/",
            contact_payload(),
            format="json",
        )

    assert response.status_code == 201
    assert ContactMessage.objects.count() == 1
    assert len(mail.outbox) == 0


# Analytics notifications


@override_settings(
    ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=True,
    ANALYTICS_NOTIFY_DIRECT_VISITORS=False,
    NOTIFY_EMAILS=["owner@example.com"],
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    BACKEND_BASE_URL="http://testserver",
)
def test_first_analytics_visitor_sends_one_email_only():
    event = make_event()

    notify_new_analytics_visitor(event)
    notify_new_analytics_visitor(event)

    assert len(mail.outbox) == 1
    assert mail.outbox[0].to == ["owner@example.com"]
    assert "New visitor" in mail.outbox[0].subject
    assert "visitor-123" in mail.outbox[0].body


@override_settings(
    ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=True,
    ANALYTICS_NOTIFY_DIRECT_VISITORS=False,
    NOTIFY_EMAILS=["owner@example.com"],
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
def test_direct_analytics_visitor_is_ignored_by_default():
    event = make_event(source_type="direct")

    notify_new_analytics_visitor(event)

    assert len(mail.outbox) == 0


@override_settings(
    ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=True,
    ANALYTICS_NOTIFY_DIRECT_VISITORS=True,
    NOTIFY_EMAILS=["owner@example.com"],
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    BACKEND_BASE_URL="http://testserver",
)
def test_direct_analytics_visitor_can_be_enabled():
    event = make_event(source_type="direct")

    notify_new_analytics_visitor(event)

    assert len(mail.outbox) == 1


@override_settings(
    ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=True,
    NOTIFY_EMAILS=["owner@example.com"],
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
def test_existing_analytics_visitor_does_not_send_email():
    make_event(pk=None, session_id="old-session")
    event = make_event(session_id="new-session")

    notify_new_analytics_visitor(event)

    assert len(mail.outbox) == 0


@override_settings(
    ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=True,
    NOTIFY_EMAILS=[],
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
def test_analytics_notification_skips_when_recipients_are_missing():
    event = make_event()

    notify_new_analytics_visitor(event)

    assert len(mail.outbox) == 0


# Geo headers and throttle identities


@override_settings(TRUST_ANALYTICS_GEO_HEADERS=True)
def test_analytics_uses_fallback_country_header(api_client):
    response = api_client.post(
        "/api/analytics/",
        {
            "event_type": "page_view",
            "path": "/",
            "anonymous_id": "geo-visitor",
        },
        format="json",
        HTTP_X_COUNTRY_CODE="de",
    )

    assert response.status_code == 201
    assert AnalyticsEvent.objects.get(anonymous_id="geo-visitor").country == "DE"


@override_settings(TRUST_ANALYTICS_GEO_HEADERS=True)
def test_analytics_rejects_invalid_country_header(api_client):
    response = api_client.post(
        "/api/analytics/",
        {
            "event_type": "page_view",
            "path": "/",
            "anonymous_id": "invalid-geo-visitor",
        },
        format="json",
        HTTP_CF_IPCOUNTRY="DEU",
        HTTP_X_COUNTRY_CODE="1A",
    )

    assert response.status_code == 201
    assert AnalyticsEvent.objects.get(anonymous_id="invalid-geo-visitor").country == ""


def test_contact_email_throttle_normalizes_email_identity():
    throttle = ContactEmailThrottle()
    request = SimpleNamespace(data={"email": "  JOHN@Example.COM  "})

    key = throttle.get_cache_key(request, view=None)

    assert key.endswith("contact:john@example.com")


def test_contact_fingerprint_throttle_normalizes_message_identity():
    throttle = ContactMessageFingerprintThrottle()
    first = SimpleNamespace(data={"message": "  Hello World  "})
    second = SimpleNamespace(data={"message": "hello world"})

    assert throttle.get_cache_key(first, view=None) == throttle.get_cache_key(
        second,
        view=None,
    )


def test_contact_subnet_throttle_groups_ipv4_addresses_by_24():
    throttle = ContactSubnetThrottle()
    first = SimpleNamespace(
        data={},
        META={"REMOTE_ADDR": "203.0.113.10"},
    )
    second = SimpleNamespace(
        data={},
        META={"REMOTE_ADDR": "203.0.113.250"},
    )

    assert throttle.get_cache_key(first, view=None) == throttle.get_cache_key(
        second,
        view=None,
    )


def test_contact_subnet_throttle_groups_ipv6_addresses_by_48():
    throttle = ContactSubnetThrottle()
    first = SimpleNamespace(
        data={},
        META={"REMOTE_ADDR": "2001:db8:abcd:1::1"},
    )
    second = SimpleNamespace(
        data={},
        META={"REMOTE_ADDR": "2001:db8:abcd:ffff::1"},
    )

    assert throttle.get_cache_key(first, view=None) == throttle.get_cache_key(
        second,
        view=None,
    )


def test_analytics_global_throttle_has_one_shared_key():
    throttle = AnalyticsGlobalThrottle()

    first = throttle.get_cache_key(SimpleNamespace(data={}), view=None)
    second = throttle.get_cache_key(SimpleNamespace(data={}), view=None)

    assert first == second
    assert first.endswith("analytics_global")
