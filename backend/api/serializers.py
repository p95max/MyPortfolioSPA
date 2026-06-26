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
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'message']
        
        

class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = [
            "event_type",
            "path",
            "referrer",
            "language",
            "screen_width",
            "screen_height",
            "anonymous_id",
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

    def validate_anonymous_id(self, value):
        return (value or "").strip()[:64]