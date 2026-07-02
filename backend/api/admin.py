import json
from django.utils import timezone
from django import forms
from django.conf import settings
from django.contrib import admin
from django.core.validators import URLValidator
from django.utils.html import format_html
from adminsortable2.admin import SortableAdminMixin, SortableTabularInline

from .utils.image_urls import build_public_image_url
from .utils.admin_formatting import admin_badge
from .models import (
    Project,
    ProjectScreenshot,
    ContactMessage,
    ContactMessageStatus,
    AnalyticsEvent,
)


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



class ProjectScreenshotInline(SortableTabularInline):
    model = ProjectScreenshot
    form = ProjectScreenshotAdminForm
    classes = ("project-screenshots-inline",)
    extra = 0
    ordering = ("sort_order",)
    fields = ("sort_order", "caption", "image_url", "preview")
    readonly_fields = ("preview",)

    class Media:
        css = {
            "all": ("api/admin_project_screenshots.css",),
        }

    @admin.display(description="Preview")
    def preview(self, obj: ProjectScreenshot):
        public = build_public_image_url(obj.image_url)
        if not public:
            return "—"
        return format_html(
            '<a href="{0}" target="_blank" rel="noopener">'
            '<img src="{0}" class="project-screenshot-preview-img" />'
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
    ordering = ("project", "sort_order", "id")
    list_display = ("project", "sort_order", "caption", "image_link", "preview")
    search_fields = ("project__title", "caption", "image_url")
    list_filter = ("project",)
    fields = ("project", "sort_order", "caption", "image_url", "preview")
    readonly_fields = ("preview",)

    class Media:
        css = {
            "all": ("api/admin_project_screenshots.css",),
        }

    @admin.display(description="Image")
    def image_link(self, obj: ProjectScreenshot):
        public = build_public_image_url(obj.image_url)
        if not public:
            return "—"
        return format_html('<a href="{0}" target="_blank" rel="noopener">{0}</a>', public)

    @admin.display(description="Preview")
    def preview(self, obj: ProjectScreenshot):
        public = build_public_image_url(obj.image_url)
        if not public:
            return "—"
        return format_html(
            '<a href="{0}" target="_blank" rel="noopener">'
            '<img src="{0}" class="project-screenshot-preview-img" />'
            "</a>",
            public,
        )



@admin.action(description="Mark selected messages as in progress")
def mark_as_in_progress(modeladmin, request, queryset):
    queryset.update(
        status=ContactMessageStatus.IN_PROGRESS,
        processed_at=None,
        processed_by_id=None,
    )


@admin.action(description="Mark selected messages as done")
def mark_as_done(modeladmin, request, queryset):
    queryset.update(
        status=ContactMessageStatus.DONE,
        processed_at=timezone.now(),
        processed_by_id=request.user.pk,
    )


@admin.action(description="Mark selected messages as spam")
def mark_as_spam(modeladmin, request, queryset):
    queryset.update(
        status=ContactMessageStatus.SPAM,
        processed_at=timezone.now(),
        processed_by_id=request.user.pk,
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
    
    def save_model(self, request, obj, form, change):
        if "status" in form.changed_data:
            if obj.status in (
                ContactMessageStatus.DONE,
                ContactMessageStatus.SPAM,
            ):
                obj.processed_at = timezone.now()
                obj.processed_by = request.user

            elif obj.status in (
                ContactMessageStatus.NEW,
                ContactMessageStatus.IN_PROGRESS,
            ):
                obj.processed_at = None
                obj.processed_by = None

        super().save_model(request, obj, form, change)

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
    

@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = (
        "created_at_display",
        "event_badge",
        "path",
        "source_type",
        "country",
        "device_type",
        "browser",
        "details_summary",
    )
    list_filter = (
        "event_type",
        "source_type",
        "country",
        "device_type",
        "browser",
        "os",
        "created_at",
    )
    search_fields = (
        "path",
        "referrer",
        "anonymous_id",
        "session_id",
        "utm_source",
        "utm_medium",
        "utm_campaign",
    )
    readonly_fields = (
        "created_at_display",
        "created_at",
        "event_type",
        "path",
        "referrer",
        "language",
        "country",
        "source_type",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "os",
        "browser",
        "device_type",
        "screen_width",
        "screen_height",
        "anonymous_id",
        "session_id",
        "metadata_pretty",
    )
    fieldsets = (
        (
            "Key information",
            {
                "fields": (
                    "created_at_display",
                    "event_type",
                    "path",
                    "source_type",
                    "country",
                )
            },
        ),
        (
            "Device",
            {
                "fields": (
                    "device_type",
                    "browser",
                    "os",
                    "language",
                )
            },
        ),
        (
            "Traffic source",
            {
                "fields": (
                    "referrer",
                    "utm_source",
                    "utm_medium",
                    "utm_campaign",
                )
            },
        ),
        (
            "Anonymous identifiers",
            {
                "fields": (
                    "anonymous_id",
                    "session_id",
                )
            },
        ),
        (
            "Event details",
            {
                "fields": (
                    "metadata_pretty",
                )
            },
        ),
        (
            "Legacy screen data",
            {
                "classes": ("collapse",),
                "fields": (
                    "screen_width",
                    "screen_height",
                ),
            },
        ),
        (
            "Raw timestamp",
            {
                "classes": ("collapse",),
                "fields": (
                    "created_at",
                ),
            },
        ),
    )
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    @admin.display(description="Created at", ordering="created_at")
    def created_at_display(self, obj):
        local_time = timezone.localtime(obj.created_at)
        return local_time.strftime("%d.%m.%Y %H:%M")

    @admin.display(description="Event", ordering="event_type")
    def event_badge(self, obj):
        colors = {
            AnalyticsEvent.EVENT_PAGE_VIEW: "#2563eb",
            AnalyticsEvent.EVENT_PROJECT_VIEW: "#7c3aed",
            AnalyticsEvent.EVENT_PROJECT_GITHUB_CLICK: "#111827",
            AnalyticsEvent.EVENT_CONTACT_SUBMIT: "#16a34a",
            AnalyticsEvent.EVENT_OUTBOUND_LINK_CLICK: "#f59e0b",
        }

        return format_html(
            '<span style="'
            'padding:4px 8px;'
            'border-radius:999px;'
            'background:{};'
            'color:white;'
            'font-weight:600;'
            'font-size:12px;'
            'white-space:nowrap;'
            '">{}</span>',
            colors.get(obj.event_type, "#6b7280"),
            obj.get_event_type_display(),
        )

    @admin.display(description="Details")
    def details_summary(self, obj):
        metadata = obj.metadata or {}

        if obj.event_type in {
            AnalyticsEvent.EVENT_PROJECT_VIEW,
            AnalyticsEvent.EVENT_PROJECT_GITHUB_CLICK,
        }:
            return metadata.get("project_title") or metadata.get("project_id") or "—"

        if obj.event_type == AnalyticsEvent.EVENT_OUTBOUND_LINK_CLICK:
            target = metadata.get("target") or "outbound"
            host = metadata.get("url_host") or ""
            return f"{target} → {host}" if host else target

        if obj.event_type == AnalyticsEvent.EVENT_CONTACT_SUBMIT:
            return "contact form"

        return "—"

    @admin.display(description="Metadata")
    def metadata_pretty(self, obj):
        metadata = obj.metadata or {}

        if not metadata:
            return "—"

        return format_html(
            '<pre style="'
            'white-space:pre-wrap;'
            'margin:0;'
            'font-size:12px;'
            'line-height:1.4;'
            '">{}</pre>',
            json.dumps(metadata, ensure_ascii=False, indent=2),
        )

    def has_add_permission(self, request):
        return False
