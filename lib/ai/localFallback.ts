import type { Alert, Tender } from "@prisma/client";

const RULE_INTRO: Record<string, (alert: Alert, tender: Tender) => string> = {
  SOLO: (a, t) =>
    `Тендер «${t.title}» проходит с единственным участником — это типичный признак ограниченной конкуренции. ` +
    `Заказчик (${t.buyerName}) и поставщик могли согласовать условия заранее. ` +
    `Сумма ${(Number(t.amount) / 1_000_000).toFixed(0)} млн сум попадает в зону риска.`,

  PRICE_SPIKE: (a, t) =>
    `Сумма тендера «${t.title}» (${(Number(t.amount) / 1_000_000).toFixed(0)} млн сум) значительно превышает медиану по категории «${t.category ?? "—"}». ` +
    `Это может означать завышение цены или фиктивное обоснование сметы. Требуется проверка обоснования.`,

  SERIAL: (a, t) =>
    `Поставщик ${t.sellerName ?? "(неизвестен)"} ранее уже многократно побеждал в тендерах заказчика «${t.buyerName}». ` +
    `Серийные победы — частый индикатор устойчивых неформальных связей и согласованных торгов.`,

  RUSHED: (a, t) =>
    `Тендер «${t.title}» имеет крайне короткий срок подачи заявок. Это лишает потенциальных конкурентов возможности подготовить полноценное предложение, что обычно указывает на заранее выбранного поставщика.`,

  ROUND: (a, t) =>
    `Сумма тендера ${(Number(t.amount) / 1_000_000).toFixed(0)} млн сум подозрительно круглая (кратна 100 млн). ` +
    `Реальные сметы редко выходят на такие ровные значения — это может быть признаком фиктивного обоснования.`,

  REGION: (a, t) =>
    `В регионе ${t.region} один поставщик берёт значимую долю контрактов от ${t.buyerName}. ` +
    `Высокая концентрация без рыночной конкуренции — маркер монополизации и риска коррупции.`,
};

export function localFastExplain(alert: Alert, tender: Tender): string {
  const intro = RULE_INTRO[alert.ruleCode]?.(alert, tender);
  const rec =
    `\n\nИтоговый риск-скор: ${alert.severity}/100 (${alert.severity >= 80 ? "критический" : alert.severity >= 60 ? "высокий" : "средний"}). ` +
    `Рекомендуется детальная проверка: запросить обоснование выбора поставщика, проверить связи между участниками, сверить цены с рынком.`;
  return (intro ?? `Аномалия ${alert.ruleCode}: ${alert.message}`) + rec;
}

export function localDeepResearch(alert: Alert, tender: Tender): string {
  return [
    `Глубокий анализ (локальный fallback — внешние AI-сервисы недоступны):`,
    ``,
    `Тендер: ${tender.displayNo} — ${tender.title}`,
    `Заказчик: ${tender.buyerName} (ИНН ${tender.buyerTin})`,
    `Поставщик: ${tender.sellerName ?? "не указан"}`,
    `Регион: ${tender.region}, категория: ${tender.category ?? "—"}`,
    `Сумма: ${(Number(tender.amount) / 1_000_000).toFixed(2)} млн ${tender.currency}`,
    `Период: ${tender.startDate.toLocaleDateString("ru-RU")} — ${tender.endDate.toLocaleDateString("ru-RU")} (${Math.max(1, Math.round((+tender.endDate - +tender.startDate) / 86400000))} дней)`,
    `Участников: ${tender.bidderCount}`,
    ``,
    `Сработавшая аномалия: ${alert.ruleCode} (severity ${alert.severity})`,
    `${alert.message}`,
    ``,
    `Что следует проверить вручную:`,
    `• История контрактов между этими организациями за последние 24 месяца`,
    `• Связи учредителей и руководителей через ИНН`,
    `• Сравнение цены с аналогичными тендерами в других регионах`,
    `• Запрос в Антимонопольный комитет при наличии нескольких триггеров`,
  ].join("\n");
}

export function localReport(alert: Alert, tender: Tender): string {
  const days = Math.max(
    1,
    Math.round((+tender.endDate - +tender.startDate) / 86400000)
  );
  return [
    `# Журналистский отчёт`,
    ``,
    `## Сводка`,
    `Тендер ${tender.displayNo} стоимостью ${(Number(tender.amount) / 1_000_000).toFixed(0)} млн сум, размещённый ${tender.buyerName} в регионе ${tender.region}, выявил аномалию **${alert.ruleCode}** с риск-скором ${alert.severity}/100.`,
    ``,
    `## Факты`,
    `- Название: ${tender.title}`,
    `- Категория: ${tender.category ?? "—"}`,
    `- Заказчик: ${tender.buyerName} (ИНН ${tender.buyerTin})`,
    `- Победитель: ${tender.sellerName ?? "не указан"}`,
    `- Срок подачи: ${days} дней`,
    `- Участников: ${tender.bidderCount}`,
    ``,
    `## Причины риска`,
    `${alert.message}`,
    ``,
    `## Рекомендации`,
    `1. Запросить у заказчика обоснование выбора поставщика и протокол согласования.`,
    `2. Сверить цены контракта с рыночными аналогами и медианами по категории.`,
    `3. Проверить наличие связей учредителей через ЕГРПО и Stat.uz.`,
    `4. При множественных триггерах — обращение в Антимонопольный комитет и Прокуратуру.`,
    ``,
    `_Отчёт сформирован локально (внешние LLM недоступны). Для полноценной журналистской проверки требуется ручная работа источниками._`,
  ].join("\n");
}
