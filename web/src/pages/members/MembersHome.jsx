import { Link } from "react-router-dom";

function Card({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 14,
        padding: 14,
        background: "rgba(255,255,255,0.6)",
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 700 }}>{title}</div>
      {children}
    </div>
  );
}

function RowLink({ to, label, sub }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: "inherit",
        padding: 10,
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.10)",
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontWeight: 600 }}>{label}</div>
      {sub ? <div style={{ fontSize: 12, opacity: 0.75 }}>{sub}</div> : null}
    </Link>
  );
}

function ExternalLink({ href, label, sub }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        textDecoration: "none",
        color: "inherit",
        padding: 10,
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.10)",
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontWeight: 600 }}>{label}</div>
      {sub ? <div style={{ fontSize: 12, opacity: 0.75 }}>{sub}</div> : null}
    </a>
  );
}

export default function MembersHome() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Card title="Collective Agreement, Wages, Benefits">
        {/* Adjust these routes to your existing pages if needed */}
        <RowLink to="/members/collective-agreement" label="Collective Agreement" sub="View the agreement" />
        <RowLink to="/members/wages-benefits" label="Wages and Benefits" sub="Rates, grids, and benefit info" />
        <RowLink to="/members/ca-ai" label="CA AI Q and A" sub="Ask questions and get cited clauses" />
      </Card>

      <Card title="Seniority Lists">
        <RowLink to="/members/seniority" label="View Seniority Lists" sub="Past and present lists" />
      </Card>

      <Card title="Resources">
        <ExternalLink
          href="https://www.ontario.ca/laws/"
          label="Ontario E Laws"
          sub="Official Ontario legislation lookup"
        />
        <ExternalLink
          href="https://www.lr.labour.gov.on.ca/en-CA/Collective-Agreements/"
          label="Ontario Collective Agreement Lookup"
          sub="Ministry searchable CA database"
        />
      </Card>

      <Card title="Contact Executive">
        <RowLink to="/members/contact" label="Contact Form" sub="Send to To, CC, BCC from one screen" />
      </Card>
    </div>
  );
}
