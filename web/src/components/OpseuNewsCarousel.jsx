import { useEffect, useMemo, useState } from "react";

// If you have a Pages Function/Worker endpoint, use it.
// If not, set VITE_OPSEU_NEWS_ENDPOINT to something you control.
const ENDPOINT = import.meta.env.VITE_OPSEU_NEWS_ENDPOINT || "/api/opseu-news";

console.log("[OpseuNewsCarousel] mounted, ENDPOINT =", ENDPOINT);

function safeText(v) {
  return typeof v === "string" ? v : "";
}

export default function OpseuNewsCarousel({ limit = 10 }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setErr("");

        const url = `${ENDPOINT}?limit=${encodeURIComponent(limit)}`;
        const res = await fetch(url, {
          headers: { accept: "application/json" },
        });

        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);

        const json = await res.json();

        // Expect { items: [...] } or { posts: [...] } or raw array
        const arr =
          (Array.isArray(json) && json) ||
          (Array.isArray(json?.items) && json.items) ||
          (Array.isArray(json?.posts) && json.posts) ||
          [];

        if (!cancelled) setItems(arr);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "OPSEU news failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const normalized = useMemo(() => {
    return items
      .map((it, idx) => ({
        id: it.id || it.guid || it.link || `opn-${idx}`,
        title: safeText(it.title) || "Untitled",
        link: safeText(it.link) || safeText(it.url),
        date: safeText(it.date) || safeText(it.pubDate) || "",
        excerpt: safeText(it.excerpt) || safeText(it.summary) || "",
        image: safeText(it.image) || safeText(it.imageUrl) || "",
        source: safeText(it.source) || "",
      }))
      .filter((x) => x.link);
  }, [items]);

  if (loading) {
    return (
      <div className="opn">
        <div className="opnRow" aria-label="Loading OPSEU news">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="opnCard opnCardSkeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (err) {
    return <div className="opnError">OPSEU news failed to load: {err}</div>;
  }

  if (!normalized.length) {
    return <div className="opnEmpty">No OPSEU news found.</div>;
  }

  return (
    <div className="opn" aria-label="OPSEU news carousel">
      <div className="opnRow">
        {normalized.slice(0, limit).map((p) => (
          <a
            key={p.id}
            className="opnCard"
            href={p.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open OPSEU news: ${p.title}`}
          >
            <div className="opnImgWrap">
              {p.image ? (
                <img src={p.image} alt="" className="opnImg" loading="lazy" />
              ) : (
                <div className="opnImg" aria-hidden="true" />
              )}
            </div>

            <div className="opnBody">
              <div className="opnTitle">{p.title}</div>
              <div className="opnMeta">
                {p.date ? p.date : ""}
                {p.source ? ` · ${p.source}` : ""}
              </div>
              {p.excerpt ? <div className="opnExcerpt">{p.excerpt}</div> : null}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
