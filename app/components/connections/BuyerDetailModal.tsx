"use client";

import { useMemo, useState } from "react";
import { X, Building2, ArrowRight, Bell, Coins, MapPin, FileText } from "lucide-react";
import type { ClientAlert } from "@/lib/hooks";
import { AlertDetailModal } from "../alerts/AlertDetailModal";

export function BuyerDetailModal({
  buyerName,
  alerts,
  onClose,
  onOpenConnection,
}: {
  buyerName: string | null;
  alerts: ClientAlert[];
  onClose: () => void;
  onOpenConnection?: (sellerName: string) => void;
}) {
  const [openAlert, setOpenAlert] = useState<ClientAlert | null>(null);

  const buyerData = useMemo(() => {
    if (!buyerName) return null;
    const own = alerts.filter((a) => a.tender.buyerName === buyerName);
    if (own.length === 0) return null;

    const totalAmount = own.reduce((s, a) => s + Number(a.tender.amount), 0);
    const tin = own[0].tender.buyerTin;
    const sellersMap = new Map<string, { count: number; amount: number }>();
    const regionsMap = new Map<string, number>();
    const rulesMap = new Map<string, number>();

    for (const a of own) {
      const seller = a.tender.sellerName ?? "Не указан";
      const cur = sellersMap.get(seller) ?? { count: 0, amount: 0 };
      cur.count += 1;
      cur.amount += Number(a.tender.amount);
      sellersMap.set(seller, cur);

      regionsMap.set(a.region, (regionsMap.get(a.region) ?? 0) + 1);
      rulesMap.set(a.ruleCode, (rulesMap.get(a.ruleCode) ?? 0) + 1);
    }

    const sellers = Array.from(sellersMap.entries())
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.count - a.count);

    const concentration = sellers[0]?.count
      ? Math.round((sellers[0].count / own.length) * 100)
      : 0;

    const avgSeverity = Math.round(own.reduce((s, a) => s + a.severity, 0) / own.length);
    const tenderIds = new Set(own.map((a) => a.tender.id));

    return {
      tin,
      alerts: own,
      totalAmount,
      sellers,
      regions: Array.from(regionsMap.entries()).sort(([, a], [, b]) => b - a),
      rules: Array.from(rulesMap.entries()).sort(([, a], [, b]) => b - a),
      concentration,
      avgSeverity,
      tenderCount: tenderIds.size,
    };
  }, [buyerName, alerts]);

  if (!buyerName || !buyerData) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950"
        >
          <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-950 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800">
                <Building2 className="h-5 w-5 text-zinc-300" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Заказчик
                </div>
                <div className="text-xl font-bold text-zinc-100">{buyerName}</div>
                <div className="mt-0.5 font-mono text-[11px] text-zinc-500">ИНН {buyerData.tin}</div>
              </div>
            </div>
            <button onClick={onClose} className="rounded-md p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300">
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="px-6 py-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric icon={Bell} label="Алертов" value={String(buyerData.alerts.length)} tint="rose" />
              <Metric icon={FileText} label="Тендеров" value={String(buyerData.tenderCount)} tint="indigo" />
              <Metric icon={Coins} label="Сумма" value={`${(buyerData.totalAmount / 1_000_000_000).toFixed(2)} млрд`} tint="emerald" />
              <Metric icon={MapPin} label="Регионов" value={String(buyerData.regions.length)} tint="amber" />
            </div>

            {buyerData.concentration >= 50 && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
                <div className="text-sm font-semibold text-rose-400">⚠ Высокая концентрация</div>
                <div className="mt-1 text-xs text-zinc-300">
                  {buyerData.concentration}% контрактов идут одному поставщику —{" "}
                  <span className="font-semibold text-zinc-100">{buyerData.sellers[0].name}</span>.
                  Это типичный признак ограниченной конкуренции.
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-zinc-200">
                Поставщики ({buyerData.sellers.length})
              </h3>
              <div className="space-y-2">
                {buyerData.sellers.map((s, i) => {
                  const share = Math.round((s.count / buyerData.alerts.length) * 100);
                  return (
                    <button
                      key={s.name}
                      onClick={() => onOpenConnection?.(s.name)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 text-left transition hover:border-emerald-500/40 hover:bg-zinc-900/60"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800 font-mono text-xs text-zinc-400">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-zinc-200 group-hover:text-emerald-400">
                          {s.name}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-zinc-500">{share}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono tabular-nums text-zinc-200">×{s.count}</div>
                        <div className="text-[10px] text-zinc-500">
                          {(s.amount / 1_000_000_000).toFixed(2)} млрд
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-700 transition group-hover:text-emerald-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  По регионам
                </h4>
                <div className="space-y-1.5">
                  {buyerData.regions.slice(0, 6).map(([r, n]) => (
                    <div key={r} className="flex justify-between text-xs">
                      <span className="text-zinc-300">{r}</span>
                      <span className="font-mono text-zinc-500">{n}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  По типам аномалий
                </h4>
                <div className="space-y-1.5">
                  {buyerData.rules.map(([r, n]) => (
                    <div key={r} className="flex justify-between text-xs">
                      <span className="text-zinc-300">{r}</span>
                      <span className="font-mono text-zinc-500">×{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-zinc-200">Последние алерты</h3>
              <div className="space-y-2">
                {buyerData.alerts.slice(0, 8).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setOpenAlert(a)}
                    className="flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/30 p-2.5 text-left hover:border-emerald-500/40 hover:bg-zinc-900/60"
                  >
                    <span
                      className="rounded-md px-2 py-0.5 font-mono text-[10px] font-bold"
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
                      {a.severity}
                    </span>
                    <div className="min-w-0 flex-1 truncate text-xs text-zinc-300">{a.tender.title}</div>
                    <span className="shrink-0 text-[10px] text-zinc-500">
                      {new Date(a.createdAt).toISOString().slice(0, 10)}
                    </span>
                  </button>
                ))}
              </div>
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
