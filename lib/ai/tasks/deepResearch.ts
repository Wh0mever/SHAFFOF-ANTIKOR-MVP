import { perplexity } from "../providers/perplexity";
import { DEEP_RESEARCH_SYSTEM, MODELS } from "../prompts";
import type { Tender } from "@prisma/client";

export async function deepResearch(tender: Tender): Promise<string> {
  const user = `Tender: ${tender.title}
Buyurtmachi: ${tender.buyerName} (TIN: ${tender.buyerTin})
Sotuvchi: ${tender.sellerName ?? "N/A"} (TIN: ${tender.sellerTin ?? "N/A"})
Summa: ${tender.amount.toLocaleString()} so'm
Kategoriya: ${tender.category ?? "N/A"}`;

  return perplexity.chat(MODELS.research, DEEP_RESEARCH_SYSTEM, user);
}
