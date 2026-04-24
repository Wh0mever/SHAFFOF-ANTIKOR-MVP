"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge, RuleBadge, SeverityBadge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { formatUzs, timeAgoUz } from "@/lib/utils";

type BuyerStats = {
  tin: string;
  name: string;
  region: string | null;
  totalContracts: number;
  totalAmount: string;
  suspiciousCount: number;
  riskScore: number;
};

type OrganAlert = {
  id: string;
  ruleCode: string;
  severity: number;
  message: string;
  createdAt: string;
};

type OrganTender = {
  id: string;
  displayNo: string;
  title: string;
  amount: string;
  region: string;
  sellerName: string | null;
  startDate: string;
  alerts: OrganAlert[];
};

type OrganResponse = {
  stats: BuyerStats | null;
  tenders: OrganTender[];
  alertsCount: number;
  flaggedTenders: number;
  topSuppliers: Array<{
    sellerTin: string | null;
    sellerName: string | null;
    _count: { _all: number };
    _sum: { amount: string | null };
  }>;
};

export default function OrganPage({ params }: { params: { tin: string } }) {
  const [data, setData] = useState<OrganResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/organ/${params.tin}`, { cache: "no-store" });
        if (res.ok) setData(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, [params.tin]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (!data || !data.stats) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="text-xs text-emerald-500">← Bosh sahifa</Link>
        <h1 className="mt-4 text-2xl text-zinc-100">Buyurtmachi topilmadi</h1>
        <p className="mt-2 text-sm text-zinc-400">TIN: {params.tin}</p>
      </main>
    );
  }

  const { stats, tenders, alertsCount, flaggedTenders, topSuppliers } = data;

  const severityBuckets: Record<string, number> = {};
  for (const t of tenders) {
    for (const a of t.alerts) {
      const day = new Date(a.createdAt).toISOString().slice(0, 10);
      severityBuckets[day] = (severityBuckets[day] ?? 0) + a.severity;
    }
  }
  const chartData = Object.entries(severityBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, total]) => ({ date: date.slice(5), total }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/"
        className="text-[10px] uppercase tracking-[0.3em] text-emerald-500 hover:text-emerald-300"
      >
        ← SHAFFOF
      </Link>

      <header className="mt-2">
        <h1 className="text-3xl font-bold text-zinc-100">{stats.name}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <Badge>TIN {stats.tin}</Badge>
          {stats.region && <Badge>{stats.region}</Badge>}
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Shartnomalar" value={stats.totalContracts} />
        <Kpi label="Jami summa" value={`${formatUzs(BigInt(stats.totalAmount))} so'm`} />
        <Kpi label="Shubhali tenderlar" value={flaggedTenders} accent />
        <Kpi label="Ogohlantirishlar" value={alertsCount} />
      </section>

      {chartData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Severity dinamikasi (kunma-kun)</CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }}
                  labelStyle={{ color: "#e4e4e7" }}
                />
                <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {topSuppliers.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Top ta'minotchilar</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-500">
                  <th className="py-2 text-left font-normal">Ta'minotchi</th>
                  <th className="py-2 text-right font-normal">Shartnomalar</th>
                  <th className="py-2 text-right font-normal">Summa</th>
                </tr>
              </thead>
              <tbody>
                {topSuppliers.map((s, i) => (
                  <tr key={`${s.sellerTin}-${i}`} className="border-b border-zinc-900">
                    <td className="py-2 text-zinc-200">{s.sellerName ?? s.sellerTin}</td>
                    <td className="py-2 text-right text-zinc-300 tabular-nums">{s._count._all}</td>
                    <td className="py-2 text-right text-emerald-400 tabular-nums">
                      {s._sum.amount ? formatUzs(BigInt(s._sum.amount)) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>So'nggi shubhali tenderlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tenders
              .filter((t) => t.alerts.length > 0)
              .slice(0, 20)
              .map((t) => (
                <div
                  key={t.id}
                  className="rounded-md border border-zinc-800/80 bg-zinc-950/60 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-1">
                        {t.alerts.map((a) => (
                          <span key={a.id} className="flex items-center gap-1">
                            <RuleBadge code={a.ruleCode} />
                            <SeverityBadge severity={a.severity} />
                          </span>
                        ))}
                      </div>
                      <div className="mt-1 truncate text-sm text-zinc-100">{t.title}</div>
                      <div className="text-xs text-zinc-500">
                        {t.sellerName ?? "Noma'lum sotuvchi"} · {timeAgoUz(new Date(t.startDate))}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-emerald-400">{formatUzs(BigInt(t.amount))}</div>
                      <div className="text-[10px] text-zinc-500">UZS</div>
                    </div>
                  </div>
                </div>
              ))}
            {tenders.filter((t) => t.alerts.length > 0).length === 0 && (
              <p className="text-xs text-zinc-500">Ushbu buyurtmachida ogohlantirilgan tender yo'q.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 backdrop-blur">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-xl ${accent ? "text-emerald-400" : "text-zinc-100"}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
