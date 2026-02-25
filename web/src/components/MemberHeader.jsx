export default function MemberHeader({ title, dark = false }) {
  const navigate = useNavigate();

  const fg = dark ? "#fff" : "#0b2b3a";
  const border = dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)";
  const bg = dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.7)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 950, color: fg }}>
        {title}
      </h1>
    </div>
  );
}
