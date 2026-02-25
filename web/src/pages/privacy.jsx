// web/src/pages/privacy.jsx
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <section className="card privacyWrap">
      <header style={{ display: "grid", gap: 10 }}>
        <h1 className="h1">Privacy Policy</h1>
        <p className="muted">
          This page explains what information this site may collect, how it is
          used, and what choices you have. If you have questions or concerns,
          contact the Local 279 executive.
        </p>
      </header>

      <h2 className="h2">What we collect</h2>
      <ul className="pubList">
        <li>
          <b>Basic technical data:</b> Like most websites, our hosting provider
          may log your IP address, device/browser details, and general request
          data to keep the site secure and running.
        </li>
        <li>
          <b>Member sign in data:</b> If you sign into the Members Area,
          authentication is handled by Clerk. Clerk may collect and process sign
          in related information.
        </li>
        <li>
          <b>Contact form submissions:</b> If you send a message through a form,
          we receive the information you submit (for example your name, email,
          and message).
        </li>
        <li>
          <b>AI Q and A inputs:</b> If you use the Collective Agreement AI tool,
          your question and the tool’s response may be processed by our AI
          Worker to generate an answer. Do not include personal health
          information or other sensitive personal details in AI questions.
        </li>
      </ul>

      <h2 className="h2">How we use information</h2>
      <ul className="pubList">
        <li>
          To provide access to the Members Area and protect member only content.
        </li>
        <li>To respond to messages sent through the site.</li>
        <li>To improve usability, fix bugs, and keep the site secure.</li>
        <li>To provide Collective Agreement AI Q and A functionality.</li>
      </ul>

      <h2 className="h2">Cookies</h2>
      <p>
        The Members Area uses authentication cookies or similar browser storage
        to keep you signed in. We do not use cookies to sell your data.
      </p>

      <h2 className="h2">Third party services</h2>
      <p>This portal uses third party services to function:</p>
      <ul className="pubList">
        <li>
          <b>Clerk</b> for authentication.
        </li>
        <li>
          <b>Cloudflare</b> for hosting and for the Collective Agreement AI
          Worker.
        </li>
        <li>
          <b>OpenAI</b> via the AI Worker for generating responses to Collective
          Agreement questions.
        </li>
      </ul>

      <h2 className="h2">Caching and retention</h2>
      <p>
        The AI Worker may use caching to improve speed and reduce costs. Caching
        is intended for general question and answer content and should not store
        member specific or sensitive personal information.
      </p>

      <h2 className="h2">External links</h2>
      <p>
        This site links to external websites (for example opseu.org and
        government resources). When you follow those links, their privacy
        policies apply.
      </p>

      <div className="btnRow">
        <Link to="/about" className="btn">
          About Local 279
        </Link>
        <a
          href="https://opseu.org/about/"
          target="_blank"
          rel="noreferrer"
          className="btn"
        >
          OPSEU About
        </a>
      </div>
    </section>
  );
}
