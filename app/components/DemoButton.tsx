"use client";

import { useState } from "react";
import { Button } from "./ui/button";

const REGIONS = [
  "Toshkent shahri",
  "Samarqand viloyati",
  "Buxoro viloyati",
  "Andijon viloyati",
  "Farg'ona viloyati",
  "Namangan viloyati",
  "Qashqadaryo viloyati",
  "Xorazm viloyati",
  "Qoraqalpog'iston Respublikasi",
];

const RULES: Array<"SOLO" | "PRICE_SPIKE" | "SERIAL" | "RUSHED" | "ROUND" | "REGION"> = [
  "SOLO",
  "PRICE_SPIKE",
  "SERIAL",
  "RUSHED",
  "ROUND",
  "REGION",
];

export function DemoButton({ onCreated }: { onCreated?: () => void }) {
  const [loading, setLoading] = useState(false);

  async function simulate() {
    setLoading(true);
    try {
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)]!;
      const ruleCode = RULES[Math.floor(Math.random() * RULES.length)]!;
      const severity = 60 + Math.floor(Math.random() * 40);
      const amount = 50_000_000 + Math.floor(Math.random() * 500_000_000);
      const res = await fetch("/api/demo/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, ruleCode, severity, amount }),
      });
      if (!res.ok) throw new Error(`demo failed ${res.status}`);
      onCreated?.();
    } catch (err) {
      console.error(err);
      alert("Demo alert yarata olmadim — konsolni tekshiring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={simulate}
      disabled={loading}
      className="fixed bottom-14 right-6 z-30 shadow-lg shadow-emerald-500/20"
    >
      {loading ? "Yuborilmoqda…" : "Simulate tender"}
    </Button>
  );
}
