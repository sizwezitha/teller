"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Teller AI. Ask me anything — I can help with research, writing, business, coding, summaries, and ideas.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: data.reply,
          },
        ]);
      } else {
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: "Sorry, something went wrong.",
          },
        ]);
      }
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Network error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      <aside className="hidden w-72 border-r border-neutral-800 bg-neutral-900 p-4 md:block">
        <h1 className="mb-6 text-2xl font-bold">Teller AI</h1>

        <button className="mb-4 w-full rounded-lg bg-white px-4 py-2 font-medium text-black">
          New Chat
        </button>

        <div className="space-y-2 text-sm text-neutral-400">
          <p>Chat history coming soon</p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="border-b border-neutral-800 p-4">
          <h2 className="text-lg font-semibold">Teller AI Chat</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-xl p-4 ${
                  message.role === "user"
                    ? "ml-auto bg-blue-600"
                    : "mr-auto bg-neutral-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}

            {loading && (
              <div className="mr-auto max-w-[85%] rounded-xl bg-neutral-800 p-4">
                Teller AI is thinking...
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-neutral-800 p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <input
              className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 outline-none"
              placeholder="Ask Teller AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-lg bg-white px-5 py-3 font-medium text-black disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
