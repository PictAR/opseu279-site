// web/src/pages/privacy.jsx

import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <section style={cardStyle}>
      <header style={{ display: "grid", gap: 10 }}>
        <h1 style={h1Style}>Privacy Policy</h1>
        <p style={leadStyle}>
          This page explains what information this site may collect, how it is used, and what choices you have.
          If you have questions or concerns, contact the Local 279 executive.
        </p>
      </header>

      <h2 style={h2Style}>What we collect</h2>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <b>Basic technical data:</b> Like most websites, our hosting provider may log your IP address, device/browser
          details, and general request data to keep the site secure and running.
        </li>
        <li style={liStyle}>
          <b>Member sign in data:</b> If you sign into the Members Area, authentication is handled by Clerk.
          Clerk may collect and process sign in related information.
        </li>
        <li style={liStyle}>
          <b>Contact form submissions:</b> If you send a message through a form, we receive the information you
          submit (for example your name, email, and message).
        </li>
        <li style={liStyle}>
          <b>AI Q and A inputs:</b> If you use the Collective Agreement AI tool, your question and the tool’s response
          may be processed by our AI Worker to generate an answer. Do not include personal health information or other
          sensitive personal details in AI questions.
        </li>
      </ul>

      <h2 style={h2Style}>How we use information</h2>
      <ul style={ulStyle}>
        <li style={liStyle}>To provide access to the Members Area and protect member only content.</li>
        <li style={liStyle}>To respond to messages sent through the site.</li>
        <li style={liStyle}>To improve usability, fix bugs, and keep the site secure.</li>
        <li style={liStyle}>To provide Collective Agreement AI Q and A functionality.</li>
      </ul>

      <h2 style={h2Style}>Cookies</h2>
      <p style={pStyle}>
        The Members Area uses authentication cookies or similar browser storage to keep you signed in.
        We do not use cookies to sell your data.
      </p>

      <h2 style={h2Style}>Third party services</h2>
      <p style={pStyle}>
        This portal uses third party services to function:
      </p>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <b>Clerk</b> for authentication.
        </li>
        <li style={liStyle}>
          <b>Cloudflare</b> for hosting and for the Collective Agreement AI Worker.
        </li>
        <li style={liStyle}>
          <b>OpenAI</b> via the AI Worker for generating responses to Collective Agreement questions.
        </li>
      </ul>

      <h2 style={h2Style}>Caching and retention</h2>
      <p style={pStyle}>
        The AI Worker may use caching to improve speed and reduce costs.
        Caching is intended for general question and answer content and should not store member specific or sensitive
        personal information.
      </p>

      <h2 style={h2Style}>External links</h2>
      <p style={pStyle}>
        This site links to external websites (for example opseu.org and government resources).
        When you follow those links, their privacy policies apply.
      </p>

      <div style={ctaRowStyle}>
        <Link to="/" style={linkPillStyle}>Back to Home</Link>
        <Link to="/about" style={linkPillStyle}>About Local 279</Link>
        <a
          href="https://opseu.org/about/"
          target="_blank"
          rel="noreferrer"
          style={linkPillStyle}
        >
          OPSEU About
        </a>
      </div>
    </section>
  );
}

const cardStyle = {
  width: "100%",
  maxWidth: 860,
  margin: "0 auto",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  display: "grid",
  gap: 12,
};

const h1Style = {
  margin: 0,
  fontSize: 26,
  fontWeight: 950,
  color: "#0055b8",
};

const leadStyle = {
  margin: 0,
  lineHeight: 1.6,
  fontSize: 15,
  opacity: 0.9,
};

const h2Style = {
  margin: "6px 0 0",
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

const ctaRowStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: 8,
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
