import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { bigintJsonReplacer } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const since = req.nextUrl.searchParams.get("since");
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 100), 500);

  const where = since ? { createdAt: { gt: new Date(since) } } : {};

  const alerts = await prisma.alert.findMany({
    where,
    include: { tender: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return new NextResponse(JSON.stringify({ alerts }, bigintJsonReplacer), {
    headers: { "content-type": "application/json" },
  });
}
