import { useNavigate } from "react-router-dom";

export default function MemberHeader({ title, backTo = "/member", dark = false }) {
  const navigate = useNavigate();

  const fg = dark ? "#fff" : "#0b2b3a";
  const border = dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)";
  const bg = dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.7)";

  const onBack = () => {
    // Use history if possible, fallback to members home
    if (window.history.length > 1) navigate(-1);
    else navigate(backTo);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          padding: "8px 10px",
          borderRadius: 10,
          border: `1px solid ${border}`,
          background: bg,
          color: fg,
          cursor: "pointer",
          fontWeight: 800,
        }}
        aria-label="Back"
        title="Back"
      >
        ← Back
      </button>

      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 950, color: fg }}>
        {title}
      </h1>
    </div>
  );
}
