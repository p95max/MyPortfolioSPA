from django.db import migrations, models


def create_contact_details(apps, schema_editor):
    ContactDetails = apps.get_model("api", "ContactDetails")
    ContactDetails.objects.get_or_create(
        pk=1,
        defaults={
            "email": "m.petrykin@gmx.de",
            "github_url": "https://github.com/p95max",
            "linkedin_url": "https://linkedin.com/in/p95max",
            "telegram_url": "https://t.me/max_p95",
        },
    )


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0015_project_description_de"),
    ]

    operations = [
        migrations.CreateModel(
            name="ContactDetails",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("github_url", models.URLField(blank=True)),
                ("linkedin_url", models.URLField(blank=True)),
                ("telegram_url", models.URLField(blank=True)),
            ],
            options={
                "verbose_name": "Contact details",
                "verbose_name_plural": "Contact details",
            },
        ),
        migrations.RunPython(create_contact_details, migrations.RunPython.noop),
    ]
