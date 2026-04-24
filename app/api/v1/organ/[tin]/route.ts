import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { bigintJsonReplacer } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { tin: string } }) {
  const stats = await prisma.buyerStats.findUnique({ where: { tin: params.tin } });
  const recentTenders = await prisma.tender.findMany({
    where: { buyerTin: params.tin },
    include: { alerts: true },
    orderBy: { startDate: "desc" },
    take: 20,
  });

  return new NextResponse(
    JSON.stringify({ stats, recentTenders }, bigintJsonReplacer),
    {
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
    }
  );
}
