"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type HistoryItem = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Teller AI. Ask me anything — I can help with research, writing, business, coding, summaries, and ideas.",
    },
  ]);

  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load histories from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("teller_histories");
      if (raw) {
        const parsed: HistoryItem[] = JSON.parse(raw);
        const sorted = parsed.sort((a, b) => b.updatedAt - a.updatedAt);
        setHistories(sorted);
        if (sorted.length) {
          setActiveHistoryId(sorted[0].id);
          setMessages(sorted[0].messages);
          return;
        }
      }

      // initialize with default assistant message as a new history
      const id = Date.now().toString();
      const initial: HistoryItem = {
        id,
        title: "New chat",
        messages: messages,
        updatedAt: Date.now(),
      };
      setHistories([initial]);
      setActiveHistoryId(id);
      // eslint-disable-next-line no-empty
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist active history whenever messages change
  useEffect(() => {
    if (!activeHistoryId) return;
    setHistories((prev) => {
      const next = prev.slice();
      const idx = next.findIndex((h) => h.id === activeHistoryId);
      const titleFromUser = messages.find((m) => m.role === "user")?.content?.slice(0, 60) || "New chat";
      // If there's an existing non-default title (likely AI-generated), preserve it.
      const existing = prev.find((h) => h.id === activeHistoryId);
      const finalTitle = existing && existing.title && existing.title !== "New chat" ? existing.title : titleFromUser;
      const updated: HistoryItem = {
        id: activeHistoryId,
        title: finalTitle,
        messages,
        updatedAt: Date.now(),
      };
      if (idx === -1) next.unshift(updated);
      else {
        next[idx] = updated;
        next.splice(idx, 1);
        next.unshift(updated);
      }
      try {
        localStorage.setItem("teller_histories", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, [messages, activeHistoryId]);

  function createNewChat() {
    const id = Date.now().toString();
    const initialMessages: Message[] = [
      {
        role: "assistant",
        content:
          "Hi, I’m Teller AI. Ask me anything — I can help with research, writing, business, coding, summaries, and ideas.",
      },
    ];
    const newItem: HistoryItem = {
      id,
      title: "New chat",
      messages: initialMessages,
      updatedAt: Date.now(),
    };
    const next = [newItem, ...histories];
    setHistories(next);
    setActiveHistoryId(id);
    setMessages(initialMessages);
    try {
      localStorage.setItem("teller_histories", JSON.stringify(next));
    } catch (e) {}
    setIsSidebarOpen(false);
  }

  function loadHistory(id: string) {
    const h = histories.find((x) => x.id === id);
    if (!h) return;
    setActiveHistoryId(id);
    setMessages(h.messages);
    setIsSidebarOpen(false);
  }

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
          messages: updatedMessages.map((msg) => ({ role: msg.role, content: msg.content })),
        }),
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: Message = { role: "assistant", content: data.reply };
        setMessages([...updatedMessages, assistantMessage]);

        // If the server returned a suggested title, update the active history
        if (data.title && activeHistoryId) {
          setHistories((prev) => {
            const next = prev.slice();
            const idx = next.findIndex((h) => h.id === activeHistoryId);
            if (idx !== -1) {
              next[idx] = {
                ...next[idx],
                title: data.title,
                messages: [...updatedMessages, assistantMessage],
                updatedAt: Date.now(),
              };
              const item = next.splice(idx, 1)[0];
              next.unshift(item);
            } else {
              next.unshift({ id: activeHistoryId, title: data.title, messages: [...updatedMessages, assistantMessage], updatedAt: Date.now() });
            }
            try {
              localStorage.setItem("teller_histories", JSON.stringify(next));
            } catch (e) {}
            return next;
          });
        } else if (activeHistoryId) {
          // If the active history still has the default title, generate one now
          const current = histories.find((h) => h.id === activeHistoryId);
          if (current && (!current.title || current.title === "New chat")) {
            (async () => {
              try {
                const res = await fetch("/api/title", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ messages: [...updatedMessages, { role: "assistant", content: data.reply }] }),
                });
                const d = await res.json();
                if (d.title) {
                  setHistories((prev) => {
                    const next = prev.slice();
                    const idx = next.findIndex((h) => h.id === activeHistoryId);
                    if (idx !== -1) {
                      next[idx] = { ...next[idx], title: d.title, messages: [...updatedMessages, { role: "assistant", content: data.reply }], updatedAt: Date.now() };
                      const item = next.splice(idx, 1)[0];
                      next.unshift(item);
                    }
                    try {
                      localStorage.setItem("teller_histories", JSON.stringify(next));
                    } catch (e) {}
                    return next;
                  });
                }
              } catch (e) {}
            })();
          }
        }
      } else {
        setMessages([...updatedMessages, { role: "assistant", content: "Sorry, something went wrong." }]);
      }
    } catch (err) {
      setMessages([...updatedMessages, { role: "assistant", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-neutral-800 bg-neutral-900 p-4 transition-transform duration-200 md:static md:translate-x-0 ${isHistoryVisible ? 'md:block' : 'md:hidden'} ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`} aria-hidden={!isSidebarOpen && true}>
        <div className="flex h-full flex-col">
          <div className="mb-4">
            <h1 className="mb-2 flex items-center justify-between text-2xl font-bold">
              Teller AI
              <button className="ml-2 rounded bg-neutral-800 px-2 py-1 text-sm md:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar">
                ✕
              </button>
            </h1>

            <button className="mb-2 w-full rounded-lg bg-white px-4 py-2 font-medium text-black" onClick={createNewChat}>
              New Chat
            </button>

            {/* Titles are generated automatically after the first assistant reply; removed manual button */}
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 text-sm text-neutral-400 modern-scroll">
            {histories.length === 0 && <p>No chats yet</p>}

            {histories.map((h) => (
              <button key={h.id} onClick={() => loadHistory(h.id)} className={`block w-full text-left rounded-md px-3 py-2 hover:bg-neutral-800 ${h.id === activeHistoryId ? "bg-neutral-800" : ""}`}>
                <div className="truncate text-white">{h.title}</div>
                <div className="mt-1 text-xs text-neutral-400">{new Date(h.updatedAt).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-hidden />}

      <main className="flex flex-1 flex-col">
        <header className="border-b border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="md:hidden rounded-md bg-neutral-800 px-3 py-2 text-sm" onClick={() => setIsSidebarOpen((s) => !s)} aria-label="Toggle sidebar">Menu</button>
              <button className="hidden md:inline-flex items-center gap-2 rounded-md bg-neutral-800 px-3 py-2 text-sm" onClick={() => setIsHistoryVisible((v) => !v)} aria-label="Toggle history visibility">
                {isHistoryVisible ? 'Hide history' : 'Show history'}
              </button>
              <h2 className="text-lg font-semibold">Teller AI Chat</h2>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 modern-scroll">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`max-w-[85%] rounded-xl p-4 ${message.role === "user" ? "ml-auto bg-blue-600" : "mr-auto bg-neutral-800"}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}

            {loading && (
              <div className="mr-auto max-w-[85%] rounded-xl bg-neutral-800 p-4">Teller AI is thinking...</div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-neutral-800 p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <input className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 outline-none" placeholder="Ask Teller AI anything..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} />

            <button onClick={sendMessage} disabled={loading} className="rounded-lg bg-white px-5 py-3 font-medium text-black disabled:opacity-50">Send</button>
          </div>
        </div>
      </main>
    </div>
  );
}
