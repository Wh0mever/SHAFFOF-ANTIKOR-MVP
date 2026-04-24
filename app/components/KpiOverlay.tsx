"use client";

import { formatUzs, timeAgoUz } from "@/lib/utils";

export type KpiData = {
  alerts24h: number;
  totalAlerts: number;
  amountAtRisk: string | number;
  lastSync?: Date | null;
};

export function KpiOverlay({ data }: { data: KpiData }) {
  const amount =
    typeof data.amountAtRisk === "string" ? BigInt(data.amountAtRisk) : BigInt(data.amountAtRisk);
  return (
    <div className="pointer-events-none fixed right-6 top-6 z-20 flex w-[260px] flex-col gap-2 font-mono text-xs">
      <Row label="Ogohlantirishlar (24s)" value={String(data.alerts24h)} accent />
      <Row label="Jami" value={String(data.totalAlerts)} />
      <Row
        label="Xavf ostidagi summa"
        value={`${formatUzs(amount)} so'm`}
      />
      <Row
        label="Oxirgi sinxronlash"
        value={data.lastSync ? timeAgoUz(data.lastSync) : "—"}
      />
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between rounded-md border border-zinc-800/80 bg-black/60 px-3 py-2 backdrop-blur">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
      <span className={accent ? "text-lg text-emerald-400" : "text-sm text-zinc-200"}>{value}</span>
    </div>
  );
}
