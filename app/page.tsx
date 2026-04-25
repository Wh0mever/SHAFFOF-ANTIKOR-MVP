"use client";

import { ShieldCheck, AlertOctagon, Bell, Bot } from "lucide-react";
import { Shell } from "./components/shell/Shell";
import { LiveEmptyHint } from "./components/shell/EmptyState";
import { KpiCard } from "./components/dashboard/KpiCard";
import { TrendChart } from "./components/dashboard/TrendChart";
import { RiskDonut } from "./components/dashboard/RiskDonut";
import { RegionBars } from "./components/dashboard/RegionBars";
import { TopRiskTenders } from "./components/dashboard/TopRiskTenders";
import { RecentAlertsTable } from "./components/dashboard/RecentAlertsTable";
import { useLiveAlerts } from "@/lib/hooks";

export default function DashboardPage() {
  const { alerts } = useLiveAlerts(15_000);

  const totalTenders = new Set(alerts.map((a) => a.tender.id)).size;
  const suspicious = alerts.filter((a) => a.severity >= 60).length;
  const critical = alerts.filter((a) => a.severity >= 80).length;
  const aiAnalyzed = alerts.filter((a) => a.aiExplanation).length;
  const avgRisk =
    alerts.length === 0 ? 0 : Math.round(alerts.reduce((s, a) => s + a.severity, 0) / alerts.length);
  const regions = new Set(alerts.map((a) => a.region)).size;
  const categories = new Set(alerts.map((a) => a.tender.category).filter(Boolean)).size;
  const buyers = new Set(alerts.map((a) => a.tender.buyerTin)).size;

  return (
    <Shell title="Дашборд" subtitle="Реальное время мониторинга госзакупок Узбекистана">
      <LiveEmptyHint count={alerts.length} />
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Всего тендеров"
          value={totalTenders}
          sub="В системе"
          icon={ShieldCheck}
          tint="emerald"
          trend={{ value: 12, positive: true }}
        />
        <KpiCard
          label="Подозрительных"
          value={suspicious}
          sub={`${totalTenders > 0 ? Math.round((suspicious / totalTenders) * 100) : 0}% от общего числа`}
          icon={AlertOctagon}
          tint="amber"
        />
        <KpiCard
          label="Критических алертов"
          value={critical}
          sub="Требуют проверки"
          icon={Bell}
          tint="rose"
        />
        <KpiCard
          label="Проанализировано AI"
          value={aiAnalyzed}
          sub="Тендеров с AI-оценкой"
          icon={Bot}
          tint="indigo"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TrendChart alerts={alerts} />
        </div>
        <RiskDonut alerts={alerts} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <RegionBars alerts={alerts} />
        <TopRiskTenders alerts={alerts} />
      </div>

      <div className="mt-5">
        <RecentAlertsTable alerts={alerts} />
      </div>

      <div className="mt-5 grid grid-cols-1 items-center gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 sm:grid-cols-[auto_1fr_auto]">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
            <circle cx="18" cy="18" r="14" stroke="#27272a" strokeWidth="3" fill="none" />
            <circle
              cx="18"
              cy="18"
              r="14"
              stroke="#10b981"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(avgRisk / 100) * 87.96} 87.96`}
            />
          </svg>
          <span className="absolute text-sm font-bold text-zinc-100">{avgRisk}</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-zinc-200">Средний риск по системе</div>
          <div className="text-xs text-zinc-500">
            {avgRisk < 50 ? "Уровень риска в пределах нормы" : "Уровень риска повышен"}
          </div>
        </div>
        <div className="flex gap-6 text-right text-sm">
          <Stat label="Регионов" value={regions} />
          <Stat label="Категорий" value={categories} />
          <Stat label="Компаний" value={buyers} />
        </div>
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-xl font-bold text-zinc-100">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
    </div>
  );
}
