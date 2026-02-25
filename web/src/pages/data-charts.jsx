// web/src/pages/data-charts.jsx
import "../styles/dataCharts.css";
import WageComparisonChart from "../components/WageComparisonChart.jsx";

export default function DataCharts() {
  return (
    <section className="dcPage">
      <h1 className="dcTitle">Data &amp; Charts</h1>

      <p className="dcLead">
        Interactive comparisons and charts for Local 279 members.
      </p>

      <WageComparisonChart />
    </section>
  );
}
