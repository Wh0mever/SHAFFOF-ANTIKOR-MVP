"use client";

import { useMemo } from "react";
import { Flame } from "lucide-react";
import { formatUzs } from "@/lib/utils";
import type { ClientAlert } from "@/lib/hooks";

export function TopRiskTenders({ alerts }: { alerts: ClientAlert[] }) {
  const top = useMemo(() => {
    const map = new Map<string, ClientAlert>();
    for (const a of alerts) {
      const cur = map.get(a.tender.id);
      if (!cur || a.severity > cur.severity) map.set(a.tender.id, a);
    }
    return Array.from(map.values())
      .sort((a, b) => b.severity - a.severity)
      .slice(0, 6);
  }, [alerts]);

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
        <Flame className="h-4 w-4 text-rose-400" />
        Топ рискованных тендеров
      </h3>
      <div className="space-y-2">
        {top.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-mono text-zinc-500">{a.tender.displayNo}</div>
              <div className="truncate text-sm text-zinc-200">{a.tender.title}</div>
              <div className="mt-0.5 text-[11px] text-zinc-500">
                {Math.round(Number(a.tender.amount) / 1_000_000)} млн сум · {a.region}
              </div>
            </div>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1"
              style={{
                color: a.severity >= 80 ? "#fb7185" : a.severity >= 60 ? "#fb923c" : "#facc15",
                background:
                  a.severity >= 80
                    ? "rgba(244,63,94,0.1)"
                    : a.severity >= 60
                    ? "rgba(249,115,22,0.1)"
                    : "rgba(250,204,21,0.1)",
              }}
            >
              {a.severity}/100
            </span>
          </div>
        ))}
        {top.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-800 px-3 py-8 text-center text-xs text-zinc-600">
            Нет данных
          </div>
        )}
      </div>
    </div>
  );
}
