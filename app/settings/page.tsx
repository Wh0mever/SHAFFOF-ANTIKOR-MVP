"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Bell, Bot, KeyRound, Save } from "lucide-react";
import { Shell } from "../components/shell/Shell";

type Tab = "general" | "notifications" | "ai" | "api";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("general");

  return (
    <Shell title="Настройки" subtitle="Конфигурация системы SHAFFOF AI">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
        <nav className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-2">
          <SidebarItem icon={SettingsIcon} label="Общие" active={tab === "general"} onClick={() => setTab("general")} />
          <SidebarItem icon={Bell} label="Уведомления" active={tab === "notifications"} onClick={() => setTab("notifications")} />
          <SidebarItem icon={Bot} label="AI Модели" active={tab === "ai"} onClick={() => setTab("ai")} />
          <SidebarItem icon={KeyRound} label="API" active={tab === "api"} onClick={() => setTab("api")} />
        </nav>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6">
          {tab === "general" && <GeneralSettings />}
          {tab === "notifications" && <NotificationSettings />}
          {tab === "ai" && <AIModelsSettings />}
          {tab === "api" && <ApiSettings />}
        </div>
      </div>
    </Shell>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </button>
  );
}

function GeneralSettings() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [interval, setInterval] = useState(5);
  const [threshold, setThreshold] = useState(50);
  const [lang, setLang] = useState("uz");

  return (
    <>
      <h2 className="mb-5 text-lg font-semibold text-zinc-100">Общие настройки</h2>

      <Section
        title="Автообновление данных"
        sub="Автоматически обновлять данные каждые N минут"
        right={
          <Toggle checked={autoRefresh} onChange={setAutoRefresh} />
        }
      />

      <Section
        title="Интервал обновления (минут)"
        sub="Как часто система проверяет новые тендеры"
        body={
          <>
            <input
              type="range"
              min={1}
              max={60}
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="mt-1 text-xs text-zinc-500">{interval} мин.</div>
          </>
        }
      />

      <Section
        title="Порог риска для алертов"
        sub="Минимальный score для создания алерта"
        body={
          <>
            <input
              type="range"
              min={0}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="mt-1 text-xs text-zinc-500">{threshold}/100</div>
          </>
        }
      />

      <Section
        title="Язык интерфейса"
        body={
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500/40"
          >
            <option value="uz">O'zbekcha</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        }
      />

      <div className="mt-6 flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400">
          <Save className="h-4 w-4" /> Сохранить
        </button>
      </div>
    </>
  );
}

function NotificationSettings() {
  const tgConnected = true;
  return (
    <>
      <h2 className="mb-5 text-lg font-semibold text-zinc-100">Уведомления</h2>
      <Section
        title="Telegram алерты"
        sub="Отправлять уведомления в Telegram канал"
        right={
          <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${tgConnected ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-zinc-800 text-zinc-400"}`}>
            {tgConnected ? "Подключено" : "Не подключено"}
          </span>
        }
      />
      <Section
        title="Telegram Bot Token"
        body={
          <input
            readOnly
            value="••••••••••••••••••••••••••"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-300 outline-none"
          />
        }
        sub="Бот: @shaffof_ai_bot"
      />
      <Section
        title="Канал / Группа"
        body={
          <input
            readOnly
            value={process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_ID || "-1003704635757"}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-300 outline-none"
          />
        }
      />
      <Section
        title="Формат сообщения"
        body={
          <textarea
            readOnly
            rows={9}
            value={`🚨 SHAFFOF AI Alert\n\n📋 Тендер: {id}\n⚠️ Риск: {level} ({score}/100)\n🔍 Аномалии: {anomalies}\n💰 Сумма: {amount}\n📍 Регион: {region}\n\n🔗 Подробнее: https://shaffof.ai/tender/{id}`}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-xs text-zinc-300 outline-none"
          />
        }
      />
    </>
  );
}

function AIModelsSettings() {
  const models = [
    { level: "Level 1 — Быстрое объяснение", model: "gpt-4o-mini", provider: "OpenAI", key: "sk-proj-••••••••", mode: "Авто", color: "emerald" },
    { level: "Level 2 — Глубокий анализ", model: "sonar-pro", provider: "Perplexity", key: "pplx-••••••••", mode: "По запросу", color: "indigo" },
    { level: "Level 3 — Полный отчёт", model: "claude-sonnet-4-5", provider: "Anthropic Claude", key: "sk-ant-api03-••••••••", mode: "По запросу", color: "amber" },
  ];

  return (
    <>
      <h2 className="mb-1 text-lg font-semibold text-zinc-100">AI Модели</h2>
      <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 ring-1 ring-emerald-500/30">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        AI-анализ включён
      </div>
      <p className="mb-5 text-sm text-zinc-400">
        Мультимодельная система: OpenAI + Perplexity + Claude
      </p>

      <div className="space-y-3">
        {models.map((m) => (
          <div key={m.level} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {m.level}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-base text-zinc-100">{m.model}</span>
                  <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">{m.provider}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-zinc-500">{m.key}</div>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                m.mode === "Авто" ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-400"
              }`}>
                {m.mode}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ApiSettings() {
  const url = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <>
      <h2 className="mb-5 text-lg font-semibold text-zinc-100">Public API</h2>

      <Section
        title="Base URL"
        body={
          <code className="block rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-emerald-400">
            {url}/api/v1
          </code>
        }
      />

      <div className="mt-3 space-y-2 text-sm">
        {[
          ["GET", "/v1/alerts", "Список алертов с фильтрами"],
          ["GET", "/v1/alerts/:id", "Детали алерта + AI анализы"],
          ["GET", "/v1/organ/:tin", "Карточка организации по ИНН"],
          ["GET", "/v1/stats", "Сводная статистика"],
        ].map(([m, p, d]) => (
          <div key={p} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">{m}</span>
            <code className="font-mono text-xs text-zinc-300">{p}</code>
            <span className="ml-auto text-xs text-zinc-500">{d}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Section({
  title,
  sub,
  body,
  right,
}: {
  title: string;
  sub?: string;
  body?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-200">{title}</div>
          {sub && <div className="mt-0.5 text-xs text-zinc-500">{sub}</div>}
        </div>
        {right}
      </div>
      {body && <div className="mt-3">{body}</div>}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-emerald-500" : "bg-zinc-800"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}
