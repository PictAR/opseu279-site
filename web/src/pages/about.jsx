// web/src/pages/about.jsx

import { useState } from "react";
import { Link } from "react-router-dom";

const EXECUTIVE = [
  { role: "President", name: "Tristan Britt" },
  { role: "Vice President", name: "Carol Dostal" },
  { role: "Secretary", name: "Jenn Hancock" },
  { role: "Treasurer", name: "Devon Lansdell" },
  { role: "Steward", name: "Mike Basha" },
  { role: "Steward", name: "Rachel Porter" },
];

const HERO_SRC = "/about/opseu_about_main.jpeg";

export default function About() {
  const [heroOk, setHeroOk] = useState(true);

  return (
    <section style={wrapStyle}>
      <style>{`
        @media (max-width: 720px) {
          .about-hero {
            grid-template-columns: 1fr;
          }
          .about-hero-media {
            order: -1;
          }
        }
      `}</style>
      {/* Hero */}
      <header style={heroStyle} className="about-hero">
        <div style={heroTextWrapStyle}>
          <h1 style={h1Style}>Who is OPSEU Local 279</h1>
          <p style={leadStyle}>
            Local 279 is the OPSEU/SEFPO local for Norfolk County paramedics. We
            represent members in the workplace, enforce the collective
            agreement, and push for safe, fair, and consistent working
            conditions.
          </p>

          <div style={ctaRowStyle}>
            <Link to="/" style={linkPillStyle}>
              Back to Home
            </Link>
            <Link to="/privacy" style={linkPillStyle}>
              Privacy Policy
            </Link>
            <Link to="/members" style={primaryPillStyle}>
              Members Area
            </Link>
          </div>
        </div>

        <div
          style={heroMediaWrapStyle}
          className="about-hero-media"
          aria-hidden="true"
        >
          {/* If the optional hero image is missing, we hide it and show the logo card instead. */}
          {heroOk ? (
            <img
              src={HERO_SRC}
              alt="OPSEU Local 279"
              loading="lazy"
              style={heroImgStyle}
              onError={() => setHeroOk(false)}
            />
          ) : (
            <div style={logoCardStyle}>
              <img
                src="/about/opseu_about_main.jpeg"
                alt="OPSEU Local 279"
                style={logoImgStyle}
                loading="lazy"
              />
            </div>
          )}
        </div>
      </header>

      {/* Content cards */}
      <section style={cardStyle}>
        <h2 style={h2Style}>What we do</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            Collective bargaining and contract enforcement.
          </li>
          <li style={liStyle}>
            Representation and support when workplace issues come up.
          </li>
          <li style={liStyle}>
            Health and safety advocacy, including follow up on base and
            operational concerns.
          </li>
          <li style={liStyle}>
            Member communication, education, and local specific resources.
          </li>
        </ul>
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>What this site is</h2>
        <p style={pStyle}>
          This public site is a simple landing page for updates, links, and
          basic information. The secure Member Portal (sign in required) is
          where Local 279 members access local documents, our collective
          agreement library, and tools like wage comparisons and the Collective
          Agreement AI Q and A.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Executive</h2>
        <p style={pStyle}>
          Local 279 is run by elected members. The executive below is the first
          point of contact for member support and local union business.
        </p>

        <details style={detailsStyle}>
          <summary style={summaryStyle}>Show executive list</summary>
          <div style={detailsBodyStyle}>
            <ul style={ulStyle}>
              {EXECUTIVE.map((p) => (
                <li key={p.role} style={liStyle}>
                  <b>{p.role}:</b> {p.name}
                </li>
              ))}
            </ul>
          </div>
        </details>
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Learn more about OPSEU/SEFPO</h2>
        <p style={pStyle}>
          Local 279 is part of OPSEU/SEFPO. For broader information about the
          union, history, constitution, and governance, visit OPSEU/SEFPO’s
          About page.
        </p>
        <a
          href="https://opseu.org/about/"
          target="_blank"
          rel="noreferrer"
          style={externalLinkStyle}
        >
          OPSEU/SEFPO About
        </a>
      </section>
    </section>
  );
}

const wrapStyle = {
  width: "100%",
  maxWidth: 980,
  margin: "0 auto",
  display: "grid",
  gap: 14,
};

const heroStyle = {
  width: "100%",
  borderRadius: 18,
  border: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  padding: 18,
  boxSizing: "border-box",
  background:
    "linear-gradient(135deg, rgba(0,85,184,0.10), rgba(0,85,184,0.02))",
  display: "grid",
  gap: 16,
  gridTemplateColumns: "1.3fr 0.7fr",
  alignItems: "center",
};

const heroTextWrapStyle = {
  display: "grid",
  gap: 10,
};

const heroMediaWrapStyle = {
  width: "100%",
};

const heroImgStyle = {
  width: "100%",
  height: "auto",
  display: "block",
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.7)",
  objectFit: "cover",
};

const logoCardStyle = {
  width: "100%",
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.7)",
  padding: 14,
  boxSizing: "border-box",
  display: "grid",
  gap: 10,
  alignItems: "center",
  justifyItems: "center",
};

const logoImgStyle = {
  width: "min(240px, 100%)",
  height: "auto",
  display: "block",
};

const h1Style = {
  margin: 0,
  fontSize: 30,
  lineHeight: 1.1,
  fontWeight: 950,
  color: "#0055b8",
};

const leadStyle = {
  margin: 0,
  lineHeight: 1.65,
  fontSize: 15,
  opacity: 0.92,
};

const ctaRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 2,
};

const linkPillStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,85,184,0.25)",
  background: "rgba(0,85,184,0.08)",
  color: "#0055b8",
  fontWeight: 950,
  textDecoration: "none",
};

const primaryPillStyle = {
  ...linkPillStyle,
  background: "#0055b8",
  color: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
};

const cardStyle = {
  width: "100%",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  display: "grid",
  gap: 10,
  boxSizing: "border-box",
};

const h2Style = {
  margin: 0,
  fontSize: 18,
  fontWeight: 950,
  color: "#0055b8",
};

const pStyle = {
  margin: 0,
  lineHeight: 1.6,
  fontSize: 15,
};

const ulStyle = {
  margin: 0,
  paddingLeft: 18,
  display: "grid",
  gap: 8,
};

const liStyle = {
  lineHeight: 1.55,
  fontSize: 15,
};

const detailsStyle = {
  marginTop: 2,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,85,184,0.03)",
  padding: 10,
};

const summaryStyle = {
  cursor: "pointer",
  fontWeight: 950,
  color: "#0055b8",
};

const detailsBodyStyle = {
  marginTop: 10,
};

const externalLinkStyle = {
  ...linkPillStyle,
  width: "fit-content",
};
