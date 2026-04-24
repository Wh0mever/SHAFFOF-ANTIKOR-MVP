import type { UzexTender } from "@/types/shaffof";
import { prisma } from "@/lib/db";

const ENDPOINT = `${process.env.UZEX_API_URL ?? "https://apietender.uzex.uz"}/api/common/TradeList`;

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

export async function fetchTenders(page = 1, pageSize = 50): Promise<UzexTender[]> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.UZEX_BEARER_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.UZEX_BEARER_TOKEN}`;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({
      page,
      pageSize,
      sortField: "start_date",
      sortOrder: "desc",
      filter: {},
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`uzex fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { items?: UzexTender[]; data?: UzexTender[] };
  return data.items ?? data.data ?? [];
}

export function normalize(raw: UzexTender): NormalizedTender {
  return {
    id: String(raw.id),
    displayNo: raw.display_no,
    title: raw.name,
    amount: BigInt(Math.round(raw.cost ?? 0)),
    currency: raw.currency_codeabc ?? "UZS",
    buyerName: "Noma'lum buyurtmachi",
    buyerTin: "000000000",
    sellerName: raw.seller_name,
    sellerTin: raw.seller_tin,
    region: raw.region_name,
    district: raw.district_name ?? null,
    category: raw.category_name ?? null,
    startDate: new Date(raw.start_date),
    endDate: new Date(raw.end_date),
    bidderCount: 0,
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
