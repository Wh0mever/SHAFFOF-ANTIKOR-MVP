import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { bigintJsonReplacer } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { tin: string } }) {
  const tin = params.tin;
  const stats = await prisma.buyerStats.findUnique({ where: { tin } });

  const tenders = await prisma.tender.findMany({
    where: { buyerTin: tin },
    include: { alerts: true },
    orderBy: { startDate: "desc" },
    take: 100,
  });

  const alerts = tenders.flatMap((t) => t.alerts);
  const flaggedCount = tenders.filter((t) => t.alerts.length > 0).length;

  const topSuppliers = await prisma.tender.groupBy({
    by: ["sellerTin", "sellerName"],
    where: { buyerTin: tin, sellerTin: { not: null } },
    _count: { _all: true },
    _sum: { amount: true },
    orderBy: { _count: { sellerTin: "desc" } },
    take: 10,
  });

  return new NextResponse(
    JSON.stringify(
      {
        stats,
        tenders,
        alertsCount: alerts.length,
        flaggedTenders: flaggedCount,
        topSuppliers,
      },
      bigintJsonReplacer
    ),
    { headers: { "content-type": "application/json" } }
  );
}
