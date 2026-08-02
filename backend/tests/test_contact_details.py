import pytest
from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory
from rest_framework.test import APIClient

from api.admin import ContactDetailsAdmin
from api.models import ContactDetails


pytestmark = pytest.mark.django_db


def test_contact_details_endpoint_returns_the_admin_values():
    ContactDetails.objects.create(
        email="admin@example.com",
        github_url="https://github.com/admin-user",
        linkedin_url="https://linkedin.com/in/admin-user",
        telegram_url="https://t.me/admin_user",
    )

    response = APIClient().get("/api/contact-details/")

    assert response.status_code == 200
    assert response.json() == {
        "email": "admin@example.com",
        "github_url": "https://github.com/admin-user",
        "linkedin_url": "https://linkedin.com/in/admin-user",
        "telegram_url": "https://t.me/admin_user",
    }


def test_contact_details_endpoint_returns_empty_values_before_configuration():
    response = APIClient().get("/api/contact-details/")

    assert response.status_code == 200
    assert response.json() == {
        "email": "",
        "github_url": "",
        "linkedin_url": "",
        "telegram_url": "",
    }


def test_admin_allows_only_one_contact_details_record():
    model_admin = ContactDetailsAdmin(ContactDetails, AdminSite())
    request = RequestFactory().get("/admin/api/contactdetails/")

    assert model_admin.has_add_permission(request)

    ContactDetails.objects.create(email="admin@example.com")

    assert not model_admin.has_add_permission(request)
    assert not model_admin.has_delete_permission(request)
