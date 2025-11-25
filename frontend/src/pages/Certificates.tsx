import { useEffect, useMemo, useState } from "react";
import DocumentCard, { type DocItem } from "../components/DocumentCard";

const containerStyle: React.CSSProperties = {
  maxWidth: 980,
  margin: "48px auto",
  padding: 28,
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
};

const cardInnerStyle: React.CSSProperties = {
  padding: 22,
  borderRadius: 10,
  background: "var(--card-bg)",
  color: "var(--text-color)",
};

const headerStyle: React.CSSProperties = {
  margin: "0 0 12px 0",
  fontSize: "2.0rem",
  lineHeight: 1.05,
  color: "var(--accent-color)",
};

const subHeaderStyle: React.CSSProperties = {
  margin: "0 0 20px 0",
  color: "var(--muted-color)",
};

const btnBase: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const docs: DocItem[] = [
  {
    id: "1",
    title: "Crash Course on Python",
    issuer: "Google / Coursera",
    description:
      "An online non-credit course authorized by Google and offered through Coursera.",
    fileName: "Google_certificate.pdf",
    type: "certificate",
    previewImage: "/previews/google_certificate.jpg",
  },
  {
    id: "2",
    title: "Starta Certificate (DE)",
    issuer: "Starta",
    description:
      "German version of the backend development certificate. Topics include Python, Django, databases, microservices, API integration (OpenAI), team project and introduction to neural networks.",
    fileName: "Starta_DE.pdf",
    type: "certificate",
    previewImage: "/previews/starta_de.jpg",
  },
  {
    id: "3",
    title: "Starta Certificate (EN)",
    issuer: "Starta",
    description: "English version of the backend development certificate.",
    fileName: "Starta_EN.pdf",
    type: "certificate",
    previewImage: "/previews/starta_en.jpg",
  },
  {
    id: "4",
    title: "Starta Recommendation",
    issuer: "Starta",
    description: "German version of the recommendation letter from Starta Institute",
    fileName: "ref_brief.pdf",
    type: "recommendation",
    previewImage: "/previews/ref_brief.jpg",
  },
];

export default function Certificates() {
  useEffect(() => {
    document.title = "My SPA Portfolio — Documents";
  }, []);

  const [tab, setTab] = useState<"certificates" | "recommendations">("certificates");

  const certificates = useMemo(() => docs.filter((d) => d.type === "certificate"), []);
  const recommendations = useMemo(() => docs.filter((d) => d.type === "recommendation"), []);

  const current = tab === "certificates" ? certificates : recommendations;

  const vars = {
    "--accent-color": "#0070f3",
    "--text-color": "#f6f6f6",
    "--muted-color": "#c6d4e6",
    "--card-bg": "rgba(20,20,20,0.65)",
  } as React.CSSProperties;

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          ...containerStyle,
          background: "linear-gradient(180deg, rgba(10,10,10,0.65), rgba(10,10,10,0.5))",
          ...vars,
        }}
      >
        <div style={cardInnerStyle}>
          <h1 style={headerStyle}>Credentials</h1>
          <p style={subHeaderStyle}>Professional certifications and recommendation letters.</p>

          <div
            style={{
              display: "flex",
              gap: 8,
              margin: "12px 0 18px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <button
              onClick={() => setTab("certificates")}
              aria-pressed={tab === "certificates"}
              style={{
                ...btnBase,
                background: tab === "certificates" ? "var(--accent-color)" : "transparent",
                color: tab === "certificates" ? "#fff" : "var(--muted-color)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              📜 Certificates ({certificates.length})
            </button>
            <button
              onClick={() => setTab("recommendations")}
              aria-pressed={tab === "recommendations"}
              style={{
                ...btnBase,
                background: tab === "recommendations" ? "var(--accent-color)" : "transparent",
                color: tab === "recommendations" ? "#fff" : "var(--muted-color)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              📋 Recommendations ({recommendations.length})
            </button>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {current.length ? (
              current.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: 40,
                  color: "var(--muted-color)",
                  border: "1px dashed rgba(255,255,255,0.06)",
                  borderRadius: 12,
                }}
              >
                No {tab} available.
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (prefers-color-scheme: light) {
          :root {
            --accent-color: #0b61d6;
            --text-color: #1f2937;
            --muted-color: #475569;
            --card-bg: #ffffff;
          }
          body { background-color: #f6f8fb; }
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --accent-color: #7aa7ff;
            --text-color: #f6f6f6;
            --muted-color: #c6d4e6;
            --card-bg: rgba(18,18,20,0.72);
          }
          body { background-color: #0f1720; }
        }
      `}</style>
    </div>
  );
}
