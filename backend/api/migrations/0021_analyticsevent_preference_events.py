from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0020_legalcontent_responsible_party"),
    ]

    operations = [
        migrations.AlterField(
            model_name="analyticsevent",
            name="event_type",
            field=models.CharField(
                choices=[
                    ("page_view", "Page view"),
                    ("project_view", "Project view"),
                    ("project_github_click", "Project GitHub click"),
                    ("project_demo_click", "Project demo click"),
                    ("contact_submit", "Contact form submit"),
                    ("outbound_link_click", "Outbound link click"),
                    ("credential_view", "Credential view"),
                    ("credential_link_click", "Credential link click"),
                    ("theme_change", "Theme change"),
                    ("language_change", "Language change"),
                ],
                db_index=True,
                default="page_view",
                max_length=50,
            ),
        ),
    ]
