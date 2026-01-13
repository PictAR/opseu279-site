/**
 * OPSEU 279 CA AI Worker (Cloudflare Workers + TypeScript)
 *
 * Env vars (Cloudflare):
 *  - OPENAI_API_KEY (secret)
 *  - OPENAI_VECTOR_STORE_ID
 *  - OPENAI_MODEL (optional)
 *  - ALLOWED_ORIGINS (optional)
 */

export interface Env {
  OPENAI_API_KEY: string;
  OPENAI_VECTOR_STORE_ID: string;
  OPENAI_MODEL?: string;
  ALLOWED_ORIGINS?: string;
}

type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

type CAAnswer = {
  not_found: boolean;
  answer: string;
  quotes: Array<{
    citation: string;
    quote: string;
  }>;
};

const DEFAULT_ALLOWED_ORIGINS = [
  "https://opseu279.com",
  "https://www.opseu279.com",
  "http://localhost:5173",
];

const SYSTEM_INSTRUCTIONS = `
You are the OPSEU Local 279 Collective Agreement assistant.
You MUST answer using ONLY information found in the Norfolk County OPSEU Local 279 collective agreement (via file_search).

Output rules:
- If the answer is not clearly found in the collective agreement text returned by file_search: set not_found=true and answer exactly: "I can’t find that in the collective agreement."
- If you answer: you MUST include one or more verbatim quotes copied from the agreement and provide an article/section citation for each quote.
- Citations must be in the agreement’s own format (e.g., "19.02" or "Article 19"). Do NOT use bracket/file citations like "[5:1†...]" .
- Do NOT invent citations.
- Keep it concise.
`.trim();

const JSON_SCHEMA: JsonValue = {
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

function parseAllowedOrigins(env: Env): string[] {
  const raw = (env.ALLOWED_ORIGINS || "").trim();
  if (!raw) return [...DEFAULT_ALLOWED_ORIGINS];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsHeaders(origin: string | null, allowed: string[]) {
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0] || "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(
  body: Record<string, unknown>,
  init: ResponseInit,
  origin: string | null,
  allowed: string[],
) {
  const headers = new Headers(init.headers || {});
  const cors = corsHeaders(origin, allowed);
  Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body, null, 2), { ...init, headers });
}

function normalizeText(s: string): string {
  return s
    .replace(/\u00A0/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function safeString(x: unknown): string {
  if (typeof x === "string") return x;
  if (x == null) return "";
  return String(x);
}

function extractAssistantText(resp: any): string {
  const output = Array.isArray(resp?.output) ? resp.output : [];
  const msgs = output.filter((o: any) => o?.type === "message" && o?.role === "assistant");
  const parts: string[] = [];
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

type RetrievedChunk = { filename?: string; file_id?: string; text: string; score?: number };

function extractSearchResults(resp: any): RetrievedChunk[] {
  const output = Array.isArray(resp?.output) ? resp.output : [];
  const calls = output.filter((o: any) => o?.type === "file_search_call");
  const chunks: RetrievedChunk[] = [];

  for (const call of calls) {
    // With include: ["file_search_call.results"], results should appear here.
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
          .map((p: any) => (typeof p?.text === "string" ? p.text : typeof p === "string" ? p : ""))
          .filter(Boolean)
          .join("\n");
      } else if (Array.isArray(r?.document?.content)) {
        text = r.document.content
          .map((p: any) => (typeof p?.text === "string" ? p.text : typeof p === "string" ? p : ""))
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

function deriveCitationFromChunk(chunkText: string, quote: string): string | null {
  const nChunk = normalizeText(chunkText);
  const nQuote = normalizeText(quote);
  const idx = nChunk.indexOf(nQuote);

  // If we can’t locate the quote in this chunk, bail
  if (idx < 0) return null;

  // Look a bit before the quote for the nearest clause number, e.g., 19.02
  const windowStart = Math.max(0, idx - 800);
  const window = nChunk.slice(windowStart, idx + 80);

  const clauseMatches = [...window.matchAll(/\b\d{1,2}\.\d{2}\b/g)];
  if (clauseMatches.length) return clauseMatches[clauseMatches.length - 1][0];

  const articleMatches = [...window.matchAll(/\bARTICLE\s+\d+\b/gi)];
  if (articleMatches.length) return articleMatches[articleMatches.length - 1][0].replace(/\s+/g, " ");

  return null;
}

function extractExcerptByCitation(citation: string, retrieved: RetrievedChunk[]): string | null {
  const cit = citation.trim();
  if (!cit) return null;

  for (const r of retrieved) {
    const idx = r.text.indexOf(cit);
    if (idx >= 0) {
      const after = r.text.slice(idx);

      // Try to stop at the next clause number (e.g., 19.03) if present
      const rest = after.slice(cit.length);
      const next = rest.match(/\b\d{1,2}\.\d{2}\b/);

      const end =
        next && next.index != null
          ? cit.length + next.index
          : Math.min(after.length, 700);

      return after.slice(0, end).trim();
    }
  }

  // Fallback: return the best available chunk start
  return retrieved[0]?.text ? retrieved[0].text.slice(0, 700).trim() : null;
}

function validateAndFormatAnswer(parsed: CAAnswer, retrieved: RetrievedChunk[]) {
  const combined = normalizeText(retrieved.map((r) => r.text).join("\n\n"));

  const validQuotes: CAAnswer["quotes"] = [];

  for (const q of parsed.quotes || []) {
    const citation = safeString(q?.citation).trim();
    const quote = safeString(q?.quote).trim();

    if (!citation) continue;

    // If the model quote is verifiably present in retrieved text, keep it
    if (quote && combined.includes(normalizeText(quote))) {
      validQuotes.push({ citation, quote });
      continue;
    }

    // Otherwise, extract a real excerpt from retrieved text using the citation
    const extracted = extractExcerptByCitation(citation, retrieved);
    if (extracted) {
      validQuotes.push({ citation, quote: extracted });
    }
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

  const answer = parsed.answer.trim();
  const citations = Array.from(new Set(validQuotes.map((x) => x.citation)));

  const lines: string[] = [];
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

async function readJson(req: Request): Promise<any> {
  const ct = req.headers.get("Content-Type") || "";
  if (!ct.toLowerCase().includes("application/json")) return null;
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const allowed = parseAllowedOrigins(env);

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, allowed),
      });
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { error: { message: "Method not allowed" } },
        { status: 405 },
        origin,
        allowed,
      );
    }

    const body = await readJson(request);
    const input = safeString(body?.input ?? body?.question ?? body?.q).trim();
    const debug = body?.debug === true || new URL(request.url).searchParams.get("debug") === "1";

    if (!input) {
      return jsonResponse(
        { error: { message: "Missing `input`" } },
        { status: 400 },
        origin,
        allowed,
      );
    }

    if (!env.OPENAI_API_KEY) {
      return jsonResponse(
        { error: { message: "Server misconfigured: missing OPENAI_API_KEY" } },
        { status: 500 },
        origin,
        allowed,
      );
    }

    if (!env.OPENAI_VECTOR_STORE_ID) {
      return jsonResponse(
        { error: { message: "Server misconfigured: missing OPENAI_VECTOR_STORE_ID" } },
        { status: 500 },
        origin,
        allowed,
      );
    }

    // Frontend sends a Clerk token. For now we just require a Bearer token exists.
    // (We can add real Clerk JWT verification next.)
    const auth = request.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return jsonResponse(
        { error: { message: "Missing Authorization Bearer token" } },
        { status: 401 },
        origin,
        allowed,
      );
    }

    const model = env.OPENAI_MODEL || "gpt-4.1";

    const payload: Record<string, unknown> = {
      model,
      temperature: 0,
      store: false,
      max_tool_calls: 1,
      input: [
        { role: "system", content: SYSTEM_INSTRUCTIONS },
        { role: "user", content: input },
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: [env.OPENAI_VECTOR_STORE_ID],
        },
      ],
      // IMPORTANT: include belongs at the TOP LEVEL (not inside tools)
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

    try {
      const r = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const openaiResp = await r.json();

      if (!r.ok) {
        return jsonResponse(
          {
            error: {
              message: openaiResp?.error?.message || "OpenAI request failed",
              ...(debug ? { details: openaiResp } : {}),
            },
          },
          { status: 502 },
          origin,
          allowed,
        );
      }

      const retrieved = extractSearchResults(openaiResp);
      const openaiRawText = extractAssistantText(openaiResp);

      // No file_search results = do not answer.
      if (retrieved.length === 0) {
        return jsonResponse(
          {
            text: "I can’t find that in the collective agreement.",
            ...(debug
              ? {
                  debug: {
                    note: "No file_search results returned",
                    output_types: (openaiResp?.output || []).map((o: any) => o?.type),
                  },
                }
              : {}),
          },
          { status: 200 },
          origin,
          allowed,
        );
      }

      let parsed: CAAnswer;
      try {
        parsed = JSON.parse(openaiRawText) as CAAnswer;
      } catch {
        // If structured output fails, don't risk hallucinations.
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

      return jsonResponse(
        {
          text: finalized.text,
          citations: finalized.citations,
          quotes: finalized.quotes,
          ...(debug
            ? {
                debug: {
                  model,
                  retrieved_count: retrieved.length,
                  retrieved_preview: retrieved.slice(0, 5).map((x) => ({
                    filename: x.filename,
                    file_id: x.file_id,
                    score: x.score,
                    text_preview: x.text.slice(0, 240),
                  })),
                  raw_json: parsed,
                },
              }
            : {}),
        },
        { status: 200 },
        origin,
        allowed,
      );
    } catch (e: any) {
      return jsonResponse(
        { error: { message: e?.message || String(e) } },
        { status: 500 },
        origin,
        allowed,
      );
    }
  },
};
