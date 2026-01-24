import { useState } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xzddqyzn";

export default function PublicContact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section style={wrapStyle}>
      <header style={heroStyle}>
        <h1 style={h1Style}>Contact Local 279</h1>
        <p style={leadStyle}>
          This form goes directly to the Local 279 inbox via Formspree.
        </p>
      </header>

      <section style={cardStyle}>
        {!submitted ? (
          <form
            action={FORMSPREE_ENDPOINT}
            method="POST"
            style={formStyle}
            onSubmit={() => setSubmitted(true)}
          >
            {/* Honeypot spam trap. Bots fill it, humans do not. */}
            <input
              type="text"
              name="_gotcha"
              tabIndex="-1"
              autoComplete="off"
              style={honeypotStyle}
              aria-hidden="true"
            />
            {/* Formspree uses a field named "email" to set Reply-To. */}
            <label style={labelStyle}>
              Your email
              <input
                name="email"
                type="email"
                required
                style={inputStyle}
                placeholder="you@example.com"
              />
            </label>

            <label style={labelStyle}>
              Your name
              <input
                name="name"
                type="text"
                required
                style={inputStyle}
                placeholder="First and last name"
              />
            </label>

            <label style={labelStyle}>
              Subject
              <input
                name="subject"
                type="text"
                required
                style={inputStyle}
                placeholder="What is this about?"
              />
            </label>

            <label style={labelStyle}>
              Message
              <textarea
                name="message"
                required
                rows={6}
                style={textareaStyle}
                placeholder="Write your message here…"
              />
            </label>

            <button type="submit" style={primaryBtnStyle}>
              Send message
            </button>

            <p style={finePrintStyle}>
              Please avoid including personal health information.
            </p>
          </form>
        ) : (
          <div style={thanksStyle}>
            <h2 style={h2Style}>Sent</h2>
            <p style={pStyle}>
              If you do not hear back within a reasonable time, follow up via
              your usual union channel.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}

const wrapStyle = {
  width: "100%",
  maxWidth: 820,
  margin: "0 auto",
  display: "grid",
  gap: 14,
};

const heroStyle = {
  borderRadius: 18,
  border: "1px solid rgba(0,0,0,0.08)",
  padding: 18,
  background:
    "linear-gradient(135deg, rgba(0,85,184,0.10), rgba(0,85,184,0.02))",
};

const cardStyle = {
  background: "#fff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
};

const formStyle = { display: "grid", gap: 12 };

const honeypotStyle = {
  position: "absolute",
  left: "-9999px",
  height: 0,
  width: 0,
  opacity: 0,
};

const labelStyle = {
  display: "grid",
  gap: 6,
  fontWeight: 800,
  color: "rgba(0,0,0,0.78)",
};

const inputStyle = {
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  padding: "12px 12px",
  fontSize: 15,
  outline: "none",
};

const textareaStyle = { ...inputStyle, resize: "vertical" };

const primaryBtnStyle = {
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#0055b8",
  color: "#fff",
  padding: "12px 14px",
  fontWeight: 950,
  cursor: "pointer",
};

const h1Style = {
  margin: 0,
  fontSize: 30,
  lineHeight: 1.1,
  fontWeight: 950,
  color: "#0055b8",
};
const leadStyle = {
  margin: "8px 0 0 0",
  lineHeight: 1.6,
  fontSize: 15,
  opacity: 0.92,
};
const h2Style = { margin: 0, fontSize: 18, fontWeight: 950, color: "#0055b8" };
const pStyle = { margin: 0, lineHeight: 1.6, fontSize: 15 };
const finePrintStyle = { margin: 0, fontSize: 13, opacity: 0.75 };
const thanksStyle = { display: "grid", gap: 8 };
