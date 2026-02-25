// web/src/pages/about.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

const EXECUTIVE = [
  { role: "President", name: "Tristan Britt" },
  { role: "Vice President", name: "Carol Dostal" },
  { role: "Secretary", name: "Jenn Hancock" },
  { role: "Treasurer", name: "Devon Lansdell" },
  { role: "Steward", name: "Mike Basha" },
  { role: "Steward", name: "Rachel Porter" },
];

const HERO_SRC = "/about/opseu_about_main.jpeg";

export default function About() {
  const [heroOk, setHeroOk] = useState(true);

  return (
    <section className="pubWrap aboutWrap">
      <header className="pubHero aboutHero">
        <div>
          <h1 className="pubTitle">Who is OPSEU Local 279</h1>
          <p className="pubLead">
            Local 279 is the OPSEU/SEFPO local for Norfolk County paramedics. We
            represent members in the workplace, enforce the collective
            agreement, and push for safe, fair, and consistent working
            conditions.
          </p>

          <div className="btnRow">
            <Link to="/privacy" className="btn">
              Privacy Policy
            </Link>
            <Link to="/members" className="btn btnPrimary">
              Members Area
            </Link>
          </div>
        </div>

        <div className="aboutHeroMedia" aria-hidden="true">
          {heroOk ? (
            <img
              src={HERO_SRC}
              alt="OPSEU Local 279"
              loading="lazy"
              className="aboutHeroImg"
              onError={() => setHeroOk(false)}
            />
          ) : (
            <div className="aboutLogoCard">
              <img
                src="/about/opseu_about_main.jpeg"
                alt="OPSEU Local 279"
                className="aboutLogoImg"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </header>

      <section className="card">
        <h2 className="h2">What we do</h2>
        <ul className="pubList">
          <li>Collective bargaining and contract enforcement.</li>
          <li>Representation and support when workplace issues come up.</li>
          <li>
            Health and safety advocacy, including follow up on base and
            operational concerns.
          </li>
          <li>
            Member communication, education, and local specific resources.
          </li>
        </ul>
      </section>

      <section className="card">
        <h2 className="h2">What this site is</h2>
        <p>
          This public site is a simple landing page for updates, links, and
          basic information. The secure Member Portal (sign in required) is
          where Local 279 members access local documents, our collective
          agreement library, and tools like wage comparisons and the Collective
          Agreement AI Q and A.
        </p>
      </section>

      <section className="card">
        <h2 className="h2">Executive</h2>
        <p>
          Local 279 is run by elected members. The executive below is the first
          point of contact for member support and local union business.
        </p>

        <details className="detailsBox">
          <summary className="detailsSummary">Show executive list</summary>
          <div className="detailsBody">
            <ul className="pubList">
              {EXECUTIVE.map((p) => (
                <li key={p.role}>
                  <b>{p.role}:</b> {p.name}
                </li>
              ))}
            </ul>
          </div>
        </details>
      </section>

      <section className="card">
        <h2 className="h2">Learn more about OPSEU/SEFPO</h2>
        <p>
          Local 279 is part of OPSEU/SEFPO. For broader information about the
          union, history, constitution, and governance, visit OPSEU/SEFPO’s
          About page.
        </p>

        <a
          href="https://opseu.org/about/"
          target="_blank"
          rel="noreferrer"
          className="btn"
        >
          OPSEU/SEFPO About
        </a>
      </section>
    </section>
  );
}
