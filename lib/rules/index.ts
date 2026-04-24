import type { Tender } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { RuleResult } from "@/types/shaffof";
import { solo } from "./solo";
import { priceSpike } from "./priceSpike";
import { serial } from "./serial";
import { rushed } from "./rushed";
import { round } from "./round";
import { regionMismatch } from "./region";

export type EvaluationContext = {
  medians: Map<string, bigint>;
};

export async function evaluate(t: Tender, ctx: EvaluationContext): Promise<RuleResult[]> {
  const median = t.category ? ctx.medians.get(t.category) : undefined;
  const results = await Promise.all([
    Promise.resolve(solo(t)),
    Promise.resolve(priceSpike(t, median)),
    serial(t),
    Promise.resolve(rushed(t)),
    Promise.resolve(round(t)),
    regionMismatch(t),
  ]);
  return results.filter((r): r is RuleResult => r !== null);
}

export async function loadMedians(): Promise<EvaluationContext> {
  const rows = await prisma.categoryMedian.findMany();
  const medians = new Map<string, bigint>();
  for (const row of rows) medians.set(row.category, row.medianAmount);
  return { medians };
}

export async function persistAlerts(tender: Tender, results: RuleResult[]) {
  if (results.length === 0) return [];
  const created = await Promise.all(
    results.map((r) =>
      prisma.alert.create({
        data: {
          tenderId: tender.id,
          ruleCode: r.ruleCode,
          severity: r.severity,
          message: r.message,
          region: tender.region,
        },
      })
    )
  );
  return created;
}
