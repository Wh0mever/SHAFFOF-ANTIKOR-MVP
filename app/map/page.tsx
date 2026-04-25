"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Shell } from "../components/shell/Shell";
import { UzMap2D, type RegionRiskMap } from "../components/map/UzMap2D";
import { useLiveAlerts, type ClientAlert } from "@/lib/hooks";
import { UZ_REGIONS } from "@/lib/regions";
import { AlertDetailModal } from "../components/alerts/AlertDetailModal";
import { RULE_LABEL } from "@/lib/anomalies";
import { StarButton } from "../components/shell/StarButton";

const TIERS = [
  { label: "Критический (>60)", color: "#dc2626" },
  { label: "Высокий (45-60)", color: "#ea580c" },
  { label: "Средний (30-45)", color: "#d97706" },
  { label: "Низкий (15-30)", color: "#16a34a" },
  { label: "Нет данных", color: "#1f2937" },
];

export default function MapPage() {
  const { alerts } = useLiveAlerts(15_000);
  const [selected, setSelected] = useState<string | null>("Toshkent shahri");
  const [openAlert, setOpenAlert] = useState<ClientAlert | null>(null);

  const riskByRegion = useMemo<RegionRiskMap>(() => {
    const m: RegionRiskMap = new Map();
    const counts = new Map<string, number>();
    const sums = new Map<string, number>();
    for (const a of alerts) {
      counts.set(a.region, (counts.get(a.region) ?? 0) + 1);
      sums.set(a.region, (sums.get(a.region) ?? 0) + a.severity);
    }
    const max = Math.max(1, ...counts.values());
    for (const region of Object.keys(UZ_REGIONS)) {
      const c = counts.get(region) ?? 0;
      const avg = c > 0 ? Math.round((sums.get(region) ?? 0) / c) : 0;
      const norm = Math.round((c / max) * 100);
      const score = c > 0 ? Math.round((avg + norm) / 2) : 0;
      m.set(region, { score, count: c });
    }
    return m;
  }, [alerts]);

  const selAlerts = useMemo(
    () => (selected ? alerts.filter((a) => a.region === selected) : []),
    [alerts, selected]
  );

  const sel = selected ? riskByRegion.get(selected) : null;
  const totalAmount = selAlerts.reduce((s, a) => s + Number(a.tender.amount), 0);

  const allRegionRows = useMemo(
    () =>
      Object.keys(UZ_REGIONS)
        .map((r) => ({
          key: r,
          label: UZ_REGIONS[r].nameUz,
          score: riskByRegion.get(r)?.score ?? 0,
        }))
        .sort((a, b) => b.score - a.score),
    [riskByRegion]
  );

  return (
    <Shell title="Карта рисков" subtitle="Реальная карта Узбекистана — данные xarid.uzex.uz">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_380px]">
        <div className="relative h-[640px] rounded-2xl border border-zinc-800/80 bg-zinc-950 p-4">
          <UzMap2D
            riskByRegion={riskByRegion}
            selectedRegion={selected}
            onSelect={setSelected}
            pulsingRegions={new Set([...riskByRegion.entries()].filter(([, v]) => v.score >= 60).map(([k]) => k))}
          />
          <div className="absolute bottom-4 left-4 rounded-xl border border-zinc-800 bg-black/70 p-3 backdrop-blur">
            <div className="mb-2 text-[10px] uppercase tracking-wider text-zinc-500">Уровень риска</div>
            <div className="space-y-1.5">
              {TIERS.map((t) => (
                <div key={t.label} className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color }} />
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selected && sel && (
            <>
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
                <div className="text-xl font-bold text-zinc-100">
                  {UZ_REGIONS[selected]?.nameUz ?? selected}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${sel.score}%`,
                          background:
                            sel.score >= 60 ? "#dc2626" : sel.score >= 30 ? "#d97706" : "#10b981",
                        }}
                      />
                    </div>
                  </div>
                  <div className="font-mono text-sm tabular-nums text-zinc-400">
                    {sel.score}<span className="text-zinc-600">/100</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <MiniStat label="Тендеров" value={new Set(selAlerts.map((a) => a.tender.id)).size} />
                  <MiniStat label="Подозрительных" value={selAlerts.filter((a) => a.severity >= 60).length} tint="amber" />
                </div>
                <div className="mt-3 rounded-xl bg-zinc-900/60 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">Общая сумма</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {(totalAmount / 1_000_000_000).toFixed(1)} <span className="text-xs">млрд сум</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Тендеры региона ({new Set(selAlerts.map((a) => a.tender.id)).size})
                  </div>
                  <StarButton
                    kind="REGION"
                    id={selected}
                    label={UZ_REGIONS[selected]?.nameUz ?? selected}
                    size={16}
                  />
                </div>
                <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                  {dedupTenders(selAlerts).slice(0, 30).map((a) => {
                    const tier =
                      a.severity >= 80
                        ? "#f43f5e"
                        : a.severity >= 60
                        ? "#f97316"
                        : a.severity >= 40
                        ? "#facc15"
                        : "#10b981";
                    return (
                      <button
                        key={a.tender.id}
                        onClick={() => setOpenAlert(a)}
                        className="group w-full rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-2.5 text-left transition hover:border-emerald-500/40 hover:bg-zinc-900/80"
                      >
                        <div className="flex items-baseline justify-between gap-2 text-[11px]">
                          <span className="font-mono text-zinc-500">{a.tender.displayNo}</span>
                          <span className="font-mono text-zinc-300">
                            {Math.round(Number(a.tender.amount) / 1_000_000).toLocaleString("ru-RU")} млн
                          </span>
                        </div>
                        <div className="mt-0.5 truncate text-sm text-zinc-100">{a.tender.title}</div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span
                            className="rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold ring-1"
                            style={{
                              color: tier,
                              background: tier + "1A",
                              borderColor: tier + "55",
                            }}
                          >
                            {a.severity}
                          </span>
                          <span className="rounded-md bg-zinc-800/60 px-1.5 py-0.5 text-[9px] text-zinc-400">
                            {RULE_LABEL[a.ruleCode] ?? a.ruleCode}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  {selAlerts.length === 0 && (
                    <div className="rounded-lg border border-dashed border-zinc-800 px-3 py-6 text-center text-xs text-zinc-600">
                      В этом регионе нет алертов
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
            <div className="mb-3 text-[10px] uppercase tracking-wider text-zinc-500">Все регионы</div>
            <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
              {allRegionRows.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setSelected(r.key)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-zinc-900"
                >
                  <span className="flex-1 truncate text-left text-xs text-zinc-300">{r.label}</span>
                  <div className="h-1 w-16 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.score}%`,
                        background:
                          r.score >= 60 ? "#dc2626" : r.score >= 30 ? "#d97706" : "#16a34a",
                      }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[11px] text-zinc-500">{r.score}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AlertDetailModal alert={openAlert} allAlerts={alerts} onClose={() => setOpenAlert(null)} />
    </Shell>
  );
}

/** Group alerts by tender.id, keep the one with the highest severity per tender. */
function dedupTenders(alerts: ClientAlert[]): ClientAlert[] {
  const m = new Map<string, ClientAlert>();
  for (const a of alerts) {
    const cur = m.get(a.tender.id);
    if (!cur || a.severity > cur.severity) m.set(a.tender.id, a);
  }
  return Array.from(m.values()).sort((a, b) => b.severity - a.severity);
}

function MiniStat({
  label,
  value,
  tint = "zinc",
}: {
  label: string;
  value: number | string;
  tint?: "zinc" | "amber" | "rose";
}) {
  const colors = {
    zinc: "text-zinc-100",
    amber: "text-amber-400",
    rose: "text-rose-400",
  };
  return (
    <div className="rounded-xl bg-zinc-900/60 p-3">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`text-2xl font-bold ${colors[tint]}`}>{value}</div>
    </div>
  );
}
