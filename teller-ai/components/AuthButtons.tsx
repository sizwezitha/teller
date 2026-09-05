"use client";

import { useAuth, SignOutButton } from "@clerk/nextjs";

export default function AuthButtons() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) return null;

  return (
    <div className="flex items-center gap-2">
      <SignOutButton>
        <button className="rounded-md border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50">
          Log off
        </button>
      </SignOutButton>
    </div>
  );
}
