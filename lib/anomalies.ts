// Centralized rule metadata: Russian labels, descriptions, severity 0-100 → 1-10 conversion.

export const RULE_LABEL: Record<string, string> = {
  SOLO: "Единственный участник",
  PRICE_SPIKE: "Завышенная цена",
  SERIAL: "Серийный победитель",
  RUSHED: "Срочная закупка",
  ROUND: "Круглая сумма",
  REGION: "Региональная концентрация",
};

export const RULE_DEFAULT_DESC: Record<string, string> = {
  SOLO: "Тендер с единственным участником — высокий риск отсутствия конкуренции",
  PRICE_SPIKE: "Сумма тендера значительно выше медианы по категории",
  SERIAL: "Один поставщик многократно побеждает у этого заказчика",
  RUSHED: "Крайне короткий срок подачи заявок",
  ROUND: "Подозрительно круглая сумма (кратна 100 млн)",
  REGION: "Концентрация контрактов у одного поставщика в регионе",
};

/** Convert 0-100 severity to compact 1-10 badge value. */
export function tenScale(severity: number): number {
  return Math.max(1, Math.min(10, Math.round(severity / 10)));
}

export function severityTint(severity: number): {
  bg: string;
  text: string;
  ring: string;
  bar: string;
} {
  if (severity >= 80)
    return {
      bg: "bg-rose-500/15",
      text: "text-rose-400",
      ring: "ring-rose-500/30",
      bar: "#f43f5e",
    };
  if (severity >= 60)
    return {
      bg: "bg-orange-500/15",
      text: "text-orange-400",
      ring: "ring-orange-500/30",
      bar: "#f97316",
    };
  if (severity >= 40)
    return {
      bg: "bg-amber-500/15",
      text: "text-amber-400",
      ring: "ring-amber-500/30",
      bar: "#facc15",
    };
  return {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    ring: "ring-emerald-500/30",
    bar: "#10b981",
  };
}
