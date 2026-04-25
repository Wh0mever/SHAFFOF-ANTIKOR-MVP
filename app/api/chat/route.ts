import { type NextRequest } from "next/server";
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
    const list = ctx.topRegions.map((r) => `${r.region} — ${r.count}`).join(", ");
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

  if (q.includes("сумм") || q.includes("млрд") || q.includes("млн")) {
    const ms = Number(ctx.amountAtRisk) / 1_000_000_000;
    return `Общая сумма «под риском» по всем алертам: ${ms.toFixed(2)} млрд сум.`;
  }

  if (q.includes("здравств") || q.includes("привет") || q.includes("hello") || q.includes("салом")) {
    return `Здравствуйте! В системе сейчас ${ctx.total} алертов (${ctx.critical} критических). Спросите, например: "Какие регионы в красной зоне?" или "Что такое SOLO?"`;
  }

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

function hasRealKey(): boolean {
  const k = process.env.OPENAI_API_KEY;
  return Boolean(k && !k.includes("xxxx") && k.length >= 20);
}

/** Stream a fixed text in small chunks, mimicking real LLM streaming. */
async function* fakeStream(text: string, chunkSize = 4, delayMs = 18) {
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

/** Stream OpenAI chat-completion deltas as plain-text chunks. */
async function* openaiStream(messages: Msg[], system: string): AsyncGenerator<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL_FAST || "gpt-4o-mini",
      messages: [{ role: "system", content: system }, ...messages.slice(-10)],
      temperature: 0.4,
      max_tokens: 500,
      stream: true,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok || !res.body) {
    throw new Error(`openai ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const parsed = JSON.parse(payload);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta.length > 0) yield delta;
      } catch {}
    }
  }
}

export async function POST(req: NextRequest) {
  const { messages = [] } = (await req.json()) as { messages: Msg[] };
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const ctx = await loadContext();
  const ctxText = ctx ? ctxToText(ctx) : "База данных недоступна.";
  const system = `${SYSTEM}\n\n${ctxText}`;
  const useOpenAI = hasRealKey();

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (useOpenAI) {
          for await (const chunk of openaiStream(messages, system)) {
            controller.enqueue(encoder.encode(chunk));
          }
        } else {
          const text = localAnswer(lastUser, ctx);
          for await (const chunk of fakeStream(text)) {
            controller.enqueue(encoder.encode(chunk));
          }
        }
      } catch (err) {
        // Fallback to local on any error mid-stream.
        const text = localAnswer(lastUser, ctx);
        for await (const chunk of fakeStream(text)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
