// web/src/pages/news-post.jsx

import { useParams, Link } from "react-router-dom";
import PublicPost from "../components/PublicPost.jsx";
import { POSTS } from "../data/posts.js";

export default function NewsPost() {
  const { id } = useParams();
  const post = POSTS.find((p) => p.id === id);

  if (!post) {
    return (
      <section style={cardStyle}>
        <h2 style={h2Style}>Post not found</h2>
        <p style={pStyle}>
          That article doesn’t exist. Head back to the{" "}
          <Link to="/" style={linkStyle}>home page</Link>.
        </p>
      </section>
    );
  }

  return <PublicPost post={post} variant="full" />;
}

const cardStyle = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
};

const h2Style = {
  margin: "0 0 8px",
  fontSize: 18,
  fontWeight: 950,
  color: "#0055b8",
};

const pStyle = {
  margin: 0,
  lineHeight: 1.5,
  fontSize: 15,
};

const linkStyle = {
  color: "#0055b8",
  fontWeight: 900,
  textDecoration: "none",
};
