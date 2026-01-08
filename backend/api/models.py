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

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)