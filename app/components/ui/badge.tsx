import * as React from "react";
import { cn, severityTier } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-medium text-zinc-300 uppercase tracking-wide",
        className
      )}
      {...props}
    />
  );
}

const tierStyles = {
  critical: "bg-red-500/15 text-red-400 border-red-500/40",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/40",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/40",
  low: "bg-green-500/15 text-green-400 border-green-500/40",
} as const;

export function SeverityBadge({ severity }: { severity: number }) {
  const tier = severityTier(severity);
  return <Badge className={tierStyles[tier]}>{severity}</Badge>;
}

const RULE_LABELS: Record<string, string> = {
  SOLO: "YAGONA",
  PRICE_SPIKE: "NARX OSHGAN",
  SERIAL: "SERIAL",
  RUSHED: "SHOSHILINCH",
  ROUND: "YUMALOQ",
  REGION: "REGION",
};

export function RuleBadge({ code }: { code: string }) {
  return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/40">{RULE_LABELS[code] ?? code}</Badge>;
}
