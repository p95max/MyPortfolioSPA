from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/projects/', include('apps.projects.urls')),
    path('api/posts/', include('apps.blog.urls')),
    path('api/messages/', include('apps.contacts.urls')),
]
