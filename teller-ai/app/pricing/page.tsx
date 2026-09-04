"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-20 text-neutral-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Pricing</h1>
          <p className="mt-4 text-neutral-600">
            Choose the Teller AI plan that works for you.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <PricingCard
            name="Free"
            price="R0"
            features={["20 messages per day", "Basic AI chat", "Chat history"]}
            button="Start Free"
            plan="free"
          />

          <PricingCard
            name="Pro"
            price="R470/mo"
            features={[
              "1,000 messages per month",
              "Faster responses",
              "Longer answers",
              "Priority access",
            ]}
            button="Upgrade to Pro"
            plan="pro"
            highlighted
          />

          <PricingCard
            name="Business"
            price="160/mo"
            features={[
              "5,000 messages per month",
              "Team access",
              "Priority support",
              "Advanced tools",
            ]}
            button="Upgrade to Business"
            plan="business"
          />
        </div>
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  features,
  button,
  plan,
  highlighted,
}: {
  name: string;
  price: string;
  features: string[];
  button: string;
  plan: "free" | "pro" | "business";
  highlighted?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (plan === "free") {
      router.push("/chat");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Could not start checkout.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm ${
        highlighted
          ? "border-neutral-950 bg-neutral-950 text-white"
          : "border-neutral-200 bg-white text-neutral-950"
      }`}
    >
      <h2 className="text-2xl font-bold">{name}</h2>

      <p className="mt-4 text-4xl font-bold">{price}</p>

      <ul
        className={`mt-6 space-y-3 ${
          highlighted ? "text-neutral-200" : "text-neutral-600"
        }`}
      >
        {features.map((feature) => (
          <li key={feature}>✓ {feature}</li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        disabled={loading}
        className={`mt-8 w-full rounded-lg px-4 py-3 font-semibold disabled:opacity-50 ${
          highlighted
            ? "bg-white text-neutral-950 hover:bg-neutral-100"
            : "bg-neutral-950 text-white hover:bg-neutral-800"
        }`}
      >
        {loading ? "Loading..." : button}
      </button>
    </div>
  );
}
