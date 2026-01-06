import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

export default function App() {
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
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center", color: "#fff" }}>
        <img
          src="/public/l279Logo(wht).png"
          alt="OPSEU Local 279"
          style={{ width: 180, height: "auto", margin: "0 auto 18px", display: "block" }}
        />

        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>OPSEU Local 279</h1>
        <p style={{ margin: "10px 0 18px", opacity: 0.9 }}>
          Member access
        </p>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Member Login
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div style={{ marginTop: 14, display: "grid", gap: 12, justifyItems: "center" }}>
            <p style={{ margin: 0 }}>You’re signed in.</p>
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </main>
  );
}
