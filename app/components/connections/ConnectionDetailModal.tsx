"use client";

import { useMemo, useState } from "react";
import { X, Building2, ArrowRight, AlertTriangle, MapPin, Calendar, Coins, Eye } from "lucide-react";
import type { ClientAlert } from "@/lib/hooks";
import { AlertDetailModal } from "../alerts/AlertDetailModal";

const RULE_LABEL: Record<string, string> = {
  SOLO: "Единственный участник",
  PRICE_SPIKE: "Скачок цены",
  SERIAL: "Серийный победитель",
  RUSHED: "Срочная закупка",
  ROUND: "Круглая сумма",
  REGION: "Концентрация",
};

export type ConnectionData = {
  buyer: { name: string; tin: string };
  seller: { name: string; tin: string | null };
  alerts: ClientAlert[];
};

export function ConnectionDetailModal({
  connection,
  onClose,
}: {
  connection: ConnectionData | null;
  onClose: () => void;
}) {
  const [openAlert, setOpenAlert] = useState<ClientAlert | null>(null);

  const stats = useMemo(() => {
    if (!connection) return null;
    const alerts = connection.alerts;
    const totalAmount = alerts.reduce((s, a) => s + Number(a.tender.amount), 0);
    const maxSeverity = Math.max(0, ...alerts.map((a) => a.severity));
    const avgSeverity = alerts.length ? alerts.reduce((s, a) => s + a.severity, 0) / alerts.length : 0;
    const ruleBreakdown = new Map<string, number>();
    for (const a of alerts) ruleBreakdown.set(a.ruleCode, (ruleBreakdown.get(a.ruleCode) ?? 0) + 1);
    const regions = new Set(alerts.map((a) => a.region));
    const tenderIds = new Set(alerts.map((a) => a.tender.id));
    const earliest = alerts.length
      ? Math.min(...alerts.map((a) => +new Date(a.tender.startDate)))
      : 0;
    const latest = alerts.length
      ? Math.max(...alerts.map((a) => +new Date(a.tender.endDate)))
      : 0;
    const relationshipRisk = Math.min(
      100,
      Math.round(avgSeverity * 0.6 + Math.min(40, alerts.length * 8))
    );
    return {
      totalAmount,
      maxSeverity,
      avgSeverity: Math.round(avgSeverity),
      ruleBreakdown: Array.from(ruleBreakdown.entries()).sort(([, a], [, b]) => b - a),
      regions: Array.from(regions),
      tenderCount: tenderIds.size,
      earliest,
      latest,
      relationshipRisk,
    };
  }, [connection]);

  if (!connection || !stats) return null;

  const tier =
    stats.relationshipRisk >= 80 ? "КРИТИЧЕСКАЯ" :
    stats.relationshipRisk >= 60 ? "ВЫСОКОГО РИСКА" :
    stats.relationshipRisk >= 40 ? "СРЕДНЕГО РИСКА" : "ПОД НАБЛЮДЕНИЕМ";
  const tierColor =
    stats.relationshipRisk >= 80 ? "text-rose-400 bg-rose-500/10 ring-rose-500/30" :
    stats.relationshipRisk >= 60 ? "text-orange-400 bg-orange-500/10 ring-orange-500/30" :
    stats.relationshipRisk >= 40 ? "text-amber-400 bg-amber-500/10 ring-amber-500/30" :
    "text-emerald-400 bg-emerald-500/10 ring-emerald-500/30";

  const sortedAlerts = [...connection.alerts].sort((a, b) => b.severity - a.severity);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950"
        >
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-950 px-6 py-5">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Связь «заказчик → поставщик»
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                  <Building2 className="h-4 w-4 text-zinc-400" />
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{connection.buyer.name}</div>
                    <div className="text-[10px] font-mono text-zinc-500">ИНН {connection.buyer.tin}</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-600" />
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="text-sm font-semibold text-emerald-300">{connection.seller.name}</div>
                    {connection.seller.tin && (
                      <div className="text-[10px] font-mono text-emerald-500/70">ИНН {connection.seller.tin}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-md px-3 py-1.5 text-xs font-bold ring-1 ${tierColor}`}>{tier}</span>
              <button onClick={onClose} className="rounded-md p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300">
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="px-6 py-6">
            {/* Top: risk gauge + key metrics */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[auto_1fr]">
              <div className="flex items-center justify-center">
                <div className="relative flex h-32 w-32 items-center justify-center">
                  <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
                    <circle cx="50" cy="50" r="44" stroke="#27272a" strokeWidth="8" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      stroke={
                        stats.relationshipRisk >= 80 ? "#f43f5e" :
                        stats.relationshipRisk >= 60 ? "#f97316" :
                        stats.relationshipRisk >= 40 ? "#facc15" : "#10b981"
                      }
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(stats.relationshipRisk / 100) * 276.46} 276.46`}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-3xl font-bold text-zinc-100">{stats.relationshipRisk}</div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500">риск связи</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric icon={AlertTriangle} label="Алертов" value={String(connection.alerts.length)} tint="rose" />
                <Metric icon={Coins} label="Сумма" value={`${(stats.totalAmount / 1_000_000_000).toFixed(2)} млрд`} tint="emerald" />
                <Metric icon={MapPin} label="Регионов" value={String(stats.regions.length)} tint="indigo" />
                <Metric icon={Calendar} label="Тендеров" value={String(stats.tenderCount)} tint="amber" />
              </div>
            </div>

            {/* Anomaly breakdown */}
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-200">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Распределение аномалий
              </div>
              <div className="flex flex-wrap gap-2">
                {stats.ruleBreakdown.map(([rule, count]) => (
                  <div
                    key={rule}
                    className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5"
                  >
                    <span className="text-xs font-medium text-zinc-300">
                      {RULE_LABEL[rule] ?? rule}
                    </span>
                    <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                      ×{count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Regions */}
            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-200">
                <MapPin className="h-4 w-4 text-emerald-400" />
                Регионы
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stats.regions.map((r) => (
                  <span key={r} className="rounded-md bg-zinc-800/60 px-2 py-1 text-[11px] text-zinc-300">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Tender list */}
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-zinc-200">
                Тендеры между организациями ({connection.alerts.length})
              </h3>
              <div className="space-y-2">
                {sortedAlerts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setOpenAlert(a)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 text-left transition hover:border-emerald-500/40 hover:bg-zinc-900/60"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ring-1"
                      style={{
                        color: a.severity >= 80 ? "#fb7185" : a.severity >= 60 ? "#fb923c" : "#facc15",
                        background:
                          a.severity >= 80
                            ? "rgba(244,63,94,0.1)"
                            : a.severity >= 60
                            ? "rgba(249,115,22,0.1)"
                            : "rgba(250,204,21,0.1)",
                        borderColor: "rgba(255,255,255,0.05)",
                      }}
                    >
                      {a.severity}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-500">{a.tender.displayNo}</span>
                        <span className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">
                          {a.ruleCode}
                        </span>
                        <span className="text-[10px] text-zinc-600">·</span>
                        <span className="text-[10px] text-zinc-500">{a.region}</span>
                      </div>
                      <div className="mt-0.5 truncate text-sm text-zinc-200">{a.tender.title}</div>
                      <div className="mt-0.5 text-[11px] text-zinc-600">{a.message}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm tabular-nums text-emerald-400">
                        {Math.round(Number(a.tender.amount) / 1_000_000)}
                        <span className="ml-0.5 text-[10px] text-zinc-500">млн</span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-zinc-600">
                        {new Date(a.tender.startDate).toISOString().slice(0, 10)}
                      </div>
                    </div>
                    <Eye className="h-4 w-4 shrink-0 text-zinc-700 transition group-hover:text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="mb-2 text-sm font-semibold text-amber-400">Рекомендации к проверке</div>
              <ul className="list-inside list-disc space-y-1 text-xs text-zinc-400">
                <li>Запросить у заказчика обоснование выбора этого поставщика по {connection.alerts.length} контрактам</li>
                <li>Сверить цены с медианой по категории — возможно завышение</li>
                <li>Проверить связи учредителей через ЕГРПО (ИНН {connection.buyer.tin} ↔ {connection.seller.tin ?? "—"})</li>
                {stats.regions.length > 1 && (
                  <li>Контракты в {stats.regions.length} регионах — географический паттерн стоит изучить</li>
                )}
                {stats.relationshipRisk >= 70 && (
                  <li className="text-rose-400">
                    Высокий совокупный риск ({stats.relationshipRisk}/100) — обращение в Антимонопольный комитет
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AlertDetailModal alert={openAlert} onClose={() => setOpenAlert(null)} />
    </>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tint: "emerald" | "rose" | "amber" | "indigo";
}) {
  const tints = {
    emerald: "text-emerald-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
    indigo: "text-indigo-400",
  };
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-1 text-lg font-bold ${tints[tint]}`}>{value}</div>
    </div>
  );
}
