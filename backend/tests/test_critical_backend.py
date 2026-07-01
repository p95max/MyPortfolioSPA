from types import SimpleNamespace
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from rest_framework.test import APIClient

from api.admin import mark_as_done, mark_as_in_progress, mark_as_spam
from api.models import (
    AnalyticsEvent,
    ContactMessage,
    ContactMessageStatus,
    Project,
    ProjectScreenshot,
)
from api.serializers import ContactMessageSerializer


pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def clear_test_cache():
    cache.clear()
    yield
    cache.clear()


@pytest.fixture
def api_client():
    return APIClient()


def contact_payload(**overrides):
    payload = {
        "name": "John Doe",
        "email": "JOHN@Example.COM",
        "message": "Hello, I want to contact you about your portfolio project.",
        "cf_turnstile_token": "valid-token",
        "hp": "",
    }
    payload.update(overrides)
    return payload


# -------------------------
# Contact serializer
# -------------------------


def test_contact_serializer_normalizes_email():
    serializer = ContactMessageSerializer(
        data={
            "name": "John Doe",
            "email": "  JOHN@Example.COM  ",
            "message": "Hello, this is a valid message.",
        }
    )

    assert serializer.is_valid(), serializer.errors
    assert serializer.validated_data["email"] == "john@example.com"


def test_contact_serializer_rejects_message_with_too_many_links():
    serializer = ContactMessageSerializer(
        data={
            "name": "John Doe",
            "email": "john@example.com",
            "message": (
                "Check these links: "
                "https://one.example.com "
                "http://two.example.com "
                "https://three.example.com"
            ),
        }
    )

    assert not serializer.is_valid()
    assert "message" in serializer.errors


# -------------------------
# Contact API
# -------------------------


def test_contact_honeypot_short_circuits_without_turnstile_check(api_client):
    with patch("api.views._check_turnstile") as turnstile_mock:
        response = api_client.post(
            "/api/contact/",
            contact_payload(hp="bot-filled-field"),
            format="json",
        )

    assert response.status_code == 201
    assert response.json() == {"detail": "ok"}
    assert ContactMessage.objects.count() == 0
    turnstile_mock.assert_not_called()


@override_settings(TURNSTILE_SECRET="test-secret")
def test_contact_captcha_failure_does_not_save_message(api_client):
    with patch("api.views._check_turnstile", return_value=False):
        response = api_client.post(
            "/api/contact/",
            contact_payload(),
            format="json",
        )

    assert response.status_code == 400
    assert response.json() == {"detail": "captcha_failed"}
    assert ContactMessage.objects.count() == 0


@override_settings(
    TURNSTILE_SECRET="test-secret",
    NOTIFY_EMAILS=["owner@example.com"],
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    BACKEND_BASE_URL="http://testserver",
)
def test_valid_contact_saves_message_and_sends_notification(api_client):
    with patch("api.views._check_turnstile", return_value=True):
        response = api_client.post(
            "/api/contact/",
            contact_payload(),
            format="json",
        )

    assert response.status_code == 201
    assert response.json() == {"message": "Thank you for your message!"}

    message = ContactMessage.objects.get()
    assert message.name == "John Doe"
    assert message.email == "john@example.com"
    assert message.status == ContactMessageStatus.NEW

    assert len(mail.outbox) == 1
    assert "New Contact Message" in mail.outbox[0].subject
    assert mail.outbox[0].to == ["owner@example.com"]
    assert mail.outbox[0].reply_to == ["john@example.com"]


@override_settings(
    TURNSTILE_SECRET="test-secret",
    NOTIFY_EMAILS=["owner@example.com"],
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    BACKEND_BASE_URL="http://testserver",
)
def test_contact_email_failure_does_not_break_success_response(api_client):
    with patch("api.views._check_turnstile", return_value=True):
        with patch("api.views.EmailMultiAlternatives.send", side_effect=Exception("smtp down")):
            response = api_client.post(
                "/api/contact/",
                contact_payload(email="fail@example.com"),
                format="json",
            )

    assert response.status_code == 201
    assert response.json() == {"message": "Thank you for your message!"}
    assert ContactMessage.objects.filter(email="fail@example.com").exists()


def test_contact_invalid_payload_returns_400(api_client):
    with patch("api.views._check_turnstile", return_value=True):
        response = api_client.post(
            "/api/contact/",
            contact_payload(message="short"),
            format="json",
        )

    assert response.status_code == 400
    assert "message" in response.json()
    assert ContactMessage.objects.count() == 0


# -------------------------
# Analytics API
# -------------------------


@override_settings(ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=False)
def test_analytics_event_is_saved_with_country_from_header(api_client):
    payload = {
        "event_type": "project_github_click",
        "path": "/projects?utm_source=linkedin",
        "referrer": "https://linkedin.com/in/test",
        "language": "en-US",
        "source_type": "LinkedIn",
        "utm_source": "linkedin",
        "utm_medium": "profile",
        "utm_campaign": "job_search",
        "os": "Windows",
        "browser": "Chrome",
        "device_type": "desktop",
        "anonymous_id": "visitor-123",
        "session_id": "session-123",
        "metadata": {
            "project_id": "jobapply",
            "project_title": "JobApply",
            "target": "project_github",
            "url_host": "github.com",
            "unexpected_key": "must be removed",
        },
    }

    with patch("api.views.notify_new_analytics_visitor") as notify_mock:
        response = api_client.post(
            "/api/analytics/",
            payload,
            format="json",
            HTTP_CF_IPCOUNTRY="de",
        )

    assert response.status_code == 201
    assert response.json() == {"detail": "ok"}

    event = AnalyticsEvent.objects.get()
    assert event.country == "DE"
    assert event.source_type == "linkedin"
    assert event.device_type == "desktop"
    assert event.metadata == {
        "project_id": "jobapply",
        "project_title": "JobApply",
        "target": "project_github",
        "url_host": "github.com",
    }

    notify_mock.assert_called_once_with(event)


def test_analytics_rejects_path_without_leading_slash(api_client):
    response = api_client.post(
        "/api/analytics/",
        {
            "event_type": "page_view",
            "path": "projects",
            "anonymous_id": "visitor-123",
        },
        format="json",
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "invalid_event"}
    assert AnalyticsEvent.objects.count() == 0


def test_analytics_rejects_non_object_metadata(api_client):
    response = api_client.post(
        "/api/analytics/",
        {
            "event_type": "page_view",
            "path": "/",
            "anonymous_id": "visitor-123",
            "metadata": ["not", "object"],
        },
        format="json",
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "invalid_event"}
    assert AnalyticsEvent.objects.count() == 0


def test_analytics_unknown_device_type_is_normalized_to_unknown(api_client):
    response = api_client.post(
        "/api/analytics/",
        {
            "event_type": "page_view",
            "path": "/",
            "anonymous_id": "visitor-123",
            "device_type": "smart-fridge",
        },
        format="json",
    )

    assert response.status_code == 201

    event = AnalyticsEvent.objects.get()
    assert event.device_type == "unknown"


# -------------------------
# Projects API / serializer
# -------------------------


def test_projects_are_returned_by_sort_order_then_pk(api_client):
    first_created = Project.objects.create(
        title="Project A",
        description="A",
        tech_stack="Python",
        sort_order=2,
    )
    second_created = Project.objects.create(
        title="Project B",
        description="B",
        tech_stack="Django",
        sort_order=1,
    )
    third_created = Project.objects.create(
        title="Project C",
        description="C",
        tech_stack="FastAPI",
        sort_order=1,
    )

    response = api_client.get("/api/projects/")

    assert response.status_code == 200
    assert [item["title"] for item in response.json()] == [
        second_created.title,
        third_created.title,
        first_created.title,
    ]


def test_project_auto_assigns_next_sort_order():
    first = Project.objects.create(
        title="First",
        description="First description",
        tech_stack="Django",
    )
    second = Project.objects.create(
        title="Second",
        description="Second description",
        tech_stack="FastAPI",
    )
    explicit = Project.objects.create(
        title="Explicit",
        description="Explicit description",
        tech_stack="Python",
        sort_order=10,
    )
    after_explicit = Project.objects.create(
        title="After explicit",
        description="After explicit description",
        tech_stack="PostgreSQL",
    )

    assert first.sort_order == 1
    assert second.sort_order == 2
    assert explicit.sort_order == 10
    assert after_explicit.sort_order == 11


def test_project_screenshot_urls_are_normalized_for_frontend(api_client):
    project = Project.objects.create(
        title="Screenshots project",
        description="Description",
        tech_stack="Django",
    )

    ProjectScreenshot.objects.create(
        project=project,
        image_url="img/screenshots/legacy.png",
        caption="Legacy",
    )
    ProjectScreenshot.objects.create(
        project=project,
        image_url="screenshots/raw.png",
        caption="Raw",
    )
    ProjectScreenshot.objects.create(
        project=project,
        image_url="plain.png",
        caption="Plain",
    )
    ProjectScreenshot.objects.create(
        project=project,
        image_url="/screenshots/already-ok.png",
        caption="Already OK",
    )
    ProjectScreenshot.objects.create(
        project=project,
        image_url="https://cdn.example.com/image.png",
        caption="External",
    )
    ProjectScreenshot.objects.create(
        project=project,
        image_url="",
        caption="Empty should be skipped",
    )

    response = api_client.get("/api/projects/")

    assert response.status_code == 200

    item = response.json()[0]
    assert item["screenshots"] == [
        "/screenshots/legacy.png",
        "/screenshots/raw.png",
        "/screenshots/plain.png",
        "/screenshots/already-ok.png",
        "https://cdn.example.com/image.png",
    ]


# -------------------------
# Admin workflow
# -------------------------


def test_admin_mark_as_done_sets_processing_fields():
    User = get_user_model()
    user = User.objects.create_user(username="admin-user", password="pass")

    message = ContactMessage.objects.create(
        name="John Doe",
        email="john@example.com",
        message="Hello, this is a valid message.",
    )

    request = SimpleNamespace(user=user)

    mark_as_done(
        modeladmin=None,
        request=request,
        queryset=ContactMessage.objects.filter(pk=message.pk),
    )

    message.refresh_from_db()

    assert message.status == ContactMessageStatus.DONE
    assert message.processed_by == user
    assert message.processed_at is not None


def test_admin_mark_as_spam_sets_processing_fields():
    User = get_user_model()
    user = User.objects.create_user(username="admin-user", password="pass")

    message = ContactMessage.objects.create(
        name="Spammer",
        email="spam@example.com",
        message="Hello, this is a spam-looking but valid length message.",
    )

    request = SimpleNamespace(user=user)

    mark_as_spam(
        modeladmin=None,
        request=request,
        queryset=ContactMessage.objects.filter(pk=message.pk),
    )

    message.refresh_from_db()

    assert message.status == ContactMessageStatus.SPAM
    assert message.processed_by == user
    assert message.processed_at is not None


def test_admin_mark_as_in_progress_clears_processing_fields():
    User = get_user_model()
    user = User.objects.create_user(username="admin-user", password="pass")

    message = ContactMessage.objects.create(
        name="John Doe",
        email="john@example.com",
        message="Hello, this is a valid message.",
        status=ContactMessageStatus.DONE,
        processed_by=user,
    )

    request = SimpleNamespace(user=user)

    mark_as_in_progress(
        modeladmin=None,
        request=request,
        queryset=ContactMessage.objects.filter(pk=message.pk),
    )

    message.refresh_from_db()

    assert message.status == ContactMessageStatus.IN_PROGRESS
    assert message.processed_by is None
    assert message.processed_at is None