"use client";

import { useState, useEffect } from "react";
import { DEFAULT_MODEL, SUPPORTED_MODELS } from "@/lib/models";

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
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [notice, setNotice] = useState<string | null>(null);

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
          model: selectedModel,
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
            content: data.error || "Sorry, something went wrong.",
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

  function newChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "Hi, I’m Teller AI. Ask me anything — I can help with research, writing, business, coding, summaries, and ideas.",
      },
    ]);
    setInput("");
  }

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "true") setNotice("Subscription successful — enjoy Teller AI Pro!");
      if (params.get("canceled") === "true") setNotice("Checkout canceled.");
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="flex h-screen bg-white text-neutral-950">
      <aside className="hidden w-72 border-r border-neutral-200 bg-neutral-50 p-4 md:block">
        <h1 className="mb-6 text-2xl font-bold text-neutral-950">Teller AI</h1>

        <button
          onClick={newChat}
          className="mb-4 w-full rounded-lg bg-neutral-950 px-4 py-2 font-medium text-white hover:bg-neutral-800"
        >
          New Chat
        </button>

        <div className="space-y-2 text-sm text-neutral-500">
          <p>Chat history coming soon</p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col bg-white">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white p-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950">
              Teller AI Chat
            </h2>
            <p className="text-sm text-neutral-500">
              Choose a model and start chatting.
            </p>
          </div>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-950"
          >
            {SUPPORTED_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </header>

        <div className="flex-1 overflow-y-auto bg-white p-4">
          {notice && (
            <div className="mx-auto max-w-3xl mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
              {notice}
            </div>
          )}
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  message.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto border border-neutral-200 bg-neutral-100 text-neutral-950"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}

            {loading && (
              <div className="mr-auto max-w-[85%] rounded-2xl border border-neutral-200 bg-neutral-100 p-4 text-neutral-700 shadow-sm">
                Teller AI is thinking with{" "}
                {
                  SUPPORTED_MODELS.find((model) => model.id === selectedModel)
                    ?.name
                }
                ...
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-neutral-200 bg-white p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <input
              className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-950 outline-none placeholder:text-neutral-400 focus:border-neutral-950"
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
              className="rounded-lg bg-neutral-950 px-5 py-3 font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
