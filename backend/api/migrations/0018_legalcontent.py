from django.db import migrations, models


IMPRESSUM_HTML = """
<p>Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</p>
<p>Maksym Petrykin<br>Michaelstr. 70<br>09116 Chemnitz<br>Deutschland</p>
<p>E-Mail: <a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a></p>
<div class="legal-divider"></div>
<h2>Verantwortlich für den Inhalt</h2>
<p>Maksym Petrykin<br>Michaelstr. 70<br>09116 Chemnitz<br>Deutschland</p>
<h2>Haftung für Inhalte</h2>
<p>Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen.</p>
<h2>Haftung für Links</h2>
<p>Diese Website enthält Links zu externen Websites Dritter. Auf deren Inhalte habe ich keinen Einfluss. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>
<h2>Urheberrecht</h2>
<p>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem Urheberrecht. Eine Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der vorherigen schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
""".strip()

PRIVACY_HTML = """
<h2>1. Allgemeine Hinweise</h2>
<p>Der Schutz Ihrer personenbezogenen Daten ist mir wichtig. In dieser Datenschutzerklärung informiere ich darüber, welche Daten beim Besuch dieser Website verarbeitet werden und zu welchen Zwecken dies erfolgt.</p>
<h2>2. Verantwortliche Stelle</h2>
<p>Maksym Petrykin<br>Michaelstr. 70<br>09116 Chemnitz<br>Deutschland<br>E-Mail: <a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a></p>
<div class="legal-divider"></div>
<h2>3. Hosting und Server-Log-Dateien</h2>
<p>Beim Aufruf dieser Website werden durch den Hosting-Anbieter technisch erforderliche Informationen automatisch verarbeitet. Dazu können insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seiten, Referrer-URL, Browsertyp und Betriebssystem gehören.</p>
<p>Die Verarbeitung erfolgt, um den sicheren und stabilen Betrieb der Website zu gewährleisten sowie zur technischen Fehleranalyse.</p>
<h2>4. Kontaktformular</h2>
<p>Wenn Sie mir über das Kontaktformular eine Nachricht senden, verarbeite ich die von Ihnen eingegebenen Daten, insbesondere:</p>
<ul><li>Name</li><li>E-Mail-Adresse</li><li>Nachricht</li></ul>
<p>Die Verarbeitung dieser Daten erfolgt ausschließlich zum Zweck der Bearbeitung Ihrer Anfrage und zur Kontaktaufnahme mit Ihnen.</p>
<h2>5. Rechtsgrundlage der Verarbeitung</h2>
<p>Die Verarbeitung Ihrer Daten aus dem Kontaktformular erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf die Anbahnung eines Vertrags oder auf vorvertragliche Maßnahmen gerichtet ist. In allen übrigen Fällen erfolgt sie auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
<h2>6. Schutz vor Spam und Missbrauch</h2>
<p>Zum Schutz des Kontaktformulars vor Spam, automatisierten Anfragen und missbräuchlicher Nutzung wird Cloudflare Turnstile eingesetzt. Dabei kann es zur Verarbeitung technischer Daten durch den Anbieter kommen. Diese Verarbeitung dient dem Schutz dieser Website und erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.</p>
<h2>7. Empfänger der Daten</h2>
<p>Ihre Daten werden nur an Stellen übermittelt, die für den Betrieb dieser Website und die Bearbeitung von Anfragen technisch erforderlich sind. Eine darüber hinausgehende Weitergabe erfolgt nicht, sofern keine gesetzliche Verpflichtung besteht oder Sie ausdrücklich eingewilligt haben.</p>
<h2>8. Optionale Nutzungsanalyse</h2>
<p>Diese Website verwendet eine einfache, selbst gehostete Nutzungsanalyse. Die Analyse wird nur aktiviert, wenn Sie über den Cookie-Banner ausdrücklich zustimmen. Ohne diese Zustimmung werden keine Analyseereignisse an den Server gesendet und es wird keine anonyme Analysekennung erstellt.</p>
<ul><li>aufgerufene Seite bzw. Pfad</li><li>Ereignistyp</li><li>Referrer-URL</li><li>Browsersprache</li><li>Betriebssystem, Browser und Gerätetyp</li><li>Zeitzone und UTC-Abweichung</li><li>Traffic-Quelle und UTM-Parameter</li><li>Sitzungskennung und anonyme Kennung</li><li>ungefähres Land</li><li>Zeitpunkt des Ereignisses</li></ul>
<p>Wenn kein Ländercode übermittelt wird, kann die IP-Adresse einmalig an <code>api.country.is</code> übertragen werden, um ausschließlich den zweistelligen Ländercode zu bestimmen. Die IP-Adresse wird nicht in der Portfolio-Datenbank gespeichert.</p>
<p>Die anonyme Kennung wird unter <code>analytics-anonymous-id-v1</code> und die Speicherpräferenz unter <code>cookie-consent-v1</code> im Browser gespeichert. Es werden keine externen Analysedienste wie Google Analytics eingesetzt.</p>
<p>Rechtsgrundlage ist Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Sie können Ihre Einwilligung jederzeit über die Datenschutzeinstellungen im Footer widerrufen.</p>
<h2>9. Speicherdauer</h2>
<p>Kontaktanfragen werden nur so lange gespeichert, wie dies zur Bearbeitung erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Analyseereignisse werden maximal 12 Monate gespeichert.</p>
<h2>10. Ihre Rechte</h2>
<ul><li>Auskunft</li><li>Berichtigung</li><li>Löschung</li><li>Einschränkung der Verarbeitung</li><li>Widerspruch</li><li>Datenübertragbarkeit, soweit anwendbar</li><li>Beschwerde bei einer Datenschutz-Aufsichtsbehörde</li></ul>
<h2>11. Kontakt zum Datenschutz</h2>
<p><a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a></p>
<h2>12. Stand</h2>
<p>August 2026</p>
""".strip()


def create_default_legal_content(apps, schema_editor):
    LegalContent = apps.get_model("api", "LegalContent")
    LegalContent.objects.get_or_create(
        pk=1,
        defaults={
            "impressum_html": IMPRESSUM_HTML,
            "privacy_html": PRIVACY_HTML,
            "cookie_eyebrow_en": "Privacy settings",
            "cookie_title_en": "Cookie preferences",
            "cookie_text_en": "This website uses necessary storage to remember your cookie choice. Optional analytics are only enabled if you actively accept them.",
            "cookie_necessary_en": "Necessary",
            "cookie_necessary_text_en": "Required for basic website functionality.",
            "cookie_analytics_en": "Analytics",
            "cookie_analytics_text_en": "Helps understand website usage. You can disable it before saving.",
            "cookie_reject_en": "Reject optional",
            "cookie_save_en": "Save settings",
            "cookie_accept_en": "Accept all",
            "cookie_eyebrow_de": "Datenschutzeinstellungen",
            "cookie_title_de": "Cookie-Einstellungen",
            "cookie_text_de": "Diese Website verwendet erforderliche Speicherungen, um deine Cookie-Auswahl zu speichern. Optionale Analysen werden nur aktiviert, wenn du ihnen ausdrücklich zustimmst.",
            "cookie_necessary_de": "Erforderlich",
            "cookie_necessary_text_de": "Für die grundlegende Funktion der Website erforderlich.",
            "cookie_analytics_de": "Analyse",
            "cookie_analytics_text_de": "Hilft, die Nutzung der Website zu verstehen. Du kannst sie vor dem Speichern deaktivieren.",
            "cookie_reject_de": "Optionale ablehnen",
            "cookie_save_de": "Einstellungen speichern",
            "cookie_accept_de": "Alle akzeptieren",
        },
    )


class Migration(migrations.Migration):
    dependencies = [("api", "0017_homepagecontent")]

    operations = [
        migrations.CreateModel(
            name="LegalContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("impressum_html", models.TextField(help_text="Trusted HTML rendered on the Impressum page.")),
                ("privacy_html", models.TextField(help_text="Trusted HTML rendered on the privacy policy page.")),
                ("cookie_eyebrow_en", models.CharField(max_length=100)),
                ("cookie_title_en", models.CharField(max_length=200)),
                ("cookie_text_en", models.TextField()),
                ("cookie_necessary_en", models.CharField(max_length=100)),
                ("cookie_necessary_text_en", models.CharField(max_length=300)),
                ("cookie_analytics_en", models.CharField(max_length=100)),
                ("cookie_analytics_text_en", models.CharField(max_length=300)),
                ("cookie_reject_en", models.CharField(max_length=100)),
                ("cookie_save_en", models.CharField(max_length=100)),
                ("cookie_accept_en", models.CharField(max_length=100)),
                ("cookie_eyebrow_de", models.CharField(max_length=100)),
                ("cookie_title_de", models.CharField(max_length=200)),
                ("cookie_text_de", models.TextField()),
                ("cookie_necessary_de", models.CharField(max_length=100)),
                ("cookie_necessary_text_de", models.CharField(max_length=300)),
                ("cookie_analytics_de", models.CharField(max_length=100)),
                ("cookie_analytics_text_de", models.CharField(max_length=300)),
                ("cookie_reject_de", models.CharField(max_length=100)),
                ("cookie_save_de", models.CharField(max_length=100)),
                ("cookie_accept_de", models.CharField(max_length=100)),
            ],
            options={"verbose_name": "Legal content", "verbose_name_plural": "Legal content"},
        ),
        migrations.RunPython(create_default_legal_content, migrations.RunPython.noop),
    ]
