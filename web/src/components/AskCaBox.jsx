import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { askCaAi } from "../lib/ai";

export default function AskCaBox() {
  const { isSignedIn, getToken } = useAuth();
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);

  const onAsk = async () => {
    if (!isSignedIn) {
      setA("Please sign in to use the CA AI.");
      return;
    }

    const question = q.trim();
    if (!question) return;

    setLoading(true);
    setA("");

    try {
      const token = await getToken(); // fresh session token
      const text = await askCaAi({ input: question, token });
      setA(text || "(No answer returned)");
    } catch (e) {
      setA(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ display: "grid", gap: 10 }}>
      <textarea
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ask a question about the collective agreement..."
        rows={4}
        style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }}
      />
      <button
        onClick={onAsk}
        disabled={loading || !q.trim()}
        style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }}
      >
        {loading ? "Asking..." : "Ask AI"}
      </button>

      {a && (
        <pre style={{ whiteSpace: "pre-wrap", margin: 0, padding: 12, borderRadius: 12, background: "rgba(0,0,0,0.03)" }}>
          {a}
        </pre>
      )}
    </section>
  );
}
