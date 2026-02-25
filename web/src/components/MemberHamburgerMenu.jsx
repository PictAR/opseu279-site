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

  // Combined Discounts + OPSEU discounts into ONE place
  { label: "Discounts", to: "/members/local279#discounts" },
];

export default function MemberHamburgerMenu() {
  const { pathname } = useLocation();
  const inMembers = pathname.startsWith("/members");
  const inLocal279 = pathname.startsWith("/members/local279");

  const [openForPath, setOpenForPath] = useState(null);
  const open = openForPath === pathname;

  const btnRef = useRef(null);

  const closeMenu = () => setOpenForPath(null);
  const toggleMenu = () =>
    setOpenForPath((prev) => (prev === pathname ? null : pathname));

  // ESC closes
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Body scroll lock + return focus to button when closing
  useEffect(() => {
    if (open) {
      document.body.classList.add("menuOpen");
      return () => document.body.classList.remove("menuOpen");
    }
    document.body.classList.remove("menuOpen");
    btnRef.current?.focus?.();
  }, [open]);

  return (
    <div className="mhWrap">
      <button
        ref={btnRef}
        type="button"
        className="mhBtn"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mhMenu"
        onClick={toggleMenu}
      >
        ☰
      </button>

      <div
        className={`mhOverlay${open ? " isOpen" : ""}`}
        aria-hidden="true"
        onClick={closeMenu}
      />

      <nav
        id="mhMenu"
        className={`mhMenu${open ? " isOpen" : ""}`}
        aria-hidden={!open}
        aria-label="Site menu"
      >
        <div className="mhDrawerHeader">
          <div className="mhDrawerTitle">Menu</div>
          <button
            type="button"
            className="mhCloseBtn"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            ✕
          </button>
        </div>

        <div className="mhDrawerBody">
          {/* Public dropdown */}
          <details className="mhDrop">
            <summary className="mhDropSummary">
              <span>Public</span>
              <span className="mhDropCaret" aria-hidden="true">
                ›
              </span>
            </summary>

            <div className="mhDropBody">
              {PUBLIC_LINKS.map((it) => (
                <Link
                  key={it.to}
                  to={it.to}
                  className="mhLink"
                  onClick={closeMenu}
                >
                  {it.label}
                </Link>
              ))}
            </div>
          </details>

          <div className="mhDivider" />

          <SignedIn>
            {/* Members dropdown */}
            <details className="mhDrop">
              <summary className="mhDropSummary">
                <span>Members</span>
                <span className="mhDropCaret" aria-hidden="true">
                  ›
                </span>
              </summary>

              <div className="mhDropBody">
                {!inMembers ? (
                  <Link to="/members" className="mhLink" onClick={closeMenu}>
                    Members Home
                  </Link>
                ) : (
                  <>
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

                    {/* Local 279 dropdown */}
                    <details className="mhDrop mhDropSub">
                      <summary className="mhDropSummary">
                        <span>Local 279</span>
                        <span className="mhDropCaret" aria-hidden="true">
                          ›
                        </span>
                      </summary>

                      <div className="mhDropBody">
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
                      </div>
                    </details>
                  </>
                )}
              </div>
            </details>
          </SignedIn>

          <SignedOut>
            {/* Members dropdown (signed out) */}
            <details className="mhDrop" defaultOpen={false}>
              <summary className="mhDropSummary">
                <span>Members</span>
                <span className="mhDropCaret" aria-hidden="true">
                  ›
                </span>
              </summary>

              <div className="mhDropBody">
                <div className="mhHint">
                  Sign in to access member resources.
                </div>

                <SignInButton
                  mode="modal"
                  afterSignInUrl="/members"
                  afterSignUpUrl="/members"
                >
                  <button
                    type="button"
                    className="mhSignInBtn"
                    onClick={closeMenu}
                  >
                    Sign in
                  </button>
                </SignInButton>
              </div>
            </details>
          </SignedOut>
        </div>
      </nav>
    </div>
  );
}
