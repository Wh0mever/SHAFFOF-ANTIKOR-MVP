import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ai } from "@/lib/ai";
import { bigintJsonReplacer } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  region: z.string().min(1),
  severity: z.number().int().min(0).max(100),
  ruleCode: z.enum(["SOLO", "PRICE_SPIKE", "SERIAL", "RUSHED", "ROUND", "REGION"]),
  amount: z.number().positive(),
  title: z.string().optional(),
  buyerName: z.string().optional(),
});

const DEFAULT_MESSAGES: Record<string, string> = {
  SOLO: "Yagona ishtirokchi: monopoliya ehtimoli",
  PRICE_SPIKE: "Narx medianidan yuqori",
  SERIAL: "Takroriy g'olib",
  RUSHED: "Qisqa muddat",
  ROUND: "Yumaloq summa",
  REGION: "Mahalliy shartnoma, sotuvchi boshqa viloyatdan",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { region, severity, ruleCode, amount, title, buyerName } = parsed.data;
  const now = new Date();
  const id = `DEMO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const tender = await prisma.tender.create({
    data: {
      id,
      displayNo: `DEMO-${Math.floor(Math.random() * 900000) + 100000}`,
      title: title ?? `Demo tender — ${ruleCode}`,
      amount: BigInt(Math.round(amount)),
      currency: "UZS",
      buyerName: buyerName ?? "DEMO Buyurtmachi",
      buyerTin: "000000000",
      sellerName: "DEMO Seller MCHJ",
      sellerTin: "000000001",
      region,
      category: "Qurilish materiallari",
      startDate: now,
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      bidderCount: ruleCode === "SOLO" ? 1 : 3,
    },
  });

  const alert = await prisma.alert.create({
    data: {
      tenderId: tender.id,
      ruleCode,
      severity,
      message: DEFAULT_MESSAGES[ruleCode] ?? "Shubhali tender",
      region,
    },
  });

  ai.explain(alert, tender)
    .then((text) =>
      prisma.alert.update({ where: { id: alert.id }, data: { aiExplanation: text } })
    )
    .catch((err) => console.warn("demo explain failed", err));

  return new NextResponse(
    JSON.stringify({ ok: true, tender, alert }, bigintJsonReplacer),
    { status: 201, headers: { "content-type": "application/json" } }
  );
}
