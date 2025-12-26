from django.contrib import admin
from django.utils.html import format_html

from .models import Project, ProjectScreenshot, ContactMessage


class ProjectScreenshotInline(admin.TabularInline):
    model = ProjectScreenshot
    extra = 0
    fields = ("caption", "image_url", "preview")
    readonly_fields = ("preview",)

    @admin.display(description="Preview")
    def preview(self, obj: ProjectScreenshot):
        url = (obj.image_url or "").strip()
        if not url:
            return "—"
        return format_html(
            '<a href="{0}" target="_blank" rel="noopener">'
            '<img src="{0}" style="height:80px; width:auto; border-radius:6px; border:1px solid #ddd;" />'
            "</a>",
            url,
        )


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "tech_stack", "github_url", "demo_url", "screenshots_count")
    search_fields = ("title", "description", "tech_stack")
    inlines = (ProjectScreenshotInline,)

    @admin.display(description="Screenshots", ordering=None)
    def screenshots_count(self, obj: Project):
        return obj.screenshots.count()


@admin.register(ProjectScreenshot)
class ProjectScreenshotAdmin(admin.ModelAdmin):
    list_display = ("project", "caption", "image_link", "preview")
    search_fields = ("project__title", "caption", "image_url")
    list_filter = ("project",)
    fields = ("project", "caption", "image_url", "preview")
    readonly_fields = ("preview",)

    @admin.display(description="Image")
    def image_link(self, obj: ProjectScreenshot):
        url = (obj.image_url or "").strip()
        if not url:
            return "—"
        return format_html('<a href="{0}" target="_blank" rel="noopener">{0}</a>', url)

    @admin.display(description="Preview")
    def preview(self, obj: ProjectScreenshot):
        url = (obj.image_url or "").strip()
        if not url:
            return "—"
        return format_html(
            '<a href="{0}" target="_blank" rel="noopener">'
            '<img src="{0}" style="height:80px; width:auto; border-radius:6px; border:1px solid #ddd;" />'
            "</a>",
            url,
        )


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "created_at")
    search_fields = ("name", "email", "message")
    list_filter = ("created_at",)
