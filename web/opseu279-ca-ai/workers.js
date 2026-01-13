/**
 * OPSEU 279 CA AI Worker (Plain JS)
 *
 * Required env vars:
 *  - OPENAI_API_KEY
 *  - OPENAI_VECTOR_STORE_ID
 *
 * Optional env vars:
 *  - OPENAI_MODEL (default: "gpt-4.1")
 *  - ALLOWED_ORIGINS (comma-separated, default includes opseu279.com + localhost:5173)
 */

const DEFAULT_ALLOWED_ORIGINS = [
  "https://opseu279.com",
  "https://www.opseu279.com",
  "http://localhost:5173",
];

const SYSTEM_INSTRUCTIONS = `
You are the OPSEU Local 279 Collective Agreement assistant.
You MUST answer using ONLY information found in the Norfolk County OPSEU Local 279 collective agreement (the provided files via file_search).

Rules:
1) If the answer is not clearly found in the collective agreement text returned by file_search, set not_found=true and answer: "I can’t find that in the collective agreement."
2) If you answer, you MUST include:
   - a short direct answer
   - one or more verbatim quotes copied from the collective agreement
   - a citation string for each quote that matches the agreement’s own section/article labeling (e.g., "Article 19.02", "19.02", "Section X", etc.)
3) Do NOT invent citations. Do NOT cite anything not present in the quoted text.
4) Keep it concise.
`.trim();

const JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    not_found: { type: "boolean" },
    answer: { type: "string" },
    quotes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          citation: { type: "string" },
          quote: { type: "string" },
        },
        required: ["citation", "quote"],
      },
    },
  },
  required: ["not_found", "answer", "quotes"],
};

function parseAllowedOrigins(env) {
  const raw = (env.ALLOWED_ORIGINS || "").trim();
  if (!raw) return [...DEFAULT_ALLOWED_ORIGINS];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsHeaders(origin, allowed) {
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(body, init, origin, allowed) {
  const headers = new Headers(init.headers || {});
  const cors = corsHeaders(origin, allowed);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body, null, 2), { ...init, headers });
}

function normalizeText(s) {
  return String(s || "")
    .replace(/\u00A0/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function safeString(x) {
  if (typeof x === "string") return x;
  if (x == null) return "";
  return String(x);
}

function extractAssistantText(resp) {
  const output = Array.isArray(resp?.output) ? resp.output : [];
  const msgs = output.filter((o) => o?.type === "message" && o?.role === "assistant");
  const parts = [];
  for (const m of msgs) {
    const content = Array.isArray(m?.content) ? m.content : [];
    for (const c of content) {
      if (c && typeof c === "object" && typeof c.text === "string") parts.push(c.text);
      if (c && typeof c === "object" && typeof c.refusal === "string") parts.push(c.refusal);
      if (typeof c === "string") parts.push(c);
    }
  }
  return parts.join("").trim();
}

function extractSearchResults(resp) {
  const output = Array.isArray(resp?.output) ? resp.output : [];
  const calls = output.filter((o) => o?.type === "file_search_call");
  const chunks = [];

  for (const call of calls) {
    const results = call?.results ?? call?.search_results ?? null;
    if (!Array.isArray(results)) continue;

    for (const r of results) {
      const filename = r?.filename ?? r?.file?.filename ?? r?.file_name ?? undefined;
      const file_id = r?.file_id ?? r?.file?.id ?? r?.id ?? undefined;
      const score = typeof r?.score === "number" ? r.score : undefined;

      let text = "";
      if (typeof r?.text === "string") text = r.text;
      else if (typeof r?.content === "string") text = r.content;
      else if (Array.isArray(r?.content)) {
        text = r.content
          .map((p) => (typeof p?.text === "string" ? p.text : typeof p === "string" ? p : ""))
          .filter(Boolean)
          .join("\n");
      } else if (Array.isArray(r?.document?.content)) {
        text = r.document.content
          .map((p) => (typeof p?.text === "string" ? p.text : typeof p === "string" ? p : ""))
          .filter(Boolean)
          .join("\n");
      } else if (typeof r?.document?.text === "string") text = r.document.text;

      text = safeString(text).trim();
      if (!text) continue;

      chunks.push({ filename, file_id, text, score });
    }
  }

  return chunks;
}

function validateAndFormatAnswer(parsed, retrieved) {
  const combined = normalizeText(retrieved.map((r) => r.text).join("\n\n"));
  const validQuotes = [];

  for (const q of parsed.quotes || []) {
    const citation = safeString(q?.citation).trim();
    const quote = safeString(q?.quote).trim();
    if (!citation || !quote) continue;

    const nCitation = normalizeText(citation);
    const nQuote = normalizeText(quote);

    if (!combined.includes(nQuote)) continue;
    if (!combined.includes(nCitation)) continue;

    validQuotes.push({ citation, quote });
  }

  const notFound =
    parsed.not_found === true ||
    normalizeText(parsed.answer).toLowerCase() ===
      normalizeText("I can’t find that in the collective agreement.").toLowerCase() ||
    validQuotes.length === 0;

  if (notFound) {
    return {
      not_found: true,
      text: "I can’t find that in the collective agreement.",
      quotes: [],
      citations: [],
    };
  }

  const answer = String(parsed.answer || "").trim();
  const citations = Array.from(new Set(validQuotes.map((q) => q.citation)));

  const lines = [];
  lines.push(answer);
  lines.push("");
  lines.push("Quoted clause(s):");
  for (const q of validQuotes) {
    lines.push(`• (${q.citation}) "${q.quote}"`);
  }

  return {
    not_found: false,
    text: lines.join("\n"),
    quotes: validQuotes,
    citations,
  };
}

async function readJson(req) {
  const ct = req.headers.get("Content-Type") || "";
  if (!ct.toLowerCase().includes("application/json")) return null;
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const allowed = parseAllowedOrigins(env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, allowed) });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: { message: "Method not allowed" } }, { status: 405 }, origin, allowed);
    }

    const body = await readJson(request);
    const input = safeString(body?.input ?? body?.question ?? body?.q).trim();
    const debug = body?.debug === true || new URL(request.url).searchParams.get("debug") === "1";

    if (!input) {
      return jsonResponse({ error: { message: "Missing `input`" } }, { status: 400 }, origin, allowed);
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse({ error: { message: "Server misconfigured: missing OPENAI_API_KEY" } }, { status: 500 }, origin, allowed);
    }
    if (!env.OPENAI_VECTOR_STORE_ID) {
      return jsonResponse(
        { error: { message: "Server misconfigured: missing OPENAI_VECTOR_STORE_ID" } },
        { status: 500 },
        origin,
        allowed,
      );
    }

    const auth = request.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return jsonResponse({ error: { message: "Missing Authorization Bearer token" } }, { status: 401 }, origin, allowed);
    }

    const model = env.OPENAI_MODEL || "gpt-4.1";

    const payload = {
      model,
      max_tool_calls: 1,
      temperature: 0,
      store: false,
      input: [
        { role: "system", content: SYSTEM_INSTRUCTIONS },
        { role: "user", content: input },
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: [env.OPENAI_VECTOR_STORE_ID],
          max_num_results: 8,
        },
      ],
      include: ["file_search_call.results"],
      text: {
        format: {
          type: "json_schema",
          strict: true,
          schema: JSON_SCHEMA,
          name: "ca_answer",
        },
      },
    };

    let openaiResp;
    let openaiRawText = "";
    let retrieved = [];

    try {
      const r = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      openaiResp = await r.json();

      if (!r.ok) {
        return jsonResponse(
          { error: { message: openaiResp?.error?.message || "OpenAI request failed", details: debug ? openaiResp : undefined } },
          { status: 502 },
          origin,
          allowed,
        );
      }

      retrieved = extractSearchResults(openaiResp);
      openaiRawText = extractAssistantText(openaiResp);

      if (retrieved.length === 0) {
        return jsonResponse(
          {
            text: "I can’t find that in the collective agreement.",
            ...(debug
              ? { debug: { note: "No file_search results returned", openai_output_types: (openaiResp?.output || []).map((o) => o?.type) } }
              : {}),
          },
          { status: 200 },
          origin,
          allowed,
        );
      }

      let parsed = null;
      try {
        parsed = JSON.parse(openaiRawText);
      } catch {
        return jsonResponse(
          {
            error: {
              message: "AI returned an unexpected format (JSON parse failed).",
              ...(debug ? { raw: openaiRawText, openai: openaiResp } : {}),
            },
          },
          { status: 502 },
          origin,
          allowed,
        );
      }

      const finalized = validateAndFormatAnswer(parsed, retrieved);

      const debugPayload = debug
        ? {
            debug: {
              model,
              retrieved_count: retrieved.length,
              retrieved_preview: retrieved.slice(0, 5).map((x) => ({
                filename: x.filename,
                file_id: x.file_id,
                score: x.score,
                text_preview: String(x.text || "").slice(0, 240),
              })),
              raw_json: parsed,
            },
          }
        : {};

      return jsonResponse(
        {
          text: finalized.text,
          citations: finalized.citations,
          quotes: finalized.quotes,
          ...debugPayload,
        },
        { status: 200 },
        origin,
        allowed,
      );
    } catch (e) {
      return jsonResponse(
        { error: { message: e?.message || String(e), ...(debug ? { openaiResp, openaiRawText, retrieved } : {}) } },
        { status: 500 },
        origin,
        allowed,
      );
    }
  },
};
