import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai";
import { localDeepResearch } from "@/lib/ai/localFallback";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const alert = await prisma.alert.findUnique({
    where: { id: params.id },
    include: { tender: true },
  });
  if (!alert) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (alert.aiResearch) {
    return NextResponse.json({ research: alert.aiResearch, cached: true });
  }

  let research: string;
  let source: "ai" | "local" = "ai";
  try {
    research = await ai.research(alert.tender);
  } catch (err) {
    console.warn("research AI failed, using local fallback", err);
    research = localDeepResearch(alert, alert.tender);
    source = "local";
  }

  await prisma.alert
    .update({ where: { id: alert.id }, data: { aiResearch: research } })
    .catch((e) => console.warn("research persist failed", e));

  return NextResponse.json({ research, cached: false, source });
}
