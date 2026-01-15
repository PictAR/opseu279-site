// web/src/components/WageComparisonChart.jsx
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
  if (String(service).toLowerCase().includes("elgin")) return false;
  const c = String(cls).trim().toUpperCase();
  const st = String(step).trim().toUpperCase();
  return c.includes("PCP") && st.includes("LEVEL 2");
}

function buildFilledSeries({ headers, rows }) {
  if (!headers?.length || !rows?.length) return { series: [] };

  const idxService = findColIndex(headers, ["service", "local"]);
  const idxClass = findColIndex(headers, ["class", "class_"]);
  const idxStep = findColIndex(headers, ["step"]);

  if (idxService === -1 || idxClass === -1 || idxStep === -1) {
    return { series: [] };
  }

  const dateCols = headers
    .map((h, i) => ({ h, i, d: new Date(h) }))
    .filter((x) => x.d instanceof Date && !Number.isNaN(x.d.getTime()))
    .sort((a, b) => a.d - b.d);

  const nonBlankDateCols = dateCols.filter((col) => {
    for (const r of rows) {
      const v = (r[col.i] ?? "").trim();
      if (v) return true;
    }
    return false;
  });

  let lastService = "";
  let lastClass = "";

  const filtered = [];
  for (const r of rows) {
    const rawService = (r[idxService] ?? "").trim();
    const rawClass = (r[idxClass] ?? "").trim();
    const rawStep = (r[idxStep] ?? "").trim();

    const service = rawService || lastService;
    const cls = rawClass || lastClass;
    const step = rawStep;

    if (rawService) lastService = rawService;
    if (rawClass) lastClass = rawClass;

    if (!service || !cls || !step) continue;
    if (!isPcpTopRateRow(service, cls, step)) continue;

    filtered.push({ service, row: r });
  }

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

  const dates = nonBlankDateCols.map((c) => c.d);
  const dateKeys = dates.map((d) => d.toISOString().slice(0, 10));

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

const COLORS = ["#ecdc00", "#0016bd", "#d60000", "#00aeff", "#00c921", "#d55500"];

export default function WageComparisonChart() {
  const [raw, setRaw] = useState({ headers: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selected, setSelected] = useState(new Set());

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

  const activeSeries = useMemo(() => ranked.filter((s) => selected.has(s.service)), [ranked, selected]);

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

  // Layout constants (kept local so nothing is “not defined”)
  const H = 360;
  const PAD_L = 56;
  const PAD_R = 20;
  const PAD_T = 18;
  const PAD_B = 46;

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

    // Make it *wider than the card*, so the inner container actually scrolls.
    const DX = 72; // pixels per time step
    const W = Math.max(760, PAD_L + PAD_R + Math.max(0, (dates.length - 1) * DX));

    const xForIdx = (i) => PAD_L + i * DX;
    const y0 = H - PAD_B;
    const y1 = PAD_T;

    const yFor = (v) => {
      const t = (v - minY) / (maxY - minY || 1);
      return y0 - (y0 - y1) * t;
    };

    const yTicks = 5;
    const tickVals = Array.from({ length: yTicks }, (_, i) => {
      const t = yTicks === 1 ? 0 : i / (yTicks - 1);
      return minY + (maxY - minY) * (1 - t);
    });

    const xTickCount = Math.min(7, dates.length);
    const xTickIdxs = Array.from({ length: xTickCount }, (_, i) => {
      const t = xTickCount === 1 ? 0 : i / (xTickCount - 1);
      return Math.round(t * (dates.length - 1));
    });

    return { dates, W, xForIdx, yFor, tickVals, xTickIdxs, y0, y1 };
  }, [activeSeries]);

  if (loading) return <div style={mutedStyle}>Loading wage chart…</div>;
  if (err) return <div style={errorStyle}>Couldn’t load wage chart data. {err}</div>;
  if (!ranked.length) return <div style={mutedStyle}>No PCP Level 2 wage data found in the CSV.</div>;

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

      <div style={chartCardStyle}>
        {!chart ? (
          <div style={mutedStyle}>Select at least one service to display the chart.</div>
        ) : (
          <div style={chartScrollOuterStyle}>
            <div style={{ minWidth: chart.W }}>
              <svg width={chart.W} height={H} viewBox={`0 0 ${chart.W} ${H}`} style={chartSvgStyle}>
                {/* grid + y labels */}
                {chart.tickVals.map((v, i) => {
                  const y = chart.yFor(v);
                  return (
                    <g key={`y-${i}`}>
                      <line x1={PAD_L} y1={y} x2={chart.W - PAD_R} y2={y} stroke="rgba(0,0,0,0.08)" />
                      <text x={PAD_L - 10} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(0,0,0,0.65)">
                        {formatMoney(v)}
                      </text>
                    </g>
                  );
                })}

                {/* x labels */}
                {chart.xTickIdxs.map((di) => {
                  const x = chart.xForIdx(di);
                  const label = formatDateLabel(chart.dates[di]);
                  return (
                    <g key={`x-${di}`}>
                      <line x1={x} y1={PAD_T} x2={x} y2={H - PAD_B} stroke="rgba(0,0,0,0.06)" />
                      <text x={x} y={H - 18} textAnchor="middle" fontSize="11" fill="rgba(0,0,0,0.65)">
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* lines */}
                {activeSeries.map((s, si) => {
                  const color = COLORS[si % COLORS.length];

                  // build points aligned to chart.dates
                  const byDate = new Map(s.points.map((p) => [p.date, p.rate]));
                  const pts = chart.dates
                    .map((d, i) => {
                      const r = byDate.get(d);
                      if (r == null) return null;
                      return { x: chart.xForIdx(i), y: chart.yFor(r) };
                    })
                    .filter(Boolean);

                  if (pts.length < 2) return null;

                  const d = pts
                    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                    .join(" ");

                  return (
                    <path
                      key={s.service}
                      d={d}
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.95"
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

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

const chartCardStyle = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.7)",
};

const chartScrollOuterStyle = {
  width: "100%",
  maxWidth: "100%",
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  overscrollBehaviorX: "contain",
  touchAction: "pan-x",
  paddingBottom: 6,
};

const chartSvgStyle = {
  display: "block",
  width: "auto",
  height: "auto",
  background: "rgba(255,255,255,0.7)",
  borderRadius: 14,
};
