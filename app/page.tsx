"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLiveAlerts, useStats } from "@/lib/hooks";
import { KpiOverlay } from "./components/KpiOverlay";
import { LiveTicker } from "./components/LiveTicker";
import { DemoButton } from "./components/DemoButton";
import { SeverityBadge, RuleBadge } from "./components/ui/badge";
import { formatUzs, timeAgoUz } from "@/lib/utils";

const Globe = dynamic(() => import("./components/globe/Globe").then((m) => m.Globe), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
      Globus yuklanmoqda…
    </div>
  ),
});

export default function HomePage() {
  const { alerts, lastSync, refresh } = useLiveAlerts(10_000);
  const { stats } = useStats(30_000);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const globeAlerts = useMemo(
    () =>
      alerts.map((a) => ({
        id: a.id,
        region: a.region,
        severity: a.severity,
        ruleCode: a.ruleCode,
      })),
    [alerts]
  );

  const tickerItems = useMemo(
    () =>
      alerts.slice(0, 40).map((a) => ({
        id: a.id,
        region: a.region,
        ruleCode: a.ruleCode,
        severity: a.severity,
        amount: a.tender.amount,
        title: a.tender.title,
      })),
    [alerts]
  );

  const panelAlerts = selectedRegion
    ? alerts.filter((a) => a.region === selectedRegion).slice(0, 20)
    : [];

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <div className="pointer-events-none fixed left-6 top-6 z-20">
        <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-500">Live watchdog</div>
        <div className="text-3xl font-bold text-emerald-400">SHAFFOF</div>
        <div className="mt-1 text-xs text-zinc-500">Davlat xaridlari · xarid.uzex.uz</div>
        <div className="pointer-events-auto mt-4 flex gap-2 text-xs">
          <Link href="/feed" className="rounded-md border border-zinc-800 bg-black/60 px-3 py-1 text-zinc-300 hover:text-emerald-400">
            Feed
          </Link>
          <a
            href="/api/v1/alerts"
            className="rounded-md border border-zinc-800 bg-black/60 px-3 py-1 text-zinc-300 hover:text-emerald-400"
          >
            API
          </a>
        </div>
      </div>

      <KpiOverlay
        data={{
          alerts24h: stats?.alerts24h ?? 0,
          totalAlerts: stats?.totalAlerts ?? alerts.length,
          amountAtRisk: stats?.amountAtRisk ?? "0",
          lastSync,
        }}
      />

      <div className="absolute inset-0">
        <Globe alerts={globeAlerts} onRegionClick={setSelectedRegion} />
      </div>

      {selectedRegion && (
        <aside className="pointer-events-auto fixed right-6 top-48 z-20 w-[340px] max-h-[calc(100vh-260px)] overflow-y-auto rounded-lg border border-zinc-800 bg-black/80 p-4 backdrop-blur">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500">Viloyat</div>
              <h2 className="text-sm font-semibold text-zinc-100">{selectedRegion}</h2>
              <div className="text-[10px] text-zinc-500">
                {panelAlerts.length} ta ogohlantirish
              </div>
            </div>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-xs text-zinc-500 hover:text-zinc-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            {panelAlerts.length === 0 && (
              <p className="text-xs text-zinc-500">Bu viloyatda hozircha ogohlantirish yo'q.</p>
            )}
            {panelAlerts.map((a) => (
              <div
                key={a.id}
                className="rounded-md border border-zinc-800/80 bg-zinc-950/80 p-2 text-xs"
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <RuleBadge code={a.ruleCode} />
                  <SeverityBadge severity={a.severity} />
                  <span className="ml-auto text-[10px] text-zinc-500">
                    {timeAgoUz(new Date(a.createdAt))}
                  </span>
                </div>
                <div className="truncate text-zinc-200">{a.tender.title}</div>
                <div className="mt-0.5 flex items-center justify-between text-zinc-500">
                  <span className="truncate">{a.tender.buyerName}</span>
                  <span className="text-emerald-400">
                    {formatUzs(BigInt(a.tender.amount))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      <LiveTicker items={tickerItems} />
      <DemoButton onCreated={refresh} />
    </main>
  );
}
