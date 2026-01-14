import { useEffect, useMemo, useState } from "react";

const DATA_URL = "/data/wages/web/public/data/wageCompChart-opseu_01.csv";

// A tiny CSV parser that handles quoted fields safely.
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
    return `$${n.toFixed(2)}`;
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

function isPcpTopRateRow(service, cls, step) {
  // Omit Elgin even if it sneaks back in.
  if (String(service).toLowerCase().includes("elgin")) return false;

  const c = String(cls).trim().toUpperCase();
  const st = String(step).trim().toUpperCase();

  return c === "PCP" && st.includes("LEVEL 2");
}

function buildFilledSeries({ headers, rows }) {
  // Expect: Local, Class., Step, then date columns
  if (!headers?.length || !rows?.length) return null;
  if (headers.length < 4) return null;

  const serviceIdx = 0;
  const classIdx = 1;
  const stepIdx = 2;

  // Date columns begin at col 3
  const dateHeaders = headers.slice(3);

  // Parse dates and keep only valid ones
  const dateCols = dateHeaders
    .map((h, i) => ({ h, i: i + 3, d: new Date(h) }))
    .filter((x) => x.d instanceof Date && !Number.isNaN(x.d.getTime()))
    .sort((a, b) => a.d - b.d);

  // Drop fully blank date columns (all rows empty in that column)
  const nonBlankDateCols = dateCols.filter((col) => {
    for (const r of rows) {
      const v = (r[col.i] ?? "").trim();
      if (v) return true;
    }
    return false;
  });

  // Some CSVs use block headers with blanks; forward fill service + class if needed.
  let lastService = "";
  let lastClass = "";

  const filtered = [];
  for (const r of rows) {
    const rawService = (r[serviceIdx] ?? "").trim();
    const rawClass = (r[classIdx] ?? "").trim();
    const rawStep = (r[stepIdx] ?? "").trim();

    const service = rawService || lastService;
    const cls = rawClass || lastClass;
    const step = rawStep;

    if (rawService) lastService = rawService;
    if (rawClass) lastClass = rawClass;

    if (!service || !cls || !step) continue;
    if (!isPcpTopRateRow(service, cls, step)) continue;

    filtered.push({ service, cls, step, row: r });
  }

  // Build per-service change map
  const byService = new Map(); // service -> Map(dateISO -> rate)
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

  // Forward-fill across the shared date grid
  const series = [];
  for (const [service, changes] of byService.entries()) {
    let last = null;
    const points = dateKeys.map((k) => {
      const v = changes.has(k) ? changes.get(k) : null;
      if (v != null) last = v;
      return { date: k, rate: last };
    });

    // Remove leading nulls
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

  return {
    dates: dateKeys,
    series,
  };
}

const COLORS = ["#0055b8", "#0e6ea6", "#6b4eff", "#0b2b3a", "#2a8f3a", "#b84a00"];

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

  // Default select all
  useEffect(() => {
    if (!ranked.length) return;
    setSelected((prev) => {
      if (prev.size) return prev;
      return new Set(ranked.map((s) => s.service));
    });
  }, [ranked]);

  const activeSeries = useMemo(() => {
    return ranked.filter((s) => selected.has(s.service));
  }, [ranked, selected]);

  // SVG chart sizing (mobile friendly: scroll if needed)
  const W = 760;
  const H = 360;
  const PAD_L = 52;
  const PAD_R = 18;
  const PAD_T = 18;
  const PAD_B = 44;

  const chart = useMemo(() => {
    if (!activeSeries.length) return null;

    // Build unified date list from active series (they should share grid, but trimmed starts differ)
    const allDates = new Set();
    for (const s of activeSeries) for (const p of s.points) allDates.add(p.date);
    const dates = [...allDates].sort(); // ISO date string sorts correctly
    if (!dates.length) return null;

    // y-range
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

    // add padding
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

    // ticks
    const yTicks = 5;
    const tickVals = Array.from({ length: yTicks }, (_, i) => {
      const t = yTicks === 1 ? 0 : i / (yTicks - 1);
      return minY + (maxY - minY) * (1 - t);
    });

    // x ticks: show ~6 labels
    const xTickCount = Math.min(6, dates.length);
    const xTickIdxs = Array.from({ length: xTickCount }, (_, i) => {
      const t = xTickCount === 1 ? 0 : i / (xTickCount - 1);
      return Math.round(t * (dates.length - 1));
    });

    // hover
    const hoverDate = hoverIdx != null && dates[hoverIdx] ? dates[hoverIdx] : null;

    return {
      dates,
      xFor,
      yFor,
      tickVals,
      xTickIdxs,
      hoverDate,
      minY,
      maxY,
    };
  }, [activeSeries, selected, hoverIdx]);

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

  if (loading) {
    return <div style={mutedStyle}>Loading wage chart…</div>;
  }

  if (err) {
    return (
      <div style={errorStyle}>
        Couldn’t load wage chart data. {err}
      </div>
    );
  }

  if (!ranked.length) {
    return (
      <div style={mutedStyle}>
        No PCP Level 2 wage data found in the CSV.
      </div>
    );
  }

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <div style={titleStyle}>PCP Top Rate (Level 2) wage comparison</div>
        <div style={mutedStyle}>
          Toggle services and compare base hourly rates over time. Ranking is based on each service’s latest listed rate.
        </div>
      </div>

      {/* Ranking + toggles */}
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

      {/* Chart */}
      <div style={chartWrapStyle}>
        {!chart ? (
          <div style={mutedStyle}>Select at least one service to display the chart.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <svg
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              style={{ display: "block", minWidth: W, background: "rgba(255,255,255,0.7)", borderRadius: 14 }}
              onMouseLeave={() => setHoverIdx(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const dates = chart.dates;
                const x0 = PAD_L;
                const x1 = W - PAD_R;
                const t = Math.min(1, Math.max(0, (x - x0) / (x1 - x0)));
                const idx = Math.round(t * (dates.length - 1));
                setHoverIdx(idx);
              }}
            >
              {/* grid + y-axis ticks */}
              {chart.tickVals.map((v, i) => {
                const y = chart.yFor(v);
                return (
                  <g key={i}>
                    <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="rgba(0,0,0,0.08)" />
                    <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(0,0,0,0.70)">
                      {formatMoney(v).replace("CA", "").trim()}
                    </text>
                  </g>
                );
              })}

              {/* x ticks */}
              {chart.xTickIdxs.map((idx) => {
                const d = chart.dates[idx];
                const x = chart.xFor(d);
                return (
                  <g key={d}>
                    <line x1={x} x2={x} y1={H - PAD_B} y2={PAD_T} stroke="rgba(0,0,0,0.05)" />
                    <text x={x} y={H - 16} textAnchor="middle" fontSize="11" fill="rgba(0,0,0,0.70)">
                      {formatDateLabel(d)}
                    </text>
                  </g>
                );
              })}

              {/* lines */}
              {activeSeries.map((s, si) => {
                const color = COLORS[si % COLORS.length];
                const pts = s.points
                  .filter((p) => p.rate != null)
                  .map((p) => [chart.xFor(p.date), chart.yFor(p.rate)]);
                if (pts.length < 2) return null;

                const d = pts
                  .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
                  .join(" ");

                return <path key={s.service} d={d} fill="none" stroke={color} strokeWidth="2.6" />;
              })}

              {/* hover marker */}
              {chart.hoverDate ? (
                <g>
                  <line
                    x1={chart.xFor(chart.hoverDate)}
                    x2={chart.xFor(chart.hoverDate)}
                    y1={PAD_T}
                    y2={H - PAD_B}
                    stroke="rgba(0,0,0,0.18)"
                    strokeDasharray="4 4"
                  />
                </g>
              ) : null}
            </svg>
          </div>
        )}
      </div>

      {/* Hover readout */}
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
