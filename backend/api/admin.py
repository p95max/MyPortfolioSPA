from django import forms
from django.conf import settings
from django.contrib import admin
from django.core.validators import URLValidator
from django.utils.html import format_html
from adminsortable2.admin import SortableAdminMixin

from .models import Project, ProjectScreenshot, ContactMessage


def _public_image_url(value: str) -> str:
    """
    Converts stored image_url to a URL that is accessible from the browser.
    - absolute http(s) URLs stay as-is
    - relative paths like /screenshots/x.png are prefixed with FRONTEND_BASE_URL
    """
    url = (value or "").strip()
    if not url:
        return ""
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("/"):
        base = (getattr(settings, "FRONTEND_BASE_URL", "") or "").rstrip("/")
        return f"{base}{url}"
    return url


class ProjectScreenshotAdminForm(forms.ModelForm):
    image_url = forms.CharField(required=False)

    class Meta:
        model = ProjectScreenshot
        fields = "__all__"

    def clean_image_url(self):
        url = (self.cleaned_data.get("image_url") or "").strip()
        if not url:
            return url

        if url.startswith("/"):
            return url

        URLValidator(schemes=("http", "https"))(url)
        return url



class ProjectScreenshotInline(admin.TabularInline):
    model = ProjectScreenshot
    form = ProjectScreenshotAdminForm
    extra = 0
    fields = ("caption", "image_url", "preview")
    readonly_fields = ("preview",)

    @admin.display(description="Preview")
    def preview(self, obj: ProjectScreenshot):
        public = _public_image_url(obj.image_url)
        if not public:
            return "—"
        return format_html(
            '<a href="{0}" target="_blank" rel="noopener">'
            '<img src="{0}" style="height:80px; width:auto; border-radius:6px; border:1px solid #ddd;" />'
            "</a>",
            public,
        )


@admin.register(Project)
class ProjectAdmin(SortableAdminMixin, admin.ModelAdmin):
    list_display = ("title", "tech_stack", "github_url", "demo_url", "screenshots_count")
    search_fields = ("title", "description", "tech_stack")
    ordering = ("sort_order", "pk")
    inlines = (ProjectScreenshotInline,)

    @admin.display(description="Screenshots")
    def screenshots_count(self, obj: Project):
        return obj.screenshots.count()




@admin.register(ProjectScreenshot)
class ProjectScreenshotAdmin(admin.ModelAdmin):
    form = ProjectScreenshotAdminForm
    list_display = ("project", "caption", "image_link", "preview")
    search_fields = ("project__title", "caption", "image_url")
    list_filter = ("project",)
    fields = ("project", "caption", "image_url", "preview")
    readonly_fields = ("preview",)

    @admin.display(description="Image")
    def image_link(self, obj: ProjectScreenshot):
        public = _public_image_url(obj.image_url)
        if not public:
            return "—"
        return format_html('<a href="{0}" target="_blank" rel="noopener">{0}</a>', public)

    @admin.display(description="Preview")
    def preview(self, obj: ProjectScreenshot):
        public = _public_image_url(obj.image_url)
        if not public:
            return "—"
        return format_html(
            '<a href="{0}" target="_blank" rel="noopener">'
            '<img src="{0}" style="height:80px; width:auto; border-radius:6px; border:1px solid #ddd;" />'
            "</a>",
            public,
        )


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "created_at")
    search_fields = ("name", "email", "message")
    list_filter = ("created_at",)
