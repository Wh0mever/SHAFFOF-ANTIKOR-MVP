"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, X, User2, Bot, Sparkles, FileText, Download } from "lucide-react";
import type { ClientAlert } from "@/lib/hooks";
import { RULE_LABEL, RULE_DEFAULT_DESC, severityTint, tenScale } from "@/lib/anomalies";
import { StarButton } from "../shell/StarButton";

type AITab = "fast" | "research" | "report";

export function AlertDetailModal({
  alert,
  allAlerts = [],
  onClose,
}: {
  alert: ClientAlert | null;
  allAlerts?: ClientAlert[];
  onClose: () => void;
}) {
  // All alerts for the same tender (so we can show the full anomaly list).
  const anomalies = useMemo(() => {
    if (!alert) return [];
    const sameTender = allAlerts.filter((a) => a.tender.id === alert.tender.id);
    if (sameTender.length === 0) return [alert];
    // Dedup by ruleCode keeping highest severity per rule.
    const byRule = new Map<string, ClientAlert>();
    for (const a of sameTender) {
      const cur = byRule.get(a.ruleCode);
      if (!cur || a.severity > cur.severity) byRule.set(a.ruleCode, a);
    }
    return Array.from(byRule.values()).sort((a, b) => b.severity - a.severity);
  }, [alert, allAlerts]);

  const [tab, setTab] = useState<AITab>("fast");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [research, setResearch] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState<AITab | null>(null);

  // Track whether explain is currently streaming so we can show the cursor.
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    if (!alert) return;
    setExplanation(alert.aiExplanation);
    setResearch(alert.aiResearch);
    setReport(alert.aiReport);
    setTab("fast");
    setStreaming(false);

    if (alert.aiExplanation) return;

    if (alert.id.startsWith("demo-")) {
      // For demo alerts, simulate streaming locally.
      const text =
        "AI-аналитик: данный тендер содержит признаки ограниченной конкуренции. Сумма выше типичных значений по категории. Рекомендуется проверить связь между заказчиком и поставщиком, а также историю предыдущих контрактов.";
      let i = 0;
      setExplanation("");
      setStreaming(true);
      const id = setInterval(() => {
        i += 5;
        if (i >= text.length) {
          setExplanation(text);
          setStreaming(false);
          clearInterval(id);
        } else {
          setExplanation(text.slice(0, i));
        }
      }, 20);
      return () => {
        clearInterval(id);
        setStreaming(false);
      };
    }

    // Real alert — stream from server.
    let cancelled = false;
    const ac = new AbortController();
    setExplanation("");
    setStreaming(true);

    (async () => {
      try {
        const res = await fetch(`/api/alerts/${alert.id}/explain/stream`, {
          method: "GET",
          signal: ac.signal,
        });
        if (!res.body) {
          setStreaming(false);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          if (!cancelled) setExplanation(acc);
        }
      } catch {
        // ignore — could be aborted on alert change
      } finally {
        if (!cancelled) setStreaming(false);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
      setStreaming(false);
    };
  }, [alert]);

  if (!alert) return null;

  async function loadResearch() {
    if (research || loading || !alert) return;
    if (alert.id.startsWith("demo-")) {
      setLoading("research");
      setTimeout(() => {
        setResearch(
          "Глубокий анализ (Perplexity sonar-pro): по открытым источникам выявлено, что заказчик в течение последних 12 месяцев заключил 4 аналогичных контракта с тем же поставщиком в смежных регионах. Совокупная сумма превышает 8 млрд сум. В одном из случаев фигурирует протокол ФАС о нарушении антимонопольного законодательства."
        );
        setLoading(null);
      }, 1200);
      return;
    }
    setLoading("research");
    try {
      const r = await fetch(`/api/alerts/${alert.id}/research`, { method: "POST" });
      const d = await r.json();
      setResearch(d.research ?? null);
    } finally {
      setLoading(null);
    }
  }

  async function loadReport() {
    if (report || loading || !alert) return;
    if (alert.id.startsWith("demo-")) {
      setLoading("report");
      setTimeout(() => {
        setReport(
          `# Журналистский отчёт\n\n**Что не так:** ${alert.message}\n\n**Хронология:** Тендер размещён ${new Date(alert.tender.startDate).toLocaleDateString("ru-RU")}, окончание ${new Date(alert.tender.endDate).toLocaleDateString("ru-RU")}.\n\n**Связи:** Заказчик «${alert.tender.buyerName}» ранее работал с тем же поставщиком как минимум 3 раза. Совокупная сумма прошлых контрактов — около 12 млрд сум.\n\n**Рекомендация:** запросить у заказчика обоснование выбора единственного поставщика и протокол согласования. Запросить у Антимонопольного комитета результаты проверки.`
        );
        setLoading(null);
      }, 1500);
      return;
    }
    setLoading("report");
    try {
      const r = await fetch(`/api/alerts/${alert.id}/report`, { method: "POST" });
      const d = await r.json();
      setReport(d.report ?? null);
    } finally {
      setLoading(null);
    }
  }

  const aiText =
    tab === "fast" ? explanation : tab === "research" ? research : report;
  const isLoading = loading === tab;
  // Use max severity across the tender's anomalies for header / gauge.
  const maxSeverity = Math.max(alert.severity, ...anomalies.map((a) => a.severity));
  const tier = maxSeverity >= 80 ? "КРИТИЧЕСКИЙ" : maxSeverity >= 60 ? "ВЫСОКИЙ РИСК" : "СРЕДНИЙ";
  const tierColor = maxSeverity >= 80 ? "text-rose-400 bg-rose-500/10 ring-rose-500/30" :
    maxSeverity >= 60 ? "text-orange-400 bg-orange-500/10 ring-orange-500/30" :
    "text-amber-400 bg-amber-500/10 ring-amber-500/30";

  const dasharray = (maxSeverity / 100) * 251.32;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-950 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-100">{alert.tender.displayNo}</div>
              <div className="mt-0.5 text-sm text-zinc-400">{alert.tender.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StarButton kind="TENDER" id={alert.tender.id} label={alert.tender.title} size={18} />
            <span className={`rounded-md px-3 py-1.5 text-xs font-bold ring-1 ${tierColor}`}>{tier}</span>
            <button onClick={onClose} className="rounded-md p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="px-6 py-6">
          <div className="flex items-center gap-6">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg viewBox="0 0 90 90" className="h-24 w-24 -rotate-90">
                <circle cx="45" cy="45" r="40" stroke="#27272a" strokeWidth="6" fill="none" />
                <circle
                  cx="45"
                  cy="45"
                  r="40"
                  stroke={maxSeverity >= 80 ? "#f43f5e" : maxSeverity >= 60 ? "#f97316" : "#facc15"}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${dasharray} 251.32`}
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-bold text-zinc-100">{maxSeverity}</div>
                <div className="text-[9px] text-zinc-500">/ 100</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-zinc-300">Corruption Risk Score</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {anomalies.map((a) => (
                  <span
                    key={a.id}
                    className="rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-zinc-800"
                    title={a.message}
                  >
                    {RULE_LABEL[a.ruleCode] ?? a.ruleCode}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Сумма" value={`${Math.round(Number(alert.tender.amount) / 1_000_000)} млн сум`} />
            <Field label="Участники" value={String(alert.tender.bidderCount)} />
            <Field
              label="Срок"
              value={`${Math.max(1, Math.round((+new Date(alert.tender.endDate) - +new Date(alert.tender.startDate)) / 86400000))} дней`}
            />
            <Field label="Регион" value={alert.region} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                <span className="flex items-center gap-2">
                  <User2 className="h-3.5 w-3.5" />
                  Заказчик
                </span>
                <StarButton kind="BUYER" id={alert.tender.buyerTin} label={alert.tender.buyerName} size={14} />
              </div>
              <div className="text-sm font-semibold text-zinc-100">{alert.tender.buyerName}</div>
              {alert.tender.buyerTin && (
                <div className="mt-0.5 font-mono text-[11px] text-zinc-500">ИНН: {alert.tender.buyerTin}</div>
              )}
            </div>
            {alert.tender.sellerName && (
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
                <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-2">
                    <User2 className="h-3.5 w-3.5" />
                    Победитель
                  </span>
                  <StarButton kind="SELLER" id={alert.tender.sellerName} label={alert.tender.sellerName} size={14} />
                </div>
                <div className="text-sm font-semibold text-zinc-100">{alert.tender.sellerName}</div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              Выявленные аномалии ({anomalies.length})
            </h4>
            <div className="space-y-2">
              {anomalies.map((a) => {
                const tint = severityTint(a.severity);
                const score10 = tenScale(a.severity);
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tint.bg}`}
                    >
                      <span className={`text-xs font-bold ${tint.text}`}>{score10}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white">
                        {RULE_LABEL[a.ruleCode] ?? a.ruleCode}
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-400">
                        {a.message || RULE_DEFAULT_DESC[a.ruleCode] || ""}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ring-1 ${tint.text} ${tint.bg} ${tint.ring}`}
                    >
                      {a.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
                <Bot className="h-4 w-4 text-emerald-400" /> AI-АНАЛИТИК
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-950 p-1">
                <TabBtn active={tab === "fast"} onClick={() => setTab("fast")}>
                  <Sparkles className="h-3 w-3" /> GPT-4o-mini
                </TabBtn>
                <TabBtn active={tab === "research"} onClick={() => { setTab("research"); loadResearch(); }}>
                  Perplexity
                </TabBtn>
                <TabBtn active={tab === "report"} onClick={() => { setTab("report"); loadReport(); }}>
                  Claude
                </TabBtn>
              </div>
            </div>

            <div className="min-h-[120px] whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
              {tab === "fast" ? (
                <>
                  {explanation ? (
                    <>
                      {explanation}
                      {streaming && (
                        <span className="ml-0.5 inline-block h-[1em] w-[2px] -translate-y-[2px] animate-pulse bg-emerald-400 align-middle" />
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 [animation-delay:200ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 [animation-delay:400ms]" />
                      </span>
                      GPT-4o-mini анализирует…
                    </div>
                  )}
                </>
              ) : isLoading ? (
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 [animation-delay:200ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 [animation-delay:400ms]" />
                  </span>
                  AI анализирует данные через {tab === "research" ? "Perplexity sonar-pro" : "Claude Sonnet 4.5"}…
                </div>
              ) : aiText ? (
                aiText
              ) : (
                <div className="text-zinc-600">
                  Нажмите вкладку выше, чтобы запустить анализ.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            {!alert.id.startsWith("demo-") && (
              <a
                href={`/api/alerts/${alert.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-400"
              >
                <Download className="h-4 w-4" /> PDF Dossier
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-zinc-100">{value}</div>
    </div>
  );
}

function TabBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
        active ? "bg-emerald-500/15 text-emerald-400" : "text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}
