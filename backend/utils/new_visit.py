try:
    import sentry_sdk
except ImportError:
    sentry_sdk = None

class LogVisitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if response.status_code == 200:
            if request.path == "/":
                sentry_sdk.capture_message(f"👤 User opened homepage from {request.META.get('REMOTE_ADDR')}")
            elif request.path.startswith("/admin/"):
                sentry_sdk.capture_message(f"🔐 Admin access from {request.META.get('REMOTE_ADDR')}")
            elif request.path == "/api/projects/":
                sentry_sdk.capture_message(f"📊 API projects accessed from {request.META.get('REMOTE_ADDR')}")

        return response