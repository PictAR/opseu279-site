// Documents Page //

// web/src/pages/documents.jsx

const ONTARIO_PUBLIC_DOCS = [
  {
    title: "Basic Life Support Patient Care Standards",
    short: "BLS",
    items: [
      { label: "Open PDF", href: "/docs/ontario/bls-standards-V3_4.pdf" },
    ],
  },
  {
    title: "Advanced Life Support Patient Care Standards",
    short: "ALS",
    items: [
      { label: "Open PDF", href: "/docs/ontario/alspc-standards-V5_3.pdf" },
    ],
  },
  {
    title: "Patient Care and Monitoring Standards",
    short: "PCMS",
    items: [
      { label: "Open PDF", href: "/docs/ontario/pcm-standards-V1_1.pdf" },
    ],
  },
  {
    title: "Canadian Triage and Acuity Scale",
    short: "CTAS",
    items: [{ label: "Open PDF", href: "/docs/ontario/ctas-V2_0.pdf" }],
  },
  {
    title: "Ontario Ambulance Documentation Standards",
    short: "OADS",
    items: [
      { label: "Open PDF", href: "/docs/ontario/oad-standards-V3_0.pdf" },
    ],
  },
  {
    title: "Patient Care Transportation Standards",
    short: "PCTS",
    items: [
      { label: "Open PDF", href: "/docs/ontario/pct-standards-V2_7.pdf" },
    ],
  },
];

export default function Documents() {
  return (
    <section style={{ display: "grid", gap: 14 }}>
      <header style={{ display: "grid", gap: 8 }}>
        <h1 style={h1Style}>Documents and Standards</h1>
        <p style={subStyle}>
          Public Ontario reference documents. Open PDFs in a new tab for best
          mobile zoom and navigation.
        </p>
      </header>

      <section style={cardStyle}>
        <h2 style={h2Style}>Ontario Public Documents</h2>

        <div style={{ display: "grid", gap: 12 }}>
          {ONTARIO_PUBLIC_DOCS.map((doc) => (
            <div key={doc.title} style={itemStyle}>
              <div style={{ display: "grid", gap: 4 }}>
                <div style={itemTitleStyle}>{doc.title}</div>
                <div style={itemMetaStyle}>{doc.short}</div>
              </div>

              <div style={linkRowStyle}>
                {doc.items.map((it) => (
                  <a
                    key={it.href}
                    href={it.href}
                    target="_blank"
                    rel="noreferrer"
                    style={pdfLinkStyle}
                  >
                    {it.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ ...cardStyle, marginTop: 14 }}>
        <h2 style={h2Style}>Ontario E Laws</h2>
        <p style={mutedStyle}>Official Ontario legislation lookup.</p>

        <div style={linkRowStyle}>
          <a
            href="https://www.ontario.ca/laws/"
            target="_blank"
            rel="noreferrer"
            style={buttonLinkStyle}
          >
            Open Ontario E Laws
          </a>
        </div>
      </section>

      <section style={noteStyle}>
        <div style={noteTitleStyle}>Note</div>
        <div style={noteTextStyle}>
          This page intentionally does not include service specific SOPs or
          internal operational documents.
        </div>
      </section>
    </section>
  );
}

/* Styles (local so this page cannot get wrecked by global css) */

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

const itemStyle = {
  display: "grid",
  gap: 10,
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,85,184,0.04)",
};

const itemTitleStyle = { fontWeight: 950, color: "#0b2b3a", fontSize: 15 };

const itemMetaStyle = { fontSize: 13, opacity: 0.8 };

const linkRowStyle = { display: "flex", gap: 10, flexWrap: "wrap" };

const pdfLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,85,184,0.25)",
  background: "rgba(0,85,184,0.10)",
  color: "#0055b8",
  fontWeight: 950,
  textDecoration: "none",
};

const noteStyle = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#ffffff",
  padding: 16,
  display: "grid",
  gap: 6,
};

const noteTitleStyle = { fontWeight: 950, color: "#0055b8" };

const noteTextStyle = { opacity: 0.8, lineHeight: 1.5 };
