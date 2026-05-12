// web/src/pages/ParityPage.jsx
import React from "react";

export default function ParityPage() {
  return (
    <main className="main">
      <div className="container">
        <section className="card">
          <h1 className="h1">Pay Parity Now</h1>
          <p className="muted">
            If the PDF doesn’t display on your device, use the download link
            below.
          </p>

          <div style={{ marginTop: 12 }}>
            <a
              className="link"
              href="/ppn279.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Open or download the infographic PDF
            </a>
          </div>

          <div
            style={{
              marginTop: 14,
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.12)",
              background: "rgba(0,0,0,0.02)",
            }}
          >
            <object
              data="/ppn279.pdf"
              type="application/pdf"
              width="100%"
              height="900"
              aria-label="Pay Parity Now infographic PDF"
            >
              <iframe
                src="/ppn279.pdf"
                title="Pay Parity Now infographic PDF"
                width="100%"
                height="900"
                style={{ border: 0 }}
              />
            </object>
          </div>
        </section>
      </div>
    </main>
  );
}
