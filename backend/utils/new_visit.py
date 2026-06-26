from django.conf import settings

try:
    import sentry_sdk
except ImportError:
    sentry_sdk = None


class LogVisitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if response.status_code != 200 or sentry_sdk is None:
            return response

        remote_addr = request.META.get("REMOTE_ADDR")

        if request.path == "/":
            sentry_sdk.capture_message(
                f"👤 User opened homepage from {remote_addr}",
                level="info",
            )
        elif request.path.startswith(f"/{settings.ADMIN_URL}".replace("//", "/")):
            sentry_sdk.capture_message(
                f"🔐 Admin access from {remote_addr}",
                level="info",
            )
        elif request.path == "/api/projects/":
            sentry_sdk.capture_message(
                f"📊 API projects opened from {remote_addr}",
                level="info",
            )

        return response