import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Project, ContactMessage
from .serializers import ProjectSerializer, ContactMessageSerializer

logger = logging.getLogger(__name__)

class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def list(self, request, *args, **kwargs):
        logger.info("GET /projects/ requested")
        try:
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned {len(response.data)} projects")
            return response
        except Exception as e:
            logger.error(f"Error fetching projects: {e}", exc_info=True)
            return Response(
                {"error": "Something went wrong while fetching projects"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(['POST'])
def contact_message(request):
    logger.info("POST /contact-message/ requested")
    logger.debug(f"Request data: {request.data}")

    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        try:
            message = serializer.save()
            logger.info(f"New contact message saved with ID {message.id}")
            return Response(
                {'message': 'Thank you for your message!'},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Failed to save contact message: {e}", exc_info=True)
            return Response(
                {"error": "Could not save your message."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    logger.warning(f"Invalid contact message submission: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)