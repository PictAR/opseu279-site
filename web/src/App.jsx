import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

export default function App() {
  return (
    <main style={{ padding: 24 }}>
      <h1>OPSEU Local 279 - TEST</h1>

      <SignedOut>
        <SignInButton mode="modal">
          <button>Member Login</button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <p>You’re signed in.</p>
        <UserButton />
      </SignedIn>
    </main>
  );
}
