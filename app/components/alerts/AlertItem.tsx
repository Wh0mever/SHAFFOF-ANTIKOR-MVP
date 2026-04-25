"use client";

import { AlertTriangle, Clock, Eye, CheckCheck } from "lucide-react";
import type { ClientAlert } from "@/lib/hooks";

const RULE_LABEL: Record<string, string> = {
  SOLO: "Единственный участник",
  PRICE_SPIKE: "Скачок цены",
  SERIAL: "Серийный победитель",
  RUSHED: "Срочная закупка",
  ROUND: "Круглая сумма",
  REGION: "Региональная концентрация",
};

export function AlertItem({
  alert,
  onOpen,
}: {
  alert: ClientAlert;
  onOpen: (a: ClientAlert) => void;
}) {
  const tier = alert.severity >= 80 ? "critical" : alert.severity >= 60 ? "high" : alert.severity >= 40 ? "med" : "low";
  const tierStyle =
    tier === "critical" ? "text-rose-400 bg-rose-500/10" :
    tier === "high" ? "text-orange-400 bg-orange-500/10" :
    tier === "med" ? "text-amber-400 bg-amber-500/10" :
    "text-emerald-400 bg-emerald-500/10";

  return (
    <div className="group rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4 transition hover:border-zinc-700">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-zinc-500">{alert.tender.displayNo}</span>
            <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${tierStyle}`}>
              {alert.severity}/100
            </span>
            <span className="rounded-md bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-300">
              {RULE_LABEL[alert.ruleCode] ?? alert.ruleCode}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-1.5 text-[15px] font-semibold text-zinc-100">{alert.tender.title}</div>
          <div className="mt-1 text-sm text-zinc-400">{alert.message}</div>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-zinc-600">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(alert.createdAt).toISOString().slice(0, 10)}
            </span>
            <button
              onClick={() => onOpen(alert)}
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
            >
              <Eye className="h-3 w-3" />
              Открыть тендер
            </button>
          </div>
        </div>

        <button className="text-zinc-600 opacity-0 transition group-hover:opacity-100 hover:text-emerald-400">
          <CheckCheck className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
