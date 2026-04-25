"use client";

import { useMemo, useState } from "react";
import { Bell, EyeOff, AlertOctagon, Zap, CheckCheck } from "lucide-react";
import { Shell } from "../components/shell/Shell";
import { KpiCard } from "../components/dashboard/KpiCard";
import { AlertItem } from "../components/alerts/AlertItem";
import { AlertDetailModal } from "../components/alerts/AlertDetailModal";
import { useLiveAlerts, type ClientAlert } from "@/lib/hooks";

type FilterTab = "all" | "unread" | "critical" | "high";

const RULE_OPTIONS = [
  { value: "all", label: "Все типы" },
  { value: "SOLO", label: "Единственный участник" },
  { value: "PRICE_SPIKE", label: "Скачок цены" },
  { value: "SERIAL", label: "Серийный победитель" },
  { value: "RUSHED", label: "Срочная закупка" },
  { value: "ROUND", label: "Круглая сумма" },
  { value: "REGION", label: "Региональная концентрация" },
];

export default function AlertsPage() {
  const { alerts } = useLiveAlerts(15_000);
  const [tab, setTab] = useState<FilterTab>("all");
  const [ruleFilter, setRuleFilter] = useState("all");
  const [openAlert, setOpenAlert] = useState<ClientAlert | null>(null);

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (tab === "critical" && a.severity < 80) return false;
      if (tab === "high" && (a.severity < 60 || a.severity >= 80)) return false;
      if (ruleFilter !== "all" && a.ruleCode !== ruleFilter) return false;
      return true;
    });
  }, [alerts, tab, ruleFilter]);

  const total = alerts.length;
  const unread = alerts.length; // semantics: all are unread until a "read" mechanism added
  const critical = alerts.filter((a) => a.severity >= 80).length;
  const high = alerts.filter((a) => a.severity >= 60 && a.severity < 80).length;

  return (
    <Shell title="Алерты" subtitle={`${unread} непрочитанных из ${total}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Всего" value={total} icon={Bell} tint="indigo" />
        <KpiCard label="Непрочитанные" value={unread} icon={EyeOff} tint="amber" />
        <KpiCard label="Критические" value={critical} icon={AlertOctagon} tint="rose" />
        <KpiCard label="Высокие" value={high} icon={Zap} tint="amber" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Chip active={tab === "all"} onClick={() => setTab("all")}>Все</Chip>
        <Chip active={tab === "unread"} onClick={() => setTab("unread")}>Непрочитанные</Chip>
        <Chip active={tab === "critical"} onClick={() => setTab("critical")}>Критические</Chip>
        <Chip active={tab === "high"} onClick={() => setTab("high")}>Высокие</Chip>
        <select
          value={ruleFilter}
          onChange={(e) => setRuleFilter(e.target.value)}
          className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs text-zinc-300 outline-none focus:border-emerald-500/40"
        >
          {RULE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="ml-auto">
          <button className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-xs text-zinc-400 hover:text-emerald-400">
            <CheckCheck className="h-3.5 w-3.5" />
            Прочитать все
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {filtered.map((a) => (
          <AlertItem key={a.id} alert={a} onOpen={setOpenAlert} />
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 px-6 py-16 text-center text-sm text-zinc-600">
            Нет алертов по выбранным фильтрам
          </div>
        )}
      </div>

      <AlertDetailModal alert={openAlert} onClose={() => setOpenAlert(null)} />
    </Shell>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
        active
          ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}
