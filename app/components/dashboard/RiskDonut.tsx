"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { ClientAlert } from "@/lib/hooks";

const TIERS = [
  { name: "Низкий", min: 0, max: 39, color: "#10b981" },
  { name: "Средний", min: 40, max: 59, color: "#facc15" },
  { name: "Высокий", min: 60, max: 79, color: "#f97316" },
  { name: "Критический", min: 80, max: 100, color: "#f43f5e" },
];

export function RiskDonut({ alerts }: { alerts: ClientAlert[] }) {
  const data = useMemo(() => {
    return TIERS.map((t) => ({
      name: t.name,
      value: alerts.filter((a) => a.severity >= t.min && a.severity <= t.max).length,
      color: t.color,
    }));
  }, [alerts]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
      <h3 className="mb-4 text-sm font-semibold text-zinc-200">Распределение рисков</h3>
      <div className="relative h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={2}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} stroke="#09090b" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 8 }}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-7">
          <div className="text-center">
            <div className="text-2xl font-bold text-zinc-100">{total}</div>
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">всего</div>
          </div>
        </div>
      </div>
    </div>
  );
}
