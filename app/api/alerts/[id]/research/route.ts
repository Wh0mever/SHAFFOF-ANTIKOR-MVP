import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai";

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

  try {
    const research = await ai.research(alert.tender);
    await prisma.alert.update({ where: { id: alert.id }, data: { aiResearch: research } });
    return NextResponse.json({ research, cached: false });
  } catch (err) {
    console.error("research failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "research failed" },
      { status: 500 }
    );
  }
}
