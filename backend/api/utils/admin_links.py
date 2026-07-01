from django.conf import settings
from django.urls import reverse


def _build_admin_change_url(obj) -> str:
    admin_path = reverse(
        f"admin:{obj._meta.app_label}_{obj._meta.model_name}_change",
        args=[obj.pk],
    )
    return f"{settings.BACKEND_BASE_URL}{admin_path}"