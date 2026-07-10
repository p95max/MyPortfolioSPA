from django.conf import settings
from django.core.checks import Error, Tags, register


INSECURE_BUILD_SECRET = "insecure-secret-for-build-and-local-dev-only"


@register(Tags.security, deploy=True)
def production_security_checks(app_configs, **kwargs):
    if settings.DEBUG:
        return []

    errors = []

    if not settings.SECRET_KEY or settings.SECRET_KEY == INSECURE_BUILD_SECRET:
        errors.append(
            Error(
                "DJANGO_SECRET_KEY must be configured with a non-default value in production.",
                id="portfolio.E001",
            )
        )

    if not getattr(settings, "TURNSTILE_SECRET", ""):
        errors.append(
            Error(
                "TURNSTILE_SECRET must be configured in production.",
                id="portfolio.E002",
            )
        )

    configured_hosts = {
        host
        for host in getattr(settings, "ALLOWED_HOSTS", [])
        if host not in {"localhost", "127.0.0.1", "testserver"}
    }
    if not configured_hosts:
        errors.append(
            Error(
                "A production hostname must be configured in ALLOWED_HOSTS.",
                id="portfolio.E003",
            )
        )

    backend_base_url = getattr(settings, "BACKEND_BASE_URL", "")
    if not backend_base_url.startswith("https://"):
        errors.append(
            Error(
                "BACKEND_BASE_URL must use HTTPS in production.",
                id="portfolio.E004",
            )
        )

    return errors
