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

        <Link to="/" style={homeLinkStyle}>
          Back to Home
        </Link>
      </div>

      <div style={gridStyle}>
        {/* Consolidated tile (CA + Wages/Benefits bundled here) */}
        <Link to="/members/agreement" style={tileStyle}>
          <div style={tileTitleStyle}>Collective Agreement, Wages, Benefits</div>
          <div style={tileSubStyle}>
            Norfolk Local 279 CA plus the CA AI Q and A. Wage and benefits tools will live here too.
          </div>
        </Link>

        {/* Seniority */}
        <Link to="/members/seniority" style={tileStyle}>
          <div style={tileTitleStyle}>Seniority Lists</div>
          <div style={tileSubStyle}>Past and present seniority lists.</div>
        </Link>

        {/* External links requested */}
        <a
          href="https://www.ontario.ca/laws/"
          target="_blank"
          rel="noreferrer"
          style={tileStyle}
        >
          <div style={tileTitleStyle}>Ontario E Laws</div>
          <div style={tileSubStyle}>Official Ontario legislation lookup.</div>
        </a>

        <a
          href="https://www.lr.labour.gov.on.ca/en-CA/Collective-Agreements/"
          target="_blank"
          rel="noreferrer"
          style={tileStyle}
        >
          <div style={tileTitleStyle}>Collective Agreement Lookup</div>
          <div style={tileSubStyle}>Ontario Ministry searchable CA database.</div>
        </a>

        {/* Keep the rest as-is */}
        <Link to="/members/documents" style={tileStyle}>
          <div style={tileTitleStyle}>Documents and Standards</div>
          <div style={tileSubStyle}>Guides, standards, and reference documents.</div>
        </Link>

        <Link to="/members/peer-support" style={tileStyle}>
          <div style={tileTitleStyle}>Peer Support</div>
          <div style={tileSubStyle}>Connect with resources in support of mental health.</div>
        </Link>

        <Link to="/members/faq" style={tileStyle}>
          <div style={tileTitleStyle}>FAQ</div>
          <div style={tileSubStyle}>Common questions and quick answers.</div>
        </Link>

        <Link to="/members/take-action" style={tileStyle}>
          <div style={tileTitleStyle}>Take Action</div>
          <div style={tileSubStyle}>Member tools for contacting elected representatives.</div>
        </Link>

        <Link to="/members/discounts" style={tileStyle}>
          <div style={tileTitleStyle}>Member Discounts</div>
          <div style={tileSubStyle}>Exclusive discounts for OPSEU members.</div>
        </Link>

        <Link to="/members/contact" style={tileStyle}>
          <div style={tileTitleStyle}>Contact Executive and Committees</div>
          <div style={tileSubStyle}>Send an email with To, CC, BCC from one screen.</div>
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

const homeLinkStyle = {
  textDecoration: "none",
  fontWeight: 900,
  color: "#0055b8",
  border: "1px solid rgba(0,85,184,0.25)",
  background: "rgba(0,85,184,0.08)",
  padding: "10px 12px",
  borderRadius: 12,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
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
