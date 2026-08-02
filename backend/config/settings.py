"""
Django settings for config project.
"""

import os
from pathlib import Path
from datetime import timedelta

import dj_database_url
from dotenv import load_dotenv


# =============================================================================
# Base paths and environment
# =============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent

if os.path.exists(BASE_DIR / ".env.dev"):
    load_dotenv(BASE_DIR / ".env.dev")


def split_env_list(name: str) -> list[str]:
    """
    Read comma-separated environment variable into a clean list.
    Example:
    CORS_ALLOWED_ORIGINS=https://a.com,https://b.com
    """
    return [
        value.strip()
        for value in os.getenv(name, "").split(",")
        if value.strip()
    ]

def int_env(name: str, default: int) -> int:
    raw = os.getenv(name)

    if raw is None or raw == "":
        return default

    try:
        return int(raw)
    except ValueError:
        return default

# =============================================================================
# Core Django settings
# =============================================================================

DEBUG = os.getenv("DJANGO_DEBUG", "False").lower() in ("1", "true", "yes")

SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "insecure-secret-for-build-and-local-dev-only",
)

ADMIN_URL = os.getenv("DJANGO_ADMIN_URL", "admin/")

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Europe/Berlin"
USE_I18N = True
USE_TZ = True


# =============================================================================
# Hosts and CSRF
# =============================================================================

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]

_primary_host = os.getenv("ALLOWED_HOST", "")
if _primary_host:
    ALLOWED_HOSTS.append(_primary_host)

ALLOWED_HOSTS += split_env_list("EXTRA_ALLOWED_HOSTS")

CSRF_TRUSTED_ORIGINS = split_env_list("CSRF_TRUSTED_ORIGINS")


# =============================================================================
# Applications
# =============================================================================

INSTALLED_APPS = [
    # Third-party admin extensions
    "adminsortable2",
    "jazzmin",

    # Django apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "axes",

    # Third-party API/security apps
    "rest_framework",
    "corsheaders",
    "drf_yasg",

    # Local apps
    "api",
]


# =============================================================================
# Middleware
# =============================================================================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "axes.middleware.AxesMiddleware",
]


# =============================================================================
# Templates
# =============================================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# =============================================================================
# Database
# =============================================================================

if os.getenv("DATABASE_URL"):
    DATABASES = {
        "default": dj_database_url.config(
            default=os.getenv("DATABASE_URL"),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.getenv("POSTGRES_DB", "port_db"),
            "USER": os.getenv("POSTGRES_USER", "admin"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD", "12345678"),
            "HOST": os.getenv("DB_HOST", "db"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }


# =============================================================================
# Password validation
# =============================================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# =============================================================================
# Static files
# =============================================================================

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"


# =============================================================================
# Cache / Redis
# Used by DRF throttling.
# =============================================================================

REDIS_URL = os.getenv("REDIS_URL")

if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": REDIS_URL,
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "portfolio-local-cache",
        }
    }

if not DEBUG and not REDIS_URL:
    import warnings

    warnings.warn(
        "REDIS_URL is not configured in production. "
        "DRF throttling uses LocMemCache and will not be shared across workers.",
        RuntimeWarning,
    )

# =============================================================================
# CORS
# =============================================================================

CORS_ALLOW_CREDENTIALS = False

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = split_env_list("CORS_ALLOWED_ORIGINS")


# =============================================================================
# Production security
# =============================================================================

if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"

    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_SAMESITE = "Lax"

    SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"


# =============================================================================
# Django REST Framework
# =============================================================================

DRF_NUM_PROXIES = int_env(
    "DRF_NUM_PROXIES",
    int_env("NUM_PROXIES", 0),
)

REST_FRAMEWORK = {
    "NUM_PROXIES": DRF_NUM_PROXIES,
    "DEFAULT_THROTTLE_RATES": {
        "contact_email": "3/hour",
        "contact_ip": "20/hour",
        "contact_subnet": "60/hour",
        "contact_global": "100/hour",
        "contact_fingerprint": "3/hour",
        "analytics": "30/minute",
        "analytics_global": "1000/hour",
    }
}


# =============================================================================
# Email notifications
# =============================================================================

EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = 587
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

EMAIL_SUBJECT_PREFIX = "[Portfolio] "

NOTIFY_EMAIL = os.getenv("NOTIFY_EMAIL", os.getenv("EMAIL_HOST_USER", ""))

_notify_source = os.getenv(
    "NOTIFY_EMAILS",
    NOTIFY_EMAIL if NOTIFY_EMAIL is not None else "",
)

NOTIFY_EMAILS = [
    email.strip()
    for email in _notify_source.split(",")
    if email and email.strip()
]

if not NOTIFY_EMAILS and EMAIL_HOST_USER:
    NOTIFY_EMAILS = [EMAIL_HOST_USER]

DISPLAY_TZ = os.getenv("DISPLAY_TZ", "Europe/Berlin")


ANALYTICS_NEW_VISITOR_EMAIL_ENABLED = (
    os.getenv("ANALYTICS_NEW_VISITOR_EMAIL_ENABLED", "False").lower() == "true"
)

ANALYTICS_NOTIFY_DIRECT_VISITORS = (
    os.getenv("ANALYTICS_NOTIFY_DIRECT_VISITORS", "False").lower() == "true"
)


# =============================================================================
# External services
# =============================================================================

TURNSTILE_SECRET = os.getenv("TURNSTILE_SECRET", "")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000").rstrip("/")
TRUST_ANALYTICS_GEO_HEADERS = (
    os.getenv("TRUST_ANALYTICS_GEO_HEADERS", "False").lower()
    in ("1", "true", "yes", "on")
)
_analytics_geoip_default = "False" if DEBUG else "True"
ANALYTICS_GEOIP_LOOKUP_ENABLED = (
    os.getenv("ANALYTICS_GEOIP_LOOKUP_ENABLED", _analytics_geoip_default).lower()
    in ("1", "true", "yes", "on")
)
ANALYTICS_GEOIP_LOOKUP_URL = os.getenv(
    "ANALYTICS_GEOIP_LOOKUP_URL",
    "https://api.country.is/{ip}",
)
ANALYTICS_GEOIP_TIMEOUT_SECONDS = 1.5


# =============================================================================
# Logging
# =============================================================================

LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,

    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {asctime} {message}",
            "style": "{",
        },
    },

    "handlers": {
        "console": {
            "level": "DEBUG" if DEBUG else "INFO",
            "class": "logging.StreamHandler",
            "formatter": "verbose" if DEBUG else "simple",
        },
        "file": {
            "level": "DEBUG" if DEBUG else "INFO",
            "class": "logging.FileHandler",
            "filename": BASE_DIR / "django.log",
            "formatter": "verbose",
        },
    },

    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console", "file"],
            "level": "WARNING",
            "propagate": False,
        },
        "api": {
            "handlers": ["console", "file"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
        "config": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "": {
            "handlers": ["console", "file"],
            "level": "WARNING",
            "propagate": False,
        },
    },
}


# =============================================================================
# Jazzmin admin
# =============================================================================

JAZZMIN_SETTINGS = {
    "site_title": "Portfolio Admin",
    "site_header": "My Portfolio",
    "site_brand": "My Portfolio",
    "welcome_sign": "Welcome to My Portfolio Admin",
    "show_ui_builder": True,
    "topmenu_links": [
        {"name": "Docs", "url": "https://www.django-rest-framework.org/"},
        {"app": "api"},
    ],
    "icons": {
        "api": "fas fa-layer-group",
        "api.project": "fas fa-laptop-code",
        "api.projectscreenshot": "fas fa-images",
        "api.credential": "fas fa-award",
        "api.contactdetails": "fas fa-address-card",
        "api.contactmessage": "fas fa-envelope-open-text",
        "api.analyticsevent": "fas fa-chart-line",
        "auth": "fas fa-user-shield",
        "auth.user": "fas fa-user",
        "auth.group": "fas fa-users",
        "axes": "fas fa-shield-alt",
        "axes.accessattempt": "fas fa-user-lock",
        "axes.accesslog": "fas fa-clipboard-list",
        "axes.accessfailurelog": "fas fa-exclamation-triangle",
    },
}

JAZZMIN_UI_TWEAKS = {
    "theme": "darkly",
    "navbar_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
}


AUTHENTICATION_BACKENDS = [
    "axes.backends.AxesStandaloneBackend",
    "django.contrib.auth.backends.ModelBackend",
]

AXES_FAILURE_LIMIT = int_env("AXES_FAILURE_LIMIT", 5)
AXES_COOLOFF_TIME = timedelta(minutes=int_env("AXES_COOLOFF_MINUTES", 30))
AXES_LOCK_OUT_BY_COMBINATION_USER_AND_IP = True
