"use client";

import { useMemo, useState } from "react";
import { Star, Building2, User2, MapPin, FileText, X, Trash2, Bell, BellOff } from "lucide-react";
import { Shell } from "../components/shell/Shell";
import { useWatchlist, type WatchKind, alertMatchesWatch } from "@/lib/watchlist";
import { useLiveAlerts, type ClientAlert } from "@/lib/hooks";
import { AlertDetailModal } from "../components/alerts/AlertDetailModal";
import { useEffect } from "react";
import { RULE_LABEL } from "@/lib/anomalies";

const KIND_META: Record<WatchKind, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  BUYER: { label: "Заказчик", icon: Building2, color: "text-emerald-400" },
  SELLER: { label: "Поставщик", icon: User2, color: "text-indigo-400" },
  REGION: { label: "Регион", icon: MapPin, color: "text-amber-400" },
  TENDER: { label: "Тендер", icon: FileText, color: "text-rose-400" },
};

export default function WatchlistPage() {
  const { items, remove } = useWatchlist();
  const { alerts } = useLiveAlerts(15_000);
  const [open, setOpen] = useState<ClientAlert | null>(null);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyPermission, setNotifyPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (typeof Notification === "undefined") {
      setNotifyPermission("unsupported");
      return;
    }
    setNotifyPermission(Notification.permission);
    setNotifyEnabled(localStorage.getItem("shaffof.notify") === "1");
  }, []);

  // Browser notifications for matched alerts (latest-first; show only new ones).
  useEffect(() => {
    if (!notifyEnabled || notifyPermission !== "granted") return;
    const seen = new Set<string>(JSON.parse(localStorage.getItem("shaffof.notify.seen") ?? "[]"));
    const fresh = matched.filter((a) => !seen.has(a.id));
    fresh.slice(0, 3).forEach((a) => {
      try {
        new Notification(`SHAFFOF · ${RULE_LABEL[a.ruleCode] ?? a.ruleCode} · ${a.severity}/100`, {
          body: `${a.tender.title} · ${a.region}`,
          icon: "/favicon.ico",
          tag: a.id,
        });
      } catch {}
    });
    if (fresh.length > 0) {
      const newSeen = Array.from(seen).concat(fresh.map((a) => a.id)).slice(-200);
      localStorage.setItem("shaffof.notify.seen", JSON.stringify(newSeen));
    }
  }); // intentionally no deps — runs every render

  async function enableNotifications() {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      const p = await Notification.requestPermission();
      setNotifyPermission(p);
      if (p === "granted") {
        setNotifyEnabled(true);
        localStorage.setItem("shaffof.notify", "1");
      }
    } else if (Notification.permission === "granted") {
      const next = !notifyEnabled;
      setNotifyEnabled(next);
      localStorage.setItem("shaffof.notify", next ? "1" : "0");
    }
  }

  const matched = useMemo(() => {
    if (items.length === 0) return [];
    return alerts.filter((a) => alertMatchesWatch(items, a));
  }, [items, alerts]);

  const grouped = useMemo(() => {
    const m: Record<WatchKind, typeof items> = { BUYER: [], SELLER: [], REGION: [], TENDER: [] };
    for (const i of items) m[i.kind].push(i);
    return m;
  }, [items]);

  return (
    <Shell title="Watchlist" subtitle={`${items.length} объектов наблюдения · ${matched.length} активных алертов`}>
      <div className="mb-5 rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${notifyEnabled ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-zinc-900 text-zinc-500 ring-1 ring-zinc-800"}`}>
            {notifyEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-zinc-100">Браузерные уведомления</div>
            <div className="text-xs text-zinc-500">
              {notifyPermission === "unsupported"
                ? "Браузер не поддерживает уведомления"
                : notifyPermission === "denied"
                ? "Заблокированы. Разрешите в настройках сайта."
                : notifyEnabled
                ? "Включены. Вы получите всплывающее окно при новых алертах из watchlist."
                : "Выключены. Включите чтобы получать уведомления о новых алертах."}
            </div>
          </div>
          {notifyPermission !== "unsupported" && notifyPermission !== "denied" && (
            <button
              onClick={enableNotifications}
              className={`rounded-lg px-4 py-2 text-xs font-bold ${notifyEnabled ? "bg-zinc-900 text-zinc-300 hover:bg-zinc-800" : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"}`}
            >
              {notifyEnabled ? "Выключить" : "Включить"}
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 px-6 py-20 text-center">
          <Star className="mx-auto h-12 w-12 text-zinc-700" />
          <h3 className="mt-3 text-lg font-semibold text-zinc-200">Watchlist пуст</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            Нажимайте звёздочку рядом с заказчиком, поставщиком, регионом или тендером — и они появятся здесь.
            Когда сработает новая аномалия по любому из них — увидите её сразу.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_1fr]">
          <aside className="space-y-4">
            {(Object.keys(grouped) as WatchKind[]).map((kind) => {
              const bucket = grouped[kind];
              if (bucket.length === 0) return null;
              const Meta = KIND_META[kind];
              const Icon = Meta.icon;
              return (
                <div key={kind} className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${Meta.color}`} />
                    <h3 className="text-sm font-semibold text-zinc-200">{Meta.label}</h3>
                    <span className="ml-auto rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400">{bucket.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {bucket.map((it) => (
                      <div
                        key={`${it.kind}:${it.id}`}
                        className="group flex items-center gap-2 rounded-lg bg-zinc-900/40 px-2.5 py-1.5"
                      >
                        <span className="flex-1 truncate text-xs text-zinc-300" title={it.label}>
                          {it.label}
                        </span>
                        <button
                          onClick={() => remove(it.kind, it.id)}
                          className="opacity-0 transition group-hover:opacity-100 hover:text-rose-400"
                          aria-label="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </aside>

          <main className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
              🔔 Активные алерты по watchlist
              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-400 ring-1 ring-rose-500/30">
                {matched.length}
              </span>
            </h3>
            {matched.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-800 px-3 py-12 text-center text-sm text-zinc-600">
                Пока нет новых алертов по объектам watchlist.
              </div>
            ) : (
              <div className="space-y-2">
                {matched.slice(0, 50).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setOpen(a)}
                    className="flex w-full items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-left transition hover:border-emerald-500/30"
                  >
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{
                        background: a.severity >= 80 ? "#f43f5e" : a.severity >= 60 ? "#f97316" : "#facc15",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500">{a.tender.displayNo}</span>
                        <span className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                          {RULE_LABEL[a.ruleCode] ?? a.ruleCode}
                        </span>
                        <span className="ml-auto font-mono text-[10px] text-zinc-500">{a.severity}/100</span>
                      </div>
                      <div className="mt-0.5 truncate text-sm text-zinc-200">{a.tender.title}</div>
                      <div className="mt-0.5 text-[11px] text-zinc-500">
                        {a.tender.buyerName} · {a.region}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      )}

      <AlertDetailModal alert={open} allAlerts={alerts} onClose={() => setOpen(null)} />
    </Shell>
  );
}
