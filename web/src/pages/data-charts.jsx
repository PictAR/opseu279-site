// web/src/pages/data-charts.jsx
import WageComparisonChart from "../components/WageComparisonChart.jsx";

export default function DataCharts() {
  return (
    <section style={{ display: "grid", gap: 12 }}>
      <h1
        style={{ margin: 0, fontSize: 20, fontWeight: 950, color: "#0055b8" }}
      >
        Data & Charts
      </h1>

      <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.5 }}>
        Interactive comparisons and charts for Local 279 members.
      </p>

      <WageComparisonChart />
    </section>
  );
}
