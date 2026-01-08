// Members Page //

import { Link } from "react-router-dom";

export default function Member() {
  return (
    <section style={cardStyle}>
      <div style={headerRowStyle}>
        <div>
          <h1 style={h1Style}>Members Area</h1>
          <p style={subStyle}>Documents, standards, and member resources.</p>
        </div>

      </div>

      <div style={gridStyle}>
        <Link to="/member/agreement" style={tileStyle}>
          <div style={tileTitleStyle}>Collective Agreement</div>
          <div style={tileSubStyle}>Open the current NCPS collective agreement.</div>
        </Link>

        <Link to="/member/documents" style={tileStyle}>
          <div style={tileTitleStyle}>Documents and Standards</div>
          <div style={tileSubStyle}>Guides, policies, and reference documents.</div>
        </Link>

        <Link to="/member/faq" style={tileStyle}>
          <div style={tileTitleStyle}>FAQ</div>
          <div style={tileSubStyle}>Common questions and quick answers.</div>
        </Link>

        <Link to="/member/contact" style={tileStyle}>
          <div style={tileTitleStyle}>Contact Executive and Committees</div>
          <div style={tileSubStyle}>Reach the Local 279 team.</div>
        </Link>
      </div>
    </section>
  );
}

const cardStyle = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
};

const headerRowStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 14,
};

const h1Style = {
  margin: 0,
  fontSize: 20,
  fontWeight: 950,
  color: "#0055b8",
};

const subStyle = {
  margin: "6px 0 0",
  fontSize: 14,
  opacity: 0.8,
  lineHeight: 1.4,
};

const gridStyle = {
  display: "grid",
  gap: 12,
};

const tileStyle = {
  textDecoration: "none",
  display: "block",
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,85,184,0.05)",
  padding: 14,
  color: "#0b2b3a",
};

const tileTitleStyle = {
  fontWeight: 950,
  color: "#0055b8",
  fontSize: 16,
};

const tileSubStyle = {
  marginTop: 6,
  fontSize: 14,
  opacity: 0.8,
  lineHeight: 1.4,
};
