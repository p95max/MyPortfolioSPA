from django.conf import settings
from django.contrib import admin
from django.db import models
from django.shortcuts import redirect
from django.urls import reverse
from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response


settings.JAZZMIN_SETTINGS.setdefault("icons", {})[
    "api.legalcontent"
] = "fas fa-user-shield"


class LegalContent(models.Model):
    """Singleton content for legal pages and the cookie consent dialog."""

    impressum_html = models.TextField(
        help_text="Trusted HTML rendered on the Impressum page.",
    )
    privacy_html = models.TextField(
        help_text="Trusted HTML rendered on the privacy policy page.",
    )
    responsible_name = models.CharField(
        max_length=200,
        blank=True,
        help_text="Name of the person or organisation responsible for the legal pages.",
    )
    responsible_address = models.TextField(
        blank=True,
        help_text="Postal address. Use one line per address line.",
    )
    responsible_email = models.EmailField(
        blank=True,
        help_text="Public email address shown on the legal pages.",
    )

    cookie_eyebrow_en = models.CharField(max_length=100)
    cookie_title_en = models.CharField(max_length=200)
    cookie_text_en = models.TextField()
    cookie_necessary_en = models.CharField(max_length=100)
    cookie_necessary_text_en = models.CharField(max_length=300)
    cookie_analytics_en = models.CharField(max_length=100)
    cookie_analytics_text_en = models.CharField(max_length=300)
    cookie_reject_en = models.CharField(max_length=100)
    cookie_save_en = models.CharField(max_length=100)
    cookie_accept_en = models.CharField(max_length=100)

    cookie_eyebrow_de = models.CharField(max_length=100)
    cookie_title_de = models.CharField(max_length=200)
    cookie_text_de = models.TextField()
    cookie_necessary_de = models.CharField(max_length=100)
    cookie_necessary_text_de = models.CharField(max_length=300)
    cookie_analytics_de = models.CharField(max_length=100)
    cookie_analytics_text_de = models.CharField(max_length=300)
    cookie_reject_de = models.CharField(max_length=100)
    cookie_save_de = models.CharField(max_length=100)
    cookie_accept_de = models.CharField(max_length=100)

    class Meta:
        app_label = "api"
        verbose_name = "Legal content"
        verbose_name_plural = "Legal content"

    def __str__(self):
        return "Legal content"


class LegalContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalContent
        exclude = ("id",)


@api_view(["GET"])
def legal_content(request):
    content = LegalContent.objects.order_by("pk").first()
    if content is None:
        return Response({})
    return Response(LegalContentSerializer(content).data)


@admin.register(LegalContent)
class LegalContentAdmin(admin.ModelAdmin):
    fields = (
        "responsible_name",
        "responsible_address",
        "responsible_email",
        "impressum_html",
        "privacy_html",
        "cookie_eyebrow_en",
        "cookie_title_en",
        "cookie_text_en",
        "cookie_necessary_en",
        "cookie_necessary_text_en",
        "cookie_analytics_en",
        "cookie_analytics_text_en",
        "cookie_reject_en",
        "cookie_save_en",
        "cookie_accept_en",
        "cookie_eyebrow_de",
        "cookie_title_de",
        "cookie_text_de",
        "cookie_necessary_de",
        "cookie_necessary_text_de",
        "cookie_analytics_de",
        "cookie_analytics_text_de",
        "cookie_reject_de",
        "cookie_save_de",
        "cookie_accept_de",
    )

    def changelist_view(self, request, extra_context=None):
        instance = self.model.objects.order_by("pk").first()
        route = "change" if instance else "add"
        args = (instance.pk,) if instance else ()
        return redirect(
            reverse(
                f"{self.admin_site.name}:api_legalcontent_{route}",
                args=args,
            )
        )

    def has_add_permission(self, request):
        return not LegalContent.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
