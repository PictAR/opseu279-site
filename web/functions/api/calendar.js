export async function onRequest(context) {
  const { request, env } = context;

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  return handleCalendar(request, env);
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
  };
}

async function handleCalendar(request, env) {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const url = new URL(request.url);
  const limit = Math.max(
    1,
    Math.min(50, Number(url.searchParams.get("limit") || 25)),
  );

  const icsUrl = env.OUTLOOK_ICS_URL;
  const htmlUrl = env.OUTLOOK_HTML_URL || "";

  if (!icsUrl) {
    return withCors(
      json(
        {
          htmlUrl,
          icsUrl: "",
          updatedAt: new Date().toISOString(),
          events: [],
        },
        200,
      ),
    );
  }

  const cacheKey = new Request(url.toString(), request);
  const cache = caches.default;

  const cached = await cache.match(cacheKey);
  if (cached) return withCors(cached);

  const res = await fetch(icsUrl, {
    headers: { "user-agent": "opseu279-calendar/1.0" },
  });

  if (!res.ok) {
    return withCors(
      json(
        { htmlUrl, icsUrl, updatedAt: new Date().toISOString(), events: [] },
        200,
      ),
    );
  }

  const text = await res.text();
  const events = parseIcs(text)
    .sort((a, b) => (a.sortKey || "").localeCompare(b.sortKey || ""))
    .slice(0, limit)
    .map(({ sortKey, ...rest }) => rest);

  const payload = json(
    { htmlUrl, icsUrl, updatedAt: new Date().toISOString(), events },
    200,
    { "cache-control": "public, max-age=300" },
  );

  await cache.put(cacheKey, payload.clone());
  return withCors(payload);
}

function withCors(resp) {
  const h = new Headers(resp.headers);
  const cors = corsHeaders();
  for (const [k, v] of Object.entries(cors)) h.set(k, v);
  return new Response(resp.body, { status: resp.status, headers: h });
}

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function unfoldLines(raw) {
  const lines = raw.replace(/\r/g, "").split("\n");
  const out = [];
  for (const line of lines) {
    if (!line) continue;
    if ((line[0] === " " || line[0] === "\t") && out.length) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function decodeText(v) {
  return String(v || "")
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}

// Outlook often omits seconds, and may include TZID.
function parseIcsDate(lineValue, params) {
  const v = String(lineValue || "").trim();
  if (!v) return null;

  const valueParam = String(params?.VALUE || "").toUpperCase();

  // All-day
  if (valueParam === "DATE" || /^\d{8}$/.test(v)) {
    const y = v.slice(0, 4);
    const m = v.slice(4, 6);
    const d = v.slice(6, 8);
    return {
      allDay: true,
      startDate: `${y}-${m}-${d}`,
      sortKey: `${y}-${m}-${d}`,
    };
  }

  // Date-time (accept HHMM or HHMMSS)
  const isUtc = v.endsWith("Z");
  const core = isUtc ? v.slice(0, -1) : v;

  const m = core.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?$/);
  if (!m) return null;

  const sec = m[6] ?? "00";
  const isoBase = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${sec}`;
  const iso = isUtc ? `${isoBase}Z` : isoBase;

  return {
    allDay: false,
    start: iso,
    startUtc: isUtc,
    sortKey: `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${sec}`,
    tzid: params?.TZID ? String(params.TZID) : "",
  };
}

function parseIcs(icsText) {
  const lines = unfoldLines(icsText);
  const events = [];
  let cur = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      cur = { id: "", title: "", location: "", description: "" };
      continue;
    }
    if (line === "END:VEVENT") {
      if (cur) {
        if (!cur.id) cur.id = `${cur.sortKey || ""}::${cur.title || "event"}`;
        events.push(cur);
      }
      cur = null;
      continue;
    }
    if (!cur) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;

    const left = line.slice(0, colon);
    const value = line.slice(colon + 1);

    const parts = left.split(";");
    const prop = (parts[0] || "").toUpperCase();

    const params = {};
    for (let i = 1; i < parts.length; i++) {
      const [k, vv] = parts[i].split("=");
      if (k && vv) params[k.toUpperCase()] = vv;
    }

    if (prop === "UID") cur.id = decodeText(value);
    if (prop === "SUMMARY") cur.title = decodeText(value);
    if (prop === "LOCATION") cur.location = decodeText(value);
    if (prop === "DESCRIPTION") cur.description = decodeText(value);

    if (prop === "DTSTART") {
      const d = parseIcsDate(value, params);
      if (d) Object.assign(cur, d);
    }

    if (prop === "DTEND") {
      const d = parseIcsDate(value, params);
      if (d) {
        if (d.allDay) cur.endDate = d.startDate;
        else cur.end = d.start;
      }
    }
  }

  return events;
}
