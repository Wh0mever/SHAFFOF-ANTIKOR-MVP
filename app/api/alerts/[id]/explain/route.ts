import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai";

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

  try {
    const explanation = await ai.explain(alert, alert.tender);
    await prisma.alert.update({ where: { id: alert.id }, data: { aiExplanation: explanation } });
    return NextResponse.json({ explanation, cached: false });
  } catch (err) {
    console.error("explain failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "explain failed" },
      { status: 500 }
    );
  }
}
