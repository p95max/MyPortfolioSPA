import logging
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Project
from .serializers import ProjectSerializer, ContactMessageSerializer
from django.core.mail import EmailMultiAlternatives
from django.utils.html import escape



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

        recipients = getattr(settings, "NOTIFY_EMAILS", [])
        if recipients:
            subj_prefix = getattr(settings, "EMAIL_SUBJECT_PREFIX", "")
            subject = f"{subj_prefix}📩 New Contact Message".strip()

            name = escape(message_obj.name or "")
            email = escape(message_obj.email or "")
            msg = escape(message_obj.message or "")
            created_at = escape(message_obj.created_at or "")

            text_body = (
                f"Date: {created_at}\n"
                f"Name: {name}\n"
                f"Email: {email}\n\n"
                f"Message:\n{msg}"
            )
            html_body = (
                f"<h3>You received a New Contact Message</h3>"
                f"<p><strong>Date:</strong> {created_at}<br>"
                f"<p><strong>Name:</strong> {name}<br>"
                f"<strong>Email:</strong> {email}</p><br>"
                f"<p>Check it on your admin panel</p>"
                f"<pre style='white-space:pre-wrap'>{msg}</pre>"
            )

            email_msg = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                to=recipients,
                reply_to=[message_obj.email] if message_obj.email else None,
            )
            email_msg.attach_alternative(html_body, "text/html")
            email_msg.send(fail_silently=False)
        else:
            logger.warning(
                "No recipients configured. NOTIFY_EMAILS=%s, NOTIFY_EMAIL=%s, EMAIL_HOST_USER=%s",
                getattr(settings, "NOTIFY_EMAILS", None),
                getattr(settings, "NOTIFY_EMAIL", None),
                getattr(settings, "EMAIL_HOST_USER", None),
            )

        logger.info(f"Contact message saved and notification processed. ID={message_obj.id}")
        return Response({'message': 'Thank you for your message!'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Failed to save/send contact message: {e}", exc_info=True)
        return Response({"error": "Could not process your message."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
