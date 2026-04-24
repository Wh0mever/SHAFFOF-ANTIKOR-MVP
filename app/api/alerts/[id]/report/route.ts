import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const alert = await prisma.alert.findUnique({
    where: { id: params.id },
    include: { tender: true },
  });
  if (!alert) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (alert.aiReport) {
    return NextResponse.json({ report: alert.aiReport, cached: true });
  }

  try {
    let research = alert.aiResearch;
    if (!research) {
      research = await ai.research(alert.tender);
      await prisma.alert.update({ where: { id: alert.id }, data: { aiResearch: research } });
    }

    const report = await ai.report(alert, alert.tender, research);
    await prisma.alert.update({ where: { id: alert.id }, data: { aiReport: report } });
    return NextResponse.json({ report, cached: false });
  } catch (err) {
    console.error("report failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "report failed" },
      { status: 500 }
    );
  }
}
