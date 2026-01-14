const LISTS = [
  // Replace / add to these when you have files ready:
  { label: "Seniority List (Current)", href: "/seniority/seniority-current.pdf" },
  { label: "Seniority List (2025)", href: "/seniority/seniority-2025.pdf" },
  { label: "Seniority List (2024)", href: "/seniority/seniority-2024.pdf" },
];

export default function SeniorityLists() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ opacity: 0.8 }}>
        Drop PDF files in <code>web/public/seniority/</code> and update this list.
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {LISTS.map((x) => (
          <a
            key={x.href}
            href={x.href}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              color: "inherit",
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span style={{ fontWeight: 600 }}>{x.label}</span>
            <span style={{ opacity: 0.7 }}>Open →</span>
          </a>
        ))}
      </div>
    </div>
  );
}
