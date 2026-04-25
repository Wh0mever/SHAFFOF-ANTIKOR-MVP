"use client";

import { Database, Zap } from "lucide-react";
import { useMode } from "./TopBar";

/**
 * Show when LIVE mode has zero data — invites user to switch to DEMO.
 * Returns null in DEMO mode (since DEMO always has data).
 */
export function LiveEmptyHint({ count }: { count: number }) {
  const [mode, setMode] = useMode();
  if (mode !== "LIVE" || count > 0) return null;

  return (
    <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
          <Database className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-zinc-100">База пока пуста</div>
          <p className="mt-0.5 text-xs text-zinc-400">
            Cron собирает реальные тендеры с xarid.uzex.uz, но запросы пока возвращают 0 записей.
            Чтобы посмотреть как работает система — переключитесь в режим <b>DEMO</b>.
          </p>
        </div>
        <button
          onClick={() => setMode("DEMO")}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-amber-400"
        >
          <Zap className="h-3.5 w-3.5" />
          Включить DEMO
        </button>
      </div>
    </div>
  );
}
