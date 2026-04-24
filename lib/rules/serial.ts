import type { Tender } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { RuleResult } from "@/types/shaffof";

export async function serial(t: Tender): Promise<RuleResult | null> {
  if (!t.sellerTin || !t.buyerTin) return null;
  const wins = await prisma.tender.count({
    where: {
      sellerTin: t.sellerTin,
      buyerTin: t.buyerTin,
      startDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });
  if (wins >= 5) return { ruleCode: "SERIAL", severity: 90, message: `${wins} ta g'alaba 30 kunda` };
  if (wins >= 3) return { ruleCode: "SERIAL", severity: 70, message: `${wins} ta g'alaba 30 kunda` };
  return null;
}
