from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .homepage_content import homepage_content
from .views import (
    CredentialViewSet,
    ProjectViewSet,
    analytics_event,
    contact_details,
    contact_message,
    health,
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r"credentials", CredentialViewSet, basename="credential")

urlpatterns = [
    path('', include(router.urls)),
    path('homepage-content/', homepage_content, name='homepage_content'),
    path('contact-details/', contact_details, name='contact_details'),
    path('contact/', contact_message, name='contact_message'),
    path("analytics/", analytics_event, name="analytics_event"),
    path("health/", health, name="health"),
]
