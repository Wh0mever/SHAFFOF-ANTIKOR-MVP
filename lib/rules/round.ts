import type { Tender } from "@prisma/client";
import type { RuleResult } from "@/types/shaffof";

export function round(t: Tender): RuleResult | null {
  const amt = Number(t.amount);
  if (amt < 10_000_000) return null;
  const str = amt.toString();
  const zeros = str.length - str.replace(/0+$/, "").length;
  if (zeros >= 7) return { ruleCode: "ROUND", severity: 55, message: `${zeros} ta nol — tayinlangan summa` };
  if (zeros >= 6) return { ruleCode: "ROUND", severity: 35, message: `Yumaloq summa: ${amt.toLocaleString()}` };
  return null;
}
