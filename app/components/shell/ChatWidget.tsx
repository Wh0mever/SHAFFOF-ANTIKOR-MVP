"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, Send, X, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "shaffof.chat.history";

const PAGE_SUGGESTIONS: Record<string, string[]> = {
  "/": [
    "Какие регионы сейчас в красной зоне?",
    "Сколько критических алертов за 24 часа?",
    "Топ-3 самых рисковых тендеров",
  ],
  "/alerts": [
    "Что такое SOLO-аномалия?",
    "Чем отличается PRICE_SPIKE от ROUND?",
    "Как работает severity-скор?",
  ],
  "/tenders": [
    "Какие заказчики чаще всего попадают в алерты?",
    "На какую сумму всего тендеров?",
    "Сколько уникальных категорий?",
  ],
  "/map": [
    "Какой регион самый проблемный?",
    "Сколько алертов по Ташкенту?",
    "В каких регионах нет алертов?",
  ],
  "/connections": [
    "Кто чаще всего побеждает у одного заказчика?",
    "Что такое серийный победитель?",
    "Покажи самые подозрительные связи",
  ],
  "/watchlist": [
    "Как добавить заказчика в watchlist?",
    "Где включить уведомления?",
    "Что отслеживается в watchlist?",
  ],
  "/settings": [
    "Где настроить Telegram-канал?",
    "Какие модели AI используются?",
    "Что такое CRON_SECRET?",
  ],
};

const DEFAULT_SUGGESTIONS = PAGE_SUGGESTIONS["/"];

const GREETING: Msg = {
  role: "assistant",
  content:
    "Здравствуйте! Я SHAFFOF AI — ассистент по анализу госзакупок. Спросите о тендерах, аномалиях или регионах. Подсказки внизу зависят от страницы где вы сейчас.",
};

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Msg[];
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {}
  }, []);

  // Persist on every change.
  useEffect(() => {
    try {
      const trimmed = messages.slice(-30); // keep last 30
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {}
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function clearHistory() {
    setMessages([GREETING]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? "Ошибка ответа." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Сервис недоступен. Попробуйте позже." }]);
    } finally {
      setLoading(false);
    }
  }

  const showSuggestions = messages.length <= 3;
  const currentSuggestions = PAGE_SUGGESTIONS[pathname] ?? DEFAULT_SUGGESTIONS;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all",
          "bg-emerald-500 text-zinc-950 hover:bg-emerald-400",
          open && "scale-95"
        )}
        aria-label="AI chat"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[560px] w-[400px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
          <header className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-zinc-100">SHAFFOF AI</div>
              <div className="text-[10px] text-zinc-500">GPT-4o-mini · Claude · Perplexity</div>
            </div>
            <button
              onClick={clearHistory}
              title="Очистить историю"
              className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-900 hover:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "ml-auto bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-500/30"
                    : "bg-zinc-900 text-zinc-200 ring-1 ring-zinc-800"
                )}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-2xl bg-zinc-900 px-3.5 py-2 text-sm text-zinc-400 ring-1 ring-zinc-800">
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 [animation-delay:200ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 [animation-delay:400ms]" />
                </span>
              </div>
            )}
          </div>

          {showSuggestions && (
            <div className="border-t border-zinc-800 px-3 py-3">
              <div className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-600">
                💡 Подсказки для этой страницы
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-400"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2 border-t border-zinc-800 px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Спросите что-нибудь…"
              className="flex-1 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:ring-emerald-500/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-lg bg-emerald-500 px-3 text-zinc-950 hover:bg-emerald-400 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
