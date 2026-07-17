from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CredentialViewSet, ProjectViewSet, analytics_event, contact_message

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r"credentials", CredentialViewSet, basename="credential")

urlpatterns = [
    path('', include(router.urls)),
    path('contact/', contact_message, name='contact_message'),
    path("analytics/", analytics_event, name="analytics_event"),
]
