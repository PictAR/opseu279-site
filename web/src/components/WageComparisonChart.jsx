// web/src/components/WageComparisonChart.jsx
import { useEffect, useMemo, useState } from "react";
import "../styles/wageComparisonChart.css";

const SOURCES = {
  ems: [
    { id: "opseu", url: "/data/wages/wageCompChart-opseu_01.csv" },
    { id: "big3", url: "/data/wages/wageCompChart-big3.csv" },
  ],
  fire: [{ id: "fd", url: "/data/wages/wageCompChart-ontario-fd.csv" }],
  pd: [{ id: "pd", url: "/data/wages/wageCompChart-ontario-pd.csv" }],
  minwage: [{ id: "minwage", url: "/data/wages/ontarioMinWage.csv" }],
};

// Only two modes now.
const CHART_SCALES = [
  { value: "fit", label: "Fit to screen" },
  { value: "readable", label: "Readable (scroll)" },
];

const DX_READABLE = 110;
const DX_FIT_MAX = 140;

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

function parseDateHeader(h) {
  const s = String(h || "").trim();
  const mdy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const m = s.match(mdy);
  if (m) {
    const mm = Number(m[1]);
    const dd = Number(m[2]);
    const yy = Number(m[3]);
    const d = new Date(Date.UTC(yy, mm - 1, dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isoKey(d) {
  return d.toISOString().slice(0, 10);
}

function formatMoney(n) {
  if (n == null || !Number.isFinite(n)) return "—";
  try {
    return n.toLocaleString(undefined, { style: "currency", currency: "CAD" });
  } catch {
    return `$${Number(n).toFixed(2)}`;
  }
}

function formatDateLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

// ---------- Palettes: Okabe-Ito + Paul Tol (bright/muted/light) ----------
const OKABE_ITO = [
  "#000000",
  "#E69F00",
  "#56B4E9",
  "#009E73",
  "#F0E442",
  "#0072B2",
  "#D55E00",
  "#CC79A7",
];

const TOL_BRIGHT = [
  "#4477AA",
  "#EE6677",
  "#228833",
  "#CCBB44",
  "#66CCEE",
  "#AA3377",
  "#BBBBBB",
];

const TOL_MUTED = [
  "#332288",
  "#88CCEE",
  "#44AA99",
  "#117733",
  "#999933",
  "#DDCC77",
  "#CC6677",
  "#882255",
  "#AA4499",
];

const TOL_LIGHT = [
  "#77AADD",
  "#99DDFF",
  "#44BB99",
  "#BBCC33",
  "#AAAA00",
  "#EEDD88",
  "#EE8866",
  "#FFAABB",
  "#DDDDDD",
];

// Merge + dedupe while preserving order
const PALETTE = Array.from(
  new Set([...OKABE_ITO, ...TOL_BRIGHT, ...TOL_MUTED, ...TOL_LIGHT]),
);

// Avoid pure black for non-minwage (minwage uses black)
const RESERVED_COLORS = new Set(["#000000"]);

function stableHash(str) {
  // FNV-1a + avalanche finalizer so small-mod palettes don't cluster
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  // Murmur-style finalizer
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;

  return h >>> 0;
}

function colorForKey(key) {
  const start = stableHash(key) % PALETTE.length;
  for (let i = 0; i < PALETTE.length; i++) {
    const c = PALETTE[(start + i) % PALETTE.length];
    if (!RESERVED_COLORS.has(c)) return c;
  }
  return PALETTE[start];
}

function dashForType(type) {
  if (type === "fire") return "10 7";
  if (type === "pd") return "2 8";
  return null;
}

// ---------- Normalization + matching ----------
function normText(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\bfulltime\b/g, "full time");
}

// Detect “kinds” so ACP/PCP variations don’t break comparisons.
// Returns "acp_full_time", "pcp_full_time", or null.
function emsRoleKind(role) {
  const s = normText(role);
  const isFullTime =
    s.includes("full time") ||
    s.includes("full-time") ||
    s.includes("fulltime");
  const hasAcp = s.includes("acp") || s.includes("advanced care");
  const hasPcp = s.includes("pcp") || s.includes("primary care");

  if (!isFullTime) return null;
  if (hasAcp && !hasPcp) return "acp_full_time";
  if (hasPcp && !hasAcp) return "pcp_full_time";
  return null;
}

function emsRoleMatches(rowRole, selectedRole) {
  const selKind = emsRoleKind(selectedRole);
  const rowKind = emsRoleKind(rowRole);

  if (selKind) return rowKind === selKind;
  return normText(rowRole) === normText(selectedRole);
}

function stepKey(s) {
  const t = normText(s);
  if (t.includes("full wage")) return "fullwage";
  const m = t.match(/(\d+)/);
  if (m) return `step${m[1]}`;
  return t.replace(/\s/g, "");
}

function stepMatches(rowStep, selectedStep) {
  return stepKey(rowStep) === stepKey(selectedStep);
}

function serviceHasEmsRoleKind(catalogEms, service, kindWanted) {
  const rolesMap = catalogEms?.rolesByService?.get(service);
  if (!rolesMap) return false;
  for (const role of rolesMap.keys()) {
    if (emsRoleKind(role) === kindWanted) return true;
  }
  return false;
}

function findBestMatchingRoleKey(rolesMap, selectedRole, type) {
  if (!rolesMap) return "";
  const keys = [...rolesMap.keys()];
  if (!keys.length) return "";

  if (type === "ems") {
    const m = keys.find((k) => emsRoleMatches(k, selectedRole));
    return m || keys[0];
  }

  const wanted = normText(selectedRole);
  const exact = keys.find((k) => normText(k) === wanted);
  return exact || keys[0];
}

function bestRoleMatch(options, needles) {
  const lower = options.map((x) => String(x).toLowerCase());
  for (const n of needles) {
    const idx = lower.findIndex((x) => x.includes(n));
    if (idx !== -1) return options[idx];
  }
  return options[0] ?? "";
}

function bestStepMatch(options, needles) {
  const lower = options.map((x) => String(x).toLowerCase());
  for (const n of needles) {
    const idx = lower.findIndex((x) => x.includes(n));
    if (idx !== -1) return options[idx];
  }

  const withNum = options
    .map((s) => {
      const m = String(s).match(/(\d+)/);
      return { s, n: m ? Number(m[1]) : -1 };
    })
    .sort((a, b) => b.n - a.n);

  if (withNum.length && withNum[0].n >= 0) return withNum[0].s;
  return options[0] ?? "";
}

function buildSeriesFromRow({ dates, valuesByIso }) {
  let last = null;
  const points = dates.map((k) => {
    const v = valuesByIso.has(k) ? valuesByIso.get(k) : null;
    if (v != null) last = v;
    return { date: k, rate: last };
  });

  const firstIdx = points.findIndex((p) => p.rate != null);
  const trimmed = firstIdx >= 0 ? points.slice(firstIdx) : [];
  const latest = trimmed.length ? trimmed[trimmed.length - 1] : null;

  return {
    points: trimmed,
    latestRate: latest?.rate ?? null,
    latestDate: latest?.date ?? null,
  };
}

function isTorontoQualifiedRole(role) {
  const s = String(role || "");
  return /\(.*toronto.*\)/i.test(s) || /toronto only/i.test(s);
}

function emsRoleMatchesForService(catalogEms, service, rowRole, selectedRole) {
  const sel = normText(selectedRole);
  const rolesMap = catalogEms?.rolesByService?.get(service);

  // If THIS service has an exact match for the selected role text,
  // require exact match (prevents Toronto variants from creating extra lines).
  if (rolesMap) {
    let hasExact = false;
    for (const k of rolesMap.keys()) {
      if (normText(k) === sel) {
        hasExact = true;
        break;
      }
    }
    if (hasExact) return normText(rowRole) === sel;
  }

  // Otherwise fall back to tolerant matching (PCP/ACP kind)
  return emsRoleMatches(rowRole, selectedRole);
}

function parseWageTable({ csv, forcedType, isAnnualFire }) {
  const { headers, rows } = csv;
  if (!headers.length || !rows.length) return [];

  const idxType = findColIndex(headers, ["type"]);
  const idxService = findColIndex(headers, ["service", "local"]);
  const idxServiceAlt = findColIndex(headers, ["service"]);
  const idxClass = findColIndex(headers, ["class"]);
  const idxStep = findColIndex(headers, ["step"]);
  const idxPosition = findColIndex(headers, ["position"]);

  const dateCols = headers
    .map((h, i) => ({ i, d: parseDateHeader(h) }))
    .filter((x) => x.d)
    .sort((a, b) => a.d - b.d);

  const dateKeys = dateCols.map((c) => isoKey(c.d));

  let lastService = "";
  let lastRole = "";

  const out = [];

  for (const r of rows) {
    const rawType = idxType !== -1 ? (r[idxType] ?? "").trim() : "";
    const type =
      forcedType || (rawType ? String(rawType).toLowerCase() : "") || "ems";

    const rawServiceA = idxService !== -1 ? (r[idxService] ?? "").trim() : "";
    const rawServiceB =
      idxServiceAlt !== -1 ? (r[idxServiceAlt] ?? "").trim() : "";
    const rawService = rawServiceA || rawServiceB;

    const service = rawService || lastService;
    if (rawService) lastService = rawService;

    const rawRole =
      idxPosition !== -1
        ? (r[idxPosition] ?? "").trim()
        : idxClass !== -1
          ? (r[idxClass] ?? "").trim()
          : "";

    const role = rawRole || lastRole;
    if (rawRole) lastRole = rawRole;

    const step = idxStep !== -1 ? (r[idxStep] ?? "").trim() : "";

    if (!service || !role) continue;

    const valuesByIso = new Map();
    for (let di = 0; di < dateCols.length; di++) {
      const col = dateCols[di];
      const v = toNumberCurrency(r[col.i]);
      if (v == null) continue;

      const hourly = isAnnualFire ? v / 2080 : v;
      valuesByIso.set(dateKeys[di], hourly);
    }

    out.push({
      type,
      service,
      role,
      step,
      valuesByIso,
      dateKeys,
    });
  }

  return out;
}

function parseMinWage({ csv }) {
  const { headers, rows } = csv;
  if (!headers.length || !rows.length) return null;

  const dateCols = headers
    .map((h) => parseDateHeader(h))
    .filter(Boolean)
    .sort((a, b) => a - b);

  const dateKeys = dateCols.map((d) => isoKey(d));

  const values = rows[0] || [];
  const valuesByIso = new Map();
  for (let i = 0; i < dateKeys.length; i++) {
    const v = toNumberCurrency(values[i]);
    if (v == null) continue;
    valuesByIso.set(dateKeys[i], v);
  }

  return {
    key: "minwage|ontario|min_wage|",
    type: "minwage",
    label: "Ontario Minimum Wage",
    service: "Ontario Minimum Wage",
    role: "Minimum wage",
    step: "",
    valuesByIso,
    dateKeys,
  };
}

export default function WageComparisonChart() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [scale, setScale] = useState("readable");

  const [enabled, setEnabled] = useState({
    ems: false,
    fire: false,
    pd: false,
  });
  const [minWageOn, setMinWageOn] = useState(true);

  const [pick, setPick] = useState({
    ems: { role: "", step: "", services: new Set() },
    fire: { role: "", step: "", services: new Set() },
    pd: { role: "", step: "", services: new Set() },
  });

  const [tables, setTables] = useState({
    ems: [],
    fire: [],
    pd: [],
    minwage: null,
  });

  // Measure width for fit mode (works even if the element mounts later)
  const [scrollEl, setScrollEl] = useState(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    if (!scrollEl) return;

    const update = () => setScrollWidth(scrollEl.clientWidth || 0);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(scrollEl);

    return () => ro.disconnect();
  }, [scrollEl]);

  useEffect(() => {
    let alive = true;

    async function loadAll() {
      try {
        setLoading(true);
        setErr("");

        const requests = [
          ...SOURCES.ems.map((s) => ({ ...s, type: "ems" })),
          ...SOURCES.fire.map((s) => ({ ...s, type: "fire" })),
          ...SOURCES.pd.map((s) => ({ ...s, type: "pd" })),
          ...SOURCES.minwage.map((s) => ({ ...s, type: "minwage" })),
        ];

        const results = await Promise.all(
          requests.map(async (r) => {
            const res = await fetch(r.url, { cache: "no-store" });
            if (!res.ok)
              throw new Error(`Failed to load ${r.url} (${res.status})`);
            const text = await res.text();
            return { ...r, csv: parseCsv(text) };
          }),
        );

        if (!alive) return;

        const emsRows = results
          .filter((r) => r.type === "ems")
          .flatMap((r) => parseWageTable({ csv: r.csv, forcedType: "ems" }));

        const fireRows = results
          .filter((r) => r.type === "fire")
          .flatMap((r) =>
            parseWageTable({
              csv: r.csv,
              forcedType: "fire",
              isAnnualFire: true,
            }),
          );

        const pdRows = results
          .filter((r) => r.type === "pd")
          .flatMap((r) => parseWageTable({ csv: r.csv, forcedType: "pd" }));

        const minWage = (() => {
          const mw = results.find((r) => r.type === "minwage");
          return mw ? parseMinWage({ csv: mw.csv }) : null;
        })();

        setTables({
          ems: emsRows,
          fire: fireRows,
          pd: pdRows,
          minwage: minWage,
        });
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load wage CSVs.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadAll();
    return () => {
      alive = false;
    };
  }, []);

  const catalog = useMemo(() => {
    const make = (rows) => {
      const services = new Set();
      const rolesByService = new Map();

      for (const r of rows) {
        services.add(r.service);

        const m = rolesByService.get(r.service) || new Map();
        const steps = m.get(r.role) || new Set();
        if (r.step) steps.add(r.step);
        m.set(r.role, steps);
        rolesByService.set(r.service, m);
      }

      return {
        services: [...services].sort((a, b) => a.localeCompare(b)),
        rolesByService,
      };
    };

    return {
      ems: make(tables.ems),
      fire: make(tables.fire),
      pd: make(tables.pd),
    };
  }, [tables]);

  function enableType(type) {
    setEnabled((prev) => ({ ...prev, [type]: true }));

    setPick((prev) => {
      const next = { ...prev };
      const c = catalog[type];
      if (!c?.services?.length) return next;

      let defaultService = c.services[0] || "";
      if (type === "ems") {
        const norfolk = c.services.find((s) =>
          String(s).toLowerCase().includes("norfolk"),
        );
        if (norfolk) defaultService = norfolk;
      }
      if (type === "fire") {
        const hfd = c.services.find((s) =>
          String(s).toLowerCase().includes("hamilton"),
        );
        if (hfd) defaultService = hfd;
      }
      if (type === "pd") {
        const opp = c.services.find((s) =>
          String(s).toLowerCase().includes("opp"),
        );
        if (opp) defaultService = opp;
      }

      const rolesMap = c.rolesByService.get(defaultService) || new Map();
      const roles = [...rolesMap.keys()].sort((a, b) => a.localeCompare(b));

      let role = roles[0] || "";
      let step = "";

      if (type === "ems") {
        role = bestRoleMatch(roles, ["full time pcp", "pcp"]);
        const roleKey = findBestMatchingRoleKey(rolesMap, role, "ems");
        const steps = [...(rolesMap.get(roleKey) || new Set())].sort((a, b) =>
          a.localeCompare(b),
        );
        step = bestStepMatch(steps, [
          "full wage",
          "level 2",
          "step 4",
          "step 3",
          "step 2",
        ]);
      }

      if (type === "fire") {
        role = bestRoleMatch(roles, [
          "first class fire fighter",
          "fire fighter",
          "firefighter",
        ]);
      }

      if (type === "pd") {
        role = bestRoleMatch(roles, ["first class constable", "constable"]);
        const roleKey = findBestMatchingRoleKey(rolesMap, role, "pd");
        const steps = [...(rolesMap.get(roleKey) || new Set())].sort((a, b) =>
          a.localeCompare(b),
        );
        step = bestStepMatch(steps, ["full wage"]);
      }

      next[type] = { role, step, services: new Set([defaultService]) };
      return next;
    });
  }

  function disableType(type) {
    setEnabled((prev) => ({ ...prev, [type]: false }));
    setPick((prev) => ({
      ...prev,
      [type]: { role: "", step: "", services: new Set() },
    }));
  }

  function toggleType(type) {
    if (enabled[type]) disableType(type);
    else enableType(type);
  }

  function setRole(type, value) {
    setPick((prev) => {
      const next = { ...prev };
      const cur = next[type];
      const c = catalog[type];

      let services = new Set(cur.services);

      // If switching EMS to FT ACP, prune selection to ACP-capable services (visibility stays full)
      if (type === "ems" && emsRoleKind(value) === "acp_full_time") {
        const allowedServices = (c?.services || []).filter((svc) =>
          serviceHasEmsRoleKind(c, svc, "acp_full_time"),
        );
        services = new Set(
          [...services].filter((svc) => allowedServices.includes(svc)),
        );
        if (!services.size && allowedServices.length)
          services = new Set([allowedServices[0]]);
      }

      // Pick a service that can provide steps for the selected role
      const servicesList = c?.services || [];
      const firstSelected = [...services][0] || servicesList[0] || "";
      let stepService = firstSelected;

      if (type === "ems" && value) {
        const kind = emsRoleKind(value);
        if (kind) {
          const matchSvc = servicesList.find((svc) =>
            serviceHasEmsRoleKind(c, svc, kind),
          );
          if (matchSvc) stepService = matchSvc;
        }
      }

      const rolesMap = stepService ? c.rolesByService.get(stepService) : null;
      const roleKey = findBestMatchingRoleKey(rolesMap, value, type);
      const steps = rolesMap ? [...(rolesMap.get(roleKey) || new Set())] : [];

      let step = "";
      if (type === "ems")
        step = bestStepMatch(steps, [
          "full wage",
          "level 2",
          "step 4",
          "step 3",
          "step 2",
        ]);
      if (type === "pd") step = bestStepMatch(steps, ["full wage"]);

      next[type] = { ...cur, role: value, step, services };
      return next;
    });
  }

  function setStep(type, value) {
    setPick((prev) => {
      const next = { ...prev };
      next[type] = { ...next[type], step: value };
      return next;
    });
  }

  function toggleService(type, service) {
    setPick((prev) => {
      const next = { ...prev };
      const cur = next[type];
      const s = new Set(cur.services);
      if (s.has(service)) s.delete(service);
      else s.add(service);
      next[type] = { ...cur, services: s };
      return next;
    });
  }

  const typeRoleOptions = useMemo(() => {
    const forType = (type) => {
      const c = catalog[type];
      const services = c?.services || [];

      const selectedSet = pick[type]?.services || new Set();
      const firstSelected = [...selectedSet][0];

      const chosenService =
        (firstSelected && services.includes(firstSelected) && firstSelected) ||
        services[0] ||
        "";

      // EMS: show roles across ALL services so ACP appears
      if (type === "ems") {
        const rolesSet = new Set();
        for (const svc of services) {
          const rolesMap = c.rolesByService.get(svc);
          if (!rolesMap) continue;
          for (const r of rolesMap.keys()) {
            if (isTorontoQualifiedRole(r)) continue;
            rolesSet.add(r);
          }
        }
        const roles = [...rolesSet].sort((a, b) => a.localeCompare(b));

        // For steps: pick a service that supports the selected EMS role kind if possible
        let stepService = chosenService;
        const kind = emsRoleKind(pick.ems?.role);
        if (kind) {
          const matchSvc = services.find((svc) =>
            serviceHasEmsRoleKind(c, svc, kind),
          );
          if (matchSvc) stepService = matchSvc;
        }

        const rolesMap = stepService ? c.rolesByService.get(stepService) : null;
        const roleKey = findBestMatchingRoleKey(
          rolesMap,
          pick.ems?.role,
          "ems",
        );
        const steps = rolesMap
          ? [...(rolesMap.get(roleKey) || new Set())].sort((a, b) =>
              a.localeCompare(b),
            )
          : [];

        return { services, roles, steps };
      }

      // Fire/PD: roles per chosen service
      const rolesMap = chosenService
        ? c.rolesByService.get(chosenService)
        : null;
      const roles = rolesMap
        ? [...rolesMap.keys()].sort((a, b) => a.localeCompare(b))
        : [];

      const roleKey = findBestMatchingRoleKey(rolesMap, pick[type]?.role, type);
      const steps = rolesMap
        ? [...(rolesMap.get(roleKey) || new Set())].sort((a, b) =>
            a.localeCompare(b),
          )
        : [];

      return { services, roles, steps };
    };

    return {
      ems: forType("ems"),
      fire: forType("fire"),
      pd: forType("pd"),
    };
  }, [catalog, pick]);

  const selectedLines = useMemo(() => {
    const lines = [];

    const addFrom = (type, rows, role, step, services) => {
      if (!services.size || !role) return;

      const wantedServices = new Set([...services]);
      for (const r of rows) {
        if (!wantedServices.has(r.service)) continue;

        if (type === "ems") {
          if (!emsRoleMatchesForService(catalog.ems, r.service, r.role, role))
            continue;
        } else {
          if (r.role !== role) continue;
        }

        if (type === "ems" || type === "pd") {
          if (!step) continue;
          if (!stepMatches(r.step, step)) continue;
        }

        const labelParts = [r.service, r.role];
        if (r.step) labelParts.push(r.step);

        const key = `${type}|${r.service}|${r.role}|${r.step || ""}`;

        lines.push({
          key,
          type,
          service: r.service,
          role: r.role,
          step: r.step,
          label: labelParts.join(" · "),
          valuesByIso: r.valuesByIso,
          dateKeys: r.dateKeys,
        });
      }
    };

    if (enabled.ems)
      addFrom(
        "ems",
        tables.ems,
        pick.ems.role,
        pick.ems.step,
        pick.ems.services,
      );
    if (enabled.fire)
      addFrom("fire", tables.fire, pick.fire.role, "", pick.fire.services);
    if (enabled.pd)
      addFrom("pd", tables.pd, pick.pd.role, pick.pd.step, pick.pd.services);

    if (minWageOn && tables.minwage) lines.push(tables.minwage);

    return lines;
  }, [enabled, minWageOn, pick, tables, catalog]);

  const allDates = useMemo(() => {
    const s = new Set();
    for (const line of selectedLines) {
      for (const k of line.dateKeys || []) s.add(k);
    }
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [selectedLines]);

  const builtLines = useMemo(() => {
    const out = [];

    for (const line of selectedLines) {
      const built = buildSeriesFromRow({
        dates: allDates,
        valuesByIso: line.valuesByIso || new Map(),
      });

      out.push({
        ...line,
        ...built,
        color: line.type === "minwage" ? "#000000" : colorForKey(line.key),
        dash: line.type === "minwage" ? null : dashForType(line.type),
      });
    }

    const order = { ems: 1, fire: 2, pd: 3, minwage: 4 };
    out.sort((a, b) => {
      const oa = order[a.type] || 9;
      const ob = order[b.type] || 9;
      if (oa !== ob) return oa - ob;
      return (b.latestRate ?? -Infinity) - (a.latestRate ?? -Infinity);
    });

    return out;
  }, [selectedLines, allDates]);

  const chart = useMemo(() => {
    if (!builtLines.length || !allDates.length) return null;

    let minY = Infinity;
    let maxY = -Infinity;

    for (const l of builtLines) {
      for (const p of l.points) {
        if (p.rate == null) continue;
        minY = Math.min(minY, p.rate);
        maxY = Math.max(maxY, p.rate);
      }
    }

    if (!Number.isFinite(minY) || !Number.isFinite(maxY)) return null;

    const pad = Math.max(0.25, (maxY - minY) * 0.08);
    minY -= pad;
    maxY += pad;

    const range = maxY - minY;
    const tickStep = range > 140 ? 10 : 5;

    const tickMin = Math.floor(minY / tickStep) * tickStep;
    const tickMax = Math.ceil(maxY / tickStep) * tickStep;

    const tickVals = [];
    for (let v = tickMin; v <= tickMax + 0.0001; v += tickStep)
      tickVals.push(v);

    const H = 420;
    const PAD_L = 62;
    const PAD_R = 18;
    const PAD_T = 18;
    const PAD_B = 56;

    const n = allDates.length;
    const denom = Math.max(1, n - 1);

    let dx = DX_READABLE;

    if (scale === "fit") {
      const available = Math.max(0, (scrollWidth || 0) - PAD_L - PAD_R);
      if (available > 0) {
        const rawDx = available / denom;
        // FIT mode: do not clamp up (that breaks mobile fitting). Only cap.
        dx = Math.min(rawDx, DX_FIT_MAX);
      } else {
        dx = 64;
      }
    } else {
      dx = DX_READABLE;
    }

    const W = PAD_L + PAD_R + Math.max(0, (n - 1) * dx);

    const xForIdx = (i) => PAD_L + i * dx;
    const y0 = H - PAD_B;
    const y1 = PAD_T;

    const yFor = (v) => {
      const t = (v - tickMin) / (tickMax - tickMin || 1);
      return y0 - (y0 - y1) * t;
    };

    const xTickCount = Math.min(scale === "fit" ? (dx < 42 ? 4 : 6) : 7, n);
    const xTickIdxs = Array.from({ length: xTickCount }, (_, i) => {
      const t = xTickCount === 1 ? 0 : i / (xTickCount - 1);
      return Math.round(t * (n - 1));
    });

    return {
      H,
      W,
      PAD_L,
      PAD_R,
      PAD_T,
      PAD_B,
      tickVals,
      xForIdx,
      yFor,
      xTickIdxs,
      dates: allDates,
    };
  }, [builtLines, allDates, scale, scrollWidth]);

  if (loading) return <div className="wccHint">Loading chart…</div>;
  if (err) return <div className="wccHint">Couldn’t load wage data. {err}</div>;

  const emsAcpMode = emsRoleKind(pick.ems.role) === "acp_full_time";

  return (
    <section className="wcc">
      <header className="wccHeader">
        <h2 className="wccTitle">Wage comparison</h2>
        <p className="wccSubtitle wccHint">
          Start with a type, pick a role, then select services to overlay. Use
          “Readable” to zoom in and scroll left-right.
        </p>
      </header>

      <div className="wccControls">
        <div className="wccControl">
          <div className="wccControlLabel">Chart scale</div>
          <select
            value={scale}
            onChange={(e) => setScale(e.target.value)}
            aria-label="Chart scale"
          >
            {CHART_SCALES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="wccControl">
          <div className="wccControlLabel">Minimum wage</div>
          <label className="wccTypeToggle">
            <input
              type="checkbox"
              checked={minWageOn}
              onChange={(e) => setMinWageOn(e.target.checked)}
            />
            Ontario minimum wage
          </label>
        </div>
      </div>

      <div className="wccTypeToggles">
        <label className="wccTypeToggle">
          <input
            type="checkbox"
            checked={enabled.ems}
            onChange={() => toggleType("ems")}
          />
          EMS (solid)
        </label>

        <label className="wccTypeToggle">
          <input
            type="checkbox"
            checked={enabled.fire}
            onChange={() => toggleType("fire")}
          />
          Fire (dashed)
        </label>

        <label className="wccTypeToggle">
          <input
            type="checkbox"
            checked={enabled.pd}
            onChange={() => toggleType("pd")}
          />
          Police (dotted)
        </label>
      </div>

      {enabled.ems ? (
        <details className="wccDropdown" open>
          <summary>
            EMS selection{" "}
            <span className="wccSummaryRight">
              {pick.ems.services.size} selected
            </span>
          </summary>

          <div className="wccDropdownBody">
            {/* Role + Step side-by-side */}
            <div className="wccTwoCol">
              <div className="wccControl">
                <div className="wccControlLabel">EMS role</div>
                <select
                  value={pick.ems.role}
                  onChange={(e) => setRole("ems", e.target.value)}
                  aria-label="EMS role"
                >
                  {typeRoleOptions.ems.roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="wccControl">
                <div className="wccControlLabel">Step</div>
                <select
                  value={pick.ems.step}
                  onChange={(e) => setStep("ems", e.target.value)}
                  aria-label="EMS step"
                >
                  {typeRoleOptions.ems.steps.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="wccControl">
              <div className="wccControlLabel">Services</div>
              <div className="wccServicePickers">
                {typeRoleOptions.ems.services.map((svc) => {
                  const on = pick.ems.services.has(svc);
                  const allowed =
                    !emsAcpMode ||
                    serviceHasEmsRoleKind(catalog.ems, svc, "acp_full_time");
                  const disabled = !allowed;

                  const key = `ems|${svc}|${pick.ems.role}|${pick.ems.step}`;
                  const color = on && !disabled ? colorForKey(key) : "#999999";

                  return (
                    <label
                      key={svc}
                      className={`wccPickRow${disabled ? " isDisabled" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        disabled={disabled}
                        onChange={() => toggleService("ems", svc)}
                        aria-label={`Toggle ${svc}`}
                      />
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                      >
                        <circle cx="6" cy="6" r="5" fill={color} />
                      </svg>
                      <span className="wccPickName">{svc}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </details>
      ) : null}

      {enabled.fire ? (
        <details className="wccDropdown">
          <summary>
            Fire selection{" "}
            <span className="wccSummaryRight">
              {pick.fire.services.size} selected
            </span>
          </summary>

          <div className="wccDropdownBody">
            <div className="wccControl">
              <div className="wccControlLabel">Position</div>
              <select
                value={pick.fire.role}
                onChange={(e) => setRole("fire", e.target.value)}
                aria-label="Fire position"
              >
                {typeRoleOptions.fire.roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="wccControl">
              <div className="wccControlLabel">Services</div>
              <div className="wccServicePickers">
                {typeRoleOptions.fire.services.map((svc) => {
                  const on = pick.fire.services.has(svc);
                  const key = `fire|${svc}|${pick.fire.role}|`;
                  const color = on ? colorForKey(key) : "#999999";

                  return (
                    <label key={svc} className="wccPickRow">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleService("fire", svc)}
                        aria-label={`Toggle ${svc}`}
                      />
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                      >
                        <circle cx="6" cy="6" r="5" fill={color} />
                      </svg>
                      <span className="wccPickName">{svc}</span>
                    </label>
                  );
                })}
              </div>

              <div className="wccHint">
                Fire CSV is annual salary; converted to hourly using 2080
                hrs/year for comparison.
              </div>
            </div>
          </div>
        </details>
      ) : null}

      {enabled.pd ? (
        <details className="wccDropdown">
          <summary>
            Police selection{" "}
            <span className="wccSummaryRight">
              {pick.pd.services.size} selected
            </span>
          </summary>

          <div className="wccDropdownBody">
            <div className="wccControl">
              <div className="wccControlLabel">Class</div>
              <select
                value={pick.pd.role}
                onChange={(e) => setRole("pd", e.target.value)}
                aria-label="Police class"
              >
                {typeRoleOptions.pd.roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="wccControl">
              <div className="wccControlLabel">Step</div>
              <select
                value={pick.pd.step}
                onChange={(e) => setStep("pd", e.target.value)}
                aria-label="Police step"
              >
                {typeRoleOptions.pd.steps.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="wccControl">
              <div className="wccControlLabel">Services</div>
              <div className="wccServicePickers">
                {typeRoleOptions.pd.services.map((svc) => {
                  const on = pick.pd.services.has(svc);
                  const key = `pd|${svc}|${pick.pd.role}|${pick.pd.step}`;
                  const color = on ? colorForKey(key) : "#999999";

                  return (
                    <label key={svc} className="wccPickRow">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleService("pd", svc)}
                        aria-label={`Toggle ${svc}`}
                      />
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                      >
                        <circle cx="6" cy="6" r="5" fill={color} />
                      </svg>
                      <span className="wccPickName">{svc}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </details>
      ) : null}

      <div className="wccCard">
        {!chart ? (
          <div className="wccHint">
            Select at least one service (or leave only minimum wage) to draw the
            chart.
          </div>
        ) : (
          <div className="wccScroll" ref={setScrollEl}>
            <svg
              className="wccSvg"
              width={chart.W}
              height={chart.H}
              viewBox={`0 0 ${chart.W} ${chart.H}`}
              aria-label="Wage chart"
            >
              {/* grid + y labels */}
              {chart.tickVals.map((v, i) => {
                const y = chart.yFor(v);
                return (
                  <g key={`y-${i}`}>
                    <line
                      x1={chart.PAD_L}
                      y1={y}
                      x2={chart.W - chart.PAD_R}
                      y2={y}
                      className="wccGrid"
                    />
                    <text
                      x={chart.PAD_L - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="wccAxisText"
                    >
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
                    <line
                      x1={x}
                      y1={chart.PAD_T}
                      x2={x}
                      y2={chart.H - chart.PAD_B}
                      className="wccGridLight"
                    />
                    <text
                      x={x}
                      y={chart.H - 18}
                      textAnchor="middle"
                      className="wccAxisText"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* lines */}
              {builtLines.map((l) => {
                const byDate = new Map(l.points.map((p) => [p.date, p.rate]));
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
                    key={l.key}
                    d={d}
                    fill="none"
                    stroke={l.color}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={l.dash || undefined}
                    opacity="0.95"
                  />
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {builtLines.length ? (
        <div className="wccCard">
          <div className="wccCardTop">
            <div className="wccCardLabel">Selected lines</div>
            <div className="wccHint">Click a service for details.</div>
          </div>

          <div className="wccList">
            {builtLines.map((l) => {
              const serviceName =
                l.service || (l.label || "").split(" · ")[0] || "—";
              const recent = Array.isArray(l.points) ? l.points.slice(-4) : [];

              return (
                <details key={l.key} className="wccLine">
                  <summary className="wccLineSummary">
                    <span className="wccLineLeft">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                      >
                        <circle cx="6" cy="6" r="5" fill={l.color} />
                      </svg>
                      <span className="wccLineName">{serviceName}</span>
                    </span>

                    <span className="wccLineRight">
                      <span className="wccLineRate">
                        {formatMoney(l.latestRate)}
                      </span>
                    </span>
                  </summary>

                  <div className="wccLineBody">
                    <div className="wccLineMeta">
                      <div>
                        <strong>Role:</strong> {l.role || "—"}
                      </div>
                      {l.step ? (
                        <div>
                          <strong>Step:</strong> {l.step}
                        </div>
                      ) : null}
                      <div>
                        <strong>Type:</strong>{" "}
                        {String(l.type || "").toUpperCase()}
                      </div>
                      {l.latestDate ? (
                        <div>
                          <strong>Latest:</strong>{" "}
                          {formatDateLabel(l.latestDate)}
                        </div>
                      ) : null}
                    </div>

                    {recent.length ? (
                      <div className="wccLineMini">
                        <div className="wccLineMiniTitle">Recent points</div>
                        <div className="wccLineMiniGrid">
                          {recent.map((p) => (
                            <div key={p.date} className="wccLineMiniRow">
                              <span className="wccLineMiniDate">
                                {formatDateLabel(p.date)}
                              </span>
                              <span className="wccLineMiniVal">
                                {formatMoney(p.rate)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
