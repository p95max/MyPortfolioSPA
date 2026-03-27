import "./Legal.css";

export default function Impressum() {
  return (
    <div className="legal-page">
      <main className="legal-inner">
        <p className="legal-eyebrow">Legal</p>
        <h1>Impressum</h1>

        <p>Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</p>

        <p>
          Maksym Petrykin<br />
          Michaelstr. 70<br />
          09116 Chemnitz<br />
          Deutschland
        </p>

        <p>E-Mail: <a href="mailto:m.petrykin@gmx.de">m.petrykin@gmx.de</a></p>

        <div className="legal-divider" />

        <h2>Verantwortlich für den Inhalt</h2>
        <p>
          Maksym Petrykin<br />
          Michaelstr. 70<br />
          09116 Chemnitz<br />
          Deutschland
        </p>

        <h2>Haftung für Inhalte</h2>
        <p>
          Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt.
          Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird
          jedoch keine Gewähr übernommen.
        </p>

        <h2>Haftung für Links</h2>
        <p>
          Diese Website enthält Links zu externen Websites Dritter. Auf deren
          Inhalte habe ich keinen Einfluss. Deshalb kann ich für diese fremden
          Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
          Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
          verantwortlich.
        </p>

        <h2>Urheberrecht</h2>
        <p>
          Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser
          Website unterliegen dem Urheberrecht. Eine Vervielfältigung,
          Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechts bedürfen der vorherigen schriftlichen
          Zustimmung des jeweiligen Autors bzw. Erstellers.
        </p>
      </main>
    </div>
  );
}