from types import MethodType

from django.conf import settings
from django.contrib import admin
from django.db import models
from django.shortcuts import redirect
from django.urls import reverse
from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import ContactDetails


settings.JAZZMIN_SETTINGS.setdefault("icons", {})[
    "api.homepagecontent"
] = "fas fa-home"


def _singleton_changelist_view(model_admin, request, extra_context=None):
    """Open a singleton model directly instead of showing a one-row list."""
    instance = model_admin.model.objects.order_by("pk").first()
    route = "change" if instance else "add"
    args = (instance.pk,) if instance else ()
    url = reverse(
        f"{model_admin.admin_site.name}:"
        f"{model_admin.model._meta.app_label}_"
        f"{model_admin.model._meta.model_name}_{route}",
        args=args,
    )
    return redirect(url)


class HomepageContent(models.Model):
    """Singleton content record for the public homepage hero/About block."""

    availability_en = models.CharField(max_length=200)
    availability_de = models.CharField(max_length=200)
    greeting_en = models.CharField(max_length=100)
    greeting_de = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    role_en = models.CharField(max_length=200)
    role_de = models.CharField(max_length=200)
    description_en = models.TextField()
    description_de = models.TextField()
    stack = models.JSONField(
        default=list,
        help_text='Ordered list of technology labels, for example ["Python", "Django"].',
    )

    class Meta:
        app_label = "api"
        verbose_name = "Homepage content"
        verbose_name_plural = "Homepage content"

    def __str__(self):
        return "Homepage content"


class HomepageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomepageContent
        fields = (
            "availability_en",
            "availability_de",
            "greeting_en",
            "greeting_de",
            "name",
            "role_en",
            "role_de",
            "description_en",
            "description_de",
            "stack",
        )


@api_view(["GET"])
def homepage_content(request):
    content = HomepageContent.objects.order_by("pk").first()

    if content is None:
        return Response({})

    return Response(HomepageContentSerializer(content).data)


@admin.register(HomepageContent)
class HomepageContentAdmin(admin.ModelAdmin):
    fields = (
        "availability_en",
        "greeting_en",
        "role_en",
        "description_en",
        "availability_de",
        "greeting_de",
        "role_de",
        "description_de",
        "name",
        "stack",
    )

    def changelist_view(self, request, extra_context=None):
        return _singleton_changelist_view(self, request, extra_context)

    def has_add_permission(self, request):
        return not HomepageContent.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


contact_details_admin = admin.site._registry.get(ContactDetails)
if contact_details_admin is not None:
    contact_details_admin.changelist_view = MethodType(
        _singleton_changelist_view,
        contact_details_admin,
    )
