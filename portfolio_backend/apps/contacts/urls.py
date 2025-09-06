from django.urls import path
from apps.contacts.views import ContactCreateView

urlpatterns = [
    path('', ContactCreateView.as_view(), name='message-create'),
]
