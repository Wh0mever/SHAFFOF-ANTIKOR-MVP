import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bigintJsonReplacer } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalAlerts, alerts24h, totalTenders, alertsByRegion, alertsByRule, totalAmountAgg] =
    await Promise.all([
      prisma.alert.count(),
      prisma.alert.count({ where: { createdAt: { gte: since24h } } }),
      prisma.tender.count(),
      prisma.alert.groupBy({ by: ["region"], _count: { _all: true } }),
      prisma.alert.groupBy({ by: ["ruleCode"], _count: { _all: true } }),
      prisma.tender.aggregate({
        where: { alerts: { some: {} } },
        _sum: { amount: true },
      }),
    ]);

  return new NextResponse(
    JSON.stringify(
      {
        totalAlerts,
        alerts24h,
        totalTenders,
        amountAtRisk: totalAmountAgg._sum.amount ?? 0n,
        byRegion: alertsByRegion,
        byRule: alertsByRule,
      },
      bigintJsonReplacer
    ),
    {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, s-maxage=60, stale-while-revalidate=120",
        "access-control-allow-origin": "*",
      },
    }
  );
}
