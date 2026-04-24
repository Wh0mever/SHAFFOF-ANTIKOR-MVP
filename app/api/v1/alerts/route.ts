import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { bigintJsonReplacer } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const severity = sp.get("severity");
  const region = sp.get("region");
  const ruleCode = sp.get("ruleCode");
  const limit = Math.min(Number(sp.get("limit") ?? 50), 500);

  const where: Record<string, unknown> = {};
  if (severity) where.severity = { gte: Number(severity) };
  if (region) where.region = region;
  if (ruleCode) where.ruleCode = ruleCode;

  const alerts = await prisma.alert.findMany({
    where,
    include: { tender: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return new NextResponse(
    JSON.stringify({ count: alerts.length, alerts }, bigintJsonReplacer),
    {
      headers: {
        "content-type": "application/json",
        "cache-control": "public, s-maxage=30, stale-while-revalidate=60",
        "access-control-allow-origin": "*",
      },
    }
  );
}
