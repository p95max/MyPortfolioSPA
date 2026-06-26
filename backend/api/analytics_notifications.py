from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.utils import timezone

from .models import AnalyticsEvent


def _get_notify_recipients() -> list[str]:
    notify_emails = getattr(settings, "NOTIFY_EMAILS", None)

    if isinstance(notify_emails, list):
        return [email for email in notify_emails if email]

    if isinstance(notify_emails, str):
        return [email.strip() for email in notify_emails.split(",") if email.strip()]

    notify_email = getattr(settings, "NOTIFY_EMAIL", "")

    if notify_email:
        return [notify_email]

    return []


def notify_new_analytics_visitor(event: AnalyticsEvent) -> None:
    if not getattr(settings, "ANALYTICS_NEW_VISITOR_EMAIL_ENABLED", False):
        return

    if event.event_type != AnalyticsEvent.EVENT_PAGE_VIEW:
        return

    if not event.anonymous_id:
        return

    if (
        event.source_type == "direct"
        and not getattr(settings, "ANALYTICS_NOTIFY_DIRECT_VISITORS", False)
    ):
        return

    recipients = _get_notify_recipients()

    if not recipients:
        return

    cache_key = f"analytics:new-visitor-email:{event.anonymous_id}"

    if not cache.add(cache_key, "1", timeout=60 * 60 * 24 * 30):
        return

    has_previous_events = (
        AnalyticsEvent.objects
        .filter(anonymous_id=event.anonymous_id)
        .exclude(pk=event.pk)
        .exists()
    )

    if has_previous_events:
        return


    created_at = timezone.localtime(event.created_at).strftime("%d.%m.%Y %H:%M")

    source = event.source_type or "unknown"
    country = event.country or "—"
    device = event.device_type or "—"
    browser = event.browser or "—"
    os_name = event.os or "—"

    utm_parts = []

    if event.utm_source:
        utm_parts.append(f"source={event.utm_source}")

    if event.utm_medium:
        utm_parts.append(f"medium={event.utm_medium}")

    if event.utm_campaign:
        utm_parts.append(f"campaign={event.utm_campaign}")

    utm_text = ", ".join(utm_parts) if utm_parts else "—"

    subject = f"[Portfolio] 🔎 New visitor from: {source} {event.path}"

    message = (
        "👀 New portfolio visitor\n\n"
        "📍 Source\n"
        f"Source type: {source}\n"
        f"UTM: {utm_text}\n"
        f"Path: {event.path}\n\n"
        "🖥 Device\n"
        f"Country: {country}\n"
        f"Device: {device}\n"
        f"Browser: {browser}\n"
        f"OS: {os_name}\n"
        f"Language: {event.language or '—'}\n\n"
        "🕒 Time\n"
        f"{created_at}\n\n"
        "🔎 Tracking\n"
        f"Anonymous ID: {event.anonymous_id}\n"
        f"Session ID: {event.session_id or '—'}\n\n"
        "Open Django Admin to review further actions from this visitor."
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        recipient_list=recipients,
        fail_silently=True,
    )