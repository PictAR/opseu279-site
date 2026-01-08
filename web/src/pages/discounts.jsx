// web/src/pages/discounts.jsx

export default function Discounts() {
  return (
    <section style={{ display: "grid", gap: 14 }}>
      <header style={{ display: "grid", gap: 8 }}>
        <h1 style={h1Style}>Member Discounts</h1>
        <p style={subStyle}>
          OPSEU member discounts and deals are maintained on the OPSEU site.
        </p>
      </header>

      <section style={cardStyle}>
        <h2 style={h2Style}>OPSEU Member Discount Programs</h2>
        <p style={pStyle}>
          Phones, travel, insurance, tickets, and more.
        </p>

        <a
          href="https://opseu.org/member-discounts/"
          target="_blank"
          rel="noreferrer"
          style={linkStyle}
        >
          Open OPSEU Discounts Page
        </a>
      </section>
    </section>
  );
}

/* Styles */
const h1Style = { margin: 0, fontSize: 20, fontWeight: 950, color: "#0055b8" };
const subStyle = { margin: 0, opacity: 0.85, lineHeight: 1.5 };

const cardStyle = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  display: "grid",
  gap: 12,
};

const h2Style = { margin: 0, fontSize: 16, fontWeight: 950, color: "#0055b8" };
const pStyle = { margin: 0, lineHeight: 1.5, opacity: 0.9 };

const linkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,85,184,0.25)",
  background: "rgba(0,85,184,0.10)",
  color: "#0055b8",
  fontWeight: 950,
  textDecoration: "none",
  width: "fit-content",
};
