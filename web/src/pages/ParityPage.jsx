// web/src/pages/ParityPage.jsx

import React from "react";

export default function ParityPage() {
  return (
    <main className="main">
      <div className="container pubWrap">
        {/* HERO */}
        <section className="pubHero">
          <h1 className="pubTitle">Paramedic Pay Parity</h1>
          <p className="pubLead mt12">
            Same risk. Same responsibility. Not the same pay.
          </p>
          <p className="pubLead">
            Paramedics across Ontario respond to unpredictable, high-risk
            emergencies every day. Despite this, compensation and protections do
            not match comparable emergency services.
          </p>
        </section>

        {/* HERO IMAGE */}
        <section className="card">
          <img
            src="/images/parity-hero.jpg" // swap with your asset
            alt="Paramedics responding to emergency"
            style={{
              width: "100%",
              borderRadius: "14px",
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          />
        </section>

        {/* ACCORDION */}
        <section className="card">
          {/* 1 */}
          <details className="whoDetails">
            <summary className="whoSummary">
              <span className="whoTitle">The Facts</span>
              <span className="whoChevron">›</span>
            </summary>

            <div className="whoPanel">
              <div className="whoPanelInner">
                <div className="whoCopy">
                  <p className="whoText">
                    Paramedics respond to medical emergencies, trauma,
                    overdoses, violence, and mental health crises. They enter
                    uncontrolled environments with unknown risks and provide
                    life-saving care.
                  </p>
                  <p className="whoText">Despite this:</p>
                  <ul className="pubList">
                    <li>Lower pay compared to other emergency services</li>
                    <li>Fewer long-term compensation benefits</li>
                    <li>No presumptive cancer coverage</li>
                    <li>Not classified as essential, but unable to strike</li>
                  </ul>
                </div>
              </div>
            </div>
          </details>

          {/* 2 */}
          <details className="whoDetails">
            <summary className="whoSummary">
              <span className="whoTitle">What is Pay Parity?</span>
              <span className="whoChevron">›</span>
            </summary>

            <div className="whoPanel">
              <div className="whoPanelInner">
                <div className="whoCopy">
                  <p className="whoText">
                    Pay parity means equal pay and benefits for work of
                    comparable risk, responsibility, and skill.
                  </p>
                  <p className="whoText">
                    Paramedics, firefighters, and police officers all operate in
                    high-risk environments and make critical decisions that
                    affect public safety.
                  </p>
                  <p className="whoText">
                    Pay parity is about fairness — not competition.
                  </p>
                </div>
              </div>
            </div>
          </details>

          {/* 3 */}
          <details className="whoDetails">
            <summary className="whoSummary">
              <span className="whoTitle">Increased Demand & Scope</span>
              <span className="whoChevron">›</span>
            </summary>

            <div className="whoPanel">
              <div className="whoPanelInner">
                <div className="whoCopy">
                  <p className="whoText">
                    Demand for paramedic services continues to rise across
                    Ontario.
                  </p>
                  <ul className="pubList">
                    <li>Higher call volumes</li>
                    <li>More complex patient care</li>
                    <li>Increased mental health and addiction calls</li>
                    <li>Expanded clinical expectations</li>
                  </ul>
                  <p className="whoText">
                    Paramedics are delivering more advanced care, in more
                    situations, than ever before.
                  </p>
                </div>
              </div>
            </div>
          </details>

          {/* 4 */}
          <details className="whoDetails">
            <summary className="whoSummary">
              <span className="whoTitle">What is Community Paramedicine?</span>
              <span className="whoChevron">›</span>
            </summary>

            <div className="whoPanel">
              <div className="whoPanelInner">
                <div className="whoCopy">
                  <p className="whoText">
                    Community Paramedicine programs began expanding around 2014
                    and continue to grow rapidly.
                  </p>
                  <ul className="pubList">
                    <li>In-home patient care</li>
                    <li>Chronic disease monitoring</li>
                    <li>Preventative healthcare support</li>
                    <li>Reducing emergency room visits</li>
                  </ul>
                  <p className="whoText">
                    This work increases both responsibility and clinical
                    decision-making expectations for paramedics.
                  </p>
                </div>
              </div>
            </div>
          </details>
        </section>

        {/* WAGE COMPARISON */}
        <section className="card">
          <div className="sectionHead">
            <h2 className="h2">How Do Paramedics Compare?</h2>
            <p className="muted">
              When the work carries similar risk, the compensation should
              reflect that.
            </p>
          </div>

          {/* TEMP placeholder until you drop your real chart */}
          <div className="l279TableWrap">
            <table className="l279Table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Pay</th>
                  <th>Benefits</th>
                  <th>Long-Service</th>
                  <th>Cancer Coverage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Paramedics</td>
                  <td>Lower</td>
                  <td>Limited</td>
                  <td>No</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Fire</td>
                  <td>Higher</td>
                  <td>Strong</td>
                  <td>Yes</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Police</td>
                  <td>Higher</td>
                  <td>Strong</td>
                  <td>Yes</td>
                  <td>Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CLOSING */}
        <section className="card">
          <h2 className="h2">Why This Matters</h2>
          <p className="muted">
            Fair compensation helps recruit and retain paramedics, which
            directly impacts emergency response times and patient care.
          </p>
          <p className="muted">
            A stable paramedic workforce means better outcomes for the
            communities we serve.
          </p>
        </section>
      </div>
    </main>
  );
}
