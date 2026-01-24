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
  faShieldHalved,
  faFileLines,
  faRightToBracket,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

import EnvBadge from "./components/EnvBadge.jsx";

// Pages
import Contact from "./pages/contact.jsx";
import PublicContact from "./pages/contactPublic.jsx";
import Faq from "./pages/faq.jsx";
import Documents from "./pages/documents.jsx";
import Agreement from "./pages/agreement.jsx";
import Member from "./pages/member.jsx";
import Discounts from "./pages/discounts.jsx";
import DataCharts from "./pages/data-charts.jsx";
import PeerSupport from "./pages/peer-support.jsx";
import TakeAction from "./pages/take-action.jsx";
import NewsPost from "./pages/news-post.jsx";
import About from "./pages/about.jsx";
import Privacy from "./pages/privacy.jsx";
import { POSTS } from "./data/posts.js";
import Local279 from "./pages/local279.jsx";

import PublicPost from "./components/PublicPost.jsx";
import OpseuNewsCarousel from "./components/OpseuNewsCarousel.jsx";
import MemberFabMenu from "./components/MemberFabMenu.jsx";

import opseuUnderCon from "./assets/opseuUnderCon.png";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          {/* Public */}
          <Route index element={<Home />} />
          <Route path="/news/:id" element={<NewsPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<PublicContact />} />

          {/* Members (protected) */}
          <Route
            path="/members"
            element={
              <MemberGate>
                <Member />
              </MemberGate>
            }
          />
          <Route
            path="/members/agreement"
            element={
              <MemberGate>
                <Documents />
              </MemberGate>
            }
          />
          <Route
            path="/members/data-charts"
            element={
              <MemberGate>
                <DataCharts />
              </MemberGate>
            }
          />
          <Route
            path="/members/documents"
            element={
              <MemberGate>
                <Documents />
              </MemberGate>
            }
          />
          <Route
            path="/members/peer-support"
            element={
              <MemberGate>
                <PeerSupport />
              </MemberGate>
            }
          />
          <Route
            path="/members/faq"
            element={
              <MemberGate>
                <Faq />
              </MemberGate>
            }
          />
          <Route
            path="/members/take-action"
            element={
              <MemberGate>
                <TakeAction />
              </MemberGate>
            }
          />
          <Route
            path="/members/discounts"
            element={
              <MemberGate>
                <Discounts />
              </MemberGate>
            }
          />
          <Route
            path="/members/contact"
            element={
              <MemberGate>
                <Contact />
              </MemberGate>
            }
          />

          <Route path="/contact" element={<PublicContact />} />

          <Route
            path="/members/local279"
            element={
              <MemberGate>
                <Local279 />
              </MemberGate>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Shell() {
  return (
    <div className="appShell" style={pageStyle}>
      <EnvBadge />
      <NavBar />
      <main className="appMain" style={mainStyle}>
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
      <SignedIn>
        <MemberFabMenu />
        {children}
      </SignedIn>

      <SignedOut>{/* existing signed-out card */}</SignedOut>
    </>
  );
}

/* ****** */
/* Navbar */
/* ****** */

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);

  const { pathname } = useLocation();
  function closeMenu() {
    setMenuOpen(false);
  }

  const inMembers = pathname.startsWith("/members");

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
      {/* Left */}
      <div style={navLeftStyle} ref={menuWrapRef}>
        {/* Hide the top-left menu button entirely on /members routes */}
        {!inMembers && (
          <>
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
                <Link
                  to="/"
                  style={dropdownItemStyle}
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <FontAwesomeIcon
                    icon={faNewspaper}
                    style={dropdownIconStyle}
                  />
                  News
                </Link>

                <Link
                  to="/about"
                  style={dropdownItemStyle}
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    style={dropdownIconStyle}
                  />
                  About Local 279
                </Link>

                <Link
                  to="/privacy"
                  style={dropdownItemStyle}
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <FontAwesomeIcon
                    icon={faShieldHalved}
                    style={dropdownIconStyle}
                  />
                  Privacy Policy
                </Link>

                <SignedIn>
                  <Link
                    to="/members"
                    style={dropdownItemStyle}
                    role="menuitem"
                    onClick={closeMenu}
                  >
                    <FontAwesomeIcon
                      icon={faFileLines}
                      style={dropdownIconStyle}
                    />
                    Members Area
                  </Link>
                </SignedIn>

                <SignedOut>
                  <SignInButton
                    mode="modal"
                    fallbackRedirectUrl="/members"
                    signUpFallbackRedirectUrl="/members"
                  >
                    <button
                      type="button"
                      style={dropdownButtonStyle}
                      role="menuitem"
                    >
                      <FontAwesomeIcon
                        icon={faRightToBracket}
                        style={dropdownIconStyle}
                      />
                      Members Area
                    </button>
                  </SignInButton>
                </SignedOut>

                <a
                  href="https://opseu.org"
                  target="_blank"
                  rel="noreferrer"
                  style={dropdownItemStyle}
                  role="menuitem"
                  onClick={closeMenu}
                >
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                    style={dropdownIconStyle}
                  />
                  OPSEU.org
                </a>
              </div>
            )}
          </>
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

      {/* Right */}
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
  const location = useLocation();
  const inMembers = location.pathname.startsWith("/members");

  return (
    <footer className="appFooter" style={footerOuterStyle}>
      <style>{footerCss}</style>

      <div style={footerInnerStyle}>
        <div style={footerGridStyle}>
          {/* Left: address */}
          <div style={footerAddressColStyle}>
            <div style={footerColTitleStyle}>Hamilton (Region 2)</div>
            <div style={footerLineStyle}>505 York Blvd., 2nd Floor</div>
            <div style={footerLineStyle}>Hamilton, ON L8R 3K4</div>
            <div style={footerLineStyle}>905-538-0601 1-844-765-1405</div>
            <div style={footerLineStyle}>Fax: (905) 525-2377</div>
          </div>

          {/* Middle: links */}
          <div style={footerLinksColStyle}>
            <Link className="footerNavLink" to="/contact">
              Contact
            </Link>

            <Link className="footerNavLink" to="/privacy">
              Privacy
            </Link>

            <Link className="footerNavLink" to="/version-notes">
              Version Notes
            </Link>

            <a
              className="footerNavLink"
              href="mailto:tristanbritt@gmail.com?subject=OPSEU%20Local%20279%20Bug%20Report"
            >
              Report a Bug
            </a>

            {/* Optional: keep login visible for signed-out users only */}
            <SignedOut>
              <div style={{ marginTop: 10 }}>
                <SignInButton
                  mode="modal"
                  fallbackRedirectUrl="/members"
                  signUpFallbackRedirectUrl="/members"
                >
                  <button style={footerButtonStyle}>Member Login</button>
                </SignInButton>
              </div>
            </SignedOut>

            {/* If you are signed in AND already in /members, we show nothing here */}
            <SignedIn>{!inMembers ? null : null}</SignedIn>
          </div>

          {/* Right: OPSEU icon */}
          <div style={footerLogoColStyle}>
            <a
              href="https://opseu.org"
              target="_blank"
              rel="noreferrer"
              aria-label="OPSEU.org"
              style={footerLogoLinkStyle}
            >
              {/* Swap this src to your real OPSEU icon file when you add it */}
              <img
                src="/opseuLogo.svg"
                alt="OPSEU"
                style={footerLogoImgStyle}
                loading="lazy"
              />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div style={footerDividerStyle} />

        {/* Bottom meta */}
        <div style={footerBottomMetaStyle}>
          © {year} OPSEU Local 279 · Website by TJ3D
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
            OPSEU279 is the local affiliate of OPSEU.org and represents Norfolk
            County’s Paramedics. We advocate for our members and the profession
            through collective bargaining, workplace safety, and fair,
            consistent treatment. Our focus is simple: protect what matters and
            push for a stronger, more equitable workplace for paramedics.
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
            OPSEU Local 279 represents paramedics working for Norfolk County
            Paramedic Services. We work to advance paramedic interests through
            collective bargaining, enforcement of the collective agreement, and
            advocacy for respectful workplaces grounded in fairness and
            equality.
          </p>
        </section>
      </>
    );
  }

  const posts = [...POSTS].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.date) - new Date(a.date);
  });

  const featured = posts[0];
  const more = posts.slice(1);

  return (
    <>
      {/* Welcome */}
      <section style={heroCardStyle}>
        <h1 style={heroTitleStyle}>OPSEU Local 279</h1>
        <p style={heroTextStyle}>
          Welcome to the public page for Local 279. Below you’ll find our latest
          updates and announcements. Members can sign in to access the full
          Member Portal.
        </p>
      </section>

      {/* Featured post */}
      {featured ? (
        <PublicPost post={featured} variant="full" showTags={false} />
      ) : null}

      {more.length ? (
        <section style={cardStyle}>
          <h2 style={h2Style}>More News</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {more.map((post) => (
              <article key={post.id} style={postStyle}>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {post.pinned ? <span style={pinStyle}>Pinned</span> : null}
                  <div style={postTitleStyle}>{post.title}</div>
                </div>

                <div style={postMetaStyle}>{formatDate(post.date)}</div>
                {post.summary ? (
                  <p style={postSummaryStyle}>{post.summary}</p>
                ) : null}

                <div style={linkRowStyle}>
                  <Link to={`/news/${post.id}`} style={postLinkStyle}>
                    Read article
                  </Link>

                  {post.links?.map((l) => (
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
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* OPSEU news carousel */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Latest from OPSEU/SEFPO</h2>
        <p style={pStyle}>Headlines pulled from opseu.org.</p>
        <OpseuNewsCarousel />
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
        <Link to="/" style={inlineLinkStyle}>
          home page
        </Link>
        .
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
  overflowX: "hidden",
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

const inlineLinkStyle = {
  color: "#0055b8",
  fontWeight: 900,
  textDecoration: "none",
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

const footerOuterStyle = {
  borderTop: "1px solid rgba(255,255,255,0.18)",
  background: "#0055b8",
  padding: "18px 0 18px",
};

const footerInnerStyle = {
  width: "100%",
  maxWidth: 760,
  margin: "0 auto",
  padding: "0 20px",
  display: "grid",
  gap: 14,
};

const footerGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto auto",
  gap: 18,
  alignItems: "start",
};

const footerAddressColStyle = {
  display: "grid",
  gap: 4,
  justifyItems: "start",
};

const footerLinksColStyle = {
  display: "grid",
  gap: 8,
  justifyItems: "start",
};

const footerLogoColStyle = {
  justifySelf: "end",
  display: "grid",
  alignItems: "start",
};

const footerColTitleStyle = {
  color: "#ffffff",
  fontWeight: 950,
  fontSize: 14,
  marginBottom: 4,
};

const footerLineStyle = {
  color: "rgba(255,255,255,0.92)",
  fontWeight: 500,
  fontSize: 13,
  lineHeight: 1.45,
};

const footerLogoLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 8,
  borderRadius: 12,
};

const footerLogoImgStyle = {
  width: 64,
  height: "auto",
  display: "block",
};

const footerDividerStyle = {
  height: 1,
  width: "min(640px, calc(100% - 60px))",
  background: "rgba(255,255,255,0.35)",
  margin: "4px auto 0",
};

const footerBottomMetaStyle = {
  marginTop: 12,
  textAlign: "center",
  color: "rgba(255,255,255,0.92)",
  fontSize: 13,
  fontWeight: 600,
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

const footerCss = `
.footerNavLink{
  color: rgba(255,255,255,0.92);
  font-weight: 400;
  font-size: 14px;
  text-decoration: none;
  display: inline-block;
  position: relative;
  padding: 2px 0;
  transform: translateZ(0);
  transition: transform 220ms cubic-bezier(0.22,1,0.36,1);
}

.footerNavLink::after{
  content: "";
  position: absolute;
  left: 0;
  bottom: -3px;
  height: 1px;
  width: 100%;
  background: rgba(255,255,255,0.85);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 220ms cubic-bezier(0.22,1,0.36,1);
}

@media (hover:hover) and (pointer:fine){
  .footerNavLink:hover{
    transform: scale(1.03);
  }
  .footerNavLink:hover::after{
    transform: scaleX(1);
  }
}

@media (max-width: 720px){
  .appFooter .footerGrid{
    grid-template-columns: 1fr;
  }
}
`;
