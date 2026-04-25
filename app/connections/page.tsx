"use client";

import { useMemo } from "react";
import { Network as NetworkIcon, Building2, ArrowRight } from "lucide-react";
import { Shell } from "../components/shell/Shell";
import { useLiveAlerts } from "@/lib/hooks";

type Edge = { from: string; to: string; weight: number; samples: string[] };

export default function ConnectionsPage() {
  const { alerts } = useLiveAlerts(15_000);

  const edges = useMemo<Edge[]>(() => {
    const m = new Map<string, Edge>();
    for (const a of alerts) {
      const seller = a.tender.sellerName;
      if (!seller) continue;
      const key = `${a.tender.buyerName}→${seller}`;
      if (!m.has(key)) {
        m.set(key, { from: a.tender.buyerName, to: seller, weight: 0, samples: [] });
      }
      const e = m.get(key)!;
      e.weight += 1;
      if (e.samples.length < 3) e.samples.push(a.tender.displayNo);
    }
    return Array.from(m.values()).sort((a, b) => b.weight - a.weight).slice(0, 30);
  }, [alerts]);

  const buyerMap = useMemo(() => {
    const m = new Map<string, { count: number; totalAmount: number }>();
    for (const a of alerts) {
      const cur = m.get(a.tender.buyerName) ?? { count: 0, totalAmount: 0 };
      cur.count += 1;
      cur.totalAmount += Number(a.tender.amount);
      m.set(a.tender.buyerName, cur);
    }
    return Array.from(m.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10);
  }, [alerts]);

  return (
    <Shell title="Связи" subtitle="Граф отношений заказчиков и поставщиков">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <NetworkIcon className="h-4 w-4 text-emerald-400" />
            Топ связей «заказчик → поставщик»
          </h3>
          <div className="space-y-2">
            {edges.map((e) => {
              const intensity = Math.min(1, e.weight / 5);
              return (
                <div
                  key={`${e.from}→${e.to}`}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      <span className="truncate text-sm text-zinc-200">{e.from}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <ArrowRight className="h-4 w-4 text-zinc-600" />
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold ring-1"
                        style={{
                          background: `rgba(244,63,94,${0.05 + intensity * 0.2})`,
                          color: e.weight >= 4 ? "#fb7185" : "#fbbf24",
                          borderColor: "rgba(244,63,94,0.3)",
                        }}
                      >
                        ×{e.weight}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate text-sm text-emerald-300">{e.to}</span>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 pl-5 text-[10px] text-zinc-600">
                    {e.samples.map((s) => (
                      <span key={s} className="rounded-md bg-zinc-800/60 px-1.5 py-0.5 font-mono">{s}</span>
                    ))}
                  </div>
                </div>
              );
            })}
            {edges.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-800 px-3 py-12 text-center text-sm text-zinc-600">
                Нет связей с поставщиками в текущих данных
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-200">Топ заказчиков</h3>
          <div className="space-y-2">
            {buyerMap.map(([name, data]) => (
              <div key={name} className="rounded-lg bg-zinc-900/40 px-3 py-2.5">
                <div className="text-sm text-zinc-200">{name}</div>
                <div className="mt-1 flex justify-between text-[11px] text-zinc-500">
                  <span>{data.count} алертов</span>
                  <span className="font-mono">
                    {(data.totalAmount / 1_000_000_000).toFixed(1)} млрд
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
