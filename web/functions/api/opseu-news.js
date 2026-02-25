// web/functions/api/opseu-news.js

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const limit = Math.min(
    20,
    Math.max(1, Number(url.searchParams.get("limit") || 10)),
  );

  const FEEDS = [
    "https://opseu.org/feed/",
    "https://opseu.org/news/feed/",
    "https://opseu.org/category/news/feed/",
  ];

  const upstream = await fetch(FEED_URL, {
    headers: {
      "user-agent": "opseu279-site/1.0 (+https://opseu279.com)",
      accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8",
    },
  });

  let upstream = null;
  let lastErr = "";

  for (const FEED_URL of FEEDS) {
    try {
      upstream = await fetch(FEED_URL, {
        headers: {
          "user-agent": "opseu279-site/1.0 (+https://opseu279.com)",
          accept:
            "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7",
        },
      });

      if (upstream.ok) break;

      lastErr = `${FEED_URL} -> ${upstream.status} ${upstream.statusText}`;
      upstream = null;
    } catch (e) {
      lastErr = `${FEED_URL} -> ${e?.message || "fetch failed"}`;
      upstream = null;
    }
  }

  if (!upstream) {
    return json(
      { items: [], error: `All OPSEU feeds failed. Last error: ${lastErr}` },
      502,
    );
  }

  if (!upstream.ok) {
    return json(
      { items: [], error: `Upstream feed failed (${upstream.status})` },
      502,
    );
  }

  const xml = await upstream.text();

  // Very light RSS parsing (good enough for WP feeds)
  const items = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gim) || [];

  for (const block of itemBlocks.slice(0, limit)) {
    const title = pick(block, "title");
    const link = pick(block, "link");
    const pubDate = pick(block, "pubDate");

    // WP often uses content:encoded or description
    const desc =
      pick(block, "content:encoded") || pick(block, "description") || "";

    // Try a couple common image patterns
    const enclosureUrl = pickAttr(block, "enclosure", "url");
    const mediaUrl = pickAttr(block, "media:content", "url");
    const image = enclosureUrl || mediaUrl || "";

    items.push({
      title: decodeHtml(stripCdata(title)).trim(),
      link: decodeHtml(stripCdata(link)).trim(),
      date: decodeHtml(stripCdata(pubDate)).trim(),
      excerpt: truncateText(stripTags(decodeHtml(stripCdata(desc))), 220),
      image: decodeHtml(stripCdata(image)).trim(),
      source: "OPSEU/SEFPO",
    });
  }

  return json({ items }, 200, 600); // cache 10 min
}

function json(data, status = 200, maxAge = 0) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": maxAge ? `public, max-age=${maxAge}` : "no-store",
    },
  });
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
