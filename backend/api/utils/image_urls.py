from django.conf import settings


def is_absolute_url(value: str) -> bool:
    return value.startswith("http://") or value.startswith("https://")


def normalize_screenshot_url(value: str) -> str:
    url = (value or "").strip()

    if not url:
        return ""

    if is_absolute_url(url):
        return url

    if url.startswith("img/screenshots/"):
        return "/" + url[len("img/"):]

    if url.startswith("screenshots/"):
        return "/" + url

    if url.startswith("/"):
        return url

    return "/screenshots/" + url.lstrip("/")


def build_public_image_url(value: str) -> str:
    url = normalize_screenshot_url(value)

    if not url:
        return ""

    if is_absolute_url(url):
        return url

    if url.startswith("/"):
        base = (getattr(settings, "FRONTEND_BASE_URL", "") or "").rstrip("/")
        return f"{base}{url}" if base else url

    return url