"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ClientAlert } from "@/lib/hooks";
import { TOOLTIP_STYLE } from "./chartTheme";

export function TrendChart({ alerts }: { alerts: ClientAlert[] }) {
  const data = useMemo(() => {
    const days: { date: string; tenders: number; alerts: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(5, 10);
      days.push({ date: key, tenders: 0, alerts: 0 });
    }
    const tenderSeen = new Set<string>();
    for (const a of alerts) {
      const key = new Date(a.createdAt).toISOString().slice(5, 10);
      const day = days.find((d) => d.date === key);
      if (!day) continue;
      day.alerts += 1;
      const tk = `${a.tender.id}-${key}`;
      if (!tenderSeen.has(tk)) {
        day.tenders += 1;
        tenderSeen.add(tk);
      }
    }
    return days;
  }, [alerts]);

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
          📈 Динамика тендеров и рисков (30 дней)
        </h3>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} stroke="#3f3f46" />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} stroke="#3f3f46" allowDecimals={false} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE.contentStyle}
              labelStyle={TOOLTIP_STYLE.labelStyle}
              itemStyle={TOOLTIP_STYLE.itemStyle}
              cursor={TOOLTIP_STYLE.cursor}
            />
            <Area type="monotone" dataKey="tenders" stroke="#10b981" strokeWidth={2} fill="url(#t)" />
            <Area type="monotone" dataKey="alerts" stroke="#f43f5e" strokeWidth={2} fill="url(#a)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
