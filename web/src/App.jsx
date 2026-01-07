import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

import Contact from "./pages/contact.jsx";
import Faq from "./pages/faq.jsx";
import Documents from "./pages/documents.jsx";
import Agreement from "./pages/agreement.jsx";
import Member from "./pages/member.jsx";

export default function App() {
  return (
    <BrowserRouter>
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/Contact" element={<Contact />} />
  <Route path="/Faq" element={<Faq />} />
  <Route path="/Documents" element={<Documents />} />
  <Route path="/Agreement" element={<Agreement />} />
  <Route path="/Member" element={<Member />} />
</Routes>
    </BrowserRouter>
  );
}

function NavBar() {
  return (
    <header style={navStyle}>
      {/* Left spacer keeps the center logo truly centered */}
      <div style={navSpacer} aria-hidden="true" />

      <Link to="/" style={logoLinkStyle} aria-label="OPSEU Local 279 Home">
        <img
          src="/l279-logo-blue.png"
          alt="OPSEU Local 279"
          style={logoStyle}
        />
      </Link>

      <div style={navRightStyle}>
        <SignedOut>
          <SignInButton mode="modal" afterSignInUrl="/Member" afterSignUpUrl="/Member">
            <button style={navButtonStyle}>Member Login</button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div style={signedInGroupStyle}>
            <Link to="/Member" style={navLinkStyle}>Member Menu</Link>
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </header>
  );
}


function Home() {
  return (
    <div style={pageStyle}>
      <NavBar />

      <main style={mainStyle}>
        <section style={cardStyle}>
          <h1 style={h1Style}>Welcome to OPSEU Local 279</h1>
          <p style={pStyle}>
            We represent Norfolk County Paramedics. This site shares public union news and initiatives.
            Members can sign in using the button above for access to member resources.
          </p>
        </section>

        {/* Placeholder for public news feed */}
        <section style={cardStyle}>
          <h2 style={h2Style}>Latest Union News</h2>
          <p style={mutedStyle}>
            Coming next: Toy Drive updates, Local 279 announcements, and community initiatives.
          </p>
        </section>
      </main>
    </div>
  );
}

/* Styles */
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
  height: 64,
  background: "#ffffff",
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  padding: "0 14px",
};

const navSpacer = {
  height: 1,
};

const logoLinkStyle = {
  justifySelf: "center",
  display: "inline-flex",
  alignItems: "center",
};

const logoStyle = {
  height: 42,
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
  fontWeight: 800,
  cursor: "pointer",
};

const navLinkStyle = {
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(14,110,166,0.25)",
  background: "rgba(14,110,166,0.08)",
  color: "#0e6ea6",
  fontWeight: 800,
  fontSize: 14,
};

const signedInGroupStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const mainStyle = {
  width: "100%",
  maxWidth: 860,
  margin: "0 auto",
  padding: "18px 14px 40px",
  display: "grid",
  gap: 14,
};

const cardStyle = {
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
};

const h1Style = {
  margin: 0,
  fontSize: 22,
  fontWeight: 900,
  color: "#0e6ea6",
};

const h2Style = {
  margin: "0 0 8px",
  fontSize: 18,
  fontWeight: 900,
  color: "#0e6ea6",
};

const pStyle = {
  margin: "10px 0 0",
  lineHeight: 1.45,
  fontSize: 15,
};

const mutedStyle = {
  margin: 0,
  opacity: 0.75,
  fontSize: 14,
  lineHeight: 1.45,
};
