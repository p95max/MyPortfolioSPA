from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("api", "0013_alter_credential_category"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="description_de",
            field=models.TextField(blank=True, help_text="German project description."),
        ),
    ]
