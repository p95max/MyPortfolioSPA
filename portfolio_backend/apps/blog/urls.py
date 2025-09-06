from django.urls import path
from apps.blog.views import PostListView, PostDetailView

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
]
