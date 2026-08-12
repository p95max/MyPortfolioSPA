import { useTranslation } from "../i18n";
import { useLegalContent } from "../legalContent";
import { LegalResponsibleParty } from "./LegalResponsibleParty";
import "./Legal.css";

const FALLBACK_PRIVACY_DE = `
<h2>1. Allgemeine Hinweise</h2>
<p>Der Schutz personenbezogener Daten ist wichtig. Diese Datenschutzerklärung informiert darüber, welche Daten beim Besuch dieser Website verarbeitet werden und zu welchen Zwecken dies erfolgt.</p>
<h2>3. Hosting, Kontaktformular und Sicherheit</h2>
<p>Beim Betrieb dieser Website können technisch erforderliche Serverdaten verarbeitet werden. Nachrichten aus dem Kontaktformular werden ausschließlich zur Bearbeitung der Anfrage verwendet. Cloudflare Turnstile schützt das Formular vor Spam und Missbrauch.</p>
<h2>4. Optionale Nutzungsanalyse</h2>
<p>Die selbst gehostete Nutzungsanalyse wird nur nach ausdrücklicher Zustimmung im Cookie-Banner aktiviert. Ohne Zustimmung werden keine Analyseereignisse gesendet und keine anonyme Analysekennung erstellt.</p>
<h2>5. Rechte betroffener Personen</h2>
<p>Es bestehen insbesondere Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Widerspruch und Beschwerde bei einer Datenschutz-Aufsichtsbehörde.</p>
`;

const FALLBACK_PRIVACY_EN = `
<h2>1. General information</h2>
<p>Protecting personal data is important. This privacy policy explains which data may be processed when this website is visited and for what purposes.</p>
<h2>3. Hosting, contact form and security</h2>
<p>Operating this website may involve processing technically necessary server data. Messages submitted through the contact form are used exclusively to process an enquiry. Cloudflare Turnstile protects the form from spam and misuse.</p>
<h2>4. Optional usage analytics</h2>
<p>Self-hosted usage analytics are activated only after explicit consent in the cookie banner. Without consent, no analytics events are sent and no anonymous analytics identifier is created.</p>
<h2>5. Data subject rights</h2>
<p>These include, in particular, the right to access, rectification, erasure, restriction of processing, objection, and to lodge a complaint with a data protection supervisory authority.</p>
`;

function splitPrivacyContent(content: string): [string, string] {
  const sectionThree = content.indexOf("<h2>3.");
  return sectionThree < 0
    ? ["", content]
    : [content.slice(0, sectionThree), content.slice(sectionThree)];
}

export default function Datenschutz() {
  const content = useLegalContent();
  const { language } = useTranslation();
  const isGerman = language === "de";
  const privacyHtml = isGerman
    ? content?.privacy_html || FALLBACK_PRIVACY_DE
    : FALLBACK_PRIVACY_EN;
  const [introHtml, bodyHtml] = splitPrivacyContent(privacyHtml);

  return (
    <div className="legal-page">
      <main className="legal-inner">
        <p className="legal-eyebrow">{isGerman ? "Rechtliches" : "Legal"}</p>
        <h1>{isGerman ? "Datenschutzerklärung" : "Privacy Policy"}</h1>
        {introHtml && <div dangerouslySetInnerHTML={{ __html: introHtml }} />}
        <LegalResponsibleParty
          content={content}
          heading={isGerman ? "2. Verantwortliche Stelle" : "2. Controller"}
        />
        <div className="legal-divider" />
        <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      </main>
    </div>
  );
}
