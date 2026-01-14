import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { askCaAi, sendCaAiFeedback } from "../lib/ai";

export default function AskCaBox() {
  const { isSignedIn, getToken } = useAuth();

  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);

  const [qHash, setQHash] = useState("");
  const [fbLoading, setFbLoading] = useState(false);
  const [fbMsg, setFbMsg] = useState("");

  const onAsk = async () => {
    setFbMsg("");
    setQHash("");

    if (!isSignedIn) {
      setA("Please sign in to use the CA AI.");
      return;
    }

    const question = q.trim();
    if (!question) return;

    setLoading(true);
    setA("");

    try {
      const token = await getToken();
      const data = await askCaAi({ input: question, token });
      setA(data?.text || "(No answer returned)");
      setQHash(data?.q_hash || "");
    } catch (e) {
      setA(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setA("Voice input isn’t supported in this browser.");
      return;
    }
    try {
      const rec = new SR();
      rec.lang = "en-CA";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (e) => {
        const text = e.results?.[0]?.[0]?.transcript || "";
        if (text) setQ(text);
      };
      rec.onerror = (e) => setA(`Voice error: ${e?.error || "unknown"}`);
      rec.start();
    } catch (err) {
      setA(String(err?.message || err));
    }
  };

  const speakAnswer = () => {
    if (!a || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Speak only the summary (not the big quoted clause)
    const summary = a.split("\n\nQuoted clause(s):")[0] || a;

    const u = new SpeechSynthesisUtterance(summary);
    u.lang = "en-CA";
    window.speechSynthesis.speak(u);
  };

  const onFeedback = async (helpful) => {
    if (!isSignedIn) {
      setFbMsg("Sign in to leave feedback.");
      return;
    }
    if (!qHash) {
      setFbMsg("No answer id available for feedback.");
      return;
    }

    setFbLoading(true);
    setFbMsg("");

    try {
      const token = await getToken();
      const r = await sendCaAiFeedback({ q_hash: qHash, helpful, token });
      setFbMsg(`Thanks. (${r.up} 👍 / ${r.down} 👎)`);
    } catch (e) {
      setFbMsg(String(e?.message || e));
    } finally {
      setFbLoading(false);
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

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onAsk}
          disabled={loading || !q.trim()}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
          }}
        >
          {loading ? "Asking..." : "Ask AI"}
        </button>

        <button
          onClick={startVoice}
          title="Voice input"
          style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }}
        >
          🎙️
        </button>

        <button
          onClick={speakAnswer}
          title="Read answer"
          disabled={!a}
          style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.15)" }}
        >
          🔊
        </button>
      </div>

      {a && (
        <div
          tabIndex={0}
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: 12,
            borderRadius: 12,
            background: "rgba(0,0,0,0.03)",
            border: "1px solid rgba(0,0,0,0.08)",
            textAlign: "left",
            overscrollBehavior: "contain",
            touchAction: "pan-y",
          }}
        >
          <div
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {a}
          </div>
        </div>
      )}

      {a && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ opacity: 0.8 }}>Was this helpful?</span>
          <button
            onClick={() => onFeedback(true)}
            disabled={fbLoading || !qHash}
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}
          >
            👍 Yes
          </button>
          <button
            onClick={() => onFeedback(false)}
            disabled={fbLoading || !qHash}
            style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" }}
          >
            👎 No
          </button>
          {fbMsg && <span style={{ opacity: 0.8 }}>{fbMsg}</span>}
        </div>
      )}
    </section>
  );
}
