import pytest
from rest_framework.test import APIClient

from api.models import AnalyticsEvent


pytestmark = pytest.mark.django_db


def test_later_analytics_event_reuses_existing_visitor_country(settings):
    settings.ANALYTICS_NEW_VISITOR_EMAIL_ENABLED = False
    settings.TRUST_ANALYTICS_GEO_HEADERS = False
    settings.ANALYTICS_GEOIP_LOOKUP_ENABLED = False

    AnalyticsEvent.objects.create(
        event_type=AnalyticsEvent.EVENT_PAGE_VIEW,
        path="/",
        anonymous_id="visitor-country",
        session_id="session-country",
        country="DE",
    )

    response = APIClient().post(
        "/api/analytics/",
        {
            "event_type": AnalyticsEvent.EVENT_PROJECT_DEMO_CLICK,
            "path": "/projects",
            "anonymous_id": "visitor-country",
            "session_id": "session-country",
            "metadata": {
                "project_id": "jobapply",
                "project_title": "JobApply",
                "target": "project_demo",
                "url_host": "example.com",
            },
        },
        format="json",
    )

    assert response.status_code == 201

    event = AnalyticsEvent.objects.order_by("-pk").first()
    assert event is not None
    assert event.event_type == AnalyticsEvent.EVENT_PROJECT_DEMO_CLICK
    assert event.country == "DE"


def test_existing_country_is_not_overwritten():
    AnalyticsEvent.objects.create(
        event_type=AnalyticsEvent.EVENT_PAGE_VIEW,
        path="/",
        anonymous_id="visitor-moved",
        country="DE",
    )

    event = AnalyticsEvent.objects.create(
        event_type=AnalyticsEvent.EVENT_PAGE_VIEW,
        path="/",
        anonymous_id="visitor-moved",
        country="AT",
    )

    assert event.country == "AT"
