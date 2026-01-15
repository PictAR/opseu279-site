// web/src/components/ReleaseNotes.jsx

import { RELEASE_NOTES } from "../data/releaseNotes.js";

export default function ReleaseNotes() {
  if (!RELEASE_NOTES?.length) return null;

  const latest = RELEASE_NOTES[0];

  return (
    <div style={wrapStyle}>
      <details style={detailsStyle}>
        <summary style={summaryStyle}>
          <span style={{ fontWeight: 950, color: "#0055b8" }}>
            Release notes
          </span>
          <span style={metaStyle}>
            {latest.version} • {latest.date}
          </span>
        </summary>

        <div style={panelStyle}>
          {RELEASE_NOTES.map((r) => (
            <div
              key={`${r.version}-${r.date}`}
              style={{ display: "grid", gap: 8 }}
            >
              <div style={{ fontWeight: 950, color: "#0b2b3a" }}>
                {r.version} • {r.date}
              </div>

              <ul style={listStyle}>
                {(r.items || []).map((it, idx) => (
                  <li key={idx} style={liStyle}>
                    {it}
                  </li>
                ))}
              </ul>

              <div style={{ height: 1, background: "rgba(0,0,0,0.08)" }} />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

const wrapStyle = {
  width: "100%",
  maxWidth: 760,
  margin: "0 auto",
  padding: "0 20px",
};

const detailsStyle = {
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.35)",
  background: "rgba(255,255,255,0.12)",
};

const summaryStyle = {
  listStyle: "none",
  cursor: "pointer",
  padding: "12px 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
};

const metaStyle = {
  fontSize: 12,
  fontWeight: 900,
  color: "rgba(255,255,255,0.95)",
};

const panelStyle = {
  background: "#ffffff",
  borderTop: "1px solid rgba(255,255,255,0.35)",
  borderBottomLeftRadius: 14,
  borderBottomRightRadius: 14,
  padding: 14,
  maxHeight: 220,
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

const listStyle = { margin: 0, paddingLeft: 18, display: "grid", gap: 6 };
const liStyle = { color: "#0b2b3a", lineHeight: 1.4, fontSize: 13 };
