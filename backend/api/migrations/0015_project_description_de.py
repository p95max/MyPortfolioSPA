from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0014_analyticsevent_client_timezone_and_utc_offset"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="description_de",
            field=models.TextField(blank=True, help_text="German project description."),
        ),
    ]
