import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai";
import { localFastExplain } from "@/lib/ai/localFallback";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const alert = await prisma.alert.findUnique({
    where: { id: params.id },
    include: { tender: true },
  });
  if (!alert) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (alert.aiExplanation) {
    return NextResponse.json({ explanation: alert.aiExplanation, cached: true });
  }

  let explanation: string;
  let source: "ai" | "local" = "ai";
  try {
    explanation = await ai.explain(alert, alert.tender);
  } catch (err) {
    console.warn("explain AI failed, using local fallback", err);
    explanation = localFastExplain(alert, alert.tender);
    source = "local";
  }

  await prisma.alert
    .update({ where: { id: alert.id }, data: { aiExplanation: explanation } })
    .catch((e) => console.warn("explain persist failed", e));

  return NextResponse.json({ explanation, cached: false, source });
}
