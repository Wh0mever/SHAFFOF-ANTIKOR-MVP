"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { ClientAlert } from "@/lib/hooks";

export function RecentAlertsTable({ alerts }: { alerts: ClientAlert[] }) {
  const rows = alerts.slice(0, 6);
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Последние алерты
        </h3>
        <Link href="/alerts" className="text-xs text-emerald-400 hover:text-emerald-300">
          Все алерты →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-zinc-500">
              <th className="pb-3 text-left font-medium">ID</th>
              <th className="pb-3 text-left font-medium">Тип</th>
              <th className="pb-3 text-left font-medium">Описание</th>
              <th className="pb-3 text-right font-medium">Риск</th>
              <th className="pb-3 text-right font-medium">Время</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {rows.map((a) => (
              <tr key={a.id} className="hover:bg-zinc-900/40">
                <td className="py-3 font-mono text-[11px] text-zinc-400">{a.tender.displayNo}</td>
                <td className="py-3">
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-mono uppercase text-zinc-300">
                    {a.ruleCode}
                  </span>
                </td>
                <td className="py-3 text-zinc-300">{a.message}</td>
                <td className="py-3 text-right">
                  <RiskBar severity={a.severity} />
                </td>
                <td className="py-3 text-right text-[11px] text-zinc-500">
                  {new Date(a.createdAt).toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-zinc-600">
                  Нет алертов
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiskBar({ severity }: { severity: number }) {
  const color = severity >= 80 ? "#f43f5e" : severity >= 60 ? "#f97316" : severity >= 40 ? "#facc15" : "#10b981";
  return (
    <div className="inline-flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full" style={{ width: `${severity}%`, background: color }} />
      </div>
      <span className="font-mono text-xs tabular-nums text-zinc-300">{severity}</span>
    </div>
  );
}
