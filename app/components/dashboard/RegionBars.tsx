"use client";

import { useMemo } from "react";
import type { ClientAlert } from "@/lib/hooks";
import { UZ_REGIONS } from "@/lib/regions";

function score(count: number, max: number) {
  return max > 0 ? Math.round((count / max) * 100) : 0;
}

function color(s: number) {
  if (s >= 60) return "#f43f5e";
  if (s >= 45) return "#f97316";
  if (s >= 30) return "#facc15";
  if (s >= 15) return "#10b981";
  return "#3f3f46";
}

export function RegionBars({ alerts }: { alerts: ClientAlert[] }) {
  const rows = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of alerts) m.set(a.region, (m.get(a.region) ?? 0) + 1);
    const max = Math.max(1, ...m.values());
    return Object.keys(UZ_REGIONS)
      .map((region) => {
        const n = m.get(region) ?? 0;
        const s = score(n * 10, max * 10);
        return { region: UZ_REGIONS[region].nameUz, count: n, score: s };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [alerts]);

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
      <h3 className="mb-4 text-sm font-semibold text-zinc-200">Риск по регионам</h3>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.region} className="flex items-center gap-3">
            <div className="w-28 truncate text-xs text-zinc-400">{r.region}</div>
            <div className="relative flex-1">
              <div className="h-6 overflow-hidden rounded-md bg-zinc-900">
                <div
                  className="h-full rounded-md transition-all"
                  style={{ width: `${r.score}%`, background: color(r.score) }}
                />
              </div>
            </div>
            <div className="w-12 text-right text-xs font-mono tabular-nums text-zinc-300">
              {r.score}
              <span className="text-zinc-600">/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
