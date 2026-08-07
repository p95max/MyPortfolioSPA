import pytest
from rest_framework.test import APIClient

from api.models import AnalyticsEvent


pytestmark = pytest.mark.django_db


def test_project_demo_click_is_accepted_and_saved():
    response = APIClient().post(
        "/api/analytics/",
        {
            "event_type": "project_demo_click",
            "path": "/projects",
            "referrer": "",
            "language": "en-US",
            "source_type": "direct",
            "utm_source": "",
            "utm_medium": "",
            "utm_campaign": "",
            "os": "Windows",
            "browser": "Chrome",
            "device_type": "desktop",
            "client_timezone": "Europe/Berlin",
            "utc_offset_minutes": 120,
            "anonymous_id": "visitor-demo-test",
            "session_id": "session-demo-test",
            "metadata": {
                "project_id": "portfolio",
                "project_title": "Portfolio SPA",
                "target": "project_demo",
                "url_host": "example.com",
            },
        },
        format="json",
    )

    assert response.status_code == 201

    event = AnalyticsEvent.objects.get()
    assert event.event_type == AnalyticsEvent.EVENT_PROJECT_DEMO_CLICK
    assert event.get_event_type_display() == "Project demo click"
    assert event.metadata == {
        "project_id": "portfolio",
        "project_title": "Portfolio SPA",
        "target": "project_demo",
        "url_host": "example.com",
    }
