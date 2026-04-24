import { NextResponse, type NextRequest } from "next/server";
import { fetchTenders, normalize, upsertTenders } from "@/lib/uzex";
import { prisma } from "@/lib/db";
import { loadMedians, evaluate, persistAlerts } from "@/lib/rules";
import { ai } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorize(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev mode: open
  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    req.nextUrl.searchParams.get("secret");
  return provided === secret;
}

export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  let fetched = 0;
  let inserted = 0;
  let alertsCreated = 0;

  try {
    const raw = await fetchTenders(1, 50);
    fetched = raw.length;
    const newIds = await upsertTenders(raw.map(normalize));
    inserted = newIds.length;

    if (inserted > 0) {
      const ctx = await loadMedians();
      const newTenders = await prisma.tender.findMany({ where: { id: { in: newIds } } });

      for (const tender of newTenders) {
        const results = await evaluate(tender, ctx);
        const created = await persistAlerts(tender, results);
        alertsCreated += created.length;

        for (const alert of created) {
          ai.explain(alert, tender)
            .then((text) =>
              prisma.alert.update({ where: { id: alert.id }, data: { aiExplanation: text } })
            )
            .catch((err) => console.warn("fastExplain failed for", alert.id, err));
        }
      }
    }

    return NextResponse.json({
      ok: true,
      durationMs: Date.now() - startedAt.getTime(),
      fetched,
      inserted,
      alertsCreated,
    });
  } catch (err) {
    console.error("poll failed", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        fetched,
        inserted,
        alertsCreated,
      },
      { status: 500 }
    );
  }
}
