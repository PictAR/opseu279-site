import { Link } from "react-router-dom";

const DOCS = [
  { title: "BLS Patient Care Standards", note: "Link or upload PDF" },
  { title: "Ambulance Documentation Standards", note: "Link or upload PDF" },
  { title: "Highway Traffic Act", note: "Link to Ontario e-Laws" },
  { title: "Ambulance Act", note: "Link to Ontario e-Laws" },
  { title: "Service SOPs and Policies", note: "Local process / links" },
];

export default function Documents() {
  return (
    <main style={{ minHeight: "100vh", background: "#0e6ea6", padding: 16, color: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Documents and Standards</h1>
          <Link to="/" style={{ color: "#fff", opacity: 0.9 }}>Back</Link>
        </div>

        <p style={{ opacity: 0.9 }}>
          This is the “what we’re expected to follow” hub. We can link to official sources or host copies.
        </p>

        <div style={{ display: "grid", gap: 10 }}>
          {DOCS.map((d) => (
            <div
              key={d.title}
              style={{
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: 12,
                background: "rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ fontWeight: 800 }}>{d.title}</div>
              <div style={{ opacity: 0.9, fontSize: 14 }}>{d.note}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
