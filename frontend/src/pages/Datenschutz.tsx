export default function Datenschutz() {
  return (
    <main style={{ maxWidth: 960, margin: '40px auto', padding: '0 16px' }}>
      <h1>Datenschutzerklärung</h1>

      <h2>1. Allgemeine Hinweise</h2>
      <p>
        Der Schutz Ihrer personenbezogenen Daten ist mir wichtig. In dieser
        Datenschutzerklärung informiere ich darüber, welche Daten beim Besuch
        dieser Website verarbeitet werden und zu welchen Zwecken dies erfolgt.
      </p>

      <h2>2. Verantwortliche Stelle</h2>
      <p>
        Maksym Petrykin
        <br />
        Michaelstr. 70
        <br />
        09116 Chemnitz
        <br />
        Deutschland
        <br />
        E-Mail:{' '}
        <a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a>
      </p>

      <h2>3. Hosting und Server-Log-Dateien</h2>
      <p>
        Beim Aufruf dieser Website werden durch den Hosting-Anbieter technisch
        erforderliche Informationen automatisch verarbeitet. Dazu können
        insbesondere IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene
        Seiten, Referrer-URL, Browsertyp und Betriebssystem gehören.
      </p>
      <p>
        Die Verarbeitung erfolgt, um den sicheren und stabilen Betrieb der
        Website zu gewährleisten sowie zur technischen Fehleranalyse.
      </p>

      <h2>4. Kontaktformular</h2>
      <p>
        Wenn Sie mir über das Kontaktformular eine Nachricht senden, verarbeite
        ich die von Ihnen eingegebenen Daten, insbesondere:
      </p>
      <ul>
        <li>Name</li>
        <li>E-Mail-Adresse</li>
        <li>Nachricht</li>
      </ul>
      <p>
        Die Verarbeitung dieser Daten erfolgt ausschließlich zum Zweck der
        Bearbeitung Ihrer Anfrage und zur Kontaktaufnahme mit Ihnen.
      </p>
      <p>
        Die Angabe dieser Daten erfolgt freiwillig. Ohne diese Angaben kann Ihre
        Anfrage jedoch gegebenenfalls nicht bearbeitet werden.
      </p>

      <h2>5. Rechtsgrundlage der Verarbeitung</h2>
      <p>
        Die Verarbeitung Ihrer Daten aus dem Kontaktformular erfolgt auf Grundlage
        von Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf die Anbahnung
        eines Vertrags oder auf vorvertragliche Maßnahmen gerichtet ist.
      </p>
      <p>
        In allen übrigen Fällen erfolgt die Verarbeitung auf Grundlage von
        Art. 6 Abs. 1 lit. f DSGVO aufgrund meines berechtigten Interesses an
        einer effizienten Bearbeitung an mich gerichteter Anfragen.
      </p>

      <h2>6. Schutz vor Spam und Missbrauch</h2>
      <p>
        Zum Schutz des Kontaktformulars vor Spam, automatisierten Anfragen und
        missbräuchlicher Nutzung wird Cloudflare Turnstile eingesetzt. Dabei kann
        es zur Verarbeitung technischer Daten durch den Anbieter kommen, etwa der
        IP-Adresse, Browser-Informationen, Geräte- und Nutzungsdaten sowie
        sicherheitsrelevanter Signale.
      </p>
      <p>
        Diese Verarbeitung dient dem Schutz dieser Website und erfolgt auf
        Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h2>7. Empfänger der Daten</h2>
      <p>
        Ihre Daten werden nur an solche Stellen übermittelt, die für den Betrieb
        dieser Website und die Bearbeitung von Anfragen technisch erforderlich
        sind. Dazu können insbesondere Hosting-Anbieter, Server-Infrastruktur und
        eingesetzte Sicherheitsdienste gehören.
      </p>
      <p>
        Eine darüber hinausgehende Weitergabe Ihrer Daten erfolgt nicht, sofern
        keine gesetzliche Verpflichtung besteht oder Sie ausdrücklich eingewilligt
        haben.
      </p>

      <h2>8. Speicherdauer</h2>
      <p>
        Die im Rahmen des Kontaktformulars übermittelten Daten werden nur so
        lange gespeichert, wie dies zur Bearbeitung Ihrer Anfrage erforderlich
        ist oder gesetzliche Aufbewahrungspflichten bestehen.
      </p>

      <h2>9. Ihre Rechte</h2>
      <p>Sie haben im Rahmen der DSGVO insbesondere folgende Rechte:</p>
      <ul>
        <li>Recht auf Auskunft über die verarbeiteten personenbezogenen Daten</li>
        <li>Recht auf Berichtigung unrichtiger Daten</li>
        <li>Recht auf Löschung Ihrer Daten</li>
        <li>Recht auf Einschränkung der Verarbeitung</li>
        <li>Recht auf Widerspruch gegen die Verarbeitung</li>
        <li>Recht auf Datenübertragbarkeit, soweit anwendbar</li>
        <li>Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde</li>
      </ul>

      <h2>10. Kontakt zum Datenschutz</h2>
      <p>
        Wenn Sie Fragen zur Verarbeitung Ihrer personenbezogenen Daten haben,
        können Sie sich jederzeit an mich wenden:
      </p>
      <p>
        <a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a>
      </p>

      <h2>11. Stand</h2>
        <p>
          {new Date().toLocaleString('de-DE', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
    </main>
  );
}