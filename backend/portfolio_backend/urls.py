from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings

def trigger_error(request):
    division_by_zero = 1 / 0

schema_view = get_schema_view(
   openapi.Info(
      title="Portfolio API",
      default_version='v1',
      description="API documentation for Portfolio backend",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path(f'{settings.ADMIN_URL}', admin.site.urls),
    path('api/', include('api.urls')),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('sentry-debug/', trigger_error),
]