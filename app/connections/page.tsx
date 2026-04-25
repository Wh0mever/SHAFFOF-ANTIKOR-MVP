"use client";

import { useMemo, useState } from "react";
import { Network as NetworkIcon, Building2, ArrowRight, Search } from "lucide-react";
import { Shell } from "../components/shell/Shell";
import { useLiveAlerts, type ClientAlert } from "@/lib/hooks";
import { ConnectionDetailModal, type ConnectionData } from "../components/connections/ConnectionDetailModal";
import { BuyerDetailModal } from "../components/connections/BuyerDetailModal";

type Edge = {
  buyer: { name: string; tin: string };
  seller: { name: string; tin: string | null };
  alerts: ClientAlert[];
  weight: number;
  totalAmount: number;
  maxSeverity: number;
};

export default function ConnectionsPage() {
  const { alerts } = useLiveAlerts(15_000);
  const [q, setQ] = useState("");
  const [openConnection, setOpenConnection] = useState<ConnectionData | null>(null);
  const [openBuyer, setOpenBuyer] = useState<string | null>(null);

  const edges = useMemo<Edge[]>(() => {
    const m = new Map<string, Edge>();
    for (const a of alerts) {
      const seller = a.tender.sellerName;
      if (!seller) continue;
      const key = `${a.tender.buyerName}__${seller}`;
      let e = m.get(key);
      if (!e) {
        e = {
          buyer: { name: a.tender.buyerName, tin: a.tender.buyerTin },
          seller: { name: seller, tin: null },
          alerts: [],
          weight: 0,
          totalAmount: 0,
          maxSeverity: 0,
        };
        m.set(key, e);
      }
      e.alerts.push(a);
      e.weight += 1;
      e.totalAmount += Number(a.tender.amount);
      if (a.severity > e.maxSeverity) e.maxSeverity = a.severity;
    }
    let arr = Array.from(m.values()).sort((a, b) => b.weight - a.weight);
    if (q.trim()) {
      const lc = q.toLowerCase();
      arr = arr.filter(
        (e) =>
          e.buyer.name.toLowerCase().includes(lc) ||
          e.seller.name.toLowerCase().includes(lc)
      );
    }
    return arr.slice(0, 50);
  }, [alerts, q]);

  const buyerTopList = useMemo(() => {
    const m = new Map<string, { count: number; totalAmount: number }>();
    for (const a of alerts) {
      const cur = m.get(a.tender.buyerName) ?? { count: 0, totalAmount: 0 };
      cur.count += 1;
      cur.totalAmount += Number(a.tender.amount);
      m.set(a.tender.buyerName, cur);
    }
    return Array.from(m.entries())
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 12);
  }, [alerts]);

  const handleOpenConnectionByName = (sellerName: string) => {
    if (!openBuyer) return;
    const edge = edges.find((e) => e.buyer.name === openBuyer && e.seller.name === sellerName);
    if (edge) {
      setOpenBuyer(null);
      setOpenConnection({ buyer: edge.buyer, seller: edge.seller, alerts: edge.alerts });
    }
  };

  return (
    <Shell title="Связи" subtitle="Граф отношений заказчиков и поставщиков">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <NetworkIcon className="h-4 w-4 text-emerald-400" />
              Топ связей «заказчик → поставщик»
            </h3>
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск заказчика или поставщика…"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-8 pr-3 py-1.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            {edges.map((e) => {
              const intensity = Math.min(1, e.weight / 5);
              return (
                <button
                  key={`${e.buyer.name}__${e.seller.name}`}
                  onClick={() =>
                    setOpenConnection({ buyer: e.buyer, seller: e.seller, alerts: e.alerts })
                  }
                  className="group w-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 text-left transition hover:border-emerald-500/40 hover:bg-zinc-900/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      <span className="truncate text-sm text-zinc-200">{e.buyer.name}</span>
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
                      <span className="truncate text-sm text-emerald-300">{e.seller.name}</span>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block">
                      <div className="font-mono text-xs tabular-nums text-zinc-300">
                        {(e.totalAmount / 1_000_000_000).toFixed(2)} млрд
                      </div>
                      <div className="text-[10px] text-zinc-600">max {e.maxSeverity}/100</div>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 pl-5">
                    {e.alerts.slice(0, 4).map((a) => (
                      <span
                        key={a.id}
                        className="rounded-md bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400"
                      >
                        {a.tender.displayNo}
                      </span>
                    ))}
                    {e.alerts.length > 4 && (
                      <span className="text-[10px] text-zinc-600">
                        +{e.alerts.length - 4} ещё
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {edges.length === 0 && (
              <div className="rounded-xl border border-dashed border-zinc-800 px-3 py-12 text-center text-sm text-zinc-600">
                {q.trim()
                  ? `Ничего не найдено по «${q}»`
                  : "Нет связей с поставщиками в текущих данных"}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-200">Топ заказчиков</h3>
          <div className="space-y-2">
            {buyerTopList.map(([name, data]) => (
              <button
                key={name}
                onClick={() => setOpenBuyer(name)}
                className="group w-full rounded-lg bg-zinc-900/40 px-3 py-2.5 text-left transition hover:bg-zinc-900/80"
              >
                <div className="text-sm text-zinc-200 group-hover:text-emerald-400">{name}</div>
                <div className="mt-1 flex justify-between text-[11px] text-zinc-500">
                  <span>{data.count} алертов</span>
                  <span className="font-mono">{(data.totalAmount / 1_000_000_000).toFixed(1)} млрд</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ConnectionDetailModal
        connection={openConnection}
        onClose={() => setOpenConnection(null)}
      />
      <BuyerDetailModal
        buyerName={openBuyer}
        alerts={alerts}
        onClose={() => setOpenBuyer(null)}
        onOpenConnection={handleOpenConnectionByName}
      />
    </Shell>
  );
}
