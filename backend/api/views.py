import logging
from django.conf import settings
from django.core.mail import send_mail
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Project, ContactMessage
from .serializers import ProjectSerializer, ContactMessageSerializer



logger = logging.getLogger(__name__)


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all().order_by('pk')
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
    if not serializer.is_valid():
        logger.warning(f"Invalid contact message submission: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        message_obj = serializer.save()

        subject = "📩 New Contact Message on Portfolio"
        body = (
            f"Name: {message_obj.name}\n"
            f"Email: {message_obj.email}\n\n"
            f"Message:\n{message_obj.message}"
        )

        recipients = getattr(settings, "NOTIFY_EMAILS", [])
        if recipients:
            send_mail(
                subject=f"{getattr(settings, 'EMAIL_SUBJECT_PREFIX', '')}📩 New Contact Message",
                message=(
                    f"Name: {message_obj.name}\n"
                    f"Email: {message_obj.email}\n\n"
                    f"Message:\n{message_obj.message}"
                ),
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                recipient_list=getattr(settings, "NOTIFY_EMAILS", [getattr(settings, "EMAIL_HOST_USER", "")]),
                fail_silently=False,
            )

        logger.info(f"Contact message saved and email sent. ID={message_obj.id}")
        return Response({'message': 'Thank you for your message!'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Failed to save/send contact message: {e}", exc_info=True)
        return Response(
            {"error": "Could not process your message."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
