import WageComparisonChart from "../components/WageComparisonChart.jsx";

export default function Wages() {
  return (
    <section style={{ display: "grid", gap: 14 }}>
      <h1 style={{ margin: 0, fontSize: 20, fontWeight: 950, color: "#0055b8" }}>
        Wages and Benefits
      </h1>

      <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.5 }}>
        Wage comparisons across surrounding services. Starting with PCP top rate.
      </p>

      <section style={cardStyle}>
        <WageComparisonChart />
      </section>
    </section>
  );
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
