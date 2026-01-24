// web/src/components/MemberFabMenu.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function MemberFabMenu() {
  const [open, setOpen] = useState(false);

  const items = useMemo(() => {
    const base = "/members";

    return [
      { label: "Members Home", to: `${base}` },
      { label: "Public Home", to: `/` },

      { label: "Local 279", to: `${base}/local279` },

      { label: "Library", to: `${base}/documents` },
      { label: "Collective Agreement AI", to: `${base}/agreement` },

      { label: "Data & Charts", to: `${base}/data-charts` },
      { label: "Peer Support", to: `${base}/peer-support` },
      { label: "FAQ", to: `${base}/faq` },
      { label: "Take Action", to: `${base}/take-action` },
    ];
  }, []);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return (
    <>
      <style>{css}</style>

      <div
        className={`memberMenuOverlay ${open ? "isOpen" : ""}`}
        aria-hidden={!open}
      >
        <div className="memberMenuBackdrop" onClick={() => setOpen(false)} />

        <nav className="memberMenuDrawer" aria-label="Member Menu">
          <ul className="memberMenuList">
            {items.map((it) => (
              <li key={it.label} className="memberMenuItem">
                <Link
                  className="memberMenuLink"
                  to={it.to}
                  onClick={() => setOpen(false)}
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <button
        type="button"
        className={`memberFab ${open ? "isOpen" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <FontAwesomeIcon icon={open ? faXmark : faBars} />
      </button>
    </>
  );
}

const css = `
.memberFab{
  position: fixed;
  right: max(30px, env(safe-area-inset-left));
  bottom: calc(96px + env(safe-area-inset-bottom));
  z-index: 10050;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: 2px solid rgba(0,0,0,0.10);
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 26px rgba(0,0,0,0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: #0055b8;
  transition: transform 260ms cubic-bezier(0.22,1,0.36,1);
}

.memberFab.isOpen{
  transform: scale(1.02);
}

.memberMenuOverlay{
  position: fixed;
  inset: 0;
  z-index: 10040;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
}

.memberMenuOverlay.isOpen{
  opacity: 1;
  pointer-events: auto;
}

.memberMenuBackdrop{
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.38);
}

.memberMenuDrawer{
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  border-top: 1px solid rgba(0,0,0,0.10);

  padding: 18px 14px 26px;
  box-shadow: 0 -12px 30px rgba(0,0,0,0.20);

  max-height: min(76vh, 620px);
  overflow: auto;

  transform: translate3d(0, 110%, 0);
  transition: transform 520ms cubic-bezier(0.22,1,0.36,1);
}

.memberMenuOverlay.isOpen .memberMenuDrawer{
  transform: translate3d(0, 0, 0);
}

.memberMenuList{
  list-style: none;
  margin: 0;
  padding: 6px 0 0;

  display: grid;
  gap: 14px;
  justify-items: center;
  text-align: center;
}

.memberMenuItem{
  width: 100%;
  display: grid;
  justify-items: center;
}

/* Clean “text link” look */
.memberMenuLink{
  position: relative;
  display: inline-block;

  padding: 6px 0;
  color: #0055b8;
  font-weight: 400;
  font-size: 18px;
  letter-spacing: 0.2px;
  text-decoration: none;

  transform: translateZ(0);
  transition: transform 220ms cubic-bezier(0.22,1,0.36,1);
}

/* underline reveal */
.memberMenuLink::after{
  content: "";
  position: absolute;
  left: 50%;
  bottom: -4px;
  width: min(260px, 72vw);
  height: 2px;
  background: rgba(0,85,184,0.85);
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition: transform 220ms cubic-bezier(0.22,1,0.36,1);
  border-radius: 999px;
}

@media (hover: hover) and (pointer: fine){
  .memberMenuLink:hover{
    transform: scale(1.04);
  }
  .memberMenuLink:hover::after{
    transform: translateX(-50%) scaleX(1);
  }
}

/* keyboard focus */
.memberMenuLink:focus-visible{
  outline: 3px solid rgba(0,85,184,0.25);
  outline-offset: 6px;
  border-radius: 10px;
}
.memberMenuLink:focus-visible::after{
  transform: translateX(-50%) scaleX(1);
}

@media (prefers-reduced-motion: reduce){
  .memberFab,
  .memberMenuOverlay,
  .memberMenuDrawer,
  .memberMenuLink,
  .memberMenuLink::after{
    transition: none !important;
  }
}
`;
