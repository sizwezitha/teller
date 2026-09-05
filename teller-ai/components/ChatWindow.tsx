"use client";

import { useState, useEffect } from "react";
import { DEFAULT_MODEL, SUPPORTED_MODELS } from "@/lib/models";
import { useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Session = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
};

export default function ChatWindow() {
  const initialAssistantMessage: Message = {
    role: "assistant",
    content:
      "Hi, I’m Teller AI. Ask me anything — I can help with research, writing, business, coding, summaries, and ideas.",
  };

  const [messages, setMessages] = useState<Message[]>([initialAssistantMessage]);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [notice, setNotice] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);

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
        const newMessages = [
          ...updatedMessages,
          {
            role: "assistant",
            content: data.reply,
          },
        ];

        setMessages(newMessages);
        // persist to sessions
        persistCurrentSession(newMessages);
      } else {
        const newMessages = [
          ...updatedMessages,
          {
            role: "assistant",
            content: data.error || "Sorry, something went wrong.",
          },
        ];

        setMessages(newMessages);
        persistCurrentSession(newMessages);
      }
    } catch {
      const newMessages = [
        ...updatedMessages,
        {
          role: "assistant",
          content: "Network error. Please try again.",
        },
      ];

      setMessages(newMessages);
      persistCurrentSession(newMessages);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    const id = typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now());
    const newSession: Session = {
      id,
      title: "New chat",
      messages: [initialAssistantMessage],
      createdAt: new Date().toISOString(),
    };

    const newSessions = [newSession, ...sessions];
    setSessions(newSessions);
    setSelectedSessionId(id);
    setMessages(newSession.messages);
    setInput("");
    saveSessionsToStorage(newSessions);
  }

  function persistCurrentSession(currentMessages: Message[]) {
    if (!selectedSessionId) {
      // create a session if none selected
      const id = typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now());
      const title = deriveTitleFromMessages(currentMessages);
      const session: Session = {
        id,
        title,
        messages: currentMessages,
        createdAt: new Date().toISOString(),
      };

      const newSessions = [session, ...sessions];
      setSessions(newSessions);
      setSelectedSessionId(id);
      saveSessionsToStorage(newSessions);
      return;
    }

    const newSessions = sessions.map((s) =>
      s.id === selectedSessionId ? { ...s, messages: currentMessages, title: deriveTitleFromMessages(currentMessages) } : s
    );

    setSessions(newSessions);
    saveSessionsToStorage(newSessions);
  }

  function deriveTitleFromMessages(msgs: Message[]) {
    const firstUser = msgs.find((m) => m.role === "user");
    if (firstUser) return firstUser.content.slice(0, 40) + (firstUser.content.length > 40 ? "..." : "");
    const assistant = msgs.find((m) => m.role === "assistant");
    return assistant ? assistant.content.slice(0, 40) : "Chat";
  }

  function saveSessionsToStorage(sessionsToSave: Session[]) {
    try {
      localStorage.setItem("teller_sessions", JSON.stringify(sessionsToSave));
    } catch (e) {
      // ignore
    }
  }

  function loadSessionsFromStorage() {
    try {
      const raw = localStorage.getItem("teller_sessions");
      if (!raw) return null;
      return JSON.parse(raw) as Session[];
    } catch (e) {
      return null;
    }
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

  useEffect(() => {
    // load sessions from localStorage
    try {
      const loaded = loadSessionsFromStorage();
      if (loaded && loaded.length > 0) {
        setSessions(loaded);
        setSelectedSessionId(loaded[0].id);
        setMessages(loaded[0].messages);
      } else {
        // create initial session
        const id = typeof crypto !== "undefined" && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now());
        const initial: Session = {
          id,
          title: "Welcome",
          messages: [initialAssistantMessage],
          createdAt: new Date().toISOString(),
        };

        setSessions([initial]);
        setSelectedSessionId(id);
        setMessages(initial.messages);
        saveSessionsToStorage([initial]);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="flex h-screen bg-white text-neutral-950">
      <aside className="w-72 border-r border-neutral-200 bg-neutral-50 p-2 hidden md:block">
        <div className="px-3 py-4">
          <h1 className="mb-4 text-2xl font-bold text-neutral-950">Teller AI</h1>

          <button
            onClick={newChat}
            className="mb-4 w-full rounded-lg bg-neutral-950 px-4 py-2 font-medium text-white hover:bg-neutral-800"
          >
            New Chat
          </button>

          <div className="space-y-2 text-sm">
            {sessions.length === 0 && <p className="text-neutral-500">No chats yet</p>}

            <div className="space-y-2">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSessionId(s.id);
                    setMessages(s.messages);
                  }}
                  className={`w-full text-left rounded-md px-3 py-2 hover:bg-neutral-100 ${
                    s.id === selectedSessionId ? "bg-white shadow" : "bg-transparent"
                  }`}
                >
                  <div className="truncate text-sm font-medium text-neutral-900">{s.title}</div>
                  <div className="mt-1 text-xs text-neutral-500">{new Date(s.createdAt).toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>
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

        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white p-4">
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
