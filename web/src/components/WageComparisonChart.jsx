// web/src/components/WageComparisonChart.jsx
import { useEffect, useMemo, useState } from "react";

const DATA_URL = "/data/wages/wageCompChart-opseu_01.csv";

/* ------------------------- */
/* tiny CSV parser (quoted)  */
/* ------------------------- */
function parseCsv(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim().length);
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

function formatDateLabel(iso) {
  const d = new Date(iso);
  try {
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
  } catch {
    return String(iso);
  }
}

/* ----------------------------------------- */
/* Extract PCP Level 2 series per service     */
/* Forward-fill across shared date grid       */
/* ----------------------------------------- */

function buildSeries(parsed) {
  const { headers, rows } = parsed || {};
  if (!headers?.length || !rows?.length) return { series: [], dates: [], reason: "Empty CSV." };

  const idxService = findColIndex(headers, ["service", "local"]);
  const idxClass = findColIndex(headers, ["class", "class_"]);
  const idxStep = findColIndex(headers, ["step"]);

  if (idxService === -1 || idxClass === -1 || idxStep === -1) {
    return {
      series: [],
      dates: [],
      reason: "Missing required columns: service/local, class, step.",
    };
  }

  const dateCols = headers
    .map((h, i) => ({ h, i, d: new Date(h) }))
    .filter((x) => !Number.isNaN(x.d.getTime()))
    .sort((a, b) => a.d - b.d);

  if (!dateCols.length) return { series: [], dates: [], reason: "No date columns detected in CSV headers." };

  const nonBlankDateCols = dateCols.filter((col) => {
    for (const r of rows) {
      if ((r[col.i] ?? "").trim()) return true;
    }
    return false;
  });

  const dateKeys = nonBlankDateCols.map((c) => c.d.toISOString().slice(0, 10));

  const byService = new Map();

  for (const r of rows) {
    const service = (r[idxService] ?? "").trim();
    const cls = (r[idxClass] ?? "").trim().toUpperCase();
    const step = (r[idxStep] ?? "").trim().toUpperCase();

    if (!service) continue;
    if (service.toLowerCase().includes("elgin")) continue;
    if (!cls.includes("PCP")) continue;
    if (!step.includes("LEVEL 2")) continue;

    const m = byService.get(service) || new Map();
    for (let k = 0; k < nonBlankDateCols.length; k++) {
      const col = nonBlankDateCols[k];
      const v = toNumberCurrency(r[col.i]);
      if (v == null) continue;
      m.set(dateKeys[k], v);
    }
    byService.set(service, m);
  }

  const series = [];
  for (const [service, changes] of byService.entries()) {
    let last = null;
    const points = dateKeys.map((date) => {
      const v = changes.has(date) ? changes.get(date) : null;
      if (v != null) last = v;
      return { date, rate: last };
    });

    const first = points.findIndex((p) => p.rate != null);
    const trimmed = first >= 0 ? points.slice(first) : [];

    const latest = trimmed.length ? trimmed[trimmed.length - 1] : null;
    series.push({
      service,
      points: trimmed,
      latestRate: latest?.rate ?? null,
      latestDate: latest?.date ?? null,
    });
  }

  series.sort((a, b) => (b.latestRate ?? -Infinity) - (a.latestRate ?? -Infinity));

  return { series, dates: dateKeys, reason: "" };
}

/* ------------------------- */
/* SVG path builder          */
/* ------------------------- */
function buildPath(points, xFor, yFor) {
  let d = "";
  let started = false;

  for (const p of points) {
    if (p.rate == null) continue;
    const x = xFor(p.date);
    const y = yFor(p.rate);
    if (!started) {
      d += `M ${x} ${y}`;
      started = true;
    } else {
      d += ` L ${x} ${y}`;
    }
  }

  return d || null;
}

const COLORS = ["#ecdc00", "#0016bd", "#d60000", "#00aeff", "#00c921", "#d55500", "#6b4eff", "#0b2b3a"];

export default function WageComparisonChart() {
  const [raw, setRaw] = useState({ headers: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(DATA_URL, { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load (${res.status})`);
        const text = await res.text();
        if (!alive) return;
        setRaw(parseCsv(text));
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load wage data.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const built = useMemo(() => buildSeries(raw), [raw]);

  const H = 360;
  const PAD_L = 64;
  const PAD_R = 20;
  const PAD_T = 18;
  const PAD_B = 52;

  // Make it WIDE so scrolling is guaranteed
  const PX_PER_POINT = 90;
  const MIN_W = 1600;

  const chart = useMemo(() => {
    const series = built.series || [];
    if (!series.length) return null;

    const dates = built.dates || [];
    if (!dates.length) return null;

    const W = Math.max(MIN_W, PAD_L + PAD_R + (Math.max(1, dates.length - 1) * PX_PER_POINT));

    let minY = Infinity;
    let maxY = -Infinity;
    for (const s of series) {
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

    const x0 = PAD_L;
    const x1 = W - PAD_R;
    const y0 = H - PAD_B;
    const y1 = PAD_T;

    const xFor = (date) => {
      const i = dates.indexOf(date);
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

    const xTickCount = Math.min(7, dates.length);
    const xTickIdxs = Array.from({ length: xTickCount }, (_, i) => {
      const t = xTickCount === 1 ? 0 : i / (xTickCount - 1);
      return Math.round(t * (dates.length - 1));
    });

    return { W, dates, series, xFor, yFor, tickVals, xTickIdxs };
  }, [built]);

  if (loading) return <div style={mutedStyle}>Loading wage chart…</div>;
  if (err) return <div style={errorStyle}>Couldn’t load wage data. {err}</div>;
  if (!built.series.length) return <div style={mutedStyle}>{built.reason || "No data found."}</div>;
  if (!chart) return <div style={mutedStyle}>Chart could not be built.</div>;

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <header style={{ display: "grid", gap: 6 }}>
        <div style={titleStyle}>PCP Top Rate Level 2 wage comparison</div>
        <div style={mutedStyle}>
          Swipe left and right on the chart. This version forces the chart to be wider than the page, so scrolling must work.
        </div>
      </header>

      <div style={chartWrapStyle}>
        {/* SCROLLER */}
        <div style={chartScrollerStyle}>
          {/* This inner div is the key. It creates real scrollWidth. */}
          <div style={{ width: chart.W, minWidth: chart.W, display: "inline-block" }}>
<div style={chartWindowOuter}>
  <div style={{ minWidth: chart.W }}>
    <svg
      width={chart.W}
      height={H}
      viewBox={`0 0 ${chart.W} ${H}`}
      style={chartSvgStyle}
    >
      {/* svg content */}
    </svg>
  </div>
</div>

              {/* grid + y labels */}
              {chart.tickVals.map((v, i) => {
                const y = chart.yFor(v);
                return (
                  <g key={`y-${i}`}>
                    <line x1={PAD_L} x2={chart.W - PAD_R} y1={y} y2={y} stroke="rgba(0,0,0,0.08)" />
                    <text
                      x={PAD_L - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="12"
                      fill="rgba(11,43,58,0.85)"
                      style={{ fontWeight: 800 }}
                    >
                      {formatMoney(v)}
                    </text>
                  </g>
                );
              })}

              {/* x ticks */}
              {chart.xTickIdxs.map((idx) => {
                const date = chart.dates[idx];
                const x = chart.xFor(date);
                return (
                  <g key={`x-${date}`}>
                    <line x1={x} x2={x} y1={H - PAD_B} y2={PAD_T} stroke="rgba(0,0,0,0.04)" />
                    <text
                      x={x}
                      y={H - 18}
                      textAnchor="middle"
                      fontSize="12"
                      fill="rgba(11,43,58,0.85)"
                      style={{ fontWeight: 800 }}
                    >
                      {formatDateLabel(date)}
                    </text>
                  </g>
                );
              })}

              {/* axes */}
              <line x1={PAD_L} x2={PAD_L} y1={PAD_T} y2={H - PAD_B} stroke="rgba(0,0,0,0.25)" />
              <line x1={PAD_L} x2={chart.W - PAD_R} y1={H - PAD_B} y2={H - PAD_B} stroke="rgba(0,0,0,0.25)" />

              {/* lines */}
              {chart.series.map((s, si) => {
                const color = COLORS[si % COLORS.length];
                const d = buildPath(s.points, chart.xFor, chart.yFor);
                if (!d) return null;
                return (
                  <path
                    key={s.service}
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity="0.95"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------- */
/* Styles                    */
/* ------------------------- */
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

const chartWrapStyle = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.7)",
};

const chartWindowOuter = {
  width: "100%",
  maxWidth: "100%",
  overflowX: "auto",
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  overscrollBehaviorX: "contain",
  touchAction: "pan-x",
  paddingBottom: 6,
};

// IMPORTANT: this is the scroll container
const chartScrollerStyle = {
  width: "100%",
  maxWidth: "100%",
  overflowX: "scroll", // force scrollbar behavior
  overflowY: "hidden",
  WebkitOverflowScrolling: "touch",
  touchAction: "pan-x",
  overscrollBehaviorX: "contain",
  paddingBottom: 8,
  whiteSpace: "nowrap", // helps some layouts respect width
};

// IMPORTANT: prevent any global "svg { max-width: 100% }" from shrinking it
const chartSvgStyle = {
  display: "block",
  maxWidth: "none",
  background: "rgba(255,255,255,0.7)",
  borderRadius: 14,
};
