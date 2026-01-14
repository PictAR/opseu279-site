import { useNavigate } from "react-router-dom";

export default function BackButton({ fallback = "/members", label = "Back" }) {
  const navigate = useNavigate();

  const onBack = () => {
    // Try history first
    try {
      navigate(-1);
    } catch {
      navigate(fallback);
    }
    // If history is empty, navigate(-1) may do nothing in some cases,
    // so we also provide an explicit fallback button on layout.
  };

  return (
    <button
      type="button"
      onClick={onBack}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,0.15)",
        background: "rgba(255,255,255,0.7)",
        cursor: "pointer",
      }}
      aria-label={label}
      title={label}
    >
      ← {label}
    </button>
  );
}
