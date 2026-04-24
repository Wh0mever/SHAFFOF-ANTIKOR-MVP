import type { Tender } from "@prisma/client";
import type { RuleResult } from "@/types/shaffof";

export function solo(t: Tender): RuleResult | null {
  if (t.bidderCount === 1) return { ruleCode: "SOLO", severity: 85, message: "Yagona ishtirokchi: monopoliya ehtimoli" };
  return null;
}
