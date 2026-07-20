import "./Legal.css";

export default function Datenschutz() {
  return (
    <div className="legal-page">
      <main className="legal-inner">
        <p className="legal-eyebrow">Legal</p>
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
          E-Mail: <a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a>
        </p>

        <div className="legal-divider" />

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
          Die Angabe dieser Daten erfolgt freiwillig. Ohne diese Angaben kann
          Ihre Anfrage jedoch gegebenenfalls nicht bearbeitet werden.
        </p>

        <h2>5. Rechtsgrundlage der Verarbeitung</h2>
        <p>
          Die Verarbeitung Ihrer Daten aus dem Kontaktformular erfolgt auf
          Grundlage von Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf die
          Anbahnung eines Vertrags oder auf vorvertragliche Maßnahmen gerichtet
          ist.
        </p>
        <p>
          In allen übrigen Fällen erfolgt die Verarbeitung auf Grundlage von Art.
          6 Abs. 1 lit. f DSGVO aufgrund meines berechtigten Interesses an einer
          effizienten Bearbeitung an mich gerichteter Anfragen.
        </p>

        <h2>6. Schutz vor Spam und Missbrauch</h2>
        <p>
          Zum Schutz des Kontaktformulars vor Spam, automatisierten Anfragen und
          missbräuchlicher Nutzung wird Cloudflare Turnstile eingesetzt. Dabei
          kann es zur Verarbeitung technischer Daten durch den Anbieter kommen,
          etwa der IP-Adresse, Browser-Informationen, Geräte- und Nutzungsdaten
          sowie sicherheitsrelevanter Signale.
        </p>
        <p>
          Cloudflare Inc. ist ein US-amerikanisches Unternehmen. Die
          Datenübertragung in die USA erfolgt auf Grundlage von Art. 46 DSGVO
          beziehungsweise geeigneter Garantien.
        </p>
        <p>
          Diese Verarbeitung dient dem Schutz dieser Website und erfolgt auf
          Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
        </p>

        <h2>7. Empfänger der Daten</h2>
        <p>
          Ihre Daten werden nur an solche Stellen übermittelt, die für den
          Betrieb dieser Website und die Bearbeitung von Anfragen technisch
          erforderlich sind. Dazu können insbesondere Hosting-Anbieter,
          Server-Infrastruktur und eingesetzte Sicherheitsdienste gehören.
        </p>
        <p>
          Eine darüber hinausgehende Weitergabe Ihrer Daten erfolgt nicht,
          sofern keine gesetzliche Verpflichtung besteht oder Sie ausdrücklich
          eingewilligt haben.
        </p>

        <h2>8. Optionale Nutzungsanalyse</h2>
        <p>
          Diese Website verwendet eine einfache, selbst gehostete
          Nutzungsanalyse. Die Analyse wird nur aktiviert, wenn Sie über den
          Cookie-Banner ausdrücklich zustimmen. Ohne diese Zustimmung werden
          keine Analyseereignisse an den Server gesendet und es wird keine
          anonyme Analysekennung erstellt.
        </p>
        <p>
          Im Rahmen der Nutzungsanalyse können folgende Daten verarbeitet werden:
        </p>
        <ul>
          <li>aufgerufene Seite bzw. Pfad</li>
          <li>
            Ereignistyp, z. B. Seitenaufruf oder Kontaktformular-Absendung
          </li>
          <li>Referrer-URL, sofern vom Browser übermittelt</li>
          <li>Spracheinstellung des Browsers</li>
          <li>Betriebssystem</li>
          <li>Gerätetyp, z. B. mobile, tablet oder desktop</li>
          <li>Browser</li>
          <li>Zeitzone und UTC-Abweichung des Browsers</li>
          <li>Traffic-Quelle, z. B. direct, search, LinkedIn, GitHub oder referral</li>
          <li>UTM-Parameter, sofern in der URL vorhanden</li>
          <li>Sitzungskennung</li>
          <li>
            ungefähres Land, sofern über technische Header des Hosting- oder
            Proxy-Anbieters oder durch eine einmalige IP-Länderzuordnung verfügbar
          </li>
          <li>eine clientseitig erzeugte anonyme Kennung</li>
          <li>Zeitpunkt des Ereignisses</li>
        </ul>
        <p>
          Wenn der Hosting- oder Proxy-Anbieter keinen Ländercode übermittelt,
          kann die IP-Adresse einmalig an <code>api.country.is</code> übertragen
          werden, um ausschließlich den zweistelligen Ländercode zu bestimmen.
          Die IP-Adresse wird nicht in der Portfolio-Datenbank gespeichert.
        </p>
        <p>
          Die anonyme Kennung wird im lokalen Speicher Ihres Browsers unter{" "}
          <code>analytics-anonymous-id-v1</code> gespeichert. Die Cookie- bzw.
          Speicherpräferenz wird unter{" "}
          <code>cookie-consent-v1</code> gespeichert.
        </p>
        <p>
          Die Nutzungsanalyse dient dazu, die Nutzung dieser Website besser zu
          verstehen und die Website technisch sowie inhaltlich zu verbessern. Es
          werden keine externen Analysedienste wie Google Analytics eingesetzt.
        </p>
        <p>
          Rechtsgrundlage der Verarbeitung ist Ihre Einwilligung gemäß Art. 6
          Abs. 1 lit. a DSGVO. Sie können optionale Analytics ablehnen oder Ihre
          Einwilligung jederzeit über die Privacy settings im Footer dieser
          Website widerrufen.
        </p>

        <h2>9. Speicherdauer</h2>
        <p>
          Die im Rahmen des Kontaktformulars übermittelten Daten werden nur so
          lange gespeichert, wie dies zur Bearbeitung Ihrer Anfrage erforderlich
          ist oder gesetzliche Aufbewahrungspflichten bestehen.
        </p>
        <p>
          Analyseereignisse werden nur so lange gespeichert, wie sie für die
          einfache Nutzungsanalyse dieser Website erforderlich sind, maximal
          jedoch 12 Monate.
        </p>

        <h2>10. Ihre Rechte</h2>
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

        <h2>11. Kontakt zum Datenschutz</h2>
        <p>
          Wenn Sie Fragen zur Verarbeitung Ihrer personenbezogenen Daten haben,
          können Sie sich jederzeit an mich wenden:
        </p>
        <p>
          <a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a>
        </p>

        <h2>12. Stand</h2>
        <p>
          {new Date().toLocaleString("de-DE", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </main>
    </div>
  );
}
