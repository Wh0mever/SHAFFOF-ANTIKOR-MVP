import type { UzexTender } from "@/types/shaffof";
import { prisma } from "@/lib/db";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

type Endpoint = {
  name: string;
  url: string;
  body: (page: number, size: number) => unknown;
  extract: (j: any) => any[];
};

const ENDPOINTS: Endpoint[] = [
  {
    name: "apietender/TradeList",
    url: `${process.env.UZEX_API_URL ?? "https://apietender.uzex.uz"}/api/common/TradeList`,
    body: (page, size) => ({
      page,
      pageSize: size,
      sortField: "start_date",
      sortOrder: "desc",
      filter: {},
    }),
    extract: (j) => j?.items ?? j?.data ?? j?.Data ?? [],
  },
  {
    name: "auctionx/Lot/GetList",
    url: "https://xarid-api-auctionx.uzex.uz/api/Lot/GetList",
    body: (page, size) => ({ page, limit: size }),
    extract: (j) => j?.Data ?? j?.data ?? j?.items ?? [],
  },
  {
    name: "prequest/Public/GetLots",
    url: "https://xarid-api-prequest.uzex.uz/api/Public/GetLots",
    body: (page, size) => ({ page, limit: size }),
    extract: (j) => j?.Data ?? j?.data ?? [],
  },
];

export type NormalizedTender = {
  id: string;
  displayNo: string;
  title: string;
  amount: bigint;
  currency: string;
  buyerName: string;
  buyerTin: string;
  sellerName: string | null;
  sellerTin: string | null;
  region: string;
  district: string | null;
  category: string | null;
  startDate: Date;
  endDate: Date;
  bidderCount: number;
};

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": UA,
    Origin: "https://xarid.uzex.uz",
    Referer: "https://xarid.uzex.uz/",
  };
  if (process.env.UZEX_BEARER_TOKEN) {
    h["Authorization"] = `Bearer ${process.env.UZEX_BEARER_TOKEN}`;
  }
  return h;
}

export async function fetchTenders(page = 1, pageSize = 50): Promise<UzexTender[]> {
  let lastError: unknown = null;
  for (const ep of ENDPOINTS) {
    try {
      const res = await fetch(ep.url, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(ep.body(page, pageSize)),
        cache: "no-store",
      });
      if (!res.ok) {
        lastError = new Error(`${ep.name} ${res.status}`);
        continue;
      }
      const text = await res.text();
      if (!text.trim()) continue;
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        continue;
      }
      const items = ep.extract(parsed);
      if (Array.isArray(items) && items.length > 0) {
        return items as UzexTender[];
      }
    } catch (err) {
      lastError = err;
    }
  }
  if (lastError) console.warn("uzex: all endpoints empty/failed:", lastError);
  return [];
}

export function normalize(raw: UzexTender): NormalizedTender {
  const r = raw as Record<string, any>;
  return {
    id: String(r.id ?? r.lotId ?? r.Id ?? crypto.randomUUID()),
    displayNo: r.display_no ?? r.displayNo ?? r.lotNumber ?? "—",
    title: r.name ?? r.title ?? r.lotName ?? "Tender",
    amount: BigInt(Math.round(Number(r.cost ?? r.amount ?? r.startPrice ?? 0))),
    currency: r.currency_codeabc ?? r.currency ?? "UZS",
    buyerName: r.buyerName ?? r.customer_name ?? "Noma'lum buyurtmachi",
    buyerTin: String(r.buyerTin ?? r.customer_tin ?? "000000000"),
    sellerName: r.seller_name ?? r.sellerName ?? null,
    sellerTin: r.seller_tin ?? r.sellerTin ?? null,
    region: r.region_name ?? r.region ?? r.regionName ?? "Toshkent shahri",
    district: r.district_name ?? r.district ?? null,
    category: r.category_name ?? r.category ?? null,
    startDate: new Date(r.start_date ?? r.startDate ?? Date.now()),
    endDate: new Date(r.end_date ?? r.endDate ?? Date.now() + 86400000),
    bidderCount: Number(r.bidderCount ?? r.bidsCount ?? 0),
  };
}

export async function upsertTenders(items: NormalizedTender[]) {
  const created: string[] = [];
  for (const t of items) {
    const exists = await prisma.tender.findUnique({ where: { id: t.id } });
    if (exists) continue;
    await prisma.tender.create({ data: t });
    created.push(t.id);
  }
  return created;
}
