import Link from "next/link";
import ChatWindow from "@/components/ChatWindow";

export default function HomePage() {
  return (
    <div className="relative">
      <Link
        href="/pricing"
        className="fixed top-4 left-4 z-50 rounded-md bg-yellow-400 px-3 py-1 text-sm font-semibold text-neutral-950 shadow"
      >
        Upgrade — Pricing
      </Link>

      <ChatWindow />
    </div>
  );
}
