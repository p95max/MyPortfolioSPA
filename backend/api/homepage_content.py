from django.contrib import admin
from django.db import models
from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response


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
    fieldsets = (
        (
            "English",
            {
                "fields": (
                    "availability_en",
                    "greeting_en",
                    "role_en",
                    "description_en",
                )
            },
        ),
        (
            "German",
            {
                "fields": (
                    "availability_de",
                    "greeting_de",
                    "role_de",
                    "description_de",
                )
            },
        ),
        ("Shared", {"fields": ("name", "stack")}),
    )

    def has_add_permission(self, request):
        return not HomepageContent.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
