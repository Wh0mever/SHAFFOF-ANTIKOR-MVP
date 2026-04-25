import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai";
import { localDeepResearch, localReport } from "@/lib/ai/localFallback";

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

  let research = alert.aiResearch;
  if (!research) {
    try {
      research = await ai.research(alert.tender);
    } catch {
      research = localDeepResearch(alert, alert.tender);
    }
    await prisma.alert
      .update({ where: { id: alert.id }, data: { aiResearch: research } })
      .catch((e) => console.warn("research persist failed", e));
  }

  let report: string;
  let source: "ai" | "local" = "ai";
  try {
    report = await ai.report(alert, alert.tender, research);
  } catch (err) {
    console.warn("report AI failed, using local fallback", err);
    report = localReport(alert, alert.tender);
    source = "local";
  }

  await prisma.alert
    .update({ where: { id: alert.id }, data: { aiReport: report } })
    .catch((e) => console.warn("report persist failed", e));

  return NextResponse.json({ report, research, cached: false, source });
}
