import { Outlet, useLocation, Link } from "react-router-dom";
import BackButton from "../../components/BackButton";

export default function MembersLayout() {
  const location = useLocation();
  const isMembersHome = location.pathname === "/members" || location.pathname === "/members/";

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {!isMembersHome ? <BackButton fallback="/members" /> : null}

        <Link to="/members" style={{ textDecoration: "none", color: "inherit" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Members</h2>
        </Link>

        <div style={{ marginLeft: "auto", opacity: 0.75, fontSize: 12 }}>
          OPSEU Local 279
        </div>
      </header>

      <Outlet />
    </div>
  );
}
