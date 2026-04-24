import type { Tender } from "@prisma/client";
import type { RuleResult } from "@/types/shaffof";

export function priceSpike(t: Tender, median?: bigint): RuleResult | null {
  if (!median || median === 0n) return null;
  const ratio = Number(t.amount) / Number(median);
  if (ratio >= 3.0) return { ruleCode: "PRICE_SPIKE", severity: 95, message: `Narx medianidan ${(ratio * 100).toFixed(0)}% yuqori` };
  if (ratio >= 2.0) return { ruleCode: "PRICE_SPIKE", severity: 80, message: `Narx ${(ratio * 100).toFixed(0)}% yuqori` };
  if (ratio >= 1.5) return { ruleCode: "PRICE_SPIKE", severity: 60, message: `Narx ${(ratio * 100).toFixed(0)}% yuqori` };
  return null;
}
