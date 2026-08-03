from types import MethodType

from django.contrib import admin


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
    """Install the custom admin grouping once, including under autoreload."""
    if hasattr(admin.site, "_portfolio_original_get_app_list"):
        return

    admin.site._portfolio_original_get_app_list = admin.site.get_app_list
    admin.site.get_app_list = MethodType(_get_grouped_app_list, admin.site)


configure_admin_navigation()
