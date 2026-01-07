// web/src/App.jsx

import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
  useLocation,
  useNavigate,
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
} from "@fortawesome/free-solid-svg-icons";

// Pages (filenames lowercase, imports must match exactly)
import Contact from "./pages/contact.jsx";
import Faq from "./pages/faq.jsx";
import Documents from "./pages/documents.jsx";
import Agreement from "./pages/agreement.jsx";
import Member from "./pages/member.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          {/* Public */}
          <Route index element={<Home />} />

          {/* Members (protected) */}
          <Route
            path="/member"
            element={
              <MemberGate>
                <Member />
              </MemberGate>
            }
          />
          <Route
            path="/member/agreement"
            element={
              <MemberGate>
                <Agreement />
              </MemberGate>
            }
          />
          <Route
            path="/member/documents"
            element={
              <MemberGate>
                <Documents />
              </MemberGate>
            }
          />
          <Route
            path="/member/faq"
            element={
              <MemberGate>
                <Faq />
              </MemberGate>
            }
          />
          <Route
            path="/member/contact"
            element={
              <MemberGate>
                <Contact />
              </MemberGate>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/* Layout: navbar + content + footer */
function Shell() {
  return (
    <div style={pageStyle}>
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
          <SignInButton mode="modal" afterSignInUrl="/member" afterSignUpUrl="/member">
            <button style={primaryButtonStyle}>Member Login</button>
          </SignInButton>
        </section>
      </SignedOut>
    </>
  );
}

/* Navbar: hamburger dropdown left, BIG centered logo, user menu top-right (signed in only) */
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
            <Link to="/" style={dropdownItemStyle} role="menuitem" onClick={closeMenu}>
              <FontAwesomeIcon icon={faNewspaper} style={dropdownIconStyle} />
              Union News
            </Link>

            <button
              type="button"
              style={dropdownButtonStyle}
              role="menuitem"
              onClick={() => goHomeAndScroll("about")}
            >
              <FontAwesomeIcon icon={faCircleInfo} style={dropdownIconStyle} />
              About Local 279
            </button>

            <button
              type="button"
              style={dropdownButtonStyle}
              role="menuitem"
              onClick={() => goHomeAndScroll("contact")}
            >
              <FontAwesomeIcon icon={faEnvelope} style={dropdownIconStyle} />
              Contact
            </button>

            <SignedOut>
              <SignInButton mode="modal" afterSignInUrl="/member" afterSignUpUrl="/member">
                <button type="button" style={dropdownButtonStyle} role="menuitem">
                  <FontAwesomeIcon icon={faRightToBracket} style={dropdownIconStyle} />
                  Member Login
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link to="/member" style={dropdownItemStyle} role="menuitem" onClick={closeMenu}>
                <FontAwesomeIcon icon={faFileLines} style={dropdownIconStyle} />
                Members Area
              </Link>
              <Link to="/member/documents" style={dropdownItemStyle} role="menuitem" onClick={closeMenu}>
                <FontAwesomeIcon icon={faFileLines} style={dropdownIconStyle} />
                Documents and Standards
              </Link>
              <Link to="/member/agreement" style={dropdownItemStyle} role="menuitem" onClick={closeMenu}>
                <FontAwesomeIcon icon={faFileLines} style={dropdownIconStyle} />
                Collective Agreement
              </Link>
              <Link to="/member/faq" style={dropdownItemStyle} role="menuitem" onClick={closeMenu}>
                <FontAwesomeIcon icon={faFileLines} style={dropdownIconStyle} />
                FAQ
              </Link>
              <Link to="/member/contact" style={dropdownItemStyle} role="menuitem" onClick={closeMenu}>
                <FontAwesomeIcon icon={faEnvelope} style={dropdownIconStyle} />
                Members Contact
              </Link>
            </SignedIn>
          </div>
        )}
      </div>

      {/* Center */}
      <Link to="/" style={logoLinkStyle} aria-label="OPSEU Local 279 Home">
        {/* Put your blue logo file in web/public */}
        <img
          src="/l279-logo-blue.png"
          alt="OPSEU Local 279"
          style={logoStyle}
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

/* Footer: links + date + credit + member login button */
function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

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
              <SignInButton mode="modal" afterSignInUrl="/member" afterSignUpUrl="/member">
                <button style={footerButtonStyle}>Member Login</button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link to="/member" style={footerMemberLinkStyle}>Go to Members Area</Link>
            </SignedIn>
          </div>
        </div>

        <div style={footerMetaStyle}>
          <div style={footerSmallStyle}>© {year} OPSEU Local 279</div>
          <div style={footerSmallStyle}>Website by Tristan Britt</div>
        </div>
      </div>
    </footer>
  );
}

/* Public home */
function Home() {
  return (
    <>
      <section style={cardStyle}>
        <h1 style={h1Style}>Welcome to OPSEU Local 279</h1>
        <p style={pStyle}>
          We represent Norfolk County Paramedics. This site shares public union news and initiatives. Members can access
          documents, standards, and internal resources by signing in.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={h2Style}>Latest Union News</h2>
        <p style={mutedStyle}>
          Coming next: Toy Drive updates, Local 279 announcements, and community initiatives.
        </p>
      </section>

      <section id="about" style={cardStyle}>
        <h2 style={h2Style}>About Local 279</h2>
        <p style={pStyle}>
          OPSEU Local 279 represents paramedics working for Norfolk County Paramedic Services. We advocate for fair
          working conditions, safe practice, and a healthy workplace.
        </p>
      </section>

      <section id="contact" style={cardStyle}>
        <h2 style={h2Style}>Contact</h2>
        <p style={pStyle}>
          Public questions and community initiatives can be shared here. Members needing support should sign in and use
          the members contact options.
        </p>
      </section>
    </>
  );
}

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

/* Styles */

const pageStyle = {
  minHeight: "100vh",
  background: "#ffffff",
  color: "#0b2b3a",
};

const navStyle = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  height: 92,
  background: "#ffffff",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  padding: "0 16px",
};

const navLeftStyle = {
  justifySelf: "start",
  display: "flex",
  alignItems: "c
