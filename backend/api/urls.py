from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, contact_message

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
    path('contact/', contact_message, name='contact_message'),
]