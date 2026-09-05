"use client";

import Link from "next/link";

export default function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/sign-in"
        className="rounded-md border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50"
      >
        Sign in
      </Link>

      <Link
        href="/sign-up"
        className="rounded-md bg-neutral-950 px-3 py-1 text-sm font-semibold text-white hover:bg-neutral-800"
      >
        Sign up
      </Link>
    </div>
  );
}
