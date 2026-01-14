import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import MemberHeader from "../../components/MemberHeader";

const CLASSIFICATIONS = [
  "Full Time",
  "Part Time",
  "Full Time Community Paramedic",
  "Part Time Community Paramedic",
  "Part Time and Part Time CP",
];

<div style={{ display: "grid", gap: 6 }}>
  <div style={labelTitleStyle}>Name</div>
  <div style={{ ...inputStyle, display: "flex", alignItems: "center", opacity: 0.9 }}>
    {user?.fullName || user?.username || "Member"}
  </div>
  <div style={{ fontSize: 12, opacity: 0.7 }}>
    Name is pulled from your sign-in account.
  </div>
</div>

function yearsOfService(startDateStr) {
  if (!startDateStr) return null;
  const start = new Date(startDateStr + "T00:00:00");
  if (Number.isNaN(start.getTime())) return null;

  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return null;

  return { years, months };
}

export default function Profile() {
  const { user, isLoaded } = useUser();

  // We store everything under unsafeMetadata.profile
  const existing = useMemo(() => {
    const profile = user?.unsafeMetadata?.profile;
    return profile && typeof profile === "object" ? profile : {};
  }, [user]);

  const [startDate, setStartDate] = useState("");
  const [classification, setClassification] = useState(CLASSIFICATIONS[0]);
  const [school, setSchool] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    setStartDate(typeof existing.startDate === "string" ? existing.startDate : "");
    setClassification(
      typeof existing.classification === "string" ? existing.classification : CLASSIFICATIONS[0]
    );
    setSchool(typeof existing.school === "string" ? existing.school : "");
  }, [isLoaded, user, existing]);

  const yos = yearsOfService(startDate);

  async function onSave() {
    if (!user) return;
    setSaving(true);
    setSavedMsg("");

    try {
      const nextProfile = {
        ...existing,
        startDate: startDate || "",
        classification: classification || "",
        school: school || "",
      };

      await user.update({
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          profile: nextProfile,
        },
      });

      setSavedMsg("Saved.");
      setTimeout(() => setSavedMsg(""), 1600);
    } catch (e) {
      console.error(e);
      setSavedMsg("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) return null;

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <MemberHeader title="My Profile" />

      <div style={cardStyle}>
        <div style={{ display: "grid", gap: 10 }}>
          <label style={labelStyle}>
            <div style={labelTitleStyle}>Start date</div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={inputStyle}
            />
            {yos ? (
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                Years of service: <b>{yos.years}</b> year{yos.years === 1 ? "" : "s"}
                {yos.months ? `, ${yos.months} month${yos.months === 1 ? "" : "s"}` : ""}
              </div>
            ) : (
              <div style={{ fontSize: 13, opacity: 0.7 }}>
                Enter your start date to calculate years of service.
              </div>
            )}
          </label>

          <label style={labelStyle}>
            <div style={labelTitleStyle}>Current classification</div>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              style={inputStyle}
            >
              {CLASSIFICATIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            <div style={labelTitleStyle}>School</div>
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="e.g., Humber, Fanshawe, etc."
              style={inputStyle}
            />
          </label>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button type="button" onClick={onSave} disabled={saving} style={buttonStyle}>
              {saving ? "Saving..." : "Save"}
            </button>
            {savedMsg ? <div style={{ fontWeight: 800 }}>{savedMsg}</div> : null}
          </div>

          <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.4 }}>
            Note: these fields are stored in your Clerk user metadata.
          </div>
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

const labelStyle = { display: "grid", gap: 6 };

const labelTitleStyle = { fontWeight: 950, color: "#0055b8" };

const inputStyle = {
  padding: 10,
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.15)",
  background: "rgba(255,255,255,0.92)",
  color: "#0b2b3a",
};

const buttonStyle = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(14,110,166,0.35)",
  background: "rgba(14,110,166,0.10)",
  color: "#0055b8",
  fontSize: 14,
  fontWeight: 950,
  cursor: "pointer",
};
