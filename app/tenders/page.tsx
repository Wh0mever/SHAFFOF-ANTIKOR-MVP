"use client";

import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { Shell } from "../components/shell/Shell";
import { useLiveAlerts, type ClientAlert } from "@/lib/hooks";
import { AlertDetailModal } from "../components/alerts/AlertDetailModal";

type Row = {
  id: string;
  displayNo: string;
  title: string;
  buyerName: string;
  region: string;
  amount: number;
  topAlert: ClientAlert;
  alertsCount: number;
  maxSeverity: number;
};

export default function TendersPage() {
  const { alerts } = useLiveAlerts(15_000);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<ClientAlert | null>(null);

  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    for (const a of alerts) {
      const cur = map.get(a.tender.id);
      if (!cur) {
        map.set(a.tender.id, {
          id: a.tender.id,
          displayNo: a.tender.displayNo,
          title: a.tender.title,
          buyerName: a.tender.buyerName,
          region: a.region,
          amount: Number(a.tender.amount),
          topAlert: a,
          alertsCount: 1,
          maxSeverity: a.severity,
        });
      } else {
        cur.alertsCount += 1;
        if (a.severity > cur.maxSeverity) {
          cur.maxSeverity = a.severity;
          cur.topAlert = a;
        }
      }
    }
    let arr = Array.from(map.values());
    if (q.trim()) {
      const lc = q.toLowerCase();
      arr = arr.filter(
        (r) =>
          r.title.toLowerCase().includes(lc) ||
          r.displayNo.toLowerCase().includes(lc) ||
          r.buyerName.toLowerCase().includes(lc) ||
          r.region.toLowerCase().includes(lc)
      );
    }
    return arr.sort((a, b) => b.maxSeverity - a.maxSeverity);
  }, [alerts, q]);

  return (
    <Shell title="Тендеры" subtitle="Все тендеры в системе с алертами">
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по названию, ИНН, региону…"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-9 py-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500/40"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800/80 bg-zinc-900/30">
            <tr className="text-[10px] uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Название</th>
              <th className="px-4 py-3 text-left font-medium">Заказчик</th>
              <th className="px-4 py-3 text-left font-medium">Регион</th>
              <th className="px-4 py-3 text-right font-medium">Сумма</th>
              <th className="px-4 py-3 text-right font-medium">Алерты</th>
              <th className="px-4 py-3 text-right font-medium">Риск</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => setOpen(r.topAlert)}
                className="cursor-pointer hover:bg-zinc-900/40"
              >
                <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">{r.displayNo}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                    <span className="text-zinc-200">{r.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-400">{r.buyerName}</td>
                <td className="px-4 py-3 text-zinc-400">{r.region}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-zinc-300">
                  {Math.round(r.amount / 1_000_000)} млн
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="rounded-md bg-zinc-900 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                    {r.alertsCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className="rounded-md px-2 py-0.5 font-mono text-[11px] font-bold"
                    style={{
                      color: r.maxSeverity >= 80 ? "#fb7185" : r.maxSeverity >= 60 ? "#fb923c" : "#facc15",
                      background:
                        r.maxSeverity >= 80
                          ? "rgba(244,63,94,0.1)"
                          : r.maxSeverity >= 60
                          ? "rgba(249,115,22,0.1)"
                          : "rgba(250,204,21,0.1)",
                    }}
                  >
                    {r.maxSeverity}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-sm text-zinc-600">
                  Тендеры не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertDetailModal alert={open} onClose={() => setOpen(null)} />
    </Shell>
  );
}
