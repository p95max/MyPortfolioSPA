from django.db import migrations, models


DEFAULT_STACK = [
    "Python",
    "Django",
    "FastAPI",
    "PostgreSQL",
    "Docker",
    "Redis",
    "gRPC",
    "Pytest",
    "GitHub Actions",
    "Terraform",
    "Azure",
]


def create_default_homepage_content(apps, schema_editor):
    HomepageContent = apps.get_model("api", "HomepageContent")
    HomepageContent.objects.get_or_create(
        pk=1,
        defaults={
            "availability_en": "Open to work · Chemnitz, DE",
            "availability_de": "Verfügbar für neue Aufgaben · Chemnitz, DE",
            "greeting_en": "Hi, I'm",
            "greeting_de": "Hallo, ich bin",
            "name": "Maksym",
            "role_en": "Python Backend Developer",
            "role_de": "Python Backend-Entwickler",
            "description_en": "I build APIs, integrations, and automation systems. Django, FastAPI, PostgreSQL, Docker — clean architecture, production-ready code, no shortcuts.",
            "description_de": "Ich entwickle APIs, Integrationen und Automatisierungssysteme. Django, FastAPI, PostgreSQL, Docker — saubere Architektur, produktionsreifer Code, keine Abkürzungen.",
            "stack": DEFAULT_STACK,
        },
    )


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0016_contactdetails"),
    ]

    operations = [
        migrations.CreateModel(
            name="HomepageContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("availability_en", models.CharField(max_length=200)),
                ("availability_de", models.CharField(max_length=200)),
                ("greeting_en", models.CharField(max_length=100)),
                ("greeting_de", models.CharField(max_length=100)),
                ("name", models.CharField(max_length=100)),
                ("role_en", models.CharField(max_length=200)),
                ("role_de", models.CharField(max_length=200)),
                ("description_en", models.TextField()),
                ("description_de", models.TextField()),
                ("stack", models.JSONField(default=list, help_text='Ordered list of technology labels, for example ["Python", "Django"].')),
            ],
            options={
                "verbose_name": "Homepage content",
                "verbose_name_plural": "Homepage content",
            },
        ),
        migrations.RunPython(create_default_homepage_content, migrations.RunPython.noop),
    ]
