// web/src/components/PublicPost.jsx

import { useState } from "react";
import ShareBar from "./ShareBar.jsx";

export default function PublicPost({
  post,
  variant = "full",
  showTags = false,
}) {
  const [shareOpen, setShareOpen] = useState(false);

  if (!post) return null;

  const permalink = post.permalink || `/news/${post.id}`;
  const shareUrl =
    typeof window !== "undefined"
      ? new URL(permalink, window.location.origin).toString()
      : permalink;

  return (
    <article style={articleStyle}>
      <header style={headerStyle}>
        <div style={thumbRowStyle}>
          {post.thumbnailSrc ? (
            <img
              src={post.thumbnailSrc}
              alt=""
              loading="lazy"
              style={thumbStyle}
            />
          ) : null}

          <div style={{ display: "grid", gap: 6 }}>
            <h1 style={titleStyle}>{post.title}</h1>
            <div style={metaStackStyle}>
              <div style={metaStyle}>{formatDate(post.date)}</div>
              {post.author ? (
                <div style={authorStyle}>{post.author}</div>
              ) : null}
            </div>
          </div>
        </div>

        {showTags && post.tags?.length ? (
          <div style={tagRowStyle} aria-label="Tags">
            {post.tags.map((t) => (
              <span key={t} style={tagStyle}>
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {/* Hero + hover reveal share (full view only) */}
      {post.heroSrc ? (
        variant === "full" ? (
          <div
            style={heroWrapStyle}
            className={`hero-reveal ${shareOpen ? "is-open" : ""}`}
          >
            <div className="hero-reveal__icons" aria-label="Share options">
              <div style={sharePanelInnerStyle}>
                <h2 style={shareTitleStyle}>Share</h2>
                <ShareBar
                  title={post.title}
                  text={post.shareText || post.summary || ""}
                  url={shareUrl}
                  layout="column"
                />
              </div>
            </div>

            <img
              src={post.heroSrc}
              alt=""
              loading="lazy"
              style={heroStyle}
              className="hero-reveal__img"
            />

            <button
              type="button"
              className="hero-reveal__toggle"
              onClick={() => setShareOpen((v) => !v)}
              aria-expanded={shareOpen}
              aria-label={
                shareOpen ? "Hide share options" : "Show share options"
              }
            >
              {shareOpen ? "Close" : "Share"}
            </button>
          </div>
        ) : (
          <div style={heroWrapStyle}>
            <img src={post.heroSrc} alt="" style={heroStyle} loading="lazy" />
          </div>
        )
      ) : null}

      {variant === "full" ? (
        <div style={bodyStyle}>{renderBlocks(post.content)}</div>
      ) : post.summary ? (
        <p style={summaryStyle}>{post.summary}</p>
      ) : null}

      {post.links?.length ? (
        <div style={linksWrapStyle}>
          {post.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noreferrer" : undefined}
              style={linkStyle}
            >
              {l.label}
            </a>
          ))}
        </div>
      ) : null}

      {/* Fallback share section if a post has no hero image */}
      {!post.heroSrc && variant === "full" ? (
        <div style={shareWrapStyle}>
          <h2 style={shareTitleStyle}>Share</h2>
          <ShareBar
            title={post.title}
            text={post.shareText || post.summary || ""}
            url={shareUrl}
          />
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
        <h2 key={idx} style={h2Style}>
          {b.text}
        </h2>
      );
    if (b.type === "p")
      return (
        <p key={idx} style={pStyle}>
          {b.text}
        </p>
      );
    if (b.type === "blockquote")
      return (
        <blockquote key={idx} style={quoteStyle}>
          {b.text}
        </blockquote>
      );
    if (b.type === "ul") {
      return (
        <ul key={idx} style={ulStyle}>
          {(b.items || []).map((it) => (
            <li key={it} style={liStyle}>
              {it}
            </li>
          ))}
        </ul>
      );
    }
    return null;
  });
}

const articleStyle = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  display: "grid",
  gap: 14,
};

const headerStyle = {
  display: "grid",
  gap: 12,
};

const thumbRowStyle = {
  display: "grid",
  gridTemplateColumns: "84px 1fr",
  gap: 12,
  alignItems: "center",
};

const thumbStyle = {
  width: 84,
  height: 84,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,85,184,0.04)",
  objectFit: "contain",
  padding: 8,
  boxSizing: "border-box",
};

const titleStyle = {
  margin: 0,
  fontSize: 22,
  lineHeight: 1.15,
  fontWeight: 950,
  color: "#0055b8",
};

const metaStyle = {
  fontSize: 13,
  opacity: 0.75,
};

const metaStackStyle = {
  display: "grid",
  gap: 2,
};

const authorStyle = {
  fontSize: 13,
  fontWeight: 800,
  opacity: 0.8,
};

const tagRowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const tagStyle = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(0,85,184,0.22)",
  background: "rgba(0,85,184,0.06)",
  color: "#0055b8",
  fontWeight: 900,
  fontSize: 12,
};

const heroWrapStyle = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,85,184,0.04)",
  padding: 12,
  boxSizing: "border-box",
};

const heroStyle = {
  width: "100%",
  height: "auto",
  display: "block",
  borderRadius: 10,
};

const bodyStyle = {
  display: "grid",
  gap: 10,
};

const summaryStyle = {
  margin: 0,
  lineHeight: 1.55,
  fontSize: 15,
  opacity: 0.95,
};

const linksWrapStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const linkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,85,184,0.25)",
  background: "rgba(0,85,184,0.10)",
  color: "#0055b8",
  fontWeight: 950,
  textDecoration: "none",
};

const shareWrapStyle = {
  borderTop: "1px solid rgba(0,0,0,0.06)",
  paddingTop: 14,
  display: "grid",
  gap: 10,
};

const shareTitleStyle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 950,
  color: "#0055b8",
};

const sharePanelInnerStyle = {
  width: "100%",
  display: "grid",
  gap: 8,
  justifyItems: "start",
};

const h2Style = {
  margin: "10px 0 0",
  fontSize: 18,
  fontWeight: 950,
  color: "#0055b8",
};

const pStyle = {
  margin: 0,
  lineHeight: 1.6,
  fontSize: 15,
};

const quoteStyle = {
  margin: 0,
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(0,85,184,0.20)",
  background: "rgba(0,85,184,0.06)",
  fontStyle: "italic",
  lineHeight: 1.55,
};

const ulStyle = {
  margin: 0,
  paddingLeft: 18,
  display: "grid",
  gap: 8,
};

const liStyle = {
  lineHeight: 1.5,
};
