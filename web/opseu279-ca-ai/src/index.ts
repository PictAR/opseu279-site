/**
 * OPSEU 279 CA AI Worker (Cloudflare Workers + TypeScript)
 *
 * Features:
 * - Uses OpenAI Responses API + file_search against your vector store
 * - Quotes verbatim CA text and cites clause/article (no hallucinated citations)
 * - If CA doesn't contain answer, returns: "I can’t find that in the collective agreement."
 * - KV cache for speed/cost (optional; requires CA_CACHE binding)
 * - /feedback endpoint for "Was this helpful?"
 *
 * Env vars (Cloudflare):
 *  - OPENAI_API_KEY (secret)
 *  - OPENAI_VECTOR_STORE_ID (secret or env var)
 *  - OPENAI_MODEL (optional, default gpt-4.1)
 *  - ALLOWED_ORIGINS (optional, comma list)
 * Bindings (optional but recommended):
 *  - CA_CACHE (KV Namespace)
 */

export interface Env {
  OPENAI_API_KEY: string;
  OPENAI_VECTOR_STORE_ID: string;
  OPENAI_MODEL?: string;
  ALLOWED_ORIGINS?: string;
  CA_CACHE?: KVNamespace;
}

type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

type CAAnswer = {
  not_found: boolean;
  answer: string;
  quotes: Array<{
    citation: string; // e.g. "19.02" or "ARTICLE 19"
    quote: string; // verbatim excerpt
  }>;
};

type RetrievedChunk = { filename?: string; file_id?: string; text: string; score?: number };

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
- If you answer: the "answer" field must be a SHORT plain-English summary (do not paste long quotes in "answer").
- The "quotes" array MUST include one or more verbatim excerpts copied from the agreement and provide a citation for each quote in the agreement’s own format (e.g., "19.02" or "ARTICLE 19"). Do NOT use bracket/file citations like "[5:1†...]".
- Do NOT invent citations or wording.
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

function normalizeQuestion(q: string): string {
  return q.replace(/\s+/g, " ").trim().toLowerCase();
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
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

function extractSearchResults(resp: any): RetrievedChunk[] {
  const output = Array.isArray(resp?.output) ? resp.output : [];
  const calls = output.filter((o: any) => o?.type === "file_search_call");
  const chunks: RetrievedChunk[] = [];

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

/**
 * Extract a real excerpt directly from retrieved CA text, starting at the cited clause/article.
 * This avoids failures when model-generated quotes are longer than any single retrieved chunk.
 */
function extractExcerptByCitation(citation: string, retrieved: RetrievedChunk[]): string | null {
  const citRaw = citation.trim();
  if (!citRaw) return null;

  const cit = citRaw.replace(/^article\s+/i, "ARTICLE ").trim();

  for (const r of retrieved) {
    const text = r.text;
    // Try exact match first
    let idx = text.indexOf(cit);
    if (idx < 0) {
      // Try case-insensitive match
      const lower = text.toLowerCase();
      idx = lower.indexOf(cit.toLowerCase());
    }
    if (idx >= 0) {
      const after = text.slice(idx);

      // stop at the next clause number if it appears
      const rest = after.slice(Math.min(after.length, 12)); // move past the clause token a bit
      const nextClause = rest.match(/\b\d{1,2}\.\d{2}\b/);

      const end =
        nextClause && nextClause.index != null
          ? Math.min(after.length, 12 + nextClause.index)
          : Math.min(after.length, 900);

      return after.slice(0, end).trim();
    }
  }

  // fallback: a short chunk preview (still only from retrieved text)
  return retrieved[0]?.text ? retrieved[0].text.slice(0, 900).trim() : null;
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const allowed = parseAllowedOrigins(env);
    const url = new URL(request.url);

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin, allowed) });
    }

    // Require bearer token (Clerk). We are not verifying it yet.
    const auth = request.headers.get("Authorization") || "";
    const hasBearer = auth.startsWith("Bearer ");

    // /feedback route
    if (url.pathname === "/feedback") {
      if (request.method !== "POST") {
        return jsonResponse({ error: { message: "Method not allowed" } }, { status: 405 }, origin, allowed);
      }
      if (!hasBearer) {
        return jsonResponse(
          { error: { message: "Missing Authorization Bearer token" } },
          { status: 401 },
          origin,
          allowed,
        );
      }
      if (!env.CA_CACHE) {
        return jsonResponse(
          { error: { message: "Server misconfigured: missing CA_CACHE binding" } },
          { status: 500 },
          origin,
          allowed,
        );
      }

      const body = await readJson(request);
      const q_hash = safeString(body?.q_hash).trim();
      const helpful = body?.helpful === true;

      if (!q_hash) {
        return jsonResponse({ error: { message: "Missing q_hash" } }, { status: 400 }, origin, allowed);
      }

      const key = `fb:${q_hash}`;
      const current = (await env.CA_CACHE.get(key, "json")) as any | null;
      const next = {
        up: (current?.up || 0) + (helpful ? 1 : 0),
        down: (current?.down || 0) + (helpful ? 0 : 1),
      };

      await env.CA_CACHE.put(key, JSON.stringify(next), { expirationTtl: 60 * 60 * 24 * 180 }); // 180 days
      return jsonResponse({ ok: true, ...next }, { status: 200 }, origin, allowed);
    }

    // Main ask route
    if (request.method !== "POST") {
      return jsonResponse({ error: { message: "Method not allowed" } }, { status: 405 }, origin, allowed);
    }
    if (!hasBearer) {
      return jsonResponse(
        { error: { message: "Missing Authorization Bearer token" } },
        { status: 401 },
        origin,
        allowed,
      );
    }

    const body = await readJson(request);
    const input = safeString(body?.input ?? body?.question ?? body?.q).trim();
    const debug = body?.debug === true || url.searchParams.get("debug") === "1";

    if (!input) {
      return jsonResponse({ error: { message: "Missing `input`" } }, { status: 400 }, origin, allowed);
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

    // Compute q_hash (returned to frontend for feedback + caching)
    const normQ = normalizeQuestion(input);
    const q_hash = await sha256Hex(`${env.OPENAI_VECTOR_STORE_ID}:${normQ}`);
    const cacheKey = `qa:${q_hash}`;

    // Cache HIT (skip OpenAI entirely)
    if (!debug && env.CA_CACHE) {
      const cached = (await env.CA_CACHE.get(cacheKey, "json")) as any | null;
      if (cached?.text) {
        return jsonResponse(
          { ...cached, q_hash, cached: true },
          { status: 200, headers: { "X-Cache": "HIT" } },
          origin,
          allowed,
        );
      }
    }

    const model = env.OPENAI_MODEL || "gpt-4.1";

    // Keep file_search results smaller to reduce cost/latency
    const payload: Record<string, unknown> = {
      model,
      temperature: 0,
      store: false,
      max_tool_calls: 1,
      max_output_tokens: 700,
      input: [
        { role: "system", content: SYSTEM_INSTRUCTIONS },
        { role: "user", content: input },
      ],
      tools: [
        {
          type: "file_search",
          vector_store_ids: [env.OPENAI_VECTOR_STORE_ID],
          max_num_results: 6,
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

      if (retrieved.length === 0) {
        const bodyOut = {
          text: "I can’t find that in the collective agreement.",
          citations: [],
          quotes: [],
          q_hash,
          cached: false,
          ...(debug
            ? {
                debug: {
                  note: "No file_search results returned",
                  output_types: (openaiResp?.output || []).map((o: any) => o?.type),
                },
              }
            : {}),
        };

        // Cache not_found briefly
        if (!debug && env.CA_CACHE) {
          await env.CA_CACHE.put(cacheKey, JSON.stringify(bodyOut), { expirationTtl: 60 * 60 * 12 });
        }

        return jsonResponse(bodyOut, { status: 200, headers: { "X-Cache": "MISS" } }, origin, allowed);
      }

      let parsed: CAAnswer;
      try {
        parsed = JSON.parse(openaiRawText) as CAAnswer;
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

      const bodyOut: any = {
        text: finalized.text,
        citations: finalized.citations,
        quotes: finalized.quotes,
        q_hash,
        cached: false,
      };

      if (debug) {
        bodyOut.debug = {
          model,
          retrieved_count: retrieved.length,
          retrieved_preview: retrieved.slice(0, 5).map((x) => ({
            filename: x.filename,
            file_id: x.file_id,
            score: x.score,
            text_preview: x.text.slice(0, 240),
          })),
          raw_json: parsed,
        };
      }

      // Cache (long for found, shorter for not_found)
      if (!debug && env.CA_CACHE) {
        await env.CA_CACHE.put(cacheKey, JSON.stringify(bodyOut), {
          expirationTtl: finalized.not_found ? 60 * 60 * 12 : 60 * 60 * 24 * 30,
        });
      }

      return jsonResponse(bodyOut, { status: 200, headers: { "X-Cache": "MISS" } }, origin, allowed);
    } catch (e: any) {
      return jsonResponse({ error: { message: e?.message || String(e) } }, { status: 500 }, origin, allowed);
    }
  },
};
