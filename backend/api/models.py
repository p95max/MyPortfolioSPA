from django.conf import settings
from django.db import models
from django.db.models import Max


class CredentialType(models.TextChoices):
    CERTIFICATE = "certificate", "Certificate"
    BADGE = "badge", "Badge"


class CredentialCategory(models.TextChoices):
    BACKEND = "backend", "Backend"
    PYTHON = "python", "Python"
    DATABASE = "database", "Database"
    DOCKER = "docker", "Docker"
    CLOUD = "cloud", "Cloud"
    LINUX = "linux", "Linux"
    NETWORKING = "networking", "Networking"
    SECURITY = "security", "Security"
    OTHER = "other", "Other"


class Credential(models.Model):
    """Shared domain model for certificates and course badges.

    Skills are stored as a JSON list of short strings, for example
    ["Python", "Django", "PostgreSQL"].
    """

    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200)
    credential_type = models.CharField(
        max_length=20,
        choices=CredentialType.choices,
    )
    description = models.TextField(blank=True)
    issued_at = models.DateField()
    credential_id = models.CharField(max_length=200, blank=True)
    credential_url = models.URLField(blank=True)
    image_url = models.CharField(max_length=500)
    category = models.CharField(
        max_length=20,
        choices=CredentialCategory.choices,
        default=CredentialCategory.OTHER,
    )
    skills = models.JSONField(
        default=list,
        blank=True,
        help_text='List of short tags, for example ["Python", "Django"].',
    )
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        verbose_name="Order",
        help_text="Drag & drop rows in the admin list to reorder credentials.",
    )

    class Meta:
        verbose_name = "Credential"
        verbose_name_plural = "Credentials"
        ordering = ("sort_order", "id")

    def save(self, *args, **kwargs):
        if not self.pk and (self.sort_order is None or self.sort_order == 0):
            max_order = Credential.objects.aggregate(m=Max("sort_order"))["m"] or 0
            self.sort_order = max_order + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.get_credential_type_display()})"



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
    sort_order = models.PositiveIntegerField(
        default=0,
        db_index=True,
        verbose_name="Order",
        help_text="Drag & drop rows in the admin list to choose screenshot order.",
    )

    class Meta:
        ordering = ("sort_order", "id")

    def save(self, *args, **kwargs):
        if not self.pk and (self.sort_order is None or self.sort_order == 0):
            max_order = (
                ProjectScreenshot.objects.aggregate(m=Max("sort_order"))["m"]
                or 0
            )
            self.sort_order = max_order + 1
        super().save(*args, **kwargs)

    def __str__(self):
        label = self.caption.strip() if self.caption else "Screenshot"
        return f"{label} ({self.pk})"



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
    EVENT_PROJECT_VIEW = "project_view"
    EVENT_PROJECT_GITHUB_CLICK = "project_github_click"
    EVENT_CONTACT_SUBMIT = "contact_submit"
    EVENT_OUTBOUND_LINK_CLICK = "outbound_link_click"

    EVENT_TYPES = (
        (EVENT_PAGE_VIEW, "Page view"),
        (EVENT_PROJECT_VIEW, "Project view"),
        (EVENT_PROJECT_GITHUB_CLICK, "Project GitHub click"),
        (EVENT_CONTACT_SUBMIT, "Contact form submit"),
        (EVENT_OUTBOUND_LINK_CLICK, "Outbound link click"),
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

    country = models.CharField(max_length=2, blank=True, db_index=True)
    source_type = models.CharField(
        max_length=30,
        blank=True,
        default="",
        db_index=True,
        help_text="Normalized traffic source: direct, search, linkedin, github, social, referral, unknown.",
    )

    utm_source = models.CharField(max_length=100, blank=True, default="")
    utm_medium = models.CharField(max_length=100, blank=True, default="")
    utm_campaign = models.CharField(max_length=100, blank=True, default="")

    os = models.CharField(max_length=50, blank=True)
    browser = models.CharField(max_length=50, blank=True, default="")
    device_type = models.CharField(
        max_length=20,
        blank=True,
        default="",
        db_index=True,
        help_text="mobile, tablet, desktop or unknown.",
    )

    # Legacy fields. Kept for backward compatibility, no longer sent by frontend.
    screen_width = models.PositiveIntegerField(null=True, blank=True)
    screen_height = models.PositiveIntegerField(null=True, blank=True)

    anonymous_id = models.CharField(
        max_length=64,
        blank=True,
        db_index=True,
        help_text="Client-side anonymous id created only after analytics consent.",
    )
    session_id = models.CharField(
        max_length=64,
        blank=True,
        default="",
        db_index=True,
        help_text="Session-level anonymous id stored in sessionStorage.",
    )

    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.event_type}: {self.path}"
