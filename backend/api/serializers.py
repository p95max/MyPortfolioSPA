from rest_framework import serializers
from .models import Project, ContactMessage, ProjectScreenshot, AnalyticsEvent



class ProjectSerializer(serializers.ModelSerializer):
    screenshots = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_screenshots(self, obj):
        """
        Return a list of normalized relative URLs for screenshots.
        We expect frontend static files to be served from /screenshots/<name>.
        Handles legacy fixture values like "img/screenshots/..." and raw filenames.
        """
        urls = []
        qs = getattr(obj, 'screenshots', None)
        if not qs:
            return urls

        try:
            for s in qs.all():
                url = getattr(s, 'image_url', '') or ''
                if not url:
                    continue

                if url.startswith('img/screenshots/'):
                    url = '/' + url[len('img/'):]
                elif url.startswith('screenshots/'):
                    url = '/' + url
                elif not (url.startswith('/') or url.startswith('http://') or url.startswith('https://')):
                    url = '/screenshots/' + url.lstrip('/')

                urls.append(url)
        except Exception:
            pass

        return urls



class ContactMessageSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        required=True,
        min_length=2,
        max_length=80,
        trim_whitespace=True,
        error_messages={
            "blank": "Name is required.",
            "min_length": "Name must be at least 2 characters.",
            "max_length": "Name must be at most 80 characters.",
        },
    )
    email = serializers.EmailField(
        required=True,
        max_length=254,
        error_messages={
            "blank": "Email is required.",
            "invalid": "Please provide a valid email address.",
            "max_length": "Email must be at most 254 characters.",
        },
    )
    message = serializers.CharField(
        required=True,
        min_length=10,
        max_length=1000,
        trim_whitespace=True,
        error_messages={
            "blank": "Message is required.",
            "min_length": "Message must be at least 10 characters.",
            "max_length": "Message must be at most 1000 characters.",
        },
    )

    class Meta:
        model = ContactMessage
        fields = ["name", "email", "message"]

    def validate_email(self, value):
        return value.strip().lower()

def validate_message(self, value):
    message = value.strip()

    if not message:
        raise serializers.ValidationError("Message is required.")

    if message.lower().count("http://") + message.lower().count("https://") > 2:
        raise serializers.ValidationError("Message contains too many links.")

    return message
        
        

class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = [
            "event_type",
            "path",
            "referrer",
            "language",
            "source_type",
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "os",
            "browser",
            "device_type",
            "anonymous_id",
            "session_id",
            "metadata",
        ]

    def validate_path(self, value):
        value = (value or "").strip()

        if not value.startswith("/"):
            raise serializers.ValidationError("Path must start with '/'.")

        return value[:300]

    def validate_referrer(self, value):
        return (value or "").strip()[:500]

    def validate_language(self, value):
        return (value or "").strip()[:50]

    def validate_source_type(self, value):
        return (value or "").strip().lower()[:30]

    def validate_utm_source(self, value):
        return (value or "").strip()[:100]

    def validate_utm_medium(self, value):
        return (value or "").strip()[:100]

    def validate_utm_campaign(self, value):
        return (value or "").strip()[:100]

    def validate_os(self, value):
        return (value or "").strip()[:50]

    def validate_browser(self, value):
        return (value or "").strip()[:50]

    def validate_device_type(self, value):
        value = (value or "").strip().lower()[:20]

        if value not in {"mobile", "tablet", "desktop", "unknown", ""}:
            return "unknown"

        return value

    def validate_anonymous_id(self, value):
        return (value or "").strip()[:64]

    def validate_session_id(self, value):
        return (value or "").strip()[:64]

    def validate_metadata(self, value):
        if value in (None, ""):
            return {}

        if not isinstance(value, dict):
            raise serializers.ValidationError("Metadata must be an object.")

        allowed_keys = {
            "project_id",
            "project_title",
            "target",
            "url_host",
        }

        cleaned = {}

        for key, raw_value in value.items():
            if key not in allowed_keys:
                continue

            if raw_value is None:
                cleaned[key] = None
                continue

            cleaned[key] = str(raw_value).strip()[:200]

        return cleaned