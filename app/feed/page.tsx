"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLiveAlerts } from "@/lib/hooks";
import { AlertCard } from "../components/feed/AlertCard";
import { FeedFilters, type FeedFilterState } from "../components/feed/FeedFilters";
import { Skeleton } from "../components/ui/skeleton";

export default function FeedPage() {
  const { alerts, lastSync } = useLiveAlerts(15_000);
  const [filter, setFilter] = useState<FeedFilterState>({
    severity: 0,
    region: null,
    ruleCode: null,
  });

  const filtered = useMemo(
    () =>
      alerts.filter((a) => {
        if (a.severity < filter.severity) return false;
        if (filter.region && a.region !== filter.region) return false;
        if (filter.ruleCode && a.ruleCode !== filter.ruleCode) return false;
        return true;
      }),
    [alerts, filter]
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 hover:text-emerald-300"
          >
            ← SHAFFOF
          </Link>
          <h1 className="mt-1 text-3xl font-bold text-zinc-100">Alert feed</h1>
          <p className="text-sm text-zinc-500">
            {filtered.length} / {alerts.length} ogohlantirish
            {lastSync ? ` · yangilangan ${lastSync.toLocaleTimeString("uz-UZ")}` : ""}
          </p>
        </div>
      </header>

      <div className="mb-6">
        <FeedFilters value={filter} onChange={setFilter} />
      </div>

      {alerts.length === 0 && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((a) => (
          <AlertCard key={a.id} alert={a} />
        ))}
      </div>

      {alerts.length > 0 && filtered.length === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-8 text-center text-sm text-zinc-400">
          Filtr shartlariga mos ogohlantirish topilmadi.
        </div>
      )}
    </main>
  );
}
