import { useLegalContent } from "../legalContent";
import "./Legal.css";

const FALLBACK_IMPRESSUM = `
<p>Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</p>
<p>Maksym Petrykin<br />Michaelstr. 70<br />09116 Chemnitz<br />Deutschland</p>
<p>E-Mail: <a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a></p>
<div class="legal-divider"></div>
<h2>Verantwortlich für den Inhalt</h2>
<p>Maksym Petrykin<br />Michaelstr. 70<br />09116 Chemnitz<br />Deutschland</p>
<h2>Haftung für Inhalte</h2>
<p>Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen.</p>
<h2>Haftung für Links</h2>
<p>Diese Website enthält Links zu externen Websites Dritter. Für deren Inhalte ist stets der jeweilige Anbieter oder Betreiber verantwortlich.</p>
<h2>Urheberrecht</h2>
<p>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser Website unterliegen dem Urheberrecht.</p>
`;

export default function Impressum() {
  const content = useLegalContent();

  return (
    <div className="legal-page">
      <main className="legal-inner">
        <p className="legal-eyebrow">Legal</p>
        <h1>Impressum</h1>
        <div
          dangerouslySetInnerHTML={{
            __html: content?.impressum_html || FALLBACK_IMPRESSUM,
          }}
        />
      </main>
    </div>
  );
}
