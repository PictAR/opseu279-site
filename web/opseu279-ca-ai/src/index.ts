/**
 * OPSEU 279 CA AI Worker (TypeScript)
 *
 * Required env vars:
 *  - OPENAI_API_KEY
 *  - OPENAI_VECTOR_STORE_ID
 *
 * Optional env vars:
 *  - OPENAI_MODEL (default: "gpt-4.1")
 *  - ALLOWED_ORIGINS (comma-separated, default includes opseu279.com + localhost:5173)
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
      // Many responses look like: { type:"output_text", text:"..." }
      if (c && typeof c === "object" && typeof c.text === "string") parts.push(c.text);
      // Sometimes: { type:"refusal", refusal:"..." }
      if (c && typeof c === "object" && typeof c.refusal === "string") parts.push(c.refusal);
      // Rare fallback
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
    // With include: ["file_search_call.results"], the tool call should contain `results`.
    const results = call?.results ?? call?.search_results ?? null;
    if (!Array.isArray(results)) continue;

    for (const r of results) {
      const filename = r?.filename ?? r?.file?.filename ?? r?.file_name ?? undefined;
      const file_id = r?.file_id ?? r?.file?.id ?? r?.id ?? undefined;
      const score = typeof r?.score === "number" ? r.score : undefined;

      // Try a bunch of possible shapes
      let text = "";
      if (typeof r?.text === "string") text = r.text;
      else if (typeof r?.content === "string") text = r.content;
      else if (Array.isArray(r?.content)) {
        // e.g. content: [{type:"text", text:"..."}]
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

function validateAndFormatAnswer(parsed: CAAnswer, retrieved: RetrievedChunk[]) {
  const combined = normalizeText(retrieved.map((r) => r.text).join("\n\n"));
  const validQuotes: CAAnswer["quotes"] = [];

  for (const q of parsed.quotes || []) {
    const citation = safeString(q?.citation).trim();
    const quote = safeString(q?.quote).trim();
    if (!citation || !quote) continue;

    const nCitation = normalizeText(citation);
    const nQuote = normalizeText(quote);

    // Require BOTH citation and quote to appear in the retrieved text (normalized)
    if (!combined.includes(nQuote)) continue;
    if (!combined.includes(nCitation)) continue;

    validQuotes.push({ citation, quote });
  }

  // Hard rule: If they claim found but can't produce validated quote+citation, treat as not found.
  const notFound =
    parsed.not_found === true ||
    normalizeText(parsed.answer).toLowerCase() === normalizeText("I can’t find that in the collective agreement.").toLowerCase() ||
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
  const citations = Array.from(new Set(validQuotes.map((q) => q.citation)));

  // User-facing formatted output (simple + predictable)
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
  async fetch(request: Request, env: Env): Promise<Response>
