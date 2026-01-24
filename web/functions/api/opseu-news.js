// web/functions/api/opseu-news.js
// Cloudflare Pages Function: /api/opseu-news

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);

  const limitRaw = url.searchParams.get("limit") || "10";
  const limit = clamp(parseInt(limitRaw, 10) || 10, 1, 12);

  try {
    // 1) Try to pull the dedicated "news" category first
    const newsCategoryId = await findCategoryIdBySlug("news");

    const postsUrl = new URL("https://opseu.org/wp-json/wp/v2/posts");
    postsUrl.searchParams.set("per_page", String(limit));
    postsUrl.searchParams.set("_embed", "1");
    if (newsCategoryId)
      postsUrl.searchParams.set("categories", String(newsCategoryId));

    const res = await fetch(postsUrl.toString(), {
      headers: {
        Accept: "application/json",
        // Set a normal UA to avoid some edge filtering.
        "User-Agent": "opseu279.com (Local 279 News Carousel)",
      },
    });

    if (!res.ok) {
      throw new Error(`OPSEU fetch failed: ${res.status}`);
    }

    const json = await res.json();
    const items = Array.isArray(json)
      ? json.map(mapWpPost).filter(Boolean)
      : [];

    return jsonResponse(
      {
        items,
        source: "wp-json",
        fetchedAt: new Date().toISOString(),
      },
      200,
    );
  } catch {
    return jsonResponse(
      {
        items: [],
        error: "Unable to load OPSEU news right now.",
      },
      200,
    );
  }
}

async function findCategoryIdBySlug(slug) {
  try {
    const u = new URL("https://opseu.org/wp-json/wp/v2/categories");
    u.searchParams.set("slug", slug);
    u.searchParams.set("per_page", "1");

    const res = await fetch(u.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "opseu279.com (Local 279 News Carousel)",
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json) || !json[0]?.id) return null;
    return json[0].id;
  } catch {
    return null;
  }
}

function mapWpPost(post) {
  try {
    const title = stripHtml(post?.title?.rendered);
    const excerpt = stripHtml(post?.excerpt?.rendered);
    const link = post?.link;
    const date = post?.date || post?.date_gmt;

    const media = post?._embedded?.["wp:featuredmedia"]?.[0];
    const image =
      media?.media_details?.sizes?.medium?.source_url ||
      media?.media_details?.sizes?.large?.source_url ||
      media?.source_url ||
      "";

    if (!title || !link) return null;
    return { title, excerpt, link, date, image };
  } catch {
    return null;
  }
}

function stripHtml(str) {
  return String(str || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Cache for 5 minutes at the edge.
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
