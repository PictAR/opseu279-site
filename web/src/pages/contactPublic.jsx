// web/src/pages/contactPublic.jsx
import { useState } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xzddqyzn";

export default function PublicContact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="pubWrap contactWrap">
      <header className="pubHero">
        <h1 className="pubTitle">Contact Local 279</h1>
        <p className="pubLead">
          This form goes directly to the Local 279 inbox via Formspree.
        </p>
      </header>

      <section className="contactCard">
        {!submitted ? (
          <form
            action={FORMSPREE_ENDPOINT}
            method="POST"
            className="formGrid"
            onSubmit={() => setSubmitted(true)}
          >
            <input
              type="text"
              name="_gotcha"
              tabIndex="-1"
              autoComplete="off"
              className="honeypot"
              aria-hidden="true"
            />

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
        ) : (
          <div className="thanksBox">
            <h2 className="h2">Sent</h2>
            <p>
              If you do not hear back within a reasonable time, follow up via
              your usual union channel.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
