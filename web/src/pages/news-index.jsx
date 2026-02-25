// web/src/pages/news-index.jsx
import { Link } from "react-router-dom";
import { PUBLIC_POSTS } from "../data/posts.js";

function normalizeSrc(src) {
  if (!src) return "";
  let s = String(src).trim();
  if (s.startsWith("public/")) s = s.slice("public/".length);
  if (!s.startsWith("/")) s = `/${s}`;
  return s;
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

export default function NewsIndex() {
  const posts = Array.isArray(PUBLIC_POSTS) ? PUBLIC_POSTS : [];

  const sorted = [...posts].sort((a, b) => {
    const ap = a?.pinned ? 1 : 0;
    const bp = b?.pinned ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return Number(new Date(b.date)) - Number(new Date(a.date));
  });

  return (
    <section className="newsIndex">
      <header className="card">
        <div className="sectionHead">
          <h1 className="h1">All news</h1>
          <p className="muted">All public blog posts from Local 279.</p>
        </div>
      </header>

      <section className="newsGrid" aria-label="All news posts">
        {sorted.map((p) => {
          const href = p.permalink || `/news/${p.id}`;
          const rawImg = p.thumbnailSrc || p.heroSrc || "";
          const img = rawImg ? normalizeSrc(rawImg) : "/l279-logo-blue.png";

          return (
            <Link key={p.id || href} to={href} className="newsCard">
              <div className="newsImgWrap">
                <img src={img} alt="" className="newsImg" loading="lazy" />
              </div>

              <div className="newsBody">
                <div className="newsTitleRow">
                  <div className="newsTitle">{p.title}</div>
                  {p.pinned ? <span className="badge">Pinned</span> : null}
                </div>

                <div className="newsMeta">
                  <span>{formatDate(p.date)}</span>
                  {p.author ? <span>· {p.author}</span> : null}
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </section>
  );
}
