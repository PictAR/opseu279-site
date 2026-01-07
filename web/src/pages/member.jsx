import { Link } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";

export default function Member() {
  return (
    <main style={{ minHeight: "100vh", background: "#0e6ea6", padding: 16, color: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Member Menu</h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link to="/" style={{ color: "#fff", opacity: 0.9 }}>Home</Link>
            <UserButton />
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <Link to="/agreement.jsx" style={linkButtonStyle}>Collective Agreement</Link>
          <Link to="/faq.jsx" style={linkButtonStyle}>FAQ</Link>
          <Link to="/documents.jsx" style={linkButtonStyle}>Documents and Standards</Link>
          <Link to="/contact.jsx" style={linkButtonStyle}>Contact Executive and Committees</Link>
        </div>
      </div>
    </main>
  );
}

const linkButtonStyle = {
  display: "block",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.10)",
  color: "#fff",
  fontWeight: 800,
};
