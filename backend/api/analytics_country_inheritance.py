from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import AnalyticsEvent


@receiver(pre_save, sender=AnalyticsEvent)
def inherit_analytics_country(sender, instance: AnalyticsEvent, **kwargs):
    """Reuse a visitor's previously resolved country for later analytics events."""
    if instance.country or not instance.anonymous_id:
        return

    previous_country = (
        sender.objects.filter(
            anonymous_id=instance.anonymous_id,
        )
        .exclude(country="")
        .order_by("-created_at", "-pk")
        .values_list("country", flat=True)
        .first()
    )

    if previous_country:
        instance.country = previous_country
