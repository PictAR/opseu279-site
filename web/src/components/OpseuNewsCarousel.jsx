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

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      } catch {
        try {
          const fallback = await fetch(
            `https://opseu.org/wp-json/wp/v2/posts?per_page=${Math.min(12, Number(limit) || 10)}&_embed=1`,
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
    <div style={{ display: "grid", gap: 10 }}>
      <div style={controlsRowStyle}>
        <div style={hintStyle}>Swipe or scroll</div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            style={navButtonStyle}
            onClick={() => scrollByCards(-1)}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            type="button"
            style={navButtonStyle}
            onClick={() => scrollByCards(1)}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      {error ? <div style={errorStyle}>{error}</div> : null}

      <div ref={rowRef} style={rowStyle} aria-label="OPSEU news carousel">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={skeletonCardStyle} />
          ))
        ) : items.length ? (
          items.map((it, idx) => (
            <a
              key={it.link || idx}
              href={it.link}
              target="_blank"
              rel="noreferrer"
              style={cardStyle}
              data-card="1"
            >
              {it.image ? (
                <div style={imgWrapStyle}>
                  <img src={it.image} alt="" style={imgStyle} loading="lazy" />
                </div>
              ) : null}

              <div style={cardBodyStyle}>
                <div style={cardTitleStyle}>{it.title}</div>
                {it.date ? (
                  <div style={cardMetaStyle}>{formatDate(it.date)}</div>
                ) : null}
                {it.excerpt ? (
                  <div style={cardExcerptStyle}>{it.excerpt}</div>
                ) : null}
              </div>
            </a>
          ))
        ) : (
          <div style={emptyStyle}>No items found.</div>
        )}
      </div>

      <a
        href="https://opseu.org/news-page/"
        target="_blank"
        rel="noreferrer"
        style={moreLinkStyle}
      >
        View all OPSEU/SEFPO news
      </a>
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

    // _embed -> featured image
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

const rowStyle = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  padding: "2px 2px 10px",
  scrollSnapType: "x mandatory",
  WebkitOverflowScrolling: "touch",
};

const controlsRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const hintStyle = {
  fontSize: 13,
  opacity: 0.75,
};

const navButtonStyle = {
  width: 36,
  height: 36,
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "rgba(255,255,255,0.9)",
  cursor: "pointer",
  fontSize: 20,
  lineHeight: "36px",
  padding: 0,
};

const cardStyle = {
  minWidth: 270,
  maxWidth: 320,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "#ffffff",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  textDecoration: "none",
  color: "inherit",
  scrollSnapAlign: "start",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto 1fr",
};

const imgWrapStyle = {
  width: "100%",
  background: "rgba(0,85,184,0.04)",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
};

const imgStyle = {
  width: "100%",
  height: 150,
  objectFit: "cover",
  display: "block",
};

const cardBodyStyle = {
  padding: 12,
  display: "grid",
  gap: 6,
};

const cardTitleStyle = {
  fontWeight: 950,
  color: "#0b2b3a",
  fontSize: 15,
  lineHeight: 1.2,
};

const cardMetaStyle = {
  fontSize: 12,
  opacity: 0.7,
};

const cardExcerptStyle = {
  fontSize: 14,
  lineHeight: 1.45,
  opacity: 0.92,
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 4,
  WebkitBoxOrient: "vertical",
};

const skeletonCardStyle = {
  ...cardStyle,
  height: 220,
  background:
    "linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0.07), rgba(0,0,0,0.04))",
};

const errorStyle = {
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(180,0,0,0.18)",
  background: "rgba(180,0,0,0.06)",
  color: "rgba(120,0,0,0.95)",
  fontWeight: 700,
  fontSize: 13,
};

const emptyStyle = {
  fontSize: 13,
  opacity: 0.75,
  padding: 10,
};

const moreLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "fit-content",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,85,184,0.25)",
  background: "rgba(0,85,184,0.10)",
  color: "#0055b8",
  fontWeight: 950,
  textDecoration: "none",
};
