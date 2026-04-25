"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge, RuleBadge, SeverityBadge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { formatUzs, timeAgoUz } from "@/lib/utils";
import type { ClientAlert } from "@/lib/hooks";

export function AlertCard({ alert }: { alert: ClientAlert }) {
  const [explanation, setExplanation] = useState<string | null>(alert.aiExplanation);
  const [research, setResearch] = useState<string | null>(alert.aiResearch);
  const [report, setReport] = useState<string | null>(alert.aiReport);
  const [loading, setLoading] = useState<"research" | "report" | null>(null);

  const amount = BigInt(alert.tender.amount);

  async function loadResearch() {
    if (research || loading) return;
    setLoading("research");
    try {
      const r = await fetch(`/api/alerts/${alert.id}/research`, { method: "POST" });
      const data = await r.json();
      setResearch(data.research ?? null);
    } finally {
      setLoading(null);
    }
  }

  async function loadReport() {
    if (report || loading) return;
    setLoading("report");
    try {
      const r = await fetch(`/api/alerts/${alert.id}/report`, { method: "POST" });
      const data = await r.json();
      setReport(data.report ?? null);
      if (!research && data.research) setResearch(data.research);
    } finally {
      setLoading(null);
    }
  }

  async function loadExplanation() {
    if (explanation) return;
    try {
      const r = await fetch(`/api/alerts/${alert.id}/explain`, { method: "POST" });
      const data = await r.json();
      setExplanation(data.explanation ?? null);
    } catch (err) {
      console.warn(err);
    }
  }

  if (!explanation) void loadExplanation();

  return (
    <Card className="animate-fadeInUp">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <RuleBadge code={alert.ruleCode} />
            <SeverityBadge severity={alert.severity} />
            <Badge>{alert.region}</Badge>
            <span className="text-[10px] text-zinc-500">{timeAgoUz(new Date(alert.createdAt))}</span>
          </div>
          <CardTitle className="mt-2 text-base">{alert.tender.title}</CardTitle>
          <p className="text-xs text-zinc-400 mt-0.5">
            <Link href={`/organ/${alert.tender.buyerTin}`} className="hover:text-emerald-400">
              {alert.tender.buyerName}
            </Link>
            {alert.tender.sellerName ? ` → ${alert.tender.sellerName}` : ""}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-semibold text-emerald-400">{formatUzs(amount)}</div>
          <div className="text-[10px] uppercase text-zinc-500">{alert.tender.currency}</div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-zinc-300 italic">{alert.message}</p>

        <div className="mt-3 rounded-md border border-zinc-800/80 bg-black/40 p-3">
          <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">
            Tezkor tahlil (AI)
          </div>
          {explanation ? (
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{explanation}</p>
          ) : (
            <Skeleton className="h-4 w-full" />
          )}
        </div>

        {research && (
          <div className="mt-3 rounded-md border border-zinc-800/80 bg-black/40 p-3">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">
              Chuqur tahlil (Perplexity)
            </div>
            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{research}</p>
          </div>
        )}

        {report && (
          <div className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3">
            <div className="text-[10px] uppercase tracking-wide text-emerald-500 mb-1">
              Jurnalistik hisobot (Claude)
            </div>
            <p className="text-sm text-zinc-100 whitespace-pre-wrap">{report}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={loadResearch}
          disabled={!!research || loading === "research"}
        >
          {loading === "research" ? "Izlanmoqda…" : "Chuqur tahlil"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={loadReport}
          disabled={!!report || loading === "report"}
        >
          {loading === "report" ? "Yaratilmoqda…" : "Jurnalistik hisobot"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`/api/alerts/${alert.id}/pdf`, "_blank")}
        >
          PDF
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigator.clipboard.writeText(`${location.origin}/feed#${alert.id}`)}
        >
          Link
        </Button>
      </CardFooter>
    </Card>
  );
}
