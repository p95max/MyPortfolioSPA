from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.cache import cache
from django.test import Client, override_settings
from django.urls import reverse
from rest_framework.settings import api_settings
from rest_framework.test import APIClient

from api.analytics_notifications import notify_new_analytics_visitor
from api.checks import production_security_checks
from api.models import AnalyticsEvent, ContactMessage
from api.throttles import AnalyticsThrottle, ContactEmailThrottle


pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def clear_cache_between_tests():
    cache.clear()
    yield
    cache.clear()


def contact_payload(email="john@example.com", message="A valid contact message for testing."):
    return {
        "name": "John Doe",
        "email": email,
        "message": message,
        "cf_turnstile_token": "valid-token",
        "hp": "",
    }


@override_settings(NOTIFY_EMAILS=[])
def test_contact_email_throttle_is_enforced_by_api():
    client = APIClient()

    with (
        patch.object(ContactEmailThrottle, "rate", "1/hour", create=True),
        patch("api.views._check_turnstile", return_value=True),
    ):
        first = client.post(
            "/api/contact/",
            contact_payload(email=" User@Example.com ", message="First valid message body."),
            format="json",
            REMOTE_ADDR="203.0.113.10",
        )
        second = client.post(
            "/api/contact/",
            contact_payload(email="user@example.com", message="Second different valid message body."),
            format="json",
            REMOTE_ADDR="203.0.113.11",
        )

    assert first.status_code == 201
    assert second.status_code == 429


@override_settings(ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=False)
def test_spoofed_x_forwarded_for_does_not_bypass_analytics_throttle():
    client = APIClient()
    payload = {
        "event_type": "page_view",
        "path": "/",
        "anonymous_id": "visitor-throttle-test",
    }

    with (
        patch.object(AnalyticsThrottle, "rate", "1/minute", create=True),
        patch.object(api_settings, "NUM_PROXIES", 0),
    ):
        first = client.post(
            "/api/analytics/",
            payload,
            format="json",
            REMOTE_ADDR="198.51.100.20",
            HTTP_X_FORWARDED_FOR="1.1.1.1",
        )
        second = client.post(
            "/api/analytics/",
            payload,
            format="json",
            REMOTE_ADDR="198.51.100.20",
            HTTP_X_FORWARDED_FOR="8.8.8.8",
        )

    assert first.status_code == 201
    assert second.status_code == 429


@override_settings(
    DEBUG=False,
    SECRET_KEY="insecure-secret-for-build-and-local-dev-only",
    TURNSTILE_SECRET="",
    ALLOWED_HOSTS=["localhost", "127.0.0.1"],
    BACKEND_BASE_URL="http://localhost:8000",
)
def test_production_security_checks_reject_insecure_defaults():
    errors = production_security_checks(None)
    assert {error.id for error in errors} == {
        "portfolio.E001",
        "portfolio.E002",
        "portfolio.E003",
        "portfolio.E004",
    }


@override_settings(
    DEBUG=False,
    SECRET_KEY="a-production-secret-that-is-not-the-default",
    TURNSTILE_SECRET="turnstile-production-secret",
    ALLOWED_HOSTS=["p95max.dev"],
    BACKEND_BASE_URL="https://api.p95max.dev",
)
def test_production_security_checks_accept_secure_configuration():
    assert production_security_checks(None) == []


@override_settings(
    ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=True,
    ANALYTICS_NOTIFY_DIRECT_VISITORS=True,
    NOTIFY_EMAILS=["owner@example.com"],
    BACKEND_BASE_URL="http://testserver",
)
def test_analytics_notification_can_retry_after_smtp_failure():
    event = AnalyticsEvent.objects.create(
        event_type=AnalyticsEvent.EVENT_PAGE_VIEW,
        path="/projects",
        source_type="linkedin",
        anonymous_id="retry-visitor",
    )
    cache_key = "analytics:new-visitor-email:retry-visitor"

    with patch(
        "api.analytics_notifications.EmailMultiAlternatives.send",
        side_effect=[RuntimeError("smtp unavailable"), 1],
    ) as send_mock:
        notify_new_analytics_visitor(event)
        assert cache.get(cache_key) is None

        notify_new_analytics_visitor(event)

    assert send_mock.call_count == 2
    assert cache.get(cache_key) == "sent"


@override_settings(
    ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=True,
    ANALYTICS_NOTIFY_DIRECT_VISITORS=True,
    NOTIFY_EMAILS=["owner@example.com"],
    BACKEND_BASE_URL="http://testserver",
)
def test_analytics_notification_deduplicates_after_success():
    event = AnalyticsEvent.objects.create(
        event_type=AnalyticsEvent.EVENT_PAGE_VIEW,
        path="/",
        source_type="direct",
        anonymous_id="dedup-visitor",
    )

    with patch(
        "api.analytics_notifications.EmailMultiAlternatives.send",
        return_value=1,
    ) as send_mock:
        notify_new_analytics_visitor(event)
        notify_new_analytics_visitor(event)

    send_mock.assert_called_once()


def test_anonymous_user_is_redirected_from_contact_admin():
    response = Client().get(reverse("admin:api_contactmessage_changelist"))
    assert response.status_code == 302
    assert reverse("admin:login") in response.url


def test_staff_without_model_permission_cannot_view_contact_messages():
    user = get_user_model().objects.create_user(
        username="staff-no-permission",
        password="password",
        is_staff=True,
    )
    client = Client()
    client.force_login(user)

    response = client.get(reverse("admin:api_contactmessage_changelist"))
    assert response.status_code == 403


def test_staff_with_view_permission_can_read_but_not_change_contact_messages():
    user = get_user_model().objects.create_user(
        username="staff-view-only",
        password="password",
        is_staff=True,
    )
    view_permission = Permission.objects.get(codename="view_contactmessage")
    user.user_permissions.add(view_permission)

    message = ContactMessage.objects.create(
        name="Private Sender",
        email="sender@example.com",
        message="Private contact message content.",
    )

    client = Client()
    client.force_login(user)

    list_response = client.get(reverse("admin:api_contactmessage_changelist"))
    change_response = client.post(
        reverse("admin:api_contactmessage_change", args=[message.pk]),
        {"status": "done"},
    )

    assert list_response.status_code == 200
    assert change_response.status_code == 403


def test_analytics_admin_does_not_allow_manual_creation():
    user = get_user_model().objects.create_superuser(
        username="admin",
        email="admin@example.com",
        password="password",
    )
    client = Client()
    client.force_login(user)

    response = client.get(reverse("admin:api_analyticsevent_add"))
    assert response.status_code == 403
