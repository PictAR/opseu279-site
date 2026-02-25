// web/src/components/PublicPost.jsx
import { useMemo } from "react";
import ShareBar from "./ShareBar.jsx";
import "../styles/publicPost.css";

function normalizePublicSrc(src) {
  if (!src) return "";
  let s = String(src).trim();
  if (s.startsWith("public/")) s = s.slice("public/".length);
  if (!s.startsWith("/")) s = `/${s}`;
  return s;
}

export default function PublicPost({
  post,
  variant = "full",
  showTags = false,
}) {
  if (!post) return null;

  const permalink = post.permalink || `/news/${post.id}`;
  const shareUrl =
    typeof window !== "undefined"
      ? new URL(permalink, window.location.origin).toString()
      : permalink;

  const thumbSrc = normalizePublicSrc(post.thumbnailSrc);
  const heroSrc = normalizePublicSrc(post.heroSrc);

  const shareText = useMemo(() => post.shareText || post.summary || "", [post]);

  return (
    <article className="pp">
      <header className="ppHeader">
        <div className="ppThumbRow">
          {thumbSrc ? (
            <img src={thumbSrc} alt="" loading="lazy" className="ppThumb" />
          ) : null}

          <div className="ppHeadText">
            <h1 className="ppTitle">{post.title}</h1>
            <div className="ppMetaStack">
              <div className="ppMeta">{formatDate(post.date)}</div>
              {post.author ? (
                <div className="ppAuthor">{post.author}</div>
              ) : null}
            </div>
          </div>
        </div>

        {showTags && post.tags?.length ? (
          <div className="ppTags" aria-label="Tags">
            {post.tags.map((t) => (
              <span key={t} className="ppTag">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {/* FULL post: single banner + share row ABOVE body */}
      {variant === "full" ? (
        <div className="ppHeroStage">
          {heroSrc ? (
            <div className="ppHeroBanner" aria-label="Article image">
              <img src={heroSrc} alt="" loading="lazy" className="ppHeroImg" />
            </div>
          ) : null}

          <div className="ppShareTop" aria-label="Share options">
            <ShareBar
              title={post.title}
              text={shareText}
              url={shareUrl}
              layout="row"
            />
          </div>
        </div>
      ) : heroSrc ? (
        <div className="ppHeroWrap">
          <img src={heroSrc} alt="" className="ppHeroImgPlain" loading="lazy" />
        </div>
      ) : null}

      {variant === "full" ? (
        <div className="ppBody">{renderBlocks(post.content)}</div>
      ) : post.summary ? (
        <p className="ppSummary">{post.summary}</p>
      ) : null}

      {post.links?.length ? (
        <div className="ppLinks">
          {post.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noreferrer" : undefined}
              className="ppLink"
            >
              {l.label}
            </a>
          ))}
        </div>
      ) : null}
    </article>
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

function renderBlocks(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return null;

  return blocks.map((b, idx) => {
    if (!b) return null;
    if (b.type === "h2")
      return (
        <h2 key={idx} className="ppH2">
          {b.text}
        </h2>
      );
    if (b.type === "p")
      return (
        <p key={idx} className="ppP">
          {b.text}
        </p>
      );
    if (b.type === "blockquote")
      return (
        <blockquote key={idx} className="ppQuote">
          {b.text}
        </blockquote>
      );
    if (b.type === "ul")
      return (
        <ul key={idx} className="ppUl">
          {(b.items || []).map((it) => (
            <li key={it} className="ppLi">
              {it}
            </li>
          ))}
        </ul>
      );
    return null;
  });
}
