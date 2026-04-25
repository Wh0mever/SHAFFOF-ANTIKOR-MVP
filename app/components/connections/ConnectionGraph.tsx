"use client";

import { useMemo, useState } from "react";
import type { ClientAlert } from "@/lib/hooks";

type Edge = {
  buyer: string;
  seller: string;
  weight: number;
  maxSeverity: number;
};

const W = 820;
const H = 520;
const PAD = 40;
const NODE_W = 220;

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function edgeColor(severity: number): string {
  if (severity >= 80) return "#f43f5e";
  if (severity >= 60) return "#f97316";
  if (severity >= 40) return "#facc15";
  return "#10b981";
}

export function ConnectionGraph({
  alerts,
  onPickPair,
  topN = 8,
}: {
  alerts: ClientAlert[];
  onPickPair?: (buyer: string, seller: string) => void;
  topN?: number;
}) {
  const [hover, setHover] = useState<string | null>(null);

  const { buyers, sellers, edges } = useMemo(() => {
    const m = new Map<string, Edge>();
    const buyerScore = new Map<string, number>();
    const sellerScore = new Map<string, number>();
    for (const a of alerts) {
      const seller = a.tender.sellerName;
      if (!seller) continue;
      const key = `${a.tender.buyerName}__${seller}`;
      const e = m.get(key) ?? {
        buyer: a.tender.buyerName,
        seller,
        weight: 0,
        maxSeverity: 0,
      };
      e.weight += 1;
      if (a.severity > e.maxSeverity) e.maxSeverity = a.severity;
      m.set(key, e);
      buyerScore.set(a.tender.buyerName, (buyerScore.get(a.tender.buyerName) ?? 0) + a.severity);
      sellerScore.set(seller, (sellerScore.get(seller) ?? 0) + a.severity);
    }
    const top = Array.from(m.values()).sort((a, b) => b.weight - a.weight).slice(0, 30);
    const buyersSet = new Set(top.map((e) => e.buyer));
    const sellersSet = new Set(top.map((e) => e.seller));
    const buyers = Array.from(buyersSet)
      .sort((a, b) => (buyerScore.get(b) ?? 0) - (buyerScore.get(a) ?? 0))
      .slice(0, topN);
    const sellers = Array.from(sellersSet)
      .sort((a, b) => (sellerScore.get(b) ?? 0) - (sellerScore.get(a) ?? 0))
      .slice(0, topN);
    const buyersFinal = new Set(buyers);
    const sellersFinal = new Set(sellers);
    const edges = top.filter((e) => buyersFinal.has(e.buyer) && sellersFinal.has(e.seller));
    return { buyers, sellers, edges };
  }, [alerts, topN]);

  const nodeY = (i: number, count: number) =>
    PAD + ((H - PAD * 2) / Math.max(1, count - 1 || 1)) * i;
  const buyerX = PAD + NODE_W / 2;
  const sellerX = W - PAD - NODE_W / 2;

  if (edges.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-zinc-800 text-sm text-zinc-600">
        Недостаточно данных для построения графа
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[520px] w-full">
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const bIdx = buyers.indexOf(e.buyer);
          const sIdx = sellers.indexOf(e.seller);
          if (bIdx < 0 || sIdx < 0) return null;
          const y1 = nodeY(bIdx, buyers.length);
          const y2 = nodeY(sIdx, sellers.length);
          const isHover =
            hover === `b:${e.buyer}` ||
            hover === `s:${e.seller}` ||
            hover === `e:${e.buyer}__${e.seller}`;
          const dim =
            hover && !isHover ? 0.08 : 0.55 + Math.min(0.4, (e.weight - 1) * 0.08);
          const stroke = edgeColor(e.maxSeverity);
          const cx1 = buyerX + 100 + (e.weight * 8);
          const cx2 = sellerX - 100 - (e.weight * 8);
          const path = `M ${buyerX + NODE_W / 2} ${y1} C ${cx1} ${y1} ${cx2} ${y2} ${sellerX - NODE_W / 2} ${y2}`;
          return (
            <path
              key={`${e.buyer}__${e.seller}`}
              d={path}
              fill="none"
              stroke={stroke}
              strokeWidth={1.5 + Math.min(5, e.weight)}
              strokeOpacity={dim}
              onMouseEnter={() => setHover(`e:${e.buyer}__${e.seller}`)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onPickPair?.(e.buyer, e.seller)}
              style={{ cursor: "pointer", transition: "stroke-opacity 0.2s" }}
            />
          );
        })}

        {/* Buyer nodes (left) */}
        {buyers.map((b, i) => {
          const y = nodeY(i, buyers.length);
          const isHover = hover === `b:${b}`;
          return (
            <g
              key={b}
              transform={`translate(${PAD}, ${y - 16})`}
              onMouseEnter={() => setHover(`b:${b}`)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                width={NODE_W}
                height={32}
                rx={8}
                fill={isHover ? "#0c1f17" : "#0a0a0a"}
                stroke={isHover ? "#10b981" : "#27272a"}
                strokeWidth={isHover ? 2 : 1}
              />
              <circle cx={14} cy={16} r={5} fill="#10b981" />
              <text
                x={28}
                y={20}
                fill="#fafafa"
                fontSize="11"
                fontFamily="ui-sans-serif, system-ui"
              >
                {truncate(b, 28)}
              </text>
            </g>
          );
        })}

        {/* Seller nodes (right) */}
        {sellers.map((s, i) => {
          const y = nodeY(i, sellers.length);
          const isHover = hover === `s:${s}`;
          return (
            <g
              key={s}
              transform={`translate(${W - PAD - NODE_W}, ${y - 16})`}
              onMouseEnter={() => setHover(`s:${s}`)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                width={NODE_W}
                height={32}
                rx={8}
                fill={isHover ? "#1a1130" : "#0a0a0a"}
                stroke={isHover ? "#6366f1" : "#27272a"}
                strokeWidth={isHover ? 2 : 1}
              />
              <text
                x={NODE_W - 28}
                y={20}
                fill="#fafafa"
                fontSize="11"
                fontFamily="ui-sans-serif, system-ui"
                textAnchor="end"
              >
                {truncate(s, 28)}
              </text>
              <circle cx={NODE_W - 14} cy={16} r={5} fill="#6366f1" />
            </g>
          );
        })}

        {/* Column labels */}
        <text x={PAD + NODE_W / 2} y={20} fill="#71717a" fontSize="10" textAnchor="middle">
          ЗАКАЗЧИКИ
        </text>
        <text x={W - PAD - NODE_W / 2} y={20} fill="#71717a" fontSize="10" textAnchor="middle">
          ПОСТАВЩИКИ
        </text>
      </svg>
    </div>
  );
}
