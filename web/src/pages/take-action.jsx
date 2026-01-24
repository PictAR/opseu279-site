// web/src/pages/take-action.jsx

export default function TakeAction() {
  return (
    <section style={{ display: "grid", gap: 14 }}>
      <header style={{ display: "grid", gap: 8 }}>
        <h1 style={h1Style}>Take Action</h1>
        <p style={subStyle}>
          Member tools for contacting elected representatives. Copy a template, personalize it, and send it.
        </p>
      </header>

      <section style={cardStyle}>
        <h2 style={h2Style}>Presumptive Cancer Coverage for Paramedics</h2>
        <p style={pStyle}>
          Ask your MPP to support presumptive legislation for paramedics diagnosed with cancer.
        </p>

        <div style={linkRowStyle}>
          <a
            href="/campaigns/cancer/lobby-sheet-cancer-in-paramedics.pdf"
            target="_blank"
            rel="noreferrer"
            style={buttonLinkStyle}
          >
            Open Lobby Sheet PDF
          </a>

          <a
            href="https://www.elections.on.ca/en/voting-in-ontario/electoral-districts.html"
            target="_blank"
            rel="noreferrer"
            style={buttonLinkStyle}
          >
            Find your MPP
          </a>
        </div>
      </section>
    </section>
  );
}

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

const linkRowStyle = { display: "flex", gap: 10, flexWrap: "wrap" };

const buttonLinkStyle = {
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
};
