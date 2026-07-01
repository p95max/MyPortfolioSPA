from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def get_notify_recipients() -> list[str]:
    notify_emails = getattr(settings, "NOTIFY_EMAILS", None)

    if isinstance(notify_emails, list):
        return [email.strip() for email in notify_emails if email and email.strip()]

    if isinstance(notify_emails, str):
        return [
            email.strip()
            for email in notify_emails.split(",")
            if email.strip()
        ]

    notify_email = getattr(settings, "NOTIFY_EMAIL", "")

    if notify_email:
        return [notify_email.strip()]

    email_host_user = getattr(settings, "EMAIL_HOST_USER", "")

    if email_host_user:
        return [email_host_user.strip()]

    return []


def build_subject(title: str) -> str:
    prefix = getattr(settings, "EMAIL_SUBJECT_PREFIX", "")
    return f"{prefix}{title}".strip()


def send_template_email(
    *,
    subject: str,
    text_template: str,
    html_template: str,
    context: dict,
    recipients: list[str],
    reply_to: list[str] | None = None,
    fail_silently: bool = False,
) -> None:
    text_body = render_to_string(text_template, context).strip()
    html_body = render_to_string(html_template, context).strip()

    email_msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
        to=recipients,
        reply_to=reply_to,
    )

    email_msg.attach_alternative(html_body, "text/html")
    email_msg.send(fail_silently=fail_silently)