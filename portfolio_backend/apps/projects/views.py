from rest_framework import generics
from apps.projects.models import Project
from apps.projects.serializers import ProjectSerializer

class ProjectListView(generics.ListAPIView):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer

class ProjectDetailView(generics.RetrieveAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
