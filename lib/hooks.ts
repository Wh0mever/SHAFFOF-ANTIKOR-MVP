"use client";

import { useEffect, useRef, useState } from "react";

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
  const [alerts, setAlerts] = useState<ClientAlert[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const seen = useRef(new Set<string>());

  async function pull() {
    try {
      const res = await fetch("/api/alerts?limit=200", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { alerts: ClientAlert[] };
      seen.current = new Set(data.alerts.map((a) => a.id));
      setAlerts(data.alerts);
      setLastSync(new Date());
    } catch (err) {
      console.warn("poll alerts failed", err);
    }
  }

  useEffect(() => {
    pull();
    const t = setInterval(pull, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return { alerts, lastSync, refresh: pull };
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
  const [stats, setStats] = useState<StatsPayload | null>(null);

  async function pull() {
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
    const t = setInterval(pull, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  return { stats, refresh: pull };
}
