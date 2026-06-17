from rest_framework import serializers
from .models import Project, ContactMessage, ProjectScreenshot



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
        fields = '__all__'