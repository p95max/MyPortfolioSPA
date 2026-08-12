import { useLegalContent } from "../legalContent";
import { useTranslation } from "../i18n";
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

const FALLBACK_PRIVACY_EN = `
<h2>1. General information</h2>
<p>Protecting your personal data is important to me. This privacy policy explains which data may be processed when you visit this website and for what purposes.</p>
<h2>2. Controller</h2>
<p>Maksym Petrykin<br />Michaelstr. 70<br />09116 Chemnitz<br />Germany<br />Email: <a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a></p>
<div class="legal-divider"></div>
<h2>3. Hosting, contact form and security</h2>
<p>Operating this website may involve processing technically necessary server data. Messages submitted through the contact form are used exclusively to process your enquiry. Cloudflare Turnstile protects the form from spam and misuse.</p>
<h2>4. Optional usage analytics</h2>
<p>Self-hosted usage analytics are activated only after you explicitly consent in the cookie banner. Without consent, no analytics events are sent and no anonymous analytics identifier is created.</p>
<h2>5. Your rights</h2>
<p>You have, in particular, the right to access, rectification, erasure, restriction of processing, objection, and to lodge a complaint with a data protection supervisory authority.</p>
<h2>6. Privacy contact</h2>
<p><a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a></p>
`;

export default function Datenschutz() {
  const content = useLegalContent();
  const { language } = useTranslation();
  const isGerman = language === "de";

  return (
    <div className="legal-page">
      <main className="legal-inner">
        <p className="legal-eyebrow">{isGerman ? "Rechtliches" : "Legal"}</p>
        <h1>{isGerman ? "Datenschutzerklärung" : "Privacy Policy"}</h1>
        <div
          dangerouslySetInnerHTML={{
            __html: isGerman
              ? content?.privacy_html || FALLBACK_PRIVACY
              : FALLBACK_PRIVACY_EN,
          }}
        />
      </main>
    </div>
  );
}
