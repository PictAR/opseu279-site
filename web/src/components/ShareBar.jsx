// web/src/components/ShareBar.jsx
import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faCopy,
  faCheck,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import {
  faXTwitter,
  faFacebook,
  faInstagram,
  faThreads,
} from "@fortawesome/free-brands-svg-icons";

export default function ShareBar({
  title = "",
  text = "",
  url = "",
  layout = "row", // "row" | "column"
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (url) return url;
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, [url]);

  const shareText = useMemo(() => {
    const t = (text || "").trim();
    return t ? t : title;
  }, [text, title]);

  const items = useMemo(() => {
    const u = encodeURIComponent(shareUrl);
    const t = encodeURIComponent(shareText);

    return [
      {
        key: "x",
        label: "Share on X",
        icon: faXTwitter,
        href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`,
      },
      {
        key: "fb",
        label: "Share on Facebook",
        icon: faFacebook,
        href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      },
      {
        key: "threads",
        label: "Open Threads",
        icon: faThreads,
        href: `https://www.threads.net/`,
      },
      {
        key: "ig",
        label: "Open Instagram",
        icon: faInstagram,
        href: `https://www.instagram.com/`,
      },
      {
        key: "email",
        label: "Share by email",
        icon: faEnvelope,
        href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
          `${shareText}\n\n${shareUrl}`,
        )}`,
      },
    ];
  }, [shareUrl, shareText, title]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  }

  const isColumn = layout === "column";

  return (
    <div style={isColumn ? wrapColStyle : wrapRowStyle} aria-label="Share">
      {items.map((it) => (
        <a
          key={it.key}
          href={it.href}
          target="_blank"
          rel="noreferrer"
          style={isColumn ? iconBtnColStyle : iconBtnRowStyle}
          title={it.label}
          aria-label={it.label}
        >
          <FontAwesomeIcon icon={it.icon} />
        </a>
      ))}

      <button
        type="button"
        onClick={onCopy}
        style={isColumn ? iconBtnColStyle : iconBtnRowStyle}
        title={copied ? "Copied" : "Copy link"}
        aria-label={copied ? "Copied" : "Copy link"}
      >
        <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
      </button>

      {!isColumn ? (
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          style={iconBtnRowStyle}
          title="Open link"
          aria-label="Open link"
        >
          <FontAwesomeIcon icon={faLink} />
        </a>
      ) : null}
    </div>
  );
}

const wrapRowStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
};

const wrapColStyle = {
  display: "grid",
  gap: 10,
  alignItems: "start",
  justifyItems: "start",
};

const baseBtn = {
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(255,255,255,0.85)",
  borderRadius: 14,
  width: 44,
  height: 44,
  cursor: "pointer",
  fontSize: 18,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#0055b8",
  textDecoration: "none",
};

const iconBtnRowStyle = {
  ...baseBtn,
};

const iconBtnColStyle = {
  ...baseBtn,
};
