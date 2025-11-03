from rest_framework import serializers
from .models import Project, ContactMessage

class ProjectSerializer(serializers.ModelSerializer):
    screenshots = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_screenshots(self, obj):
        request = self.context.get('request', None)
        urls = []
        for s in getattr(obj, 'screenshots', []).all() if hasattr(obj, 'screenshots') else []:
            try:
                if not getattr(s, 'image', None):
                    continue
                url = s.image.url
                if request:
                    url = request.build_absolute_uri(url)
                urls.append(url)
            except Exception:
                continue
        return urls

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'