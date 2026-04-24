import { openai } from "../providers/openai";
import { gemini } from "../providers/gemini";
import { withFallback } from "../index";
import { FAST_EXPLAIN_SYSTEM, MODELS } from "../prompts";
import type { Alert, Tender } from "@prisma/client";

export async function fastExplain(alert: Alert, tender: Tender): Promise<string> {
  const user = `Tender: ${tender.title}
Summa: ${tender.amount.toLocaleString()} ${tender.currency}
Buyurtmachi: ${tender.buyerName}
Viloyat: ${tender.region}
Ishtirokchilar: ${tender.bidderCount}
Qoida: ${alert.ruleCode} (severity ${alert.severity})
Xabar: ${alert.message}`;

  return withFallback(
    () => openai.chat(MODELS.fast, FAST_EXPLAIN_SYSTEM, user),
    () => gemini.chat(MODELS.fallback, FAST_EXPLAIN_SYSTEM, user)
  );
}
