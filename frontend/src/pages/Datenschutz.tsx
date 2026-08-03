import { useLegalContent } from "../legalContent";
import "./Legal.css";

const FALLBACK_PRIVACY = `
<h2>1. Allgemeine Hinweise</h2>
<p>Der Schutz Ihrer personenbezogenen Daten ist mir wichtig. In dieser Datenschutzerklärung informiere ich darüber, welche Daten beim Besuch dieser Website verarbeitet werden und zu welchen Zwecken dies erfolgt.</p>
<h2>2. Verantwortliche Stelle</h2>
<p>Maksym Petrykin<br />Michaelstr. 70<br />09116 Chemnitz<br />Deutschland<br />E-Mail: <a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a></p>
<div class="legal-divider"></div>
<h2>3. Hosting, Kontaktformular und Sicherheit</h2>
<p>Beim Betrieb dieser Website können technisch erforderliche Serverdaten verarbeitet werden. Nachrichten aus dem Kontaktformular werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet. Cloudflare Turnstile schützt das Formular vor Spam und Missbrauch.</p>
<h2>4. Optionale Nutzungsanalyse</h2>
<p>Die selbst gehostete Nutzungsanalyse wird nur nach ausdrücklicher Zustimmung im Cookie-Banner aktiviert. Ohne Zustimmung werden keine Analyseereignisse gesendet und keine anonyme Analysekennung erstellt.</p>
<h2>5. Ihre Rechte</h2>
<p>Sie haben insbesondere Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch und Beschwerde bei einer Datenschutz-Aufsichtsbehörde.</p>
<h2>6. Kontakt zum Datenschutz</h2>
<p><a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a></p>
`;

export default function Datenschutz() {
  const content = useLegalContent();

  return (
    <div className="legal-page">
      <main className="legal-inner">
        <p className="legal-eyebrow">Legal</p>
        <h1>Datenschutzerklärung</h1>
        <div
          dangerouslySetInnerHTML={{
            __html: content?.privacy_html || FALLBACK_PRIVACY,
          }}
        />
      </main>
    </div>
  );
}
