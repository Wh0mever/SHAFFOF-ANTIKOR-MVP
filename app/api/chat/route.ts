import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Msg = { role: "user" | "assistant" | "system"; content: string };

type Ctx = {
  total: number;
  last24h: number;
  critical: number;
  high: number;
  byRule: Array<{ ruleCode: string; count: number }>;
  topRegions: Array<{ region: string; count: number }>;
  topBuyers: Array<{ name: string; count: number }>;
  amountAtRisk: bigint;
};

async function loadContext(): Promise<Ctx | null> {
  try {
    const [total, last24h, critical, high, byRule, topRegions, alerts] = await Promise.all([
      prisma.alert.count(),
      prisma.alert.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
      prisma.alert.count({ where: { severity: { gte: 80 } } }),
      prisma.alert.count({ where: { severity: { gte: 60, lt: 80 } } }),
      prisma.alert.groupBy({ by: ["ruleCode"], _count: { _all: true } }),
      prisma.alert.groupBy({
        by: ["region"],
        _count: { _all: true },
        orderBy: { _count: { region: "desc" } },
        take: 5,
      }),
      prisma.alert.findMany({
        select: { tender: { select: { buyerName: true, amount: true } } },
        take: 200,
      }),
    ]);

    const buyersMap = new Map<string, number>();
    let amountAtRisk = 0n;
    for (const a of alerts) {
      buyersMap.set(a.tender.buyerName, (buyersMap.get(a.tender.buyerName) ?? 0) + 1);
      amountAtRisk += a.tender.amount;
    }
    const topBuyers = Array.from(buyersMap.entries())
      .sort(([, x], [, y]) => y - x)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      total,
      last24h,
      critical,
      high,
      byRule: byRule.map((r) => ({ ruleCode: r.ruleCode, count: r._count._all })),
      topRegions: topRegions.map((r) => ({ region: r.region, count: r._count._all })),
      topBuyers,
      amountAtRisk,
    };
  } catch {
    return null;
  }
}

const RULE_NAMES: Record<string, string> = {
  SOLO: "единственный участник",
  PRICE_SPIKE: "скачок цены",
  SERIAL: "серийный победитель",
  RUSHED: "срочная закупка",
  ROUND: "круглая сумма",
  REGION: "региональная концентрация",
};

const RULE_DEFS: Record<string, string> = {
  SOLO: "В тендере только один участник — это типичный признак ограниченной конкуренции и возможной договорённости с заказчиком. Severity ≈ 70.",
  PRICE_SPIKE: "Сумма тендера в 2+ раза превышает медиану по той же категории. Признак завышения цены или фиктивного завышения сметы. Severity ≈ 75.",
  SERIAL: "Один поставщик побеждает в нескольких тендерах одного заказчика подряд. Признак коррупционных связей. Severity ≈ 80.",
  RUSHED: "Срок подачи заявок ≤ 5 дней — недостаточно для подготовки конкурентного предложения. Заявка готовится заранее. Severity ≈ 55.",
  ROUND: "Сумма кратна 100 млн (например, 500 млн ровно). Реальные сметы редко получаются такими круглыми. Severity ≈ 60.",
  REGION: "Один поставщик берёт > 50% контрактов в регионе. Монополизация. Severity ≈ 65.",
};

function localAnswer(userText: string, ctx: Ctx | null): string {
  const q = userText.toLowerCase();

  // Definitions
  for (const [code, def] of Object.entries(RULE_DEFS)) {
    if (q.includes(code.toLowerCase()) || q.includes(RULE_NAMES[code])) {
      return def;
    }
  }

  if (!ctx) {
    return "База данных пока пуста. Переключитесь в режим DEMO (правый верхний угол), чтобы посмотреть пример работы системы с 50 синтетическими алертами.";
  }

  if (q.includes("красн") || q.includes("риск") || q.includes("регион") || q.includes("зон")) {
    if (ctx.topRegions.length === 0) return "В базе пока нет алертов по регионам.";
    const list = ctx.topRegions
      .map((r) => `${r.region} — ${r.count}`)
      .join(", ");
    return `Топ-5 регионов по числу алертов: ${list}.`;
  }

  if (q.includes("крит") || q.includes("severity") || q.includes("80")) {
    return `Сейчас в системе ${ctx.critical} критических алертов (severity ≥ 80) и ${ctx.high} высоких (60-79). За 24ч — ${ctx.last24h} новых.`;
  }

  if (q.includes("недел") || q.includes("24ч") || q.includes("сутк")) {
    return `За последние 24 часа создано ${ctx.last24h} алертов. Всего в системе — ${ctx.total}.`;
  }

  if (q.includes("топ") || q.includes("подозр") || q.includes("опасн")) {
    if (ctx.topBuyers.length === 0) return "Нет данных по заказчикам.";
    const list = ctx.topBuyers.map((b, i) => `${i + 1}. ${b.name} (${b.count} алертов)`).join("\n");
    return `Топ-5 заказчиков по числу алертов:\n${list}`;
  }

  if (q.includes("сумм") || q.includes("риск") || q.includes("млрд") || q.includes("млн")) {
    const ms = Number(ctx.amountAtRisk) / 1_000_000_000;
    return `Общая сумма «под риском» по всем алертам: ${ms.toFixed(2)} млрд сум. Это сумма всех тендеров, по которым сработала хотя бы одна аномалия.`;
  }

  if (q.includes("здравств") || q.includes("привет") || q.includes("hello") || q.includes("салом")) {
    return `Здравствуйте! В системе сейчас ${ctx.total} алертов (${ctx.critical} критических). Спросите, например: "Какие регионы в красной зоне?" или "Что такое SOLO?"`;
  }

  // Generic stats fallback
  return `В системе ${ctx.total} алертов: ${ctx.critical} критических, ${ctx.high} высоких. По типам: ${ctx.byRule.map((r) => `${r.ruleCode}=${r.count}`).join(", ")}. Уточните вопрос — могу рассказать про конкретный регион, заказчика или тип аномалии.`;
}

const SYSTEM = `Ты — SHAFFOF AI, ассистент-аналитик по госзакупкам Узбекистана и коррупционным рискам.
Отвечай на русском, кратко (2-4 предложения), по делу. Используй переданные ниже статистические данные если вопрос про текущее состояние.
Если просят про конкретный тендер которого нет в контексте — попроси его ID.
Если вопрос не про закупки/коррупцию — мягко верни в тему.

Типы аномалий и их severity:
- SOLO (~70): один участник в тендере
- PRICE_SPIKE (~75): сумма в 2+ раза выше медианы по категории
- SERIAL (~80): один поставщик многократно побеждает у того же заказчика
- RUSHED (~55): короткий срок подачи (≤5 дней)
- ROUND (~60): подозрительно круглая сумма (кратна 100 млн)
- REGION (~65): монополизация в регионе`;

function ctxToText(ctx: Ctx): string {
  return [
    `Текущее состояние SHAFFOF:`,
    `- Всего алертов: ${ctx.total}`,
    `- Критических (≥80): ${ctx.critical}`,
    `- Высоких (60-79): ${ctx.high}`,
    `- За 24ч: ${ctx.last24h}`,
    `- По типам: ${ctx.byRule.map((r) => `${r.ruleCode}=${r.count}`).join(", ")}`,
    `- Топ регионов: ${ctx.topRegions.map((r) => `${r.region}(${r.count})`).join(", ")}`,
    `- Сумма под риском: ${(Number(ctx.amountAtRisk) / 1_000_000_000).toFixed(2)} млрд сум`,
  ].join("\n");
}

async function callOpenAI(messages: Msg[], system: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.includes("xxxx") || key.length < 20) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL_FAST || "gpt-4o-mini",
        messages: [{ role: "system", content: system }, ...messages.slice(-10)],
        temperature: 0.4,
        max_tokens: 400,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { messages = [] } = (await req.json()) as { messages: Msg[] };
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const ctx = await loadContext();
  const ctxText = ctx ? ctxToText(ctx) : "База данных недоступна.";
  const system = `${SYSTEM}\n\n${ctxText}`;

  const aiReply = await callOpenAI(messages, system);
  if (aiReply) {
    return NextResponse.json({ reply: aiReply, source: "openai" });
  }

  // Fallback: deterministic local answer based on stats
  const reply = localAnswer(lastUser, ctx);
  return NextResponse.json({ reply, source: "local" });
}
