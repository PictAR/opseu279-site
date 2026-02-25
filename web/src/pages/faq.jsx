import { Link } from "react-router-dom";
import { useState } from "react";

const FAQ = [
  {
    q: "What are my rights?",
    a: "Starter draft: This section will outline common member rights such as union representation, the right to ask for clarification, and what to do if approached by management. We will refine this with Local 279 specifics and the CA language.",
  },
  {
    q: "Wages and benefits",
    a: "Starter draft: This section will summarize where to find wage grids, premiums, and core benefits info, and how to confirm what applies to your classification. We will add direct references to the CA sections once the PDF is posted.",
  },
  {
    q: "Vacation",
    a: "Starter draft: This section will cover vacation entitlement, vacation pay percentages, requesting time off, and typical scheduling issues. We will add the Local 279 process and CA references.",
  },
];

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: 12,
        overflow: "hidden",
        background: "rgba(255,255,255,0.08)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: 12,
          background: "transparent",
          border: "none",
          color: "#fff",
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        {q}
      </button>
      {open && (
        <div style={{ padding: "0 12px 12px", opacity: 0.95, lineHeight: 1.4 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0e6ea6",
        padding: 16,
        color: "#fff",
      }}
    >
      <div
        style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 12 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 20 }}>FAQ</h1>
        </div>

        <p style={{ margin: 0, opacity: 0.9 }}>
          These answers are a draft. We will add Local 279 details and CA
          section references.
        </p>

        {FAQ.map((f) => (
          <Item key={f.q} q={f.q} a={f.a} />
        ))}
      </div>
    </main>
  );
}
