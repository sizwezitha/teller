"use client";

import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

export default function AuthButtons() {
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 font-medium text-neutral-950 transition hover:border-neutral-950 hover:bg-neutral-50">
            Log in
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <SignOutButton>
          <button className="rounded-lg bg-neutral-950 px-5 py-2.5 font-medium text-white transition hover:bg-neutral-800">
            Log out
          </button>
        </SignOutButton>
      </SignedIn>
    </div>
  );
}
