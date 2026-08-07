from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0018_legalcontent"),
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
                ],
                db_index=True,
                default="page_view",
                max_length=50,
            ),
        ),
    ]
