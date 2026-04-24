import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

const CATEGORIES = [
  "Qurilish materiallari",
  "Avtotransport",
  "Kompyuter texnikasi",
  "Tibbiy asbob-uskunalar",
  "Oziq-ovqat",
  "Yoqilg'i",
];

const BUYERS = [
  { tin: "200100001", name: "Toshkent shahar hokimligi", region: "Toshkent shahri" },
  { tin: "200100002", name: "Samarqand viloyat hokimligi", region: "Samarqand viloyati" },
  { tin: "200100003", name: "Buxoro tumanlar birlashmasi", region: "Buxoro viloyati" },
  { tin: "200100004", name: "Andijon tibbiyot muassasasi", region: "Andijon viloyati" },
  { tin: "200100005", name: "Farg'ona ta'lim bo'limi", region: "Farg'ona viloyati" },
];

const SELLERS = [
  { tin: "300200001", name: '"Qurilish Plus" MCHJ', region: "Toshkent shahri" },
  { tin: "300200002", name: '"AutoImport" MCHJ', region: "Toshkent shahri" },
  { tin: "300200003", name: '"Tech Solutions" MCHJ', region: "Samarqand viloyati" },
  { tin: "300200004", name: '"Med Supply" MCHJ', region: "Toshkent shahri" },
  { tin: "300200005", name: '"FoodCorp" MCHJ', region: "Buxoro viloyati" },
  { tin: "300200006", name: '"Oil Trade" MCHJ', region: "Toshkent shahri" },
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000);
}

function daysFrom(base: Date, d: number): Date {
  return new Date(base.getTime() + d * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("seed: wiping existing data…");
  await prisma.alert.deleteMany();
  await prisma.tender.deleteMany();
  await prisma.buyerStats.deleteMany();
  await prisma.categoryMedian.deleteMany();

  console.log("seed: buyer stats…");
  for (const b of [...BUYERS, ...SELLERS]) {
    await prisma.buyerStats.create({
      data: {
        tin: b.tin,
        name: b.name,
        region: b.region,
        totalContracts: Math.floor(Math.random() * 100),
        totalAmount: BigInt(Math.floor(Math.random() * 10_000_000_000)),
      },
    });
  }

  console.log("seed: category medians…");
  const medians: Record<string, bigint> = {
    "Qurilish materiallari": 50_000_000n,
    "Avtotransport": 200_000_000n,
    "Kompyuter texnikasi": 30_000_000n,
    "Tibbiy asbob-uskunalar": 80_000_000n,
    "Oziq-ovqat": 40_000_000n,
    "Yoqilg'i": 150_000_000n,
  };
  for (const [category, medianAmount] of Object.entries(medians)) {
    await prisma.categoryMedian.create({
      data: { category, medianAmount, sampleSize: 200 },
    });
  }

  console.log("seed: 30 fake tenders covering all 6 rules…");

  const tenders: Array<Parameters<typeof prisma.tender.create>[0]["data"]> = [];
  let idx = 1;
  const next = () => `SEED-${String(idx++).padStart(4, "0")}`;

  const pick = (overrides: Partial<Parameters<typeof prisma.tender.create>[0]["data"]> = {}) => {
    const buyer = randomChoice(BUYERS);
    const seller = randomChoice(SELLERS);
    const category = randomChoice(CATEGORIES);
    const start = daysAgo(Math.floor(Math.random() * 30));
    return {
      id: next(),
      displayNo: `LOT-${Math.floor(Math.random() * 900000) + 100000}`,
      title: `${category} xaridi`,
      amount: BigInt(Math.floor(Math.random() * 200_000_000) + 20_000_000),
      currency: "UZS",
      buyerName: buyer.name,
      buyerTin: buyer.tin,
      sellerName: seller.name,
      sellerTin: seller.tin,
      region: buyer.region,
      district: null,
      category,
      startDate: start,
      endDate: daysFrom(start, 10 + Math.floor(Math.random() * 20)),
      bidderCount: 2 + Math.floor(Math.random() * 4),
      ...overrides,
    };
  };

  // 1-5: SOLO — single bidder
  for (let i = 0; i < 5; i++) tenders.push(pick({ bidderCount: 1 }));

  // 6-10: PRICE_SPIKE — 2x-3x median in Qurilish (median 50M)
  for (let i = 0; i < 5; i++)
    tenders.push(
      pick({
        category: "Qurilish materiallari",
        amount: BigInt(Math.floor(100_000_000 + Math.random() * 100_000_000)),
      })
    );

  // 11-15: SERIAL — same buyer+seller pairing repeated 5x in last 30 days
  const serialBuyer = BUYERS[0]!;
  const serialSeller = SELLERS[0]!;
  for (let i = 0; i < 5; i++)
    tenders.push(
      pick({
        buyerName: serialBuyer.name,
        buyerTin: serialBuyer.tin,
        sellerName: serialSeller.name,
        sellerTin: serialSeller.tin,
        region: serialBuyer.region,
        startDate: daysAgo(i * 5 + 1),
        endDate: daysAgo(i * 5 + 1 - 10),
      })
    );

  // 16-20: RUSHED — <3 day window
  for (let i = 0; i < 5; i++) {
    const start = daysAgo(Math.floor(Math.random() * 5));
    tenders.push(
      pick({
        startDate: start,
        endDate: new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000),
      })
    );
  }

  // 21-25: ROUND — 7 trailing zeros, amount > 10M
  for (let i = 0; i < 5; i++)
    tenders.push(pick({ amount: BigInt((1 + i) * 50_000_000) }));

  // 26-30: REGION — seller in Toshkent, buyer in a different viloyat, amount < 100M
  const outsideBuyer = BUYERS[1]!; // Samarqand
  const tashSeller = SELLERS[0]!; // Toshkent shahri
  for (let i = 0; i < 5; i++)
    tenders.push(
      pick({
        buyerName: outsideBuyer.name,
        buyerTin: outsideBuyer.tin,
        sellerName: tashSeller.name,
        sellerTin: tashSeller.tin,
        region: outsideBuyer.region,
        amount: BigInt(20_000_000 + i * 10_000_000),
      })
    );

  for (const t of tenders) await prisma.tender.create({ data: t });

  console.log(`seed: inserted ${tenders.length} tenders`);
  console.log("seed: done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
