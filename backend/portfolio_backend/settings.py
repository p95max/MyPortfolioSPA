"""
Django settings for portfolio_backend project.
"""
import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url
try:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
except ImportError:
    sentry_sdk = None



BASE_DIR = Path(__file__).resolve().parent.parent


if os.path.exists(BASE_DIR / ".env.dev"):
    load_dotenv(BASE_DIR / ".env.dev")

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "insecure-secret")

DEBUG = os.getenv("DJANGO_DEBUG", "False").lower() in ("1", "true", "yes")

ADMIN_URL = os.getenv("DJANGO_ADMIN_URL", "admin/")

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "myportfoliospa-1.onrender.com",
    "myportfoliospa.onrender.com",
    "0.0.0.0",
]

CSRF_TRUSTED_ORIGINS = [
    "https://myportfoliospa-1.onrender.com",
    "https://myportfoliospa.onrender.com",
]

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
            "USER": os.getenv("POSTGRES_USER", "maxx"),
            "PASSWORD": os.getenv("POSTGRES_PASSWORD", "0451"),
            "HOST": os.getenv("DB_HOST", "db"),
            "PORT": os.getenv("DB_PORT", "5432"),
        }
    }

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'corsheaders',
    'drf_yasg',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    "utils.new_visit.LogVisitMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'portfolio_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'portfolio_backend.wsgi.application'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = [
        "https://myportfoliospa-1.onrender.com",
        "https://myportfoliospa.onrender.com",
    ]

if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {asctime} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG' if DEBUG else 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose' if DEBUG else 'simple',
        },
        'file': {
            'level': 'DEBUG' if DEBUG else 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'django.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
            'propagate': False,
        },
        'api': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
        'portfolio_backend': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        '': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}


EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
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
    NOTIFY_EMAIL if NOTIFY_EMAIL is not None else ""
)
NOTIFY_EMAILS = [e.strip() for e in _notify_source.split(",") if e and e.strip()]

if not NOTIFY_EMAILS and EMAIL_HOST_USER:
    NOTIFY_EMAILS = [EMAIL_HOST_USER]

DISPLAY_TZ = os.getenv("DISPLAY_TZ", "Europe/Berlin")



JAZZMIN_SETTINGS = {
    "site_title": "Portfolio Admin",
    "site_header": "My Portfolio",
    "site_brand": "My Portfolio",
    "welcome_sign": "Welcome to My Portfolio Admin",
    "show_ui_builder": False,
    "topmenu_links": [
        {"name": "Docs", "url": "https://www.django-rest-framework.org/"},
        {"app": "api"},
    ],
    "icons": {
        "api.contactmessage": "fas fa-envelope",
        "api.project": "fas fa-diagram-project",
    },
}
JAZZMIN_UI_TWEAKS = {
    "theme": "flatly",
    "navbar_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
}

REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_RATES": {
        "contact_email": "5/hour",
        "contact_ip": "60/hour",
        "contact_subnet": "200/hour",
        "contact_global": "500/hour",
        "contact_fingerprint": "3/hour",
    }
}

TURNSTILE_SECRET = os.getenv("TURNSTILE_SECRET", "")

FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")


