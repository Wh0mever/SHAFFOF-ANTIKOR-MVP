import type { Tender } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { RuleResult } from "@/types/shaffof";

export async function regionMismatch(t: Tender): Promise<RuleResult | null> {
  if (!t.sellerTin || !t.region) return null;
  const seller = await prisma.buyerStats.findUnique({ where: { tin: t.sellerTin } });
  if (seller?.region && seller.region !== t.region && Number(t.amount) < 100_000_000) {
    return { ruleCode: "REGION", severity: 50, message: "Mahalliy shartnoma, sotuvchi boshqa viloyatdan" };
  }
  return null;
}
