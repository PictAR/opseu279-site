/* ******************* */
/* WageComparisonChart */
/* ******************* */

import { useEffect, useMemo, useState } from "react";

const DATA_URL = "/data/wages/wageCompChart-opseu_01.csv";

// Tiny CSV parser (handles quoted fields)
function parseCsv(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const out = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"') {
        const next = line[i + 1];
        if (inQuotes && next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (ch === "," && !inQuotes) {
        out.push(cur);
        cur = "";
        continue;
      }

      cur += ch;
    }
    out.push(cur);
    return out.map((s) => (s ?? "").trim());
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

function toNumberCurrency(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s.replace(/\$/g, "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatMoney(n) {
  try {
    return n.toLocaleString(undefined, { style: "currency", currency: "CAD" });
  } catch {
    return `$${Number(n).toFixed(2)}`;
  }
}

function formatDateLabel(isoOrDate) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  try {
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
  } catch {
    return String(isoOrDate);
  }
}

function normHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, "_");
}

function findColIndex(headers, candidates) {
  const map = headers.map(normHeader);
  for (const c of candidates) {
    const idx = map.indexOf(c);
    if (idx !== -1) return idx;
  }
  return -1;
}

function isPcpTopRateRow(service, cls, step) {
  // Safety: omit Elgin even if it sneaks in later
  if (String(service).toLowerCase().includes("elgin")) return false;

  const c = String(cls).trim().toUpperCase();
  const st = String(step).trim().toUpperCase();

  // Your CSV uses "PCP FT" and "LEVEL 2"
  return c.includes("PCP") && st.includes("LEVEL 2");
}

function buildFilledSeries({ headers, rows }) {
  if (!headers?.length || !rows?.length) return null;

  const idxService = findColIndex(headers, ["service", "local"]);
  const idxClass = findColIndex(headers, ["class", "class_"]);
  const idxStep = findColIndex(headers, ["step"]);

  if (idxService === -1 || idxClass === -1 || idxStep === -1) {
    return { series: [], reason: "Missing expected columns (service/class/step)." };
  }

  // Date columns = headers that parse as dates
  const dateCols = headers
    .map((h, i) => ({ h, i, d: new Date(h) }))
    .filter((x) => x.d instanceof Date && !Number.isNaN(x.d.getTime()))
    .sort((a, b) => a.d - b.d);

  // Drop fully empty date columns
  const nonBlankDateCols = dateCols.filter((col) => {
    for (const r of rows) {
      const v = String(r[col.i] ?? "").trim();
      if (v) return true;
    }
    return false;
  });

  // Forward-fill service/class if sheet has blank repeated cells
  let lastService = "";
  let lastClass = "";

  const filtered = [];
  for (const r of rows) {
    const rawService = String(r[idxService] ?? "").trim();
    const rawClass = String(r[idxClass] ?? "").trim();
    const rawStep = String(r[idxStep] ?? "").trim();

    const service = rawService || lastService;
    const cls = rawClass || lastClass;
    const step = rawStep;

    if (rawService) lastService = rawService;
    if (rawClass) lastClass = rawClass;

    if (!service || !cls || !step) continue;
    if (!isPcpTopRateRow(service, cls, step)) continue;

    filtered.push({ service, cls, step, row: r });
  }

  // Map: service -> Map(dateKey -> rate)
  const byService = new Map();
  for (const item of filtered) {
    const m = byService.get(item.service) || new Map();
    for (const col of nonBlankDateCols) {
      const rate = toNumberCurrency(item.row[col.i]);
      if (rate == null) continue;
      const key = col.d.toISOString().slice(0, 10);
      m.set(key, rate);
    }
    byService.set(item.service, m);
  }

  const dateKeys = nonBlankDateCols.map((c) => c.d.toISOString().slice(0, 10));

  // Forward-fill rates across the shared date grid
  const series = [];
  for (const [service, changes] of byService.entries()) {
    let last = null;

    const points = dateKeys.map((k) => {
      const v = changes.has(k) ? changes.get(k) : null;
      if (v != null) last = v;
      return { date: k, rate: last };
    });

    const firstIdx = points.findIndex((p) => p.rate != null);
    const trimmed = firstIdx >= 0 ? points.slice(firstIdx) : [];

    const latest = trimmed.length ? trimmed[trimmed.length - 1] : null;
    series.push({
      service,
      points: trimmed,
      latestRate: latest?.rate ?? null,
      latestDate: latest?.date ?? null,
    });
  }

  return { series };
}

// Higher contrast
const COLORS = ["#ecdc00", "#0016bd", "#d60000", "#00aeff", "#00c921", "#d55500"];

function buildPath(points, xFor, yFor) {
  const pts = points.filter((p) => p.rate != null);
  if (pts.length < 2) return "";
  let d = `M ${xFor(pts[0].date)} ${yFor(pts[0].rate)}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${xFor(pts[i].date)} ${yFor(pts[i].rate)}`;
  }
  return d;
}

export default function WageComparisonChart() {
  const [raw, setRaw] = useState({ headers: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [hoverIdx, setHoverIdx] = useState(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(DATA_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load wage data (${res.status})`);
        const text = await res.text();
        const parsed = parseCsv(text);
        if (!alive) return;
        setRaw(parsed);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load wage data.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  const built = useMemo(() => buildFilledSeries(raw), [raw]);

  const ranked = useMemo(() => {
    if (!built?.series?.length) return [];
    return [...built.series]
      .filter((s) => s.latestRate != null)
      .sort((a, b) => (b.latestRate ?? -Infinity) - (a.latestRate ?? -Infinity));
  }, [built]);

  useEffect(() => {
    if (!ranked.length) return;
    setSelected((prev) => {
      if (prev.size) return prev;
      return new Set(ranked.map((s) => s.service));
    });
  }, [ranked]);

  const activeSeries = useMemo(
    () => ranked.filter((s) => selected.has(s.service)),
    [ranked, selected],
  );

  // SVG sizing

  const BASE_W = 760;          // visible “card” width target
const PX_PER_POINT = 64;     // controls how “stretched” the timeline is

const chart = useMemo(() => {
  if (!activeSeries.length) return null;

  const allDates = new Set();
  for (const s of activeSeries) for (const p of s.points) allDates.add(p.date);
  const dates = [...allDates].sort();
  if (!dates.length) return null;

  let minY = Infinity;
  let maxY = -Infinity;
  for (const s of activeSeries) {
    for (const p of s.points) {
      if (p.rate == null) continue;
      minY = Math.min(minY, p.rate);
      maxY = Math.max(maxY, p.rate);
    }
  }
  if (!Number.isFinite(minY) || !Number.isFinite(maxY)) return null;

  const pad = Math.max(0.25, (maxY - minY) * 0.08);
  minY -= pad;
  maxY += pad;

  // ✅ Make SVG width depend on number of dates
  const svgW = Math.max(
    BASE_W,
    PAD_L + PAD_R + Math.max(1, dates.length - 1) * PX_PER_POINT
  );

  const x0 = PAD_L;
  const x1 = svgW - PAD_R;
  const y0 = H - PAD_B;
  const y1 = PAD_T;

  const dateIndex = new Map(dates.map((d, i) => [d, i]));

  const xFor = (date) => {
    const i = dateIndex.get(date) ?? 0;
    const t = dates.length <= 1 ? 0 : i / (dates.length - 1);
    return x0 + (x1 - x0) * t;
  };

  const yFor = (v) => {
    const t = (v - minY) / (maxY - minY || 1);
    return y0 - (y0 - y1) * t;
  };

  const yTicks = 5;
  const tickVals = Array.from({ length: yTicks }, (_, i) => {
    const t = yTicks === 1 ? 0 : i / (yTicks - 1);
    return minY + (maxY - minY) * (1 - t);
  });

  const xTickCount = Math.min(6, dates.length);
  const xTickIdxs = Array.from({ length: xTickCount }, (_, i) => {
    const t = xTickCount === 1 ? 0 : i / (xTickCount - 1);
    return Math.round(t * (dates.length - 1));
  });

  const hoverDate = hoverIdx != null && dates[hoverIdx] ? dates[hoverIdx] : null;

  return { dates, xFor, yFor, tickVals, xTickIdxs, hoverDate, svgW, x0, x1, y0, y1 };
}, [activeSeries, hoverIdx]);

  function toggleService(name) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(ranked.map((s) => s.service)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  if (loading) return <div style={mutedStyle}>Loading wage chart…</div>;
  if (err) return <div style={errorStyle}>Couldn’t load wage chart data. {err}</div>;

  if (!ranked.length) {
    return <div style={mutedStyle}>No PCP Level 2 wage data found in the CSV.</div>;
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={titleStyle}>PCP Top Rate (Level 2) wage comparison</div>
        <div style={mutedStyle}>
          Toggle services and compare base hourly rates over time. Ranking is based on each service’s latest listed rate.
        </div>
      </div>

      <div style={toggleCardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 950, color: "#0b2b3a" }}>Services (highest to lowest)</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={selectAll} style={miniButtonStyle}>Select all</button>
            <button type="button" onClick={clearAll} style={miniButtonStyle}>Clear</button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {ranked.map((s, idx) => {
            const on = selected.has(s.service);
            const color = COLORS[idx % COLORS.length];
            return (
              <label key={s.service} style={toggleRowStyle}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleService(s.service)}
                  style={{ transform: "scale(1.1)" }}
                />
                <span style={{ width: 10, height: 10, borderRadius: 999, background: color, display: "inline-block" }} />
                <span style={{ fontWeight: 950 }}>{s.service}</span>
                <span style={{ marginLeft: "auto", fontWeight: 950, color: "#0055b8" }}>
                  {s.latestRate != null ? formatMoney(s.latestRate) : "—"}
                </span>
                <span style={{ fontSize: 12, opacity: 0.75 }}>
                  {s.latestDate ? formatDateLabel(s.latestDate) : ""}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* FIXED: chartWrap closes properly, ternary closes properly */}
<div style={chartWrapStyle}>
  {!chart ? (
    <div style={mutedStyle}>Select at least one service to display the chart.</div>
  ) : (
    <div style={chartScrollerStyle}>
      <div style={{ width: chart.svgW }}>
        <svg
          width={chart.svgW}
          height={H}
          viewBox={`0 0 ${chart.svgW} ${H}`}
          style={chartSvgStyle}
          onMouseLeave={() => setHoverIdx(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const x0 = PAD_L;
            const x1 = chart.svgW - PAD_R;
            const t = Math.min(1, Math.max(0, (x - x0) / (x1 - x0)));
            const idx = Math.round(t * (chart.dates.length - 1));
            setHoverIdx(idx);
          }}
        >
          {/* your existing grid, ticks, paths, dots… */}
        </svg>
      </div>
    </div>
  )}
</div>

      {chart?.hoverDate ? (
        <div style={hoverCardStyle}>
          <div style={{ fontWeight: 950, color: "#0b2b3a" }}>
            {formatDateLabel(chart.hoverDate)}
          </div>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {activeSeries.map((s, si) => {
              const color = COLORS[si % COLORS.length];
              const p = s.points.find((x) => x.date === chart.hoverDate);
              return (
                <div key={s.service} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: color, display: "inline-block" }} />
                  <span style={{ fontWeight: 900 }}>{s.service}</span>
                  <span style={{ marginLeft: "auto", fontWeight: 950, color: "#0055b8" }}>
                    {p?.rate != null ? formatMoney(p.rate) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* ****** */
/* STYLES */
/* ****** */

const titleStyle = { fontSize: 16, fontWeight: 950, color: "#0055b8" };
const mutedStyle = { margin: 0, opacity: 0.8, fontSize: 13, lineHeight: 1.45 };

const errorStyle = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(184,74,0,0.25)",
  background: "rgba(184,74,0,0.08)",
  color: "#5a2b00",
  fontWeight: 900,
};

const toggleCardStyle = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.7)",
  display: "grid",
  gap: 10,
};

const toggleRowStyle = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,85,184,0.04)",
};

const miniButtonStyle = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid rgba(0,85,184,0.25)",
  background: "rgba(0,85,184,0.10)",
  color: "#0055b8",
  fontWeight: 950,
  cursor: "pointer",
};

const chartScrollerStyle = {
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  touchAction: "pan-x",
  overscrollBehaviorX: "contain",
  paddingBottom: 6,
};

const chartSvgStyle = {
  display: "block",
  background: "rgba(255,255,255,0.7)",
  borderRadius: 14,
};

const chartWrapStyle = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.7)",
};

const hoverCardStyle = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.7)",
};
