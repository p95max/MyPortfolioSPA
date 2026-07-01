from django.utils.html import format_html


def admin_badge(
    *,
    text: str,
    color: str,
    nowrap: bool = False,
) -> str:
    white_space = "white-space:nowrap;" if nowrap else ""

    return admin_badge(
        text=obj.get_status_display(),
        color=colors.get(obj.status, "#6b7280"),
    )