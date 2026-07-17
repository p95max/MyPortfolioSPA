from datetime import date
from unittest.mock import patch

import pytest
from django.test import override_settings
from rest_framework.test import APIClient

from api.admin import CredentialAdminForm
from api.models import AnalyticsEvent, Credential, CredentialCategory, CredentialType


pytestmark = pytest.mark.django_db


@pytest.fixture
def api_client():
    return APIClient()


def create_credential(**overrides) -> Credential:
    values = {
        "title": "Backend Development Certificate",
        "issuer": "Example Academy",
        "credential_type": CredentialType.CERTIFICATE,
        "issued_at": date(2026, 1, 15),
        "image_url": "https://cdn.example.com/credential.webp",
        "category": CredentialCategory.BACKEND,
        "skills": ["Python", "Django"],
        "is_published": True,
    }
    values.update(overrides)
    return Credential.objects.create(**values)


def test_credential_string_representation_and_type_choices():
    credential = create_credential()

    assert str(credential) == "Backend Development Certificate (Certificate)"
    assert set(CredentialType.values) == {"certificate", "badge"}


def test_credentials_use_default_ordering_by_sort_order_then_primary_key():
    third = create_credential(title="Third", sort_order=2)
    first = create_credential(title="First", sort_order=1)
    second = create_credential(title="Second", sort_order=1)

    assert list(Credential.objects.values_list("title", flat=True)) == [
        first.title,
        second.title,
        third.title,
    ]


def test_credential_auto_assigns_the_next_sort_order():
    first = create_credential(title="First", sort_order=0)
    second = create_credential(title="Second", sort_order=0)
    explicit = create_credential(title="Explicit", sort_order=10)
    after_explicit = create_credential(title="After explicit", sort_order=0)

    assert first.sort_order == 1
    assert second.sort_order == 2
    assert explicit.sort_order == 10
    assert after_explicit.sort_order == 11


def test_credentials_endpoint_is_read_only(api_client):
    response = api_client.post("/api/credentials/", {}, format="json")

    assert response.status_code == 405


def test_credentials_endpoint_returns_only_published_records(api_client):
    published = create_credential(title="Published", sort_order=1)
    create_credential(title="Draft", is_published=False, sort_order=2)

    response = api_client.get("/api/credentials/")

    assert response.status_code == 200
    assert [item["title"] for item in response.json()] == [published.title]
    assert "is_published" not in response.json()[0]


def test_credentials_endpoint_filters_featured_records(api_client):
    featured = create_credential(title="Featured", is_featured=True, sort_order=1)
    create_credential(title="Regular", is_featured=False, sort_order=2)
    create_credential(
        title="Unpublished featured",
        is_featured=True,
        is_published=False,
        sort_order=3,
    )

    response = api_client.get("/api/credentials/?featured=true")

    assert response.status_code == 200
    assert [item["title"] for item in response.json()] == [featured.title]


def test_credentials_endpoint_filters_certificate_and_badge_types(api_client):
    certificate = create_credential(title="Certificate", sort_order=1)
    badge = create_credential(
        title="Badge",
        credential_type=CredentialType.BADGE,
        category=CredentialCategory.OTHER,
        sort_order=2,
    )

    certificate_response = api_client.get("/api/credentials/?type=certificate")
    badge_response = api_client.get("/api/credentials/?type=badge")

    assert [item["id"] for item in certificate_response.json()] == [certificate.id]
    assert [item["id"] for item in badge_response.json()] == [badge.id]


def test_credentials_endpoint_preserves_sort_order(api_client):
    last = create_credential(title="Last", sort_order=3)
    first = create_credential(title="First", sort_order=1)
    second = create_credential(title="Second", sort_order=2)

    response = api_client.get("/api/credentials/")

    assert [item["id"] for item in response.json()] == [first.id, second.id, last.id]


def test_credentials_api_includes_optional_verification_fields(api_client):
    verified = create_credential(
        title="Verified",
        credential_id="ABC-123",
        credential_url="https://verify.example.com/ABC-123",
        sort_order=1,
    )
    unverified = create_credential(title="Unverified", sort_order=2)

    response = api_client.get("/api/credentials/")
    payload = {item["id"]: item for item in response.json()}

    assert payload[verified.id]["credential_id"] == "ABC-123"
    assert payload[verified.id]["credential_url"] == "https://verify.example.com/ABC-123"
    assert payload[unverified.id]["credential_id"] == ""
    assert payload[unverified.id]["credential_url"] == ""


def test_credentials_endpoint_returns_an_empty_list(api_client):
    response = api_client.get("/api/credentials/")

    assert response.status_code == 200
    assert response.json() == []


def test_credential_admin_form_validates_image_urls():
    base_data = {
        "title": "Credential",
        "issuer": "Example Academy",
        "credential_type": CredentialType.CERTIFICATE,
        "issued_at": "2026-01-15",
        "category": CredentialCategory.BACKEND,
        "skills": '["Python"]',
        "sort_order": "1",
    }

    relative_form = CredentialAdminForm(data={**base_data, "image_url": "/credentials/cert.webp"})
    http_form = CredentialAdminForm(
        data={**base_data, "image_url": "https://cdn.example.com/cert.webp"}
    )
    invalid_form = CredentialAdminForm(
        data={**base_data, "image_url": "javascript:alert(1)"}
    )

    assert relative_form.is_valid()
    assert http_form.is_valid()
    assert not invalid_form.is_valid()
    assert "image_url" in invalid_form.errors


@override_settings(ANALYTICS_NEW_VISITOR_EMAIL_ENABLED=False)
def test_analytics_accepts_credential_metadata(api_client):
    with patch("api.views.notify_new_analytics_visitor"):
        response = api_client.post(
            "/api/analytics/",
            {
                "event_type": AnalyticsEvent.EVENT_CREDENTIAL_LINK_CLICK,
                "path": "/credentials",
                "metadata": {
                    "credential_id": "42",
                    "credential_title": "Backend Development Certificate",
                    "credential_type": "certificate",
                    "issuer": "Example Academy",
                    "target": "verification_url",
                    "url_host": "verify.example.com",
                    "ignored": "not stored",
                },
            },
            format="json",
        )

    assert response.status_code == 201
    assert AnalyticsEvent.objects.get().metadata == {
        "credential_id": "42",
        "credential_title": "Backend Development Certificate",
        "credential_type": "certificate",
        "issuer": "Example Academy",
        "target": "verification_url",
        "url_host": "verify.example.com",
    }
