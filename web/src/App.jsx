// web/src/App.jsx
import { useMemo } from "react";
import {
  BrowserRouter,
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

import EnvBadge from "./components/EnvBadge.jsx";

// Public pages
import About from "./pages/about.jsx";
import Privacy from "./pages/privacy.jsx";
import PublicContact from "./pages/contactPublic.jsx";
import NewsPost from "./pages/news-post.jsx";
import { POSTS } from "./data/posts.js";

// Members pages (protected)
import MembersLayout from "./pages/members/MembersLayout.jsx";
import MembersHome from "./pages/members/MembersHome.jsx";
import Profile from "./pages/members/Profile.jsx";
import ContactExec from "./pages/members/ContactExec.jsx";
import Seniority from "./pages/seniority.jsx";
import Documents from "./pages/documents.jsx";
import DataCharts from "./pages/data-charts.jsx";
import PeerSupport from "./pages/peer-support.jsx";
import Faq from "./pages/faq.jsx";
import TakeAction from "./pages/take-action.jsx";
import Local279 from "./pages/local279.jsx";
import Discounts from "./pages/discounts.jsx";

import ShareBar from "./components/ShareBar.jsx";
import MemberHamburgerMenu from "./components/MemberHamburgerMenu.jsx";

function Shell() {
  const { pathname } = useLocation();
  const inMembers = pathname.startsWith("/members");
  const containerClass = inMembers ? "main mainMembers" : "container main";

  return (
    <div className="appShell">
      <EnvBadge />
      <NavBar />

      <main className={containerClass}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

function MemberGate({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>

      <SignedOut>
        <section className="card">
          <h1 className="h1">Members Area</h1>
          <p className="muted">Sign in to access member resources.</p>
          <SignInButton
            mode="modal"
            afterSignInUrl="/members"
            afterSignUpUrl="/members"
          >
            <button type="button" className="textBtn">
              Sign in
            </button>
          </SignInButton>
        </section>
      </SignedOut>
    </>
  );
}

function normalizePublicSrc(src) {
  if (!src) return "";
  let s = String(src).trim();
  if (s.startsWith("public/")) s = s.slice("public/".length);
  if (!s.startsWith("/")) s = `/${s}`;
  return s;
}

function makePostUrl(id) {
  if (typeof window === "undefined") return `/news/${id}`;
  return `${window.location.origin}/news/${id}`;
}

function Home() {
  const posts = useMemo(() => {
    return [...POSTS].sort((a, b) => {
      const ap = a.pinned ? 1 : 0;
      const bp = b.pinned ? 1 : 0;
      if (bp !== ap) return bp - ap;
      return String(b.date || "").localeCompare(String(a.date || ""));
    });
  }, []);

  return (
    <section className="card">
      <h1 className="h1">Updates</h1>
      <p className="muted">Posts and portal updates from OPSEU Local 279.</p>

      <div className="postList">
        {posts.map((p) => {
          const thumb = normalizePublicSrc(
            p.thumbnailSrc || "blog/l279-logo-blue.png",
          );
          const hero = normalizePublicSrc(p.heroSrc);
          const postUrl = makePostUrl(p.id);

          return (
            <article key={p.id} className="postCard">
              {hero ? (
                <Link
                  to={`/news/${p.id}`}
                  className="postHeroLink"
                  aria-label={p.title}
                >
                  <img
                    className="postHeroImg"
                    src={hero}
                    alt=""
                    loading="lazy"
                  />
                </Link>
              ) : null}

              <div className="postBody">
                <div className="postRow">
                  {thumb ? (
                    <img
                      className="postRowThumb"
                      src={thumb}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="postRowThumb" aria-hidden="true" />
                  )}

                  <div className="postHead">
                    <Link className="postItemTitle" to={`/news/${p.id}`}>
                      {p.title}
                    </Link>

                    <div className="postItemMeta">
                      {p.pinned ? (
                        <span className="postItemPinned">Pinned</span>
                      ) : null}
                      {p.date ? <span>{p.date}</span> : null}
                      {p.author ? <span>• {p.author}</span> : null}
                    </div>
                  </div>
                </div>

                {p.summary ? (
                  <div className="postItemSummary">{p.summary}</div>
                ) : null}

                <div className="postShareRow" aria-label="Share this post">
                  <ShareBar
                    title={p.title}
                    text={p.summary || ""}
                    url={postUrl}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt14">
        <SignedIn>
          <Link className="link" to="/members">
            Go to Members Area
          </Link>
        </SignedIn>

        <SignedOut>
          <SignInButton
            mode="modal"
            afterSignInUrl="/members"
            afterSignUpUrl="/members"
          >
            <button type="button" className="textBtn">
              Sign in to Members Area
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </section>
  );
}

function NotFound() {
  return (
    <section className="card">
      <h1 className="h1">Not found</h1>
      <p className="muted">That page doesn’t exist.</p>
      <div className="mt12">
        <Link className="link" to="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}

// Small “coming soon” pages so your menu links don’t 404
function ComingSoon({ title }) {
  return (
    <section className="card">
      <h1 className="h1">{title}</h1>
      <p className="muted">Coming soon.</p>
    </section>
  );
}

function NavBar() {
  return (
    <header className="topbar">
      <div className="topbarInner">
        <div className="navLeft">
          <MemberHamburgerMenu />
        </div>

        <Link to="/" className="brand" aria-label="OPSEU Local 279 Home">
          <img
            className="brandLogo"
            src="/l279-logo-blue.svg"
            alt="OPSEU Local 279"
          />
        </Link>

        <div className="navRight">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <SignInButton
              mode="modal"
              afterSignInUrl="/members"
              afterSignUpUrl="/members"
            >
              <button type="button" className="textBtn">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="appFooter">
      <div className="footerInner">
        <div className="footerGrid">
          <div className="footerAddress">
            <div className="footerLine">505 York Blvd., 2nd Floor</div>
            <div className="footerLine">Hamilton, ON&nbsp;&nbsp;L8R 3K4</div>
            <div className="footerLine">
              905-538-0601&nbsp;&nbsp;1-844-765-1405
            </div>
            <div className="footerLine">Fax: (905) 525-2377</div>
          </div>

          <nav className="footerLinks" aria-label="Footer">
            <Link to="/privacy">Privacy</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="footerLogo">
            <a
              href="https://opseu.org"
              target="_blank"
              rel="noreferrer"
              aria-label="OPSEU website"
            >
              <img src="/opseuLogo.svg" alt="OPSEU" />
            </a>
          </div>
        </div>

        <div className="footerDivider" />

        <div className="footerBottom">
          <Link className="footerBottomLink" to="/contact">
            Report a bug
          </Link>

          <div className="footerCredit">TJ3D | 2026</div>

          <div className="footerCopyright">
            © {new Date().getFullYear()} OPSEU Local 279
          </div>
        </div>
      </div>
    </footer>
  );
}

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
                <MembersLayout />
              </MemberGate>
            }
          >
            <Route index element={<MembersHome />} />

            {/* Keep Documents route if you still want it, even if it’s not in menu */}
            <Route path="documents" element={<Documents />} />
            <Route path="collective-agreement" element={<Documents />} />
            <Route path="agreement" element={<Documents />} />

            {/* Main items */}
            <Route path="peer-support" element={<PeerSupport />} />
            <Route path="data-charts" element={<DataCharts />} />
            <Route path="wages-benefits" element={<DataCharts />} />
            <Route path="take-action" element={<TakeAction />} />

            {/* Local 279 hub + subpages */}
            <Route path="local279" element={<Local279 />} />
            <Route path="local279/seniority" element={<Seniority />} />
            <Route path="local279/discounts" element={<Discounts />} />
            <Route
              path="local279/grievances"
              element={<ComingSoon title="Local 279 — Grievances" />}
            />
            <Route
              path="local279/polls"
              element={<ComingSoon title="Local 279 — Polls & Surveys" />}
            />
            <Route
              path="local279/meetings"
              element={<ComingSoon title="Local 279 — Meetings" />}
            />

            {/* Still accessible (even if not in main menu) */}
            <Route path="discounts" element={<Discounts />} />
            <Route path="seniority" element={<Seniority />} />
            <Route path="faq" element={<Faq />} />
            <Route path="contact" element={<ContactExec />} />
            <Route path="profile" element={<Profile />} />

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Catch-all for public */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
