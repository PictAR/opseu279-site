import { useMemo, useState } from "react";
import MemberHeader from "../components/MemberHeader";

// CURRENT / ACTIVE EXECUTIVE MEMBERS + ROLES + CONTACT EMAIL
const EXEC = [
  { name: "President", email: "tristanbritt@gmail.com.com" },
  { name: "Vice President", email: "dostal.carol@hotmail.com" },
  { name: "Secretary", email: "jennhancock74@gmail.com" },
  { name: "Treasurer", email: "devonlansdell@gmail.com" },
  { name: "Steward", email: "michael.basha.9@gmail.com" },
  { name: "Steward", email: "rach_beck_@hotmail.com" },
];

function encodeMailto({ to, cc, bcc, subject, body }) {
  const params = new URLSearchParams();
  if (cc?.length) params.set("cc", cc.join(","));
  if (bcc?.length) params.set("bcc", bcc.join(","));
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}

export default function Contact() {
  const [toEmail, setToEmail] = useState(EXEC[0]?.email || "");
  const [cc, setCc] = useState([]);
  const [bcc, setBcc] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const options = useMemo(
    () => EXEC.map((x) => ({ label: `${x.name} (${x.email})`, value: x.email })),
    []
  );

  const toggle = (list, setList, value) => {
    setList((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const mailto = useMemo(() => {
    if (!toEmail) return "";
    return encodeMailto({
      to: toEmail,
      cc,
      bcc,
      subject: subject.trim(),
      body: message.trim(),
    });
  }, [toEmail, cc, bcc, subject, message]);

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <MemberHeader title="Contact Executive and Committees" />

      <p style={{ margin: 0, opacity: 0.85, lineHeight: 1.5 }}>
        This opens your email app with To, CC, and BCC filled in.
      </p>

      <label style={labelStyle}>
        <div style={labelTitleStyle}>To</div>
        <select
          value={toEmail}
          onChange={(e) => setToEmail(e.target.value)}
          style={inputStyle}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={labelTitleStyle}>CC</div>
        <div style={{ display: "grid", gap: 8 }}>
          {options.map((o) => (
            <label key={`cc-${o.value}`} style={checkRowStyle}>
              <input
                type="checkbox"
                checked={cc.includes(o.value)}
                onChange={() => toggle(cc, setCc, o.value)}
                disabled={o.value === toEmail}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={labelTitleStyle}>BCC</div>
        <div style={{ display: "grid", gap: 8 }}>
          {options.map((o) => (
            <label key={`bcc-${o.value}`} style={checkRowStyle}>
              <input
                type="checkbox"
                checked={bcc.includes(o.value)}
                onChange={() => toggle(bcc, setBcc, o.value)}
                disabled={o.value === toEmail}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </div>

      <label style={labelStyle}>
        <div style={labelTitleStyle}>Subject</div>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject..."
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        <div style={labelTitleStyle}>Message</div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message..."
          rows={8}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </label>

      <a
        href={mailto || "#"}
        onClick={(e) => {
          if (!mailto) e.preventDefault();
        }}
        style={{
          textDecoration: "none",
          textAlign: "center",
          padding: "12px 12px",
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.15)",
          background: "rgba(0,85,184,0.10)",
          color: "#0055b8",
          fontWeight: 950,
          opacity: mailto ? 1 : 0.5,
          pointerEvents: mailto ? "auto" : "none",
        }}
      >
        Open Email
      </a>
    </section>
  );
}

const labelStyle = { display: "grid", gap: 6 };
const labelTitleStyle = { fontWeight: 950, color: "#0055b8" };

const inputStyle = {
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "rgba(255,255,255,0.9)",
};

const checkRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: 8,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "rgba(0,85,184,0.05)",
};
