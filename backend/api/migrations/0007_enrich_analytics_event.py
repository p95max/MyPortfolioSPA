from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0006_analyticsevent"),
    ]

    operations = [
        migrations.AddField(
            model_name="analyticsevent",
            name="browser",
            field=models.CharField(blank=True, default="", max_length=50),
        ),
        migrations.AddField(
            model_name="analyticsevent",
            name="device_type",
            field=models.CharField(
                blank=True,
                db_index=True,
                default="",
                help_text="mobile, tablet, desktop or unknown.",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="analyticsevent",
            name="source_type",
            field=models.CharField(
                blank=True,
                db_index=True,
                default="",
                help_text="Normalized traffic source: direct, search, linkedin, github, social, referral, unknown.",
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name="analyticsevent",
            name="utm_source",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="analyticsevent",
            name="utm_medium",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="analyticsevent",
            name="utm_campaign",
            field=models.CharField(blank=True, default="", max_length=100),
        ),
        migrations.AddField(
            model_name="analyticsevent",
            name="session_id",
            field=models.CharField(
                blank=True,
                db_index=True,
                default="",
                help_text="Session-level anonymous id stored in sessionStorage.",
                max_length=64,
            ),
        ),
        migrations.AddField(
            model_name="analyticsevent",
            name="metadata",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AlterField(
            model_name="analyticsevent",
            name="event_type",
            field=models.CharField(
                choices=[
                    ("page_view", "Page view"),
                    ("project_view", "Project view"),
                    ("project_github_click", "Project GitHub click"),
                    ("contact_submit", "Contact form submit"),
                    ("outbound_link_click", "Outbound link click"),
                ],
                db_index=True,
                default="page_view",
                max_length=50,
            ),
        ),
    ]