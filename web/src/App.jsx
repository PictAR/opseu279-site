// ******* //
// APP.JSX //
// ******* //

import { useEffect, useRef, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";


import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faNewspaper,
  faCircleInfo,
  faEnvelope,
  faFileLines,
  faRightToBracket,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

import EnvBadge from "./components/EnvBadge.jsx";

// ***** //
// PAGES //
// ***** //

import Contact from "./pages/contact.jsx";
import Faq from "./pages/faq.jsx";
import Documents from "./pages/documents.jsx";
import Agreement from "./pages/agreement.jsx";
import Discounts from "./pages/discounts.jsx";
import Wages from "./pages/wages-benefits.jsx";
import PeerSupport from "./pages/peer-support.jsx";
import TakeAction from "./pages/take-action.jsx";
import MembersLayout from "./pages/members/MembersLayout";
import MembersHome from "./pages/members/MembersHome";
import Seniority from "./pages/seniority.jsx";
import Profile from "./pages/members/Profile.jsx";

import { POSTS } from "./data/posts.js";
/* import { APP_VERSION, RELEASE_NOTES } from "./data/releaseNotes.js"; */


import opseuUnderCon from "./assets/opseuUnderCon.png";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          {/* Public */}
          <Route index element={<Home />} />

          {/* Members (protected) */}
<Route path="/members" element={<MemberGate><MembersLayout /></MemberGate>}>
  <Route index element={<MembersHome />} />
  <Route path="collective-agreement" element={<Agreement />} />
  <Route path="wages-benefits" element={<Wages />} />
  <Route path="documents" element={<Documents />} />
  <Route path="peer-support" element={<PeerSupport />} />
  <Route path="faq" element={<Faq />} />
  <Route path="take-action" element={<TakeAction />} />
  <Route path="discounts" element={<Discounts />} />
  <Route path="contact" element={<Contact />} />
  <Route path="seniority" element={<Seniority />} />
  <Route path="profile" element={<Profile />} />
</Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/* Layout: navbar // content // footer */
function Shell() {
  return (
    <div style={pageStyle}>
      <EnvBadge />
      <NavBar />
      <main style={mainStyle}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/* Protect members-only routes */
function MemberGate({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>

      <SignedOut>
        <section style={cardStyle}>
          <h2 style={h2Style}>Members Area</h2>
          <p style={pStyle}>
            This section is for OPSEU Local 279 members. Please sign in to continue.
          </p>
          <SignInButton mode="modal" afterSignInUrl="/members" afterSignUpUrl="/members">
            <button style={primaryButtonStyle}>Member Login</button>
          </SignInButton>
        </section>
      </SignedOut>
    </>
  );
}

/* ****** */
/* Navbar */
/* ****** */

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  function closeMenu() {
    setMenuOpen(false);
  }

  function goHomeAndScroll(sectionId) {
    closeMenu();

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!menuWrapRef.current) return;
      if (!menuWrapRef.current.contains(e.target)) setMenuOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header style={navStyle}>
      <style>{`
  .nav-logo {
    transform: scale(1);
    transition: transform 160ms ease;
    will-change: transform;
    transform-origin: center;
    max-width: 60vw;
    height: auto;
  }

  /* Only apply hover scale on real hover devices (mouse/trackpad) */
  @media (hover: hover) and (pointer: fine) {
    .nav-logo:hover {
      transform: scale(1.12);
    }
  }
`}</style>
      {/* Left */}
      <div style={navLeftStyle} ref={menuWrapRef}>
        <button
          type="button"
          style={iconButtonStyle}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <FontAwesomeIcon
            icon={menuOpen ? faXmark : faBars}
            style={iconStyle}
          />
        </button>

{menuOpen && (
  <div style={dropdownStyle} role="menu" aria-label="Site menu">
    {/* 1) News */}
    <Link to="/" style={dropdownItemStyle} role="menuitem" onClick={closeMenu}>
      <FontAwesomeIcon icon={faNewspaper} style={dropdownIconStyle} />
      News
    </Link>

    {/* 2) About */}
    <button
      type="button"
      style={dropdownButtonStyle}
      role="menuitem"
      onClick={() => goHomeAndScroll("about")}
    >
      <FontAwesomeIcon icon={faCircleInfo} style={dropdownIconStyle} />
      About
    </button>

    {/* 3) Members Area */}
    <SignedIn>
      <Link to="/members" style={dropdownItemStyle} role="menuitem" onClick={closeMenu}>
        <FontAwesomeIcon icon={faFileLines} style={dropdownIconStyle} />
        Members Area
      </Link>
    </SignedIn>

    <SignedOut>
      <SignInButton mode="modal" afterSignInUrl="/members" afterSignUpUrl="s">
        <button type="button" style={dropdownButtonStyle} role="menuitem">
          <FontAwesomeIcon icon={faRightToBracket} style={dropdownIconStyle} />
          Members Area
        </button>
      </SignInButton>
    </SignedOut>

    {/* 4) OPSEU.org */}
    <a
      href="https://opseu.org"
      target="_blank"
      rel="noreferrer"
      style={dropdownItemStyle}
      role="menuitem"
      onClick={closeMenu}
    >
      <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={dropdownIconStyle} />
      OPSEU.org
    </a>
  </div>
)}

      </div>

      {/* Center */}
      <Link to="/" style={logoLinkStyle} aria-label="OPSEU Local 279 Home">
<img
  src="/l279-logo-blue.png"
  alt="OPSEU Local 279"
  style={logoStyle}
  className="nav-logo"
/>
      </Link>

      {/* Right (signed-in only): user menu */}
      <div style={navRightStyle}>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

/* ****** */
/* Footer */
/* ****** */

function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

const showNotes = false;

  function goHomeAndScroll(sectionId) {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <footer style={footerOuterStyle}>
      <div style={footerInnerStyle}>
        <div style={footerTopRowStyle}>
          <div style={footerLinksStyle}>
            <button type="button" style={footerLinkButtonStyle} onClick={() => goHomeAndScroll("contact")}>
              Contact
            </button>
            <a
              href="https://opseu.org"
              target="_blank"
              rel="noreferrer"
              style={footerLinkStyle}
            >
              OPSEU.org
            </a>
          </div>

          <div style={footerCtaStyle}>
            <SignedOut>
              <SignInButton mode="modal" afterSignInUrl="/members" afterSignUpUrl="/members">
                <button style={footerButtonStyle}>Member Login</button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link to="/members" style={footerMemberLinkStyle}>Go to Members Area</Link>
            </SignedIn>
          </div>
        </div>

        {showNotes && latest ? (
          <div style={footerNotesWrapStyle}>
            <div style={footerNotesTopStyle}>
              <div style={footerNotesTitleStyle}>
                Version {APP_VERSION}
              </div>
              <div style={footerNotesMetaStyle}>
                Updated {latest.date}
              </div>
            </div>

            <details style={footerDetailsStyle}>
              <summary style={footerSummaryStyle}>
                What changed
              </summary>

              <div style={footerNotesBodyStyle}>
                <div style={{ fontWeight: 900, marginBottom: 6 }}>
                  {latest.title}
                </div>
                <ul style={footerNotesListStyle}>
                  {latest.changes.map((c, i) => (
                    <li key={i} style={footerNotesItemStyle}>{c}</li>
                  ))}
                </ul>

                {RELEASE_NOTES.length > 1 ? (
                  <div style={footerNotesHintStyle}>
                    Older updates are in the release notes file.
                  </div>
                ) : null}
              </div>
            </details>
          </div>
        ) : null}

        <div style={footerMetaStyle}>
          <div style={footerSmallStyle}>© {year} OPSEU Local 279</div>
          <div style={footerSmallStyle}>Website by TJ3D</div>
        </div>
      </div>
    </footer>
  );
}

/* ********** */
/* FRONT PAGE */
/* ********** */

function Home() {
  const comingSoon = import.meta.env.VITE_COMING_SOON === "true";

  if (comingSoon) {
    return (
      <>
        <section style={heroCardStyle}>
          <h1 style={heroTitleStyle}>OPSEU Local 279</h1>

          <p style={heroTextStyle}>
            OPSEU279 is the local affiliate of OPSEU.org and represents Norfolk County’s Paramedics. We advocate for our
            members and the profession through collective bargaining, workplace safety, and fair, consistent treatment.
            Our focus is simple: protect what matters and push for a stronger, more equitable
            workplace for paramedics.
          </p>

          <div style={heroImageWrapStyle}>
            <img
              src={opseuUnderCon}
              alt="opseu279.com under construction"
              style={heroImageStyle}
              loading="lazy"
            />
          </div>
        </section>

        <section id="about" style={cardStyle}>
          <h2 style={h2Style}>About Local 279</h2>
          <p style={pStyle}>
            OPSEU Local 279 represents paramedics working for Norfolk County Paramedic Services. We work to advance
            paramedic interests through collective bargaining, enforcement of the collective agreement, and advocacy for
            respectful workplaces grounded in fairness and equality.
          </p>
        </section>
      </>
    );
  }

  const posts = [...POSTS].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <>
      <section style={cardStyle}>
        <h1 style={h1Style}>OPSEU Local 279</h1>
        <p style={pStyle}>
          We represent Norfolk County Paramedics. This page shares public union news and initiatives. Members can sign in
          for internal resources.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>News</h2>

        <div style={{ display: "grid", gap: 12 }}>
          {posts.map((post) => (
            <article key={post.id} style={postStyle}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                {post.pinned ? <span style={pinStyle}>Pinned</span> : null}
                <div style={postTitleStyle}>{post.title}</div>
              </div>

              <div style={postMetaStyle}>{formatDate(post.date)}</div>
              <p style={postSummaryStyle}>{post.summary}</p>

              {post.links?.length ? (
                <div style={linkRowStyle}>
                  {post.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target={l.external ? "_blank" : undefined}
                      rel={l.external ? "noreferrer" : undefined}
                      style={postLinkStyle}
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section id="about" style={cardStyle}>
        <h2 style={h2Style}>About Local 279</h2>
        <p style={pStyle}>
          OPSEU Local 279 represents paramedics working for Norfolk County Paramedic Services. We advocate for fair working
          conditions, safe practice, and a healthy workplace.
        </p>
      </section>

      <section id="contact" style={cardStyle}>
        <h2 style={h2Style}>Contact</h2>
        <p style={pStyle}>
          Public questions and community initiatives can be shared here. Members needing support should sign in and use the
          members contact options.
        </p>
      </section>
    </>
  );
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

const postStyle = {
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,85,184,0.04)",
  padding: 14,
  display: "grid",
  gap: 8,
};

const pinStyle = {
  display: "inline-flex",
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid rgba(0,85,184,0.25)",
  background: "rgba(0,85,184,0.10)",
  color: "#0055b8",
  fontWeight: 950,
  fontSize: 12,
};

const postTitleStyle = { fontWeight: 950, color: "#0b2b3a", fontSize: 15 };
const postMetaStyle = { fontSize: 13, opacity: 0.75 };
const postSummaryStyle = { margin: 0, lineHeight: 1.5, opacity: 0.9 };

const postLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,85,184,0.25)",
  background: "rgba(0,85,184,0.10)",
  color: "#0055b8",
  fontWeight: 950,
  textDecoration: "none",
};

const linkRowStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

function NotFound() {
  return (
    <section style={cardStyle}>
      <h2 style={h2Style}>Page not found</h2>
      <p style={pStyle}>
        That link doesn’t go anywhere. Head back to the{" "}
        <Link to="/" style={inlineLinkStyle}>home page</Link>.
      </p>
    </section>
  );
}

/* ****** */
/* Styles */
/* ****** */

const pageStyle = {
  minHeight: "100vh",
  background: "#ffffff",
  color: "#0b2b3a",
  overflowX: "false",
};

const navStyle = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  height: 92,
  background: "#ffffff",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  padding: "0 16px",
};

const navLeftStyle = {
  justifySelf: "start",
  display: "flex",
  alignItems: "center",
  position: "relative",
};

const iconButtonStyle = {
  width: 46,
  height: 46,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 18,
  color: "#0055b8",
  padding: 0,
  lineHeight: 0,
};

const iconStyle = {
  display: "block",
};

const dropdownStyle = {
  position: "absolute",
  top: 56,
  left: 0,
  minWidth: 260,
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.10)",
  borderRadius: 14,
  boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
  padding: 8,
  display: "grid",
  gap: 6,
};

const dropdownItemStyle = {
  textDecoration: "none",
  color: "#0b2b3a",
  padding: "11px 10px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.06)",
  background: "rgba(14,110,166,0.04)",
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 900,
  fontSize: 14,
  cursor: "pointer",
};

const dropdownButtonStyle = {
  width: "100%",
  textAlign: "left",
  color: "#0b2b3a",
  padding: "11px 10px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.06)",
  background: "rgba(14,110,166,0.04)",
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 900,
  fontSize: 14,
  cursor: "pointer",
};

const dropdownIconStyle = {
  color: "#0055b8",
};

const logoLinkStyle = {
  justifySelf: "center",
  display: "inline-flex",
  alignItems: "center",
  padding: 6,
};

const logoStyle = {
  height: 70,
  maxWidth: "60vw", // add this
  width: "auto",
  display: "block",
};

const navRightStyle = {
  justifySelf: "end",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const mainStyle = {
  width: "100%",
  maxWidth: 760,
  margin: "0 auto",
  padding:
    "26px max(16px, env(safe-area-inset-left)) 56px max(16px, env(safe-area-inset-right))",
  display: "grid",
  gap: 16,
};

const cardStyle = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
};

const h1Style = {
  margin: 0,
  fontSize: 22,
  fontWeight: 950,
  color: "#0055b8",
};

const h2Style = {
  margin: "0 0 8px",
  fontSize: 18,
  fontWeight: 950,
  color: "#0055b8",
};

const pStyle = {
  margin: "10px 0 0",
  lineHeight: 1.5,
  fontSize: 15,
};

const mutedStyle = {
  margin: 0,
  opacity: 0.75,
  fontSize: 14,
  lineHeight: 1.5,
};

const inlineLinkStyle = {
  color: "#0055b8",
  fontWeight: 900,
  textDecoration: "none",
};

const primaryButtonStyle = {
  marginTop: 10,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(14,110,166,0.35)",
  background: "rgba(14,110,166,0.10)",
  color: "#0055b8",
  fontSize: 14,
  fontWeight: 950,
  cursor: "pointer",
};

/* ****************************** */
/* UNDER CONSTRUCTION PAGE STYLES */
/* ****************************** */

const heroCardStyle = {
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
  display: "grid",
  gap: 14,
};

const heroTitleStyle = {
  margin: 0,
  fontSize: 24,
  fontWeight: 950,
  color: "#0055b8",
};

const heroTextStyle = {
  margin: 0,
  lineHeight: 1.55,
  fontSize: 15,
  opacity: 0.95,
};

const heroImageWrapStyle = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(0,85,184,0.04)",
  padding: 12,
};

const heroImageStyle = {
  width: "100%",
  height: "auto",
  display: "block",
  borderRadius: 10,
};

/* ************* */
/* Footer styles */
/* ************* */

const footerNotesWrapStyle = {
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: 12,
  display: "grid",
  gap: 10,
};

const footerNotesTopStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  gap: 10,
  flexWrap: "wrap",
};

const footerNotesTitleStyle = {
  color: "#ffffff",
  fontWeight: 950,
  fontSize: 14,
};

const footerNotesMetaStyle = {
  color: "#ffffff",
  opacity: 0.85,
  fontSize: 12,
  fontWeight: 800,
};

const footerDetailsStyle = {
  color: "#ffffff",
};

const footerSummaryStyle = {
  cursor: "pointer",
  fontWeight: 950,
  color: "#ffffff",
  listStyle: "none",
};

const footerNotesBodyStyle = {
  marginTop: 10,
  color: "#ffffff",
};

const footerNotesListStyle = {
  margin: "8px 0 0",
  paddingLeft: 18,
  display: "grid",
  gap: 6,
};

const footerNotesItemStyle = {
  lineHeight: 1.35,
  opacity: 0.95,
};

const footerNotesHintStyle = {
  marginTop: 10,
  fontSize: 12,
  opacity: 0.8,
};

const footerOuterStyle = {
  borderTop: "1px solid rgba(255,255,255,0.18)",
  background: "#0055b8",
  padding: "18px 0 28px",
};

const footerInnerStyle = {
  width: "100%",
  maxWidth: 760,
  margin: "0 auto",
  padding: "0 20px",
  display: "grid",
  gap: 12,
};

const footerTopRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "wrap",
};

const footerLinksStyle = {
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
  alignItems: "center",
};

const footerLinkStyle = {
  color: "#ffffff",
  fontWeight: 900,
  textDecoration: "none",
};

const footerLinkButtonStyle = {
  color: "#ffffff",
  fontWeight: 900,
  textDecoration: "none",
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  fontSize: 14,
};

const footerCtaStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const footerButtonStyle = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.40)",
  background: "rgba(255,255,255,0.12)",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 950,
  cursor: "pointer",
};

const footerMemberLinkStyle = {
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.35)",
  background: "rgba(255,255,255,0.10)",
  color: "#ffffff",
  fontWeight: 950,
  fontSize: 14,
};

const footerMetaStyle = {
  display: "grid",
  gap: 4,
};

const footerSmallStyle = {
  fontSize: 13,
  opacity: 0.9,
  color: "#ffffff",
};