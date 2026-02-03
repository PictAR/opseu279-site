// web/src/components/MemberHamburgerMenu.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

const PUBLIC_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Privacy", to: "/privacy" },
  { label: "Contact", to: "/contact" },
];

const MEMBER_MAIN_LINKS = [
  { label: "Members Home", to: "/members" },
  { label: "Peer Support", to: "/members/peer-support" },
  { label: "Data & Charts", to: "/members/data-charts" },
  { label: "Take Action", to: "/members/take-action" },
];

const LOCAL279_LINKS = [
  { label: "Home", to: "/members/local279" },
  { label: "Executive", to: "/members/local279#exec" },
  { label: "Calendar", to: "/members/local279#calendar" },
  { label: "Seniority lists", to: "/members/local279#seniority" },
  { label: "Grievances", to: "/members/local279#grievances" },
  { label: "Polls & Surveys", to: "/members/local279#polls" },
  { label: "Meetings", to: "/members/local279#meetings" },
  { label: "Discounts", to: "/members/local279#discounts" },
];

export default function MemberHamburgerMenu() {
  const { pathname } = useLocation();
  const inMembers = pathname.startsWith("/members");

  const [openForPath, setOpenForPath] = useState(null);
  const open = openForPath === pathname;

  const wrapRef = useRef(null);

  const closeMenu = () => setOpenForPath(null);
  const toggleMenu = () =>
    setOpenForPath((prev) => (prev === pathname ? null : pathname));

  // Escape closes (state change happens inside event callback = fine)
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Click outside closes
  useEffect(() => {
    function onDown(e) {
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target)) closeMenu();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, []);

  return (
    <div className="mhWrap" ref={wrapRef}>
      <button
        type="button"
        className="mhBtn"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mhMenu"
        onClick={toggleMenu}
      >
        ☰
      </button>

      <nav
        id="mhMenu"
        className="mhMenu"
        data-open={open ? "1" : "0"}
        aria-hidden={!open}
        aria-label="Site menu"
      >
        <div className="mhSection">
          {PUBLIC_LINKS.map((it) => (
            <Link key={it.to} to={it.to} className="mhLink" onClick={closeMenu}>
              {it.label}
            </Link>
          ))}
        </div>

        <div className="mhDivider" />

        <SignedIn>
          <div className="mhSection">
            {!inMembers ? (
              <Link to="/members" className="mhLink" onClick={closeMenu}>
                Members Home
              </Link>
            ) : null}

            {MEMBER_MAIN_LINKS.map((it) => (
              <Link
                key={it.to}
                to={it.to}
                className="mhLink"
                onClick={closeMenu}
              >
                {it.label}
              </Link>
            ))}

            <details className="mhDetails">
              <summary className="mhLink mhSummary">Local 279</summary>

              <div className="mhSubList">
                {LOCAL279_LINKS.map((it) => (
                  <Link
                    key={it.to}
                    to={it.to}
                    className="mhLink mhSubLink"
                    onClick={closeMenu}
                  >
                    {it.label}
                  </Link>
                ))}

                <a
                  href="https://opseu.org/members/discounts/"
                  target="_blank"
                  rel="noreferrer"
                  className="mhLink mhSubLink"
                  onClick={closeMenu}
                >
                  OPSEU discounts
                </a>
              </div>
            </details>

            <a
              href="https://opseu.org"
              target="_blank"
              rel="noreferrer"
              className="mhLink"
              onClick={closeMenu}
            >
              OPSEU.org
            </a>
          </div>
        </SignedIn>

        <SignedOut>
          <div className="mhSection">
            <div className="mhSectionTitle">Members</div>
            <div className="mhHint">Sign in to access member resources.</div>

            <SignInButton
              mode="modal"
              afterSignInUrl="/members"
              afterSignUpUrl="/members"
            >
              <button type="button" className="mhSignInBtn" onClick={closeMenu}>
                Sign in
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </nav>
    </div>
  );
}
