// web/src/pages/news-post.jsx
import { useParams, Link } from "react-router-dom";
import PublicPost from "../components/PublicPost.jsx";
import { PUBLIC_POSTS } from "../data/posts.js";

export default function NewsPost() {
  const { id } = useParams();
  const post = PUBLIC_POSTS.find((p) => p.id === id);

  if (!post) {
    return (
      <section className="postRead">
        <section className="card">
          <h2 className="h2">Post not found</h2>
          <p className="muted">
            That article doesn’t exist. Head back to the{" "}
            <Link to="/" className="postBackLink">
              home page
            </Link>
            .
          </p>
        </section>
      </section>
    );
  }

  return (
    <section className="postRead">
      <PublicPost post={post} variant="full" />
    </section>
  );
}
