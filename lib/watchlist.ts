"use client";

import { useEffect, useState } from "react";

export type WatchKind = "BUYER" | "SELLER" | "REGION" | "TENDER";

export type WatchItem = {
  id: string; // unique key inside its kind
  kind: WatchKind;
  label: string; // human-readable
  addedAt: number;
};

const KEY = "shaffof.watchlist";
const EVT = "shaffof:watchlist";

function read(): WatchItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function write(items: WatchItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVT, { detail: items }));
}

export function watchKey(kind: WatchKind, id: string): string {
  return `${kind}:${id}`;
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchItem[]>(() => read());

  useEffect(() => {
    setItems(read());
    const h = (e: Event) => setItems((e as CustomEvent).detail as WatchItem[]);
    window.addEventListener(EVT, h);
    return () => window.removeEventListener(EVT, h);
  }, []);

  const has = (kind: WatchKind, id: string) =>
    items.some((i) => i.kind === kind && i.id === id);

  const toggle = (kind: WatchKind, id: string, label: string) => {
    const exists = items.some((i) => i.kind === kind && i.id === id);
    const next = exists
      ? items.filter((i) => !(i.kind === kind && i.id === id))
      : [...items, { kind, id, label, addedAt: Date.now() }];
    write(next);
    setItems(next);
  };

  const remove = (kind: WatchKind, id: string) => {
    const next = items.filter((i) => !(i.kind === kind && i.id === id));
    write(next);
    setItems(next);
  };

  return { items, has, toggle, remove };
}

/**
 * Returns true if any watchlist item matches this alert (buyer TIN, seller name,
 * region key, or tender ID).
 */
export function alertMatchesWatch(
  watchlist: WatchItem[],
  alert: { tender: { id: string; buyerTin: string; sellerName: string | null; region: string } }
): boolean {
  for (const w of watchlist) {
    if (w.kind === "TENDER" && w.id === alert.tender.id) return true;
    if (w.kind === "BUYER" && w.id === alert.tender.buyerTin) return true;
    if (w.kind === "SELLER" && w.id === (alert.tender.sellerName ?? "")) return true;
    if (w.kind === "REGION" && w.id === alert.tender.region) return true;
  }
  return false;
}
