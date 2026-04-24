import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { bigintJsonReplacer } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const alert = await prisma.alert.findUnique({
    where: { id: params.id },
    include: { tender: true },
  });
  if (!alert) return NextResponse.json({ error: "not found" }, { status: 404 });

  return new NextResponse(JSON.stringify({ alert }, bigintJsonReplacer), {
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
}
