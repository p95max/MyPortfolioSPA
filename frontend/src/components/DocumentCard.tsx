import { useMemo, useState } from "react";

export interface DocItem {
  id: string;
  title: string;
  issuer: string;
  description: string;
  fileName: string;
  type: "certificate" | "recommendation";
  previewImage?: string; // больше не используется, можно удалить из данных позже
}

const btnBase: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

export default function DocumentCard({ doc }: { doc: DocItem }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const fileHref = useMemo(
    () => `/${doc.fileName}#toolbar=1&navpanes=0&view=fitH`,
    [doc.fileName]
  );
  const openHref = useMemo(() => `/${doc.fileName}`, [doc.fileName]);

  const downloadFile = () => {
    setIsDownloading(true);
    const a = document.createElement("a");
    a.href = openHref;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => setIsDownloading(false), 800);
  };

  return (
    <div
      style={{
        border: "1px solid #1f2937",
        background: "var(--card-bg)",
        borderRadius: 12,
        padding: 16,
        display: "grid",
        gap: 14,
      }}
    >
      {/* верх карточки без превью-картинки */}
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              display: "grid",
              placeItems: "center",
              background: "#0f172a",
              border: "1px solid #334155",
              color: "#e5e7eb",
              fontSize: 18,
            }}
            title={doc.type}
            aria-hidden
          >
            {doc.type === "certificate" ? "📜" : "📋"}
          </div>
          <div>
            <h3 style={{ margin: 0, color: "var(--text-color)" }}>{doc.title}</h3>
            <div style={{ color: "var(--muted-color)", fontSize: 13 }}>
              {doc.type === "certificate" ? "Issued by: " : "From: "}
              <strong style={{ color: "#cbd5e1" }}>{doc.issuer}</strong>
            </div>
          </div>
        </div>

        <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.55 }}>{doc.description}</p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
          <a
            href={openHref}
            target="_blank"
            rel="noreferrer"
            style={{
              ...btnBase,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              color: "var(--muted-color)",
              border: "1px solid rgba(255,255,255,0.06)",
              textDecoration: "none",
            }}
          >
            View PDF
          </a>

          <button
            onClick={downloadFile}
            disabled={isDownloading}
            style={{
              ...btnBase,
              background: "#22c55e",
              color: "#0b0f15",
              fontWeight: 700,
              opacity: isDownloading ? 0.8 : 1,
            }}
          >
            {isDownloading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>

      <div
        style={{
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <iframe
          src={fileHref}
          width="100%"
          height={520}
          title={doc.title}
          style={{ display: "block", border: 0, background: "#0b0f15" }}
        />
      </div>
    </div>
  );
}
