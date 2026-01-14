import MemberHeader from "../components/MemberHeader";

// Put PDFs in: web/public/seniority/
// Example URLs become: /seniority/seniority-current.pdf
const LISTS = [
  { label: "Seniority List (Current)", href: "/seniority/seniority-current.pdf" },
  { label: "Seniority List (2025)", href: "/seniority/seniority-2025.pdf" },
  { label: "Seniority List (2024)", href: "/seniority/seniority-2024.pdf" },
];

export default function Seniority() {
  return (
    <section style={{ display: "grid", gap: 14 }}>
      <MemberHeader title="Seniority Lists" />

      <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.5 }}>
        Add PDFs to <code>web/public/seniority/</code> and update this list.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {LISTS.map((x) => (
          <a
            key={x.href}
            href={x.href}
            target="_blank"
            rel="noreferrer"
            style={itemStyle}
          >
            <span style={{ fontWeight: 950, color: "#0055b8" }}>{x.label}</span>
            <span style={{ opacity: 0.7 }}>Open →</span>
          </a>
        ))}
      </div>
    </section>
  );
}

const itemStyle = {
  textDecoration: "none",
  color: "#0b2b3a",
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "rgba(255,255,255,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};
