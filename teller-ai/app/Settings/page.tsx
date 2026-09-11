"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

const FREE_CHAT_LIMIT = 100;

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  const accountId = user?.sub || user?.email || "guest";
  const usageKey = `teller_usage:${accountId}:${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, "0")}`;
  const [monthlyChatCount, setMonthlyChatCount] = useState(0);

  const accountProfile = {
    name: user?.name || "Teller User",
    email: user?.email || "user@example.com",
    picture:
      user?.picture ||
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  };

  useEffect(() => {
    const storedUsage = Number(localStorage.getItem(usageKey) || "0");
    setMonthlyChatCount(Number.isFinite(storedUsage) ? storedUsage : 0);
  }, [usageKey]);

  if (isLoading) {
    return <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">Loading account...</main>;
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-4">
          <img
            src={accountProfile.picture}
            alt={accountProfile.name}
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
              Profile
            </p>
            <h1 className="text-3xl font-bold">Account Settings</h1>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="text-lg font-semibold">Personal details</h2>
            <div className="mt-4 space-y-3 text-sm text-neutral-300">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span>Name</span>
                <span className="text-neutral-100">{accountProfile.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <span>Email</span>
                <span className="text-neutral-100">{accountProfile.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Plan</span>
                <span className="text-neutral-100">Free</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Chats this month</span>
                <span className="text-neutral-100">{monthlyChatCount}/{FREE_CHAT_LIMIT}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
            <h2 className="text-lg font-semibold">Preferences</h2>
            <div className="mt-4 space-y-3 text-sm text-neutral-300">
              <label className="flex items-center justify-between gap-4">
                <span>AI responses in chat</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-white" />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span>Auto-scroll history</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-white" />
              </label>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => logout({ logoutParams: { returnTo: typeof window !== "undefined" ? window.location.origin : undefined } })}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-white"
              >
                Log out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => loginWithRedirect()}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
