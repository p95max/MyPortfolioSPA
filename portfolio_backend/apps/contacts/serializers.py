from rest_framework import serializers
from apps.contacts.models import Contact

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'
