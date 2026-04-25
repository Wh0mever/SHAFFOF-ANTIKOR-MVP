import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
  tint = "emerald",
}: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: { value: number; positive?: boolean };
  icon: LucideIcon;
  tint?: "emerald" | "amber" | "rose" | "indigo";
}) {
  const tints = {
    emerald: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-400 ring-amber-500/30",
    rose: "bg-rose-500/10 text-rose-400 ring-rose-500/30",
    indigo: "bg-indigo-500/10 text-indigo-400 ring-indigo-500/30",
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 transition hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl ring-1", tints[tint])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              trend.positive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
            )}
          >
            {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-zinc-100">{value}</div>
        <div className="mt-1 text-sm font-medium text-zinc-400">{label}</div>
        {sub && <div className="mt-0.5 text-[11px] text-zinc-600">{sub}</div>}
      </div>
    </div>
  );
}
