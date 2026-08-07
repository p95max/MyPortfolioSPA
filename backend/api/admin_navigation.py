from types import MethodType

from django.conf import settings
from django.contrib import admin
from django.utils.html import format_html

from .models import AnalyticsEvent


ADMIN_GROUPS = (
    (
        "Content & settings",
        "content_settings",
        ("HomepageContent", "LegalContent", "ContactDetails"),
    ),
    (
        "Portfolio",
        "portfolio_content",
        ("Project", "ProjectScreenshot", "Credential"),
    ),
    (
        "Communication & analytics",
        "communication_analytics",
        ("ContactMessage", "AnalyticsEvent"),
    ),
)

GROUP_ICONS = {
    "content_settings": "fas fa-sliders-h",
    "portfolio_content": "fas fa-briefcase",
    "communication_analytics": "fas fa-comments",
}

MODEL_ICON_ALIASES = {
    "content_settings.homepagecontent": "fas fa-home",
    "content_settings.legalcontent": "fas fa-user-shield",
    "content_settings.contactdetails": "fas fa-address-card",
    "portfolio_content.project": "fas fa-laptop-code",
    "portfolio_content.projectscreenshot": "fas fa-images",
    "portfolio_content.credential": "fas fa-award",
    "communication_analytics.contactmessage": "fas fa-envelope-open-text",
    "communication_analytics.analyticsevent": "fas fa-chart-line",
}


def _configure_group_icons():
    icons = settings.JAZZMIN_SETTINGS.setdefault("icons", {})
    icons.update(GROUP_ICONS)
    icons.update(MODEL_ICON_ALIASES)


def _configure_analytics_admin():
    model_admin = admin.site._registry.get(AnalyticsEvent)
    if model_admin is None:
        return

    admin_class = type(model_admin)
    if hasattr(admin_class, "_portfolio_original_event_badge"):
        return

    admin_class._portfolio_original_event_badge = admin_class.event_badge
    admin_class._portfolio_original_details_summary = admin_class.details_summary

    @admin.display(description="Event", ordering="event_type")
    def event_badge(self, obj):
        if obj.event_type != AnalyticsEvent.EVENT_PROJECT_DEMO_CLICK:
            return self._portfolio_original_event_badge(obj)

        return format_html(
            '<span style="'
            'padding:4px 8px;'
            'border-radius:999px;'
            'background:#0284c7;'
            'color:white;'
            'font-weight:600;'
            'font-size:12px;'
            'white-space:nowrap;'
            '">{}</span>',
            obj.get_event_type_display(),
        )

    @admin.display(description="Details")
    def details_summary(self, obj):
        if obj.event_type == AnalyticsEvent.EVENT_PROJECT_DEMO_CLICK:
            metadata = obj.metadata or {}
            return metadata.get("project_title") or metadata.get("project_id") or "—"

        return self._portfolio_original_details_summary(obj)

    admin_class.event_badge = event_badge
    admin_class.details_summary = details_summary


def _group_api_admin_models(app_list):
    """Split the API models into task-oriented admin menu sections."""
    grouped_app_list = []

    for app in app_list:
        if app.get("app_label") != "api":
            grouped_app_list.append(app)
            continue

        models_by_name = {
            model.get("object_name"): model
            for model in app.get("models", [])
        }
        grouped_names = set()

        for group_name, group_label, object_names in ADMIN_GROUPS:
            models = [
                models_by_name[name]
                for name in object_names
                if name in models_by_name
            ]
            if not models:
                continue

            grouped_names.update(object_names)
            grouped_app_list.append(
                {
                    **app,
                    "name": group_name,
                    "app_label": group_label,
                    "models": models,
                }
            )

        remaining_models = [
            model
            for name, model in models_by_name.items()
            if name not in grouped_names
        ]
        if remaining_models:
            grouped_app_list.append({**app, "models": remaining_models})

    return grouped_app_list


def _get_grouped_app_list(self, request, app_label=None):
    original_get_app_list = self._portfolio_original_get_app_list
    app_list = original_get_app_list(request, app_label)

    if app_label is not None:
        return app_list

    return _group_api_admin_models(app_list)


def configure_admin_navigation():
    """Install custom admin grouping and analytics presentation once."""
    _configure_group_icons()
    _configure_analytics_admin()

    if hasattr(admin.site, "_portfolio_original_get_app_list"):
        return

    admin.site._portfolio_original_get_app_list = admin.site.get_app_list
    admin.site.get_app_list = MethodType(_get_grouped_app_list, admin.site)


configure_admin_navigation()
