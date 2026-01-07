import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

import Contact from "./pages/Contact.jsx";
import Faq from "./pages/Faq.jsx";
import Documents from "./pages/Documents.jsx";
import Agreement from "./pages/Agreement.jsx";
import Member from "./pages/Member.jsx";

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

function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0e6ea6",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 520, textAlign: "center", color: "#fff" }}>
        <img
          src="/l279-logo-wht.png"
          alt="OPSEU Local 279"
          style={{ width: 190, height: "auto", margin: "0 auto 18px", display: "block" }}
        />

        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>OPSEU Local 279</h1>
        <p style={{ margin: "10px 0 18px", opacity: 0.9 }}>Norfolk County Paramedics</p>

        <div
          style={{
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.20)",
            borderRadius: 16,
            padding: 16,
            textAlign: "left",
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800 }}>Members</div>
              <div style={{ opacity: 0.9, fontSize: 14 }}>Login for member resources</div>
            </div>

            <SignedOut>
              <SignInButton mode="modal" afterSignInUrl="/Member" afterSignUpUrl="/Member">
                <button style={buttonStyle}>Member Login</button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Link to="/Member" style={linkButtonStyle}>Member Menu</Link>
                <UserButton />
              </div>
            </SignedIn>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <Link to="/Agreement" style={linkButtonStyle}>Open Collective Agreement</Link>
            <Link to="/Faq" style={linkButtonStyle}>FAQ</Link>
            <Link to="/Documents" style={linkButtonStyle}>Documents and Standards</Link>
            <Link to="/Contact" style={linkButtonStyle}>Contact Executive and Committees</Link>
          </div>
        </div>

        <p style={{ marginTop: 18, opacity: 0.85, fontSize: 14 }}>
          Public info and updates coming next: Meet your Norfolk Paramedics, charitable initiatives, and Local 279 news.
        </p>
      </div>
    </main>
  );
}

const buttonStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.35)",
  background: "rgba(255,255,255,0.14)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const linkButtonStyle = {
  display: "block",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(255,255,255,0.10)",
  color: "#fff",
  fontWeight: 700,
};
