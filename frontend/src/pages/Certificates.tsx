import { useEffect, useMemo, useState } from "react";
import "./Certificates.css";
import DocumentCard, { type DocItem } from "../components/DocumentCard";

const docs: DocItem[] = [
  {
    id: "1",
    title: "Crash Course on Python",
    issuer: "Google / Coursera",
    description:
      "An online non-credit course authorized by Google and offered through Coursera.",
    fileName: "Google_certificate.pdf",
    type: "certificate",
  },
  {
    id: "2",
    title: "Starta Certificate (DE)",
    issuer: "Starta",
    description:
      "German version of the backend development certificate. Topics include Python, Django, databases, microservices, API integration (OpenAI), team project and introduction to neural networks.",
    fileName: "Starta_DE.pdf",
    type: "certificate",
  },
  {
    id: "3",
    title: "Starta Certificate (EN)",
    issuer: "Starta",
    description: "English version of the backend development certificate.",
    fileName: "Starta_EN.pdf",
    type: "certificate",
  },
  {
    id: "4",
    title: "Starta Recommendation",
    issuer: "Starta",
    description: "German version of the recommendation letter from Starta Institute",
    fileName: "ref_brief.pdf",
    type: "recommendation",
  },
];

function Certificates() {
  useEffect(() => {
    document.title = "My SPA Portfolio — Certificates";
  }, []);

  const [tab, setTab] = useState<"certificates" | "recommendations">("certificates");

  const certificates = useMemo(() => docs.filter((d) => d.type === "certificate"), []);
  const recommendations = useMemo(() => docs.filter((d) => d.type === "recommendation"), []);

  const current = tab === "certificates" ? certificates : recommendations;

  return (
    <div className="page-cert">
      <div className="container">
        <div className="card">
          <h1 className="header">Certificates</h1>
          <p className="subheader">Professional certifications and recommendation letters.</p>

          <div className="tabs">
            <button
              className="tab"
              aria-pressed={tab === "certificates"}
              onClick={() => setTab("certificates")}
            >
              📜 Certificates ({certificates.length})
            </button>
            <button
              className="tab"
              aria-pressed={tab === "recommendations"}
              onClick={() => setTab("recommendations")}
            >
              📋 Recommendations ({recommendations.length})
            </button>
          </div>

          <div className="grid">
            {current.length ? (
              current.map((doc) => <DocumentCard key={doc.id} doc={doc} />)
            ) : (
              <div className="empty">No {tab} available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default Certificates;
export { Certificates };
