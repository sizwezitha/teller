import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm text-neutral-600">
          Introducing Teller AI
        </div>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Your intelligent AI assistant for work, research, and ideas.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-neutral-600">
          Teller AI helps you write, research, summarize, code, plan, and answer
          questions faster with a clean AI chat experience.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/chat"
            className="rounded-lg bg-neutral-950 px-6 py-3 font-semibold text-white hover:bg-neutral-800"
          >
            Start Chatting
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-neutral-300 bg-white px-6 py-3 font-semibold text-neutral-950 hover:bg-neutral-50"
          >
            Log in
          </Link>

          <Link
            href="/pricing"
            className="rounded-lg border border-neutral-300 bg-white px-6 py-3 font-semibold text-neutral-950 hover:bg-neutral-50"
          >
            View Pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
