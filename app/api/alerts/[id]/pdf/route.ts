import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatUzs } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function md(text: string): string {
  return esc(text)
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const alert = await prisma.alert.findUnique({
    where: { id: params.id },
    include: { tender: true },
  });
  if (!alert) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const t = alert.tender;
  const generated = new Date().toLocaleString("uz-UZ");
  const report = alert.aiReport ?? alert.aiResearch ?? alert.aiExplanation ?? "Hisobot hali tayyor emas.";

  const html = `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="utf-8"/>
<title>SHAFFOF Dossier · ${esc(alert.ruleCode)} · ${esc(t.displayNo)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #111; line-height: 1.55; max-width: 720px; margin: 0 auto; padding: 24px; }
  header { border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px; }
  .brand { color: #10b981; font-weight: 700; letter-spacing: 0.05em; font-size: 12px; text-transform: uppercase; }
  h1 { font-size: 22px; margin: 6px 0 0; }
  .meta { color: #555; font-size: 12px; margin-top: 4px; }
  .pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .sev80 { background: #fee2e2; color: #b91c1c; }
  .sev60 { background: #fed7aa; color: #c2410c; }
  .sev40 { background: #fef3c7; color: #92400e; }
  table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 13px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
  th { color: #555; font-weight: 500; width: 32%; }
  h2 { font-size: 15px; margin-top: 20px; color: #047857; border-left: 3px solid #10b981; padding-left: 10px; }
  .report { font-size: 13px; }
  .report p { margin: 8px 0; }
  footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e5e7eb; color: #777; font-size: 10px; text-align: center; }
  .actions { margin: 20px 0; text-align: center; }
  button { padding: 10px 24px; background: #10b981; color: #fff; border: 0; border-radius: 6px; cursor: pointer; font-size: 14px; }
  @media print { .actions { display: none; } }
</style>
</head>
<body>
<header>
  <div class="brand">SHAFFOF · Antikor xizmati</div>
  <h1>${esc(t.title)}</h1>
  <div class="meta">
    Lot ${esc(t.displayNo)} · ${esc(t.region)} · ${formatUzs(t.amount)} ${esc(t.currency)}
  </div>
</header>

<div class="actions">
  <button onclick="window.print()">📄 PDF sifatida saqlash</button>
</div>

<table>
  <tr><th>Qoida</th><td><span class="pill sev${alert.severity >= 80 ? 80 : alert.severity >= 60 ? 60 : 40}">${esc(alert.ruleCode)} · severity ${alert.severity}</span></td></tr>
  <tr><th>Buyurtmachi</th><td>${esc(t.buyerName)} (TIN: ${esc(t.buyerTin)})</td></tr>
  <tr><th>Tashqi tomon</th><td>${esc(t.sellerName ?? "—")} ${t.sellerTin ? `(TIN: ${esc(t.sellerTin)})` : ""}</td></tr>
  <tr><th>Hudud</th><td>${esc(t.region)}${t.district ? `, ${esc(t.district)}` : ""}</td></tr>
  <tr><th>Kategoriya</th><td>${esc(t.category ?? "—")}</td></tr>
  <tr><th>Boshlanish</th><td>${t.startDate.toLocaleString("uz-UZ")}</td></tr>
  <tr><th>Yakunlanish</th><td>${t.endDate.toLocaleString("uz-UZ")}</td></tr>
  <tr><th>Ishtirokchilar</th><td>${t.bidderCount}</td></tr>
</table>

<h2>Anomaliya tavsifi</h2>
<p>${esc(alert.message)}</p>

${alert.aiExplanation ? `<h2>Tezkor tahlil</h2><div class="report"><p>${md(alert.aiExplanation)}</p></div>` : ""}

${alert.aiResearch ? `<h2>Chuqur tadqiqot</h2><div class="report"><p>${md(alert.aiResearch)}</p></div>` : ""}

<h2>Jurnalistik hisobot</h2>
<div class="report"><p>${md(report)}</p></div>

<footer>
  Yaratildi: ${generated} · SHAFFOF MVP · Manba: xarid.uzex.uz
</footer>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="shaffof-${alert.ruleCode}-${t.displayNo}.html"`,
    },
  });
}
