"use client";

import { useEffect, useState } from "react";
import { X, User2, Bot, Sparkles, FileText, Download } from "lucide-react";
import type { ClientAlert } from "@/lib/hooks";
import { formatUzs } from "@/lib/utils";

const RULE_LABEL: Record<string, string> = {
  SOLO: "Единственный участник",
  PRICE_SPIKE: "Скачок цены",
  SERIAL: "Серийный победитель",
  RUSHED: "Срочная закупка",
  ROUND: "Круглая сумма",
  REGION: "Региональная концентрация",
};

type AITab = "fast" | "research" | "report";

export function AlertDetailModal({
  alert,
  onClose,
}: {
  alert: ClientAlert | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<AITab>("fast");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [research, setResearch] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState<AITab | null>(null);

  useEffect(() => {
    if (!alert) return;
    setExplanation(alert.aiExplanation);
    setResearch(alert.aiResearch);
    setReport(alert.aiReport);
    setTab("fast");
    if (!alert.aiExplanation && !alert.id.startsWith("demo-")) {
      setLoading("fast");
      fetch(`/api/alerts/${alert.id}/explain`, { method: "POST" })
        .then((r) => r.json())
        .then((d) => setExplanation(d.explanation ?? null))
        .finally(() => setLoading(null));
    } else if (alert.id.startsWith("demo-") && !alert.aiExplanation) {
      setExplanation(
        "AI-аналитик: данный тендер содержит признаки ограниченной конкуренции. Сумма выше типичных значений по категории. Рекомендуется проверить связь между заказчиком и поставщиком, а также историю предыдущих контрактов."
      );
    }
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
  const tier = alert.severity >= 80 ? "КРИТИЧЕСКИЙ" : alert.severity >= 60 ? "ВЫСОКИЙ РИСК" : "СРЕДНИЙ";
  const tierColor = alert.severity >= 80 ? "text-rose-400 bg-rose-500/10 ring-rose-500/30" :
    alert.severity >= 60 ? "text-orange-400 bg-orange-500/10 ring-orange-500/30" :
    "text-amber-400 bg-amber-500/10 ring-amber-500/30";

  const dasharray = (alert.severity / 100) * 251.32;

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
                  stroke={alert.severity >= 80 ? "#f43f5e" : alert.severity >= 60 ? "#f97316" : "#facc15"}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${dasharray} 251.32`}
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-bold text-zinc-100">{alert.severity}</div>
                <div className="text-[9px] text-zinc-500">/ 100</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-zinc-300">Corruption Risk Score</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-zinc-800">
                  {alert.message}
                </span>
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

          {alert.tender.sellerName && (
            <div className="mt-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
              <div className="mb-1 flex items-center gap-2 text-[11px] text-zinc-500">
                <User2 className="h-3.5 w-3.5" />
                Победитель
              </div>
              <div className="text-base font-semibold text-zinc-100">{alert.tender.sellerName}</div>
              {alert.tender.buyerTin && (
                <div className="mt-0.5 text-[11px] text-zinc-500">ИНН: {alert.tender.buyerTin}</div>
              )}
            </div>
          )}

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

            <div className="min-h-[120px] whitespace-pre-wrap text-sm text-zinc-300">
              {isLoading ? (
                <div className="flex items-center gap-2 text-zinc-500">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 [animation-delay:200ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 [animation-delay:400ms]" />
                  </span>
                  Анализируем…
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
