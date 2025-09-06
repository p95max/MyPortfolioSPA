from django.urls import path
from apps.contacts.views import ContactCreateView

urlpatterns = [
    path('contacts/', ContactCreateView.as_view()),
]
