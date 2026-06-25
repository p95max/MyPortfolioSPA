from django.utils import timezone
from django import forms
from django.conf import settings
from django.contrib import admin
from django.core.validators import URLValidator
from django.utils.html import format_html
from adminsortable2.admin import SortableAdminMixin
from .models import Project, ProjectScreenshot, ContactMessage, ContactMessageStatus


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
    change_list_template = "adminsortable2/change_list.html"

    ordering = ("sort_order",)
    list_display = ("title", "tech_stack", "github_url", "demo_url", "screenshots_count")
    search_fields = ("title", "description", "tech_stack")
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



@admin.action(description="Mark selected messages as in progress")
def mark_as_in_progress(modeladmin, request, queryset):
    queryset.update(
        status=ContactMessageStatus.IN_PROGRESS,
        processed_at=None,
        processed_by=None,
    )


@admin.action(description="Mark selected messages as done")
def mark_as_done(modeladmin, request, queryset):
    queryset.update(
        status=ContactMessageStatus.DONE,
        processed_at=timezone.now(),
        processed_by=request.user,
    )


@admin.action(description="Mark selected messages as spam")
def mark_as_spam(modeladmin, request, queryset):
    queryset.update(
        status=ContactMessageStatus.SPAM,
        processed_at=timezone.now(),
        processed_by=request.user,
    )


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = (
        "status_badge",
        "name",
        "email",
        "short_message",
        "created_at",
        "processed_at",
        "processed_by",
    )
    list_filter = ("status", "created_at", "processed_at")
    search_fields = ("name", "email", "message", "internal_note")
    readonly_fields = ("created_at", "updated_at", "processed_at", "processed_by")
    fields = (
        "status",
        "name",
        "email",
        "message",
        "internal_note",
        "created_at",
        "updated_at",
        "processed_at",
        "processed_by",
    )
    actions = (mark_as_in_progress, mark_as_done, mark_as_spam)
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    @admin.display(description="Status", ordering="status")
    def status_badge(self, obj):
        colors = {
            ContactMessageStatus.NEW: "#2563eb",
            ContactMessageStatus.IN_PROGRESS: "#f59e0b",
            ContactMessageStatus.DONE: "#16a34a",
            ContactMessageStatus.SPAM: "#dc2626",
        }

        return format_html(
            '<span style="'
            'padding:4px 8px;'
            'border-radius:999px;'
            'background:{};'
            'color:white;'
            'font-weight:600;'
            'font-size:12px;'
            '">{}</span>',
            colors.get(obj.status, "#6b7280"),
            obj.get_status_display(),
        )

    @admin.display(description="Message")
    def short_message(self, obj):
        text = obj.message.strip()

        if len(text) <= 80:
            return text

        return f"{text[:80]}..."
