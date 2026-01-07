import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <main style={{ minHeight: "100vh", background: "#0e6ea6", padding: 16, color: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Contact Executive and Committees</h1>
          <Link to="/" style={{ color: "#fff", opacity: 0.9 }}>Back</Link>
        </div>

        <p style={{ opacity: 0.9, margin: 0 }}>
          Contact form coming next. For now this page confirms routing works.
        </p>
      </div>
    </main>
  );
}
