from django.db import migrations, models


def move_responsible_party_to_dedicated_fields(apps, schema_editor):
    LegalContent = apps.get_model("api", "LegalContent")

    for content in LegalContent.objects.all():
        if not content.responsible_name:
            content.responsible_name = "Maksym Petrykin"
        if not content.responsible_address:
            content.responsible_address = "Michaelstr. 70\n09116 Chemnitz\nDeutschland"
        if not content.responsible_email:
            content.responsible_email = "m.petrykin@gmx.de"

        # The seeded legal HTML duplicated this data. Retain only the editable
        # legal copy; the frontend renders these details from dedicated fields.
        impressum_start = content.impressum_html.find("<h2>Haftung")
        if impressum_start >= 0:
            content.impressum_html = content.impressum_html[impressum_start:]

        privacy_start = content.privacy_html.find("<h2>2.")
        privacy_end = content.privacy_html.find("<h2>3.", privacy_start)
        if privacy_start >= 0 and privacy_end >= 0:
            content.privacy_html = (
                content.privacy_html[:privacy_start] + content.privacy_html[privacy_end:]
            )

        privacy_contact_start = content.privacy_html.find("<h2>11.")
        privacy_contact_end = content.privacy_html.find("<h2>12.", privacy_contact_start)
        if privacy_contact_start >= 0 and privacy_contact_end >= 0:
            content.privacy_html = (
                content.privacy_html[:privacy_contact_start]
                + content.privacy_html[privacy_contact_end:]
            )

        content.save(
            update_fields=(
                "responsible_name",
                "responsible_address",
                "responsible_email",
                "impressum_html",
                "privacy_html",
            )
        )


class Migration(migrations.Migration):
    dependencies = [("api", "0019_analyticsevent_project_demo_click")]

    operations = [
        migrations.AddField(
            model_name="legalcontent",
            name="responsible_name",
            field=models.CharField(
                blank=True,
                help_text="Name of the person or organisation responsible for the legal pages.",
                max_length=200,
            ),
        ),
        migrations.AddField(
            model_name="legalcontent",
            name="responsible_address",
            field=models.TextField(
                blank=True,
                help_text="Postal address. Use one line per address line.",
            ),
        ),
        migrations.AddField(
            model_name="legalcontent",
            name="responsible_email",
            field=models.EmailField(
                blank=True,
                help_text="Public email address shown on the legal pages.",
                max_length=254,
            ),
        ),
        migrations.RunPython(
            move_responsible_party_to_dedicated_fields,
            migrations.RunPython.noop,
        ),
    ]
