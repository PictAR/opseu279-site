import { useMemo, useState } from "react";
import MemberHeader from "../components/MemberHeader";

const EXEC = [
  { name: "President", email: "tristanbritt@gmail.com" },
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

function Chip({ text, onRemove }) {
  return (
    <button type="button" onClick={onRemove} style={chipStyle} title="Remove">
      {text} <span style={{ opacity: 0.7 }}>×</span>
    </button>
  );
}

export default function Contact() {
  const [toEmail, setToEmail] = useState(EXEC[0]?.email || "");
  const [cc, setCc] = useState([]);
  const [bcc, setBcc] = useState([]);
  const [ccPick, setCcPick] = useState("");
  const [bccPick, setBccPick] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function onToChange(nextEmail) {
    setToEmail(nextEmail);
    setCc((prev) => prev.filter((x) => x !== nextEmail));
    setBcc((prev) => prev.filter((x) => x !== nextEmail));
    setCcPick("");
    setBccPick("");
  }

  const options = useMemo(
    () =>
      EXEC.map((x) => ({
        label: `${x.name} (${x.email})`,
        value: x.email,
        name: x.name,
      })),
    [],
  );

  const availableCc = useMemo(
    () => options.filter((o) => o.value !== toEmail && !cc.includes(o.value)),
    [options, toEmail, cc],
  );

  const availableBcc = useMemo(
    () => options.filter((o) => o.value !== toEmail && !bcc.includes(o.value)),
    [options, toEmail, bcc],
  );

  const toLabel = useMemo(() => {
    const found = options.find((o) => o.value === toEmail);
    return found ? found.label : toEmail;
  }, [options, toEmail]);

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

  function addCc() {
    if (!ccPick) return;
    setCc((prev) => (prev.includes(ccPick) ? prev : [...prev, ccPick]));
    setCcPick("");
  }

  function addBcc() {
    if (!bccPick) return;
    setBcc((prev) => (prev.includes(bccPick) ? prev : [...prev, bccPick]));
    setBccPick("");
  }

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <MemberHeader title="Contact Executive and Committees" />

      <div style={cardStyle}>
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={labelTitleStyle}>To</div>
            <select
              value={toEmail}
              onChange={(e) => onToChange(e.target.value)}
              style={inputStyle}
            >
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Selected: {toLabel}
            </div>
          </div>

          <div style={twoColStyle}>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={labelTitleStyle}>CC</div>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={ccPick}
                  onChange={(e) => setCcPick(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Add CC...</option>
                  {availableCc.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={addCc} style={smallButtonStyle}>
                  Add
                </button>
              </div>
              {cc.length ? (
                <div style={chipRowStyle}>
                  {cc.map((email) => (
                    <Chip
                      key={email}
                      text={email}
                      onRemove={() =>
                        setCc((p) => p.filter((x) => x !== email))
                      }
                    />
                  ))}
                </div>
              ) : (
                <div style={hintStyle}>No CC recipients.</div>
              )}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <div style={labelTitleStyle}>BCC</div>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={bccPick}
                  onChange={(e) => setBccPick(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Add BCC...</option>
                  {availableBcc.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={addBcc} style={smallButtonStyle}>
                  Add
                </button>
              </div>
              {bcc.length ? (
                <div style={chipRowStyle}>
                  {bcc.map((email) => (
                    <Chip
                      key={email}
                      text={email}
                      onRemove={() =>
                        setBcc((p) => p.filter((x) => x !== email))
                      }
                    />
                  ))}
                </div>
              ) : (
                <div style={hintStyle}>No BCC recipients.</div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div style={labelTitleStyle}>Subject</div>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <div style={labelTitleStyle}>Message</div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

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
        </div>
      </div>
    </section>
  );
}

const cardStyle = {
  border: "1px solid rgba(0,0,0,0.10)",
  borderRadius: 16,
  padding: 14,
  background: "rgba(255,255,255,0.7)",
};

const labelTitleStyle = { fontWeight: 950, color: "#0055b8" };

const inputStyle = {
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "rgba(255,255,255,0.92)",
  color: "#0b2b3a",
  width: "100%",
  boxSizing: "border-box",
};

const twoColStyle = {
  display: "grid",
  gap: 12,
};

const smallButtonStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(14,110,166,0.35)",
  background: "rgba(14,110,166,0.10)",
  color: "#0055b8",
  fontWeight: 950,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const chipRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const chipStyle = {
  border: "1px solid rgba(0,85,184,0.25)",
  background: "rgba(0,85,184,0.08)",
  color: "#0055b8",
  padding: "8px 10px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 900,
};

const hintStyle = { fontSize: 12, opacity: 0.7 };
