// web/src/pages/local279.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/local279.css";
import { LOCAL279 } from "../data/local279.js";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  (import.meta.env.DEV ? "https://opseu279.com" : "");

function fmtDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function MembersLocal279Page() {
  return (
    <MembersGate>
      <Local279 />
    </MembersGate>
  );
}

function MembersLocal279Discounts() {
  return (
    <MembersGate>
      <section className="page">
        <div className="pageHeader">
          <h1 className="pageTitle">Local discounts</h1>
          <p className="pageSub">
            Submit a discount and we’ll review and publish it.
          </p>
        </div>

        <section className="card">
          <DiscountSubmissionForm />
          <LocalDiscountsCarousel />
        </section>
      </section>
    </MembersGate>
  );
}

function MembersContactExec() {
  return (
    <MembersGate>
      <section className="page">
        <div className="pageHeader">
          <h1 className="pageTitle">Contact Executive and Committees</h1>
          <p className="pageSub">
            This goes to the Local 279 inbox via Formspree.
          </p>
        </div>

        <section className="card">
          <form action={FORMSPREE_ENDPOINT} method="POST" className="formGrid">
            <input
              type="text"
              name="_gotcha"
              tabIndex="-1"
              autoComplete="off"
              className="honeypot"
              aria-hidden="true"
            />

            <input type="hidden" name="form_type" value="members_contact" />

            <label className="fieldLabel">
              Your email
              <input
                name="email"
                type="email"
                required
                className="textInput"
                placeholder="you@example.com"
              />
            </label>

            <label className="fieldLabel">
              Your name
              <input
                name="name"
                type="text"
                required
                className="textInput"
                placeholder="First and last name"
              />
            </label>

            <label className="fieldLabel">
              Subject
              <input
                name="subject"
                type="text"
                required
                className="textInput"
                placeholder="What is this about?"
              />
            </label>

            <label className="fieldLabel">
              Message
              <textarea
                name="message"
                required
                rows={6}
                className="textInput textArea"
                placeholder="Write your message here…"
              />
            </label>

            <button type="submit" className="primaryBtn">
              Send message
            </button>

            <p className="finePrint">
              Please avoid including personal health information.
            </p>
          </form>
        </section>
      </section>
    </MembersGate>
  );
}

function CalendarBlock() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`${API_ORIGIN}/api/calendar?limit=25`, {
          headers: { accept: "application/json" },
        });

        if (!res.ok) throw new Error(`Calendar fetch failed (${res.status})`);

        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Calendar fetch failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const events = data?.events || [];
  const htmlUrl = data?.htmlUrl || "";
  const updatedAt = data?.updatedAt || "";

  return (
    <div className="l279Cal">
      <div className="l279Note">{LOCAL279?.calendar?.note}</div>

      <div className="l279Row">
        {htmlUrl ? (
          <a
            className="l279Btn"
            href={htmlUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open calendar
          </a>
        ) : null}

        {updatedAt ? (
          <div className="l279Meta">Updated: {fmtDateTime(updatedAt)}</div>
        ) : null}
      </div>

      {loading ? <div className="l279Muted">Loading events…</div> : null}
      {err ? <div className="l279Error">{err}</div> : null}

      {!loading && !err && events.length === 0 ? (
        <div className="l279Muted">
          No events found yet. (If you want to see it populate, add one Outlook
          event and re-publish the calendar.)
        </div>
      ) : null}

      {!loading && !err && events.length ? (
        <ul className="l279List">
          {events.map((ev) => (
            <li key={ev.id} className="l279ListItem">
              <div className="l279ListTitle">
                {ev.title || "Untitled event"}
              </div>

              <div className="l279ListMeta">
                {ev.allDay
                  ? `All day • ${ev.startDate}`
                  : ev.start
                    ? fmtDateTime(ev.start)
                    : "Time TBD"}
                {ev.location ? ` • ${ev.location}` : ""}
              </div>

              {ev.description ? (
                <div className="l279ListDesc">{ev.description}</div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function LinkList({ items, emptyText }) {
  if (!items?.length) return <div className="l279Muted">{emptyText}</div>;

  return (
    <ul className="l279Links">
      {items.map((it) => (
        <li key={it.href || it.title} className="l279LinksItem">
          <a
            className="l279Link"
            href={it.href}
            target="_blank"
            rel="noreferrer"
          >
            <span className="l279LinkTitle">{it.title}</span>
            {it.date || it.meta ? (
              <span className="l279LinkMeta">{it.date || it.meta}</span>
            ) : null}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function Local279() {
  const exec = useMemo(() => LOCAL279?.exec || [], []);
  const seniorityLists = useMemo(() => LOCAL279?.seniorityLists || [], []);
  const grievances = useMemo(() => LOCAL279?.grievances || [], []);
  const surveys = useMemo(() => LOCAL279?.surveys || [], []);
  const meetingsUpcoming = useMemo(() => LOCAL279?.meetingsUpcoming || [], []);
  const meetingsPast = useMemo(() => LOCAL279?.meetingsPast || [], []);

  return (
    <section className="l279Card">
      <h1 className="l279H1">Local 279</h1>
      <div className="l279Sub">
        Local-specific resources, updates, and links for members.
      </div>

      <details className="l279Details" open id="calendar">
        <summary className="l279Summary">Calendar</summary>
        <div className="l279Body">
          <CalendarBlock />
        </div>
      </details>

      <details className="l279Details" id="exec">
        <summary className="l279Summary">Executive</summary>
        <div className="l279Body">
          {exec.length ? (
            <ul className="l279List">
              {exec.map((p) => (
                <li key={p.role} className="l279ListItem">
                  <div className="l279ListTitle">{p.role}</div>
                  <div className="l279ListMeta">{p.name}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="l279Muted">Coming soon.</div>
          )}
        </div>
      </details>

      <details className="l279Details" id="seniority">
        <summary className="l279Summary">Seniority lists</summary>
        <div className="l279Body">
          <LinkList items={seniorityLists} emptyText="Coming soon." />
        </div>
      </details>

      <details className="l279Details" id="grievances">
        <summary className="l279Summary">Grievances</summary>
        <div className="l279Body">
          <LinkList items={grievances} emptyText="Coming soon." />
        </div>
      </details>

      <details className="l279Details" id="polls">
        <summary className="l279Summary">Polls & surveys</summary>
        <div className="l279Body">
          <LinkList items={surveys} emptyText="Coming soon." />
        </div>
      </details>

      <details className="l279Details" id="meetings">
        <summary className="l279Summary">Meetings</summary>
        <div className="l279Body">
          <div className="l279SectionLabel">Upcoming</div>
          {meetingsUpcoming.length ? (
            <ul className="l279List">
              {meetingsUpcoming.map((m) => (
                <li key={m.id} className="l279ListItem">
                  <div className="l279ListTitle">{m.title}</div>
                  <div className="l279ListMeta">
                    {m.startsAt ? fmtDateTime(m.startsAt) : "Time TBD"}
                    {m.location ? ` • ${m.location}` : ""}
                  </div>
                  {m.agendaPdf ? (
                    <a
                      className="l279MiniLink"
                      href={m.agendaPdf}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Agenda PDF
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="l279Muted">None posted yet.</div>
          )}

          <div className="l279SectionLabel l279PadTop">Past (minutes)</div>
          {meetingsPast.length ? (
            <ul className="l279List">
              {meetingsPast.map((m) => (
                <li key={m.id} className="l279ListItem">
                  <div className="l279ListTitle">{m.title}</div>
                  <div className="l279ListMeta">
                    {m.startsAt ? fmtDateTime(m.startsAt) : ""}
                  </div>
                  {m.minutesPdf ? (
                    <a
                      className="l279MiniLink"
                      href={m.minutesPdf}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Minutes PDF
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="l279Muted">None posted yet.</div>
          )}
        </div>
      </details>

      <details className="l279Details" id="discounts">
        <summary className="l279Summary">Discounts</summary>
        <div className="l279Body">
          <div className="l279Row">
            <Link className="l279Btn" to="/members/local279/discounts">
              Local discounts
            </Link>

            <a
              className="l279Btn l279BtnGhost"
              href="https://opseu.org"
              target="_blank"
              rel="noreferrer"
            >
              OPSEU.org
            </a>
          </div>

          <div className="l279Muted">
            Local discounts are managed by posts. OPSEU’s member discount
            programs are linked from the discounts page.
          </div>
        </div>
      </details>

      <div className="l279FooterLink">
        <Link to="/members/contact" className="l279InlineLink">
          Contact Executive and Committees
        </Link>
      </div>
    </section>
  );
}
