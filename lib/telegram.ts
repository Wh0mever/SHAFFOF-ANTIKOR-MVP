import type { Alert, Tender } from "@prisma/client";
import { formatUzs } from "./utils";
import { prisma } from "./db";

const TELEGRAM_API = "https://api.telegram.org";

function botToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null;
}

function channelChatId(): string | null {
  return process.env.TELEGRAM_CHANNEL_ID || null;
}

export async function sendTelegram(chatId: string, text: string, parseMode: "Markdown" | "HTML" = "Markdown") {
  const token = botToken();
  if (!token) return null;

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    console.warn("telegram send failed", res.status, await res.text());
    return null;
  }
  return res.json();
}

const RULE_EMOJI: Record<string, string> = {
  SOLO: "👤",
  PRICE_SPIKE: "💸",
  SERIAL: "🔁",
  RUSHED: "⏱",
  ROUND: "💰",
  REGION: "🗺",
};

export function formatAlertMessage(alert: Alert, tender: Tender, siteUrl?: string): string {
  const emoji = RULE_EMOJI[alert.ruleCode] ?? "⚠️";
  const link = siteUrl ? `\n\n🔗 ${siteUrl}/feed#${alert.id}` : "";
  return (
    `${emoji} *SHAFFOF · ${alert.ruleCode}* (severity ${alert.severity})\n\n` +
    `*${tender.title}*\n` +
    `💼 ${tender.buyerName}\n` +
    `🗺 ${tender.region}\n` +
    `💵 ${formatUzs(tender.amount)} ${tender.currency}\n\n` +
    `_${alert.message}_` +
    link
  );
}

export async function notifyCriticalAlert(alert: Alert, tender: Tender) {
  const text = formatAlertMessage(alert, tender, process.env.NEXT_PUBLIC_SITE_URL);

  const channel = channelChatId();
  if (channel && alert.severity >= 80) {
    await sendTelegram(channel, text).catch((err) =>
      console.warn("notifyCriticalAlert channel", err)
    );
  }

  if (!botToken()) return;

  const subs = await prisma.tgSubscription
    .findMany({ where: { active: true } })
    .catch(() => []);

  await Promise.all(
    subs
      .filter((s) => alert.severity >= s.minSeverity)
      .filter((s) => s.regions.length === 0 || s.regions.includes(tender.region))
      .filter(
        (s) =>
          s.categories.length === 0 ||
          (tender.category != null && s.categories.includes(tender.category))
      )
      .map((s) =>
        sendTelegram(s.chatId, text).catch((err) =>
          console.warn("notifyCriticalAlert sub", s.chatId, err)
        )
      )
  );
}
