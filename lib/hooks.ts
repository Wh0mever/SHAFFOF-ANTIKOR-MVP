"use client";

import { useEffect, useState } from "react";
import { DEMO_ALERTS, DEMO_STATS } from "./demo";

function getMode(): "LIVE" | "DEMO" {
  if (typeof window === "undefined") return "LIVE";
  return (localStorage.getItem("shaffof.mode") as "LIVE" | "DEMO") || "LIVE";
}

function useModeListener() {
  // Initialize from localStorage SYNCHRONOUSLY so we never start with stale "LIVE".
  const [m, setM] = useState<"LIVE" | "DEMO">(() => getMode());
  useEffect(() => {
    setM(getMode()); // re-sync in case it changed across remounts
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

  useEffect(() => {
    let cancelled = false;

    async function pull() {
      if (mode === "DEMO") {
        if (!cancelled) {
          setAlerts(DEMO_ALERTS);
          setLastSync(new Date());
        }
        return;
      }
      try {
        const res = await fetch("/api/alerts?limit=200", { cache: "no-store" });
        if (cancelled || !res.ok) return;
        const data = (await res.json()) as { alerts: ClientAlert[] };
        if (cancelled) return;
        setAlerts(data.alerts);
        setLastSync(new Date());
      } catch (err) {
        if (!cancelled) console.warn("poll alerts failed", err);
      }
    }

    pull();
    if (mode === "DEMO") return () => { cancelled = true; };
    const t = setInterval(pull, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [intervalMs, mode]);

  return { alerts, lastSync, mode };
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

  useEffect(() => {
    let cancelled = false;

    async function pull() {
      if (mode === "DEMO") {
        if (!cancelled) setStats(DEMO_STATS);
        return;
      }
      try {
        const res = await fetch("/api/v1/stats", { cache: "no-store" });
        if (cancelled || !res.ok) return;
        const data = (await res.json()) as StatsPayload;
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) console.warn("poll stats failed", err);
      }
    }

    pull();
    if (mode === "DEMO") return () => { cancelled = true; };
    const t = setInterval(pull, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [intervalMs, mode]);

  return { stats, mode };
}
