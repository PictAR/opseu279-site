import { useMemo, useState } from "react";
import { CONTACTS, GROUPS } from "../data/contacts";

const UNION_INBOX = "tristanbritt@gmail.com"; // change to whatever you want as the catch-all

export default function contact() {
  const [group, setGroup] = useState(GROUPS[0]);
  const [personEmail, setPersonEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");

  const people = useMemo(
    () => CONTACTS.filter((c) => c.group === group),
    [group]
  );

  // keep selected person valid when group changes
  const selectedPerson = useMemo(() => {
    return people.find((p) => p.email === personEmail) || null;
  }, [people, personEmail]);

  function buildMailto() {
    const to = UNION_INBOX;

    // optional cc to the selected person (if they have an email)
    const cc = selectedPerson?.email ? selectedPerson.email : "";

    const lines = [
      `Group: ${group}`,
      `To: ${selectedPerson ? `${selectedPerson.name} (${selectedPerson.role})` : "General"}`,
      "",
      `From name: ${fromName || "(not provided)"}`,
      `From email: ${fromEmail || "(not provided)"}`,
      "",
      "Message:",
      message || "(no message)",
    ];

    const params = new URLSearchParams();
    if (cc) params.set("cc", cc);
    params.set("subject", subject || `OPSEU 279 Contact Request (${group})`);
    params.set("body", lines.join("\n"));

    return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
  }

  function onSubmit(e) {
    e.preventDefault();

    if (!message.trim()) {
      alert("Add a message so we know what you need.");
      return;
    }

    window.location.href = buildMailto();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0e6ea6",
        display: "grid",
        placeItems: "center",
        padding: 24,
        color: "#fff",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        <h1 style={{ margin: "0 0 12px", fontSize: 22 }}>Contact Your Union</h1>
        <p style={{ margin: "0 0 18px", opacity: 0.9 }}>
          Pick a group and person. This will open your email app with everything pre-filled.
        </p>

        <form
          onSubmit={onSubmit}
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.20)",
            borderRadius: 16,
            padding: 16,
            display: "grid",
            gap: 12,
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Who is this for?</span>
            <select
              value={group}
              onChange={(e) => {
                setGroup(e.target.value);
                setPersonEmail("");
              }}
              style={inputStyle}
            >
              {GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Select a person (optional)</span>
            <select
              value={personEmail}
              onChange={(e) => setPersonEmail(e.target.value)}
              style={inputStyle}
            >
              <option value="">General / Not sure</option>
              {people.map((p) => (
                <option key={p.email} value={p.email}>
                  {p.name} — {p.role}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Your name (optional)</span>
            <input
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Jane Doe"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Your email (optional)</span>
            <input
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="jane@email.com"
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Subject (optional)</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={`OPSEU 279 request (${group})`}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do you need help with?"
              rows={6}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </label>

          <button type="submit" style={buttonStyle}>
            Create Email
          </button>

          <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
            Next upgrade: submit directly on the site (no email app) using a Cloudflare Worker.
          </p>
        </form>

        <a href="/" style={{ color: "#fff", opacity: 0.9, display: "inline-block", marginTop: 14 }}>
          ← Back to home
        </a>
      </div>
    </main>
  );
}

const inputStyle = {
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.10)",
  color: "#fff",
  outline: "none",
};

const buttonStyle = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.35)",
  background: "rgba(255,255,255,0.14)",
  color: "#fff",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
};
