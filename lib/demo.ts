// Канонические демо-данные для режима DEMO. Не зависит от БД.

import type { ClientAlert, StatsPayload } from "./hooks";

const REGIONS = [
  "Toshkent shahri",
  "Toshkent viloyati",
  "Samarqand viloyati",
  "Buxoro viloyati",
  "Andijon viloyati",
  "Farg'ona viloyati",
  "Namangan viloyati",
  "Qashqadaryo viloyati",
  "Surxondaryo viloyati",
  "Jizzax viloyati",
  "Sirdaryo viloyati",
  "Navoiy viloyati",
  "Xorazm viloyati",
  "Qoraqalpog'iston Respublikasi",
];

const RULES = ["SOLO", "PRICE_SPIKE", "SERIAL", "RUSHED", "ROUND", "REGION"] as const;

const TITLES = [
  "Axborot texnologiyalari infratuzilmasi",
  "Yo'l ta'mirlash ishlari",
  "Davlat muassasasi uchun oziq-ovqat mahsulotlari",
  "Ofis mebellari xaridi",
  "Tibbiy uskunalar yetkazib berish",
  "Maktab kompyuterlari",
  "Avtotransport xizmatlari",
  "Qurilish materiallari",
  "Elektr energiyasi ta'minoti",
  "Oqish xonasi jihozlari",
  "Bolalar bog'chasi ta'mirlash",
  "Suv ta'minoti tizimi",
  "Yong'inga qarshi xavfsizlik",
  "Kommunal xizmatlar",
];

const BUYERS = [
  ["Toshkent shahar hokimligi", "201234567"],
  ["Sog'liqni saqlash vazirligi", "203456789"],
  ["Xalq ta'limi vazirligi", "204567890"],
  ["Mudofaa vazirligi", "205678901"],
  ["UZBEKENERGO AJ", "207890123"],
  ["Qashqadaryo viloyati hokimligi", "208901234"],
  ["TASHKENT WATER", "210123456"],
  ["QASHQADARYA WATER", "373192022"],
];

const SELLERS = [
  ["IT-INFRATUZILMA MCHJ", "311223344"],
  ["BUNYODKOR LLC", "302345678"],
  ["UZBEKINVEST OOO", "305566778"],
  ["NAVOIY-TECH MCHJ", "307788990"],
  ["ZAMIN-PRO MCHJ", "309900112"],
  null,
];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const RULE_MESSAGES: Record<string, string> = {
  SOLO: "Тендер с единственным участником — высокий риск отсутствия конкуренции",
  PRICE_SPIKE: "Сумма тендера на 322% выше медианы по категории",
  SERIAL: "Один поставщик победил в 5 тендерах подряд за месяц",
  RUSHED: "Крайне короткий срок подачи заявок — 2 дней",
  ROUND: "Подозрительно круглая сумма тендера (кратна 100 млн)",
  REGION: "Концентрация контрактов у одного поставщика в регионе — 71%",
};

export function buildDemoAlerts(count = 50): ClientAlert[] {
  const r = rng(42);
  const now = Date.now();
  const out: ClientAlert[] = [];
  for (let i = 0; i < count; i++) {
    const ruleCode = RULES[Math.floor(r() * RULES.length)];
    const region = REGIONS[Math.floor(r() * REGIONS.length)];
    const title = TITLES[Math.floor(r() * TITLES.length)];
    const buyer = BUYERS[Math.floor(r() * BUYERS.length)];
    const seller = SELLERS[Math.floor(r() * SELLERS.length)];
    const baseSeverity =
      ruleCode === "SOLO" ? 70 : ruleCode === "PRICE_SPIKE" ? 75 : ruleCode === "ROUND" ? 60 : ruleCode === "RUSHED" ? 55 : ruleCode === "SERIAL" ? 80 : 65;
    const severity = Math.min(99, Math.max(35, Math.round(baseSeverity + (r() - 0.5) * 30)));
    const amount = BigInt(Math.round((100 + r() * 35000) * 1_000_000));
    const tenderId = `TND-2024-${String(38 + i).padStart(5, "0")}`;
    const createdAt = new Date(now - r() * 30 * 24 * 3600 * 1000).toISOString();
    const startDate = new Date(now - r() * 7 * 24 * 3600 * 1000).toISOString();
    const endDate = new Date(now + r() * 14 * 24 * 3600 * 1000).toISOString();

    out.push({
      id: `demo-${i}`,
      region,
      severity,
      ruleCode,
      message: RULE_MESSAGES[ruleCode],
      aiExplanation:
        ruleCode === "SOLO"
          ? "Тендер с единственным участником — типичный признак ограниченной конкуренции. Рекомендуется проверить условия квалификации и связь с заказчиком."
          : ruleCode === "PRICE_SPIKE"
          ? "Сумма значительно превышает рыночные показатели. Требует сверки с категориальной медианой и историей цен поставщика."
          : "Аномалия выявлена автоматически по эвристикам. Требуется журналистская проверка.",
      aiResearch: null,
      aiReport: null,
      createdAt,
      tender: {
        id: tenderId,
        displayNo: tenderId,
        title,
        amount: amount.toString(),
        currency: "UZS",
        buyerName: buyer[0],
        buyerTin: buyer[1],
        sellerName: seller?.[0] ?? null,
        region,
        category: ["IT", "Construction", "Healthcare", "Education", "Logistics"][Math.floor(r() * 5)],
        startDate,
        endDate,
        bidderCount: ruleCode === "SOLO" ? 1 : Math.ceil(r() * 5) + 1,
      },
    });
  }
  out.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  return out;
}

export function buildDemoStats(alerts: ClientAlert[]): StatsPayload {
  const day = 24 * 3600 * 1000;
  const cutoff = Date.now() - day;
  const tenderIds = new Set(alerts.map((a) => a.tender.id));
  const total = BigInt(alerts.reduce((s, a) => s + Number(a.tender.amount), 0));

  const byRegionMap = new Map<string, number>();
  for (const a of alerts) byRegionMap.set(a.region, (byRegionMap.get(a.region) ?? 0) + 1);
  const byRuleMap = new Map<string, number>();
  for (const a of alerts) byRuleMap.set(a.ruleCode, (byRuleMap.get(a.ruleCode) ?? 0) + 1);

  return {
    totalAlerts: alerts.length,
    alerts24h: alerts.filter((a) => +new Date(a.createdAt) >= cutoff).length,
    totalTenders: tenderIds.size,
    amountAtRisk: total.toString(),
    byRegion: Array.from(byRegionMap.entries()).map(([region, n]) => ({ region, _count: { _all: n } })),
    byRule: Array.from(byRuleMap.entries()).map(([ruleCode, n]) => ({ ruleCode, _count: { _all: n } })),
  };
}

const _alerts = buildDemoAlerts();
export const DEMO_ALERTS = _alerts;
export const DEMO_STATS = buildDemoStats(_alerts);
