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
      <div style={{ fontWeight: 800, color: "#0055b8" }}>{title}</div>
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
        color: "#0b2b3a",
        padding: 10,
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.10)",
        display: "grid",
        gap: 4,
        background: "rgba(255,255,255,0.55)",
      }}
    >
      <div style={{ fontWeight: 900, color: "#0055b8" }}>{label}</div>
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
        color: "#0b2b3a",
        padding: 10,
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.10)",
        display: "grid",
        gap: 4,
        background: "rgba(255,255,255,0.55)",
      }}
    >
      <div style={{ fontWeight: 900, color: "#0055b8" }}>{label}</div>
      {sub ? <div style={{ fontSize: 12, opacity: 0.75 }}>{sub}</div> : null}
    </a>
  );
}

export default function MembersHome() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Card title="Collective Agreement and Pay">
        <RowLink
          to="/members/collective-agreement"
          label="Collective Agreement Library"
          sub="PDF library plus the CA AI Q and A at the top of the page"
        />
        <RowLink
          to="/members/wages-benefits"
          label="Wages and Benefits"
          sub="Rates, grids, and benefits info"
        />
      </Card>

      <Card title="Member Tools">
        <RowLink
          to="/members/take-action"
          label="Take Action"
          sub="Contact elected officials and access action tools"
        />
        <RowLink
          to="/members/contact"
          label="Contact Executive and Committees"
          sub="Send an email with To, CC, and BCC from one screen"
        />
        <RowLink to="/members/profile" label="My Profile" sub="Start date, classification, school" />
      </Card>

      <Card title="Support and Info">
        <RowLink
          to="/members/documents"
          label="Documents and Standards"
          sub="Guides, standards, and reference documents"
        />
        <RowLink
          to="/members/peer-support"
          label="Peer Support"
          sub="Support resources and contacts"
        />
        <RowLink to="/members/faq" label="FAQ" sub="Common questions and quick answers" />
        <RowLink
          to="/members/discounts"
          label="Member Discounts"
          sub="Discounts for OPSEU members"
        />
      </Card>

      <Card title="Seniority">
        <RowLink to="/members/seniority" label="Seniority Lists" sub="Past and present lists" />
      </Card>

      <Card title="External Resources">
        <ExternalLink
          href="https://www.ontario.ca/laws/"
          label="Ontario E Laws"
          sub="Official Ontario legislation lookup"
        />
        <ExternalLink
          href="https://www.lr.labour.gov.on.ca/en-CA/Collective-Agreements/"
          label="Collective Agreement Lookup"
          sub="Ontario Ministry searchable CA database"
        />
      </Card>
    </div>
  );
}
