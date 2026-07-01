import logging
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.response import Response
import requests
from django.utils import timezone
from zoneinfo import ZoneInfo

from .analytics_notifications import notify_new_analytics_visitor
from .models import Project, AnalyticsEvent
from .serializers import ProjectSerializer, ContactMessageSerializer, AnalyticsEventSerializer
from django.core.mail import EmailMultiAlternatives
from django.utils.html import escape

from rest_framework.decorators import api_view, throttle_classes
from .throttles import (
    ContactEmailThrottle,
    ContactIPThrottle,
    ContactSubnetThrottle,
    ContactGlobalThrottle,
    ContactMessageFingerprintThrottle,
    AnalyticsThrottle,
)
from .utils.admin_links import _build_admin_change_url

logger = logging.getLogger(__name__)



class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all().order_by("sort_order", "pk")
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
@throttle_classes([
    ContactEmailThrottle,
    ContactIPThrottle,
    ContactSubnetThrottle,
    ContactGlobalThrottle,
    ContactMessageFingerprintThrottle,
])
def contact_message(request):
    logger.info("POST /contact-message/ requested")
    logger.info("Contact form submitted from IP=%s", request.META.get("REMOTE_ADDR"))

    if request.data.get("website") or request.data.get("hp"):
        logger.warning("Honeypot triggered; dropping submission")
        return Response({"detail": "ok"}, status=status.HTTP_201_CREATED)

    token = request.data.get("cf_turnstile_token")
    if not _check_turnstile(token, request.META.get("REMOTE_ADDR")):
        return Response({"detail": "captcha_failed"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = ContactMessageSerializer(data=request.data)
    if not serializer.is_valid():
        logger.warning(f"Invalid contact message submission: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        message_obj = serializer.save()
    except Exception as e:
        logger.error(f"Failed to save contact message: {e}", exc_info=True)
        return Response({"error": "Could not process your message."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    recipients = getattr(settings, "NOTIFY_EMAILS", [])
    if recipients:
        try:
            subj_prefix = getattr(settings, "EMAIL_SUBJECT_PREFIX", "")
            subject = f"{subj_prefix}📩 New Contact Message".strip()

            name = escape(message_obj.name or "")
            email_display = escape(message_obj.email or "")
            msg = escape(message_obj.message or "")

            tzname = getattr(settings, "DISPLAY_TZ", "Europe/Berlin")
            try:
                tz = ZoneInfo(tzname)
            except Exception:
                tz = timezone.get_default_timezone()

            created_dt = getattr(message_obj, "created_at", None) or timezone.now()
            created_local = timezone.localtime(created_dt, tz)
            created_human = created_local.strftime("%d %b %Y, %H:%M %Z")
            
            admin_url = _build_admin_change_url(message_obj)

            text_body = (
                f"ID: {message_obj.id}\n"
                f"Date: {created_human}\n"
                f"Name: {name}\n"
                f"Email: {email_display}\n\n"
                f"Message:\n{msg}\n\n"
                f"Admin:\n{admin_url}"
            )
            html_body = (
                f"<h3>New Contact Message</h3>"
                f"<p><strong>ID:</strong> {message_obj.id}<br>"
                f"<strong>Date:</strong> {escape(created_human)}<br>"
                f"<strong>Name:</strong> {name}<br>"
                f"<strong>Email:</strong> {email_display}</p>"
                f"<p>"
                f"<a href='{escape(admin_url)}' "
                f"style='display:inline-block;padding:10px 14px;background:#0d6efd;color:#ffffff;"
                f"text-decoration:none;border-radius:6px;'>"
                f"Open in Django Admin"
                f"</a>"
                f"</p>"
                f"<pre style='white-space:pre-wrap'>{msg}</pre>"
            )

            email_msg = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
                to=recipients,
                reply_to=[message_obj.email] if message_obj.email else None,  # raw, не escaped — email headers не HTML
            )
            email_msg.attach_alternative(html_body, "text/html")
            email_msg.send(fail_silently=False)

        except Exception as e:
            logger.error(f"Email notification failed for ID={message_obj.id}: {e}", exc_info=True)
    else:
        logger.warning(
            "No recipients configured. NOTIFY_EMAILS=%s, EMAIL_HOST_USER=%s",
            getattr(settings, "NOTIFY_EMAILS", None),
            getattr(settings, "EMAIL_HOST_USER", None),
        )

    logger.info(f"Contact message saved. ID={message_obj.id}")
    return Response({'message': 'Thank you for your message!'}, status=status.HTTP_201_CREATED)


def _check_turnstile(token: str | None, ip: str | None) -> bool:
    secret = getattr(settings, "TURNSTILE_SECRET", "")

    if not secret:
        logger.error("TURNSTILE_SECRET is not configured")
        return False

    if not token:
        return False

    try:
        response = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={
                "secret": secret,
                "response": token,
                "remoteip": ip,
            },
            timeout=3,
        )
        response.raise_for_status()
        return bool(response.json().get("success"))
    except requests.RequestException:
        logger.exception("Turnstile verification failed")
        return False
    
    

@api_view(["POST"])
@throttle_classes([AnalyticsThrottle])
def analytics_event(request):
    serializer = AnalyticsEventSerializer(data=request.data)

    if not serializer.is_valid():
        logger.warning("Invalid analytics event: %s", serializer.errors)
        return Response({"detail": "invalid_event"}, status=status.HTTP_400_BAD_REQUEST)

    country = (
        request.headers.get("CF-IPCountry")
        or request.headers.get("X-Country-Code")
        or request.headers.get("X-Vercel-IP-Country")
        or ""
    ).strip().upper()[:2]

    event = serializer.save(country=country)
    notify_new_analytics_visitor(event)

    return Response({"detail": "ok"}, status=status.HTTP_201_CREATED)