from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from django.utils.html import escape

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


def _format_source_label(source_type: str) -> str:
    labels = {
        "direct": "Direct",
        "linkedin": "LinkedIn",
        "github": "GitHub",
        "search": "Search",
        "social": "Social",
        "referral": "Referral",
    }

    return labels.get(source_type or "", source_type or "Unknown")


def _format_source_emoji(source_type: str) -> str:
    emojis = {
        "direct": "➡️",
        "linkedin": "💼",
        "github": "🐙",
        "search": "🔎",
        "social": "📣",
        "referral": "🔗",
    }

    return emojis.get(source_type or "", "👀")


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

    source_type = event.source_type or "unknown"
    source_label = _format_source_label(source_type)
    source_emoji = _format_source_emoji(source_type)

    country = event.country or "—"
    device = event.device_type or "—"
    browser = event.browser or "—"
    os_name = event.os or "—"
    language = event.language or "—"
    path = event.path or "—"

    utm_parts = []

    if event.utm_source:
        utm_parts.append(f"source={event.utm_source}")

    if event.utm_medium:
        utm_parts.append(f"medium={event.utm_medium}")

    if event.utm_campaign:
        utm_parts.append(f"campaign={event.utm_campaign}")

    utm_text = ", ".join(utm_parts) if utm_parts else "—"

    subject_prefix = getattr(settings, "EMAIL_SUBJECT_PREFIX", "[Portfolio]")
    subject = f"{subject_prefix} {source_emoji} New visitor from {source_label}"

    text_body = (
        "👀 New portfolio visitor\n\n"
        "📍 Source\n"
        f"Source: {source_label}\n"
        f"UTM: {utm_text}\n"
        f"Path: {path}\n\n"
        "🖥 Device\n"
        f"Country: {country}\n"
        f"Device: {device}\n"
        f"Browser: {browser}\n"
        f"OS: {os_name}\n"
        f"Language: {language}\n\n"
        "🕒 Time\n"
        f"{created_at}\n\n"
        "🔎 Tracking\n"
        f"Anonymous ID: {event.anonymous_id}\n"
        f"Session ID: {event.session_id or '—'}\n\n"
        "Open Django Admin to review further actions from this visitor."
    )

    html_body = (
        "<h3>👀 New portfolio visitor</h3>"
        "<p>A new visitor reached your portfolio website.</p>"

        "<h4>📍 Source</h4>"
        "<p>"
        f"<strong>Source:</strong> {escape(source_label)}<br>"
        f"<strong>UTM:</strong> {escape(utm_text)}<br>"
        f"<strong>Path:</strong> {escape(path)}"
        "</p>"

        "<h4>🖥 Device</h4>"
        "<p>"
        f"<strong>Country:</strong> {escape(country)}<br>"
        f"<strong>Device:</strong> {escape(device)}<br>"
        f"<strong>Browser:</strong> {escape(browser)}<br>"
        f"<strong>OS:</strong> {escape(os_name)}<br>"
        f"<strong>Language:</strong> {escape(language)}"
        "</p>"

        "<h4>🕒 Time</h4>"
        f"<p>{escape(created_at)}</p>"

        "<h4>🔎 Tracking</h4>"
        "<p>"
        f"<strong>Anonymous ID:</strong> {escape(event.anonymous_id)}<br>"
        f"<strong>Session ID:</strong> {escape(event.session_id or '—')}"
        "</p>"

        "<p><em>Open Django Admin to review further actions from this visitor.</em></p>"
    )

    email_msg = EmailMultiAlternatives(
        subject=subject.strip(),
        body=text_body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        to=recipients,
    )
    email_msg.attach_alternative(html_body, "text/html")
    email_msg.send(fail_silently=True)