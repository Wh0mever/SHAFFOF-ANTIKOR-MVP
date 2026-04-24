import type { Tender } from "@prisma/client";
import type { RuleResult } from "@/types/shaffof";

export function rushed(t: Tender): RuleResult | null {
  const days = (t.endDate.getTime() - t.startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (days < 3) return { ruleCode: "RUSHED", severity: 75, message: `Muddat ${days.toFixed(1)} kun` };
  if (days < 7) return { ruleCode: "RUSHED", severity: 45, message: `Qisqa muddat: ${days.toFixed(0)} kun` };
  return null;
}
