from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        from . import checks  # noqa: F401
        from . import homepage_content  # noqa: F401
        from . import legal_content  # noqa: F401
        from . import admin_navigation  # noqa: F401
