import { Link } from "react-router-dom";

export default function Agreement() {
  return (
    <main style={{ minHeight: "100vh", background: "#0e6ea6", padding: 16, color: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Collective Agreement</h1>
          <Link to="/" style={{ color: "#fff", opacity: 0.9 }}>Back</Link>
        </div>

        <p style={{ opacity: 0.9 }}>
          You can search within the PDF using your browser’s PDF controls.
        </p>

        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)" }}>
          <iframe
            title="Collective Agreement"
            src="/collective-agreement.pdf"
            style={{ width: "100%", height: "78vh", border: "none", background: "#fff" }}
          />
        </div>

        <p style={{ marginTop: 12 }}>
          <a href="/collective-agreement.pdf" style={{ color: "#fff", fontWeight: 700 }}>
            Download PDF
          </a>
        </p>
      </div>
    </main>
  );
}
