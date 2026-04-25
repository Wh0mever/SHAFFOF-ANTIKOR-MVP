import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendTelegram } from "@/lib/telegram";
import { UZ_REGIONS } from "@/lib/regions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type TgUpdate = {
  message?: {
    chat: { id: number; username?: string };
    from?: { username?: string };
    text?: string;
  };
};

const HELP =
  "*SHAFFOF botiga xush kelibsiz!*\n\n" +
  "Buyruqlar:\n" +
  "`/subscribe` — barcha kritik alertlar (severity≥80)\n" +
  "`/subscribe region Toshkent` — faqat Toshkent shahri bo'yicha\n" +
  "`/subscribe min 60` — minimal severity (40/60/80)\n" +
  "`/list` — joriy obunalar\n" +
  "`/stop` — obunani to'xtatish";

async function reply(chatId: number, text: string) {
  await sendTelegram(String(chatId), text);
}

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (expectedSecret) {
    const got = req.headers.get("x-telegram-bot-api-secret-token");
    if (got !== expectedSecret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const update = (await req.json()) as TgUpdate;
  const msg = update.message;
  if (!msg?.text) return NextResponse.json({ ok: true });

  const chatId = msg.chat.id;
  const username = msg.chat.username ?? msg.from?.username ?? null;
  const text = msg.text.trim();
  const [cmd, ...rest] = text.split(/\s+/);
  const args = rest.join(" ");

  try {
    switch (cmd.toLowerCase()) {
      case "/start":
      case "/help":
        await reply(chatId, HELP);
        break;

      case "/subscribe": {
        const sub = await prisma.tgSubscription.upsert({
          where: { chatId: String(chatId) },
          update: { active: true, username: username ?? undefined },
          create: { chatId: String(chatId), username, active: true },
        });

        if (args.startsWith("region ")) {
          const region = args.slice(7).trim();
          const lc = region.toLowerCase();
          const known = Object.entries(UZ_REGIONS).find(
            ([key, val]) =>
              key.toLowerCase() === lc || val.nameUz.toLowerCase() === lc
          )?.[0];
          if (!known) {
            await reply(chatId, `Noma'lum hudud: ${region}`);
            break;
          }
          await prisma.tgSubscription.update({
            where: { id: sub.id },
            data: { regions: Array.from(new Set([...sub.regions, known])) },
          });
          await reply(chatId, `✅ Obuna: ${known}`);
        } else if (args.startsWith("min ")) {
          const n = Number(args.slice(4).trim());
          if (![40, 60, 80].includes(n)) {
            await reply(chatId, "Severity faqat 40, 60 yoki 80 bo'lishi mumkin");
            break;
          }
          await prisma.tgSubscription.update({
            where: { id: sub.id },
            data: { minSeverity: n },
          });
          await reply(chatId, `✅ Minimal severity: ${n}`);
        } else {
          await reply(
            chatId,
            "✅ Obuna faollashtirildi. Hududni qo'shish uchun: `/subscribe region Toshkent`"
          );
        }
        break;
      }

      case "/list": {
        const sub = await prisma.tgSubscription.findUnique({
          where: { chatId: String(chatId) },
        });
        if (!sub || !sub.active) {
          await reply(chatId, "Obunangiz yo'q. `/subscribe` orqali boshlang.");
          break;
        }
        const regions = sub.regions.length ? sub.regions.join(", ") : "barcha";
        await reply(
          chatId,
          `*Obunangiz:*\nHududlar: ${regions}\nMin. severity: ${sub.minSeverity}`
        );
        break;
      }

      case "/stop": {
        await prisma.tgSubscription.updateMany({
          where: { chatId: String(chatId) },
          data: { active: false },
        });
        await reply(chatId, "Obuna to'xtatildi.");
        break;
      }

      default:
        await reply(chatId, HELP);
    }
  } catch (err) {
    console.error("telegram webhook error", err);
  }

  return NextResponse.json({ ok: true });
}
