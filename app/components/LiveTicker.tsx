"use client";

import { formatUzs, severityColor } from "@/lib/utils";

type TickerItem = {
  id: string;
  region: string;
  ruleCode: string;
  severity: number;
  amount: number | string;
  title: string;
};

export function LiveTicker({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-800 bg-black/70 backdrop-blur">
      <div className="flex overflow-hidden whitespace-nowrap py-2 text-xs font-mono">
        <div className="animate-marquee flex gap-10 px-6">
          {doubled.map((t, i) => (
            <span key={`${t.id}-${i}`} className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: severityColor(t.severity) }}
              />
              <span className="text-zinc-500">{t.ruleCode}</span>
              <span className="text-zinc-300">{t.region}</span>
              <span className="text-emerald-400">
                {formatUzs(typeof t.amount === "string" ? BigInt(t.amount) : t.amount)} so'm
              </span>
              <span className="text-zinc-400 truncate max-w-[360px]">{t.title}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
