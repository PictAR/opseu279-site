import { useMemo } from "react";
import { RELEASE_NOTES } from "../data/releaseNotes.js";

function normalizeItems(entry) {
  const raw = entry?.items ?? entry?.changes ?? entry?.notes ?? "";
  if (Array.isArray(raw)) return raw.filter(Boolean);
  return String(raw)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ReleaseNotes() {
  const latest = useMemo(() => {
    if (!Array.isArray(RELEASE_NOTES) || !RELEASE_NOTES.length) return null;
    return RELEASE_NOTES[0];
  }, []);

  if (!latest) return null;

  const items = normalizeItems(latest);

  return (
    <section style={wrapStyle}>
      <details style={detailsStyle}>
        <summary style={summaryStyle}>
          <span style={summaryLeftStyle}>
            <span style={badgeStyle}>{latest.version}</span>
            <span style={dateStyle}>{latest.date}</span>
          </span>
          <span style={summaryHintStyle}>Release notes</span>
        </summary>

        <div style={bodyStyle}>
          {items.length ? (
            <ul style={listStyle}>
              {items.map((t, i) => (
                <li key={i} style={liStyle}>
                  {t}
                </li>
              ))}
            </ul>
          ) : (
            <div style={mutedStyle}>No notes added yet.</div>
          )}
        </div>
      </details>
    </section>
  );
}

const wrapStyle = { width: "100%" };

const detailsStyle = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.35)",
  background: "rgba(255,255,255,0.10)",
  overflow: "hidden",
};

const summaryStyle = {
  listStyle: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "12px 14px",
  userSelect: "none",
};

const summaryLeftStyle = { display: "flex", alignItems: "center", gap: 10 };

const badgeStyle = {
  display: "inline-flex",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.45)",
  fontWeight: 950,
  fontSize: 12,
  color: "#ffffff",
};

const dateStyle = { fontSize: 12, opacity: 0.9, color: "#ffffff" };

const summaryHintStyle = { fontSize: 12, opacity: 0.9, color: "#ffffff" };

const bodyStyle = {
  padding: "0 14px 14px",
};

const listStyle = {
  margin: "10px 0 0",
  paddingLeft: 18,
  display: "grid",
  gap: 8,
  maxHeight: 220, // key: keeps footer tidy
  overflowY: "auto", // key: scroll inside notes
  WebkitOverflowScrolling: "touch",
};

const liStyle = {
  color: "#ffffff",
  opacity: 0.95,
  lineHeight: 1.35,
  fontSize: 13,
};

const mutedStyle = {
  marginTop: 10,
  color: "#ffffff",
  opacity: 0.85,
  fontSize: 13,
};
