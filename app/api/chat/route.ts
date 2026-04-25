import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Msg = { role: "user" | "assistant" | "system"; content: string };

async function buildContext(): Promise<string> {
  try {
    const [total, last24h, byRule, topRegions] = await Promise.all([
      prisma.alert.count(),
      prisma.alert.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
      prisma.alert.groupBy({ by: ["ruleCode"], _count: { _all: true } }),
      prisma.alert.groupBy({
        by: ["region"],
        _count: { _all: true },
        orderBy: { _count: { region: "desc" } },
        take: 5,
      }),
    ]);

    return [
      `Текущая статистика SHAFFOF:`,
      `- Всего алертов: ${total}`,
      `- За 24ч: ${last24h}`,
      `- По типам: ${byRule.map((r) => `${r.ruleCode}=${r._count._all}`).join(", ")}`,
      `- Топ регионов: ${topRegions.map((r) => `${r.region}(${r._count._all})`).join(", ")}`,
    ].join("\n");
  } catch {
    return "Статистика недоступна (БД не подключена).";
  }
}

const SYSTEM = `Ты — SHAFFOF AI, ассистент по госзакупкам Узбекистана и анализу коррупционных рисков.
Отвечай кратко (2-4 предложения), на русском, по делу. Используй переданную статистику если она релевантна вопросу.
Если просят про конкретный тендер которого нет в контексте — попроси уточнить ID.
Если вопрос не про тендеры — мягко верни в тему.

Типы аномалий:
- SOLO: единственный участник тендера
- PRICE_SPIKE: цена выше медианы по категории
- SERIAL: один поставщик многократно побеждает
- RUSHED: короткий срок подачи заявок
- ROUND: подозрительно круглая сумма
- REGION: концентрация контрактов в регионе`;

export async function POST(req: NextRequest) {
  const { messages = [] } = (await req.json()) as { messages: Msg[] };

  const context = await buildContext();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      reply:
        "Чат недоступен: не настроен ключ OpenAI. Добавьте OPENAI_API_KEY в переменные окружения.",
    });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL_FAST || "gpt-4o-mini",
        messages: [
          { role: "system", content: `${SYSTEM}\n\n${context}` },
          ...messages.slice(-10),
        ],
        temperature: 0.4,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.warn("openai chat error", res.status, t);
      return NextResponse.json({ reply: "Сервис AI временно недоступен." });
    }

    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    const reply = data.choices?.[0]?.message?.content?.trim() ?? "Нет ответа.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("chat fail", err);
    return NextResponse.json({ reply: "Ошибка соединения с AI." });
  }
}
