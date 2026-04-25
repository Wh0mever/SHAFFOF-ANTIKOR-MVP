"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_ALERTS, DEMO_STATS } from "./demo";

function getMode(): "LIVE" | "DEMO" {
  if (typeof window === "undefined") return "LIVE";
  return (localStorage.getItem("shaffof.mode") as "LIVE" | "DEMO") || "LIVE";
}

function useModeListener() {
  const [m, setM] = useState<"LIVE" | "DEMO">("LIVE");
  useEffect(() => {
    setM(getMode());
    const h = (e: Event) => setM((e as CustomEvent).detail as "LIVE" | "DEMO");
    window.addEventListener("shaffof:mode", h);
    return () => window.removeEventListener("shaffof:mode", h);
  }, []);
  return m;
}

export type ClientAlert = {
  id: string;
  region: string;
  severity: number;
  ruleCode: string;
  message: string;
  aiExplanation: string | null;
  aiResearch: string | null;
  aiReport: string | null;
  createdAt: string;
  tender: {
    id: string;
    displayNo: string;
    title: string;
    amount: string;
    currency: string;
    buyerName: string;
    buyerTin: string;
    sellerName: string | null;
    region: string;
    category: string | null;
    startDate: string;
    endDate: string;
    bidderCount: number;
  };
};

export function useLiveAlerts(intervalMs = 10_000) {
  const mode = useModeListener();
  const [alerts, setAlerts] = useState<ClientAlert[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  async function pull() {
    if (mode === "DEMO") {
      setAlerts(DEMO_ALERTS);
      setLastSync(new Date());
      return;
    }
    try {
      const res = await fetch("/api/alerts?limit=200", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { alerts: ClientAlert[] };
      setAlerts(data.alerts);
      setLastSync(new Date());
    } catch (err) {
      console.warn("poll alerts failed", err);
    }
  }

  useEffect(() => {
    pull();
    if (mode === "DEMO") return;
    const t = setInterval(pull, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, mode]);

  return { alerts, lastSync, mode, refresh: pull };
}

export type StatsPayload = {
  totalAlerts: number;
  alerts24h: number;
  totalTenders: number;
  amountAtRisk: string;
  byRegion: Array<{ region: string; _count: { _all: number } }>;
  byRule: Array<{ ruleCode: string; _count: { _all: number } }>;
};

export function useStats(intervalMs = 30_000) {
  const mode = useModeListener();
  const [stats, setStats] = useState<StatsPayload | null>(null);

  async function pull() {
    if (mode === "DEMO") {
      setStats(DEMO_STATS);
      return;
    }
    try {
      const res = await fetch("/api/v1/stats", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as StatsPayload;
      setStats(data);
    } catch (err) {
      console.warn("poll stats failed", err);
    }
  }

  useEffect(() => {
    pull();
    if (mode === "DEMO") return;
    const t = setInterval(pull, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, mode]);

  return { stats, mode, refresh: pull };
}
