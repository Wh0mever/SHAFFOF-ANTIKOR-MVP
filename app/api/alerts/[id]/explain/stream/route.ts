import { type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { localFastExplain } from "@/lib/ai/localFallback";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `Ты — SHAFFOF AI, эксперт по госзакупкам Узбекистана и коррупционным рискам.
Объясни на русском (3-4 предложения) почему этот тендер подозрительный.
Используй конкретные цифры из контекста. Будь чётким и обвинительным где это уместно.`;

function hasRealKey(): boolean {
  const k = process.env.OPENAI_API_KEY;
  return Boolean(k && !k.includes("xxxx") && k.length >= 20);
}

async function* fakeStream(text: string, chunkSize = 4, delayMs = 18) {
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize);
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

async function* openaiStream(userPrompt: string): AsyncGenerator<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL_FAST || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 350,
      stream: true,
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok || !res.body) throw new Error(`openai ${res.status}`);
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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const alert = await prisma.alert.findUnique({
    where: { id: params.id },
    include: { tender: true },
  });
  if (!alert) return new Response("alert not found", { status: 404 });

  // If we already have it, replay it as a stream (instant cached response).
  if (alert.aiExplanation) {
    const text = alert.aiExplanation;
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of fakeStream(text, 6, 8)) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const t = alert.tender;
  const userPrompt = `Тендер: ${t.title}
ID: ${t.displayNo}
Сумма: ${(Number(t.amount) / 1_000_000).toFixed(0)} млн ${t.currency}
Заказчик: ${t.buyerName} (ИНН ${t.buyerTin})
Победитель: ${t.sellerName ?? "не указан"}
Регион: ${t.region}
Категория: ${t.category ?? "—"}
Участников: ${t.bidderCount}
Срок (дней): ${Math.max(1, Math.round((+t.endDate - +t.startDate) / 86400000))}
Сработавшая аномалия: ${alert.ruleCode} (severity ${alert.severity})
Описание: ${alert.message}`;

  const useOpenAI = hasRealKey();
  const encoder = new TextEncoder();
  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (useOpenAI) {
          for await (const chunk of openaiStream(userPrompt)) {
            fullText += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        } else {
          const text = localFastExplain(alert, alert.tender);
          fullText = text;
          for await (const chunk of fakeStream(text)) {
            controller.enqueue(encoder.encode(chunk));
          }
        }
      } catch (err) {
        console.warn("explain/stream openai failed, fallback", err);
        const text = localFastExplain(alert, alert.tender);
        fullText = text;
        for await (const chunk of fakeStream(text)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } finally {
        controller.close();
        // Persist final text for caching (fire-and-forget).
        if (fullText.trim().length > 0) {
          prisma.alert
            .update({ where: { id: alert.id }, data: { aiExplanation: fullText } })
            .catch((e) => console.warn("explain stream persist failed", e));
        }
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
