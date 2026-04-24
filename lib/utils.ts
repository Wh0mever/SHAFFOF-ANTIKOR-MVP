import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatUzs(amount: bigint | number): string {
  const n = typeof amount === "bigint" ? Number(amount) : amount;
  return new Intl.NumberFormat("uz-UZ").format(n);
}

export function severityTier(severity: number): "critical" | "high" | "medium" | "low" {
  if (severity >= 80) return "critical";
  if (severity >= 60) return "high";
  if (severity >= 40) return "medium";
  return "low";
}

export function severityColor(severity: number): string {
  if (severity >= 80) return "#ef4444";
  if (severity >= 60) return "#f97316";
  if (severity >= 40) return "#eab308";
  return "#22c55e";
}

export function bigintJsonReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

export function timeAgoUz(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const s = Math.round(diffMs / 1000);
  if (s < 60) return `${s} soniya oldin`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} daqiqa oldin`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.round(h / 24);
  return `${d} kun oldin`;
}
