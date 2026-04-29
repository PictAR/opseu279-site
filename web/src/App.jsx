// web/src/App.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

import norfolkCountySvg from "./assets/norfolkCounty.svg";

import About from "./pages/about.jsx";
import Privacy from "./pages/privacy.jsx";
import PublicContact from "./pages/contactPublic.jsx";
import NewsPost from "./pages/news-post.jsx";
import NewsIndex from "./pages/news-index.jsx";
import Local279 from "./pages/local279.jsx";
import ParityPage from "./pages/ParityPage";

<Route path="/parity" element={<ParityPage />} />;

import OpseuNewsCarousel from "./components/OpseuNewsCarousel.jsx";
import MemberHamburgerMenu from "./components/MemberHamburgerMenu.jsx";
import WageComparisonChart from "./components/WageComparisonChart.jsx";

import { PUBLIC_POSTS } from "./data/posts.js";
import * as localDiscountsMod from "./data/localDiscounts.js";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xzddqyzn";

/* =========================
   Small helpers
========================= */
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

function TopbarAuth() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return null; // prevents weird interim UI

  return isSignedIn ? (
    <UserButton />
  ) : (
    <SignInButton
      mode="modal"
      afterSignInUrl="/members"
      afterSignUpUrl="/members"
    >
      <button type="button" className="mhBtn" aria-label="Sign in">
        Sign in
      </button>
    </SignInButton>
  );
}

/* =========================
   Public home bits
========================= */
function OlderPostsCarousel({ posts }) {
  const rowRef = useRef(null);
  const items = Array.isArray(posts) ? posts.slice(0, 3) : [];

  function scrollByCards(dir) {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector("[data-card='1']");
    const width = card ? card.getBoundingClientRect().width : 240;
    row.scrollBy({ left: dir * (width + 12), behavior: "smooth" });
  }

  if (!items.length) return <div className="opcEmpty">No news found.</div>;

  return (
    <div className="opc">
      <div className="opcTop">
        <Link to="/news" className="opcAllBtn" aria-label="View all news">
          All news
        </Link>
      </div>

      <div className="opcRail" aria-label="More news carousel">
        <button
          type="button"
          className="opcEdgeBtn opcNavBtn"
          onClick={() => scrollByCards(-1)}
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div ref={rowRef} className="opcRow">
          {items.map((p) => {
            const href = p.permalink || `/news/${p.id}`;

            const rawImg = p.heroSrc || p.thumbnailSrc || "";
            const img = rawImg
              ? rawImg.startsWith("/")
                ? rawImg
                : `/${rawImg}`
              : "/l279-logo-blue.png";

            return (
              <Link
                key={p.id || href}
                to={href}
                className="opcCard"
                data-card="1"
                aria-label={`Open post: ${p.title}`}
              >
                <div className="opcImgWrap">
                  <img src={img} alt="" className="opcImg" loading="lazy" />
                </div>
                <div className="opcBody">
                  <div className="opcTitle">{p.title}</div>
                </div>
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="opcEdgeBtn opcNavBtn"
          onClick={() => scrollByCards(1)}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </div>
  );
}

function Home() {
  const posts = Array.isArray(PUBLIC_POSTS) ? PUBLIC_POSTS : [];

  const sorted = useMemo(() => {
    return [...posts].sort(
      (a, b) => Number(new Date(b.date)) - Number(new Date(a.date)),
    );
  }, [posts]);

  const featured = useMemo(
    () => sorted.find((p) => p?.pinned) || sorted[0] || null,
    [sorted],
  );

  const older = useMemo(() => {
    if (!featured) return sorted.slice(0, 12);
    return sorted.filter((p) => p !== featured).slice(0, 12);
  }, [sorted, featured]);

  if (!featured) {
    return (
      <section className="home">
        <div className="card">
          <h1 className="h1">OPSEU Local 279</h1>
          <p className="muted">
            No posts found. Check your PUBLIC_POSTS data source.
          </p>
        </div>
      </section>
    );
  }

  const featuredHref = featured.permalink || `/news/${featured.id}`;

  return (
    <section className="home">
      <section className="card" aria-label="Welcome">
        <div className="sectionHead">
          <h1 className="h1">Welcome to OPSEU279.com</h1>
          <p className="muted">
            OPSEU Local 279 represents Norfolk County Paramedics.
          </p>
          <p className="muted">
            This public page shares news and information relevant to our members
            and the public.
          </p>
        </div>
      </section>

      <article className="card homeFeatured">
        <div className="homeFeaturedStage">
          {featured.heroSrc ? (
            <Link
              to={featuredHref}
              className="homeFeaturedStageLink"
              aria-label="Open featured post"
            >
              <img
                src={featured.heroSrc}
                alt=""
                className="homeFeaturedBgImg"
                loading="lazy"
              />
            </Link>
          ) : (
            <div className="homeFeaturedBgFallback" aria-hidden="true" />
          )}

          <div className="homeFeaturedOverlay">
            <div className="homeFeaturedBody">
              <div className="homeFeaturedTop">
                {featured.thumbnailSrc ? (
                  <img
                    src={featured.thumbnailSrc}
                    alt=""
                    className="homeFeaturedThumb"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="homeFeaturedThumb isBlank"
                    aria-hidden="true"
                  />
                )}

                <div className="homeFeaturedHead">
                  <Link to={featuredHref} className="homeFeaturedTitle">
                    {featured.title}
                  </Link>

                  <div className="homeFeaturedMeta">
                    <span>{formatDate(featured.date)}</span>
                    {featured.author ? <span>· {featured.author}</span> : null}
                    {featured.pinned ? (
                      <span
                        className="badge"
                        aria-label="Pinned"
                        title="Pinned"
                      >
                        📌
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {featured.summary ? (
                <div className="homeFeaturedSummary">{featured.summary}</div>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      <section className="card" aria-label="Older posts">
        <div className="sectionHead">
          <h2 className="h2">More Posts</h2>
        </div>
        <OlderPostsCarousel posts={older} />
      </section>

      <section className="card who" aria-label="Local info">
        <details className="whoDetails">
          <summary className="whoSummary" aria-label="Who is OPSEU279?">
            <span className="whoTitle">Who is OPSEU279?</span>
            <span className="whoChevron" aria-hidden="true">
              ›
            </span>
          </summary>

          <div className="whoPanel">
            <div className="whoPanelInner">
              <div className="whoMedia" aria-hidden="true">
                <img
                  src="/l279-logo-blue.png"
                  alt=""
                  className="whoMediaImg"
                  loading="lazy"
                />
              </div>

              <div className="whoCopy">
                <p className="whoText">
                  OPSEU Local 279 represents Norfolk County Paramedics. This
                  public page shares local updates, resources, and news that
                  matters to our members.
                </p>

                <div className="whoActions">
                  <Link to="/members" className="whoMemberBtn">
                    Members Area
                  </Link>

                  <Link to="/contact" className="whoContactLink">
                    Contact Local 279
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </details>
      </section>

      <section className="card" aria-label="OPSEU news">
        <div className="sectionHead">
          <h2 className="h2">OPSEU news</h2>
          <p className="muted">Latest from OPSEU/SEFPO.</p>
        </div>
        <OpseuNewsCarousel limit={10} />
      </section>
    </section>
  );
}

/* =========================
   Members gate + pages
========================= */
function MembersGate({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <section className="page">
          <section className="card">
            <h1 className="pageTitle">Members Area</h1>
            <p className="muted">Sign in to access member resources.</p>

            <SignInButton
              mode="modal"
              afterSignInUrl="/members"
              afterSignUpUrl="/members"
            >
              <button type="button" className="primaryBtn">
                Sign in
              </button>
            </SignInButton>
          </section>
        </section>
      </SignedOut>
    </>
  );
}

function MembersHome() {
  const { user } = useUser();
  const name = user?.firstName || user?.username || user?.fullName || "member";

  return (
    <MembersGate>
      <section className="page membersHome">
        <section className="card membersWelcome">
          <h1 className="pageTitle">
            Hello {name}! Welcome to the Local279 Members Portal
          </h1>
          <p className="pageSub">
            Here you'll find member resources, local info, and tools to help you
            navigate your collective agreement and workplace rights.
          </p>
        </section>

        <section className="card">
          <p className="muted">
            Use the menu to navigate. This website/App is a work in progress.
          </p>
        </section>
      </section>
    </MembersGate>
  );
}

function MembersPeerSupport() {
  return (
    <MembersGate>
      <section className="page">
        <div className="pageHeader">
          <h1 className="pageTitle">Peer Support</h1>
          <p className="pageSub">Placeholder page.</p>
        </div>

        <section className="card">
          <p className="muted">Content coming soon.</p>
        </section>
      </section>
    </MembersGate>
  );
}

function MembersDataCharts() {
  return (
    <MembersGate>
      <section className="page">
        <div className="pageHeader">
          <h1 className="pageTitle">Data & Charts</h1>
          <p className="pageSub">Wage comparison chart.</p>
        </div>

        <section className="card">
          <WageComparisonChart />
        </section>
      </section>
    </MembersGate>
  );
}

function MembersTakeAction() {
  return (
    <MembersGate>
      <section className="page">
        <div className="pageHeader">
          <h1 className="pageTitle">Take Action</h1>
          <p className="pageSub">Placeholder page.</p>
        </div>

        <section className="card">
          <p className="muted">Content coming soon.</p>
        </section>
      </section>
    </MembersGate>
  );
}

/* =========================
   Local discounts (single copy)
========================= */
function pickDiscountArray(mod) {
  if (!mod) return [];
  if (Array.isArray(mod.LOCAL_DISCOUNTS)) return mod.LOCAL_DISCOUNTS;
  if (Array.isArray(mod.default)) return mod.default;
  const firstArr = Object.values(mod).find((v) => Array.isArray(v));
  return Array.isArray(firstArr) ? firstArr : [];
}

function parseDateMaybe(v) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeDiscount(d, idx) {
  const raw = d || {};
  const id = raw.id || raw.slug || raw.key || `discount-${idx}`;

  const title =
    raw.title ||
    raw.name ||
    raw.business ||
    raw.vendor ||
    raw.company ||
    "Discount";

  const subtitle =
    raw.subtitle || raw.location || raw.where || raw.category || "";
  const description =
    raw.description || raw.desc || raw.details || raw.text || "";
  const instructions = raw.instructions || raw.specialInstructions || "";

  const href = raw.href || raw.url || raw.link || "";
  const code = raw.code || raw.promoCode || raw.coupon || "";

  const end =
    raw.expiresAt ||
    raw.expires ||
    raw.validUntil ||
    raw.endDate ||
    raw.ends ||
    raw.until ||
    "";

  const endDate = parseDateMaybe(end);

  const activeFlag =
    typeof raw.active === "boolean"
      ? raw.active
      : typeof raw.isActive === "boolean"
        ? raw.isActive
        : null;

  const expiredByDate = endDate ? endDate.getTime() < Date.now() : false;
  const expiredByFlag = activeFlag === false;

  const expired =
    raw.status === "expired" ||
    raw.available === false ||
    expiredByFlag ||
    expiredByDate;

  const image =
    raw.image || raw.imageSrc || raw.heroSrc || raw.thumbnailSrc || "";

  return {
    id,
    title,
    subtitle,
    description,
    instructions,
    href,
    code,
    endDate,
    expired,
    image,
  };
}

function fmtShortDate(d) {
  if (!d) return "";
  try {
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function DiscountSubmissionForm() {
  return (
    <details className="ldcForm">
      <summary className="ldcFormSummary">Submit a discount</summary>

      <form action={FORMSPREE_ENDPOINT} method="POST" className="ldcFormGrid">
        <input
          type="text"
          name="_gotcha"
          tabIndex="-1"
          autoComplete="off"
          className="honeypot"
          aria-hidden="true"
        />

        <input
          type="hidden"
          name="form_type"
          value="local_discount_submission"
        />

        <label className="fieldLabel">
          Business name
          <input
            name="business_name"
            type="text"
            required
            className="textInput"
            placeholder="Business offering the discount"
          />
        </label>

        <div className="ldcFormTwoCol">
          <label className="fieldLabel">
            Contact person
            <input
              name="contact_person"
              type="text"
              required
              className="textInput"
              placeholder="Name"
            />
          </label>

          <label className="fieldLabel">
            Contact title
            <input
              name="contact_title"
              type="text"
              className="textInput"
              placeholder="Owner, Manager, etc (optional)"
            />
          </label>
        </div>

        <div className="ldcFormTwoCol">
          <label className="fieldLabel">
            Contact email
            <input
              name="contact_email"
              type="email"
              className="textInput"
              placeholder="email@example.com"
            />
          </label>

          <label className="fieldLabel">
            Contact phone
            <input
              name="contact_phone"
              type="tel"
              className="textInput"
              placeholder="(optional)"
            />
          </label>
        </div>

        <div className="ldcFormTwoCol">
          <label className="fieldLabel">
            Start date
            <input name="start_date" type="date" className="textInput" />
          </label>

          <label className="fieldLabel">
            End date
            <input name="end_date" type="date" className="textInput" />
          </label>
        </div>

        <label className="fieldLabel">
          Image URL (optional)
          <input
            name="image_url"
            type="url"
            className="textInput"
            placeholder="https://... (or leave blank for default image)"
          />
        </label>

        <label className="fieldLabel">
          Discount details
          <textarea
            name="discount_details"
            rows={4}
            className="textInput textArea"
            placeholder="What is the discount? Any rules or limitations?"
          />
        </label>

        <label className="fieldLabel">
          Special instructions (optional)
          <textarea
            name="special_instructions"
            rows={3}
            className="textInput textArea"
            placeholder='Example: "Ask for manager Sarah to sign up"'
          />
        </label>

        <button type="submit" className="primaryBtn">
          Send submission
        </button>

        <p className="finePrint">
          Only submit business contact info you have permission to share.
        </p>
      </form>
    </details>
  );
}

function LocalDiscountsCarousel() {
  const rowRef = useRef(null);

  const items = useMemo(() => {
    const arr = pickDiscountArray(localDiscountsMod)
      .map(normalizeDiscount)
      .filter(Boolean);

    return [...arr].sort((a, b) => Number(a.expired) - Number(b.expired));
  }, []);

  function scrollByCards(dir) {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector("[data-card='1']");
    const width = card ? card.getBoundingClientRect().width : 280;
    row.scrollBy({ left: dir * (width + 12), behavior: "smooth" });
  }

  return (
    <div className="ldc" aria-label="Local discounts">
      <div className="ldcTop">
        <div className="ldcHint">Swipe or scroll</div>

        <div className="ldcNav">
          <button
            type="button"
            className="ldcNavBtn"
            onClick={() => scrollByCards(-1)}
            aria-label="Scroll left"
          >
            ‹
          </button>
          <button
            type="button"
            className="ldcNavBtn"
            onClick={() => scrollByCards(1)}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      {!items.length ? (
        <div className="l279DiscEmpty">No discounts loaded yet.</div>
      ) : (
        <div className="ldcRow" ref={rowRef}>
          {items.map((it) => {
            const img = it.image
              ? it.image.startsWith("http")
                ? it.image
                : it.image.startsWith("/")
                  ? it.image
                  : `/${it.image}`
              : "/l279-logo-blue.png";

            const CardTag = it.href ? "a" : "div";
            const cardProps = it.href
              ? { href: it.href, target: "_blank", rel: "noreferrer" }
              : {};

            return (
              <CardTag
                key={it.id}
                className={`ldcCard${it.expired ? " isExpired" : ""}`}
                data-card="1"
                aria-label={it.title}
                {...cardProps}
              >
                <div className="ldcImgWrap">
                  <img src={img} alt="" className="ldcImg" loading="lazy" />
                </div>

                <div className="ldcBody">
                  <div className="ldcTitleRow">
                    <div className="ldcTitle">{it.title}</div>
                    {it.expired ? (
                      <span className="ldcBadge isExpired">Expired</span>
                    ) : (
                      <span className="ldcBadge">Active</span>
                    )}
                  </div>

                  {it.subtitle ? (
                    <div className="ldcSub">{it.subtitle}</div>
                  ) : null}
                  {it.description ? (
                    <div className="ldcDesc">{it.description}</div>
                  ) : null}
                  {it.instructions ? (
                    <div className="ldcInst">{it.instructions}</div>
                  ) : null}

                  <div className="ldcMeta">
                    {it.code ? (
                      <span className="ldcCode">Code: {it.code}</span>
                    ) : null}
                    {it.endDate ? (
                      <span>Valid until {fmtShortDate(it.endDate)}</span>
                    ) : null}
                  </div>
                </div>
              </CardTag>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================
   Local 279 pages (use existing local279.jsx)
========================= */
function MembersLocal279Page() {
  return (
    <MembersGate>
      <Local279 />
    </MembersGate>
  );
}

function MembersLocal279Discounts() {
  return (
    <MembersGate>
      <section className="page">
        <div className="pageHeader">
          <h1 className="pageTitle">Local discounts</h1>
          <p className="pageSub">
            Submit a discount and we’ll review and publish it.
          </p>
        </div>

        <section className="card">
          <DiscountSubmissionForm />
          <LocalDiscountsCarousel />
        </section>
      </section>
    </MembersGate>
  );
}

function MembersContactExec() {
  return (
    <MembersGate>
      <section className="page">
        <div className="pageHeader">
          <h1 className="pageTitle">Contact Executive and Committees</h1>
          <p className="pageSub">
            This goes to the Local 279 inbox via Formspree.
          </p>
        </div>

        <section className="card">
          <form action={FORMSPREE_ENDPOINT} method="POST" className="formGrid">
            <input
              type="text"
              name="_gotcha"
              tabIndex="-1"
              autoComplete="off"
              className="honeypot"
              aria-hidden="true"
            />

            <input type="hidden" name="form_type" value="members_contact" />

            <label className="fieldLabel">
              Your email
              <input
                name="email"
                type="email"
                required
                className="textInput"
                placeholder="you@example.com"
              />
            </label>

            <label className="fieldLabel">
              Your name
              <input
                name="name"
                type="text"
                required
                className="textInput"
                placeholder="First and last name"
              />
            </label>

            <label className="fieldLabel">
              Subject
              <input
                name="subject"
                type="text"
                required
                className="textInput"
                placeholder="What is this about?"
              />
            </label>

            <label className="fieldLabel">
              Message
              <textarea
                name="message"
                required
                rows={6}
                className="textInput textArea"
                placeholder="Write your message here…"
              />
            </label>

            <button type="submit" className="primaryBtn">
              Send message
            </button>

            <p className="finePrint">
              Please avoid including personal health information.
            </p>
          </form>
        </section>
      </section>
    </MembersGate>
  );
}

/* =========================
   App shell + routes
========================= */
export default function App() {
  const { pathname } = useLocation();
  const inMembers = pathname.startsWith("/members");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="appShell">
      <header className="topbar">
        <div className="topbarInner">
          <div className="navLeft">
            <MemberHamburgerMenu />
          </div>

          <div className="navCenter">
            <Link
              to="/"
              className="topbarLogoLink"
              aria-label="OPSEU Local 279 Home"
              onClick={(e) => {
                if (pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                }
              }}
            >
              <img
                src="/l279-logo-blue.png"
                alt="OPSEU Local 279"
                className="topbarLogo"
              />
            </Link>
          </div>

          <div className="navRight">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>{null}</SignedOut>
          </div>
        </div>
      </header>

      <main
        className={inMembers ? "main mainMembers" : "main"}
        style={
          inMembers
            ? { ["--members-bg"]: `url(${norfolkCountySvg})` }
            : undefined
        }
      >
        <div className={inMembers ? "" : "container"}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<PublicContact />} />
            <Route path="/news" element={<NewsIndex />} />
            <Route path="/news/:id" element={<NewsPost />} />

            <Route path="/members" element={<MembersHome />} />
            <Route
              path="/members/peer-support"
              element={<MembersPeerSupport />}
            />
            <Route
              path="/members/data-charts"
              element={<MembersDataCharts />}
            />
            <Route
              path="/members/take-action"
              element={<MembersTakeAction />}
            />

            <Route path="/members/local279" element={<MembersLocal279Page />} />
            <Route
              path="/members/local279/discounts"
              element={<MembersLocal279Discounts />}
            />
            <Route path="/members/contact" element={<MembersContactExec />} />
          </Routes>
        </div>
      </main>

      <footer className="appFooter">
        <div className="footerInner">
          <div className="footerTopGrid">
            <div className="footerAddress">
              <div className="footerTitle">OPSEU Hamilton</div>
              <div className="footerLine">505 York Blvd</div>
              <div className="footerLine">Hamilton, ON</div>
              <div className="footerLine">L8R 3K4</div>
              <div className="footerLine">Ontario, Canada</div>
            </div>

            <div className="footerLinks">
              <Link className="footerLink" to="/about">
                About
              </Link>
              <Link className="footerLink" to="/privacy">
                Privacy
              </Link>
              <Link className="footerLink" to="/contact">
                Contact
              </Link>
            </div>

            <div className="footerBrandTop">
              <a
                className="footerLogoLink"
                href="https://opseu.org"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/l279-logo-blue.png"
                  alt="OPSEU"
                  className="footerLogo"
                />
              </a>
            </div>
          </div>

          <div className="footerRuleFull" />

          <div className="footerBottom">
            <div className="footerBottomLine">
              © {new Date().getFullYear()} OPSEU Local 279
            </div>

            <div className="footerCredits">
              <a
                className="footerCreditLink"
                href="mailto:tristanjames3d@gmail.com"
              >
                Site design by: Tristan Britt | TJ3D
              </a>

              <a
                className="footerCreditLink"
                href="mailto:tristanjames3d@gmail.com?subject=OPSEU279%20Bug%20Report"
              >
                Report a bug
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
