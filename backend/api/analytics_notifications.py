import logging
from datetime import timedelta, timezone as datetime_timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

from .models import AnalyticsEvent
from .utils.admin_links import _build_admin_change_url
from .utils.emailing import get_notify_recipients


logger = logging.getLogger(__name__)

LOCK_TIMEOUT_SECONDS = 5 * 60
DEDUP_TIMEOUT_SECONDS = 60 * 60 * 24 * 30


def _format_visitor_time(event: AnalyticsEvent) -> str:
    if event.client_timezone:
        try:
            visitor_timezone = ZoneInfo(event.client_timezone)
            visitor_time = event.created_at.astimezone(visitor_timezone)
            return (
                visitor_time.strftime("%d.%m.%Y %H:%M")
                + f" ({event.client_timezone})"
            )
        except (ValueError, ZoneInfoNotFoundError):
            pass

    if event.utc_offset_minutes is not None:
        visitor_timezone = datetime_timezone(
            timedelta(minutes=event.utc_offset_minutes)
        )
        visitor_time = event.created_at.astimezone(visitor_timezone)
        sign = "+" if event.utc_offset_minutes >= 0 else "-"
        absolute_minutes = abs(event.utc_offset_minutes)
        hours, minutes = divmod(absolute_minutes, 60)
        return (
            visitor_time.strftime("%d.%m.%Y %H:%M")
            + f" (UTC{sign}{hours:02d}:{minutes:02d})"
        )

    return timezone.localtime(event.created_at).strftime("%d.%m.%Y %H:%M")


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

    recipients = get_notify_recipients()
    if not recipients:
        return

    cache_key = f"analytics:new-visitor-email:{event.anonymous_id}"
    if not cache.add(cache_key, "sending", timeout=LOCK_TIMEOUT_SECONDS):
        return

    try:
        has_previous_events = (
            AnalyticsEvent.objects
            .filter(anonymous_id=event.anonymous_id)
            .exclude(pk=event.pk)
            .exists()
        )
        if has_previous_events:
            cache.delete(cache_key)
            return

        created_at = _format_visitor_time(event)
        source = event.source_type or "unknown"
        path = event.path or "—"
        country = event.country or "—"
        device = event.device_type or "—"
        browser = event.browser or "—"
        os_name = event.os or "—"
        language = event.language or "—"
        session_id = event.session_id or "—"

        utm_parts = []
        if event.utm_source:
            utm_parts.append(f"source={event.utm_source}")
        if event.utm_medium:
            utm_parts.append(f"medium={event.utm_medium}")
        if event.utm_campaign:
            utm_parts.append(f"campaign={event.utm_campaign}")

        context = {
            "source": source,
            "utm_text": ", ".join(utm_parts) if utm_parts else "—",
            "path": path,
            "country": country,
            "device": device,
            "browser": browser,
            "os_name": os_name,
            "language": language,
            "client_timezone": event.client_timezone or "—",
            "created_at": created_at,
            "anonymous_id": event.anonymous_id,
            "session_id": session_id,
            "admin_url": _build_admin_change_url(event),
        }

        text_body = render_to_string(
            "emails/analytics_new_visitor.txt",
            context,
        ).strip()
        html_body = render_to_string(
            "emails/analytics_new_visitor.html",
            context,
        ).strip()

        subject_prefix = getattr(settings, "EMAIL_SUBJECT_PREFIX", "[Portfolio] ")
        email_msg = EmailMultiAlternatives(
            subject=f"{subject_prefix}🔎 New visitor from: {source} {path}".strip(),
            body=text_body,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            to=recipients,
        )
        email_msg.attach_alternative(html_body, "text/html")
        email_msg.send(fail_silently=False)

        cache.set(cache_key, "sent", timeout=DEDUP_TIMEOUT_SECONDS)
    except Exception:
        cache.delete(cache_key)
        logger.exception(
            "Failed to send analytics visitor notification for event ID=%s",
            event.pk,
        )
