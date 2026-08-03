import pytest
from django.contrib import admin
from rest_framework.test import APIClient

from api.homepage_content import HomepageContent


@pytest.mark.django_db
def test_homepage_content_endpoint_returns_singleton_record():
    HomepageContent.objects.create(
        availability_en="Available",
        availability_de="Verfügbar",
        greeting_en="Hi, I'm",
        greeting_de="Hallo, ich bin",
        name="Maksym",
        role_en="Backend Developer",
        role_de="Backend-Entwickler",
        description_en="English description",
        description_de="Deutsche Beschreibung",
        stack=["Python", "Django"],
    )

    response = APIClient().get("/api/homepage-content/")

    assert response.status_code == 200
    assert response.json() == {
        "availability_en": "Available",
        "availability_de": "Verfügbar",
        "greeting_en": "Hi, I'm",
        "greeting_de": "Hallo, ich bin",
        "name": "Maksym",
        "role_en": "Backend Developer",
        "role_de": "Backend-Entwickler",
        "description_en": "English description",
        "description_de": "Deutsche Beschreibung",
        "stack": ["Python", "Django"],
    }


def test_homepage_content_is_registered_in_admin():
    assert HomepageContent in admin.site._registry
