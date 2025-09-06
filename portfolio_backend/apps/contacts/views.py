from rest_framework import generics
from apps.contacts.models import Contact
from apps.contacts.serializers import MessageSerializer

class ContactCreateView(generics.CreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = MessageSerializer
