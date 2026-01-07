// web/src/App.jsx

import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
  useNavigate,
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
  faFileLines,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

// Pages (keep filenames lowercase, imports match exactly)
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
          <Route index element={<Home />} />

          {/* Members area (protected) */}
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

          {/* Optional: keep a friendly fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/* Shell layout: navbar + consistent margins */
function Shell() {
  return (
    <div style={pageStyle}>
      <NavBar />
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
}

/* Member route guard */
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

/* Navbar: hamburger dropdown left, BIG logo centered, user controls right */
function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  function closeMenu() {
    setMenuOpen(false);
  }

  function goToHomeAndScroll(sectionId) {
    closeMenu();

    // If we're not on home, navigate first then scroll after route change
    if (location.pathname !== "/") {
      navigate("/");
      // Give React Router a tick to render Home
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return;
    }

    // Already on home
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
      {/* Left: hamburger + dropdown */}
      <div style={navLeftStyle} ref={menuWrapRef}>
        <button
          type="button"
          style={iconButtonStyle}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
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
              onClick={() => goToHomeAndScroll("about")}
            >
              <FontAwesomeIcon icon={faCircleInfo} style={dropdownIconStyle} />
              About Local 279
            </button>

            <SignedIn>
              <Link
                to="/member"
                style={dropdownItemStyle}
                role="menuitem"
                onClick={closeMenu}
              >
                <FontAwesomeIcon icon={faFileLines} style={dropdownIconStyle} />
                Members Area
              </Link>

              <Link
                to="/member/contact"
                style={dropdownItemStyle}
                role="menuitem"
                onClick={closeMenu}
              >
                <FontAwesomeIcon icon={faEnvelope} style={dropdownIconStyle} />
                Contact
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal" afterSignInUrl="/member" afterSignUpUrl="/member">
                <button type="button" style={dropdownButtonStyle} role="menuitem">
                  <FontAwesomeIcon icon={faFileLines} style={dropdownIconStyle} />
                  Member Login
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        )}
      </div>

      {/* Center: BIG logo */}
      <Link to="/" style={logoLinkStyle} aria-label="OPSEU Local 279 Home">
        {/* Put your blue logo file in web/public */}
        <img
          src="/l279-logo-blue.png"
          alt="OPSEU Local 279"
          style={logoStyle}
        />
      </Link>

      {/* Right: user controls */}
      <div style={navRightStyle}>
        <SignedOut>
          <SignInButton mode="modal" afterSignInUrl="/member" afterSignUpUrl="/member">
            <button style={navButtonStyle}>Member Login</button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div style={signedInGroupStyle}>
            <Link to="/member" style={navLinkStyle}>
              Member Menu
            </Link>
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </header>
  );
}

/* Home: public blog-style landing */
function Home() {
  return (
    <>
      <section style={cardStyle}>
        <h1 style={h1Style}>Welcome to OPSEU Local 279</h1>
        <p style={pStyle}>
          We represent Norfolk County Paramedics. This site shares public union news and initiatives.
          Members can sign in using the button in the top menu for access to member resources.
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
          OPSEU Local 279 represents paramedics working for Norfolk County Paramedic Services. Our goal is
          straightforward: protect members’ rights, improve working conditions, and support a healthy workplace.
        </p>
      </section>

      <section id="contact" style={cardStyle}>
        <h2 style={h2Style}>Contact</h2>
        <p style={pStyle}>
          If you are a member and need support or have a workplace issue, please sign in and use the members contact
          options.
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
        <Link to="/" style={inlineLinkStyle}>
          home page
        </Link>
        .
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
  height: 88,
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
  alignItems: "center",
  position: "relative",
};

const iconButtonStyle = {
  width: 46,
  height: 46,
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.10)",
  background: "#ffffff",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  fontSize: 18,
  color: "#0e6ea6",
};

const dropdownStyle = {
  position: "absolute",
  top: 56,
  left: 0,
  minWidth: 240,
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

const dropdownIconStyle = {
  color: "#0e6ea6",
};

const logoLinkStyle = {
  justifySelf: "center",
  display: "inline-flex",
  alignItems: "center",
  padding: 6,
};

const logoStyle = {
  height: 68,
  width: "auto",
  display: "block",
};

const navRightStyle = {
  justifySelf: "end",
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const navButtonStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(14,110,166,0.35)",
  background: "rgba(14,110,166,0.10)",
  color: "#0e6ea6",
  fontSize: 14,
  fontWeight: 900,
  cursor: "pointer",
};

const navLinkStyle = {
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(14,110,166,0.25)",
  background: "rgba(14,110,166,0.08)",
  color: "#0e6ea6",
  fontWeight: 900,
  fontSize: 14,
};

const signedInGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const mainStyle = {
  width: "100%",
  maxWidth: 760, // narrower content column = wider margins left/right
  margin: "0 auto",
  padding: "26px 20px 56px",
  display: "grid",
  gap: 16,
};

const cardStyle = {
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
  color: "#0e6ea6",
};

const h2Style = {
  margin: "0 0 8px",
  fontSize: 18,
  fontWeight: 950,
  color: "#0e6ea6",
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
  color: "#0e6ea6",
  fontWeight: 900,
  textDecoration: "none",
};

const primaryButtonStyle = {
  marginTop: 10,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(14,110,166,0.35)",
  background: "rgba(14,110,166,0.10)",
  color: "#0e6ea6",
  fontSize: 14,
  fontWeight: 950,
  cursor: "pointer",
};
