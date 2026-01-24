// web/src/pages/documents.jsx
import { useMemo, useState } from "react";
import AskCaBox from "../components/AskCaBox";

// IMPORTANT: this assumes you are using a NAMED export like:
// export const CA_LIBRARY = [ ... ]
import { CA_LIBRARY } from "../data/caLibrary.js";

/**
 * Public folder -> site root
 * If your file lives at: web/public/library/cas/ems/norfolk/file.pdf
 * then href must be: /library/cas/ems/norfolk/file.pdf
 */
function toRootHref(href) {
  const raw = String(href || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return raw;

  // handle accidental "public/..." or "./..."
  const cleaned = raw.replace(/^\.?\/*public\//, "").replace(/^\.\//, "");
  return `/${cleaned}`;
}

function norm(s) {
  return String(s || "")
    .trim()
    .toLowerCase();
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

// Simple token search: "opseu norfolk 2023" must match all tokens somewhere
function matchesTokens(haystack, query) {
  const q = norm(query);
  if (!q) return true;
  const tokens = q.split(/\s+/).filter(Boolean);
  const h = norm(haystack);
  return tokens.every((t) => h.includes(t));
}

export default function Documents() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [union, setUnion] = useState("all");
  const [local, setLocal] = useState("all");
  const [docType, setDocType] = useState("all");

  // Resource documents dropdown (keep this clean for now)
  // Update paths if you moved them under /library/docs/ontario/...
  const RESOURCE_DOCS = useMemo(
    () => [
      {
        group: "Ontario Public Documents",
        items: [
          {
            label: "Bill 124 Repeal and Public Sector Pay Implications",
            href: "/docs/ontario/bill124-repeal-and-public-sector-pay-implications.pdf",
          },
          {
            label: "Ontario Paramedic Interfacility Patient Transfer Directive",
            href: "/docs/ontario/ontario-paramedic-interfacility-patient-transfer-directive.pdf",
          },
          {
            label:
              "Protecting a Sustainable Public Sector for Future Generations Act (2019) (Bill 124)",
            href: "/docs/ontario/protecting-a-sustainable-public-sector-for-future-generations-act-2019-bill124.pdf",
          },
          {
            label: "Respectful Workplace Policy (Ontario Government)",
            href: "/docs/ontario/respectful-workplace-policy-ontario-government.pdf",
          },
          {
            label: "OHSA Workplace Violence and Harassment",
            href: "/docs/ontario/ohsa-workplace-violence-and-harassment.pdf",
          },
        ],
      },
    ],
    [],
  );

  const caItems = useMemo(() => {
    const base = Array.isArray(CA_LIBRARY) ? CA_LIBRARY : [];

    // normalize + guard
    return base
      .map((x) => ({
        type: x.type || "", // ems, fire, police
        union: x.union || "",
        local: x.local || "",
        service: x.service || "",
        docType: x.docType || "", // ca, moa, ia, etc
        from: x.from ?? "",
        to: x.to ?? "",
        href: toRootHref(x.href),
      }))
      .filter((x) => x.href);
  }, []);

  const filterOptions = useMemo(() => {
    return {
      types: uniq(caItems.map((x) => x.type)).sort(),
      unions: uniq(caItems.map((x) => x.union)).sort(),
      locals: uniq(caItems.map((x) => String(x.local))).sort(),
      docTypes: uniq(caItems.map((x) => x.docType)).sort(),
    };
  }, [caItems]);

  const filtered = useMemo(() => {
    const items = caItems.filter((x) => {
      if (type !== "all" && norm(x.type) !== norm(type)) return false;
      if (union !== "all" && norm(x.union) !== norm(union)) return false;
      if (local !== "all" && String(x.local) !== String(local)) return false;
      if (docType !== "all" && norm(x.docType) !== norm(docType)) return false;

      const haystack = [
        x.type,
        x.union,
        x.local,
        x.service,
        x.docType,
        x.from,
        x.to,
      ].join(" ");

      return matchesTokens(haystack, q);
    });

    // Sort: type -> union -> service -> newest to
    return items.sort((a, b) => {
      const t = norm(a.type).localeCompare(norm(b.type));
      if (t) return t;
      const u = norm(a.union).localeCompare(norm(b.union));
      if (u) return u;
      const s = norm(a.service).localeCompare(norm(b.service));
      if (s) return s;
      return Number(b.to || 0) - Number(a.to || 0);
    });
  }, [caItems, q, type, union, local, docType]);

  // Resource dropdown state
  const [docPick, setDocPick] = useState("");
  const pickedHref = docPick ? toRootHref(docPick) : "";

  return (
    <section style={{ display: "grid", gap: 14 }}>
      {/* 1) CA AI tool at top */}
      <div style={cardStyle}>
        <h1 style={h1Style}>Library</h1>
        <p style={pStyle}>
          Search collective agreements and key documents. Use the AI tool below
          for quick agreement questions.
        </p>

        <div style={{ marginTop: 10 }}>
          <AskCaBox />
        </div>
      </div>

      {/* 2) Collective Agreement Library */}
      <div style={cardStyle}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={sectionTitleStyle}>Collective Agreement Library</div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by service, union, local, doc type, years…"
            style={searchStyle}
            aria-label="Search collective agreements"
          />

          <details style={detailsStyle}>
            <summary style={summaryStyle}>Filters</summary>

            <div style={filterGridStyle}>
              <div style={filterItemStyle}>
                <div style={filterLabelStyle}>Type</div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">All</option>
                  {filterOptions.types.map((v) => (
                    <option key={v} value={v}>
                      {v.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div style={filterItemStyle}>
                <div style={filterLabelStyle}>Union</div>
                <select
                  value={union}
                  onChange={(e) => setUnion(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">All</option>
                  {filterOptions.unions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div style={filterItemStyle}>
                <div style={filterLabelStyle}>Local</div>
                <select
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">All</option>
                  {filterOptions.locals.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div style={filterItemStyle}>
                <div style={filterLabelStyle}>Doc Type</div>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  style={selectStyle}
                >
                  <option value="all">All</option>
                  {filterOptions.docTypes.map((v) => (
                    <option key={v} value={v}>
                      {v.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </details>

          <div style={resultMetaStyle}>
            {caItems.length ? (
              <>
                Showing <b>{filtered.length}</b> of <b>{caItems.length}</b>
              </>
            ) : (
              <span style={{ opacity: 0.85 }}>
                No CA items loaded. Check your <code>CA_LIBRARY</code>{" "}
                import/export.
              </span>
            )}
          </div>

          {filtered.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {filtered.map((x) => (
                <a
                  key={`${x.href}-${x.service}-${x.docType}-${x.from}-${x.to}`}
                  href={x.href}
                  target="_blank"
                  rel="noreferrer"
                  style={resultRowStyle}
                  title="Open PDF"
                >
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={resultServiceStyle}>
                      {x.service || "Untitled Service"}
                    </div>

                    <div style={resultMetaLineStyle}>
                      <span style={pillStyle}>
                        {String(x.type || "").toUpperCase()}
                      </span>
                      <span style={pillStyle}>
                        {String(x.docType || "").toUpperCase()}
                      </span>
                      <span style={pillSoftStyle}>{x.union}</span>
                      {x.local ? (
                        <span style={pillSoftStyle}>Local {x.local}</span>
                      ) : null}
                      {x.from || x.to ? (
                        <span style={pillSoftStyle}>
                          {x.from || "?"} to {x.to || "?"}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <span style={openHintStyle}>Open</span>
                </a>
              ))}
            </div>
          ) : caItems.length ? (
            <div style={emptyStyle}>
              No matches. Try fewer words (or clear filters).
            </div>
          ) : null}
        </div>
      </div>

      {/* 3) Resource documents dropdown */}
      <div style={cardStyle}>
        <div style={sectionTitleStyle}>Resource Documents</div>
        <p style={pStyle}>
          Quick reference documents (Ontario public docs, policies, etc).
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
          <select
            value={docPick}
            onChange={(e) => setDocPick(e.target.value)}
            style={selectStyle}
          >
            <option value="">Select a document…</option>
            {RESOURCE_DOCS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((it) => (
                  <option key={it.href} value={it.href}>
                    {it.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <a
            href={pickedHref || "#"}
            target={pickedHref ? "_blank" : undefined}
            rel={pickedHref ? "noreferrer" : undefined}
            onClick={(e) => {
              if (!pickedHref) e.preventDefault();
            }}
            style={{
              ...openDocButtonStyle,
              opacity: pickedHref ? 1 : 0.5,
              pointerEvents: pickedHref ? "auto" : "none",
            }}
          >
            Open selected document
          </a>
        </div>

        {/* Only at the VERY bottom, under resource docs */}
        <div style={bottomLinksWrapStyle}>
          <a
            href="https://opseu.org/members-workplaces/find-your-collective-agreement/"
            target="_blank"
            rel="noreferrer"
            style={bottomLinkStyle}
          >
            OPSEU collective agreement lookup
          </a>
          <a
            href="https://www.ontario.ca/laws"
            target="_blank"
            rel="noreferrer"
            style={bottomLinkStyle}
          >
            Ontario e-Laws lookup
          </a>
        </div>
      </div>
    </section>
  );
}

/* Styles */
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
const pStyle = { margin: 0, lineHeight: 1.6, fontSize: 15, opacity: 0.9 };

const sectionTitleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 950,
  color: "#0055b8",
};

const searchStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "rgba(255,255,255,0.96)",
  fontSize: 15,
};

const detailsStyle = {
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 14,
  padding: 10,
  background: "rgba(0,85,184,0.03)",
};

const summaryStyle = {
  cursor: "pointer",
  fontWeight: 900,
  color: "#0b2b3a",
  listStyle: "none",
};

const filterGridStyle = {
  marginTop: 10,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 10,
};

const filterItemStyle = { display: "grid", gap: 6 };
const filterLabelStyle = { fontSize: 12, fontWeight: 900, opacity: 0.85 };

const selectStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 10px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "rgba(255,255,255,0.96)",
  fontSize: 14,
};

const resultMetaStyle = { fontSize: 13, opacity: 0.8 };

const resultRowStyle = {
  textDecoration: "none",
  color: "#0b2b3a",
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.8)",
  borderRadius: 14,
  padding: 12,
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};

const resultServiceStyle = {
  fontWeight: 950,
  color: "#0b2b3a",
  lineHeight: 1.2,
};

const resultMetaLineStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "center",
};

const pillStyle = {
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid rgba(0,85,184,0.25)",
  background: "rgba(0,85,184,0.10)",
  color: "#0055b8",
  fontWeight: 950,
  fontSize: 12,
};

const pillSoftStyle = {
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,0,0,0.03)",
  fontSize: 12,
  opacity: 0.9,
};

const openHintStyle = {
  color: "#0055b8",
  fontWeight: 950,
  fontSize: 13,
  borderBottom: "2px solid rgba(0,85,184,0.35)",
  paddingBottom: 2,
  whiteSpace: "nowrap",
};

const emptyStyle = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,0,0,0.03)",
  opacity: 0.85,
};

const openDocButtonStyle = {
  textDecoration: "none",
  textAlign: "center",
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "rgba(0,85,184,0.10)",
  color: "#0055b8",
  fontWeight: 950,
};

const bottomLinksWrapStyle = {
  marginTop: 14,
  paddingTop: 12,
  borderTop: "1px solid rgba(0,0,0,0.08)",
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
};

const bottomLinkStyle = {
  color: "#0055b8",
  fontWeight: 900,
  textDecoration: "none",
  borderBottom: "2px solid rgba(0,85,184,0.25)",
  paddingBottom: 2,
};
