// web/functions/api/opseu-news.js

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") || 10), 1),
    25,
  );

  const SOURCES = [
    // RSS first (fast when it works)
    { kind: "rss", url: "https://opseu.org/feed/" },
    { kind: "rss", url: "https://opseu.org/news/feed/" },
    { kind: "rss", url: "https://opseu.org/category/news/feed/" },

    // WP REST fallback (often works when RSS is blocked)
    {
      kind: "wp",
      url: `https://opseu.org/wp-json/wp/v2/posts?per_page=${limit}&_embed=1`,
    },
    {
      kind: "wp",
      url: `https://opseu.org/wp-json/wp/v2/posts?per_page=${limit}&categories=0&_embed=1`,
    },
  ];

  let lastErr = "";
  let lastStatus = "";

  for (const src of SOURCES) {
    try {
      const res = await fetch(src.url, {
        headers: {
          "user-agent": "opseu279-site/1.0 (+https://opseu279.com)",
          accept:
            src.kind === "rss"
              ? "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7"
              : "application/json, */*;q=0.8",
        },
        redirect: "follow",
      });

      if (!res.ok) {
        lastStatus = `${res.status} ${res.statusText}`;
        lastErr = `${src.kind.toUpperCase()} ${src.url} -> ${lastStatus}`;
        continue;
      }

      // Parse based on source type
      if (src.kind === "rss") {
        const xml = await res.text();
        const items = parseRss(xml, limit);
        if (items.length) return json({ items }, 200, 600);
        lastErr = `RSS parsed but returned 0 items: ${src.url}`;
        continue;
      }

      // WP JSON
      const posts = await res.json();
      const items = parseWpPosts(posts, limit);
      if (items.length) return json({ items }, 200, 600);
      lastErr = `WP parsed but returned 0 items: ${src.url}`;
    } catch (e) {
      lastErr = `${src.kind.toUpperCase()} ${src.url} -> ${e?.message || "fetch failed"}`;
    }
  }

  return json(
    {
      items: [],
      error: `All OPSEU sources failed. Last: ${lastErr || lastStatus || "unknown"}`,
    },
    502,
    0,
  );
}

/* ---------------- helpers ---------------- */

function json(data, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": maxAge ? `public, max-age=${maxAge}` : "no-store",
    },
  });
}

// RSS parsing
function parseRss(xml, limit) {
  const items = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gim) || [];

  for (const block of itemBlocks.slice(0, limit)) {
    const title = pick(block, "title");
    const link = pick(block, "link");
    const pubDate = pick(block, "pubDate");
    const desc =
      pick(block, "content:encoded") || pick(block, "description") || "";

    const enclosureUrl = pickAttr(block, "enclosure", "url");
    const mediaUrl = pickAttr(block, "media:content", "url");
    const image = enclosureUrl || mediaUrl || "";

    const cleanTitle = decodeHtml(stripCdata(title)).trim();
    const cleanLink = decodeHtml(stripCdata(link)).trim();

    if (!cleanLink) continue;

    items.push({
      id: cleanLink,
      title: cleanTitle || "Untitled",
      link: cleanLink,
      date: decodeHtml(stripCdata(pubDate)).trim(),
      excerpt: truncateText(stripTags(decodeHtml(stripCdata(desc))), 220),
      image: decodeHtml(stripCdata(image)).trim(),
      source: "OPSEU/SEFPO",
    });
  }
  return items;
}

// WP REST parsing
function parseWpPosts(posts, limit) {
  if (!Array.isArray(posts)) return [];

  return posts
    .slice(0, limit)
    .map((p) => {
      const title = safeText(p?.title?.rendered) || "Untitled";
      const link = safeText(p?.link);
      const date = safeText(p?.date);

      const excerptHtml = safeText(p?.excerpt?.rendered);
      const excerpt = truncateText(stripTags(decodeHtml(excerptHtml)), 220);

      // Try common featured image locations from _embed
      let image = "";
      const fm = p?._embedded?.["wp:featuredmedia"]?.[0];
      if (fm?.source_url) image = String(fm.source_url);
      if (!image) {
        const og =
          p?._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.medium
            ?.source_url;
        if (og) image = String(og);
      }

      return {
        id: p?.id || link || `wp-${Math.random().toString(16).slice(2)}`,
        title: stripTags(decodeHtml(title)).trim() || "Untitled",
        link,
        date,
        excerpt,
        image,
        source: "OPSEU/SEFPO",
      };
    })
    .filter((x) => x.link);
}

function safeText(v) {
  return typeof v === "string" ? v : "";
}

function pick(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1] : "";
}

function pickAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]+)"[^>]*\\/?>`, "i");
  const m = xml.match(re);
  return m ? m[1] : "";
}

function stripCdata(s) {
  return (s || "").replace(/^<!\[CDATA\[(.*)\]\]>$/s, "$1");
}

function stripTags(s) {
  return (s || "")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(s, n) {
  if (!s) return "";
  return s.length > n ? `${s.slice(0, n - 1).trim()}…` : s;
}

function decodeHtml(s) {
  return (s || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}
