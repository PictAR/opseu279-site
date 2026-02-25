// web/src/components/OpseuNewsCarousel.jsx
import { useEffect, useRef, useState } from "react";

export default function OpseuNewsCarousel({ limit = 10 }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const rowRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const url = new URL("/api/opseu-news", window.location.origin);
        url.searchParams.set("limit", String(limit));

        const res = await fetch(url.toString(), {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      } catch {
        try {
          const fallback = await fetch(
            `https://opseu.org/wp-json/wp/v2/posts?per_page=${Math.min(
              12,
              Number(limit) || 10,
            )}&_embed=1`,
            { headers: { Accept: "application/json" } },
          );
          if (!fallback.ok) throw new Error(`HTTP ${fallback.status}`);
          const json = await fallback.json();
          const mapped = Array.isArray(json)
            ? json.map(mapWpPost).filter(Boolean)
            : [];
          if (!cancelled) setItems(mapped);
        } catch {
          if (!cancelled)
            setError(
              "OPSEU news could not be loaded in this environment. In production this is served via a Pages Function.",
            );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  function scrollByCards(dir) {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector("[data-card='1']");
    const width = card ? card.getBoundingClientRect().width : 280;
    row.scrollBy({ left: dir * (width + 12), behavior: "smooth" });
  }

  return (
    <div className="opn">
      <div className="opnTop">
        <a
          href="https://opseu.org/news-page/"
          target="_blank"
          rel="noreferrer"
          className="opnAllBtn"
        >
          All OPSEU news
        </a>
      </div>

      {error ? <div className="opnError">{error}</div> : null}

      <div className="opnRail" aria-label="OPSEU news carousel">
        <button
          type="button"
          className="opnEdgeBtn opnNavBtn"
          onClick={() => scrollByCards(-1)}
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div ref={rowRef} className="opnRow">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="opnCard opnCardSkeleton" data-card="1" />
            ))
          ) : items.length ? (
            items.map((it, idx) => (
              <a
                key={it.link || idx}
                href={it.link}
                target="_blank"
                rel="noreferrer"
                className="opnCard"
                data-card="1"
              >
                {it.image ? (
                  <div className="opnImgWrap">
                    <img
                      src={it.image}
                      alt=""
                      className="opnImg"
                      loading="lazy"
                    />
                  </div>
                ) : null}

                <div className="opnBody">
                  <div className="opnTitle">{it.title}</div>
                  {it.date ? (
                    <div className="opnMeta">{formatDate(it.date)}</div>
                  ) : null}
                  {it.excerpt ? (
                    <div className="opnExcerpt">{it.excerpt}</div>
                  ) : null}
                </div>
              </a>
            ))
          ) : (
            <div className="opnEmpty">No items found.</div>
          )}
        </div>

        <button
          type="button"
          className="opnEdgeBtn opnNavBtn"
          onClick={() => scrollByCards(1)}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function stripHtml(str) {
  return String(str || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
