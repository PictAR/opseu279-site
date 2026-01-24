import { Link } from "react-router-dom";

export default function Local279() {
  return (
    <section style={cardStyle}>
      <h1 style={h1Style}>Local 279</h1>
      <p style={pStyle}>
        This section will hold local specific items for members.
      </p>

      <div style={listStyle}>
        <div style={itemStyle}>Local 279 Executive (coming soon)</div>
        <div style={itemStyle}>Grievances (coming soon)</div>
        <div style={itemStyle}>Polls & Surveys (coming soon)</div>
        <div style={itemStyle}>
          Meetings (schedule + past minutes) (coming soon)
        </div>
        <div style={itemStyle}>Seniority Lists (coming soon)</div>

        <Link to="/members/contact" style={{ ...itemStyle, ...linkItemStyle }}>
          Contact Executive and Committees
        </Link>

        <a
          href="https://opseu.org/information/general/shop-opseu-enterprises-member-discount-programs/9410/"
          target="_blank"
          rel="noreferrer"
          style={{ ...itemStyle, ...linkItemStyle }}
        >
          Discounts (OPSEU Member Programs)
        </a>

        <div style={itemStyle}>Calendar (coming soon)</div>
      </div>
    </section>
  );
}

const cardStyle = {
  width: "100%",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  display: "grid",
  gap: 10,
};

const h1Style = { margin: 0, fontSize: 22, fontWeight: 950, color: "#0055b8" };
const pStyle = { margin: 0, lineHeight: 1.6, fontSize: 15 };

const listStyle = { display: "grid", gap: 10, marginTop: 6 };

const itemStyle = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,85,184,0.04)",
  fontSize: 15,
};

const linkItemStyle = {
  textDecoration: "none",
  color: "#0b2b3a",
  fontWeight: 900,
};
