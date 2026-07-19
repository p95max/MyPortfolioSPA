from .settings import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "test_db.sqlite3",
    }
}

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

TURNSTILE_SECRET = "test-turnstile-secret"
BACKEND_BASE_URL = "http://testserver"
NOTIFY_EMAILS = ["owner@example.com"]
ANALYTICS_GEOIP_LOOKUP_ENABLED = False

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

SWAGGER_USE_COMPAT_RENDERERS = False
