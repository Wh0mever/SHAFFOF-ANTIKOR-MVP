import { anthropic } from "../providers/anthropic";
import { GENERATE_REPORT_SYSTEM, MODELS } from "../prompts";
import { bigintJsonReplacer } from "@/lib/utils";
import type { Alert, Tender } from "@prisma/client";

export async function generateReport(
  alert: Alert,
  tender: Tender,
  research: string
): Promise<string> {
  const user = `TENDER:
${JSON.stringify(tender, bigintJsonReplacer, 2)}

RULE: ${alert.ruleCode} — ${alert.message} (severity ${alert.severity})

RESEARCH:
${research}`;

  return anthropic.chat(MODELS.report, GENERATE_REPORT_SYSTEM, user);
}
