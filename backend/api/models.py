from django.conf import settings
from django.db import models
from django.db.models import Max



class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    tech_stack = models.CharField(max_length=200)
    github_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    sort_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        verbose_name="Order",
        help_text="Drag & drop rows in the admin list to reorder projects.",
    )

    def save(self, *args, **kwargs):
        if not self.pk and (self.sort_order is None or self.sort_order == 0):
            max_order = Project.objects.aggregate(m=Max("sort_order"))["m"] or 0
            self.sort_order = max_order + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title



class ProjectScreenshot(models.Model):
    project = models.ForeignKey(Project, related_name='screenshots', on_delete=models.CASCADE)
    image_url = models.CharField(max_length=500, blank=True)
    caption = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"Screenshot for {self.project.title} ({self.pk})"



class ContactMessageStatus(models.TextChoices):
    NEW = "new", "New"
    IN_PROGRESS = "in_progress", "In progress"
    DONE = "done", "Done"
    SPAM = "spam", "Spam"



class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=ContactMessageStatus.choices,
        default=ContactMessageStatus.NEW,
        db_index=True,
    )
    internal_note = models.TextField(blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="processed_contact_messages",
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.name} <{self.email}>"
    
    
    
class AnalyticsEvent(models.Model):
    EVENT_PAGE_VIEW = "page_view"

    EVENT_TYPES = (
        (EVENT_PAGE_VIEW, "Page view"),
    )

    event_type = models.CharField(
        max_length=50,
        choices=EVENT_TYPES,
        default=EVENT_PAGE_VIEW,
        db_index=True,
    )
    path = models.CharField(max_length=300)
    referrer = models.CharField(max_length=500, blank=True)
    language = models.CharField(max_length=50, blank=True)
    screen_width = models.PositiveIntegerField(null=True, blank=True)
    screen_height = models.PositiveIntegerField(null=True, blank=True)

    anonymous_id = models.CharField(
        max_length=64,
        blank=True,
        db_index=True,
        help_text="Client-side anonymous id created only after analytics consent.",
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.event_type}: {self.path}"