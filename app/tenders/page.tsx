"use client";

import { useMemo, useState } from "react";
import { FileText, Search, Eye } from "lucide-react";
import { Shell } from "../components/shell/Shell";
import { useLiveAlerts, type ClientAlert } from "@/lib/hooks";
import { AlertDetailModal } from "../components/alerts/AlertDetailModal";
import { RULE_LABEL } from "@/lib/anomalies";

type Row = {
  id: string;
  displayNo: string;
  title: string;
  category: string | null;
  buyerName: string;
  region: string;
  amount: number;
  rules: string[]; // unique rule codes
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
          category: a.tender.category,
          buyerName: a.tender.buyerName,
          region: a.region,
          amount: Number(a.tender.amount),
          rules: [a.ruleCode],
          topAlert: a,
          alertsCount: 1,
          maxSeverity: a.severity,
        });
      } else {
        cur.alertsCount += 1;
        if (!cur.rules.includes(a.ruleCode)) cur.rules.push(a.ruleCode);
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
          r.region.toLowerCase().includes(lc) ||
          (r.category ?? "").toLowerCase().includes(lc)
      );
    }
    return arr.sort((a, b) => b.maxSeverity - a.maxSeverity);
  }, [alerts, q]);

  return (
    <Shell title="Тендеры" subtitle={`${rows.length} тендеров с алертами в системе`}>
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск по названию, ИНН, региону, категории…"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-9 py-2.5 text-sm text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500/40"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800/80 bg-zinc-900/30">
            <tr className="text-[10px] uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 text-left font-medium">ID</th>
              <th className="px-4 py-3 text-left font-medium">Название / Категория</th>
              <th className="px-4 py-3 text-left font-medium">Регион</th>
              <th className="px-4 py-3 text-right font-medium">Сумма</th>
              <th className="px-4 py-3 text-left font-medium">Risk</th>
              <th className="px-4 py-3 text-left font-medium">Аномалии</th>
              <th className="px-4 py-3 text-right font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map((r) => {
              const tier =
                r.maxSeverity >= 80
                  ? { color: "#fb7185", bg: "rgba(244,63,94,0.06)" }
                  : r.maxSeverity >= 60
                  ? { color: "#fb923c", bg: "rgba(249,115,22,0.05)" }
                  : { color: "#facc15", bg: "transparent" };
              return (
                <tr
                  key={r.id}
                  onClick={() => setOpen(r.topAlert)}
                  className="cursor-pointer transition hover:bg-zinc-900/40"
                  style={{ backgroundColor: tier.bg }}
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">{r.displayNo}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" />
                      <div className="min-w-0">
                        <div className="truncate text-sm text-zinc-100" title={r.title}>{r.title}</div>
                        {r.category && (
                          <div className="truncate text-[10px] text-zinc-500">{r.category}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-300">{r.region}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm tabular-nums text-zinc-100">
                    {Math.round(r.amount / 1_000_000).toLocaleString("ru-RU")} млн
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${r.maxSeverity}%`, backgroundColor: tier.color }}
                        />
                      </div>
                      <span
                        className="font-mono text-xs font-medium"
                        style={{ color: tier.color }}
                      >
                        {r.maxSeverity}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.rules.slice(0, 2).map((code) => (
                        <span
                          key={code}
                          title={RULE_LABEL[code]}
                          className="rounded border border-zinc-700/50 bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-400"
                        >
                          {RULE_LABEL[code] ?? code}
                        </span>
                      ))}
                      {r.rules.length > 2 && (
                        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-zinc-500">
                          +{r.rules.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(r.topAlert);
                      }}
                      className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800/60 hover:text-emerald-400"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-sm text-zinc-600">
                  {q.trim() ? `Ничего не найдено по «${q}»` : "Нет тендеров. Переключитесь в режим DEMO для просмотра."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertDetailModal alert={open} allAlerts={alerts} onClose={() => setOpen(null)} />
    </Shell>
  );
}
