import { useTranslation } from "../i18n";
import { useLegalContent } from "../legalContent";
import { LegalResponsibleParty } from "./LegalResponsibleParty";
import "./Legal.css";

const FALLBACK_IMPRESSUM_DE = `
<h2>Haftung für Inhalte</h2>
<p>Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen.</p>
<h2>Haftung für Links</h2>
<p>Diese Website enthält Links zu externen Websites Dritter. Für deren Inhalte ist stets der jeweilige Anbieter oder Betreiber verantwortlich.</p>
<h2>Urheberrecht</h2>
<p>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem Urheberrecht.</p>
`;

const FALLBACK_IMPRESSUM_EN = `
<h2>Liability for content</h2>
<p>The content of this website has been prepared with the greatest possible care. However, no guarantee can be given for the accuracy, completeness or timeliness of its content.</p>
<h2>Liability for links</h2>
<p>This website contains links to external third-party websites. The respective provider or operator is always responsible for their content.</p>
<h2>Copyright</h2>
<p>The content and works created by the site operator on this website are subject to German copyright law.</p>
`;

export default function Impressum() {
  const content = useLegalContent();
  const { language } = useTranslation();
  const isGerman = language === "de";

  return (
    <div className="legal-page">
      <main className="legal-inner">
        <p className="legal-eyebrow">{isGerman ? "Rechtliches" : "Legal"}</p>
        <h1>{isGerman ? "Impressum" : "Legal Notice"}</h1>
        <p>{isGerman
          ? "Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)"
          : "Information pursuant to Section 5 of the German Digital Services Act (DDG)"}</p>
        <LegalResponsibleParty
          content={content}
          heading={isGerman ? "Verantwortlich für den Inhalt" : "Responsible for content"}
        />
        <div className="legal-divider" />
        <div
          dangerouslySetInnerHTML={{
            __html: isGerman
              ? content?.impressum_html || FALLBACK_IMPRESSUM_DE
              : FALLBACK_IMPRESSUM_EN,
          }}
        />
      </main>
    </div>
  );
}
